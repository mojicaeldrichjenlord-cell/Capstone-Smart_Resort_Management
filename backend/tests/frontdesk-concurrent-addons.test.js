// Concurrent Front Desk add-on requests with an in-memory transaction/row-lock model.
// Run from backend: node --test tests/frontdesk-concurrent-addons.test.js
// This models lock scheduling; it is NOT a real MySQL concurrency test.
// No .env, server.js, Aiven connection, payment capture, or financial records.
const assert = require("node:assert/strict");
const { test, beforeEach } = require("node:test");
const Module = require("node:module");

const DATE = "2099-03-01";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sqlText = (sql) => sql.replace(/\s+/g, " ").trim();

let reservations;
let items;
let accommodations;
let nextItemId;
let locks;
let stats;

function replaceModule(relativePath, value) {
  const filename = require.resolve(relativePath);
  const entry = new Module(filename);
  entry.filename = filename;
  entry.loaded = true;
  entry.exports = value;
  require.cache[filename] = entry;
}

// A queued mutex per accommodation ID simulates SELECT ... FOR UPDATE locks.
// A second connection cannot proceed to its overlap check until the first
// transaction releases its lock by committing or rolling back.
async function acquireAccommodation(id) {
  const previous = locks.get(id);
  let unlock;
  const current = new Promise((resolve) => { unlock = resolve; });
  locks.set(id, current);
  if (previous) {
    stats.waits += 1;
    await previous;
  }
  stats.acquired.push(id);
  return () => {
    if (locks.get(id) === current) locks.delete(id);
    unlock();
  };
}

const fakeDb = {
  promise() {
    return {
      async query(query, params) {
        const sql = sqlText(query);
        if (/FROM accommodations a\b/i.test(sql)) {
          return [accommodations
            .filter((a) => params.some((id) => Number(id) === a.id))
            .map((a) => ({ ...a }))];
        }
        throw new Error("Unexpected nontransactional SQL: " + sql);
      },
      async getConnection() {
        let pendingItem = null;
        let pendingReservation = null;
        let releaseAccommodation = null;
        let active = false;
        return {
          async beginTransaction() {
            assert.equal(active, false);
            active = true;
            stats.started += 1;
          },
          async query(query, params) {
            assert.equal(active, true);
            const sql = sqlText(query);
            if (/^SELECT\b/i.test(sql) && /FROM reservations\b/i.test(sql)
                && /FOR UPDATE$/i.test(sql)) {
              const row = reservations.get(Number(params[0]));
              return [row ? [{ ...row }] : []];
            }
            if (/^SELECT id FROM accommodations WHERE id = \? FOR UPDATE$/i.test(sql)) {
              assert.equal(releaseAccommodation, null, "Expected one accommodation lock per request");
              const id = Number(params[0]);
              releaseAccommodation = await acquireAccommodation(id);
              return [accommodations.some((a) => a.id === id) ? [{ id }] : []];
            }
            if (/^SELECT\b/i.test(sql) && /FROM reservation_items ri\b/i.test(sql)
                && /WHERE ri.accommodation_id = \?/i.test(sql)) {
              assert.match(sql, /FOR UPDATE$/i,
                "The write-path conflict read must be current and locking");
              // Give the other request time to race. Without the shared
              // accommodation lock, both would see an empty committed state.
              await sleep(15);
              const [id, endDate, endTime, startDate, startTime] = params;
              const wantedStart = startDate + "T" + startTime;
              const wantedEnd = endDate + "T" + endTime;
              const conflict = items.find((item) =>
                item.accommodation_id === Number(id) &&
                item.check_in_date + "T" + item.check_in_time < wantedEnd &&
                wantedStart < item.check_out_date + "T" + item.check_out_time);
              return [conflict ? [{
                id: conflict.reservation_id,
                accommodation_name: "Test Room"
              }] : []];
            }
            if (/^INSERT INTO reservation_items\b/i.test(sql)) {
              assert.equal(pendingItem, null);
              const names = ["reservation_id", "accommodation_id", "slot_type",
                "slot_label", "stay_duration", "check_in_date", "check_in_time",
                "check_out_date", "check_out_time", "item_price"];
              pendingItem = { id: nextItemId++ };
              names.forEach((name, index) => { pendingItem[name] = params[index]; });
              return [{ insertId: pendingItem.id, affectedRows: 1 }];
            }
            if (/^UPDATE reservations SET\b/i.test(sql)) {
              assert.equal(pendingReservation, null);
              const id = Number(params[5]);
              assert.ok(reservations.has(id));
              pendingReservation = {
                id,
                accommodation_total: params[0],
                paid_amount: params[1],
                remaining_balance: params[2],
                payment_status: params[3],
                note: params[4]
              };
              return [{ affectedRows: 1 }];
            }
            throw new Error("Unexpected transactional SQL: " + sql);
          },
          async commit() {
            assert.equal(active, true);
            if (pendingItem) items.push(pendingItem);
            if (pendingReservation) {
              Object.assign(reservations.get(pendingReservation.id), pendingReservation);
            }
            stats.committed += 1;
            active = false;
            if (releaseAccommodation) releaseAccommodation();
          },
          async rollback() {
            assert.equal(active, true);
            stats.rolledBack += 1;
            active = false;
            if (releaseAccommodation) releaseAccommodation();
          },
          release() {
            stats.released += 1;
          }
        };
      }
    };
  }
};

