// Stage 85-A: Admin-only AI usage endpoint authorization regression.
// Uses in-memory users and real signed tokens; no Aiven, Gemini, or Azure.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const Module = require("node:module");
const { test, before, after } = require("node:test");

function replace(path, value) {
  const filename = require.resolve(path);
  const item = new Module(filename);
  item.filename = filename;
  item.loaded = true;
  item.exports = value;
  require.cache[filename] = item;
}
const people = new Map([
  [1, { id: 1, role: "admin", is_verified: 1, account_status: "active" }],
  [2, { id: 2, role: "customer", is_verified: 1, account_status: "active" }],
]);
replace("../config/db", {
  promise() {
    return {
      async query(sql, params) {
        assert.match(sql, /FROM users WHERE id = \?/i);
        return [people.has(Number(params[0])) ? [people.get(Number(params[0]))] : []];
      },
    };
  },
});
// The route must not initialize a real speech or Gemini provider during tests.
replace("../controllers/ai/azureSpeechController", {
  voiceStatus(_req, res) { res.json({ enabled: false }); },
  speakBlessica(_req, res) { res.status(503).json({ enabled: false }); },
});
const unavailable = (_req, res) => res.status(503).json({ success: false });
replace("../controllers/ai/geminiChatController", {
  chatWithGemini: unavailable, translateReplyToTagalog: unavailable,
  translateReplyToEnglish: unavailable, translateReplyToTaglish: unavailable,
});
process.env.FRONTDESK_TOKEN_SECRET = crypto.randomBytes(48).toString("base64url");
const { issueAdminToken } = require("../middleware/adminAuth");
const { issueCustomerToken } = require("../middleware/customerAuth");
const express = require("express");
const app = express();
app.use(express.json());
app.use("/api/ai", require("../routes/aiRoutes"));
let server, origin;
before(async () => {
  server = await new Promise(resolve => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  origin = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  if (server) await new Promise(resolve => {
    server.closeAllConnections();
    server.close(resolve);
  });
});
async function getUsage(token) {
  const response = await fetch(origin + "/api/ai/usage", {
    headers: token ? { Authorization: "Bearer " + token } : {},
    signal: AbortSignal.timeout(5000),
  });
  return { status: response.status, data: await response.json(), response };
}

test("Anonymous guests cannot read Gemini usage telemetry", async () => {
  const result = await getUsage(null);
  assert.equal(result.status, 401);
});
test("Customer sessions cannot impersonate Admin for usage telemetry", async () => {
  const result = await getUsage(issueCustomerToken(2));
  assert.equal(result.status, 401);
});
test("A correctly signed Admin token for a customer account is denied", async () => {
  const result = await getUsage(issueAdminToken(2));
  assert.equal(result.status, 403);
});
test("Signed Admin sees aggregate usage, never keys or guest transcripts", async () => {
  const result = await getUsage(issueAdminToken(1));
  assert.equal(result.status, 200);
  assert.equal(result.data.success, true);
  assert.equal(result.response.headers.get("cache-control"), "no-store");
  assert.ok(result.data.gemini.sessionBudget);
  assert.ok(result.data.rateLimits);
  assert.equal(typeof result.data.gemini.attempts, "number");
  assert.doesNotMatch(JSON.stringify(result.data),
    /GEMINI_API_KEY|FRONTDESK_TOKEN_SECRET|fake-secret-token/);
});
