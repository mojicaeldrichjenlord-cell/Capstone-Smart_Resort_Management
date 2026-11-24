"use strict";
/*
 * UI-34 / 2026-11-21:
 * Frontend-only regressions for two Admin report cards and Manual Reservation
 * preview. No MySQL data, payment capture, booking creation, or network calls.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const reportsHtml = read("frontend/adminHTML/admin-reports.html");
const reportsJs = read("frontend/adminJS/admin-reports.js");
const reportsCss = read("frontend/adminCSS/admin-reports-minimal.css");
const manualHtml = read("frontend/adminHTML/admin-walkin.html");
const manualJs = read("frontend/adminJS/admin-walkin.js");
const manualCss = read("frontend/adminCSS/admin-walkin.css");
const paymentJs = read("frontend/adminJS/admin-walkin-payment.js");
const previewCss = read("frontend/sharedCSS/reservation-preview.css");

test("UI-34 reports show exactly two paid-charge cards, not the three removed cards", () => {
  const section = reportsHtml.match(/<section class="report-charge-grid"[\s\S]*?<\/section>/)?.[0] || "";
  assert.ok(section, "Paid charge card section missing");
  assert.equal((section.match(/class="report-charge-card"/g) || []).length, 2);
  assert.match(section, /id="paidBookingChargesAmount"/);
  assert.match(section, /id="paidBedOverlapAmount"/);
  for (const field of [
    "entranceRefundAmount", "entranceCorrectionAmount", "adjustedCollectionsEstimate",
    "Entrance Refunds", "Entrance Payment Corrections", "Adjusted Collections Estimate",
  ]) {
    assert.ok(!section.includes(field), "Removed card still present: " + field);
    assert.ok(!reportsJs.includes('setText("' + field + '"'), "Obsolete JS update: " + field);
  }
  assert.match(reportsHtml, /admin-reports\.js\?v=20261121-ui34/);
  assert.match(reportsHtml, /admin-reports-minimal\.css\?v=20261121-ui34/);
});

test("UI-34 reports retain paid charges, accurate caveat and balanced print layout", () => {
  assert.match(reportsJs, /admin-report\/paid-charges/);
  assert.match(reportsJs, /paidChargeRows = chargeData\.charges/);
  assert.match(reportsJs, /summarizePaidAdditionalCharges\(bookings, paidChargeRows\)/);
  assert.match(reportsJs, /setText\("paidBookingChargesAmount"/);
  assert.match(reportsJs, /setText\("paidBedOverlapAmount"/);
  assert.doesNotMatch(reportsJs, /entranceReconciliationTotals/);
  assert.match(reportsHtml, /not audited net revenue/);
  assert.match(reportsHtml, /Refunds, payment corrections, and differences between/);
  assert.match(reportsHtml, /not included in these displayed totals/);
  assert.match(reportsCss, /report-charge-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,1fr\)\)/s);
  const print = reportsCss.slice(reportsCss.indexOf("@media print"));
  assert.match(print, /report-charge-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\) !important/s);
});

function manualPreviewHarness() {
  const elements = Object.create(null);
  const element = id => elements[id] || (elements[id] = {
    value: "", hidden: false, textContent: "",
  });
  element("manualReservationType").value = "walkin";
  const sandbox = { document: {
    addEventListener() {},
    getElementById: element,
  }};
  vm.createContext(sandbox);
  vm.runInContext(manualJs, sandbox, {filename:"admin-walkin.js"});
  sandbox.collectBookingItems = () => [{accommodation_id: 15, slot_type: "day"}];
  sandbox.getAccommodationById = () => ({id:15, name:"Single Room E"});
  sandbox.getSlotOptions = () => [{value:"day", price:3000}];
  sandbox.getStayDuration = () => 1;
  sandbox.getEstimatedEntranceFee = () => 750;
  return {elements, element, update: () => vm.runInContext("updateSummary()",sandbox)};
}

test("UI-34 walk-in preview shows full accommodation payment and NO 50% card", () => {
  const h = manualPreviewHarness();
  h.update();
  assert.equal(h.element("requiredPaymentLabel").textContent, "Full Accommodation Payment (Due Now)");
  assert.equal(h.element("requiredDownpayment").textContent, "₱3,000.00");
  assert.equal(h.element("previewAccommodationRow").hidden, true);
  assert.equal(h.element("previewBalanceRow").hidden, true);
  assert.equal(h.element("previewOtherNote").hidden, true);
  assert.equal(h.element("highlightRemainingBalance").textContent, "₱0.00");
  assert.equal(h.element("estimatedEntranceFee").textContent, "₱750.00");
  assert.equal(h.element("accommodationTotal").textContent, "₱3,000.00");
});

test("UI-34 Facebook manual reservation still previews a 50% minimum payment", () => {
  const h = manualPreviewHarness();
  h.element("manualReservationType").value = "facebook";
  h.update();
  assert.equal(h.element("requiredPaymentLabel").textContent, "Required Down Payment (50%)");
  assert.equal(h.element("requiredDownpayment").textContent, "₱1,500.00");
  assert.equal(h.element("previewAccommodationRow").hidden, false);
  assert.equal(h.element("previewBalanceRow").hidden, false);
  assert.equal(h.element("previewOtherNote").hidden, false);
  assert.equal(h.element("highlightRemainingBalance").textContent, "₱1,500.00");
  h.element("manualReservationType").value = "walkin";
  h.update();
  assert.equal(h.element("previewAccommodationRow").hidden, true);
  assert.equal(h.element("previewBalanceRow").hidden, true);
  assert.equal(h.element("previewOtherNote").hidden, true);
  assert.equal(h.element("requiredDownpayment").textContent, "₱3,000.00");
});

test("UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in", () => {
  assert.match(manualHtml, /id="requiredPaymentLabel"/);
  assert.match(manualHtml, /id="previewAccommodationRow" hidden/);
  assert.match(manualHtml, /id="previewBalanceRow" hidden/);
  assert.match(manualHtml, /admin-walkin\.js\?v=20261124-ui76/);
  assert.match(manualHtml, /admin-walkin\.css\?v=20261121-ui35/);
  assert.match(previewCss, /\.reservation-preview-row\[hidden\][^{]*\{\s*display: none !important;/);
  assert.match(manualJs, /const isWalkIn = getManualReservationType\(\) === "walkin"/);
  assert.match(manualJs, /const requiredPayment = isWalkIn \? accommodationTotal : requiredDownpayment/);
  // Payment UI and submission logic must still force full payment for walk-ins.
  assert.match(paymentJs, /paymentType\.innerHTML = \`<option value="full">Full Payment<\/option>\`/);
  assert.match(paymentJs, /paymentType\.disabled = true/);
  assert.match(paymentJs, /const paymentType = isWalkIn\s*\? "full"/);
  assert.match(paymentJs, /reservation_type:/);
  assert.match(paymentJs, /payment_type: paymentType/);
});
