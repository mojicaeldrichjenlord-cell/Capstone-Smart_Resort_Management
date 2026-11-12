// Isolated stay-operations regression tests. Run from backend:
// node --test tests/frontdesk-stay-operations.test.js
// The DB, payment network, and transaction state are mocked in memory.
// No .env loading, server.js import, Aiven connection, or PayPal capture.
const assert = require("node:assert/strict");
const { test, beforeEach } = require("node:test");
const Module = require("node:module");

const DATE = "2099-03-01";
let state;
let stats;
let draft;

function replaceModule(relativePath, exportsValue) {
  const filename = require.resolve(relativePath);
  const entry = new Module(filename);
  entry.filename = filename;
  entry.loaded = true;
  entry.exports = exportsValue;
  require.cache[filename] = entry;
}

function normalize(sql) {
  return sql.replace(/\s+/g, " ").trim();
}
function clone(value) {
  return structuredClone(value);
}
function findConflict(params) {
  const [accommodationId, endDate, endTime, startDate, startTime] = params;
  const wantedStart = startDate + "T" + startTime;
  const wantedEnd = endDate + "T" + endTime;
  return draft.items.find((item) =>
    Number(item.accommodation_id) === Number(accommodationId) &&
    item.check_in_date + "T" + item.check_in_time < wantedEnd &&
    wantedStart < item.check_out_date + "T" + item.check_out_time
  );
}

const fakeDb = {
  promise() {
    return {
      async query(statement, params) {
        const sql = normalize(statement);
        if (/FROM accommodations a\b/i.test(sql)) {
          return [state.accommodations.filter((a) => params.includes(a.id)).map(clone)];
        }
        throw new Error("Unexpected nontransactional SQL: " + sql);
      },
      async getConnection() {
        return {
          async beginTransaction() {
            stats.begins++;
            draft = clone(state);
          },
          async query(statement, params) {
            const sql = normalize(statement);
            stats.sql.push(sql);
            if (/^SELECT id FROM accommodations WHERE id = \? FOR UPDATE$/i.test(sql)) {
              const id = Number(params[0]);
              stats.locks.push(id);
              return [draft.accommodations.some((a) => a.id === id) ? [{ id }] : []];
            }
            if (/^SELECT\b/i.test(sql) && /FROM reservations\b/i.test(sql)) {
              return [Number(params[0]) === draft.reservation.id ? [clone(draft.reservation)] : []];
            }
            if (/^SELECT\b/i.test(sql) && /FROM reservation_items ri\b/i.test(sql)
                && /WHERE r\.id = \? AND ri\.id = \?/i.test(sql)) {
              const item = draft.items.find((row) =>
                Number(row.id) === Number(params[1]) &&
                Number(row.reservation_id) === Number(params[0]));
              const accommodation = item &&
                draft.accommodations.find((a) => a.id === item.accommodation_id);
              return [item && accommodation ? [{
                ...clone(draft.reservation), ...clone(item),
                reservation_id: draft.reservation.id,
                reservation_item_id: item.id,
                accommodation_name: accommodation.name,
                accommodation_status: accommodation.status,
                ...clone(accommodation)
              }] : []];
            }
            if (/^SELECT\b/i.test(sql) && /FROM reservation_items ri\b/i.test(sql)
                && /WHERE ri\.accommodation_id = \?/i.test(sql)) {
              assert.equal(params.length, 5,
                "Conflict checks must include items of the same reservation");
              assert.match(sql, /FOR UPDATE$/i, "Mutation conflict check must use current locking read");
              const match = findConflict(params);
              return [match ? [{ id: 17, accommodation_name: "Test accommodation" }] : []];
            }
            if (/^INSERT INTO reservation_items\b/i.test(sql)) {
              const names = ["reservation_id", "accommodation_id", "slot_type",
                "slot_label", "stay_duration", "check_in_date", "check_in_time",
                "check_out_date", "check_out_time", "item_price"];
              const row = { id: 100 + draft.items.length };
              names.forEach((key, i) => { row[key] = params[i]; });
              draft.items.push(row);
              stats.writes++;
              return [{ insertId: row.id, affectedRows: 1 }];
            }
            if (/^UPDATE reservation_items SET\b/i.test(sql)) {
              const row = draft.items.find((i) =>
                i.id === Number(params[4]) && i.reservation_id === Number(params[5]));
              if (!row) throw new Error("Item not found for mock update");
              Object.assign(row, {
                stay_duration: params[0], check_out_date: params[1],
                check_out_time: params[2], item_price: params[3]
              });
              stats.writes++;
              return [{ affectedRows: 1 }];
            }
            if (/^UPDATE reservations SET\b/i.test(sql)) {
              if (state.failReservationUpdate) {
                throw new Error("Simulated reservation update failure");
              }
              assert.equal(Number(params[5]), draft.reservation.id);
              Object.assign(draft.reservation, {
                accommodation_total: params[0],
                paid_amount: params[1],
                remaining_balance: params[2],
                payment_status: params[3],
                note: params[4]
              });
              stats.writes++;
              return [{ affectedRows: 1 }];
            }
            throw new Error("Unexpected transactional SQL: " + sql);
          },
          async commit() {
            stats.commits++;
            state = draft;
            draft = null;
          },
          async rollback() {
            stats.rollbacks++;
            draft = null;
          },
          release() {
            stats.releases++;
          }
        };
      }
    };
  }
};

