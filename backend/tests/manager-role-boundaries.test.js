// Manager RBAC boundaries - isolated fake DB. Never touches Aiven or payments.
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");
const bcrypt = require("bcrypt");
const { test, before, beforeEach, after } = require("node:test");
const express = require("express");

const hashedPassword = bcrypt.hashSync("CorrectPassword123!", 8);
let user;
let sqlCalls = [];
const mockDb = {
  promise() {
    return {
      async query(sql, params = []) {
        const query = String(sql).replace(/\s+/g, " ").trim();
        sqlCalls.push({ sql: query, params });
        assert.match(query, /^SELECT\b/i, "Manager tests forbid DB writes");
        if (/FROM users\b/i.test(query)) {
          if (/\bWHERE email\s*=\s*\?/i.test(query)) {
            return [user && user.email === params[0] ? [{ ...user }] : []];
          }
          return [user && Number(params[0]) === user.id ? [{ ...user }] : []];
        }
        if (/FROM reservations ORDER BY/i.test(query)) {
          return [[{
            reservation_code: "R-100",
            reservation_status: "approved",
            booking_source: "online",
            created_at: "2026-10-12",
            first_name: "CONFIDENTIAL",
            contact_no: "PRIVATE",
            proof_image_data: "SECRET_PROOF",
          }]];
        }
        if (/FROM reservations\b/i.test(query)) {
          return [[{
            total_reservations: 14, pending_reservations: 4,
            approved_reservations: 7, guests_inside: 2,
            completed_reservations: 3, recorded_reservation_payments: 12500,
          }]];
        }
        if (/FROM accommodations\b/i.test(query)) {
          return [[{ total_accommodations: 61, listed_available: 52 }]];
        }
        throw new Error("Unexpected Manager SQL: " + query);
      },
    };
  },
};

function mockModule(relativePath, exports) {
  const filename = require.resolve(relativePath);
  const item = new Module(filename);
  item.filename = filename;
  item.loaded = true;
  item.exports = exports;
  require.cache[filename] = item;
}

