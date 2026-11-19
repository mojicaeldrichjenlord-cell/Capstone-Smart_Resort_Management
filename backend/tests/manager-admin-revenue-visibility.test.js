"use strict";
// RBAC UI/API surface regression: Admin may see revenue summaries;
// Manager receives only operational metrics. No network or DB writes.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

test("Admin cards use explicit online/manual reservation labels without changing IDs", () => {
  const html = read("frontend/adminHTML/admin.html");
  assert.match(html, /<div class="overview-label">Online Reservation Today<\/div>/);
  assert.match(html, /<div class="overview-label">Manual Reservation Today<\/div>/);
  assert.match(html, /id="onlineToday"/);
  assert.match(html, /id="walkinToday"/);
  assert.match(html, /id="todayRevenue"/);
  assert.match(html, />Today Revenue</);
  assert.match(html, /admin-reports\.html/);
});

test("Manager overview API does not SELECT or emit payment or revenue amounts", () => {
  const source = read("backend/controllers/manager/managerOverviewController.js");
  assert.doesNotMatch(source, /recorded_reservation_payments|paid_amount|accommodation_total|booking_charges|safeMoney/);
  assert.match(source, /total_reservations/);
  assert.match(source, /total_accommodations/);
  assert.match(source, /recent_activity/);
});

test("Manager reports API has no monetary aggregation, ledger read or exposed finance keys", () => {
  const source = read("backend/controllers/manager/managerReportsController.js");
  assert.doesNotMatch(source,
    /recorded_accommodation_payments|active_booked_accommodation_value|recorded_paid_charges|paid_charge_rows|paid_amount|accommodation_total|booking_charges|charge_amount|net_revenue/);
  assert.match(source, /booked_guests/);
  assert.match(source, /manual_reservations/);
  assert.match(source, /trends: trendRows/);
  assert.match(source, /accommodations: accommodationRows/);
});

test("Manager dashboard and reports never render monetary cards", () => {
  const files = [
    "frontend/managerHTML/managerDashboard.html",
    "frontend/managerHTML/managerReports.html",
    "frontend/managerJS/managerDashboard.js",
    "frontend/managerJS/managerReports.js",
  ];
  for (const filename of files) {
    const contents = read(filename);
    assert.doesNotMatch(contents,
      /Recorded Reservation Payments|Financial Snapshots|Recorded Accommodation Payments|Booked Accommodation Value|Paid Booking Charges|recordedPayments|reportBookedValue|reportPayments|reportCharges|₱/,
      filename);
  }
  assert.match(read("frontend/managerHTML/managerReports.html"), /Reservation Trend/);
  assert.match(read("frontend/managerHTML/managerReports.html"), /Top Accommodations/);
});

test("Manager still uses role-guarded routes; admin revenue views remain distinct", () => {
  const routes = read("backend/routes/managerRoutes.js");
  const adminReports = read("frontend/adminHTML/admin-reports.html");
  assert.match(routes, /router\.use\(requireManagerAuth\)/);
  assert.match(routes, /router\.get\("\/reports", getManagerReports\)/);
  assert.match(adminReports, /Booking Collections Estimate/);
  assert.doesNotMatch(routes, /requireAdminAuth/);
});
