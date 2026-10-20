// Signed profile endpoint authorization regression tests. In-memory only.
// No Aiven, no PayPal, no real account/password modifications.
// Run from backend: node --test tests/profile-access-boundaries.test.js
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const Module = require("node:module");
const { before, after, beforeEach, test } = require("node:test");
const bcrypt = require("bcrypt");

const initialPassword = bcrypt.hashSync("ExistingP@ss123", 8);
let user;
let calls = [];
let writes = [];
function mockModule(relativePath, value) {
  const filename = require.resolve(relativePath);
  const entry = new Module(filename);
  entry.filename = filename;
  entry.loaded = true;
  entry.exports = value;
  require.cache[filename] = entry;
}
const db = {
  promise() {
    return {
      async query(query, params = []) {
        const sql = String(query).replace(/\s+/g, " ").trim();
        calls.push({ sql, params });
        if (/^SELECT\b/i.test(sql) && /\bFROM users\b/i.test(sql)) {
          if (/\bWHERE email = \? AND id != \?/i.test(sql)) return [[]];
          const id = Number(params[0]);
          if (id !== user.id) return [[]];
          if (/SELECT password FROM users/i.test(sql)) return [[{ password: user.password }]];
          return [[{ ...user }]];
        }
        if (/^UPDATE users SET fullname/i.test(sql)) {
          assert.equal(Number(params[4]), user.id);
          Object.assign(user, {
            fullname: params[0], email: params[1],
            phone: params[2], address: params[3],
          });
          writes.push({ sql, params });
          return [{ affectedRows: 1 }];
        }
        if (/^UPDATE users SET password/i.test(sql)) {
          assert.equal(Number(params[1]), user.id);
          user.password = params[0];
          writes.push({ sql, params });
          return [{ affectedRows: 1 }];
        }
        throw new Error("Unexpected isolated profile SQL: " + sql);
      }
    };
  }
};
mockModule("../config/db", db);
process.env.FRONTDESK_TOKEN_SECRET = randomBytes(48).toString("base64url");
const express = require("express");
const { issueCustomerToken } = require("../middleware/customerAuth");
const { issueAdminToken } = require("../middleware/adminAuth");
const { issueFrontDeskToken } = require("../middleware/frontDeskAuth");
const signed = {
  customer: issueCustomerToken(1),
  admin: issueAdminToken(1),
  frontdesk: issueFrontDeskToken(1, initialPassword),
};
const app = express();
app.use(express.json());
app.use("/api/auth", require("../routes/authRoutes"));
let server;
let baseUrl;
before(async () => {
  server = await new Promise(resolve => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
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
  user = {
    id: 1, role: "customer", account_status: "active", is_verified: 1,
    fullname: "Sample Account", email: "sample@example.invalid",
    phone: "000", address: "Local", password: initialPassword
  };
  calls = [];
  writes = [];
});

async function request(method, path, token, body) {
  const resp = await fetch(baseUrl + "/api/auth" + path, {
    method, headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(5000),
  });
  return { status: resp.status, data: await resp.json() };
}
const get = (token, id = 1) => request("GET", "/profile/" + id, token);
const update = (token, id = 1) =>
  request("PUT", "/profile/" + id, token, {
    fullname: "Updated Name", email: "updated@example.invalid",
    phone: "987", address: "Updated Home",
  });
const password = (token, id = 1, currentPassword = "ExistingP@ss123") =>
  request("PUT", "/change-password/" + id, token, {
    currentPassword, newPassword: "ChangedP@ss123",
  });

for (const [label, method] of [
  ["profile view", get],
  ["profile update", update],
  ["password change", password],
]) {
  test(label + " rejects missing token before touching DB", async () => {
    const result = await method(null);
    assert.equal(result.status, 401);
    assert.equal(calls.length, 0);
    assert.equal(writes.length, 0);
  });
  test(label + " rejects forged token before touching DB", async () => {
    const result = await method("cus1.fake.token");
    assert.equal(result.status, 401);
    assert.equal(calls.length, 0);
    assert.equal(writes.length, 0);
  });
  test(label + " rejects access to another account ID", async () => {
    const result = await method(signed.customer, 2);
    assert.equal(result.status, 403);
    assert.equal(writes.length, 0);
    assert.equal(calls.some(x => /^UPDATE users/i.test(x.sql)), false);
  });
}
test("verified customer can read own profile", async () => {
  const result = await get(signed.customer);
  assert.equal(result.status, 200);
  assert.equal(result.data.user.email, user.email);
  assert.equal(writes.length, 0);
});
test("verified admin can read own profile", async () => {
  user.role = "admin";
  const result = await get(signed.admin);
  assert.equal(result.status, 200);
  assert.equal(result.data.user.role, "admin");
});
test("verified front desk can read own profile", async () => {
  user.role = "frontdesk";
  const result = await get(signed.frontdesk);
  assert.equal(result.status, 200);
});
test("verified legacy staff can read own profile using front desk token", async () => {
  user.role = "staff";
  const result = await get(signed.frontdesk);
  assert.equal(result.status, 200);
});
test("token cannot bypass current DB role change", async () => {
  user.role = "admin";
  const result = await get(signed.customer);
  assert.equal(result.status, 403);
});
test("disabled user cannot read profile", async () => {
  user.account_status = "disabled";
  assert.equal((await get(signed.customer)).status, 403);
});
test("unverified user cannot read profile", async () => {
  user.is_verified = 0;
  assert.equal((await get(signed.customer)).status, 403);
});
test("verified customer can update only own profile", async () => {
  const result = await update(signed.customer);
  assert.equal(result.status, 200);
  assert.equal(result.data.user.fullname, "Updated Name");
  assert.equal(writes.length, 1);
});
test("wrong existing password produces zero writes", async () => {
  assert.equal((await password(signed.customer, 1, "IncorrectOld")).status, 400);
  assert.equal(writes.length, 0);
});
test("own password can change with signed session and correct old password", async () => {
  const result = await password(signed.customer);
  assert.equal(result.status, 200);
  assert.equal(writes.length, 1);
  assert.equal(await bcrypt.compare("ChangedP@ss123", user.password), true);
});
