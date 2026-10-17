// Confirm seeding is a deliberate Admin operation; never connects to a database.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Extract just this function so the unrelated Admin page initialization does not run.
const source = fs.readFileSync(
  path.resolve(__dirname, "../../frontend/adminJS/admin-rooms.js"),
  "utf8",
);
const start = source.indexOf("async function seedDefaults() {");
const end = source.indexOf("// ============================================================", start + 1);
assert.ok(start >= 0 && end > start, "seed function must exist");
const body = source.slice(start, end);

async function runScenario(approved) {
  const calls = [];
  const ctx = {
    confirm(message) {
      calls.push({ type: "confirm", message });
      return approved;
    },
    API_BASE: "/api",
    adminInventoryHeaders() { return { Authorization: "test-only" }; },
    fetch: async (url, options) => {
      calls.push({ type: "fetch", url, options });
      return { ok: true, async json() { return { message: "Seed complete" }; } };
    },
    showMessage(message, status) { calls.push({ type: "toast", status }); },
    loadRooms() { calls.push({ type: "refresh" }); },
    console,
  };
  await vm.runInNewContext(body + "\nseedDefaults();", ctx);
  return calls;
}

test("Cancel seed confirmation never sends a database-writing request", async () => {
  const calls = await runScenario(false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].type, "confirm");
  assert.match(calls[0].message, /add example records/i);
});

test("Confirmed seed makes one request and refreshes inventory", async () => {
  const calls = await runScenario(true);
  assert.deepEqual(calls.map(c => c.type), ["confirm", "fetch", "toast", "refresh"]);
  assert.equal(calls[1].url, "/api/rooms/seed-defaults");
  assert.equal(calls[1].options.method, "POST");
});
