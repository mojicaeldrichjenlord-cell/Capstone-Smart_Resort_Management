// Read-only Admin Reports safety tests. No real DB, network or payments.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const frontend = path.resolve(__dirname, "../../frontend");
const html = fs.readFileSync(path.join(frontend, "adminHTML/admin-reports.html"), "utf8");
const css = fs.readFileSync(path.join(frontend, "adminCSS/admin-reports.css"), "utf8");
const js = fs.readFileSync(path.join(frontend, "adminJS/admin-reports.js"), "utf8");

const start = js.indexOf("function isDateWithinActiveRange(value) {");
const end = js.indexOf("// ============================================================", start + 1);
assert.ok(start !== -1 && end > start, "Revenue estimate helpers must be present");
const helpers = js.slice(start, end);
function evaluate(booking) {
  const scope = {
    activeStartDate: "2026-10-01",
    activeEndDate: "2026-10-17",
  };
  vm.runInNewContext(helpers + "\nthis.getAmount = calculateCollectedRevenueForReport;", scope);
  return scope.getAmount(booking);
}

test("Report makes estimated collection semantics explicit on screen and print", () => {
  assert.match(html, /Booking Collections Estimate/);
  assert.match(html, /estimates from reservation payment snapshots/);
  // Entrance refund/correction rows are now shown and deducted separately.
  assert.match(html, /Entrance refunds and payment corrections are deducted above/);
  assert.match(html, /Estimated Collections by Accommodation Category/);
  assert.doesNotMatch(html, /<h3>Money Collected<\/h3>/);
  assert.match(css, /@media print[\s\S]*\.revenue-report-disclaimer/);
});

test("Unpaid downpayment is not counted as collected cash", () => {
  assert.equal(evaluate({
    created_at: "2026-10-02 08:00:00",
    paid_amount: 0,
    required_downpayment: 1500,
    accommodation_total: 3000,
  }), 0);
});

test("Unpaid accommodation price is not counted at check-in", () => {
  assert.equal(evaluate({
    created_at: "2026-09-12 08:00:00",
    checked_in_at: "2026-10-03 07:00:00",
    paid_amount: 0,
    accommodation_total: 3500,
    entrance_fee_collected: 0,
  }), 0);
});

test("Paid accommodation, entrance and separately paid legacy bed are estimates only", () => {
  assert.equal(evaluate({
    created_at: "2026-10-02 08:00:00",
    checked_in_at: "2026-10-03 07:00:00",
    extra_bed_paid_at: "2026-10-16 14:00:00",
    extra_bed_paid: 1,
    paid_amount: 3500,
    accommodation_total: 3500,
    entrance_fee_collected: 850,
    extra_bed_fee: 200,
    required_downpayment: 1750,
  }), 4550);
});

test("Payment snapshots outside report window do not contribute", () => {
  assert.equal(evaluate({
    created_at: "2026-09-01 08:00:00",
    checked_in_at: "2026-09-02 07:00:00",
    paid_amount: 4200,
    extra_bed_paid_at: "2026-09-02 19:00:00",
    extra_bed_paid: 1,
    extra_bed_fee: 200,
  }), 0);
});
