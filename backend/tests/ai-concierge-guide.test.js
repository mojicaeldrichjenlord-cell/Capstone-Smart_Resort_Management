"use strict";
// AI-48 regression tests. Run after pull from repository root:
// node --test backend/tests/ai-concierge-guide.test.js
// No paid Gemini calls, DB queries or payment transactions.
const test = require("node:test");
const assert = require("node:assert/strict");
const { matchConciergeGuide, isMixedEntranceAndCorkage, conciergeGuideReply } =
  require("../controllers/ai/aiConciergeGuidance");
const { isCatalogRateOverviewQuestion, catalogRateOverview } =
  require("../controllers/ai/aiCatalogRateGuide");
const { isResortQuestion } =
  require("../controllers/ai/aiResortScopeGuard");

test("Common online booking language triggers safe handoff", () => {
  for (const question of [
    "Paano mag-book at magbayad?",
    "How do I book and pay?",
    "Gusto ko nang magbook",
    "¿Cómo reservar?",
    "如何预订",
    "我要预订",
  ]) assert.equal(matchConciergeGuide(question), "booking", question);
  assert.equal(matchConciergeGuide("What is my booking status?"), null);
  assert.match(conciergeGuideReply("booking", "taglish"), /50%.*PayPal/i);
  assert.match(conciergeGuideReply("booking", "english"), /no payment-proof upload/i);
});
test("Custom events refer guests to official staff, not invented rates", () => {
  assert.equal(matchConciergeGuide("May birthday package kayo?"), "special_event");
  assert.equal(matchConciergeGuide("Wedding and team building requirements"), "special_event");
  const reply = conciergeGuideReply("special_event", "english");
  assert.match(reply, /0956-912-5625/);
  assert.match(reply, /0967-817-0662/);
  assert.match(reply, /resortarvicseaside@gmail.com/);
  assert.match(reply, /aren't confirmed/i);
});
test("Entrance and corkage are handled as separate source-truth facts", () => {
  assert.equal(isMixedEntranceAndCorkage("Ano ang policies sa entrance fee at corkage?"), true);
  assert.equal(isMixedEntranceAndCorkage("What is the room rate?"), false);
  const reply = conciergeGuideReply("entrance_corkage", "taglish");
  assert.match(reply, /entrance fee/i);
  assert.match(reply, /hindi pa confirmed/i);
  assert.doesNotMatch(reply, /₱\d/);
});
test("Rates and capacity come only from supplied current catalog rows", () => {
  const rows = [
    {id:1,room_name:"Family Room A",category_name:"Rooms",status:"available",day_price:4000,overnight_price:5000,capacity:8},
    {id:2,room_name:"Shade One",category_name:"Cottages",status:"available",day_price:800,overnight_price:null,capacity:8},
    {id:3,room_name:"Do Not Display",category_name:"Rooms",status:"maintenance",day_price:123,overnight_price:123,capacity:2},
  ];
  assert.equal(isCatalogRateOverviewQuestion("Magkano ang rooms at cottages?"), true);
  assert.equal(isCatalogRateOverviewQuestion("How much is Family Room A?"), false);
  const {reply,rows:chosen} = catalogRateOverview(rows, "Magkano ang rooms at cottages?", "taglish");
  assert.match(reply, /Family Room A.*₱4,000\.00.*₱5,000\.00.*8 pax/);
  assert.match(reply, /Shade One.*₱800\.00.*Overnight not listed/);
  assert.doesNotMatch(reply, /Do Not Display/);
  assert.equal(chosen.length, 2);
});
test("New resort intents are permitted but general trivia stays blocked", () => {
  for (const q of ["May birthday package kayo?", "Paano mag-book at magbayad?"])
    assert.equal(isResortQuestion(q), true, q);
  assert.equal(isResortQuestion("Who is Jose Rizal?"), false);
});
