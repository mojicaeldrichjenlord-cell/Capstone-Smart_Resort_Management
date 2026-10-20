// Signed receipt authorization checks against real Express booking routes.
// All DB responses are in memory; no Aiven connection and no PayPal calls.
// Run from backend: node --test tests/receipt-access-boundaries.test.js
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");
const { before, beforeEach, after, test } = require("node:test");

let account;
let booking;
let calls;
const replaceModule = (relativePath, exportsValue) => {
  const filename = require.resolve(relativePath);
  const entry = new Module(filename);
  entry.filename = filename;
  entry.loaded = true;
  entry.exports = exportsValue;
  require.cache[filename] = entry;
};

const fakeDb = {
  promise() {
    return {
      async query(statement, params) {
        const sql = String(statement).replace(/\s+/g, " ").trim();
        calls.push({ sql, params });
        if (/FROM users\b/i.test(sql)) {
          return [account && Number(params[0]) === Number(account.id)
            ? [{ ...account }] : []];
        }
        if (/FROM reservations r\b/i.test(sql)) {
          return [booking && Number(params[0]) === Number(booking.id)
            ? [{ ...booking }] : []];
        }
        if (/FROM reservation_items ri\b/i.test(sql)) return [[]];
        if (/FROM booking_charges\b/i.test(sql)) return [[]];
        if (/FROM booking_discounts\b/i.test(sql)) return [[]];
        if (/FROM entrance_fee_reconciliations\b/i.test(sql)) return [[]];
        throw new Error("Unexpected SQL in receipt test: " + sql);
      },
      async getConnection() {
        throw new Error("Receipt access must not start write transactions.");
      }
    };
  }
};
replaceModule("../config/db", fakeDb);
const noPayPal = () => { throw new Error("PayPal is forbidden in receipt tests."); };
replaceModule("../services/paypalService", {
  createPayPalOrder: noPayPal, capturePayPalOrder: noPayPal,
  getPayPalOrder: noPayPal
});
process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");
// Mock users and signed staff test tokens share one stable bcrypt hash.
const STAFF_TEST_HASH = require("./helpers/staffPasswordFixture");

const express = require("express");
const { issueCustomerToken } = require("../middleware/customerAuth");
const { issueAdminToken } = require("../middleware/adminAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const tokenCustomer = issueCustomerToken(1);
const tokenAdmin = issueAdminToken(1);
const tokenFrontDesk = issueFrontDeskToken(1, STAFF_TEST_HASH);
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
  if (server) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
beforeEach(() => {
  calls = [];
  account = { password: STAFF_TEST_HASH, id: 1, role: "customer", account_status: "active", is_verified: 1 };
  booking = {
    id: 101, user_id: 1, reservation_code: "MOCK-101",
    first_name: "Test", last_name: "Customer", contact_no: "00000000000",
    guest_count: 2, actual_guest_count: 2,
    accommodation_total: 1000, required_downpayment: 500,
    paid_amount: 500, remaining_balance: 500,
    estimated_entrance_fee: 0, entrance_fee_collected: 0,
    note: "", payment_status: "partially_paid",
    status: "approved", check_in_date: "2099-03-01"
  };
});

async function receipt(token, id = 101) {
  const res = await fetch(baseUrl + "/api/bookings/" + id + "/receipt", {
    headers: token ? { Authorization: "Bearer " + token } : {},
    signal: AbortSignal.timeout(5000)
  });
  return { status: res.status, data: await res.json() };
}
const receiptReads = () => calls.filter((call) =>
  /FROM reservations r\b|FROM reservation_items ri\b|FROM booking_charges\b|FROM booking_discounts\b|FROM entrance_fee_reconciliations\b/.test(call.sql)
);
// The initial receipt summary SELECT joins reservation_items inside a
// subquery. That is still ONE ownership-check SELECT, not a follow-up read.
// Only count separate detail/financial queries issued after authorization.
const sensitiveReads = () => calls.filter((call) =>
  !/\bFROM reservations r\b/i.test(call.sql) &&
  /\bFROM reservation_items ri\b|\bFROM booking_charges\b|\bFROM booking_discounts\b|\bFROM entrance_fee_reconciliations\b/i.test(call.sql)
);
const ensureNoWrite = () => {
  assert.equal(calls.some((call) => /^(UPDATE|DELETE|INSERT|REPLACE|CREATE|DROP)\b/i.test(call.sql)), false);
};

test("no token gets 401 without any DB lookup", async () => {
  assert.equal((await receipt(null)).status, 401);
  assert.equal(calls.length, 0);
});
test("fake Customer token gets 401 before any DB lookup", async () => {
  assert.equal((await receipt("cus1.fake.token")).status, 401);
  assert.equal(calls.length, 0);
});
test("unknown token prefix gets 401", async () => {
  assert.equal((await receipt("other.fake.token")).status, 401);
  assert.equal(calls.length, 0);
});
test("signed Customer cannot impersonate Admin after DB role change", async () => {
  account.role = "admin";
  assert.equal((await receipt(tokenCustomer)).status, 403);
  assert.equal(receiptReads().length, 0);
});
test("signed Admin cannot impersonate Customer account", async () => {
  assert.equal((await receipt(tokenAdmin)).status, 403);
  assert.equal(receiptReads().length, 0);
});
test("signed Front Desk cannot impersonate Customer account", async () => {
  assert.equal((await receipt(tokenFrontDesk)).status, 403);
  assert.equal(receiptReads().length, 0);
});
test("disabled Customer cannot read receipts", async () => {
  account.account_status = "disabled";
  assert.equal((await receipt(tokenCustomer)).status, 403);
  assert.equal(receiptReads().length, 0);
});
test("unverified Customer cannot read receipts", async () => {
  account.is_verified = 0;
  assert.equal((await receipt(tokenCustomer)).status, 403);
  assert.equal(receiptReads().length, 0);
});
test("Customer cannot view another Customer receipt", async () => {
  booking.user_id = 2;
  assert.equal((await receipt(tokenCustomer)).status, 404);
  assert.equal(receiptReads().length, 1);
  assert.equal(sensitiveReads().length, 0);
  ensureNoWrite();
});
test("Customer cannot view a manual booking without a Customer owner", async () => {
  booking.user_id = null;
  assert.equal((await receipt(tokenCustomer)).status, 404);
  assert.equal(sensitiveReads().length, 0);
});
test("Customer can view own receipt", async () => {
  const result = await receipt(tokenCustomer);
  assert.equal(result.status, 200);
  assert.equal(result.data.booking.id, 101);
  assert.equal(result.data.booking.user_id, 1);
  ensureNoWrite();
});
test("verified Admin can view operational receipt", async () => {
  account.role = "admin";
  booking.user_id = null; // manual reservation
  const result = await receipt(tokenAdmin);
  assert.equal(result.status, 200);
  assert.equal(result.data.booking.id, 101);
  ensureNoWrite();
});
test("verified Front Desk can view operational receipt", async () => {
  account.role = "frontdesk";
  booking.user_id = null;
  const result = await receipt(tokenFrontDesk);
  assert.equal(result.status, 200);
  assert.equal(result.data.booking.id, 101);
  ensureNoWrite();
});
test("legacy staff Front Desk role still permitted after verification", async () => {
  account.role = "staff";
  const result = await receipt(tokenFrontDesk);
  assert.equal(result.status, 200);
  ensureNoWrite();
});
test("missing reservation returns 404 without sensitive follow-up reads", async () => {
  booking = null;
  assert.equal((await receipt(tokenCustomer)).status, 404);
  assert.equal(sensitiveReads().length, 0);
});