replaceModule("../config/db", fakeDb);
const noPayPal = () => { throw new Error("PayPal must not be called"); };
replaceModule("../services/paypalService", {
  createPayPalOrder: noPayPal, capturePayPalOrder: noPayPal, getPayPalOrder: noPayPal
});
const { addAccommodationToReservation } =
  require("../controllers/shared/bookingController");

beforeEach(() => {
  reservations = new Map([17, 18].map((id) => [id, {
    id, reservation_code: "TEST-" + id, reservation_status: "approved",
    payment_status: "partially_paid", is_checked_in: 1,
    accommodation_total: 1000, required_downpayment: 500,
    paid_amount: 500, remaining_balance: 500, note: "Before addon"
  }]));
  items = [];
  nextItemId = 200;
  locks = new Map();
  stats = { started: 0, acquired: [], waits: 0,
    committed: 0, rolledBack: 0, released: 0 };
  accommodations = [7, 8].map((id) => ({
    id, category_id: 1, category_name: "Room", name: "Test Room " + id,
    status: "available", day_price: 300, overnight_price: 350,
    extended_price: 600
  }));
});

async function invokeAdd(reservationId, accommodationId, slotType = "day_tour") {
  const result = { status: 200, body: null };
  const res = {
    status(value) { result.status = value; return this; },
    json(body) { result.body = body; return this; }
  };
  await addAccommodationToReservation({
    params: { id: String(reservationId) },
    body: {
      accommodation_id: accommodationId,
      slot_type: slotType,
      stay_duration: 1,
      check_in_date: DATE
    }
  }, res);
  return result;
}

async function withoutExpectedErrorLogs(fn) {
  const original = console.error;
  console.error = () => {};
  try { return await fn(); } finally { console.error = original; }
}

test("Simultaneous same-room add-ons: only one commits and the other conflicts", async () => {
  const outcomes = await withoutExpectedErrorLogs(() =>
    Promise.all([invokeAdd(17, 7), invokeAdd(18, 7)]));
  assert.deepEqual(outcomes.map((o) => o.status).sort((a, b) => a - b), [201, 409]);
  assert.equal(items.length, 1);
  assert.equal(stats.started, 2);
  assert.equal(stats.committed, 1);
  assert.equal(stats.rolledBack, 1);
  assert.equal(stats.released, 2);
  assert.ok(stats.waits >= 1, "The second request must wait for the row lock");
  const paid = Array.from(reservations.values());
  const changed = paid.filter((r) => r.accommodation_total === 1300);
  const unchanged = paid.filter((r) => r.accommodation_total === 1000);
  assert.equal(changed.length, 1);
  assert.equal(unchanged.length, 1);
  assert.equal(changed[0].paid_amount, 500);
  assert.equal(changed[0].remaining_balance, 800);
  assert.equal(unchanged[0].remaining_balance, 500);
});

test("Simultaneous different-room add-ons: both can commit", async () => {
  const outcomes = await Promise.all([invokeAdd(17, 7), invokeAdd(18, 8)]);
  assert.deepEqual(outcomes.map((o) => o.status), [201, 201]);
  assert.equal(stats.committed, 2);
  assert.equal(stats.rolledBack, 0);
  assert.equal(items.length, 2);
  assert.equal(stats.waits, 0);
  assert.equal(reservations.get(17).remaining_balance, 800);
  assert.equal(reservations.get(18).remaining_balance, 800);
});

test("Simultaneous adjacent day/night schedules: both may use the same room", async () => {
  const outcomes = await Promise.all([
    invokeAdd(17, 7, "day_tour"),
    invokeAdd(18, 7, "night")
  ]);
  assert.deepEqual(outcomes.map((o) => o.status), [201, 201]);
  assert.equal(stats.committed, 2);
  assert.equal(items.length, 2);
  assert.ok(stats.waits >= 1);
  assert.equal(items[0].check_out_time, "17:00:00");
  assert.equal(items[1].check_in_time, "19:00:00");
});
