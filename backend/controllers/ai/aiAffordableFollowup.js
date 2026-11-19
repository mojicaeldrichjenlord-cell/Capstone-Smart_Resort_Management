"use strict";
// AI-LIVE-05: Cheapest-listed-accommodation queries and pronoun follow-ups.
// No Gemini prices, no booking writes, no invented overnight/day equivalence.
// A price is a current ADMIN LISTED price, never confirmed slot availability.
const { categoryGroup, matchAccommodationCountQuestion } = require("./aiAccommodationCounts");

const superlative = /\b(?:pinaka\s*mura(?:ng)?|cheapest|least\s+expensive|lowest\s+(?:listed\s+)?(?:price|rate|cost)|most\s+affordable|pinakamababang\s+(?:presyo|rate))\b/i;
const unrelated = /\b(?:refund|discount|promo|voucher|payment|downpayment|deposit|balance|cancellation|cancel|parking|entrance\s+fee|wi-?fi)\b/i;
const calendar = /\b(?:tomorrow|bukas|today|tonight|ngayon|sa\s+petsa|on\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|this\s+(?:week|month)|next\s+(?:week|month)|check[ -]?in|check[ -]?out|reservation\s+date)\b/i;
const wordSets = Object.freeze({
  room: /\b(?:rooms?|kwarto|kuwarto)\b/i,
  cottage: /\b(?:cottages?|kubo|kottage|huts?|nipa\s+huts?|shades?)\b/i,
  function: /\b(?:function\s+(?:areas?|halls?)|pavill?ions?)\b/i,
});
const allWords = /\b(?:accommodations?|lahat\s+ng\s+(?:units?|accommodations?)|sa\s+(?:buong\s+)?resort|sa\s+inyo|niyo|nyo|overall)\b/i;

function explicitScopes(text) {
  const result = Object.entries(wordSets)
    .filter(([, pattern]) => pattern.test(text))
    .map(([key]) => key);
  return result.length ? result : allWords.test(text) ? ["all"] : [];
}
function recentScope(recentTurns) {
  const recentUser = (Array.isArray(recentTurns) ? recentTurns : [])
    .filter(turn => turn?.role === "user" && typeof turn.text === "string")
    .slice(-1)[0];
  if (!recentUser) return [];
  const count = matchAccommodationCountQuestion(recentUser.text);
  return count?.scopes?.length ? count.scopes : explicitScopes(recentUser.text);
}
function guestCount(text, context) {
  const found = String(text || "").match(/\b(\d{1,3})\s*(?:na\s*)?(?:guests?|pax|tao|people|persons?)\b/i);
  const n = found ? Number(found[1]) : Number(context?.guests);
  return Number.isSafeInteger(n) && n > 0 && n <= 200 ? n : 0;
}
function matchCheapestInquiry(message, recentTurns = [], context = {}) {
  const text = String(message || "").normalize("NFKC").trim();
  if (!text || text.length > 350 || !superlative.test(text) ||
      unrelated.test(text) || calendar.test(text) ||
      /\b\d{4}-\d{1,2}-\d{1,2}\b/.test(text)) return null;
  let scopes = explicitScopes(text);
  // A short "sa mga yun?" means the last user's category, not an older
  // saved accommodation that may be unrelated (e.g. Big Nipa Hut).
  if (!scopes.length) scopes = recentScope(recentTurns);
  const stay = /\b(?:overnight|night(?:time)?|gabi)\b/i.test(text) ? "night" :
    /\b(?:day\s*tour|daytime|umaga)\b/i.test(text) ? "day" : "any";
  return { scopes, stay, guests: guestCount(text, context) };
}
const validMoney = value => {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};
function rateFor(room, stay) {
  const day = validMoney(room.day_price), night = validMoney(room.overnight_price);
  if (stay === "day") return day === null ? null : { amount: day, slot: "day" };
  if (stay === "night") return night === null ? null : { amount: night, slot: "night" };
  if (day === null && night === null) return null;
  return day !== null && (night === null || day <= night)
    ? { amount: day, slot: "day" } : { amount: night, slot: "night" };
}
// This reducer works on fresh DB rows; a LIMIT is safe only if SQL orders by
// the same positive-price expression first. No hardcoded unit name or rate.
function pickCheapestRows(rows, intent) {
  const scopes = Array.isArray(intent?.scopes) ? intent.scopes : [];
  const candidates = (Array.isArray(rows) ? rows : [])
    .filter(room => String(room.status || "").trim().toLowerCase() === "available")
    .filter(room => scopes.includes("all") || scopes.includes(categoryGroup(room.category_name)))
    .filter(room => !intent?.guests || Number(room.capacity) >= intent.guests)
    .map(room => ({ room, rate: rateFor(room, intent?.stay) }))
    .filter(entry => entry.rate);
  candidates.sort((a, b) => a.rate.amount - b.rate.amount ||
    Number(a.room.id) - Number(b.room.id));
  if (!candidates.length) return { lowest: null, items: [] };
  const lowest = candidates[0].rate.amount;
  const ties = candidates.filter(entry => Math.abs(entry.rate.amount - lowest) < .005);
  return { lowest, items: ties.slice(0, 3) };
}
const peso = n => "₱" + Number(n).toLocaleString("en-PH", {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});
function scopeLabel(scopes, language) {
  const labels = language === "english"
    ? { room: "rooms", cottage: "cottages", function: "function areas", all: "accommodations" }
    : { room: "rooms", cottage: "cottages", function: "function areas", all: "accommodations" };
  return scopes.map(s => labels[s]).filter(Boolean).join(" at ") || "accommodations";
}
function cheapestReply(selection, intent, language = "taglish") {
  const scopes = intent?.scopes || [];
  const english = language === "english";
  const filipino = language === "tagalog";
  if (!scopes.length) return english
    ? "Do you mean the cheapest room, cottage, or function area?"
    : filipino
      ? "Ang pinakamurang kuwarto, cottage, o function area po ba ang hinahanap ninyo?"
      : "Sa rooms, cottages, o function areas po ba ang gusto niyong pinakamura?";
  const label = scopeLabel(scopes, language);
  if (!selection?.items?.length) return english
    ? "I couldn't find a current listed rate for the requested " + label + ". Please check the booking page or Front Desk."
    : "Wala pa po akong ma-verify na listed rate para sa " + label +
      ". Paki-check po sa booking page o Front Desk.";
  const first = selection.items[0];
  const slotLabel = first.rate.slot === "night" ? "Overnight" : "Day Tour";
  const rate = peso(selection.lowest);
  const names = selection.items.map(x => x.room.room_name).join(", ");
  const ties = selection.items.length > 1;
  const namePart = ties ? "Mga option: " + names + "." : first.room.room_name + ".";
  const otherDay = validMoney(first.room.day_price);
  const otherNight = validMoney(first.room.overnight_price);
  const otherRate = !ties && otherDay !== null && otherNight !== null
    ? (first.rate.slot === "night" ? " Day Tour: " + peso(otherDay) + "." :
       " Overnight: " + peso(otherNight) + ".") : "";
  const disclaimer = english
    ? " Booking dates and slots have not been checked."
    : " Hindi pa checked ang date at slot.";
  if (english) {
    return "For " + label + ", the lowest current listed rate is " + rate +
      " (" + slotLabel + "). " + namePart + otherRate + disclaimer;
  }
  return "Sa " + label + " po, ang lowest listed rate ay " + rate +
    " (" + slotLabel + "). " + namePart + otherRate + disclaimer;
}
module.exports = { matchCheapestInquiry, pickCheapestRows, cheapestReply, rateFor };
