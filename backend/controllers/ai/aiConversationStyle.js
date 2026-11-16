// Natural customer conversation + verified accommodation-card data.
// Pure helpers. No Gemini, database or booking writes in this module.
"use strict";

function normalizeRecentTurns(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(-12)
    .filter((entry) => entry && typeof entry === "object" &&
      ["user", "assistant"].includes(entry.role) && typeof entry.text === "string")
    .map((entry) => ({
      role: entry.role,
      text: entry.text.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 240),
    }))
    .filter((entry) => entry.text)
    .slice(-6);
}

// Only surface photo cards for a new accommodation search. A follow-up like
// "Magkano yan?" should answer the selected property, not spam the chat with
// another three cards or resurrect outdated suggestions.
function wantsAccommodationCards(message, intent) {
  const text = String(message || "").normalize("NFKC").toLowerCase().trim();
  if (!text) return false;
  if (/\b(?:magkano|how much|amenit(?:y|ies)|bathroom|toilet|cr|aircon|air.condition|price|rate|cost|presyo|inclusion|details?|tell me more)\b/.test(text) &&
      !/\b(?:recommend|suggest|options?|choices?|show|list|hanap|ibang|other|marerecommend)\b/.test(text)) {
    return false;
  }
  if (/\b(?:recommend|recommendation|suggest|suggestion|options?|choices?|show me|list|hanap|marerecommend|irerecommend|ibang|other|looking for|available rooms?|may (?:room|kwarto|cottage|family room|pavilion))\b/.test(text)) {
    return true;
  }
  if (/\b(?:rooms?|cottages?|accommodations?|family room|pavilion|kwarto|kuwarto)\b/.test(text) &&
      /\b(?:meron|may|have|need|for|para|available|pax|guests?|people|persons?)\b/.test(text)) {
    return true;
  }
  return ["ask_recommendation"].includes(String(intent || "")) &&
    /\b(?:rooms?|cottages?|accommodations?|family|pavilion|good for|pax|guests?)\b/.test(text);
}

function asPositiveRate(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function verifiedAccommodationCards(rows, availabilityVerified = false) {
  if (!Array.isArray(rows)) return [];
  const seen = new Set();
  return rows.filter((room) => {
    const id = Number(room?.id);
    const status = String(room?.status || "available").toLowerCase();
    if (!Number.isSafeInteger(id) || id < 1 || status !== "available" || seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, 3).map((room) => ({
    id: Number(room.id),
    name: String(room.room_name || room.name || "Accommodation").slice(0, 110),
    image: typeof room.image === "string" ? room.image.slice(0, 700) : "",
    category: String(room.category_name || room.category || "Accommodation").slice(0, 100),
    description: String(room.description || "").slice(0, 260),
    capacity: Math.max(0, Number(room.capacity) || 0),
    day_price: asPositiveRate(room.day_price),
    overnight_price: asPositiveRate(room.overnight_price),
    extended_price: asPositiveRate(room.extended_price),
    availability_verified: Boolean(availabilityVerified),
  }));
}

module.exports = { normalizeRecentTurns, wantsAccommodationCards, verifiedAccommodationCards };
