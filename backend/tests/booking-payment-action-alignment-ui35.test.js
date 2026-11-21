"use strict";
/*
 * UI-35: Payment navigation alignment only.
 * Non-mutating HTML/CSS regression tests; no DB, PayPal or booking requests.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const customer = read("frontend/customerHTML/booking.html");
const customerCss = read("frontend/customerCSS/booking.css");
const manual = read("frontend/adminHTML/admin-walkin.html");
const manualCss = read("frontend/adminCSS/admin-walkin.css");

test("UI-35 online booking: Back left, Next to Payment right; required submit remains guarded", () => {
  const actions = customer.match(/<div class="booking-form-actions">([\s\S]*?)<\/div>/)?.[1] || "";
  assert.ok(actions, "Customer form actions missing");
  const back = actions.indexOf('href="rooms.html" class="back-btn-full confirm-transaction-exit"');
  const next = actions.indexOf('type="submit" class="btn-primary full-btn" id="nextToPaymentBtn" disabled');
  assert.ok(back >= 0 && next > back, "Back must precede Next to Payment");
  assert.equal((actions.match(/id="nextToPaymentBtn"/g) || []).length, 1);
  assert.match(customer, /booking\.css\?v=20261121-ui35/);
  assert.match(customer, /id="bookingAvailabilitySummary"/);
});

test("UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved", () => {
  const actions = manual.match(/<div class="walkin-actions">([\s\S]*?)<\/div>/)?.[1] || "";
  assert.ok(actions, "Manual form actions missing");
  const cancel = actions.indexOf('href="admin.html"');
  const next = actions.indexOf('type="submit" class="btn-primary" id="manualNextPaymentBtn" disabled');
  assert.ok(cancel >= 0 && next > cancel, "Cancel must precede Next to Payment");
  assert.match(actions, /data-dashboard-link/);
  assert.match(actions, /title="Choose and verify available time slots first\."/);
  assert.equal((actions.match(/id="manualNextPaymentBtn"/g) || []).length, 1);
  assert.match(manual, /admin-walkin\.css\?v=20261121-ui35/);
});

test("UI-35 right-alignment overrides old full-width mobile styles in both booking pages", () => {
  const onlineFix = customerCss.slice(customerCss.lastIndexOf("UI-35:"));
  const manualFix = manualCss.slice(manualCss.lastIndexOf("UI-35:"));
  for (const style of [onlineFix, manualFix]) {
    assert.match(style, /flex-direction:\s*row/);
    assert.match(style, /flex-wrap:\s*wrap/);
    assert.match(style, /justify-content:\s*space-between/);
    assert.match(style, /min-height:\s*44px/);
    assert.match(style, /width:\s*auto/);
  }
  assert.match(onlineFix, /\.booking-form-actions #nextToPaymentBtn\s*\{\s*margin-left:\s*auto/);
  assert.match(manualFix, /\.walkin-actions #manualNextPaymentBtn\s*\{\s*margin-left:\s*auto/);
  assert.match(onlineFix, /@media \(max-width:\s*480px\)/);
  assert.match(manualFix, /@media \(max-width:\s*780px\)/);
  assert.match(manualCss, /#manualNextPaymentBtn:disabled/);
  assert.match(customerCss, /#nextToPaymentBtn:disabled/);
});

test("UI-35 payment navigation keeps original forms and payment scripts", () => {
  const onlineJs = read("frontend/customerJS/booking.js");
  const manualJs = read("frontend/adminJS/admin-walkin.js");
  assert.match(customer, /<form id="bookingForm"/);
  assert.match(manual, /<form id="walkInForm"/);
  assert.match(onlineJs, /nextToPaymentBtn/);
  assert.match(manualJs, /manualNextPaymentBtn/);
  assert.match(customer, /confirm-transaction-exit/);
  assert.match(manual, /data-dashboard-link/);
});
