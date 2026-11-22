"use strict";
/**
 * AI-37 — Guest-first personalized accommodation recommendations.
 * Resort guests may browse the catalog freely. A personal "recommend a room"
 * request must first establish how many guests are staying, so random
 * default cards are never mistaken for a capacity-appropriate suggestion.
 * All helpers are deterministic and do not call Gemini or MySQL.
 */
const { requestedCategory, guestCountFromText } = require("./aiVerifiedPreview");

const normal = input => String(input || "").normalize("NFKC").toLowerCase().trim();

// Handle varied natural Taglish and English; avoid selecting one exact room
// via the "Ask About This" card (which is an overview, not a new group search).
function isPersonalizedRecommendation(message) {
  const q = normal(message);
  if (!q || q.length > 500) return false;
  if (/^recommend this accommodation for me\s*:/i.test(q)) return false;
  const suggest = /\b(?:recommend(?:ation|ations)?|suggest(?:ion|ions)?|marerecommend|marecommend|mairerecommend|irerecommend|mare-recommend|ma-recommend|massuggest|masusuggest|masuggest|ma-suggest|best\s+(?:room|accommodation)|maganda(?:ng)?\s+(?:(?:para\s+sa)\s+)?(?:room|rooms|kwarto|kuwarto|cottage)|suitable\s+(?:room|accommodation)|help\s+me\s+(?:choose|find)\s+(?:a\s+)?(?:room|cottage|accommodation))\b/i.test(q);
  const target = /\b(?:rooms?|kwarto|kuwarto|cottages?|kubo|nipa|huts?|accommodations?|pavilions?|function\s+areas?|shades?|stays?)\b/i.test(q);
  // "Ano ang marerecommend mo?" can be a follow-up to a previous room
  // discussion, but without a category we conservatively request guests.
  const broad = /^(?:(?:ano|anong|what|which|may|can|could|what's)\s+)?(?:\w+\s+){0,6}(?:marerecommend|marecommend|mairerecommend|irerecommend|massuggest|masusuggest|masuggest|ma-suggest|recommend|suggest)\b/i.test(q);
  // Exclude amenity and explicit per-room payment queries.
  if (/\b(?:payment|deposit|downpayment|refund|cancel|amenit(?:y|ies)|cr|bathroom|aircon|wi-?fi)\b/i.test(q))
    return false;
  // "Anong room ang maganda para sa dalawa?" is a personal room
  // recommendation too: the adjective can come AFTER the room noun.
  const descriptive = /\bmaganda(?:ng)?\b/i.test(q) &&
    /\b(?:ano|anong|which|what|may|meron|pwede|puwede)\b/i.test(q);
  return (suggest || descriptive) && (target || broad);
}

// Read simple explicit counts (4 kami, 4 pax, 4 guests, 4 po,
// 'apat kami'). Do not infer 4 guests from an accommodation name/rate.
function explicitGuestCount(message) {
  const q = normal(message);
  let count = guestCountFromText(q);
  if (!count) {
    const match = q.match(/^\s*(\d{1,3})\s*(?:kami|mi|po|pax|guests?|persons?|people|tao|adults?|persons?\s+po)?\s*[.!?]?\s*$/i) ||
      q.match(/\b(?:for|para\s+sa|good\s+for)\s+(\d{1,3})\s*(?:guests?|pax|people|persons?|tao|kami)?\b/i) ||
      q.match(/\b(\d{1,3})\s*(?:kami|mi|guests?|pax|people|persons?|tao)\b/i);
    if (match) count = Number(match[1]);
  }
  // AI-64: Natural compound requests use "10 po kami" or "sampu po kami"
  // before other questions. Read that as a party size, not a date or price.
  if (!count) {
    const polite = q.match(/\b(\d{1,3})\s+(?:po\s+)?(?:kami|kaming|tayo|guests?|pax|people|persons?|tao|bisita)\b/i);
    if (polite) count = Number(polite[1]);
  }
  if (!count) {
    const countWords = { isa:1, isang:1, dalawa:2, tatlo:3, apat:4,
      lima:5, anim:6, pito:7, walo:8, siyam:9, sampu:10 };
    const wordCount = q.match(/\b(isa|isang|dalawa|tatlo|apat|lima|anim|pito|walo|siyam|sampu)\s+(?:po\s+)?(?:kami|kaming|tayo|bisita|tao|guests?|pax)\b/i);
    if (wordCount) count = countWords[wordCount[1]];
  }
  if (!count) {
    const filipino = { isa:1, isang:1, dalawa:2, tatlo:3, apat:4, lima:5,
      anim:6, pito:7, walo:8, siyam:9, sampu:10 };
    const match = q.match(/^\s*(isa|isang|dalawa|tatlo|apat|lima|anim|pito|walo|siyam|sampu)\s*(?:kami|mi|po|tao|guests?|pax)?\s*[.!?]?\s*$/i);
    if (match) count = filipino[match[1]];
  }
  count = Number(count);
  return Number.isSafeInteger(count) && count >= 1 && count <= 200 ? count : 0;
}

function savedGuestCount(context = {}) {
  const guests = Number(context?.guests);
  return Number.isSafeInteger(guests) && guests > 0 && guests <= 200 ? guests : 0;
}

function guestCountQuestion(language = "taglish") {
  switch(language) {
    case "english": return "Sure! How many guests will be staying?";
    case "tagalog": return "Sige po! Ilan po kayong bisita?";
    case "bisaya": return "Sige! Pila mo kabuok nga guests?";
    case "spanish": return "¡Claro! ¿Cuántas personas se alojarán?";
    case "mandarin": return "好的！请问一共有几位客人入住？";
    default: return "Sure po! Ilan po kayong guests?";
  }
}

// A guest-count reply may be as short as "4 kami". Require the most
// recent assistant message to be OUR guest-count question, plus a prior
// personalized recommendation question. This avoids hijacking unrelated
// numerical replies or old browsing history.
function pendingRecommendation(recentTurns = [], context = {}) {
  if (context?.intent !== "ask_recommendation" || !Array.isArray(recentTurns))
    return null;
  const recent = recentTurns.slice(-6).filter(t => t &&
    (t.role === "user" || t.role === "assistant") && typeof t.text === "string");
  const latest = recent.at(-1);
  const askedGuests = latest?.role === "assistant" && (
    /(?:ilan\s+(?:po\s+)?kayong\s+(?:guests?|bisita)|how many guests|pila\s+mo\s+kabuok|cuántas personas|几位客人)/i.test(latest.text));
  if (!askedGuests) return null;
  const previous = recent.slice(0, -1).reverse().find(t => t.role === "user");
  if (!previous || !isPersonalizedRecommendation(previous.text)) return null;
  return { category: requestedCategory(previous.text) || "room" };
}

function guestCountFollowUp(message, recentTurns = [], context = {}) {
  const pending = pendingRecommendation(recentTurns, context);
  const guests = explicitGuestCount(message);
  // A short answer only; longer multi-intent text continues normal parsing.
  return pending && guests && normal(message).length <= 48
    ? { ...pending, guests } : null;
}

// AI-38: A correction like "7 pala" immediately after a VERIFIED room
// recommendation is still a resort request, even without "room"/"guest".
// Require BOTH an active recommendation context and a recent recommendation
// answer; otherwise short numbers could hijack unrelated conversations.
function correctedGuestCount(message) {
  const q = normal(message).replace(/[’‘]/g, "'").trim();
  if (!q || q.length > 75 ||
      /(?:₱|\b(?:php|pesos?|price|rate|room\s*#?|am|pm|minutes?|hours?|date|november|december)\b|\d{4}-\d{2}-\d{2})/i.test(q))
    return 0;
  const countWords = {
    isa:1, isang:1, dalawa:2, tatlo:3, apat:4, lima:5,
    anim:6, pito:7, walo:8, siyam:9, sampu:10,
  };
  // Limit correction syntax to guest counts, not questions involving
  // unrelated people or facts. "5 na lang kami" and "actually 7" work.
  const match = q.match(/^(?:(?:sorry|ay|oops|actually|wait|correction|make it|we are|we're)\s+){0,2}(\d{1,3}|isa|isang|dalawa|tatlo|apat|lima|anim|pito|walo|siyam|sampu)(?:\s+(?:na\s+lang|na\s+pala|na\s+kami|na\s+lang\s+mi|lang|pala|kami|mi|po|guests?|pax|people|persons?|tao|instead|actually|sorry|oops|ay|ah)){0,4}\s*[.!?]?$/i);
  if (!match) return 0;
  const guests = /^\d+$/.test(match[1]) ? Number(match[1]) : countWords[match[1]];
  return Number.isSafeInteger(guests) && guests >= 1 && guests <= 200 ? guests : 0;
}

function guestCountCorrection(message, recentTurns = [], context = {}) {
  const guests = correctedGuestCount(message);
  if (!guests || context?.intent !== "ask_recommendation" ||
      !savedGuestCount(context) || !Array.isArray(recentTurns)) return null;
  const recent = recentTurns.slice(-6).filter(turn => turn &&
    (turn.role === "user" || turn.role === "assistant") &&
    typeof turn.text === "string");
  const latest = recent.at(-1);
  // Only the immediate follow-up to our verified accommodation previews.
  // A prior room_id alone is NOT proof of an active recommendation.
  if (latest?.role !== "assistant" ||
      !/(?:preview (?:ng|of|for|sa)|mao\s+ni\s+ang\s+preview|matching accommodations?|matching previews?|listed accommodation|matching room|matching units?|matching options?|matching (?:cottage|function area)|listed capacity)/i.test(latest.text))
    return null;
  const previousUser = recent.slice(0, -1).reverse().find(t => t.role === "user");
  if (!previousUser ||
      !(explicitGuestCount(previousUser.text) ||
        correctedGuestCount(previousUser.text))) return null;
  // Reuse the user's original category, not the category/identity of
  // the single last displayed room. A 10->7 correction may find smaller rooms.
  const original = recent.slice(0, -1).reverse().find(t =>
    t.role === "user" && isPersonalizedRecommendation(t.text));
  const category = original ? requestedCategory(original.text) || "room" :
    // If older turns are truncated, preserve the explicitly stored category.
    String(context?.recommendation_category || "room");
  const supported = new Set([
    "room","single","family","double","single_poolside","single_cottage",
    "cottage","shade","big_shade","small_shade","pool_shade","nipa_hut",
    "big_nipa","small_nipa","function",
  ]);
  return { guests, category: supported.has(category) ? category : "room",
    corrected: true };
}

// Translate category keys back to the spelling understood by the verified
// accommodation catalog selector. A "family" recommendation MUST search
// family rooms, not quietly return generic rooms or no cards.
function recommendationLookupMessage(category, guests) {
  const categoryText = {
    room: "room", single: "single room", family: "family room",
    double: "double room", single_poolside: "single room poolside",
    single_cottage: "single room cottage", cottage: "cottage",
    shade: "shade", big_shade: "big shade", small_shade: "small shade",
    pool_shade: "pool shade", nipa_hut: "nipa hut",
    big_nipa: "big nipa hut", small_nipa: "small nipa hut",
    function: "function area",
  }[category] || "room";
  return "Recommend a " + categoryText + " for " + guests + " guests";
}

module.exports = {
  isPersonalizedRecommendation, explicitGuestCount, savedGuestCount,
  guestCountQuestion, pendingRecommendation, guestCountFollowUp,
  correctedGuestCount, guestCountCorrection, recommendationLookupMessage,
};
