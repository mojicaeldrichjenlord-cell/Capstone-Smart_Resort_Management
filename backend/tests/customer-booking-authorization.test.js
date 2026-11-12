// Customer reservation authorization tests using real Express routes,
// signed tokens and an in-memory database. No Aiven or PayPal calls.
// Run from backend: node --test tests/customer-booking-authorization.test.js
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");
const { test, before, beforeEach, after } = require("node:test");

let user;
let reservation;
let queries = [];
let writes = [];
let changeDuringUpdate = false;

function replaceModule(relativePath, exportsObject) {
  const filename = require.resolve(relativePath);
  const moduleEntry = new Module(filename);
  moduleEntry.filename = filename;
  moduleEntry.loaded = true;
  moduleEntry.exports = exportsObject;
  require.cache[filename] = moduleEntry;
}

const fakeDb = {
  promise() {
    return {
      async query(statement, params) {
        const sql = String(statement).replace(/\s+/g, " ").trim();
        queries.push({ sql, params });
        if (/\bFROM users\b/i.test(sql)) {
          return [Number(params[0]) === 1 ? [{ ...user }] : []];
        }
        if (/\bFROM reservations r\b/i.test(sql) &&
            /\bWHERE r\.id = \? AND r\.user_id = \?/i.test(sql)) {
          const [id, owner] = params;
          return [Number(id) === reservation.id && Number(owner) === reservation.user_id
            ? [{ ...reservation }] : []];
        }
        if (/\bFROM reservations r\b/i.test(sql) &&
            /WHERE r\.user_id = \?/i.test(sql)) {
          // My Bookings list uses a customer-owner filter.
          return [[]];
        }
        if (/^UPDATE reservations SET reservation_status = 'cancelled'/i.test(sql)) {
          const [id, owner, oldStatus] = params;
          assert.match(sql, /AND user_id = \?/i);
          assert.match(sql, /COALESCE\(is_checked_in, 0\) = 0/i);
          assert.match(sql, /AND reservation_status = \?/i);
          if (changeDuringUpdate) reservation.is_checked_in = 1;
          if (Number(id) !== reservation.id ||
              Number(owner) !== reservation.user_id ||
              reservation.is_checked_in !== 0 ||
              reservation.reservation_status !== oldStatus) {
            return [{ affectedRows: 0 }];
          }
          reservation.reservation_status = "cancelled";
          writes.push({ sql, params });
          return [{ affectedRows: 1 }];
        }
        throw new Error("Unexpected SQL in isolated test: " + sql);
      },
      async getConnection() {
        // The modification handler acquires a transaction before looking up
        // ownership. The fake connection must still forbid any real writes.
        return {
          async beginTransaction() {},
          async query(statement, params) {
            return fakeDb.promise().query(statement, params);
          },
          async rollback() {},
          async commit() {
            throw new Error("Authorization probes must never commit.");
          },
          release() {}
        };
      }
    };
  }
};
replaceModule("../config/db", fakeDb);
const denyPayPal = () => { throw new Error("PayPal must not be invoked"); };
replaceModule("../services/paypalService", {
  createPayPalOrder: denyPayPal,
  capturePayPalOrder: denyPayPal,
  getPayPalOrder: denyPayPal
});
process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");
// Consistent synthetic bcrypt hash for signed staff tokens in mock DB users.
const STAFF_TEST_HASH = require("./helpers/staffPasswordFixture");

const express = require("express");
const { issueCustomerToken } = require("../middleware/customerAuth");
const { issueAdminToken } = require("../middleware/adminAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");

const validCustomer = issueCustomerToken(1);
const validAdmin = issueAdminToken(1);
const validFrontDesk = issueFrontDeskToken(1, STAFF_TEST_HASH);
const app = express();
app.use(express.json());
app.use("/api/bookings", require("../routes/bookingRoutes"));
let server;
let baseUrl;
before(async () => {
  server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  baseUrl = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  if (server) await new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  });
});
beforeEach(() => {
  user = { password: STAFF_TEST_HASH, id: 1, role: "customer", account_status: "active", is_verified: 1 };
  reservation = {
    id: 101, user_id: 1, reservation_status: "pending",
    is_checked_in: 0, check_in_date: "2099-03-01",
    accommodation_total: 1000, paid_amount: 500,
    remaining_balance: 500, required_downpayment: 500
  };
  queries = [];
  writes = [];
  changeDuringUpdate = false;
});

