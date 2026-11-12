// ADMIN ACCOMMODATION + RESORT MAP WRITE AUTHORIZATION.
// Offline/in-memory Express tests. No Aiven/MySQL/PayPal access.
// Controllers are stubbed before router modules are loaded.
// Run: node --test tests/admin-inventory-map-boundaries.test.js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const crypto = require("node:crypto");
const { before, beforeEach, after, test } = require("node:test");

let account;
let queries = [];
let actions = [];
function substitute(relativePath, exportsValue) {
  const filepath = require.resolve(relativePath);
  const fake = new Module(filepath);
  fake.filename = filepath;
  fake.loaded = true;
  fake.exports = exportsValue;
  require.cache[filepath] = fake;
}
substitute("../config/db", {
  promise() {
    return {
      async query(sql, params) {
        const compact = String(sql).replace(/\s+/g, " ").trim();
        queries.push({ sql: compact, params });
        if (!/\bFROM users\b/i.test(compact)) {
          throw new Error("Unapproved SQL in isolated Admin route tests: " + compact);
        }
        return [Number(params[0]) === 1 ? [{ ...account }] : []];
      },
    };
  },
});

const roomHandlers = [
  "getAccommodationCategories", "createAccommodationCategory",
  "getAllRooms", "getAvailableRooms", "getRoomById",
  "createRoom", "updateRoom", "deleteRoom", "seedDefaultAccommodations",
];
const mapHandlers = ["getMarkers", "createMarker", "updateMarker", "deleteMarker"];
function stubs(names) {
  return Object.fromEntries(names.map(name => [
    name,
    (req, res) => {
      actions.push(name);
      return res.status(200).json({ ok: true, name });
    },
  ]));
}
substitute("../controllers/shared/roomController", stubs(roomHandlers));
substitute("../controllers/shared/mapMarkerController", stubs(mapHandlers));

process.env.FRONTDESK_TOKEN_SECRET = crypto.randomBytes(48).toString("base64url");
// Mock users and signed staff test tokens share one stable bcrypt hash.
const STAFF_TEST_HASH = require("./helpers/staffPasswordFixture");
const { issueAdminToken } = require("../middleware/adminAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const { issueCustomerToken } = require("../middleware/customerAuth");
const tokens = {
  admin: issueAdminToken(1),
  frontdesk: issueFrontDeskToken(1, STAFF_TEST_HASH),
  customer: issueCustomerToken(1),
};
const express = require("express");
const app = express();
app.use(express.json());
app.use("/api/rooms", require("../routes/roomRoutes"));
app.use("/api/map-markers", require("../routes/mapMarkerRoutes"));
let server;
let base;

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
  account = { password: STAFF_TEST_HASH,
    id: 1, role: "admin", account_status: "active", is_verified: 1,
  };
  queries = [];
  actions = [];
});
async function request(method, endpoint, token) {
  const response = await fetch(base + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(method === "GET" ? {} : { body: JSON.stringify({ name: "Mock" }) }),
    signal: AbortSignal.timeout(5000),
  });
  return { status: response.status, body: await response.json() };
}

