// Confirmed resort amenity policy for non-room accommodation categories.
// Important: "Single Room Cottage" is a ROOM by category, not a cottage.
// No database writes; prefer Admin-managed DB amenities when present.
"use strict";

function normalizedCategory(room) {
  return String(room?.category_name || room?.category || "")
    .normalize("NFKC").trim().toLowerCase();
}

function isPlainCottageCategory(room) {
  // Inspect the CATEGORY, never a name containing "cottage".
  return /^cottages?$/.test(normalizedCategory(room));
}

function isFunctionAreaCategory(room) {
  return /^function\s*areas?$/.test(normalizedCategory(room));
}

const FUNCTION_AREA_AMENITIES = Object.freeze([
  "Tables",
  "Monoblock chairs",
  "Karaoke",
]);

function hasListedAmenities(room) {
  return typeof room?.amenities === "string" &&
    room.amenities.trim().length > 0;
}

// Only answer CATEGORY-LEVEL inclusions without a focused room context.
// Specific room questions should use the fresh read-only DB fast paths.
function generalCategoryAmenitiesReply(message, focusedId, language = "english") {
  const raw = String(message || "").normalize("NFKC").trim();
  if (raw.length > 220 || !raw) return null;
  const text = raw.toLowerCase();
  // A focused room should win for pronoun questions, but an explicit
  // category-wide question ("mga cottages", "Function Areas") is new intent.
  const categoryWide = /\b(?:mga\s+cottages?|cottages|function\s+areas|pavilions)\b/.test(text);
  if (Number(focusedId) > 0 && !categoryWide) return null;
  if (!/\b(?:amenit(?:y|ies)|inclusions?|included|kasama|meron|may)\b/.test(text)) return null;
  if (!/(?:\?|\b(?:ano|anong|what|which|may|meron|includes?|included|kasama)\b)/.test(text)) return null;
  // Never mistake the Room-category "Single Room Cottage" for a cottage.
  if (/\bsingle\s+room\s+cottage\b|\b(?:double|family)\s+room\b/.test(text)) return null;
  const filipino = ["tagalog", "taglish"].includes(String(language).toLowerCase());
  if (/\b(?:cottages?|kubo|kubo[\s-]?huts?)\b/.test(text) &&
      !/\b(?:function|pavilion|rooms?)\b/.test(text)) {
    return filipino
      ? "Wala pong kasamang amenities sa aming mga cottage."
      : "Our cottages do not include amenities.";
  }
  if (/\b(?:function\s*areas?|function\s*hall|pavilions?)\b/.test(text) &&
      !/\b(?:cottages?|rooms?)\b/.test(text)) {
    return filipino
      ? "Sa Function Areas po, kasama ang tables, monoblock chairs, at karaoke."
      : "Function Areas include tables, monoblock chairs, and karaoke.";
  }
  return null;
}

module.exports = {
  normalizedCategory,
  isPlainCottageCategory,
  isFunctionAreaCategory,
  FUNCTION_AREA_AMENITIES,
  hasListedAmenities,
  generalCategoryAmenitiesReply,
};
