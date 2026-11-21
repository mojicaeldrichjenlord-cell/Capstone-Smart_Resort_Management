"use strict";
/*
 * AI-36 — deterministic Arvic Resort-only intent scope.
 * All checks are local; no Gemini API, database, bookings or payment access.
 */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  isResortQuestion, resortOnlyReply,
} = require("../controllers/ai/aiResortScopeGuard");

test("AI-36 unrelated general-knowledge questions are blocked", () => {
  for (const message of [
    "ano full name ni bonifacio",
    "si jose rizal",
    "Ano ang buong pangalan ni Andres Bonifacio?",
    "What is the full name of Jose Rizal?",
    "Who was Jose Rizal?",
    "Who is the president of the Philippines?",
    "What is 2+2?",
    "Solve this math equation",
    "Tell me a joke",
    "Write Python code for a booking system",
    "What's the capital of Japan?",
    "What's the Bitcoin price?",
    "Can you make a recipe for adobo?",
    "What's the weather forecast?",
  ]) {
    assert.equal(isResortQuestion(message), false, message);
  }
});

test("AI-36 saved accommodation and old chat history never unlock unrelated facts", () => {
  const context = { room_id: 61, room_name: "Family Room A", guests: 20 };
  const recent = [
    { role: "user", text: "Ilang cottages meron kayo?" },
    { role: "assistant", text: "May 45 cottages po kami." },
  ];
  for (const message of [
    "ano full name ni bonifacio", "si jose rizal",
    "What is the full name of Jose Rizal?", "Who was Jose Rizal?",
    "Who is the president of the Philippines?",
    "ano full name ni bonifacio? May parking ba sa resort?",
  ]) {
    assert.equal(isResortQuestion(message, context, recent), false, message);
  }
});

test("AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed", () => {
  for (const message of [
    "May parking po ba kayo? Libre ba kahit bus?",
    "Ilang cottages meron kayo?",
    "What's the cheapest room?",
    "Which room fits 20 guests?",
    "Magkano po ang downpayment?",
    "How do I make a reservation?",
    "How can I book?",
    "Can I book?",
    "How can you help me book?",
    "May CR po yung Family Room B?",
    "may cr ba sya?",
    "Do you have Wi-Fi?",
    "Pwede ba pets?",
    "Do you accept walk-ins?",
    "Pwede po ba mag walk in?",
    "What time is check-in?",
    "Saan po kayo?",
    "Paano po kayo makontak?",
    "May foods po ba kayo?",
    "I need help planning a family trip. Please explain the basics.",
    "What is the cancellation and refund policy?",
    "Hello", "Good evening!",
    "¿Puedo cancelar mi reserva?",
    "Hola, quiero una habitación disponible.",
    "你好，我想预订一个房间。",
    "退款怎么办？",
  ]) {
    assert.equal(isResortQuestion(message), true, message);
  }
});

test("AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge", () => {
  const context = { room_id: 15, room_name: "Small Nipa Hut 2" };
  const recent = [{ role: "user", text: "Ilang cottages meron kayo?" }];
  for (const [message, room, turns] of [
    ["magkano yan?", context, []],
    ["ano naman ang pinakamura sa mga yun?", {}, recent],
    ["20 kami", {}, recent],
    ["overnight naman?", {}, recent],
  ]) {
    assert.equal(isResortQuestion(message, room, turns), true, message);
  }
  assert.equal(isResortQuestion("magkano yan?"), false);
  assert.equal(isResortQuestion("si jose rizal", context, recent), false);
});

test("AI-36 refusal is short, localized and does not include the trivia answer", () => {
  for (const lang of ["english","tagalog","taglish","spanish","mandarin"]) {
    const answer = resortOnlyReply(lang);
    assert.ok(answer.length > 30, lang);
    assert.match(answer, /resort|Arvic Seaside/i);
    assert.doesNotMatch(answer, /Bonifacio|Rizal|Protacio|Mercado/i);
  }
  assert.match(resortOnlyReply("taglish"), /Resort inquiries lang po/);
});

test("AI-36 scope check occurs before all Gemini and catalog calls", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../controllers/ai/geminiChatController.js"), "utf8");
  const start = src.indexOf("exports.chatWithGemini = async");
  // Short count replies from an already-pending resort recommendation are
  // the only additional allowance added to the scope gate in AI-37.
  const guard = src.indexOf("if (!isResortQuestion(message, scopeContext, recentScopeTurns) &&", start);
  const policy = src.indexOf("if (isGeneralOnlineDownpaymentQuestion(message))", start);
  const catalog = src.indexOf("const [countRows] = await db.promise().query(", start);
  const extraction = src.indexOf("await extractStructuredIntent(message, requestContext)", start);
  assert.ok(start >= 0 && guard > start && guard < policy &&
    guard < catalog && guard < extraction);
  assert.match(src, /mode: "resort_scope_only"/);
  assert.match(src, /resort_scope_allowed: false/);
  assert.match(src, /recommendation_cards: \[\]/);
  assert.match(src, /Never answer unrelated history, politics, homework, trivia/);
});
