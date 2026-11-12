// Stage 95-I: no-DB tests for check-in schedules (no booking modifications).
// From backend/: node --test tests/frontdesk-checkin-window.test.js
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { getManilaDateTimeKey, checkCheckInWindow } =
  require("../utils/checkInWindow");

test("Converts UTC server clock into Manila calendar date and time", () => {
  assert.equal(getManilaDateTimeKey(new Date("2026-11-12T10:55:00.000Z")), "2026-11-12 18:55:00");
  assert.equal(getManilaDateTimeKey(new Date("2026-11-11T23:00:00.000Z")), "2026-11-12 07:00:00");
});

test("Blocks a day-tour check-in after its 5 PM checkout", () => {
  assert.equal(checkCheckInWindow("2026-11-12 07:00:00", "2026-11-12 17:00:00", "2026-11-12 18:55:00"), "expired");
});

test("Enforces start/end boundaries and permits valid daytime arrival", () => {
  const start = "2026-11-12 07:00:00", end = "2026-11-12 17:00:00";
  assert.equal(checkCheckInWindow(start, end, "2026-11-12 06:59:59"), "not_started");
  assert.equal(checkCheckInWindow(start, end, "2026-11-12 07:00:00"), "open");
  assert.equal(checkCheckInWindow(start, end, "2026-11-12 14:30:00"), "open");
  assert.equal(checkCheckInWindow(start, end, "2026-11-12 16:59:59"), "open");
  assert.equal(checkCheckInWindow(start, end, "2026-11-12 17:00:00"), "expired");
});

test("Supports overnight checkout the following morning", () => {
  assert.equal(checkCheckInWindow("2026-11-12 19:00:00", "2026-11-13 05:00:00", "2026-11-12 21:00:00"), "open");
  assert.equal(checkCheckInWindow("2026-11-12 19:00:00", "2026-11-13 05:00:00", "2026-11-13 05:00:00"), "expired");
});

test("Rejects missing or inverted schedule fields", () => {
  assert.equal(checkCheckInWindow("", "2026-11-12 17:00:00", "2026-11-12 10:00:00"), "invalid");
  assert.equal(checkCheckInWindow("2026-11-12 17:00:00", "2026-11-12 07:00:00", "2026-11-12 10:00:00"), "invalid");
  assert.equal(checkCheckInWindow("2026-11-12 07:00:00", "2026-11-12 17:00:00", "broken"), "invalid");
});

test("Backend checks time window before writing check-in state", () => {
  const controller = fs.readFileSync(
    path.join(__dirname, "..", "controllers", "frontdesk", "frontdeskCheckInController.js"), "utf8"
  );
  assert.match(controller, /checkCheckInWindow\(/);
  assert.match(controller, /MAX\(TIMESTAMP\(check_out_date, check_out_time\)\)/);
  assert.ok(controller.indexOf("checkCheckInWindow(") < controller.indexOf("UPDATE reservations"));
});

test("Front Desk UI has expired-window guard independent of button", () => {
  const ui = fs.readFileSync(
    path.join(__dirname, "..", "..", "frontend", "frontdeskJS", "frontdeskGuests.js"), "utf8"
  );
  assert.match(ui, /getCheckInScheduleWindow\(booking\)/);
  assert.match(ui, /checkInWindowStatus\(booking\)/);
  assert.match(ui, /Check-in Window Closed/);
});