const writeRoutes = [
  ["POST", "/api/rooms/categories", "createAccommodationCategory"],
  ["POST", "/api/rooms/seed-defaults", "seedDefaultAccommodations"],
  ["POST", "/api/rooms", "createRoom"],
  ["PUT", "/api/rooms/7", "updateRoom"],
  ["DELETE", "/api/rooms/7", "deleteRoom"],
  ["POST", "/api/map-markers", "createMarker"],
  ["PUT", "/api/map-markers/7", "updateMarker"],
  ["DELETE", "/api/map-markers/7", "deleteMarker"],
];
for (const [method, endpoint, handler] of writeRoutes) {
  test(method + " " + endpoint + ": no token denied before DB access", async () => {
    assert.equal((await request(method, endpoint, null)).status, 401);
    assert.equal(actions.length, 0);
    assert.equal(queries.length, 0);
  });
  test(method + " " + endpoint + ": fake Admin token denied", async () => {
    assert.equal((await request(method, endpoint, "adm1.fake.token")).status, 401);
    assert.equal(actions.length, 0);
    assert.equal(queries.length, 0);
  });
  test(method + " " + endpoint + ": Front Desk token denied", async () => {
    assert.equal((await request(method, endpoint, tokens.frontdesk)).status, 401);
    assert.equal(actions.length, 0);
    assert.equal(queries.length, 0);
  });
  test(method + " " + endpoint + ": Customer token denied", async () => {
    assert.equal((await request(method, endpoint, tokens.customer)).status, 401);
    assert.equal(actions.length, 0);
    assert.equal(queries.length, 0);
  });
  test(method + " " + endpoint + ": valid Admin can reach handler", async () => {
    const result = await request(method, endpoint, tokens.admin);
    assert.equal(result.status, 200);
    assert.equal(result.body.name, handler);
    assert.deepEqual(actions, [handler]);
  });
}

for (const [endpoint, handler] of [
  ["/api/rooms/categories", "getAccommodationCategories"],
  ["/api/rooms", "getAllRooms"],
  ["/api/rooms/available", "getAvailableRooms"],
  ["/api/rooms/7", "getRoomById"],
  ["/api/map-markers", "getMarkers"],
]) {
  test("Public browsing stays read-only: GET " + endpoint, async () => {
    const result = await request("GET", endpoint, null);
    assert.equal(result.status, 200);
    assert.equal(result.body.name, handler);
    assert.deepEqual(actions, [handler]);
    assert.equal(queries.length, 0);
  });
}

test("Admin token cannot bypass current Front Desk database role", async () => {
  account.role = "frontdesk";
  assert.equal((await request("POST", "/api/rooms", tokens.admin)).status, 403);
  assert.equal(actions.length, 0);
});
test("Disabled Admin token cannot modify Map Editor data", async () => {
  account.account_status = "disabled";
  assert.equal((await request("DELETE", "/api/map-markers/7", tokens.admin)).status, 403);
  assert.equal(actions.length, 0);
});
test("Unverified Admin token cannot change accommodation prices", async () => {
  account.is_verified = 0;
  assert.equal((await request("PUT", "/api/rooms/7", tokens.admin)).status, 403);
  assert.equal(actions.length, 0);
});

// Browser helper checks without creating any actual page elements or network requests.
function getHeadersHelper(filename, functionName) {
  const src = fs.readFileSync(
    path.join(__dirname, "../../frontend/adminJS", filename), "utf8");
  const start = src.indexOf("function " + functionName + "(");
  assert.ok(start !== -1, "Expected signed session helper in " + filename);
  const end = src.indexOf("\n}", start);
  assert.ok(end > start);
  const method = src.slice(start, end + 2);
  const sandbox = {
    sessionStorage: { getItem: key => key === "adminToken" ? tokens.admin : null },
  };
  const vm = require("node:vm");
  vm.runInNewContext(method + "\nresult = " + functionName + "();", sandbox);
  return { headers: sandbox.result, method: src };
}
test("Admin Accommodation UI sends bearer token on mutations", () => {
  const { headers, method } = getHeadersHelper("admin-rooms.js", "adminInventoryHeaders");
  assert.equal(headers.Authorization, "Bearer " + tokens.admin);
  assert.equal(headers["Content-Type"], "application/json");
  assert.match(method, /headers: adminInventoryHeaders\(\)/);
  assert.match(method, /headers: adminInventoryHeaders\(false\)/);
});
test("Admin Map Editor UI sends bearer token on mutations", () => {
  const { headers, method } = getHeadersHelper("admin-map-editor.js", "adminMapHeaders");
  assert.equal(headers.Authorization, "Bearer " + tokens.admin);
  assert.equal(headers["Content-Type"], "application/json");
  assert.match(method, /headers: adminMapHeaders\(\)/);
  assert.match(method, /headers: adminMapHeaders\(false\)/);
});
