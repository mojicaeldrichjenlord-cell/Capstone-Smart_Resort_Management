"use strict";
// Stage Payment-19 static regression checks for the Manual Reservation UI.
// Read-only: no browser/API/payments, database writes, or PayPal calls.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const frontend = path.resolve(__dirname, "../../frontend");
const html = fs.readFileSync(path.join(frontend,
  "adminHTML/admin-walkin-payment.html"), "utf8");
const css = fs.readFileSync(path.join(frontend,
  "adminCSS/admin-walkin-payment-minimal.css"), "utf8");
const js = fs.readFileSync(path.join(frontend,
  "adminJS/admin-walkin-payment.js"), "utf8");
const count = (text, fragment) => text.split(fragment).length - 1;

test("minimal stylesheet loads last, is page-scoped, and role navbar is intact", () => {
  assert.match(html, /<body class="has-fixed-navbar manual-payment-page">/);
  assert.ok(html.indexOf("admin-walkin-payment-minimal.css") >
    html.indexOf("admin-walkin-payment.css"));
  assert.ok(html.indexOf("admin-walkin-payment-minimal.css") >
    html.indexOf("admin-mobile-nav.css"));
  assert.match(html, /id="manualRoleNavbar"/);
  assert.match(html, /id="manualRoleNav"/);
  assert.match(html, /manualReservationRoleNav\.js/);
  assert.match(html, /admin-walkin-payment\.js/);
  assert.match(css, /\.manual-payment-page \.payment-grid/);
});

test("original payment JS identifiers and proof controls occur once", () => {
  const ids = [
    "reservationSummaryList", "adminPaymentForm", "paymentMethod", "paymentMethodHelp",
    "paymentType", "referenceGroup", "proofReference", "referenceRequiredText",
    "proofGroup", "proofImage", "proofRequiredText", "proofPreview", "paymentNote",
    "submitPaymentBtn", "adminPaymentMessage", "paymentAccommodationRow",
    "paymentAccommodationLabel", "paymentAccommodationTotal", "paymentDownpaymentRow",
    "paymentDownpaymentLabel", "paymentDownpayment", "paymentPaidRow",
    "paymentPaidLabel", "paymentPaidAmount", "paymentRemainingRow",
    "paymentRemainingLabel", "paymentRemaining", "paymentEntranceRow",
    "paymentEntranceLabel", "paymentEntranceFee", "paymentTotalDueRow",
    "paymentTotalDueLabel", "paymentFrontDeskReminder", "paymentTotalCollectedRow",
    "paymentTotalCollectedLabel", "paymentTotalCollected", "paymentRuleNote",
    "paymentCollectionNote",
  ];
  ids.forEach(id => assert.equal(count(html, 'id="' + id + '"'), 1, id));
  assert.match(html, /<option value="cash">Cash<\/option>/);
  assert.match(html, /<option value="gcash">GCash<\/option>/);
  assert.match(html, /<option value="paymaya">PayMaya<\/option>/);
  assert.match(html, /<input[\s\S]*?id="proofImage"[\s\S]*?accept="image\/png/);
  assert.match(html, /id="submitPaymentBtn"/);
});

test("summary, form and payment breakdown use accessible desktop/mobile order", () => {
  const order = ["manual-payment-summary", "manual-payment-details",
    "manual-payment-breakdown"];
  assert.ok(order.every((name, index) =>
    index === 0 || html.indexOf(name) > html.indexOf(order[index - 1])));
  assert.match(css, /grid-template-areas:\s*"summary breakdown" "details breakdown"/);
  assert.match(css, /@media \(max-width: 960px\)/);
  assert.match(css, /grid-template-areas:\s*"summary" "breakdown" "details"/);
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.match(css, /min-height:\s*46px/);
  assert.match(css, /:focus-visible/);
});

test("dynamic amount-to-collect highlight remains compatible with JS", () => {
  assert.match(js, /function updatePaymentDueHighlight/);
  assert.match(js, /id = "paymentDueHighlight"/);
  assert.match(js, /id="paymentDueNowAmount"/);
  assert.match(js, /id="paymentDueNowDescription"/);
  assert.match(js, /id="paymentDueNowLater"/);
  assert.match(css, /\.manual-payment-page \.payment-due-highlight\s*\{/);
  assert.match(css, /\.manual-payment-page \.payment-due-highlight__amount/);
  assert.match(css, /--manual-teal:\s*#0f766e/);
  assert.match(css, /--manual-page:\s*#f8fafc/);
  assert.match(css, /--manual-border:\s*#e2e8f0/);
});

test("staff payment restrictions, proof validation and receipt flow untouched", () => {
  assert.match(js, /function enforcePaymentOptionsByReservationType/);
  assert.match(js, /function isWalkInManualReservation/);
  assert.match(js, /function updatePaymentRequirementUI/);
  assert.match(js, /function validateManualProofFile/);
  assert.match(js, /function submitManualReservation/);
  assert.match(js, /isWalkIn\s*\?\s*"full"/);
  assert.match(js, /"gcash", "paymaya"/);
  assert.match(js, /proofImage\.required = requiresScreenshot/);
  assert.match(js, /adminPaymentForm/);
  assert.match(html, /type="file"/);
  assert.match(html, /max 8 MB/);
  assert.match(html, /class="payment-row"\s+id="paymentTotalCollectedRow"/);
});

test("payment notes remain complete and visual-only styles stay separate", () => {
  assert.match(html, /id="paymentRuleNote"/);
  assert.match(html, /id="paymentCollectionNote"/);
  assert.match(html, /Walk-in accepts Cash, GCash, or Maya/);
  assert.match(html, /Facebook\/Messenger uses GCash or Maya/);
  assert.match(html, /Entrance fee is not included in the downpayment computation/);
  assert.match(css, /\.manual-payment-page \.payment-note\.success-note/);
  assert.match(css, /\.manual-payment-page #submitPaymentBtn:disabled/);
  assert.doesNotMatch(css, /url\(/);
  assert.doesNotMatch(css, /@import/);
});
