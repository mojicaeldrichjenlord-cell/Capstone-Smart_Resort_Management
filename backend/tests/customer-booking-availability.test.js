// Stage 95-J: offline conflict + customer booking form regression tests.
// Run from backend/: node --test tests/customer-booking-availability.test.js
// No MySQL, Render, PayPal transaction, or Gemini API access needed.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { findOverlappingDraftItems } = require("../utils/reservationOverlap");

function stay(accommodation_id, date1, time1, date2, time2) {
  return { accommodation_id, check_in_date: date1, check_in_time: time1,
    check_out_date: date2, check_out_time: time2 };
}

test("two identical accommodation windows in one draft are blocked", () => {
  const a = stay(7,"2026-11-15","07:00:00","2026-11-15","17:00:00");
  assert.deepEqual(findOverlappingDraftItems([a,a]), { accommodation_id: 7 });
});

test("overlapping day tour and extended stay use exact date AND time", () => {
  const day = stay(7,"2026-11-15","07:00:00","2026-11-15","17:00:00");
  const extended = stay(7,"2026-11-15","08:00:00","2026-11-16","06:00:00");
  assert.equal(findOverlappingDraftItems([day, extended])?.accommodation_id, 7);
});

test("overnight overlap across dates is rejected", () => {
  const overnight = stay(7,"2026-11-15","19:00:00","2026-11-16","05:00:00");
  const longStay = stay(7,"2026-11-15","20:00:00","2026-11-17","06:00:00");
  assert.equal(findOverlappingDraftItems([overnight, longStay])?.accommodation_id, 7);
});

test("different accommodations or nonoverlapping boundary are allowed", () => {
  const a = stay(7,"2026-11-15","07:00:00","2026-11-15","17:00:00");
  const b = stay(8,"2026-11-15","07:00:00","2026-11-15","17:00:00");
  const c = stay(7,"2026-11-15","17:00:00","2026-11-16","05:00:00");
  assert.equal(findOverlappingDraftItems([a,b,c]), null);
});

test("server checks within-draft duplication AND database reservation conflicts", () => {
  const controller = fs.readFileSync(path.join(__dirname,"..","controllers","shared","bookingController.js"),"utf8");
  assert.match(controller, /findOverlappingDraftItems\(reservationItems\)/);
  assert.match(controller, /await checkReservationConflicts\(connection, reservationItems\)/);
  assert.match(controller, /status: 409/);
  assert.match(controller, /TIMESTAMP\(ri\.check_in_date, ri\.check_in_time\) < TIMESTAMP/);
  assert.match(controller, /FOR UPDATE/);
});

test("customer form requests actual backend availability after selection changes", () => {
  const source = fs.readFileSync(path.join(__dirname,"..","..","frontend","customerJS","booking.js"),"utf8");
  assert.match(source, /bookings\/check-item-availability/);
  assert.match(source, /scheduleAllCustomerAvailabilityChecks\(\)/);
  assert.match(source, /AbortController/);
  assert.match(source, /setCustomerCardAvailability\(card, "checking"/);
  assert.match(source, /"unavailable"/);
});

test("Next to Payment stays disabled until a live recheck approves all items", () => {
  const html = fs.readFileSync(path.join(__dirname,"..","..","frontend","customerHTML","booking.html"),"utf8");
  const source = fs.readFileSync(path.join(__dirname,"..","..","frontend","customerJS","booking.js"),"utf8");
  assert.match(html, /id="nextToPaymentBtn" disabled/);
  assert.match(html, /id="bookingAvailabilitySummary"/);
  assert.match(source, /const ready = cards\.length > 0 && statuses\.every/);
  assert.match(source, /schedulesAvailable = await verifyCustomerAvailabilityBeforePayment\(\)/);
  const verificationIndex = source.indexOf("schedulesAvailable = await verifyCustomerAvailabilityBeforePayment()");
  assert.ok(verificationIndex < source.indexOf("window.location.href = \"booking-payment.html\""));
});

test("customer 50% downpayment remains unchanged", () => {
  const source = fs.readFileSync(path.join(__dirname,"..","..","frontend","customerJS","booking.js"),"utf8");
  assert.match(source, /accommodationTotal \* 0\.5/);
});
