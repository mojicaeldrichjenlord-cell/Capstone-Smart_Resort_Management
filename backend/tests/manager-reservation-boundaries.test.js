// Manager Reservations permissions and concurrency tests. Fully mocked DB:
// NO real Aiven, PayPal, or reservation modifications.
const assert = require("node:assert/strict");
const { test, before, beforeEach, after } = require("node:test");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");
const express = require("express");

let user, reservation, queries, forcedConcurrentFailure, simulatedInvalidEnum;
const sqlDb = {
  promise() {
    return {
      async query(sql, params = []) {
        const normalized = String(sql).replace(/\s+/g, " ").trim();
        queries.push({ sql: normalized, params });
        if (/\bFROM users\b/i.test(normalized)) {
          return [user && Number(params[0]) === user.id ? [{ ...user }] : []];
        }
        if (/^SELECT\b/i.test(normalized) && /\bFROM reservations r\b/i.test(normalized)) {
          return [[{
            id: reservation.id, reservation_code: reservation.code,
            booking_source: "online", first_name: "Example", last_name: "Guest",
            guest_count: 4, reservation_status: reservation.status,
            status: reservation.status,
            payment_status: "partial",
            is_checked_in: reservation.is_checked_in,
            created_at: "2026-10-10",
            accommodation_name: "Family Cottage",
            check_in_date: "2026-11-10", check_out_date: "2026-11-11",
            check_in_time: "07:00:00", check_out_time: "17:00:00",
            email: "PRIVATE@example.invalid",
            contact_no: "PRIVATE_PHONE",
            proof_image_data: "PRIVATE_PROOF",
          }]];
        }
        if (/^SELECT\b/i.test(normalized) &&
            /\bFROM reservations WHERE id = \? LIMIT 1\b/i.test(normalized)) {
          return [Number(params[0]) === reservation.id ? [{
            id: reservation.id, reservation_status: reservation.status,
            is_checked_in: reservation.is_checked_in,
          }] : []];
        }
        if (/^UPDATE reservations SET reservation_status = \?/i.test(normalized)) {
          assert.deepEqual(params.slice(1), [reservation.id]);
          if (simulatedInvalidEnum && params[0] === "rejected") {
            const error = new Error("Data truncated for column 'reservation_status' at row 1");
            error.code = "WARN_DATA_TRUNCATED";
            error.errno = 1265;
            throw error;
          }
          if (forcedConcurrentFailure) {
            return [{ affectedRows: 0 }];
          }
          if (reservation.status !== "pending" || reservation.is_checked_in !== 0) {
            return [{ affectedRows: 0 }];
          }
          reservation.status = params[0];
          return [{ affectedRows: 1 }];
        }
        if (/\bFROM reservations\b/i.test(normalized)) {
          return [[{
            total_reservations: 1, pending_reservations: 1,
            approved_reservations: 0, guests_inside: 0,
            completed_reservations: 0, recorded_reservation_payments: 0,
          }]];
        }
        if (/\bFROM accommodations\b/i.test(normalized)) {
          return [[{ total_accommodations: 61, listed_available: 61 }]];
        }
        throw new Error("Unexpected mock SQL: " + normalized);
      }
    };
  }
};
function mock(relativePath, exported) {
  const filename = require.resolve(relativePath);
  const instance = new Module(filename);
  instance.filename = filename;
  instance.loaded = true;
  instance.exports = exported;
  require.cache[filename] = instance;
}
mock("../config/db", sqlDb);
process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");
// Mock users and signed staff test tokens share one stable bcrypt hash.
const STAFF_TEST_HASH = require("./helpers/staffPasswordFixture");
const { issueManagerToken } = require("../middleware/managerAuth");
const { issueAdminToken, requireAdminAuth } = require("../middleware/adminAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const { issueCustomerToken } = require("../middleware/customerAuth");
const valid = issueManagerToken(1, STAFF_TEST_HASH);
const others = {
  admin: issueAdminToken(1),
  frontdesk: issueFrontDeskToken(1, STAFF_TEST_HASH),
  customer: issueCustomerToken(1),
};

const app = express();
app.use(express.json());
app.use("/api/manager", require("../routes/managerRoutes"));
app.put("/api/admin-only", requireAdminAuth, (_req, res) => res.json({ success: true }));
let server, url;
before(async () => {
  server = await new Promise(resolve => {
    const handle = app.listen(0, "127.0.0.1", () => resolve(handle));
  });
  url = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
beforeEach(() => {
  user = { password: STAFF_TEST_HASH,
    id: 1, role: "manager", account_status: "active", is_verified: 1,
    fullname: "Manager", email: "manager@example.invalid",
  };
  reservation = {
    id: 25, code: "RES-25", status: "pending", is_checked_in: 0,
  };
  queries = [];
  forcedConcurrentFailure = false;
  simulatedInvalidEnum = false;
});

async function call(path, { token = valid, method = "GET", body } = {}) {
  const result = await fetch(url + path, {
    method,
    headers: {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(5000),
  });
  return { code: result.status, data: await result.json() };
}
const list = (opts = {}) => call("/api/manager/reservations", opts);
const change = (status, opts = {}) => call("/api/manager/reservations/25/status", {
  method: "PUT", body: { status }, ...opts,
});
const writes = () => queries.filter(x => /^UPDATE\b/i.test(x.sql));

test("Manager can view limited reservation details with protected token", async () => {
  const response = await list();
  assert.equal(response.code, 200);
  assert.equal(response.data.reservations[0].reservation_code, "RES-25");
  assert.equal(response.data.reservations[0].guest_name, "Example Guest");
  assert.equal(response.data.reservations[0].accommodation, "Family Cottage");
  assert.equal(response.data.limit, 200);
  assert.doesNotMatch(JSON.stringify(response.data), /PRIVATE_/);
  assert.equal(writes().length, 0);
});
test("Manager search and status filter are parameterized, not interpolated", async () => {
  const response = await call("/api/manager/reservations?status=pending&search=RES-25");
  assert.equal(response.code, 200);
  const found = queries.find(x => /\bFROM reservations r\b/i.test(x.sql));
  assert.match(found.sql, /r.reservation_status = \?/);
  assert.match(found.sql, /r.reservation_code LIKE \?/);
  assert.ok(found.params.includes("pending"));
  assert.ok(found.params.includes("%RES-25%"));
  assert.doesNotMatch(found.sql, /RES-25/);
});
test("Manager list rejects unknown status before executing reservation SQL", async () => {
  const response = await call("/api/manager/reservations?status=hacked");
  assert.equal(response.code, 400);
  assert.equal(queries.filter(x => /FROM reservations r/.test(x.sql)).length, 0);
});
test("Manager list bounds search length before querying reservations", async () => {
  const response = await call("/api/manager/reservations?search=" + "X".repeat(81));
  assert.equal(response.code, 400);
  assert.equal(queries.filter(x => /FROM reservations r/.test(x.sql)).length, 0);
});
for (const path of [
  "/api/manager/reservations", "/api/manager/reservations/25/status",
]) {
  const method = path.endsWith("/status") ? "PUT" : "GET";
  const body = method === "PUT" ? { status: "approved" } : undefined;
  test(path + " rejects missing token before DB", async () => {
    const response = await call(path, { token: null, method, body });
    assert.equal(response.code, 401);
    assert.equal(queries.length, 0);
  });
  test(path + " rejects forged token before DB", async () => {
    const response = await call(path, { token: "mgr1.forged.invalid", method, body });
    assert.equal(response.code, 401);
    assert.equal(queries.length, 0);
  });
  for (const [role, token] of Object.entries(others)) {
    test(path + " rejects " + role + " token", async () => {
      const response = await call(path, { token, method, body });
      assert.equal(response.code, 401);
      assert.equal(queries.length, 0);
    });
  }
}
test("Active Manager can approve pending unchecked reservation", async () => {
  const response = await change("approved");
  assert.equal(response.code, 200);
  assert.equal(reservation.status, "approved");
  assert.equal(writes().length, 1);
  assert.match(writes()[0].sql, /reservation_status = 'pending'/);
  assert.match(writes()[0].sql, /COALESCE\(is_checked_in,0\) = 0/);
});
test("Active Manager can reject pending unchecked reservation", async () => {
  const response = await change("rejected");
  assert.equal(response.code, 200);
  assert.equal(reservation.status, "rejected");
  assert.equal(writes().length, 1);
});
for (const forbidden of ["completed", "cancelled", "paid", "pending", "checked-in"]) {
  test("Manager cannot set " + forbidden + " status", async () => {
    const response = await change(forbidden);
    assert.equal(response.code, 400);
    assert.equal(writes().length, 0);
  });
}
for (const previous of ["approved", "rejected", "cancelled", "completed"]) {
  test("Manager cannot change an already " + previous + " reservation", async () => {
    reservation.status = previous;
    const response = await change("approved");
    assert.equal(response.code, 409);
    assert.equal(writes().length, 0);
  });
}
test("Manager cannot approve checked-in reservation", async () => {
  reservation.is_checked_in = 1;
  const response = await change("approved");
  assert.equal(response.code, 409);
  assert.equal(writes().length, 0);
});
test("Concurrent reservation status update cannot be overwritten", async () => {
  forcedConcurrentFailure = true;
  const response = await change("approved");
  assert.equal(response.code, 409);
  assert.equal(response.data.code, "RESERVATION_CHANGED");
  assert.equal(reservation.status, "pending");
  assert.equal(writes().length, 1);
});
test("Invalid reservation ID is rejected before reservation query", async () => {
  const response = await call("/api/manager/reservations/not-a-number/status", {
    method: "PUT", body: { status: "approved" },
  });
  assert.equal(response.code, 400);
  assert.equal(writes().length, 0);
});
test("Disabled Manager cannot read or write reservations", async () => {
  user.account_status = "disabled";
  assert.equal((await list()).code, 403);
  assert.equal((await change("approved")).code, 403);
  assert.equal(writes().length, 0);
});
test("Unverified Manager cannot approve reservation", async () => {
  user.is_verified = 0;
  assert.equal((await change("approved")).code, 403);
  assert.equal(writes().length, 0);
});
test("Demoted Manager cannot approve reservation", async () => {
  user.role = "customer";
  assert.equal((await change("approved")).code, 403);
  assert.equal(writes().length, 0);
});
test("Manager token cannot invoke Admin-only route", async () => {
  assert.equal((await call("/api/admin-only", {
    method: "PUT", body: { status: "approved" },
  })).code, 401);
  assert.equal(writes().length, 0);
});
test("Frontend requires signed Manager token and does not render guest inputs as HTML", () => {
  const fs = require("node:fs"), path = require("node:path");
  const js = fs.readFileSync(path.resolve(
    __dirname, "../../frontend/managerJS/managerReservations.js"), "utf8");
  assert.match(js, /sessionStorage\.getItem\("managerToken"\)/);
  assert.match(js, /\/manager\//);
  assert.match(js, /textContent =/);
  assert.match(js, /window\.confirm\(/);
  assert.doesNotMatch(js, /innerHTML/);
});


test("Legacy schema without rejected ENUM returns actionable 409 and no status change", async () => {
  simulatedInvalidEnum = true;
  const response = await change("rejected");
  assert.equal(response.code, 409);
  assert.equal(response.data.code, "RESERVATION_STATUS_SCHEMA_MISMATCH");
  assert.match(response.data.message, /database.*status|database does not support/i);
  assert.equal(reservation.status, "pending");
  assert.equal(writes().length, 1);
});

test("Legacy schema still permits Manager approval, independent of rejection migration", async () => {
  simulatedInvalidEnum = true;
  const response = await change("approved");
  assert.equal(response.code, 200);
  assert.equal(reservation.status, "approved");
  assert.equal(writes().length, 1);
});

test("Rejection schema migration appends enum value without changing existing ordinal order", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const sourceSchema = fs.readFileSync(path.resolve(
    __dirname, "../../database/smart_resort.sql"), "utf8");
  const migration = fs.readFileSync(path.resolve(
    __dirname, "../../database/migrations/2026-10-13_allow_rejected_reservation_status.sql"), "utf8");
  assert.match(sourceSchema, /reservation_status\` enum\('pending','approved','cancelled','completed'\)/);
  assert.match(migration, /ENUM\('pending','approved','cancelled','completed','rejected'\)/);
  assert.match(migration, /NOT NULL DEFAULT 'pending'/);
  assert.doesNotMatch(migration, /UPDATE\s+reservations|DELETE\s+FROM\s+reservations/i);
});
