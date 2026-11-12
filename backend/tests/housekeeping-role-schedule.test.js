// Housekeeping Phase 1 RBAC/schedule tests. 100% mocked DB; no writes,
// real credentials, Aiven access, booking changes, or payment calls.
const assert = require("node:assert/strict");
const { test, before, beforeEach, after } = require("node:test");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");
const bcrypt = require("bcrypt");
const express = require("express");

const today = (() => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return p.year + "-" + p.month + "-" + p.day;
})();
let user, sqlCalls, scheduleRows;
// Mock SQL with harmless in-memory rows; never connect to the real Aiven DB.
const fakeDb = {
  promise() {
    return {
      async query(sql, params = []) {
        const query = String(sql).replace(/\s+/g, " ").trim();
        sqlCalls.push({ sql: query, params });
        assert.match(query, /^SELECT\b/i, "Housekeeping must never modify DB");
        if (/FROM users WHERE email = \?/i.test(query)) {
          return [user && user.email === params[0] ? [{ ...user }] : []];
        }
        if (/FROM users WHERE id = \?/i.test(query)) {
          return [user && Number(params[0]) === user.id ? [{ ...user }] : []];
        }
        if (/FROM reservation_items ri\b/i.test(query)) {
          return [[...scheduleRows]];
        }
        throw new Error("Unexpected SQL in Housekeeping tests: " + query);
      },
    };
  },
};
// Install fake modules before importing the backend routes under test.
function mock(path, exported) {
  const filename = require.resolve(path);
  const item = new Module(filename);
  item.filename = filename;
  item.loaded = true;
  item.exports = exported;
  require.cache[filename] = item;
}
mock("../config/db", fakeDb);
process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");
// Consistent synthetic bcrypt hash for signed staff tokens in mock DB users.
const STAFF_TEST_HASH = require("./helpers/staffPasswordFixture");

