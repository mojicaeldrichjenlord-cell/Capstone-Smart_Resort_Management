"use strict";
/* AI-37 pure tests: no Gemini, no SQL, no booking/payment operations. */
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isPersonalizedRecommendation, explicitGuestCount, savedGuestCount,
  guestCountQuestion, guestCountFollowUp, correctedGuestCount,
  guestCountCorrection, recommendationLookupMessage,
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


test("AI-38 natural 10-to-7 revisions are recognized without inventing other numbers", () => {
  for (const q of ["7 pala", "7 na lang", "7 na pala kami",
    "5 na lang kami", "sorry 7 pala", "actually 7", "7 guests pala",
    "pito pala", "7"]) {
    const expected = q.startsWith("5") ? 5 : 7;
    assert.equal(correctedGuestCount(q), expected, q);
  }
  for (const q of ["7pm pala", "7 pm pala", "₱7 pala",
    "room 7 pala", "7,000", "Who is Jose Rizal?",
    "the 7 wonders of the world", "700 guests", "2026-11-21"]) {
    assert.equal(correctedGuestCount(q), 0, q);
  }
});

test("AI-38 a guest-count correction requires an immediately previous resort recommendation", () => {
  const recent = [
    { role: "user", text: "Anong room ang massuggest mo?" },
    { role: "assistant", text: guestCountQuestion("taglish") },
    { role: "user", text: "10" },
    { role: "assistant", text: "Ito po yung preview ng Family Room B. Click niyo ang View Details." },
  ];
  const context = {
    intent: "ask_recommendation", guests: 10, room_id: 94,
    room_name: "Family Room B", language_style: "taglish",
  };
  assert.deepEqual(guestCountCorrection("7 pala", recent, context),
    { guests: 7, category: "room", corrected: true });
  assert.deepEqual(guestCountCorrection("5 na lang kami", recent, context),
    { guests: 5, category: "room", corrected: true });
  assert.equal(guestCountCorrection("7 pala", recent, {}), null);
  assert.equal(guestCountCorrection("7 pala", [], context), null);
  assert.equal(guestCountCorrection("7 pala",
    [...recent.slice(0, 3), { role: "assistant", text: "Yes po, free parking." }],
    context), null);
  assert.equal(guestCountCorrection("Who was Bonifacio?", recent, context), null);
});

test("AI-38 the original requested category overrides the last suggested room", () => {
  const previous = [
    { role: "user", text: "Recommend a family room" },
    { role: "assistant", text: guestCountQuestion("english") },
    { role: "user", text: "10" },
    { role: "assistant", text: "Here's the preview for Family Room B." },
  ];
  const change = guestCountCorrection("7 pala", previous, {
    intent:"ask_recommendation", guests:10, room_id:94, room_name:"Family Room B",
  });
  assert.equal(change.category, "family");
  assert.equal(requestedCategory(recommendationLookupMessage(change.category, change.guests)), "family");
});


test("AI-45 descriptive Filipino recommendations preserve written guest count", () => {
  const { guestCountFromText } = require("../controllers/ai/aiVerifiedPreview");
  for (const q of [
    "Anong room ang maganda para sa dalawa?",
    "Anong family room ang maganda para sa dalawa?",
    "Which room is best for two?",
    "Anong rooms ang pwede para sa dalawa?",
  ]) {
    assert.equal(guestCountFromText(q), 2, q);
    assert.equal(explicitGuestCount(q), 2, q);
  }
  assert.equal(isPersonalizedRecommendation("Anong room ang maganda para sa dalawa?"), true);
  assert.equal(isPersonalizedRecommendation("Anong family room ang maganda para sa dalawa?"), true);
  assert.equal(isPersonalizedRecommendation("Anong room ang maganda?"), true);
  assert.equal(guestCountFromText("Family Room Two"), 0);
  assert.equal(guestCountFromText("Room 7,000"), 0);
});

test("AI-45 2-to-7 corrections need immediately preceding verified preview", () => {
  const original = "Anong room ang maganda para sa dalawa?";
  const recent = [
    {role:"user", text:"Nihao ma?"},
    {role:"assistant", text:"你好！"},
    {role:"user", text:original},
    {role:"assistant", text:"Ito po yung matching accommodations. Check niyo lang yung photos and details sa cards."},
  ];
  const ctx = {intent:"ask_recommendation", guests:2, recommendation_category:"room", language_style:"taglish"};
  for (const q of ["Pito pala kami", "7 pala kami", "7"]) {
    assert.deepEqual(guestCountCorrection(q, recent, ctx),
      {guests:7, category:"room", corrected:true}, q);
  }
  assert.equal(guestCountCorrection("7pm pala", recent, ctx), null);
  assert.equal(guestCountCorrection("Pito pala kami", recent,
    {guests:2, recommendation_category:"room"}), null);
  assert.equal(guestCountCorrection("Pito pala kami",
    [...recent.slice(0,-1), {role:"assistant",text:"Yes, free parking ang resort."}], ctx), null);
});