replaceModule("../config/db", fakeDb);
const noPayPal = () => { throw new Error("PayPal must never be called"); };
replaceModule("../services/paypalService", {
  createPayPalOrder: noPayPal, capturePayPalOrder: noPayPal, getPayPalOrder: noPayPal
});
const handlers = require("../controllers/shared/bookingController");

beforeEach(() => {
  stats = { begins: 0, commits: 0, rollbacks: 0, releases: 0, writes: 0, sql: [], locks: [] };
  draft = null;
  state = {
    failReservationUpdate: false,
    reservation: {
      id: 17, reservation_code: "TEST-017", reservation_status: "approved",
      payment_status: "partially_paid", is_checked_in: 1,
      accommodation_total: 1000, required_downpayment: 500,
      paid_amount: 500, remaining_balance: 500, note: "Original booking"
    },
    accommodations: [
      {
        id: 7, name: "Test Room B", category_name: "Room", status: "available",
        day_price: 300, overnight_price: 350, extended_price: 600
      },
      {
        id: 8, name: "Test Room A", category_name: "Room", status: "available",
        day_price: 300, overnight_price: 350, extended_price: 600
      }
    ],
    items: [{
      id: 91, reservation_id: 17, accommodation_id: 8,
      slot_type: "day_tour", slot_label: "Day Tour", stay_duration: 1,
      check_in_date: DATE, check_in_time: "07:00:00",
      check_out_date: DATE, check_out_time: "17:00:00", item_price: 1000
    }]
  };
});

async function invoke(method, body, id = 17) {
  const result = { status: 200, body: null };
  const res = {
    status(code) { result.status = code; return this; },
    json(data) { result.body = data; return this; }
  };
  const oldError = console.error;
  console.error = () => {}; // expected rejected probes should not fill the test terminal
  try {
    await method({ params: { id: String(id) }, body }, res);
  } finally {
    console.error = oldError;
  }
  return result;
}
function add(body = {}) {
  return invoke(handlers.addAccommodationToReservation, {
    accommodation_id: 7, slot_type: "day_tour",
    check_in_date: DATE, stay_duration: 1, ...body
  });
}
function extend(body = {}) {
  return invoke(handlers.extendReservationItem, {
    reservation_item_id: 91, extension_type: "full_day",
    extension_duration: 1, ...body
  });
}
function assertNoPersistedChange(before, previous = { commits: 0, rollbacks: 0, releases: 0 }) {
  assert.deepEqual(state, before);
  // Only the rejected attempt must roll back. An earlier successful setup
  // request in the same test may already have committed.
  assert.equal(stats.commits, previous.commits);
  assert.equal(stats.rollbacks, previous.rollbacks + 1);
  assert.equal(stats.releases, previous.releases + 1);
}