const { issueHousekeepingToken } = require("../middleware/housekeepingAuth");
const { issueAdminToken, requireAdminAuth } = require("../middleware/adminAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const { issueManagerToken } = require("../middleware/managerAuth");
const { issueCustomerToken } = require("../middleware/customerAuth");
const valid = issueHousekeepingToken(1, STAFF_TEST_HASH);
const otherTokens = {
  admin: issueAdminToken(1),
  manager: issueManagerToken(1, STAFF_TEST_HASH),
  frontdesk: issueFrontDeskToken(1, STAFF_TEST_HASH),
  customer: issueCustomerToken(1),
};
const app = express();
app.use(express.json());
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/housekeeping", require("../routes/housekeepingRoutes"));
app.get("/api/only-admin", requireAdminAuth, (_req, res) => res.json({ success: true }));

let server, baseURL;
before(async () => {
  server = await new Promise(resolve => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  baseURL = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
// Reset account role/status and example bookings before each isolated test.
beforeEach(() => {
  user = {
    id: 1, email: "housekeeping@resort.invalid",
    fullname: "Housekeeping Tester", role: "housekeeping",
    password: STAFF_TEST_HASH,
    account_status: "active", is_verified: 1, phone: "PRIVATE_PHONE",
  };
  scheduleRows = [{
    item_id: 14, reservation_code: "TEST-HK-14",
    reservation_status: "approved", is_checked_in: 1,
    accommodation_id: 5, accommodation_name: "Room A",
    category_name: "Room", slot_type: "day_tour",
    check_in_date: today, check_in_time: "07:00",
    check_out_date: today, check_out_time: "17:00",
    first_name: "PRIVATE_GUEST", email: "PRIVATE_EMAIL",
    payment_status: "SECRET_PAYMENT",
  }, {
    item_id: 15, reservation_code: "TEST-HK-15",
    reservation_status: "completed", is_checked_in: 0,
    accommodation_id: 6, accommodation_name: "Room B",
    category_name: "Room", slot_type: "overnight",
    check_in_date: today, check_in_time: "19:00",
    check_out_date: today, check_out_time: "05:00",
    contact_no: "PRIVATE_CONTACT",
  }];
  sqlCalls = [];
});
// Send real HTTP requests to the temporary Express test server only.
async function call(path, { token = valid, method = "GET", body } = {}) {
  const result = await fetch(baseURL + path, {
    method,
    headers: {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(5000),
  });
  return { status: result.status, data: await result.json().catch(() => ({})) };
}
const nonUserReads = () => sqlCalls.filter(q => !/FROM users WHERE/i.test(q.sql));

// Login returns hk1 only; other role-specific signed sessions remain separate.
test("Housekeeping login receives signed hk1 token and no Admin token", async () => {
  const result = await call("/api/auth/login", {
    method: "POST", token: null,
    body: { email: user.email, password: "ValidHousekeeping123!" },
  });
  assert.equal(result.status, 200);
  assert.match(result.data.housekeepingToken, /^hk1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.equal(result.data.adminToken, undefined);
  assert.equal(result.data.managerToken, undefined);
  assert.equal(result.data.frontDeskToken, undefined);
  assert.equal(result.data.customerToken, undefined);
});
test("Wrong Housekeeping password issues no session", async () => {
  const result = await call("/api/auth/login", {
    method: "POST", token: null,
    body: { email: user.email, password: "Incorrect" },
  });
  assert.equal(result.status, 401);
  assert.equal(result.data.housekeepingToken, undefined);
});
test("Manager login never receives Housekeeping token", async () => {
  user.role = "manager";
  const result = await call("/api/auth/login", {
    method: "POST", token: null,
    body: { email: user.email, password: "ValidHousekeeping123!" },
  });
  assert.equal(result.status, 200);
  assert.match(result.data.managerToken, /^mgr1\./);
  assert.equal(result.data.housekeepingToken, undefined);
});

for (const route of ["/api/housekeeping/me", "/api/housekeeping/daily-schedule"]) {
  test(route + " rejects missing token without DB query", async () => {
    const result = await call(route, { token: null });
    assert.equal(result.status, 401);
    assert.equal(sqlCalls.length, 0);
  });
  test(route + " rejects forged token without DB query", async () => {
    const result = await call(route, { token: "hk1.fake.invalid" });
    assert.equal(result.status, 401);
    assert.equal(sqlCalls.length, 0);
  });
  for (const [role, token] of Object.entries(otherTokens)) {
    test(route + " rejects " + role + " token without DB query", async () => {
      const result = await call(route, { token });
      assert.equal(result.status, 401);
      assert.equal(sqlCalls.length, 0);
    });
  }
}

test("Verified Housekeeping account can read sanitized identity", async () => {
  const result = await call("/api/housekeeping/me");
  assert.equal(result.status, 200);
  assert.equal(result.data.user.role, "housekeeping");
  assert.equal(result.data.user.fullname, "Housekeeping Tester");
  assert.equal(result.data.user.phone, undefined);
  assert.equal(result.data.user.password, undefined);
});
// Privacy check: synthetic secret guest/payment values must not leave the API.
test("Daily schedule lists checked-in and completed items without guest or payment data", async () => {
  const result = await call("/api/housekeeping/daily-schedule?date=" + today);
  assert.equal(result.status, 200);
  assert.equal(result.data.items.length, 2);
  assert.equal(result.data.summary.scheduled_items, 2);
  assert.equal(result.data.summary.checked_in_items, 1);
  assert.equal(result.data.summary.completed_items, 1);
  assert.equal(result.data.summary.arriving_today, 2);
  assert.equal(result.data.summary.departing_today, 2);
  assert.equal(result.data.items[0].checked_in, true);
  assert.equal(result.data.items[1].checked_in, false);
  assert.equal(result.data.items[0].accommodation, "Room A");
  assert.equal(result.data.items[0].reservation_code, "TEST-HK-14");
  assert.doesNotMatch(JSON.stringify(result.data),
    /PRIVATE_GUEST|PRIVATE_EMAIL|PRIVATE_CONTACT|SECRET_PAYMENT|PRIVATE_PHONE/);
  assert.equal(nonUserReads().length, 1);
  assert.ok(sqlCalls.every(x => /^SELECT\b/i.test(x.sql)));
});
// Read-only schedule uses bound parameters and excludes unapproved bookings.
test("Schedule SQL uses parameterized dates and excludes pending and rejected bookings", async () => {
  await call("/api/housekeeping/daily-schedule?date=" + today);
  const query = nonUserReads()[0];
  assert.deepEqual(query.params, [today, today]);
  assert.match(query.sql, /ri.check_in_date <= \? AND ri.check_out_date >= \?/);
  assert.match(query.sql, /r.reservation_status IN \('approved','completed'\)/);
  assert.match(query.sql, /LIMIT 300/);
  assert.doesNotMatch(query.sql, /\bUPDATE\b|\bDELETE\b|\bINSERT\b/i);
});
test("Missing date defaults to Asia/Manila current day", async () => {
  const result = await call("/api/housekeeping/daily-schedule");
  assert.equal(result.status, 200);
  assert.equal(result.data.date, today);
  assert.deepEqual(nonUserReads()[0].params, [today, today]);
});
test("No reservation items returns empty read-only schedule", async () => {
  scheduleRows = [];
  const result = await call("/api/housekeeping/daily-schedule?date=" + today);
  assert.equal(result.status, 200);
  assert.equal(result.data.summary.scheduled_items, 0);
  assert.equal(result.data.items.length, 0);
});
for (const bad of ["2026-02-30", "not-a-date", "2026/10/13", "2099-01-01"]) {
  test("Invalid schedule date rejected without booking query: " + bad, async () => {
    const result = await call("/api/housekeeping/daily-schedule?date=" + bad);
    assert.equal(result.status, 400);
    assert.equal(nonUserReads().length, 0);
  });
}
test("Disabled Housekeeping account cannot read schedule", async () => {
  user.account_status = "disabled";
  const result = await call("/api/housekeeping/daily-schedule");
  assert.equal(result.status, 403);
  assert.equal(nonUserReads().length, 0);
});
test("Unverified Housekeeping account cannot read schedule", async () => {
  user.is_verified = 0;
  const result = await call("/api/housekeeping/daily-schedule");
  assert.equal(result.status, 403);
  assert.equal(nonUserReads().length, 0);
});
// Explicit account flags are required: nullable legacy fields must NOT grant access.
// Mock returns raw NULL values, so also ensure the SQL does not coalesce them to 1/active.
test("NULL account status cannot authorize Housekeeping access", async () => {
  user.account_status = null;
  const result = await call("/api/housekeeping/daily-schedule");
  assert.equal(result.status, 403);
  assert.equal(nonUserReads().length, 0);
  assert.doesNotMatch(sqlCalls[0].sql, /COALESCE\s*\(\s*account_status/i);
});
test("NULL verification status cannot authorize Housekeeping access", async () => {
  user.is_verified = null;
  const result = await call("/api/housekeeping/daily-schedule");
  assert.equal(result.status, 403);
  assert.equal(nonUserReads().length, 0);
  assert.doesNotMatch(sqlCalls[0].sql, /COALESCE\s*\(\s*is_verified/i);
});
test("Demoted Housekeeping account cannot read schedule", async () => {
  user.role = "customer";
  const result = await call("/api/housekeeping/daily-schedule");
  assert.equal(result.status, 403);
  assert.equal(nonUserReads().length, 0);
});
// Housekeeping token must not unlock Admin privileges (cross-role RBAC).
test("Housekeeping token cannot authorize Admin operations", async () => {
  const result = await call("/api/only-admin");
  assert.equal(result.status, 401);
  assert.equal(sqlCalls.length, 0);
});
test("Housekeeping schedule endpoint has no write method", async () => {
  const result = await call("/api/housekeeping/daily-schedule", {
    method: "POST", body: { status: "clean" },
  });
  assert.equal(result.status, 404);
  assert.equal(nonUserReads().length, 0);
});
test("Housekeeping UI uses only signed token and text-only rendering", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const script = fs.readFileSync(path.resolve(
    __dirname, "../../frontend/housekeepingJS/housekeepingDashboard.js"), "utf8");
  const html = fs.readFileSync(path.resolve(
    __dirname, "../../frontend/housekeepingHTML/housekeepingDashboard.html"), "utf8");
  assert.match(script, /sessionStorage\.getItem\("housekeepingToken"\)/);
  assert.match(script, /Authorization: "Bearer " \+ token/);
  assert.match(script, /\/housekeeping\//);
  assert.match(script, /textContent/);
  assert.doesNotMatch(script, /innerHTML|localStorage\.getItem\("user"\)/);
  assert.match(html, /sharedJS\/api-config\.js/);
  assert.match(html, /read-only booking schedule/);
});