mockModule("../config/db", mockDb);
process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");
const { issueManagerToken } = require("../middleware/managerAuth");
const { issueAdminToken, requireAdminAuth } = require("../middleware/adminAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const { issueCustomerToken } = require("../middleware/customerAuth");
const managerToken = issueManagerToken(1, hashedPassword);
const wrongTokens = {
  admin: issueAdminToken(1), frontdesk: issueFrontDeskToken(1, hashedPassword),
  customer: issueCustomerToken(1),
};

const app = express();
app.use(express.json());
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/manager", require("../routes/managerRoutes"));
app.get("/api/sensitive-admin-operation", requireAdminAuth,
  (_req, res) => res.json({ action: "should never be granted to Manager" }));

let server;
let baseURL;

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
beforeEach(() => {
  user = {
    id: 1, role: "manager", fullname: "Test Manager",
    email: "manager@resort.invalid", password: hashedPassword,
    account_status: "active", is_verified: 1, phone: "PRIVATE_CONTACT",
  };
  sqlCalls = [];
});

async function send(path, { method = "GET", token = null, body = undefined } = {}) {
  const response = await fetch(baseURL + path, {
    method,
    headers: {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(5000),
  });
  return { status: response.status, data: await response.json() };
}

test("verified Manager login returns separate signed mgr1 token", async () => {
  const result = await send("/api/auth/login", {
    method: "POST", body: {
      email: "manager@resort.invalid", password: "CorrectPassword123!",
    },
  });
  assert.equal(result.status, 200);
  assert.match(result.data.managerToken, /^mgr1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.equal(result.data.adminToken, undefined);
  assert.equal(result.data.frontDeskToken, undefined);
  assert.equal(result.data.user.role, "manager");
});

test("wrong password cannot issue Manager token", async () => {
  const result = await send("/api/auth/login", {
    method: "POST", body: {
      email: "manager@resort.invalid", password: "WrongPassword123!",
    },
  });
  assert.equal(result.status, 401);
  assert.equal(result.data.managerToken, undefined);
});

test("Admin login does not issue a Manager token", async () => {
  user.role = "admin";
  const result = await send("/api/auth/login", {
    method: "POST", body: {
      email: "manager@resort.invalid", password: "CorrectPassword123!",
    },
  });
  assert.equal(result.status, 200);
  assert.match(result.data.adminToken, /^adm1\./);
  assert.equal(result.data.managerToken, undefined);
});

for (const endpoint of ["/api/manager/me", "/api/manager/overview"]) {
  test(endpoint + " blocks missing token without DB lookup", async () => {
    const result = await send(endpoint);
    assert.equal(result.status, 401);
    assert.equal(sqlCalls.length, 0);
  });
  test(endpoint + " blocks invalid signature before DB lookup", async () => {
    const result = await send(endpoint, { token: "mgr1.invalid.signature" });
    assert.equal(result.status, 401);
    assert.equal(sqlCalls.length, 0);
  });
  for (const [role, token] of Object.entries(wrongTokens)) {
    test(endpoint + " rejects " + role + " token before DB lookup", async () => {
      const result = await send(endpoint, { token });
      assert.equal(result.status, 401);
      assert.equal(sqlCalls.length, 0);
    });
  }
}

test("verified Manager can view only own sanitized account", async () => {
  const result = await send("/api/manager/me", { token: managerToken });
  assert.equal(result.status, 200);
  assert.equal(result.data.user.role, "manager");
  assert.equal(result.data.user.fullname, "Test Manager");
  assert.equal(result.data.user.password, undefined);
  assert.equal(result.data.user.phone, undefined);
  assert.equal(sqlCalls.length, 1);
});

test("verified Manager reads aggregated operational data only", async () => {
  const result = await send("/api/manager/overview", { token: managerToken });
  assert.equal(result.status, 200);
  assert.equal(result.data.summary.total_reservations, 14);
  assert.equal(result.data.summary.pending_reservations, 4);
  assert.equal(result.data.summary.total_accommodations, 61);
  assert.equal(result.data.summary.recorded_reservation_payments, 12500);
  assert.equal(result.data.recent_activity.length, 1);
  assert.equal(result.data.recent_activity[0].reservation_code, "R-100");
  assert.equal(result.data.recent_activity[0].first_name, undefined);
  assert.equal(result.data.recent_activity[0].contact_no, undefined);
  assert.equal(result.data.recent_activity[0].proof_image_data, undefined);
  assert.doesNotMatch(JSON.stringify(result.data), /CONFIDENTIAL|SECRET_PROOF|PRIVATE_CONTACT/);
  assert.equal(sqlCalls.length, 4);
  assert.ok(sqlCalls.every(item => /^SELECT\b/i.test(item.sql)));
});

test("disabled Manager is denied before summary SQL", async () => {
  user.account_status = "disabled";
  const result = await send("/api/manager/overview", { token: managerToken });
  assert.equal(result.status, 403);
  assert.equal(sqlCalls.length, 1);
});

test("unverified Manager is denied before summary SQL", async () => {
  user.is_verified = 0;
  const result = await send("/api/manager/overview", { token: managerToken });
  assert.equal(result.status, 403);
  assert.equal(sqlCalls.length, 1);
});

test("demoted Manager is blocked by real-time database role check", async () => {
  user.role = "frontdesk";
  const result = await send("/api/manager/overview", { token: managerToken });
  assert.equal(result.status, 403);
  assert.equal(sqlCalls.length, 1);
});

test("Manager signed token cannot access Admin-only endpoint", async () => {
  const result = await send("/api/sensitive-admin-operation", { token: managerToken });
  assert.equal(result.status, 401);
  assert.equal(sqlCalls.length, 0);
});

test("Manager dashboard frontend checks only signed token and API response", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const script = fs.readFileSync(path.resolve(
    __dirname, "../../frontend/managerJS/managerDashboard.js"), "utf8");
  const html = fs.readFileSync(path.resolve(
    __dirname, "../../frontend/managerHTML/managerDashboard.html"), "utf8");
  assert.match(script, /sessionStorage\.getItem\("managerToken"\)/);
  assert.match(script, /\/manager\//);
  assert.match(script, /response\.status === 401 \|\| result\.status === 403|result\.status === 401 \|\| result\.status === 403/);
  assert.doesNotMatch(script, /getUser\(\)\.role|localStorage\.getItem\("user"\)/);
  assert.match(html, /sharedJS\/api-config\.js/);
});
