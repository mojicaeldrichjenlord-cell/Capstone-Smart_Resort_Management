// All fixture-based checks are READ ONLY; no Aiven, MySQL or PayPal operations.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const Module = require("node:module");
const dbPath = require.resolve("../config/db");
const fakeCalls = [];
// Isolated rows simulate dated entrance refunds without contacting MySQL.
let fakeReconciliationRows = [];
const fakeDB = new Module(dbPath);
fakeDB.filename = dbPath; fakeDB.loaded = true;
fakeDB.exports = { promise() { return { async query(sql, params) {
  assert.match(sql.trim(), /^SELECT /);
  fakeCalls.push({ sql, params });
  if (/FROM entrance_fee_reconciliations/i.test(sql)) {
    return [fakeReconciliationRows.map(row => ({ ...row }))];
  }
  return [[
    { booking_id: 10, charge_name: "extra guest charge", amount: 1000 },
    { booking_id: 10, charge_name: "extra bed charge", amount: 200 },
    { booking_id: 10, charge_name: "additional - damage", amount: 300 },
  ]];
} }; } };
require.cache[dbPath] = fakeDB;
const { getAdminReportPaidCharges } = require("../controllers/admin/adminReportPaidChargesController");
async function call(from, to) {
  let status = 200, payload;
  const res = { status(n) { status = n; return this; }, json(obj) { payload = obj; return this; } };
  await getAdminReportPaidCharges({ query: { from, to } }, res);
  return { status, payload };
}
const project = path.resolve(__dirname, "../..");
const script = fs.readFileSync(path.join(project, "frontend/adminJS/admin-reports.js"), "utf8");
const html = fs.readFileSync(path.join(project, "frontend/adminHTML/admin-reports.html"), "utf8");
const routes = fs.readFileSync(path.join(project, "backend/routes/bookingRoutes.js"), "utf8");
const start = script.indexOf("function isDateWithinActiveRange(value) {");
const end = script.indexOf("// ============================================================", start);
assert.ok(start >= 0 && end > start);
const scope = { activeStartDate: "2026-10-01", activeEndDate: "2026-10-17" };
vm.runInNewContext(script.slice(start,end) +
  "\nthis.base = calculateCollectedRevenueForReport;" +
  "\nthis.charges = summarizePaidAdditionalCharges;", scope);
const booking = { id:10, created_at:"2026-10-02 09:00:00",
  checked_in_at:"2026-10-03 07:00:00", paid_amount:3500,
  accommodation_total:3500, entrance_fee_collected:850,
  extra_bed_paid:1, extra_bed_fee:200, extra_bed_paid_at:"2026-10-03 07:39:38" };
const chargeRows = [
  {booking_id:10, charge_name:"extra guest charge", amount:1000},
  {booking_id:10, charge_name:"extra bed charge", amount:200},
  {booking_id:10, charge_name:"additional - damage", amount:300},
];
test("Invalid report dates rejected without any query", async () => {
  fakeCalls.length=0;
  assert.equal((await call("2026-10-17","2026-10-01")).status,400);
  assert.equal((await call("2026-02-30","2026-10-01")).status,400);
  assert.equal((await call("2025-01-01","2026-10-17")).status,400);
  assert.equal(fakeCalls.length,0);
});
test("Only paid charges are read, using bounded inclusive date range", async () => {
  fakeCalls.length=0;
  const response=await call("2026-10-01","2026-10-17");
  assert.equal(response.status,200);
  assert.equal(response.payload.charges.length,3);
  assert.equal(fakeCalls.length,2);
  assert.match(fakeCalls[0].sql,/COALESCE\(is_paid,0\) = 1/);
  assert.match(fakeCalls[0].sql,/paid_at >= \? AND paid_at < \?/);
  assert.deepEqual(fakeCalls[0].params,["2026-10-01","2026-10-18"]);
  assert.match(fakeCalls[1].sql,/FROM entrance_fee_reconciliations/);
  assert.match(fakeCalls[1].sql,/created_at >= \? AND created_at < \?/);
  assert.deepEqual(fakeCalls[1].params,["2026-10-01","2026-10-18"]);
  assert.deepEqual(response.payload.entrance_reconciliations,
    { refunds: 0, corrections: 0 });
  assert.doesNotMatch(JSON.stringify(response.payload),/email|guest_name|contact_no/);
});
test("The report endpoint is signed Admin-only", () => {
  assert.match(routes,/"\/admin-report\/paid-charges", requireAdminAuth, getAdminReportPaidCharges/);
});
test("October receipt reconciles to ₱5850 after extra-bed overlap", () => {
  const base=scope.base(booking);
  const adj=scope.charges([booking],chargeRows);
  assert.equal(base,4550);
  assert.equal(adj.totalPaid,1500);
  assert.equal(adj.alreadyCountedBed,200);
  assert.equal(base+adj.totalPaid-adj.alreadyCountedBed,5850);
});
test("Extra-bed not in legacy window is NOT deducted", () => {
  const adj=scope.charges([{...booking, extra_bed_paid_at:"2026-09-28"}],chargeRows);
  assert.equal(adj.alreadyCountedBed,0);
});
test("Paid charges may occur even when booking is outside reservation list", () => {
  const adj=scope.charges([],chargeRows);
  assert.equal(adj.totalPaid,1500);
  assert.equal(adj.alreadyCountedBed,0);
});
test("The report makes all financial sources visible as estimates", () => {
  assert.match(html,/Adjusted Collections Estimate/);
  assert.match(html,/Extra Bed Already Counted/);
  assert.match(html,/not audited net revenue/);
});


// Refund and correction are separate events: never treat a correction as a
// second positive payment, and never use the reservation creation date.
test("Dated entrance refunds and corrections are returned without guest details", async () => {
  fakeReconciliationRows = [
    { reconciliation_type: "refund", amount: "150.00" },
    { reconciliation_type: "correction", amount: "25.00" },
  ];
  try {
    const response = await call("2026-10-01", "2026-10-17");
    assert.equal(response.status, 200);
    assert.deepEqual(response.payload.entrance_reconciliations,
      { refunds: 150, corrections: 25 });
    assert.doesNotMatch(JSON.stringify(response.payload), /note|guest_name|contact_no/);
  } finally {
    fakeReconciliationRows = [];
  }
});

test("Adjusted estimate subtracts refunds and voided entrance collections", () => {
  const output = {};
  const statsStart = script.indexOf("function updateStats(bookings) {");
  const statsEnd = script.indexOf("// ============================================================", statsStart);
  assert.ok(statsStart >= 0 && statsEnd > statsStart);
  const view = {
    activeStartDate: "2026-10-01", activeEndDate: "2026-10-17",
    paidChargeRows: chargeRows, paidChargesLoaded: true,
    entranceReconciliationTotals: { refunds: 150, corrections: 25 },
    setText(id, value) { output[id] = value; },
    formatMoney(value) { return Number(value).toFixed(2); },
  };
  vm.runInNewContext(script.slice(start, end) + script.slice(statsStart, statsEnd) +
    "\nthis.render = updateStats;", view);
  view.render([booking]);
  assert.equal(output.entranceRefundAmount, "₱150.00");
  assert.equal(output.entranceCorrectionAmount, "₱25.00");
  assert.equal(output.adjustedCollectionsEstimate, "₱5675.00");
  assert.match(html, /Entrance Refunds/);
  assert.match(html, /Entrance Payment Corrections/);
});

test("Without verified refund totals the UI must not show net collections", () => {
  assert.match(script, /Entrance refund\/correction totals are unavailable/);
  assert.match(script, /setText\("adjustedCollectionsEstimate", "Unavailable"\)/);
});
