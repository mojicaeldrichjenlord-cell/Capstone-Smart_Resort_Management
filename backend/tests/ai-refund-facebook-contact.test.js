/**
 * Stage 86: Refund support must give a clickable verified resort Facebook
 * contact after the manual-refund explanation. This is a zero-credit test:
 * it requires neither Gemini nor database, network, payment or user records.
 * Run from backend/: node --test tests/ai-refund-facebook-contact.test.js
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  matchGeneralPolicyQuestion, getPolicyReply, policyPromptLines,
} = require("../controllers/ai/resortPolicyKnowledge");

const frontendRoot = path.resolve(__dirname, "../../frontend");
const home = fs.readFileSync(path.join(frontendRoot, "customerHTML/index.html"), "utf8");
const aiScript = fs.readFileSync(path.join(frontendRoot, "js/ai-chat.js"), "utf8");
const homeFb = home.match(/href="(https:\/\/www\.facebook\.com\/share\/[^"]+)"/);
assert.ok(homeFb, "Customer Home page must have an official Facebook link.");
const url = homeFb[1];

const browser = {
  window: { location: { hostname: "localhost" } },
  document: { addEventListener() {} },
};
vm.runInNewContext(aiScript, browser, { filename: "ai-chat.js" });

test("Refund and cancellation/refund intents use local verified policy answers", () => {
  assert.equal(matchGeneralPolicyQuestion("What is your refund policy?"), "refund");
  assert.equal(matchGeneralPolicyQuestion("Can I cancel my booking and get a refund?"), "cancellationRefund");
});

for (const kind of ["refund", "cancellationRefund"]) {
  for (const language of ["english", "tagalog", "taglish", "spanish", "mandarin"]) {
    test(kind + " in " + language + " recommends the exact Home-page Facebook contact", () => {
      const reply = getPolicyReply(kind, language);
      assert.ok(reply);
      assert.ok(reply.includes(url), "Must include the verified URL, not an invented page.");
      assert.ok(reply.indexOf(url) > 35, "Explain refund process before giving contact.");
      assert.doesNotMatch(reply, /guaranteed (?:refund|approval)/i);
      const html = browser.formatAiReply(reply);
      assert.ok(html.includes('href="' + url + '"'), "URL must be clickable in chat.");
      assert.match(html, /target="_blank" rel="noopener noreferrer"/);
      assert.match(html, /Message resort on Facebook/);
    });
  }
}

test("AI source prompt includes official refund contact and no guarantee", () => {
  const prompt = policyPromptLines();
  assert.ok(prompt.includes(url));
  assert.match(prompt, /Do not promise a refund/);
});

test("AI renderer escapes untrusted HTML and does not make arbitrary links", () => {
  const html = browser.formatAiReply('<img src=x onerror=alert(1)> https://example.com/');
  assert.doesNotMatch(html, /<img/i);
  assert.match(html, /&lt;img/i);
  assert.doesNotMatch(html, /href="https:\/\/example\.com/);
});
