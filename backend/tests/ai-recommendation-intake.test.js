"use strict";
/* AI-37 pure tests: no Gemini, no SQL, no booking/payment operations. */
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isPersonalizedRecommendation, explicitGuestCount, savedGuestCount,
  guestCountQuestion, guestCountFollowUp, recommendationLookupMessage,
} = require("../controllers/ai/aiRecommendationIntake");
const { requestedCategory } = require("../controllers/ai/aiVerifiedPreview");

test("AI-37 generic personalized recommendations ask before showing cards", () => {
  for (const q of [
    "anong room ang massuggest mo?", "Anong magandang room po?",
    "Which room would you recommend?", "Can you suggest a cottage?",
    "Recommend a family room", "Ano ang mairerecommend mong room?",
  ]) assert.equal(isPersonalizedRecommendation(q), true, q);
  for (const q of [
    "Ilang rooms meron kayo?", "What rooms are available?",
    "May parking ba kayo?", "Do you have Family Room A?",
    "Recommend this accommodation for me: Family Room A",
    "How much is the downpayment?",
  ]) assert.equal(isPersonalizedRecommendation(q), false, q);
});

test("AI-37 short natural guest-count answers work but other numbers are not invented", () => {
  for (const q of ["4", "4 kami", "4 po", "4 guests", "apat kami", "for 4 guests"])
    assert.equal(explicitGuestCount(q), 4, q);
  for (const q of ["4,000 pesos", "2026-11-21", "Family Room 4", "0 kami", "250 guests", "si jose rizal"])
    assert.equal(explicitGuestCount(q), 0, q);
  assert.equal(savedGuestCount({ guests: 5 }), 5);
  assert.equal(savedGuestCount({ guests: -1 }), 0);
});

test("AI-37 pending follow-up requires the actual prior assistant guest-count question", () => {
  const turns = [
    { role: "user", text: "anong room ang massuggest mo?" },
    { role: "assistant", text: guestCountQuestion("taglish") },
  ];
  assert.deepEqual(guestCountFollowUp("4 kami", turns, {
    intent: "ask_recommendation",
  }), { category:"room", guests:4 });
  assert.equal(guestCountFollowUp("4 kami", turns, {}), null);
  assert.equal(guestCountFollowUp("4 kami", [
    { role:"user", text:"Ilang cottages meron kayo?" },
    { role:"assistant", text:"May 45 cottages" },
  ], {intent:"ask_recommendation"}), null);
});

test("AI-37 follow-up keeps explicit accommodation type through verified catalog selection", () => {
  const cases = [
    ["What family room do you recommend?", "family"],
    ["Which cottage would you recommend?", "cottage"],
    ["Suggest a pool shade", "pool_shade"],
    ["Recommend a function area", "function"],
    ["What double room do you suggest?", "double"],
  ];
  for (const [prior, scope] of cases) {
    assert.equal(requestedCategory(prior), scope, prior);
    const turns = [
      { role:"user", text:prior },
      { role:"assistant", text:guestCountQuestion("english") },
    ];
    const pending = guestCountFollowUp("6", turns, {
      intent:"ask_recommendation",
    });
    assert.equal(pending.category, scope);
    assert.equal(requestedCategory(recommendationLookupMessage(scope,6)), scope);
  }
});
