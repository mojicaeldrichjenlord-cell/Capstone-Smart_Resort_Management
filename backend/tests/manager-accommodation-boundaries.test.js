// Manager accommodations RBAC, validation & optimistic concurrency.
// Entire test suite uses mocked MySQL and fake sign-in sessions only.
const assert = require("node:assert/strict");
const { test, before, beforeEach, after } = require("node:test");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");
const express = require("express");
let user, inventory, queries, race;
const mockDb = {
  promise() {
    return {
      async query(sql, params = []) {
        const query = String(sql).replace(/\s+/g, " ").trim();
        queries.push({ query, params });
        if (/FROM users WHERE id = \?/i.test(query)) {
          return [user && Number(params[0]) === user.id ? [{ ...user }] : []];
        }
        if (/FROM accommodations a INNER JOIN accommodation_categories c/i.test(query)) {
          return [[{
            ...inventory, id: inventory.id, name: "Family Cottage A",
            category_name: "Cottage", max_capacity: 10,
            image: "PRIVATE_IMAGE", description: "PRIVATE_DESCRIPTION",
          }]];
        }
        if (/FROM accommodations WHERE id = \?/i.test(query)) {
          return [Number(params[0]) === inventory.id ? [{ ...inventory }] : []];
        }
        if (/^UPDATE accommodations SET status = \?/i.test(query)) {
          const [status, day, overnight, extended, id,
            oldStatus, oldDay, oldOvernight, oldExtended] = params;
          if (race || id !== inventory.id ||
              oldStatus !== inventory.status ||
              Number(oldDay) !== Number(inventory.day_price) ||
              Number(oldOvernight) !== Number(inventory.overnight_price) ||
              Number(oldExtended) !== Number(inventory.extended_price)) {
            return [{ affectedRows: 0 }];
          }
          inventory = {
            ...inventory, status,
            day_price: Number(day), overnight_price: Number(overnight),
            extended_price: Number(extended),
          };
          return [{ affectedRows: 1 }];
        }
        throw new Error("Unexpected SQL: " + query);
      },
    };
  },
};
function mockModule(path, exported) {
  const filename = require.resolve(path);
  const module = new Module(filename);
  module.filename = filename;
  module.loaded = true;
  module.exports = exported;
  require.cache[filename] = module;
}
mockModule("../config/db", mockDb);
process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");
const { issueManagerToken } = require("../middleware/managerAuth");
const { issueCustomerToken } = require("../middleware/customerAuth");
const { issueAdminToken } = require("../middleware/adminAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const goodToken = issueManagerToken(1);
const unrelatedTokens = {
  customer: issueCustomerToken(1),
  admin: issueAdminToken(1),
  frontdesk: issueFrontDeskToken(1),
};
const noop = (_req, res) => res.json({ success: true });
mockModule("../controllers/manager/managerOverviewController", {
  getManagerMe: noop, getManagerOverview: noop,
});
mockModule("../controllers/manager/managerReservationsController", {
  listManagerReservations: noop, reviewManagerReservation: noop,
});
const app = express();
app.use(express.json());
app.use("/api/manager", require("../routes/managerRoutes"));
let server, base;
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
  user = {
    id: 1, role: "manager", fullname: "Test Manager",
    email: "manager@invalid.example",
    is_verified: 1, account_status: "active",
  };
  inventory = {
    id: 7, status: "available",
    day_price: 800, overnight_price: 1200, extended_price: 1600,
  };
  queries = [];
  race = false;
});
async function send(path, { method = "GET", token = goodToken, body } = {}) {
  const resp = await fetch(base + "/api/manager" + path, {
    method,
    headers: {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(5000),
  });
  return { status: resp.status, data: await resp.json() };
}
const expected = () => ({
  status: "available", day_price: "800.00",
  overnight_price: "1200.00", extended_price: "1600.00",
});
const patch = (body, options = {}) => send("/accommodations/7/operations", {
  method: "PATCH", body, ...options,
});
const writes = () => queries.filter(x => /^UPDATE\b/i.test(x.query));
const listSql = () => queries.filter(x => /FROM accommodations a\b/i.test(x.query));

test("Manager can list accommodations with rates, status, categories and capacity", async () => {
  const response = await send("/accommodations");
  assert.equal(response.status, 200);
  assert.equal(response.data.accommodations[0].name, "Family Cottage A");
  assert.equal(response.data.accommodations[0].capacity, 10);
  assert.equal(response.data.accommodations[0].day_price, 800);
  assert.equal(response.data.accommodations[0].category, "Cottage");
  assert.equal(response.data.limit, 300);
  assert.equal(response.data.accommodations[0].description, undefined);
  assert.doesNotMatch(JSON.stringify(response.data), /PRIVATE_IMAGE|PRIVATE_DESCRIPTION/);
  assert.equal(writes().length, 0);
});
for (const route of [
  { path: "/accommodations", method: "GET" },
  { path: "/accommodations/7/operations", method: "PATCH", body: { ...expected(), expected: expected() } },
]) {
  test(route.path + " rejects missing token before DB access", async () => {
    const result = await send(route.path, { ...route, token: null });
    assert.equal(result.status, 401);
    assert.equal(queries.length, 0);
  });
  test(route.path + " rejects forged signed Manager token", async () => {
    const result = await send(route.path, { ...route, token: "mgr1.forged.invalid" });
    assert.equal(result.status, 401);
    assert.equal(queries.length, 0);
  });
  for (const [role, token] of Object.entries(unrelatedTokens)) {
    test(route.path + " rejects " + role + " token before DB access", async () => {
      const result = await send(route.path, { ...route, token });
      assert.equal(result.status, 401);
      assert.equal(queries.length, 0);
    });
  }
}
test("Manager can update rates and status without modifying identity or bookings", async () => {
  const result = await patch({
    status: "unavailable", day_price: "900.00",
    overnight_price: "1400.00", extended_price: "1800.00",
    expected: expected(),
  });
  assert.equal(result.status, 200);
  assert.equal(inventory.status, "unavailable");
  assert.equal(inventory.day_price, 900);
  assert.equal(inventory.extended_price, 1800);
  assert.equal(writes().length, 1);
  assert.match(writes()[0].query, /WHERE id = \? AND status = \?/);
  assert.deepEqual(writes()[0].params.slice(0, 4),
    ["unavailable", "900.00", "1400.00", "1800.00"]);
  assert.doesNotMatch(writes()[0].query, /(?:DELETE|reservation|payment|category_id|name|gallery|map_label)/i);
});
test("Posting current rates results in a successful no-op", async () => {
  const response = await patch({ ...expected(), expected: expected() });
  assert.equal(response.status, 200);
  assert.equal(writes().length, 0);
});
for (const status of ["maintenance", "deleted", "active", "pending", ""]) {
  test("Manager cannot set unsupported status: " + status, async () => {
    const response = await patch({ ...expected(), status, expected: expected() });
    assert.equal(response.status, 400);
    assert.equal(writes().length, 0);
  });
}
for (const value of ["-1", "1000000.01", "NaN", "Infinity", "1e9", "12.345", ""]) {
  test("Manager cannot write unsafe price: " + String(value), async () => {
    const response = await patch({
      ...expected(), day_price: value, expected: expected(),
    });
    assert.equal(response.status, 400);
    assert.equal(writes().length, 0);
  });
}
for (const field of ["category_id", "name", "description", "max_capacity", "payment_status", "gallery_images", "map_label"]) {
  test("Manager cannot modify unauthorized field " + field, async () => {
    const response = await patch({
      ...expected(), [field]: "FORGED_CHANGE", expected: expected(),
    });
    assert.equal(response.status, 400);
    assert.equal(writes().length, 0);
  });
}
test("Manager update requires expected snapshot for safe concurrent edits", async () => {
  const response = await patch({ ...expected(), day_price: 950 });
  assert.equal(response.status, 400);
  assert.equal(writes().length, 0);
});
test("Stale price snapshot is blocked before UPDATE", async () => {
  const original = expected();
  inventory.day_price = 990;
  const response = await patch({
    ...original, day_price: 970, expected: original,
  });
  assert.equal(response.status, 409);
  assert.equal(response.data.code, "INVENTORY_CHANGED");
  assert.equal(writes().length, 0);
});
test("Concurrent change during UPDATE is detected by affectedRows", async () => {
  race = true;
  const response = await patch({
    ...expected(), day_price: 850, expected: expected(),
  });
  assert.equal(response.status, 409);
  assert.equal(response.data.code, "INVENTORY_CHANGED");
  assert.equal(writes().length, 1);
  assert.equal(inventory.day_price, 800);
});
test("Unknown accommodation returns 404, no writes", async () => {
  const response = await send("/accommodations/999/operations", {
    method: "PATCH", body: { ...expected(), day_price: 850, expected: expected() },
  });
  assert.equal(response.status, 404);
  assert.equal(writes().length, 0);
});
test("Invalid accommodation id returns 400, no writes", async () => {
  const response = await send("/accommodations/not-a-number/operations", {
    method: "PATCH", body: { ...expected(), expected: expected() },
  });
  assert.equal(response.status, 400);
  assert.equal(writes().length, 0);
});
test("Disabled Manager cannot list or edit", async () => {
  user.account_status = "disabled";
  assert.equal((await send("/accommodations")).status, 403);
  assert.equal((await patch({
    ...expected(), day_price: 950, expected: expected(),
  })).status, 403);
  assert.equal(listSql().length, 0);
  assert.equal(writes().length, 0);
});
test("Unverified Manager cannot update prices", async () => {
  user.is_verified = 0;
  assert.equal((await patch({
    ...expected(), day_price: 950, expected: expected(),
  })).status, 403);
  assert.equal(writes().length, 0);
});
test("Demoted Manager cannot update prices", async () => {
  user.role = "customer";
  assert.equal((await patch({
    ...expected(), day_price: 950, expected: expected(),
  })).status, 403);
  assert.equal(writes().length, 0);
});
test("Manager frontend uses secure token and never injects listing text as HTML", () => {
  const fs = require("node:fs"), path = require("node:path");
  const source = fs.readFileSync(path.resolve(
    __dirname, "../../frontend/managerJS/managerAccommodations.js"), "utf8");
  const html = fs.readFileSync(path.resolve(
    __dirname, "../../frontend/managerHTML/managerAccommodations.html"), "utf8");
  assert.match(source, /sessionStorage\.getItem\("managerToken"\)/);
  assert.match(source, /textContent/);
  assert.doesNotMatch(source, /innerHTML/);
  assert.match(source, /window\.confirm/);
  assert.match(html, /managerAccommodations\.js/);
  assert.doesNotMatch(source, /\/rooms\/[^\n]*PUT|\/rooms\/[^\n]*DELETE/);
});
