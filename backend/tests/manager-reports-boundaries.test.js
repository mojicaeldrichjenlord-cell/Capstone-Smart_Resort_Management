// Manager Reports permission and finance-boundary tests.
// ALL queries are intercepted and run against synthetic fixtures, never Aiven.
const assert = require("node:assert/strict");
const { test, before, beforeEach, after } = require("node:test");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");
const express = require("express");

let account, calls;
const fakeDb = {
  promise() {
    return {
      async query(sql, params = []) {
        const query = String(sql).replace(/\s+/g, " ").trim();
        calls.push({ sql: query, params });
        assert.match(query, /^SELECT\b/i, "No database writes allowed in reports");
        if (/FROM users WHERE id = \?/i.test(query)) {
          return [account && Number(params[0]) === account.id
            ? [{ ...account }] : []];
        }
        if (/FROM reservations WHERE created_at/i.test(query) &&
            /COUNT\(\*\) AS total_reservations/i.test(query)) {
          return [[{
            total_reservations: 6, pending: 2, approved: 1,
            completed: 1, cancelled: 1, rejected: 1,
            online: 4, manual: 2, booked_guests: 22,
            active_booked_accommodation_value: "16000.00",
            recorded_accommodation_payments: "6400.00",
            first_name: "PRIVATE_GUEST",
            contact_no: "PRIVATE_PHONE",
          }]];
        }
        if (/GROUP BY DATE\(created_at\)/i.test(query)) {
          return [[
            { date: "2026-10-01", reservations: 2, booked_guests: 8 },
            { date: "2026-10-02", reservations: 4, booked_guests: 14 },
          ]];
        }
        if (/FROM reservations r INNER JOIN reservation_items ri/i.test(query)) {
          return [[{
            accommodation_id: 21, accommodation_name: "Poolside Cottage",
            category_name: "Cottage", booked_items: 3, reservations: 2,
            first_name: "PRIVATE_GUEST",
          }]];
        }
        if (/FROM booking_charges WHERE/i.test(query)) {
          return [[{ paid_charge_rows: 3, recorded_paid_charges: "900.00" }]];
        }
        throw new Error("Unexpected Manager report SQL: " + query);
      }
    };
  }
};
function override(path, exports) {
  const filename = require.resolve(path);
  const item = new Module(filename);
  item.filename = filename;
  item.loaded = true;
  item.exports = exports;
  require.cache[filename] = item;
}
override("../config/db", fakeDb);
process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");
const { issueManagerToken } = require("../middleware/managerAuth");
const { issueCustomerToken } = require("../middleware/customerAuth");
const { issueAdminToken } = require("../middleware/adminAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const managerToken = issueManagerToken(1);
const others = {
  admin: issueAdminToken(1),
  frontdesk: issueFrontDeskToken(1),
  customer: issueCustomerToken(1),
};
const fakeResponse = (_req, res) => res.json({ success: true });
override("../controllers/manager/managerOverviewController", {
  getManagerMe: fakeResponse, getManagerOverview: fakeResponse,
});
override("../controllers/manager/managerReservationsController", {
  listManagerReservations: fakeResponse, reviewManagerReservation: fakeResponse,
});
override("../controllers/manager/managerAccommodationsController", {
  listManagerAccommodations: fakeResponse,
  updateManagerAccommodationOperations: fakeResponse,
});
const app = express();
app.use(express.json());
app.use("/api/manager", require("../routes/managerRoutes"));
let server, base;
before(async () => {
  server = await new Promise(resolve => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
beforeEach(() => {
  account = {
    id: 1, role: "manager", fullname: "Resort Manager",
    account_status: "active", is_verified: 1,
    email: "manager@example.invalid",
  };
  calls = [];
});
async function get(path = "/reports?from=2026-10-01&to=2026-10-31", token = managerToken) {
  const resp = await fetch(base + "/api/manager" + path, {
    headers: token ? { Authorization: "Bearer " + token } : {},
    signal: AbortSignal.timeout(5000),
  });
  return { status: resp.status, body: await resp.json() };
}
const reads = () => calls.filter(x => !/FROM users WHERE id = \?/i.test(x.sql));
const sample = async () => get();

test("Manager reports: protected, sanitized summary and separate cash metrics", async () => {
  const result = await sample();
  assert.equal(result.status, 200);
  assert.equal(result.body.summary.total_reservations, 6);
  assert.equal(result.body.summary.pending, 2);
  assert.equal(result.body.summary.recorded_accommodation_payments, 6400);
  assert.equal(result.body.summary.active_booked_accommodation_value, 16000);
  assert.equal(result.body.summary.recorded_paid_charges, 900);
  assert.equal(result.body.summary.net_revenue, undefined);
  assert.equal(result.body.trends.length, 2);
  assert.equal(result.body.accommodations[0].booked_items, 3);
  assert.equal(result.body.accommodations[0].reservations, 2);
  assert.doesNotMatch(JSON.stringify(result.body), /PRIVATE_GUEST|PRIVATE_PHONE/);
  assert.equal(reads().length, 4);
  assert.ok(calls.every(c => /^SELECT\b/i.test(c.sql)));
});
test("Reservation creation period uses inclusive end date without scanning payment date", async () => {
  const result = await sample();
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.period, {
    from: "2026-10-01", to: "2026-10-31", days: 31,
  });
  for (const record of reads()) {
    assert.deepEqual(record.params, ["2026-10-01", "2026-11-01"]);
    assert.match(record.sql, />= \? AND .+ < \?/);
  }
  const metric = reads()[0].sql;
  assert.match(metric, /SUM\(COALESCE\(paid_amount,0\)\)/);
  assert.match(metric, /reservation_status NOT IN \('cancelled','rejected'\)/);
  assert.doesNotMatch(metric, /JOIN reservation_items/);
});
test("Paid booking charges are aggregated in a SEPARATE SQL query", async () => {
  await sample();
  const charge = reads().find(r => /FROM booking_charges WHERE/i.test(r.sql));
  assert.ok(charge);
  assert.match(charge.sql, /COALESCE\(is_paid,0\) = 1/);
  assert.match(charge.sql, /paid_at >= \? AND paid_at < \?/);
  assert.match(charge.sql, /SUM\(COALESCE\(charge_amount,0\)\)/);
});
test("Accommodation performance counts items and distinct reservations, not sum payments", async () => {
  await sample();
  const performance = reads().find(r => /JOIN reservation_items/i.test(r.sql));
  assert.ok(performance);
  assert.match(performance.sql, /COUNT\(ri.id\) AS booked_items/);
  assert.match(performance.sql, /COUNT\(DISTINCT r.id\) AS reservations/);
  assert.match(performance.sql, /NOT IN \('cancelled','rejected'\)/);
  assert.doesNotMatch(performance.sql, /paid_amount|SUM\(.*accommodation_total/);
  assert.match(performance.sql, /LIMIT 12/);
});
test("Report wording never misrepresents cumulative paid_amount as net revenue", async () => {
  const result = await sample();
  assert.match(result.body.definitions.recorded_payments, /Cumulative/);
  assert.match(result.body.definitions.recorded_payments, /Not date-of-payment/);
  assert.match(result.body.definitions.paid_charges, /separate/);
  assert.match(result.body.definitions.reconciliation, /No combined net-revenue/);
});
test("Missing dates default to local Philippine last 30 days", async () => {
  const result = await get("/reports");
  assert.equal(result.status, 200);
  assert.equal(result.body.period.days, 30);
  assert.equal(reads().length, 4);
});
for (const [label, suffix, expectedStatus] of [
  ["malformed from", "?from=2026/10/01&to=2026-10-31", 400],
  ["nonexistent day", "?from=2026-02-30&to=2026-03-03", 400],
  ["reversed range", "?from=2026-10-31&to=2026-10-01", 400],
  ["overlong range", "?from=2025-01-01&to=2026-10-01", 400],
  ["non-ISO to", "?from=2026-10-01&to=invalid", 400],
]) {
  test("Manager report blocks " + label + " before analytics query", async () => {
    const result = await get("/reports" + suffix);
    assert.equal(result.status, expectedStatus);
    assert.equal(reads().length, 0);
  });
}
test("Valid inclusive one-day report executes all read-only aggregates", async () => {
  const result = await get("/reports?from=2026-10-13&to=2026-10-13");
  assert.equal(result.status, 200);
  assert.deepEqual(reads()[0].params, ["2026-10-13", "2026-10-14"]);
  assert.equal(result.body.period.days, 1);
});
test("Manager reports rejects missing token without DB query", async () => {
  const result = await get("/reports", null);
  assert.equal(result.status, 401);
  assert.equal(calls.length, 0);
});
test("Manager reports rejects forged token before DB query", async () => {
  const result = await get("/reports", "mgr1.forged.invalid");
  assert.equal(result.status, 401);
  assert.equal(calls.length, 0);
});
for (const [role, token] of Object.entries(others)) {
  test("Manager reports rejects " + role + " token before DB query", async () => {
    const result = await get("/reports", token);
    assert.equal(result.status, 401);
    assert.equal(calls.length, 0);
  });
}
test("Disabled Manager cannot access report metrics", async () => {
  account.account_status = "disabled";
  const result = await sample();
  assert.equal(result.status, 403);
  assert.equal(reads().length, 0);
});
test("Unverified Manager cannot access reports", async () => {
  account.is_verified = 0;
  const result = await sample();
  assert.equal(result.status, 403);
  assert.equal(reads().length, 0);
});
test("Demoted Manager cannot access reports despite signed token", async () => {
  account.role = "customer";
  const result = await sample();
  assert.equal(result.status, 403);
  assert.equal(reads().length, 0);
});
test("Reports UI references Manager token and renders untrusted accommodation names safely", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const script = fs.readFileSync(path.resolve(
    __dirname, "../../frontend/managerJS/managerReports.js"), "utf8");
  const html = fs.readFileSync(path.resolve(
    __dirname, "../../frontend/managerHTML/managerReports.html"), "utf8");
  assert.match(script, /sessionStorage\.getItem\("managerToken"\)/);
  assert.match(script, /\/manager\//);
  assert.match(script, /textContent/);
  assert.doesNotMatch(script, /innerHTML/);
  assert.match(html, /financial/i);
  assert.match(html, /Do not add them together as revenue/);
});
