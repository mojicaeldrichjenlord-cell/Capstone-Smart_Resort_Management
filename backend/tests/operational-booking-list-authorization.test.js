// Operational booking-list access regression tests; DB/invoice/PayPal safe.
// All route controllers are stubs; only the signed-auth middleware queries
// in-memory fake users. No real reservation records are accessed.
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");
const { test, before, beforeEach, after } = require("node:test");

let account;
let queries = [];
let invoked = [];
function mock(relativePath, exportsObject) {
  const filename = require.resolve(relativePath);
  const entry = new Module(filename);
  entry.filename = filename;
  entry.loaded = true;
  entry.exports = exportsObject;
  require.cache[filename] = entry;
}
mock("../config/db", {
  promise() {
    return {
      async query(sql, params) {
        const query = String(sql).replace(/\s+/g, " ").trim();
        queries.push({ query, params });
        if (!/\bFROM users\b/i.test(query)) {
          throw new Error("Unexpected database query in isolated listing test.");
        }
        return [Number(params[0]) === 1 && account ? [{ ...account }] : []];
      },
    };
  },
});
const stub = name => (req, res) => {
  invoked.push(name);
  return res.json({ success: true, bookings: [], source: name });
};
mock("../controllers/shared/bookingController", Object.fromEntries([
  "createBooking", "createWalkInBooking", "getUserBookings",
  "cancelBooking", "getBookingReceipt", "getAllBookings",
  "updateBookingStatus", "updatePaymentStatus",
  "addAccommodationToReservation", "extendReservationItem",
  "checkItemAvailability", "requestBookingModification",
].map(name => [name, stub(name)])));
mock("../controllers/frontdesk/frontdeskCheckInController",
  { checkInBooking: stub("checkInBooking") });
mock("../controllers/shared/bookingChargeController",
  Object.fromEntries([
    "getBookingCharges", "addBookingCharge", "markBookingChargesPaid",
    "deleteBookingCharge",
  ].map(name => [name, stub(name)])));
mock("../controllers/shared/bookingDiscountController",
  Object.fromEntries([
    "getBookingDiscount", "upsertBookingDiscount",
    "deleteBookingDiscount", "reconcileEntranceOverpayment",
  ].map(name => [name, stub(name)])));
mock("../controllers/admin/adminBookingController", {
  getAllAdminBookings: stub("getAllAdminBookings"),
  updateAdminBookingStatus: stub("updateAdminBookingStatus"),
});
for (const [filepath, methods] of [
  ["../controllers/frontdesk/frontdeskGuestAdjustmentController", ["updateGuestAdjustment"]],
  ["../controllers/frontdesk/frontdeskExtraBedController", ["getExtraBedSummary","updateExtraBed","collectExtraBedFee"]],
  ["../controllers/frontdesk/frontdeskAdditionalChargeController", ["getAdditionalCharges","addAdditionalCharge","deleteAdditionalCharge"]],
  ["../controllers/frontdesk/frontdeskUnpaidChargeController", ["getUnpaidChargesSummary","collectUnpaidCharges"]],
  ["../controllers/frontdesk/frontdeskAccommodationBalanceController", ["getAccommodationBalanceSummary","collectAccommodationBalance","createAccommodationBalancePayPalOrder","captureAccommodationBalancePayPalOrder"]],
  ["../controllers/frontdesk/frontdeskCheckoutController", ["getCheckoutSummary","completeCheckout"]],
]) {
  mock(filepath, Object.fromEntries(methods.map(name => [name, stub(name)])));
}

process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");
const { issueAdminToken } = require("../middleware/adminAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const { issueCustomerToken } = require("../middleware/customerAuth");
const tokens = {
  admin: issueAdminToken(1),
  frontdesk: issueFrontDeskToken(1),
  customer: issueCustomerToken(1),
};
const express = require("express");
const app = express();
app.use(express.json());
app.use("/api/bookings", require("../routes/bookingRoutes"));
app.use("/api/admin/bookings", require("../routes/adminBookingRoutes"));
let server;
let baseUrl;

before(async () => {
  server = await new Promise(resolve => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  baseUrl = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
beforeEach(() => {
  account = { id: 1, role: "admin", account_status: "active", is_verified: 1 };
  queries = [];
  invoked = [];
});
async function listing(endpoint, token) {
  const response = await fetch(baseUrl + endpoint, {
    headers: token ? { Authorization: "Bearer " + token } : {},
    signal: AbortSignal.timeout(5000),
  });
  return { status: response.status, result: await response.json() };
}

for (const [route, expected] of [
  ["/api/bookings?scope=all", "getAllBookings"],
  ["/api/admin/bookings", "getAllAdminBookings"],
]) {
  test(route + " blocks unauthenticated access without any DB query", async () => {
    assert.equal((await listing(route)).status, 401);
    assert.deepEqual(invoked, []);
    assert.equal(queries.length, 0);
  });
  test(route + " blocks a forged token before any DB query", async () => {
    assert.equal((await listing(route, "adm1.fake.token")).status, 401);
    assert.deepEqual(invoked, []);
    assert.equal(queries.length, 0);
  });
  test(route + " blocks a valid Customer token", async () => {
    account.role = "customer";
    assert.equal((await listing(route, tokens.customer)).status, 403);
    assert.deepEqual(invoked, []);
  });
  test(route + " permits verified Admin", async () => {
    const result = await listing(route, tokens.admin);
    assert.equal(result.status, 200);
    assert.equal(result.result.source, expected);
    assert.deepEqual(invoked, [expected]);
  });
  test(route + " permits verified Front Desk", async () => {
    account.role = "frontdesk";
    const result = await listing(route, tokens.frontdesk);
    assert.equal(result.status, 200);
    assert.equal(result.result.source, expected);
    assert.deepEqual(invoked, [expected]);
  });
  test(route + " permits verified legacy staff", async () => {
    account.role = "staff";
    const result = await listing(route, tokens.frontdesk);
    assert.equal(result.status, 200);
    assert.equal(result.result.source, expected);
    assert.deepEqual(invoked, [expected]);
  });
  test(route + " cannot bypass changed account role with old Admin token", async () => {
    account.role = "customer";
    assert.equal((await listing(route, tokens.admin)).status, 403);
    assert.deepEqual(invoked, []);
  });
  test(route + " rejects disabled Admin", async () => {
    account.account_status = "disabled";
    assert.equal((await listing(route, tokens.admin)).status, 403);
    assert.deepEqual(invoked, []);
  });
  test(route + " rejects unverified Admin", async () => {
    account.is_verified = 0;
    assert.equal((await listing(route, tokens.admin)).status, 403);
    assert.deepEqual(invoked, []);
  });
}
