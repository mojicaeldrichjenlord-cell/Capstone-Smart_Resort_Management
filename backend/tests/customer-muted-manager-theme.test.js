"use strict";
// Stage UI-22: only the Customer appearance changes.
// Regression guard against changing checkout, navbar behavior or public landing video.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const customerPages = [
  "index.html", "rooms.html", "booking.html", "booking-payment.html",
  "booking-receipt.html", "my-bookings.html", "profile.html",
  "resort-map.html", "landing.html"
];
const unthemedRoles = [
  "frontend/adminHTML/admin.html",
  "frontend/managerHTML/managerDashboard.html",
  "frontend/frontdeskHTML/frontdeskDashboard.html",
  "frontend/authHTML/login.html",
  "frontend/authHTML/register.html"
];

test("Nine Customer pages load last an opt-in visual-only muted palette", () => {
  for (const page of customerPages) {
    const html = read("frontend/customerHTML/" + page);
    assert.match(html, /<body\b[^>]*class="[^"]*\bcustomer-manager-tone\b[^"]*"/i, page);
    assert.match(html, /href="\.\.\/customerCSS\/customer-manager-tone\.css\?v=20261119-ui22"/, page);
    assert.equal((html.match(/customer-manager-tone\.css/g) || []).length, 1, page);
    const themeIndex = html.indexOf("customer-manager-tone.css");
    assert.ok(themeIndex > html.indexOf("../customerCSS/"), page + " stylesheet should load after page CSS");
    assert.ok(themeIndex < html.indexOf("</head>"), page + " stylesheet in head");
  }
});

test("Customer theme remains isolated from Admin, Manager, Front Desk and login/register", () => {
  for (const relative of unthemedRoles) {
    assert.doesNotMatch(read(relative), /customer-manager-tone/, relative);
  }
});

test("Customer theme shares the Manager palette without changing layout or print", () => {
  const theme = read("frontend/customerCSS/customer-manager-tone.css");
  const manager = read("frontend/managerCSS/managerDashboard.css");
  const admin = read("frontend/adminCSS/admin-manager-tone.css");
  for (const color of ["#172554", "#0f766e", "#f8fafc", "#eef2ff", "#e2e8f0"]) {
    assert.ok(manager.includes(color), "Manager reference missing " + color);
    assert.ok(admin.includes(color), "Admin reference missing " + color);
    assert.ok(theme.includes(color), "Customer theme missing " + color);
  }
  assert.match(theme, /@media screen\s*\{/);
  assert.doesNotMatch(theme, /@media print|@import|display:\s*none|pointer-events|position:\s*fixed|position:\s*absolute/);
  assert.doesNotMatch(theme, /@media\s*\([^)]*(?:max|min)-width/);
  assert.match(theme, /body\.customer-manager-tone \.navbar/);
  assert.match(theme, /body\.customer-manager-tone \.landing-navbar/);
  assert.match(theme, /body\.customer-manager-tone \.ai-chat-toggle/);
});

test("Booking and payment page preserve working forms and PayPal integration", () => {
  const booking = read("frontend/customerHTML/booking.html");
  const payment = read("frontend/customerHTML/booking-payment.html");
  assert.match(booking, /id="openPricingGuideBtn"/);
  assert.match(booking, /confirm-transaction-exit/);
  assert.match(booking, /\.\.\/customerJS\/booking\.js/);
  assert.match(payment, /customer-payment-page/);
  assert.match(payment, /paypal/);
  assert.match(payment, /\.\.\/customerJS\/booking-payment\.js/);
});

test("Landing video remains and AI chatbot controls remain on Customer Home", () => {
  const landing = read("frontend/customerHTML/landing.html");
  const home = read("frontend/customerHTML/index.html");
  assert.match(landing, /class="hero-video"/);
  assert.match(landing, /drone-landing\.mp4/);
  assert.match(landing, /landingMenuToggle/);
  assert.match(home, /ai-chat-widget\.js/);
  assert.match(home, /ai-voice\.js/);
  assert.match(home, /id="mobileNav"/);
});
