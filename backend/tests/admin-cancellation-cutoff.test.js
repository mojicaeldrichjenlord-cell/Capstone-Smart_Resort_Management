// QA — Admin cancellation is allowed only before the earliest check-in.
// No external DB, Aiven, payment or API operations.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");

function stub(relative, exportsObject) {
  const filename = require.resolve(relative);
  const fakeModule = new Module(filename);
  fakeModule.filename = filename;
  fakeModule.loaded = true;
  fakeModule.exports = exportsObject;
  require.cache[filename] = fakeModule;
}

let row, dateWindow, updates;
const fakeDb = {
  promise() {
    return {
      async query(sql, params) {
        if (/FROM reservations WHERE id = \? LIMIT 1/.test(sql)) return [[row]];
        if (/FROM reservation_items WHERE reservation_id = \?/.test(sql)) return [[dateWindow]];
        if (/UPDATE reservations SET reservation_status =/.test(sql)) {
          updates++;
          assert.match(sql, /checked_in_at IS NULL/);
          return [{ affectedRows: 1 }];
        }
        throw new Error("Unexpected query " + sql);
      },
    };
  },
};
stub("../config/db", fakeDb);
stub("../utils/checkInWindow", {
  getManilaDateTimeKey: () => "2026-11-16 19:00:00",
});
const { updateAdminBookingStatus } = require("../controllers/admin/adminBookingController");
function reset() {
  row = { id: 28, reservation_status: "approved", is_checked_in: 0, checked_in_at: null };
  dateWindow = {
    item_count: 1, invalid_items: 0, earliest_checkin: "2026-11-17 07:00:00",
  };
  updates = 0;
}
async function run() {
  const response = {
    code: 200, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await updateAdminBookingStatus(
    { params: { id: 28 }, body: { status: "cancelled" } },
    response,
  );
  return response;
}

test("allows approved future reservation to be cancelled by Admin", async () => {
  reset();
  const result = await run();
  assert.equal(result.code, 200);
  assert.equal(updates, 1);
});
test("rejects cancellation after scheduled check-in time", async () => {
  reset();
  dateWindow.earliest_checkin = "2026-11-13 07:00:00";
  const result = await run();
  assert.equal(result.code, 409);
  assert.equal(updates, 0);
  assert.match(result.body.message, /check-in has started or passed/i);
});
test("rejects cancellation exactly at check-in start", async () => {
  reset();
  dateWindow.earliest_checkin = "2026-11-16 19:00:00";
  const result = await run();
  assert.equal(result.code, 409);
  assert.equal(updates, 0);
});
test("rejects cancellation of a previously checked-in stay", async () => {
  reset();
  row.checked_in_at = "2026-11-15 19:05:00";
  const result = await run();
  assert.equal(result.code, 409);
  assert.equal(updates, 0);
});
test("rejects cancellation when any accommodation item has invalid schedule", async () => {
  reset();
  dateWindow.item_count = 2;
  dateWindow.invalid_items = 1;
  const result = await run();
  assert.equal(result.code, 409);
  assert.equal(updates, 0);
});
test("rejects cancellation for completed or No-Show records", async () => {
  for (const status of ["completed", "no_show", "rejected"]) {
    reset();
    row.reservation_status = status;
    const result = await run();
    assert.equal(result.code, 409);
    assert.equal(updates, 0);
  }
});
test("Admin UI hides cancellation after first check-in and retains No-Show option", () => {
  const ui = fs.readFileSync(path.join(__dirname, "../../frontend/adminJS/admin.js"), "utf8");
  assert.match(ui, /function isEligibleForAdminCancellation/);
  assert.match(ui, /earliest > getManilaNoShowDateTimeKey\(\)/);
  assert.match(ui, /function renderNoShowButton/);
});
test("Booking availability gives different explanations for booked vs ended", () => {
  const controller = fs.readFileSync(
    path.join(__dirname, "../controllers/shared/bookingController.js"), "utf8",
  );
  assert.match(controller, /Time slot already ended/);
  assert.match(controller, /already booked for this date and time slot/);
});
