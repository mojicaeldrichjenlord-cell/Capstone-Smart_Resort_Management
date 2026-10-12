// Run from backend: node --test tests/admin-operation-boundaries.test.js
// Real Express routes + real signed-token middleware, with an in-memory DB.
// Never load .env, config/db.js, server.js, or the real PayPal service.
const assert = require("node:assert/strict");
const { before, beforeEach, after, test } = require("node:test");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");

let reservations;
let adminAccount;
let queries;
let writes;
let concurrentChange;

function replaceModule(relativePath, exports) {
  const filename = require.resolve(relativePath);
  const entry = new Module(filename);
  entry.filename = filename;
  entry.loaded = true;
  entry.exports = exports;
  require.cache[filename] = entry;
}

const fakeDb = {
  promise() {
    return {
      async query(statement, params) {
        const sql = statement.replace(/\s+/g, " ").trim();
        queries.push({ sql, params });
        if (/^SELECT\b/i.test(sql) && /FROM users\b/i.test(sql)) {
          return [Number(params[0]) === 1 ? [{ ...adminAccount }] : []];
        }
        if (/^SELECT\b/i.test(sql) && /FROM reservations\b/i.test(sql)) {
          const row = reservations.get(Number(params[0]));
          return [row ? [{ ...row }] : []];
        }
        if (/^UPDATE reservations SET reservation_status = \?/i.test(sql)) {
          const [status, id, expectedStatus] = params;
          const row = reservations.get(Number(id));
          if (!row) return [{ affectedRows: 0 }];
          if (concurrentChange === "check-in") row.is_checked_in = 1;
          if (concurrentChange === "completion") row.reservation_status = "completed";
          // Model the predicates actually present in the submitted SQL, so
          // removing either concurrency guard causes the race tests to fail.
          if (/COALESCE\(is_checked_in, 0\) = 0/i.test(sql) && row.is_checked_in !== 0) {
            return [{ affectedRows: 0 }];
          }
          if (/AND reservation_status = \?/i.test(sql) && row.reservation_status !== expectedStatus) {
            return [{ affectedRows: 0 }];
          }
          row.reservation_status = status;
          writes.push({ sql, params });
          return [{ affectedRows: 1 }];
        }
        throw new Error(`Unexpected database operation in isolated test: ${sql}`);
      },
      getConnection() {
        throw new Error("Financial transaction must not run in these Admin tests.");
      },
    };
  },
};
replaceModule("../config/db", fakeDb);
const noPayPal = () => { throw new Error("PayPal must not be called by this test."); };
replaceModule("../services/paypalService", {
  createPayPalOrder: noPayPal,
  capturePayPalOrder: noPayPal,
  getPayPalOrder: noPayPal,
});
process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");

const express = require("express");
const { issueAdminToken } = require("../middleware/adminAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const app = express();
app.use(express.json());
app.use("/api/bookings", require("../routes/bookingRoutes"));
app.use("/api/admin/bookings", require("../routes/adminBookingRoutes"));
app.use("/api/admin/payments", require("../routes/adminPaymentRoutes"));
const adminToken = issueAdminToken(1);
const frontDeskToken = issueFrontDeskToken(2);
let server;
let baseUrl;

before(async () => {
  server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  });
});
beforeEach(() => {
  adminAccount = { id: 1, role: "admin", account_status: "active", is_verified: 1 };
  queries = [];
  writes = [];
  concurrentChange = null;
  reservations = new Map([
    [101, "pending", 0], [102, "approved", 1], [103, "completed", 0],
    [104, "cancelled", 0], [105, "rejected", 0], [106, "approved", 0],
  ].map(([id, reservation_status, is_checked_in]) => [id, {
    id, reservation_status, is_checked_in,
    accommodation_total: 1000, required_downpayment: 500,
    paid_amount: 500, remaining_balance: 500, payment_status: "partially_paid",
    entrance_fee_collected: 250, entrance_fee_paid: 1,
    extra_bed_fee: 200, extra_bed_paid: 0,
    note: "Preserve financial history", checked_in_at: null,
  }]));
});

