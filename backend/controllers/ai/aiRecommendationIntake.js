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
  const suggest = /\b(?:recommend(?:ation|ations)?|suggest(?:ion|ions)?|marerecommend|marecommend|mairerecommend|irerecommend|mare-recommend|ma-recommend|massuggest|masusuggest|masuggest|ma-suggest|best\s+(?:room|accommodation)|magandang\s+(?:room|kwarto|kuwarto|cottage)|suitable\s+(?:room|accommodation)|help\s+me\s+(?:choose|find)\s+(?:a\s+)?(?:room|cottage|accommodation))\b/i.test(q);
  const target = /\b(?:rooms?|kwarto|kuwarto|cottages?|kubo|nipa|huts?|accommodations?|pavilions?|function\s+areas?|shades?|stays?)\b/i.test(q);
  // "Ano ang marerecommend mo?" can be a follow-up to a previous room
  // discussion, but without a category we conservatively request guests.
  const broad = /^(?:(?:ano|anong|what|which|may|can|could|what's)\s+)?(?:\w+\s+){0,6}(?:marerecommend|marecommend|mairerecommend|irerecommend|massuggest|masusuggest|masuggest|ma-suggest|recommend|suggest)\b/i.test(q);
  // Exclude amenity and explicit per-room payment queries.
  if (/\b(?:payment|deposit|downpayment|refund|cancel|amenit(?:y|ies)|cr|bathroom|aircon|wi-?fi)\b/i.test(q))
    return false;
  return suggest && (target || broad);
}

// Read simple explicit counts (4 kami, 4 pax, 4 guests, 4 po,
// 'apat kami'). Do not infer 4 guests from an accommodation name/rate.
function explicitGuestCount(message) {
  const q = normal(message);
  let count = guestCountFromText(q);
  if (!count) {
    const match = q.match(/^\s*(\d{1,3})\s*(?:kami|po|pax|guests?|persons?|people|tao|adults?|persons?\s+po)?\s*[.!?]?\s*$/i) ||
      q.match(/\b(?:for|para\s+sa|good\s+for)\s+(\d{1,3})\s*(?:guests?|pax|people|persons?|tao|kami)?\b/i) ||
      q.match(/\b(\d{1,3})\s*(?:kami|guests?|pax|people|persons?|tao)\b/i);
    if (match) count = Number(match[1]);
  }
  if (!count) {
    const filipino = { isa:1, isang:1, dalawa:2, tatlo:3, apat:4, lima:5,
      anim:6, pito:7, walo:8, siyam:9, sampu:10 };
    const match = q.match(/^\s*(isa|isang|dalawa|tatlo|apat|lima|anim|pito|walo|siyam|sampu)\s*(?:kami|po|tao|guests?|pax)?\s*[.!?]?\s*$/i);
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
    /(?:ilan\s+(?:po\s+)?kayong\s+(?:guests?|bisita)|how many guests|cuántas personas|几位客人)/i.test(latest.text));
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

module.exports = {
  isPersonalizedRecommendation, explicitGuestCount, savedGuestCount,
  guestCountQuestion, pendingRecommendation, guestCountFollowUp,
};
