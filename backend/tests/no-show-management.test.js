// #017 — No-Show logic regression tests: NO LIVE DB, API, or payment writes.
// Run from backend/: node --test tests/no-show-management.test.js
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
function stub(relativePath, exportsObject) {
  const filename = require.resolve(relativePath);
  const instance = new Module(filename);
  instance.filename = filename;
  instance.loaded = true;
  instance.exports = exportsObject;
  require.cache[filename] = instance;
}

const nowKey = "2026-11-16 12:00:00";
const records = [];
let booking, windowRow, updateCount, migrationMissing, touched, audit;
const fakeConnection = {
  async beginTransaction() { touched.begin++; },
  async query(sql, params) {
    records.push({ sql, params });
    if (/FROM reservations WHERE id = \? LIMIT 1 FOR UPDATE/i.test(sql)) return [[booking]];
    if (/FROM reservation_items WHERE reservation_id = \?/i.test(sql)) return [[windowRow]];
    if (/^UPDATE reservations SET reservation_status = 'no_show'/i.test(sql)) {
      touched.updates++; return [{ affectedRows: updateCount }];
    }
    if (/INSERT INTO reservation_no_show_audit/i.test(sql)) {
      if (migrationMissing) {
        const error = new Error("Missing No-Show audit table");
        error.code = "ER_NO_SUCH_TABLE";
        throw error;
      }
      touched.audits++;
      audit = params;
      return [{ insertId: 1 }];
    }
    throw new Error("Unexpected database statement: " + sql);
  },
  async commit() { touched.commits++; },
  async rollback() { touched.rollbacks++; },
  release() { touched.releases++; },
};
stub("../config/db", {
  promise() { return { async getConnection() { return fakeConnection; } }; },
});
stub("../utils/checkInWindow", { getManilaDateTimeKey: () => nowKey });
const { markReservationNoShow } = require("../controllers/admin/adminNoShowController");
const makeResponse = () => ({
  code: 200,
  body: null,
  status(code) { this.code = code; return this; },
  json(data) { this.body = data; return this; },
});
function reset() {
  records.length = 0;
  booking = {
    id: 17, reservation_code: "NOV-15-001", reservation_status: "approved",
    is_checked_in: 0, checked_in_at: null,
    paid_amount: 900, payment_status: "paid",
  };
  windowRow = {
    item_count: 2, invalid_items: 0,
    latest_checkout: "2026-11-16 05:00:00",
  };
  updateCount = 1; migrationMissing = false;
  audit = null;
  touched = { begin: 0, updates: 0, audits: 0, commits: 0, rollbacks: 0, releases: 0 };
}
async function invoke(adminId = 7) {
  const res = makeResponse();
  await markReservationNoShow({ params: { id: 17 }, adminUser: { id: adminId } }, res);
  return res;
}

test("No-Show records status and audit, never changes payment fields", async () => {
  reset();
  const result = await invoke();
  assert.equal(result.code, 200);
  assert.equal(result.body.status, "no_show");
  assert.equal(touched.updates, 1);
  assert.equal(touched.audits, 1);
  assert.equal(touched.commits, 1);
  assert.equal(touched.rollbacks, 0);
  assert.deepEqual(audit, [17, 7, "approved", "2026-11-16 05:00:00"]);
  const updateSql = records.find(v => /^UPDATE reservations SET reservation_status/i.test(v.sql)).sql;
  assert.doesNotMatch(updateSql, /payment_status|paid_amount|remaining_balance|refund/i);
});

for (const [scenario, edits] of [
  ["unfinished stay", { latest_checkout: "2026-11-16 19:00:00" }],
  ["never checked in condition", { is_checked_in: 1 }],
  ["previous check-in timestamp", { checked_in_at: "2026-11-15 19:00:00" }],
  ["completed booking", { reservation_status: "completed" }],
  ["already marked No-Show", { reservation_status: "no_show" }],
  ["missing schedule", { item_count: 0 }],
  ["incomplete schedule", { invalid_items: 1 }],
]) {
  test("No-Show rejects " + scenario, async () => {
    reset();
    for (const [key, value] of Object.entries(edits)) {
      if (key in booking) booking[key] = value;
      else windowRow[key] = value;
    }
    const result = await invoke();
    assert.equal(result.code, 409);
    assert.equal(touched.commits, 0);
    assert.equal(touched.audits, 0);
    assert.equal(touched.updates, 0);
  });
}

test("No-Show rejects a concurrent status change", async () => {
  reset(); updateCount = 0;
  const result = await invoke();
  assert.equal(result.code, 409);
  assert.equal(touched.commits, 0);
  assert.equal(touched.audits, 0);
});
test("No-Show requires audit migration; status update is rolled back", async () => {
  reset(); migrationMissing = true;
  const result = await invoke();
  assert.equal(result.code, 503);
  assert.equal(touched.commits, 0);
  assert.equal(touched.rollbacks, 1);
});
test("No-Show requires verified Admin identity", async () => {
  reset();
  const result = await invoke(0);
  assert.equal(result.code, 403);
  assert.equal(touched.begin, 0);
});
test("No-Show endpoint is protected by signed Admin middleware", () => {
  const source = fs.readFileSync(path.join(__dirname, "../routes/adminBookingRoutes.js"), "utf8");
  assert.match(source, /"\/:id\/no-show",\s*requireAdminAuth,\s*markReservationNoShow/);
});
test("No-Show remains a distinct terminal outcome across records and availability", () => {
  const bookingSrc = fs.readFileSync(path.join(__dirname, "../controllers/shared/bookingController.js"), "utf8");
  assert.match(bookingSrc, /NOT IN \('cancelled', 'rejected', 'completed', 'no_show'\)/);
  const adminSrc = fs.readFileSync(path.join(__dirname, "../controllers/admin/adminBookingController.js"), "utf8");
  assert.match(adminSrc, /"no_show"\].includes\(currentStatus\)/);
  const clientSrc = fs.readFileSync(path.join(__dirname, "../../frontend/adminJS/admin.js"), "utf8");
  assert.match(clientSrc, /function renderNoShowButton/);
  assert.match(clientSrc, /getManilaNoShowDateTimeKey/);
});
