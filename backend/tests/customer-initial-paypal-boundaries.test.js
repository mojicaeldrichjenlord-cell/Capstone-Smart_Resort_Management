// Customer reservation creation + initial PayPal authorization.
// Uses stubbed booking and PayPal controllers and a fake users/reservations DB.
// NO real MySQL, PayPal API, payments, or reservation modifications.
// Run from backend: node --test tests/customer-initial-paypal-boundaries.test.js
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const Module = require("node:module");
const fs = require("node:fs");
const path = require("node:path");
const { test, before, beforeEach, after } = require("node:test");

let account, reservation, dbReads, handlers;
function replaceModule(moduleName, exportsObject) {
  const filename = require.resolve(moduleName);
  const entry = new Module(filename);
  entry.filename = filename;
  entry.loaded = true;
  entry.exports = exportsObject;
  require.cache[filename] = entry;
}
replaceModule("../config/db", {
  promise() {
    return {
      async query(query, params = []) {
        const sql = String(query).replace(/\s+/g, " ").trim();
        dbReads.push({ sql, params });
        if (/\bFROM users\b/i.test(sql)) {
          return [Number(params[0]) === account.id ? [{ ...account }] : []];
        }
        if (/FROM reservations WHERE id = \? LIMIT 1/i.test(sql)) {
          return [Number(params[0]) === reservation.id ? [{ ...reservation }] : []];
        }
        throw new Error("No write SQL permitted in isolated test: " + sql);
      },
    };
  },
});
const reply = name => (req, res) => {
  handlers.push({
    name,
    customerId: req.customerUser?.id,
    viewer: req.receiptViewer ? { ...req.receiptViewer } : null,
    suppliedUserId: req.body?.user_id,
  });
  return res.status(name === "createBooking" ? 201 : 200).json({
    success: true,
    handler: name,
    authenticatedCustomerId: req.customerUser?.id || null,
  });
};
replaceModule("../controllers/shared/bookingController", Object.fromEntries([
  "createBooking", "createWalkInBooking", "getUserBookings",
  "cancelBooking", "getBookingReceipt", "getAllBookings",
  "updateBookingStatus", "updatePaymentStatus",
  "addAccommodationToReservation", "extendReservationItem",
  "checkItemAvailability", "requestBookingModification",
].map(name => [name, reply(name)])));
replaceModule("../controllers/frontdesk/frontdeskCheckInController",
  { checkInBooking: reply("checkInBooking") });
replaceModule("../controllers/shared/bookingChargeController",
  Object.fromEntries(["getBookingCharges", "addBookingCharge",
    "markBookingChargesPaid", "deleteBookingCharge"].map(n => [n, reply(n)])));
replaceModule("../controllers/shared/bookingDiscountController",
  Object.fromEntries(["getBookingDiscount", "upsertBookingDiscount",
    "deleteBookingDiscount", "reconcileEntranceOverpayment"].map(n => [n, reply(n)])));
replaceModule("../controllers/shared/paypalPaymentController", {
  getPayPalClientConfig: reply("getPayPalClientConfig"),
  createOrderForReservation: reply("createOrderForReservation"),
  captureOrderForReservation: reply("captureOrderForReservation"),
});

