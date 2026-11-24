"use strict";
// Stage UI-21: appearance-only Manager-inspired Admin theme.
// Protect role boundaries, functionality, print output and shared Front Desk UI.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const themedPages = [
  "admin.html", "admin-reports.html", "admin-rooms.html",
  "admin-map-editor.html", "admin-staff.html", "admin-profile.html",
  "admin-booking-receipt.html"
];
const sharedPages = [
  "admin-walkin.html", "admin-walkin-payment.html",
  "admin-guests-inside.html"
];

test("Seven Admin-only pages load the same theme last and opt in via body class", () => {
  for (const name of themedPages) {
    const html = read("frontend/adminHTML/" + name);
    assert.match(html, /<body\b[^>]*class="[^"]*\badmin-manager-tone\b[^"]*"/i, name);
    assert.match(html, /<link rel="stylesheet" href="\.\.\/adminCSS\/admin-manager-tone\.css\?v=20261119-ui21" \/>/, name);
    assert.equal((html.match(/admin-manager-tone\.css/g) || []).length, 1, name);
    const themeLink = html.indexOf("admin-manager-tone.css");
    assert.ok(themeLink > html.indexOf("../css/style.css"), name + " theme must override shared CSS");
    assert.ok(themeLink < html.indexOf("</head>"), name + " theme must be in head");
  }
});

test("Shared Front Desk pages and Admin redirects are not visually modified", () => {
  for (const name of sharedPages) {
    const html = read("frontend/adminHTML/" + name);
    assert.doesNotMatch(html, /admin-manager-tone/, name);
  }
});

test("Muted Admin palette uses Manager navy/teal colors and neutral cards", () => {
  const css = read("frontend/adminCSS/admin-manager-tone.css");
  const manager = read("frontend/managerCSS/managerDashboard.css");
  for (const color of ["#172554", "#0f766e", "#f8fafc", "#eef2ff", "#e2e8f0"]) {
    assert.ok(css.includes(color), "Admin theme missing " + color);
    assert.ok(manager.includes(color), "Manager reference missing " + color);
  }
  assert.match(css, /body\.admin-manager-tone \.navbar/);
  assert.match(css, /body\.admin-manager-tone \.navbar nav a\.active-nav/);
  assert.match(css, /\.admin-hero/);
  assert.match(css, /\.overview-card/);
  assert.match(css, /\.admin-panel/);
  assert.match(css, /\.stat-card/);
});

test("Screen-only, scoped stylesheet never changes printed reports or booking logic", () => {
  const css = read("frontend/adminCSS/admin-manager-tone.css");
  assert.match(css, /@media screen\s*\{/);
  assert.doesNotMatch(css, /@media print|display:\s*none|position:\s*(?:fixed|absolute)|pointer-events|overflow:\s*hidden/);
  assert.doesNotMatch(css, /(?:^|\n)\s*(?:body|\.navbar|\.btn-primary)\s*\{/);
  assert.doesNotMatch(css, /(?:^|\n)\s*@import/);
  // The stylesheet does not declare or alter any responsive breakpoint.
  assert.doesNotMatch(css, /@media\s*\([^)]*(?:max|min)-width/);
});

test("Theme does not remove Admin operational and financial controls", () => {
  const admin = read("frontend/adminHTML/admin.html");
  const reports = read("frontend/adminHTML/admin-reports.html");
  assert.match(admin, /Reservations Today/);
  assert.match(admin, /id="onlineToday"/);
  assert.match(admin, /id="walkinToday"/);
  assert.match(admin, /Today's Collections \(Estimate\)/);
  assert.match(admin, /id="todayRevenue"/);
  assert.match(admin, /id="totalBookings"/);
  assert.match(reports, /Booking Collections Estimate/i);
});
