"use strict";
// Stage Payment-18: UI-only checkout regression guard.
// No PayPal sandbox call, network call, booking write, or Aiven access.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../../frontend");
const html = fs.readFileSync(path.join(root, "customerHTML/booking-payment.html"), "utf8");
const css = fs.readFileSync(path.join(root, "customerCSS/booking-payment-minimal.css"), "utf8");
const script = fs.readFileSync(path.join(root, "customerJS/booking-payment.js"), "utf8");

function occurrences(input, literal) {
  return input.split(literal).length - 1;
}

test("payment page loads scoped minimalist stylesheet and preserves PayPal SDK element", () => {
  assert.match(html, /<body class="customer-payment-page">/);
  assert.match(html, /booking-payment-minimal\.css/);
  assert.ok(html.indexOf("booking-payment-minimal.css") > html.indexOf("booking-payment.css"));
  assert.match(html, /<paypal-button\s+id="paypalButton"\s+type="pay"\s+hidden/);
  assert.match(html, /<option value="paypal" selected>PayPal<\/option>/);
  assert.match(html, /booking-payment\.js\?v=paypal-only-customer/);
});

test("all payment and transaction IDs used by existing JS remain exactly once", () => {
  for (const id of [
    "reservationSummaryList", "paymentMethod", "paymentReminderNote",
    "paypalPaymentSection", "paypalDownpaymentAmount", "paypalSdkStatus",
    "paypalButton", "paymentMessage", "paymentAccommodationTotal",
    "paymentDownpayment", "paymentRemaining", "paymentEntranceFee",
    "paymentFrontDeskReminder", "policyPaymentStatusText", "paymentPageIntro",
    "cancelTransactionModal", "continueBookingBtn", "confirmCancelTransactionBtn"
  ]) {
    assert.equal(occurrences(html, 'id="' + id + '"'), 1, "ID lost/duplicated: " + id);
  }
  assert.match(script, /currentDownpaymentAmount\s*=\s*downpayment/);
  assert.match(script, /const downpayment = accommodationTotal \* 0\.5/);
  assert.match(script, /formatMoney\(remaining \+ entranceFee\)/);
  assert.match(script, /paypalButton\.addEventListener\("click"/);
});

test("desktop grid and mobile grid are easy to read in correct order", () => {
  assert.match(html, /class="payment-grid"/);
  assert.match(html, /class="section-box payment-reservation"/);
  assert.match(html, /class="section-box payment-checkout"/);
  assert.match(html, /class="section-box payment-totals"/);
  assert.match(html, /class="section-box resort-policy-reminder payment-policies"/);
  const order = ["payment-reservation", "payment-checkout", "payment-totals", "payment-policies"];
  assert.ok(order.every((name, index) =>
    index === 0 || html.indexOf(name) > html.indexOf(order[index - 1])));
  assert.doesNotMatch(html, /class="payment-left"|class="payment-right"/);
  assert.match(css, /grid-template-areas:\s*"summary breakdown" "checkout policies"/);
  assert.match(css, /@media \(max-width: 950px\)/);
  assert.match(css, /grid-template-areas:\s*"summary"\s*"breakdown"\s*"checkout"\s*"policies"/);
  assert.match(css, /@media \(max-width: 560px\)/);
});

test("breakdown emphasizes pay-now, distinguishes onsite and retains estimates", () => {
  assert.match(html, /Downpayment due now \(50%\)/);
  assert.match(html, /Remaining balance at resort/);
  assert.match(html, /Estimated entrance fee \(onsite\)/);
  assert.match(html, /Estimated total due at resort/);
  assert.match(html, /Down payment is based on the accommodation total only/);
  assert.match(html, /only an estimate for the first day/);
  assert.match(css, /\.customer-payment-page \.payment-row:nth-child\(2\)/);
  assert.match(css, /--checkout-teal:\s*#0f766e/);
  assert.match(css, /--checkout-page:\s*#f8fafc/);
  assert.match(css, /--checkout-border:\s*#e2e8f0/);
});

test("all six resort policies remain visible; no cancellation flow removed", () => {
  for (const num of ["01","02","03","04","05","06"]) {
    assert.match(html, new RegExp("<span>" + num + "</span>"));
  }
  assert.match(html, /online reservations are confirmed automatically/i);
  assert.match(html, /Guests are responsible for damaged items/);
  assert.match(html, /Additional charges may be added by admin\/staff/);
  assert.match(html, /additional entrance fee of ₱100/);
  assert.match(html, /By continuing with PayPal, you agree/);
  assert.match(html, /pendingExitUrl/);
  assert.match(html, /confirmCancelTransactionBtn/);
});

test("neutral styles are scoped; legacy QR code and JS stay untouched", () => {
  assert.match(css, /\.customer-payment-page \.payment-breakdown/);
  assert.match(css, /\.customer-payment-page \.resort-policy-reminder/);
  assert.match(css, /\.customer-payment-page \.paypal-payment-section/);
  assert.match(css, /\.customer-payment-page \.policy-item/);
  assert.match(css, /\.customer-payment-page #paypalButton/);
  assert.match(script, /getSignedCheckoutAuthorization/);
  assert.match(script, /setupQrModal\(\)/);
  assert.match(script, /setupPaymentForm\(\)/);
});
