/**
 * Stage 85-D: Real frontend offline reply regression tests.
 * Zero Gemini calls, zero MySQL calls, and no browser/network dependency.
 * Run from backend/: node --test tests/ai-offline-policy.test.js
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(
  __dirname, "../../frontend/js/ai-chat.js"), "utf8");

// The script only registers a DOMContentLoaded listener at load time.
// We can exercise its actual pure fallback handlers without booting the UI.
const context = {
  window: { location: { hostname: "localhost" } },
  document: { addEventListener: () => {} },
};
vm.runInNewContext(source, context, { filename: "ai-chat.js" });

for (const [locale, fn, query] of [
  ["English", "getEnglishFallbackReply", "payment methods"],
  ["Tagalog", "getTagalogFallbackReply", "bayad at payment"],
  ["Taglish", "getTaglishFallbackReply", "payment options"],
]) {
  test(locale + " offline payment answers use PayPal-only online downpayment", () => {
    const result = context[fn](query, {});
    assert.match(result.reply, /paypal/i);
    assert.match(result.reply, /50%/);
    assert.match(result.reply, /onsite/i);
    assert.doesNotMatch(result.reply, /cash on arrival/i);
    assert.doesNotMatch(result.reply, /pending online payment status/i);
    assert.deepEqual({ ...result.context }, {});
  });
}

for (const [locale, fn, query] of [
  ["English", "getEnglishFallbackReply", "how to book"],
  ["Tagalog", "getTagalogFallbackReply", "paano mag-book"],
  ["Taglish", "getTaglishFallbackReply", "how to book"],
]) {
  test(locale + " offline booking steps direct to secure Customer booking", () => {
    const result = context[fn](query, {});
    assert.match(result.reply, /rooms page/i);
    assert.match(result.reply, /paypal/i);
    assert.match(result.reply, /50%/);
    assert.match(result.reply, /my bookings/i);
  });
}

test("Offline booking instructions guide to fixed Day Tour or Night slots", () => {
  for (const [fn, query] of [
    ["getEnglishFallbackReply", "how to book"],
    ["getTagalogFallbackReply", "paano mag-book"],
    ["getTaglishFallbackReply", "how to book"],
  ]) {
    const reply = context[fn](query, {}).reply;
    assert.match(reply, /Day Tour/i);
    assert.match(reply, /Night/i);
    assert.doesNotMatch(reply, /enter.*dates and times/i);
  }
});

test("Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule", () => {
  const reply = context.getEnglishFallbackReply("What is the check-in time?", {}).reply;
  assert.match(reply, /fixed/i);
  assert.match(reply, /7 AM-5 PM/);
  assert.doesNotMatch(reply, /2 PM.*12 PM/i);
});
