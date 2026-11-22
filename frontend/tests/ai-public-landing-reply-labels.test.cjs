"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const script = fs.readFileSync(path.join(__dirname, "../js/ai-chat.js"), "utf8");
const start = script.indexOf("function aiReplyForSurface(reply) {");
const end = script.indexOf("function setupAiChat()", start);
assert.ok(start >= 0 && end > start, "public response helper should exist");
const helperSource = script.slice(start, end);

function pageReply(reply, publicLanding) {
  const context = { AI_IS_PUBLIC_LANDING: publicLanding };
  vm.runInNewContext(helperSource + "\nthis.formatReply = aiReplyForSurface;", context);
  return context.formatReply(reply);
}

test("UI-49: public landing reply uses exact login action label", () => {
  const backend = "Ito po yung preview ng Family Room B. Click niyo lang yung View Details para sa photos and info.";
  const result = pageReply(backend, true);
  assert.match(result, /Login for Details/);
  assert.doesNotMatch(result, /\bView Details\b/);
  assert.match(result, /Family Room B/);
});

test("UI-49: customer reply keeps existing View Details wording", () => {
  const backend = "Ito po yung preview ng Family Room B. Click niyo lang yung View Details.";
  assert.equal(pageReply(backend, false), backend);
});

test("UI-49: public booking instruction matches Login to Book action", () => {
  const backend = "Click Book This to proceed.";
  assert.equal(pageReply(backend, true), "Click Login to Book to proceed.");
  assert.equal(pageReply(backend, false), backend);
});

test("UI-49: public fast answers without card labels remain unchanged", () => {
  const backend = "Yes po, open 24/7 ang convenience store. The restobar serves food and drinks.";
  assert.equal(pageReply(backend, true), backend);
});
