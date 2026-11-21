"use strict";
/*
 * UI-36: Customer homepage copy-only regression.
 * Keeps the hero badge's AI feature label consistent with the chatbot.
 * Does not touch AI logic, booking, payments, or user accounts.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const homeHtml = fs.readFileSync(
  path.resolve(__dirname, "../../frontend/customerHTML/index.html"), "utf8"
);

test("UI-36 homepage hero advertises AI Chatbot Assistant", () => {
  const heroBadge = homeHtml.match(/<div class="hero-badge">([\s\S]*?)<\/div>/)?.[1];
  assert.ok(heroBadge, "Customer homepage hero badge is missing");
  const normalized = heroBadge.replace(/\s+/g, " ").trim();
  assert.equal(
    normalized,
    "Seaside comfort • Easy online booking • AI Chatbot Assistant"
  );
  assert.doesNotMatch(normalized, /Smart assistant/i);
});
