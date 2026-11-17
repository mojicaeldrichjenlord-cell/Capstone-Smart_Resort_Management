// ============================================================
// ADMIN-CONTROLLED EXTRA GUEST RATE REGRESSION
// NO live DB connections, payments, booking writes or network required.
// Run: node --test tests/extra-guest-rate-admin.test.js
// ============================================================
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

function fakeRateService(mockDb) {
  const code = read("backend/services/extraGuestRate.js");
  const mod = { exports: {} };
  vm.runInNewContext(
    "(function(module, require) {" + code + "\n})",
    {},
  )(mod, name => {
    assert.equal(name, "../config/db");
    return mockDb;
  });
  return mod.exports;
}

test("₱250 default, money precision, and safe admin input validation", () => {
  const svc = fakeRateService({ promise: () => ({ query: async () => [[]] }) });
  assert.equal(svc.DEFAULT_EXTRA_GUEST_RATE, 250);
  for (const [input, expected] of [[250,250],["300.55",300.55],[0,0],["0.01",0.01]]) {
    assert.equal(svc.parseExtraGuestRate(input), expected);
  }
  for (const invalid of [null,undefined,"",-1,100000.01,10.999,NaN,Infinity]) {
    assert.equal(svc.parseExtraGuestRate(invalid), null);
  }
});

test("Admin setting is persistent and returned on subsequent Front Desk reads", async () => {
  const sql = [];
  let saved = null;
  const svc = fakeRateService({
    promise: () => ({
      query: async (query, args) => {
        sql.push({ query, args });
        if (query.includes("INSERT INTO resort_settings")) {
          saved = args[1];
          return [{ affectedRows: 1 }];
        }
        return [saved === null ? [] : [{ setting_value: saved }]];
      },
    }),
  });
  assert.equal(await svc.getExtraGuestRate(), 250);
  assert.equal(await svc.setExtraGuestRate("325.50", 12), 325.50);
  assert.equal(await svc.getExtraGuestRate(), 325.50);
  assert.deepEqual(Array.from(sql[1].args), ["extra_guest_rate",325.50,12]);
  assert.match(sql[1].query, /ON DUPLICATE KEY UPDATE/);
});

test("Only missing settings table falls back to default; other errors fail closed", async () => {
  const missing = fakeRateService({ promise: () => ({
    query: async () => { const e = new Error("missing"); e.code = "ER_NO_SUCH_TABLE"; throw e; }
  }) });
  assert.equal(await missing.getExtraGuestRate(), 250);
  const invalid = fakeRateService({ promise: () => ({
    query: async () => [[{ setting_value: "not-money" }]]
  }) });
  await assert.rejects(invalid.getExtraGuestRate(), /invalid/i);
});

test("Front Desk cannot forge rate in guest-adjustment request", async () => {
  const source = read("backend/controllers/frontdesk/frontdeskGuestAdjustmentController.js");
  const handlerModule = { exports: {} };
  const calls = [];
  const connection = {
    beginTransaction: async () => { calls.push(["begin"]); },
    rollback: async () => { calls.push(["rollback"]); },
    commit: async () => { calls.push(["commit"]); },
    release: () => { calls.push(["release"]); },
    query: async (sql, args) => {
      calls.push([sql, args]);
      if (sql.includes("FROM reservations") && sql.includes("FOR UPDATE")) {
        return [[{
          id: 1, guest_count: 5, actual_guest_count: 8,
          reservation_status: "approved", is_checked_in: 1,
          entrance_fee_paid: 0, entrance_fee_collected: 0,
        }]];
      }
      if (sql.includes("FROM booking_charges") && sql.includes("FOR UPDATE")) {
        return [[]];
      }
      return [{ affectedRows: 1, insertId: 1 }];
    },
  };
  const mockedDb = { promise: () => ({ getConnection: async () => connection }) };
  const fakeGetRate = async conn => {
    assert.equal(conn, connection);
    return 250;
  };
  vm.runInNewContext("(function(module, require) {" + source + "\n})", {})(
    handlerModule,
    name => {
      if (name === "../../config/db") return mockedDb;
      if (name === "../../services/extraGuestRate") return { getExtraGuestRate: fakeGetRate };
      throw new Error("Unexpected dependency: " + name);
    },
  );
  let code = null;
  let output = null;
  const res = {
    status(status) { code = status; return this; },
    json(body) { output = body; return body; },
  };
  const req = {
    params: { id: 1 },
    body: { actual_guest_count: 8, extra_guest_rate: 0 }, // forged / waived rate
  };
  await handlerModule.exports.updateGuestAdjustment(req, res);
  assert.equal(code, 200);
  assert.equal(output.extra_guest_rate, 250);
  assert.equal(output.extra_guest_count, 3);
  assert.equal(output.target_extra_guest_total, 750);
  assert.equal(output.additional_extra_guest_due, 750);
  const inserted = calls.find(c => typeof c[0] === "string" &&
    c[0].includes("INSERT INTO booking_charges"));
  assert.ok(inserted);
  assert.equal(inserted[1][1], 750);
  assert.ok(calls.some(c => c[0] === "commit"));
  assert.ok(!source.includes("req.body.extra_guest_rate"));
});

test("Rate endpoints use signed-role checks; Admin UI is editable, Front Desk is read-only", () => {
  const routes = read("backend/routes/extraGuestRateRoutes.js");
  assert.match(routes, /router\.get\("\/frontdesk", requireFrontDeskAuth, readExtraGuestRate\)/);
  assert.match(routes, /router\.get\("\/admin", requireAdminAuth, readExtraGuestRate\)/);
  assert.match(routes, /router\.put\("\/admin", requireAdminAuth, updateExtraGuestRate\)/);
  const html = read("frontend/frontdeskHTML/frontdeskGuests.html");
  const adminHtml = read("frontend/adminHTML/admin-profile.html");
  const adminScript = read("frontend/adminJS/admin-profile.js");
  const frontDeskScript = read("frontend/frontdeskJS/frontdeskGuests.js");
  assert.match(html, /id="extraGuestRateInput"[\s\S]*?readonly[\s\S]*?disabled/);
  assert.match(frontDeskScript, /rateInput\.disabled = true/);
  assert.match(read("frontend/frontdeskCSS/frontdeskGuests.css"), /#extraGuestRateInput:disabled[\s\S]*?pointer-events: none/);
  assert.match(html, /value="250\.00"/);
  assert.match(adminHtml, /id="extraGuestRateForm"/);
  assert.match(adminScript, /guest-rate\/admin/);
  assert.match(frontDeskScript, /guest-rate\/frontdesk/);
  assert.doesNotMatch(frontDeskScript, /extra_guest_rate:\s*extraGuestRate/);
});