process.env.FRONTDESK_TOKEN_SECRET = crypto.randomBytes(48).toString("base64url");
// Consistent synthetic bcrypt hash for signed staff tokens in mock DB users.
const STAFF_TEST_HASH = require("./helpers/staffPasswordFixture");
const express = require("express");
const { issueCustomerToken } = require("../middleware/customerAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const { issueAdminToken } = require("../middleware/adminAuth");
const tokens = {
  customer: issueCustomerToken(1),
  frontdesk: issueFrontDeskToken(1, STAFF_TEST_HASH),
  admin: issueAdminToken(1),
};
const app = express();
app.use(express.json());
app.use("/api/bookings", require("../routes/bookingRoutes"));
app.use("/api/paypal", require("../routes/paypalRoutes"));
let server, base;

before(async () => {
  server = await new Promise(resolve => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
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
  account = { password: STAFF_TEST_HASH, id: 1, role: "customer", account_status: "active", is_verified: 1 };
  reservation = { id: 101, user_id: 1, booking_source: "online" };
  dbReads = [];
  handlers = [];
});
async function send(endpoint, token, body = {}) {
  const result = await fetch(base + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  return { status: result.status, data: await result.json() };
}

for (const [name, token] of [
  ["anonymous", null],
  ["forged Customer", "cus1.invalid.signature"],
  ["Admin", tokens.admin],
  ["Front Desk", tokens.frontdesk],
]) {
  test("Online booking creation blocks " + name + " before saving proof or booking", async () => {
    account.role = name === "Admin" ? "admin" :
      name === "Front Desk" ? "frontdesk" : "customer";
    const response = await send("/api/bookings", token, { user_id: 999 });
    assert.equal(response.status, 401);
    assert.equal(handlers.length, 0);
    assert.equal(dbReads.length, 0);
  });
}
test("Signed Customer may reach online booking creation with verified account ID", async () => {
  const response = await send("/api/bookings", tokens.customer, { user_id: 999 });
  assert.equal(response.status, 201);
  assert.equal(response.data.authenticatedCustomerId, 1);
  assert.equal(handlers[0].customerId, 1);
});
test("Controller enforces token-derived user ID rather than browser body user_id", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../controllers/shared/bookingController.js"), "utf8");
  const begin = source.indexOf("exports.createBooking = async (req, res) => {");
  const end = source.indexOf("exports.createWalkInBooking", begin);
  assert.ok(begin >= 0 && end > begin);
  const section = source.slice(begin, end);
  assert.match(section, /const user_id = Number\(req\.customerUser\?\.id\)/);
  assert.match(section, /body: \{ \.\.\.parsedBody, user_id \}/);
  assert.doesNotMatch(section, /Number\(parsedBody\.user_id\)/);
});

const endpoints = [
  "/api/paypal/reservations/101/order",
  "/api/paypal/reservations/101/capture",
];
for (const endpoint of endpoints) {
  test(endpoint + " blocks anonymous calls without lookup", async () => {
    assert.equal((await send(endpoint, null)).status, 401);
    assert.equal(dbReads.length, 0);
    assert.equal(handlers.length, 0);
  });
  test(endpoint + " blocks forged tokens without lookup", async () => {
    assert.equal((await send(endpoint, "cus1.invalid.signature")).status, 401);
    assert.equal(dbReads.length, 0);
    assert.equal(handlers.length, 0);
  });
  test(endpoint + " allows owning Customer for online booking", async () => {
    const result = await send(endpoint, tokens.customer);
    assert.equal(result.status, 200);
    assert.equal(result.data.success, true);
    assert.equal(handlers.length, 1);
    assert.equal(handlers[0].viewer.role, "customer");
  });
  test(endpoint + " blocks different Customer before PayPal handler", async () => {
    reservation.user_id = 2;
    assert.equal((await send(endpoint, tokens.customer)).status, 404);
    assert.equal(handlers.length, 0);
  });
  test(endpoint + " blocks Customer on manual reservation", async () => {
    reservation.booking_source = "manual";
    assert.equal((await send(endpoint, tokens.customer)).status, 404);
    assert.equal(handlers.length, 0);
  });
  test(endpoint + " allows verified Front Desk on manual reservation", async () => {
    account.role = "frontdesk";
    reservation.booking_source = "manual";
    const result = await send(endpoint, tokens.frontdesk);
    assert.equal(result.status, 200);
    assert.equal(handlers[0].viewer.role, "frontdesk");
  });
  test(endpoint + " blocks Front Desk for Customer online reservation", async () => {
    account.role = "frontdesk";
    assert.equal((await send(endpoint, tokens.frontdesk)).status, 404);
    assert.equal(handlers.length, 0);
  });
  test(endpoint + " blocks Admin financial actions", async () => {
    account.role = "admin";
    reservation.booking_source = "manual";
    assert.equal((await send(endpoint, tokens.admin)).status, 404);
    assert.equal(handlers.length, 0);
  });
  test(endpoint + " blocks disabled Customer account", async () => {
    account.account_status = "disabled";
    assert.equal((await send(endpoint, tokens.customer)).status, 403);
    assert.equal(handlers.length, 0);
  });
  test(endpoint + " rejects nonexistent reservation", async () => {
    const result = await send(endpoint.replace("/101/", "/999/"), tokens.customer);
    assert.equal(result.status, 404);
    assert.equal(handlers.length, 0);
  });
}
test("Public PayPal client config remains accessible", async () => {
  const response = await fetch(base + "/api/paypal/config");
  assert.equal(response.status, 200);
  assert.equal(handlers[0].name, "getPayPalClientConfig");
  assert.equal(dbReads.length, 0);
});
