"use strict";
/*
 * UI-29 Customer Receipt: visual-only regression.
 * Ensures a cleaner invoice appearance cannot silently remove booking,
 * payment, final charge fields, authenticated access, or print legibility.
 * No production DB, PayPal API or customer record is used.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const html = read("frontend/customerHTML/booking-receipt.html");
const css = read("frontend/customerCSS/booking-receipt.css");
const js = read("frontend/customerJS/booking-receipt.js");

test("UI-29 receipt has one back control and one accessible main heading", () => {
  assert.equal((html.match(/Back to My Bookings/g) || []).length, 1);
  assert.doesNotMatch(html, /class="page-header"|class="receipt-actions"/);
  assert.match(html, /class="receipt-shell"/);
  assert.match(html, /id="receiptBox"/);
  assert.match(html, /booking-receipt\.css\?v=20261120-ui32/);
  assert.match(html, /customer-manager-tone\.css\?v=20261119-ui22/);
  assert.match(html, /customerJS\/booking-receipt\.js/);
  assert.match(js, /<h1>\$\{isCompleted \? "Final Receipt" : "Reservation Receipt"\}<\/h1>/);
  assert.doesNotMatch(js, /<h2>\$\{isCompleted \? "Final Receipt" : "Reservation Receipt"\}<\/h2>/);
});

test("UI-29 keeps actual data, authenticated receipt endpoint and payment calculations", () => {
  for (const snippet of [
    'sessionStorage.getItem("customerToken")',
    '/bookings/'+ '$' + '{bookingId}/receipt',
    'Authorization: "Bearer " + receiptToken',
    "infoRow(\"Guest Name\"",
    "infoRow(\"Contact No.\"",
    "infoRow(\"Guest Count\"",
    "infoRow(\"Reserved At\"",
    'renderAccommodationItem',
    'renderSimplePaymentSummary',
    'renderFinalPaymentSummary',
    'shouldShowFinalDetails',
    'finalTotalCollected',
    'finalOnsiteReminder',
    'simpleOnsiteReminder',
    'getPaidBookingChargesTotal',
    'getUnpaidBookingChargesTotal',
    'legacyExtraBedPaidFallback',
    'legacyExtraBedUnpaidFallback',
    'entranceFeeCollected',
    'adjustedEntranceFee',
    'formatPhilippineDateTime',
    'formatItemStayDuration',
    'escapeHtml',
  ]) {
    assert.ok(js.includes(snippet), "Missing important booking data/logic: " + snippet);
  }
  for (const label of [
    "Accommodation Total", "Downpayment Paid", "Remaining Balance",
    "Entrance Fee Estimate", "Estimated Onsite Payment",
    "Final Payment Details", "Total Collected",
    "Remaining To Collect Onsite", "Onsite Booking Charges",
  ]) {
    assert.ok(js.includes(label), "Missing payment disclosure: " + label);
  }
  assert.match(js, /status-pill status-\$\{escapeAttribute\(status\)\}/);
  assert.match(js, /status-pill status-\$\{escapeAttribute\(paymentStatus\)\}/);
  assert.match(js, /Reservation Code/);
  assert.match(js, /Facebook: <a href=/);
  assert.match(js, /TikTok: <a href=/);
});

test("UI-29 uses a quiet invoice palette and highlights only final payable row", () => {
  assert.match(css, /UI-29 — Customer reservation receipt/);
  assert.match(css, /body\.customer-manager-tone \.receipt-shell/);
  assert.match(css, /\.receipt-hero\s*\{[^}]*background:\s*#fff/s);
  assert.match(css, /\.payment-summary\s*\{[^}]*background:\s*#fff/s);
  assert.match(css, /\.receipt-reminder\s*\{[^}]*background:\s*#f8fafc/s);
  assert.match(css, /\.payment-summary > \.amount-row:last-child\s*\{/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
  assert.match(css, /\.info-row\s*\{/);
  assert.match(css, /@media \(max-width: 480px\)/);
  assert.doesNotMatch(css, /#0f172a;\s*color:\s*#ffffff|#fff7ed|#fed7aa/);
});

test("UI-29 keeps receipt details visible in print without navigation chrome", () => {
  const printStart = css.indexOf("@media print");
  assert.ok(printStart > -1, "Print styles missing");
  const printRules = css.slice(printStart);
  assert.match(printRules, /\.navbar, \.receipt-top-actions/);
  assert.match(printRules, /\.receipt-page-wrapper\s*\{/);
  assert.match(printRules, /\.payment-summary > \.amount-row:last-child/);
  assert.match(printRules, /break-inside:\s*avoid/);
  assert.doesNotMatch(printRules, /\.minimal-receipt[^{}]*\{[^}]*display:\s*none/s);
});
