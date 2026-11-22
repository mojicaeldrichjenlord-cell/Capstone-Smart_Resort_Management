"use strict";
// AI-49: Regression test for verified offline resort replies.
// Run from the repo root:
//   node --test frontend/tests/ai-offline-recovery.test.cjs
// No network, MySQL, Google Gemini or browser is required.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const chat = fs.readFileSync(path.join(__dirname, "../js/ai-chat.js"), "utf8");
const start = chat.indexOf("function getOfflineVerifiedResortReply(message, language, context) {");
const end = chat.indexOf("\nfunction ", start + 25);
assert.ok(start >= 0 && end > start, "offline verified FAQ helper must exist");
const getVerified = new Function(chat.slice(start, end) + "\nreturn getOfflineVerifiedResortReply;")();

test("A Taglish parking question has the confirmed factual fallback", () => {
  const value = getVerified("May free parking ba kayo?", "taglish", {});
  assert.match(value.reply, /free parking.*kahit anong vehicle/i);
  assert.match(value.reply, /walang parking fee/i);
});
test("A request about parking plus Wi-Fi does not invent Wi-Fi policy", () => {
  const value = getVerified("May free parking ba kayo at may wifi?", "taglish", {});
  assert.match(value.reply, /hindi pa confirmed/i);
});
test("An unverified room rate must not be supplied from offline text", () => {
  assert.equal(getVerified("How much is the Family Room?", "english", {}), null);
});
test("Generic English voice failure must never overwrite a verified text fallback", () => {
  assert.match(chat, /const safeReply = fallback\.reply \|\|/);
  assert.doesNotMatch(chat, /voiceFallbacks\[voiceLanguage\] \|\| fallback\.reply/);
});
test("Local backend connection errors get a precise development-only notice", () => {
  assert.match(chat, /127\.0\.0\.1:5000/);
  assert.match(chat, /localHost && isTransportError/);
});
