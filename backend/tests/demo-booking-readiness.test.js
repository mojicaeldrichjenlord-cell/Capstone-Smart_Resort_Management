"use strict";
// Demo preflight must remain read-only. It is NOT a real booking or
// payment test and never queries the reservation/customer records.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { summarizeReadiness } = require("../controllers/shared/bookingReadinessController");

const required = {
  reservations: ["id","reservation_code","user_id","created_by","booking_source",
    "first_name","last_name","contact_no","guest_count","accommodation_total",
    "required_downpayment","paid_amount","remaining_balance","payment_method",
    "payment_status","reservation_status","is_checked_in","reserved_at"],
  reservation_items: ["reservation_id","accommodation_id","slot_type","check_in_date",
    "check_in_time","check_out_date","check_out_time","item_price","stay_duration"],
  accommodations: ["id","name","status","day_price","overnight_price"],
  users: ["id","role","password"],
  payment_transactions: ["id","reservation_id","paypal_order_id","paypal_capture_status"],
  reservation_payment_proofs: ["id","reservation_id","mime_type","image_data"]
};
const rowsFor = (except = []) => Object.entries(required)
  .flatMap(([table,columns])=>columns.filter(column=>
    !except.some(x=>x.table===table&&x.column===column))
    .map(column=>({TABLE_NAME:table,COLUMN_NAME:column})));
const sandbox = {
  PAYPAL_BASE_URL:"https://api-m.sandbox.paypal.com",
  PAYPAL_CLIENT_ID:"dummy-test-client",
  PAYPAL_CLIENT_SECRET:"dummy-test-secret"
};

test("full schema + sandbox config distinguishes ready workflows from transaction success",()=>{
  const r=summarizeReadiness(rowsFor(),sandbox,"defaultdb");
  assert.equal(r.database,"defaultdb");
  assert.deepEqual(r.missing,{});
  assert.equal(r.checks.customerBookingDatabase,true);
  assert.equal(r.checks.customerPayPal,true);
  assert.equal(r.checks.customerSandboxDemo,true);
  assert.equal(r.checks.frontDeskWalkInCash,true);
  assert.equal(r.checks.frontDeskEwalletProof,true);
  assert.match(r.validationScope,/not an actual transaction/);
});

test("missing durable proof table affects wallet proof only, never cash booking",()=>{
  const r=summarizeReadiness(rowsFor().filter(x=>x.TABLE_NAME!=="reservation_payment_proofs"),sandbox,"defaultdb");
  assert.equal(r.checks.frontDeskWalkInCash,true);
  assert.equal(r.checks.frontDeskEwalletProof,false);
  assert.equal(r.checks.frontDeskFacebookWallet,false);
  assert.equal(r.checks.customerPayPal,true);
  assert.ok(r.missing.reservation_payment_proofs.includes("image_data"));
});

test("missing payment transaction schema blocks customer PayPal, not manual cash",()=>{
  const r=summarizeReadiness(rowsFor().filter(x=>x.TABLE_NAME!=="payment_transactions"),sandbox);
  assert.equal(r.checks.customerPayPal,false);
  assert.equal(r.checks.frontDeskWalkInCash,true);
});

test("missing core booking column fails customer and all manual booking flows",()=>{
  const r=summarizeReadiness(rowsFor([{table:"reservations",column:"reserved_at"}]),sandbox);
  assert.equal(r.checks.customerBookingDatabase,false);
  assert.equal(r.checks.customerPayPal,false);
  assert.equal(r.checks.frontDeskWalkInCash,false);
  assert.equal(r.checks.frontDeskEwalletProof,false);
});

test("unconfigured PayPal credentials must not imply customer ready",()=>{
  const r=summarizeReadiness(rowsFor(),{}, "defaultdb");
  assert.equal(r.checks.customerBookingDatabase,true);
  assert.equal(r.checks.customerPayPal,false);
  assert.equal(r.checks.frontDeskWalkInCash,true);
});

test("Live PayPal is explicitly NOT safe for sandbox demo claims",()=>{
  const r=summarizeReadiness(rowsFor(),{...sandbox,PAYPAL_BASE_URL:"https://api-m.paypal.com"},"defaultdb");
  assert.equal(r.checks.customerPayPal,true);
  assert.equal(r.checks.customerSandboxDemo,false);
  assert.equal(r.paymentEnvironment,"live");
});

test("Route is staff-only and no code disables normal reservation or payment writes",()=>{
  const route=fs.readFileSync(path.join(__dirname,"../routes/bookingRoutes.js"),"utf8");
  const controller=fs.readFileSync(path.join(__dirname,"../controllers/shared/bookingReadinessController.js"),"utf8");
  assert.match(route,/router.get\("\/demo-readiness", requireOperationalBookingRead, getBookingReadiness\)/);
  assert.match(route,/router.post\(\s*"\/",\s*\/\/ Authenticate before storing any uploaded payment proof\.\s*requireCustomerAuth/);
  assert.match(route,/router.post\(\s*"\/walk-in",\s*requireFrontDeskAuth/);
  assert.match(controller,/INFORMATION_SCHEMA\.COLUMNS/);
  assert.doesNotMatch(controller,/\b(?:INSERT|UPDATE|DELETE|TRUNCATE|DROP|ALTER)\s+(?:TABLE\s+)?(?:reservations|reservation_items|payment_transactions)/i);
});
