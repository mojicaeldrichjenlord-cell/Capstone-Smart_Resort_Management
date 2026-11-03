// Refund Phase 1 security and behavior tests.
// Uses a mocked database and real Express router/middleware (no Aiven or PayPal).
// Run from backend: node --test tests/refund-request-security.test.js
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");
const { test, before, beforeEach, after } = require("node:test");

let user, booking, requests, writes, queries, missingMigration;
function mockModule(path, replacement) {
  const filename = require.resolve(path);
  const entry = new Module(filename);
  entry.filename = filename;
  entry.loaded = true;
  entry.exports = replacement;
  require.cache[filename] = entry;
}
const fakeDb = {
  promise() {
    return {
      async query(statement, params = []) {
        const sql = String(statement).replace(/\s+/g, " ").trim();
        queries.push({ sql, params });
        if (/FROM users WHERE id = \? LIMIT 1/i.test(sql)) {
          return [[Number(params[0]) === Number(user.id) ? { ...user } : null].filter(Boolean)];
        }
        if (missingMigration && /refund_requests/i.test(sql)) {
          throw Object.assign(new Error("Test schema not yet migrated"), { code: "ER_NO_SUCH_TABLE" });
        }
        if (/^INSERT INTO refund_requests/i.test(sql)) {
          const [reason, reservationId, customerId] = params;
          const allowed = booking.id === Number(reservationId) &&
            booking.user_id === Number(customerId) &&
            booking.booking_source === "online" &&
            ["cancelled", "rejected"].includes(booking.reservation_status) &&
            booking.is_checked_in === 0 && booking.paid_amount > 0;
          if (!allowed) return [{ affectedRows: 0 }];
          if (requests.some(r => r.reservation_id === booking.id)) {
            throw Object.assign(new Error("Duplicate"), { code: "ER_DUP_ENTRY", errno: 1062 });
          }
          const record = { id: 1, reservation_id: booking.id, customer_user_id: customerId,
            reason, status: "pending_review", created_at: "2026-11-04" };
          requests.push(record);
          writes.push({ sql, params });
          return [{ affectedRows: 1, insertId: 1 }];
        }
        if (/FROM refund_requests rr\s+WHERE rr.customer_user_id = \?/i.test(sql)) {
          return [requests.filter(r => r.customer_user_id === Number(params[0]))];
        }
        if (/FROM refund_requests rr\s+INNER JOIN reservations r/i.test(sql)) {
          return [requests.map(r => ({ ...r, reservation_code: "TEST-001",
            payment_method: "paypal", recorded_paid_amount: booking.paid_amount }))];
        }
        throw new Error("Unexpected database query in refund test: " + sql);
      },
    };
  },
};
mockModule("../config/db", fakeDb);
process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");
const { issueCustomerToken } = require("../middleware/customerAuth");
const { issueAdminToken } = require("../middleware/adminAuth");
const customerToken = issueCustomerToken(1), adminToken = issueAdminToken(1);
const express = require("express");
const app = express();
app.use(express.json());
app.use("/api/refunds", require("../routes/refundRoutes"));
let server, base;
before(async () => {
  server = await new Promise(resolve => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  if (server) await new Promise(resolve => {
    server.close(resolve); server.closeAllConnections();
  });
});
beforeEach(() => {
  user = { id: 1, role: "customer", account_status: "active", is_verified: 1 };
  booking = { id: 71, user_id: 1, booking_source: "online",
    reservation_status: "cancelled", paid_amount: 1500, is_checked_in: 0 };
  requests = []; writes = []; queries = []; missingMigration = false;
});
async function api(url, method = "GET", token = customerToken, body) {
  const r = await fetch(base + url, {
    method, headers: { "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(5000),
  });
  return { status: r.status, data: await r.json() };
}
const create = (token = customerToken, body = { reservation_id: 71,
  reason: "Cancelled family outing" }) =>
  api("/api/refunds/customer/requests", "POST", token, body);

test("Customer refund request requires a signed Customer session", async () => {
  assert.equal((await create(null)).status, 401);
  assert.equal((await create(adminToken)).status, 401);
  assert.equal(writes.length, 0);
});
test("Customer cannot submit a request for someone else's reservation", async () => {
  booking.user_id = 2;
  assert.equal((await create()).status, 409);
  assert.equal(writes.length, 0);
});
test("Only cancelled/rejected online reservations can request review", async () => {
  booking.reservation_status = "approved";
  assert.equal((await create()).status, 409);
  booking.reservation_status = "cancelled";
  booking.booking_source = "manual";
  assert.equal((await create()).status, 409);
  booking.booking_source = "online";
  booking.is_checked_in = 1;
  assert.equal((await create()).status, 409);
  assert.equal(writes.length, 0);
});
test("No recorded payment means no refund review request", async () => {
  booking.paid_amount = 0;
  assert.equal((await create()).status, 409);
  assert.equal(writes.length, 0);
});
test("Reason requires 10 to 500 characters", async () => {
  assert.equal((await create(customerToken, { reservation_id: 71, reason: "short" })).status, 400);
  assert.equal((await create(customerToken, { reservation_id: 71, reason: "x".repeat(501) })).status, 400);
  assert.equal(writes.length, 0);
});
test("Customer can submit one review request with no payment changes", async () => {
  const r = await create();
  assert.equal(r.status, 201);
  assert.equal(r.data.status, "pending_review");
  assert.match(r.data.message, /No money has been refunded/);
  assert.equal(writes.length, 1);
  assert.match(writes[0].sql, /^INSERT INTO refund_requests/i);
  assert.ok(queries.every(q => !/UPDATE reservations|payment_transactions|paypal/i.test(q.sql)));
  assert.equal(booking.paid_amount, 1500);
});
test("Duplicate requests return a 409 instead of creating another record", async () => {
  assert.equal((await create()).status, 201);
  const dup = await create();
  assert.equal(dup.status, 409);
  assert.equal(dup.data.code, "REFUND_ALREADY_REQUESTED");
  assert.equal(writes.length, 1);
});
test("Customer sees only own refund requests", async () => {
  requests.push({ id: 1, customer_user_id: 1, reservation_id: 71, status: "pending_review" });
  requests.push({ id: 2, customer_user_id: 2, reservation_id: 72, status: "pending_review" });
  const res = await api("/api/refunds/customer/requests");
  assert.equal(res.status, 200);
  assert.deepEqual(res.data.requests.map(x => x.id), [1]);
});
test("Only Admin can see full refund review queue", async () => {
  requests.push({ id: 1, reservation_id: 71, customer_user_id: 1, status: "pending_review" });
  assert.equal((await api("/api/refunds/admin/requests")).status, 401);
  assert.equal((await api("/api/refunds/admin/requests", "GET", null)).status, 401);
  user.role = "admin";
  const res = await api("/api/refunds/admin/requests", "GET", adminToken);
  assert.equal(res.status, 200);
  assert.equal(res.data.requests.length, 1);
  assert.match(res.data.disclaimer, /not proof/i);
});
test("Unmigrated test database reports clean 503 without changing payments", async () => {
  missingMigration = true;
  const res = await create();
  assert.equal(res.status, 503);
  assert.equal(res.data.code, "REFUND_SCHEMA_PENDING");
  assert.equal(writes.length, 0);
});
