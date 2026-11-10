/**
 * Stage 86: Refund support must give clickable verified Facebook and phone
 * contacts after the manual-refund explanation. This is a zero-credit test:
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
const landing = fs.readFileSync(path.join(frontendRoot, "customerHTML/landing.html"), "utf8");
// Derive phone test expectations from the actual Home contacts, not guesses.
const phoneDigits = [...home.matchAll(/href="tel:(09\d{9})"/g)].map(x => x[1]);
assert.equal(phoneDigits.length, 2, "Home must have two dialable resort numbers.");
const formattedPhone = n => n.slice(0, 4) + "-" + n.slice(4, 7) + "-" + n.slice(7);
for (const n of phoneDigits) {
  assert.ok(landing.includes(formattedPhone(n)),
    "Public Landing and Customer Home must agree on phone numbers.");
}

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
      for (const n of phoneDigits) {
        assert.ok(reply.includes(formattedPhone(n)), "Refund reply must include both verified numbers.");
        assert.ok(html.includes('href="tel:' + n + '"'), "Verified phone must be clickable.");
      }
    });
  }
}

// Network/service outage must not replace refund help with unrelated payment text.
for (const [locale, fn, question] of [
  ["English", "getEnglishFallbackReply", "What is the refund policy?"],
  ["Tagalog", "getTagalogFallbackReply", "Paano po mag-refund?"],
  ["Taglish", "getTaglishFallbackReply", "Pwede po bang refund?"],
]) {
  test(locale + " offline refund help includes the same clickable Facebook contact", () => {
    const result = browser[fn](question.toLowerCase(), {});
    assert.ok(result.reply.includes(url));
    assert.match(result.reply, /refund/i);
    assert.match(result.reply, /manual|manually/i);
    assert.match(browser.formatAiReply(result.reply), /Message resort on Facebook/);
    const html = browser.formatAiReply(result.reply);
    for (const n of phoneDigits) {
      assert.ok(result.reply.includes(formattedPhone(n)));
      assert.ok(html.includes('href="tel:' + n + '"'));
    }
  });
}

test("AI source prompt includes official refund contact and no guarantee", () => {
  const prompt = policyPromptLines();
  assert.ok(prompt.includes(url));
  for (const n of phoneDigits) assert.ok(prompt.includes(formattedPhone(n)));
  assert.match(prompt, /Do not promise a refund/);
});

test("AI renderer escapes untrusted HTML and does not make arbitrary links", () => {
  const html = browser.formatAiReply('<img src=x onerror=alert(1)> https://example.com/');
  assert.doesNotMatch(html, /<img/i);
  assert.match(html, /&lt;img/i);
  assert.doesNotMatch(html, /href="https:\/\/example\.com/);
  assert.doesNotMatch(html, /href="tel:/);
});
