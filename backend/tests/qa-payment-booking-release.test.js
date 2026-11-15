// QA regression guards for pending #007, #008, #012 release fixes.
// Pure source and validation checks: no Aiven, PayPal, real files or API calls.
// Run from backend/: node --test tests/qa-payment-booking-release.test.js
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (relative) => fs.readFileSync(path.join(__dirname, "..", "..", relative), "utf8");
const backend = (relative) => fs.readFileSync(path.join(__dirname, "..", relative), "utf8");
const { getVerifiedImageMime } = require("../utils/paymentProofAccess");

test("#007 upload failure uses JSON response with a readable message", () => {
  const route = backend("routes/bookingRoutes.js");
  assert.match(route, /function parsePaymentProofUpload\(/);
  assert.match(route, /error\.code === "LIMIT_FILE_SIZE"/);
  assert.match(route, /res\.status\(400\)\.json\(/);
  assert.match(route,
    /requireFrontDeskAuth,\s*parsePaymentProofUpload,\s*validatePaymentProofImage,\s*bindAuthenticatedFrontDeskCreator/);
  assert.equal(getVerifiedImageMime(Buffer.from("not a real image")), null);
});

test("#007 browser rejects invalid or oversized payment proofs before network submission", () => {
  const payment = read("frontend/adminJS/admin-walkin-payment.js");
  assert.match(payment, /function validateManualProofFile\(file\)/);
  assert.match(payment, /file\.size > 8 \* 1024 \* 1024/);
  assert.match(payment, /const invalidProofMessage = validateManualProofFile\(proofImage\)/);
});

test("#008 durable payment proof is saved in the reservation transaction", () => {
  const booking = backend("controllers/shared/bookingController.js");
  const start = booking.indexOf("const reservationId = reservationResult.insertId");
  const insert = booking.indexOf("INSERT INTO reservation_payment_proofs", start);
  const commit = booking.indexOf("await connection.commit()", insert);
  assert.ok(start >= 0 && insert > start && commit > insert);
  assert.match(booking, /paymentProofUpload: uploadedBytes \? \{ buffer: uploadedBytes \} : null/);
  assert.match(booking, /fs\.promises\.unlink\(req\.file\.path\)/);
  const schema = backend("sql/reservation_payment_proofs.sql");
  assert.match(schema, /image_data MEDIUMBLOB NOT NULL/);
  assert.match(schema, /UNIQUE KEY uq_reservation_payment_proof/);
});

test("#008 private payment proof GET keeps role-based authentication", () => {
  const route = backend("routes/bookingRoutes.js");
  const viewer = backend("controllers/shared/paymentProofController.js");
  assert.match(route,
    /"\/:id\/payment-proof-image",\s*requireOperationalBookingRead,\s*getPaymentProofImage/);
  assert.match(viewer, /FROM reservation_payment_proofs WHERE reservation_id = \?/);
  assert.match(viewer, /getVerifiedImageMime\(bytes\)/);
});

test("#012 customer two-day minimum applies in UI and server booking writes", () => {
  const customer = read("frontend/customerJS/booking.js");
  const booking = backend("controllers/shared/bookingController.js");
  assert.match(customer, /const CUSTOMER_MIN_BOOKING_DAYS_AHEAD = 2;/);
  assert.match(booking, /function getEarliestCustomerCheckInDateKey\(/);
  assert.match(booking, /timeZone: "Asia\/Manila"/);
  assert.match(booking, /earliestCustomerCheckIn &&/);
  assert.match(booking, /Customer reservations must be booked at least 2 days ahead/);
  assert.match(booking, /const earliestCustomerCheckIn = isManualReservation\s*\? null/);
});
