"use strict";
// UI-23: Front Desk color-only alignment with the Admin / Customer / Manager
// palette. This test must not require MySQL or create reservation/payment rows.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const frontDeskPages = [
  "frontdeskDashboard.html",
  "frontdeskReservations.html",
  "frontdeskPayments.html",
  "frontdeskGuests.html",
  "frontdesk-booking-receipt.html",
];
const roleAwarePages = [
  "admin-walkin.html",
  "admin-walkin-payment.html",
];

test("Five Front Desk pages use the scoped theme as their last stylesheet", () => {
  for (const name of frontDeskPages) {
    const html = read("frontend/frontdeskHTML/" + name);
    assert.match(html, /<body\b[^>]*class="[^"]*\bhas-fixed-navbar\b[^"]*\bfrontdesk-manager-tone\b[^"]*"/i, name);
    assert.match(html, /href="\.\.\/frontdeskCSS\/frontdesk-manager-tone\.css\?v=20261119-ui23"/, name);
    assert.equal((html.match(/frontdesk-manager-tone\.css/g) || []).length, 1, name);
    assert.ok(html.indexOf("frontdesk-manager-tone.css") > html.lastIndexOf("logout-confirm.css"), name + " theme loads after prior styles");
    assert.ok(html.indexOf("frontdesk-manager-tone.css") < html.indexOf("</head>"), name + " stylesheet in head");
  }
});

test("Role-aware manual reservation and payment pages use matching colors", () => {
  for (const name of roleAwarePages) {
    const html = read("frontend/adminHTML/" + name);
    assert.match(html, /<body\b[^>]*class="[^"]*\bhas-fixed-navbar\b[^"]*\bfrontdesk-manager-tone\b[^"]*"/i, name);
    assert.match(html, /href="\.\.\/frontdeskCSS\/frontdesk-manager-tone\.css\?v=20261119-ui23"/, name);
    assert.match(html, /id="manualRoleNavbar"/, name);
    assert.match(html, /id="manualRoleNav"/, name);
    assert.match(html, /data-admin-only/, name);
    assert.equal((html.match(/frontdesk-manager-tone\.css/g) || []).length, 1, name);
  }
  const payment = read("frontend/adminHTML/admin-walkin-payment.html");
  assert.match(payment, /class="[^"]*\bmanual-payment-page\b[^"]*\bfrontdesk-manager-tone\b/);
  assert.match(payment, /admin-walkin-payment-minimal\.css/);
  assert.ok(payment.indexOf("frontdesk-manager-tone.css") > payment.indexOf("admin-walkin-payment-minimal.css"));
});

test("Front Desk theme is purely screen-only and does not change layouts or printing", () => {
  const css = read("frontend/frontdeskCSS/frontdesk-manager-tone.css");
  assert.match(css, /@media screen\s*\{/);
  assert.doesNotMatch(css, /@media print|@import|display:\s*none|pointer-events|position:\s*fixed|position:\s*absolute/);
  assert.doesNotMatch(css, /@media\s*\([^)]*(?:max|min)-width/);
  assert.match(css, /body\.frontdesk-manager-tone \.navbar/);
  assert.match(css, /\.frontdesk-hero/);
  assert.match(css, /\.walkin-hero/);
  assert.doesNotMatch(css, /(?:^|\n)\s*(?:body|\.navbar)\s*\{/);
});

test("Theme uses Manager colors and preserves payment/guest warning borders", () => {
  const css = read("frontend/frontdeskCSS/frontdesk-manager-tone.css");
  const admin = read("frontend/adminCSS/admin-manager-tone.css");
  const customer = read("frontend/customerCSS/customer-manager-tone.css");
  for (const color of ["#172554", "#0f766e", "#f8fafc", "#eef2ff", "#e2e8f0"]) {
    assert.ok(css.includes(color), "Missing color " + color);
    assert.ok(admin.includes(color), "Admin reference missing " + color);
    assert.ok(customer.includes(color), "Customer reference missing " + color);
  }
  assert.match(css, /\.payment-summary-card:not\(\.attention\)/);
  assert.match(css, /\.guest-summary-card:not\(\.attention\):not\(\.ready\)/);
  assert.match(css, /\.payment-summary-card:not\(\.attention\) strong/);
  assert.match(css, /\.guest-summary-card:not\(\.attention\) strong/);
  assert.doesNotMatch(css, /(?:^|\n)\s*\.payment-policy-note\s*\{/);
});

test("Front Desk functions and printer controls remain in HTML", () => {
  const dashboard = read("frontend/frontdeskHTML/frontdeskDashboard.html");
  const guests = read("frontend/frontdeskHTML/frontdeskGuests.html");
  const payments = read("frontend/frontdeskHTML/frontdeskPayments.html");
  const receipt = read("frontend/frontdeskHTML/frontdesk-booking-receipt.html");
  const manual = read("frontend/adminHTML/admin-walkin.html");
  assert.match(dashboard, /href="\.\.\/adminHTML\/admin-walkin\.html"/);
  assert.match(guests, /frontdeskOperationTabs\.css/);
  assert.match(guests, /id="refreshBtn"/);
  assert.match(payments, /id="refreshBtn"/);
  assert.match(receipt, /id="printThermalBtn"/);
  assert.match(manual, /id="walkInForm"/);
});