test("Add Accommodation: commits new item and unpaid accommodation balance", async () => {
  const result = await add();
  assert.equal(result.status, 201);
  assert.equal(result.body.item_price, 300);
  assert.equal(result.body.payment_collected, false);
  assert.equal(state.items.length, 2);
  assert.equal(state.reservation.accommodation_total, 1300);
  assert.equal(state.reservation.paid_amount, 500);
  assert.equal(state.reservation.remaining_balance, 800);
  assert.equal(state.reservation.required_downpayment, 500);
  assert.equal(state.reservation.payment_status, "partially_paid");
  assert.deepEqual([stats.commits, stats.rollbacks, stats.releases], [1, 0, 1]);
});
test("Add Accommodation: locks its accommodation before the overlap check", async () => {
  assert.equal((await add()).status, 201);
  assert.deepEqual(stats.locks, [7]);
  const lockIndex = stats.sql.findIndex((sql) =>
    /^SELECT id FROM accommodations WHERE id = \? FOR UPDATE$/i.test(sql));
  const conflictIndex = stats.sql.findIndex((sql) => /FROM reservation_items ri\b/i.test(sql));
  assert.ok(lockIndex >= 0 && conflictIndex > lockIndex);
});
test("Add Accommodation: duplicate same-room schedule rolls back", async () => {
  assert.equal((await add()).status, 201);
  const before = clone(state);
  const previous = {
    commits: stats.commits,
    rollbacks: stats.rollbacks,
    releases: stats.releases
  };
  const result = await add();
  assert.equal(result.status, 409);
  assertNoPersistedChange(before, previous);
});
test("Add Accommodation: overlapping item within same reservation is rejected", async () => {
  state.items.push({
    id: 92, reservation_id: 17, accommodation_id: 7, slot_type: "day_tour",
    check_in_date: DATE, check_in_time: "07:00:00",
    check_out_date: DATE, check_out_time: "17:00:00"
  });
  const before = clone(state);
  assert.equal((await add()).status, 409);
  assertNoPersistedChange(before);
});
test("Add Accommodation: unchecked-in reservation is rejected", async () => {
  state.reservation.is_checked_in = 0;
  const before = clone(state);
  assert.equal((await add()).status, 400);
  assertNoPersistedChange(before);
});
test("Add Accommodation: terminal reservation is rejected", async () => {
  state.reservation.reservation_status = "completed";
  const before = clone(state);
  assert.equal((await add()).status, 400);
  assertNoPersistedChange(before);
});
test("Add Accommodation: unavailable accommodation is rejected", async () => {
  state.accommodations[0].status = "maintenance";
  const before = clone(state);
  assert.equal((await add()).status, 400);
  assertNoPersistedChange(before);
});
test("Add Accommodation: reservation UPDATE failure rolls back item insert", async () => {
  state.failReservationUpdate = true;
  const before = clone(state);
  assert.equal((await add()).status, 500);
  assertNoPersistedChange(before);
});
test("Extend Stay: commits new checkout, price and unpaid balance", async () => {
  const result = await extend();
  assert.equal(result.status, 200);
  assert.equal(result.body.extension_fee, 300);
  assert.equal(result.body.payment_collected, false);
  assert.equal(state.items[0].check_out_date, "2099-03-02");
  assert.equal(state.items[0].check_out_time, "17:00:00");
  assert.equal(state.items[0].stay_duration, 2);
  assert.equal(state.items[0].item_price, 1300);
  assert.equal(state.reservation.accommodation_total, 1300);
  assert.equal(state.reservation.paid_amount, 500);
  assert.equal(state.reservation.remaining_balance, 800);
  assert.equal(state.reservation.required_downpayment, 500);
  assert.deepEqual([stats.commits, stats.rollbacks, stats.releases], [1, 0, 1]);
});
test("Extend Stay: locks its accommodation before the overlap check", async () => {
  assert.equal((await extend()).status, 200);
  assert.deepEqual(stats.locks, [8]);
  const lockIndex = stats.sql.findIndex((sql) =>
    /^SELECT id FROM accommodations WHERE id = \? FOR UPDATE$/i.test(sql));
  const conflictIndex = stats.sql.findIndex((sql) => /FROM reservation_items ri\b/i.test(sql)
    && /WHERE ri\.accommodation_id = \?/i.test(sql));
  assert.ok(lockIndex >= 0 && conflictIndex > lockIndex);
});
test("Extend Stay: overlapping later reservation prevents changes", async () => {
  state.items.push({
    id: 92, reservation_id: 88, accommodation_id: 8,
    check_in_date: "2099-03-02", check_in_time: "09:00:00",
    check_out_date: "2099-03-02", check_out_time: "19:00:00"
  });
  const before = clone(state);
  assert.equal((await extend()).status, 409);
  assertNoPersistedChange(before);
});
test("Extend Stay: payment not verified is rejected", async () => {
  state.reservation.payment_status = "unpaid";
  const before = clone(state);
  assert.equal((await extend()).status, 400);
  assertNoPersistedChange(before);
});
test("Extend Stay: unchecked-in guest is rejected", async () => {
  state.reservation.is_checked_in = 0;
  const before = clone(state);
  assert.equal((await extend()).status, 400);
  assertNoPersistedChange(before);
});
test("Extend Stay: missing item is rejected", async () => {
  const before = clone(state);
  assert.equal((await extend({ reservation_item_id: 999 })).status, 404);
  assertNoPersistedChange(before);
});
test("Extend Stay: day_half cannot charge for a zero-length 17:00 to 17:00 window", async () => {
  const before = clone(state);
  const result = await extend({ extension_type: "day_half" });
  assert.equal(result.status, 400);
  assert.match(result.body.message, /must end after/i);
  assertNoPersistedChange(before);
});
test("Extend Stay: day_half cannot make checkout earlier", async () => {
  state.items[0].check_out_time = "18:00:00";
  const before = clone(state);
  assert.equal((await extend({ extension_type: "day_half" })).status, 400);
  assertNoPersistedChange(before);
});
test("Extend Stay: valid day_half from 05:00 to 17:00 is allowed", async () => {
  state.items[0].slot_type = "night";
  state.items[0].slot_label = "Night";
  state.items[0].check_in_date = "2099-02-28";
  state.items[0].check_in_time = "19:00:00";
  state.items[0].check_out_time = "05:00:00";
  const result = await extend({ extension_type: "day_half" });
  assert.equal(result.status, 200);
  assert.equal(result.body.extension_fee, 300);
  assert.equal(result.body.new_check_out_time, "17:00:00");
  assert.equal(state.reservation.remaining_balance, 800);
});
test("Extend Stay: reservation UPDATE failure rolls back item extension", async () => {
  state.failReservationUpdate = true;
  const before = clone(state);
  assert.equal((await extend()).status, 500);
  assertNoPersistedChange(before);
});