async function request(path, body, token = adminToken, extraHeaders = {}) {
  const response = await fetch(baseUrl + path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  return { status: response.status, body: await response.json() };
}

for (const prefix of ["/api/bookings", "/api/admin/bookings"]) {
  const endpoint = (id) => `${prefix}/${id}/status`;
  for (const [name, token] of [["missing", null], ["fake", "adm1.invalid.signature"], ["Front Desk", frontDeskToken]]) {
    test(`${prefix}: ${name} token cannot cancel`, async () => {
      const result = await request(endpoint(101), { status: "cancelled", role: "admin" }, token,
        { "x-user-role": "admin", "x-user-id": "1" });
      assert.equal(result.status, 401);
      assert.equal(queries.length, 0);
      assert.equal(writes.length, 0);
    });
  }
  for (const role of ["frontdesk", "staff", "manager", "owner", "housekeeping", "customer"]) {
    test(`${prefix}: signed token cannot bypass current ${role} role`, async () => {
      adminAccount.role = role;
      assert.equal((await request(endpoint(101), { status: "cancelled" })).status, 403);
      assert.equal(writes.length, 0);
    });
  }
  for (const accountState of ["disabled", "unverified"]) {
    test(`${prefix}: ${accountState} Admin is blocked`, async () => {
      if (accountState === "disabled") adminAccount.account_status = "disabled";
      else adminAccount.is_verified = 0;
      assert.equal((await request(endpoint(101), { status: "cancelled" })).status, 403);
      assert.equal(writes.length, 0);
    });
  }
  test(`${prefix}: direct completion is blocked before reading a reservation`, async () => {
    const result = await request(endpoint(102), { status: " COMPLETED " });
    assert.equal(result.status, 403);
    assert.equal(result.body.code, "FRONT_DESK_CHECKOUT_REQUIRED");
    assert.equal(queries.filter(({ sql }) => /FROM reservations/.test(sql)).length, 0);
    assert.equal(writes.length, 0);
  });
  for (const status of ["pending", "approved", "rejected", "cancelled"]) {
    test(`${prefix}: checked-in guest cannot be set to ${status}`, async () => {
      assert.equal((await request(endpoint(102), { status })).status, 409);
      assert.equal(writes.length, 0);
    });
  }
  for (const id of [103, 104, 105]) {
    test(`${prefix}: terminal reservation ${id} cannot be reopened`, async () => {
      assert.equal((await request(endpoint(id), { status: "approved" })).status, 409);
      assert.equal(writes.length, 0);
    });
  }
  for (const id of [101, 106]) {
    test(`${prefix}: valid pre-check-in cancellation preserves every financial field (${id})`, async () => {
      const original = { ...reservations.get(id) };
      assert.equal((await request(endpoint(id), { status: "cancelled" })).status, 200);
      assert.deepEqual(reservations.get(id), { ...original, reservation_status: "cancelled" });
      assert.equal(writes.length, 1);
      assert.match(writes[0].sql, /^UPDATE reservations SET reservation_status = \? WHERE/);
    });
  }
  test(`${prefix}: retrying an unchanged pre-check-in status does not write`, async () => {
    assert.equal((await request(endpoint(106), { status: "approved" })).status, 200);
    assert.equal(writes.length, 0);
  });
  test(`${prefix}: invalid IDs and status are rejected without reservation writes`, async () => {
    for (const id of [0, -1, 1.5, "bad-id"]) {
      assert.equal((await request(endpoint(id), { status: "cancelled" })).status, 400);
    }
    assert.equal((await request(endpoint(101), { status: "checked_in" })).status, 400);
    assert.equal(writes.length, 0);
  });
  test(`${prefix}: missing reservation returns 404`, async () => {
    assert.equal((await request(endpoint(999), { status: "cancelled" })).status, 404);
    assert.equal(writes.length, 0);
  });
  for (const change of ["check-in", "completion"]) {
    test(`${prefix}: concurrent ${change} cannot be overwritten`, async () => {
      concurrentChange = change;
      const result = await request(endpoint(106), { status: "cancelled" });
      assert.equal(result.status, 409);
      assert.equal(result.body.code, "RESERVATION_CHANGED");
      assert.equal(writes.length, 0);
      assert.notEqual(reservations.get(106).reservation_status, "cancelled");
    });
  }
}

for (const suffix of ["101/mark-paid", "101"]) {
  const endpoint = `/api/admin/payments/${suffix}`;
  for (const [name, token, expected] of [
    ["missing", null, 401], ["fake", "adm1.invalid.signature", 401],
    ["Front Desk", frontDeskToken, 401], ["Admin", adminToken, 410],
  ]) {
    test(`legacy payment ${suffix}: ${name} caller cannot write payment state`, async () => {
      const result = await request(endpoint, { payment_status: "paid" }, token);
      assert.equal(result.status, expected);
      if (expected === 410) assert.equal(result.body.code, "LEGACY_ADMIN_PAYMENT_ENDPOINT_RETIRED");
      assert.equal(queries.filter(({ sql }) => !/FROM users/.test(sql)).length, 0);
      assert.equal(writes.length, 0);
    });
  }
}