async function request(path, method, token, body) {
  const response = await fetch(baseUrl + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(5000)
  });
  return { status: response.status, data: await response.json() };
}
const cancel = (token = validCustomer, id = 101) =>
  request("/api/bookings/" + id + "/cancel", "PUT", token);
const modify = (token, id = 101, body = {}) =>
  request("/api/bookings/" + id + "/modification-request",
    "POST", token, { requested_note: "new note", ...body });

for (const [name, token] of [
  ["missing", null],
  ["fake", "cus1.invalid.signature"],
  ["Admin", validAdmin],
  ["Front Desk", validFrontDesk]
]) {
  test(name + " token cannot cancel a customer reservation", async () => {
    const out = await cancel(token);
    assert.equal(out.status, 401);
    assert.equal(writes.length, 0);
    assert.equal(queries.length, 0);
  });
}
test("signed customer token cannot bypass changed Admin role", async () => {
  user.role = "admin";
  assert.equal((await cancel()).status, 403);
  assert.equal(writes.length, 0);
});
test("signed customer with disabled account is forbidden", async () => {
  user.account_status = "disabled";
  assert.equal((await cancel()).status, 403);
  assert.equal(writes.length, 0);
});
test("unverified customer is forbidden", async () => {
  user.is_verified = 0;
  assert.equal((await cancel()).status, 403);
  assert.equal(writes.length, 0);
});
test("customer cannot cancel another account's reservation", async () => {
  reservation.user_id = 2;
  assert.equal((await cancel()).status, 404);
  assert.equal(writes.length, 0);
  const lookup = queries.find((entry) => /FROM reservations r/.test(entry.sql));
  assert.deepEqual(lookup.params, [101, 1]);
});
test("checked-in reservation cannot be cancelled", async () => {
  reservation.is_checked_in = 1;
  assert.equal((await cancel()).status, 409);
  assert.equal(writes.length, 0);
});
test("completed reservation cannot be cancelled", async () => {
  reservation.reservation_status = "completed";
  assert.equal((await cancel()).status, 400);
  assert.equal(writes.length, 0);
});
test("customer cannot cancel without advance notice", async () => {
  reservation.check_in_date = "2020-01-01";
  assert.equal((await cancel()).status, 400);
  assert.equal(writes.length, 0);
});
test("valid own cancellation changes status only, not financial totals", async () => {
  const before = { ...reservation };
  assert.equal((await cancel()).status, 200);
  assert.deepEqual(reservation, { ...before, reservation_status: "cancelled" });
  assert.equal(writes.length, 1);
});
test("concurrent check-in prevents cancellation", async () => {
  changeDuringUpdate = true;
  const out = await cancel();
  assert.equal(out.status, 409);
  assert.equal(writes.length, 0);
});
test("invalid reservation ID cannot be cancelled", async () => {
  assert.equal((await cancel(validCustomer, 0)).status, 400);
  assert.equal(writes.length, 0);
});
test("missing token cannot modify a reservation", async () => {
  assert.equal((await modify(null)).status, 401);
  assert.equal(queries.length, 0);
});
test("spoofed body user_id cannot target someone else's booking", async () => {
  reservation.user_id = 2;
  const out = await modify(validCustomer, 101, { user_id: 2 });
  assert.equal(out.status, 404);
  assert.equal(writes.length, 0);
  const lookup = queries.find((entry) => /FROM reservations r/.test(entry.sql));
  assert.deepEqual(lookup.params, [101, 1]);
});

test("anonymous caller cannot list Customer bookings", async () => {
  const out = await request("/api/bookings/user/1", "GET", null);
  assert.equal(out.status, 401);
  assert.equal(queries.length, 0);
});
test("Customer cannot list another account's bookings", async () => {
  const out = await request("/api/bookings/user/2", "GET", validCustomer);
  assert.equal(out.status, 403);
  assert.equal(writes.length, 0);
  assert.equal(queries.filter((entry) => /FROM reservations r/.test(entry.sql)).length, 0);
});
test("Customer can list their own bookings", async () => {
  const out = await request("/api/bookings/user/1", "GET", validCustomer);
  assert.equal(out.status, 200);
  assert.deepEqual(out.data.bookings, []);
  const listSql = queries.find((entry) => /WHERE r.user_id = \?/i.test(entry.sql));
  assert.deepEqual(listSql.params, ["1"]);
});
