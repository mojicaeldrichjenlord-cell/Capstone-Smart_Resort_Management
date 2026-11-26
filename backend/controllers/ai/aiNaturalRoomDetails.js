// Natural, fact-grounded answers for "ano meron", "what comes with this
// room?" and similar open-ended accommodation detail questions.
// No hard-coded room inventory, no Gemini spend, and no DB writes.
"use strict";

const {
  isPlainCottageCategory, isFunctionAreaCategory,
  FUNCTION_AREA_AMENITIES, hasListedAmenities,
} = require("./aiAccommodationCategoryPolicy");

// Deliberately broad phrasing but narrow intent: a FULL inclusion question,
// not one-feature questions ("does it have a CR?"), booking, or room availability.
function isNaturalRoomDetailsQuestion(message) {
  const text = String(message || "").normalize("NFKC").trim().toLowerCase().replace(/\bano[\s-]+ano\b/g, "ano");
  if (!text || text.length > 300) return false;
  if (/\b(?:available|availability|vacant|price|cost|magkano|book|reservation|reserve|open\s+now|occupied|downpayment|refund)\b/.test(text))
    return false;
  return (
    /\b(?:ano(?:ng)?|what)\s+(?:po\s+)?(?:ang\s+)?(?:mga\s+)?(?:meron|may|included|inclusions?|inclusion|amenities|facilities|features|kasama|nasa\s+loob)\b/.test(text) ||
    /\b(?:what(?:'s| is)\s+(?:inside|included|in)\b|what\s+(?:does|do)\s+(?:(?:the|this|that)\s+)?(?:room|cottage|pavilion|family|double|single|it)\b.{0,70}\bhave\b)/.test(text) ||
    /\b(?:ano(?:ng)?\s+kasama|may\s+ano\s+sa|ano(?:ng)?\s+laman|what\s+comes\s+with)\b/.test(text) ||
    /\bwhat\s+(?:are|is)\s+(?:the\s+)?(?:listed\s+)?(?:inclusions|amenities|facilities|features)\b/.test(text) ||
    /^(?:please\s+)?(?:tell\s+me\s+(?:more\s+)?about|can\s+you\s+tell\s+me\s+about|pakikwento|paki\s*kwento)\b/.test(text) ||
    /^(?:can\s+you\s+)?(?:describe|explain)\s+(?:this\s+|that\s+|the\s+)?(?:room|accommodation|family\s+room|double\s+room|single\s+room)\b/.test(text)
  );
}

function safeFact(value, max = 90) {
  return String(value ?? "")
    // Strip executable HTML content, not just tags, before summarizing
    // Admin-supplied description/amenities as ordinary facts.
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ")
    .trim().slice(0, max);
}

function listedAmenityParts(row) {
  const facts = isFunctionAreaCategory(row) && !hasListedAmenities(row)
    ? FUNCTION_AREA_AMENITIES
    : String(row?.amenities || "").split(/[\n\r,;|•]+/);
  return [...new Set(facts.map(x => safeFact(x, 90)).filter(Boolean))].slice(0, 12);
}

function naturalList(items) {
  if (items.length < 2) return items.join("");
  if (items.length === 2) return items.join(" at ");
  return items.slice(0, -1).join(", ") + ", at " + items.at(-1);
}

function naturalRoomDetailsReply(row, language = "taglish") {
  const filipino = ["tagalog", "taglish"].includes(String(language).toLowerCase());
  const everydayTaglish = String(language).toLowerCase() === "taglish";
  const name = safeFact(row?.room_name || row?.name || "Accommodation");
  // The resort specifically confirmed that regular Cottage-category
  // accommodations do not include amenities. This must NEVER classify
  // "Single Room Cottage 1" as an ordinary cottage.
  if (isPlainCottageCategory(row)) {
    return filipino
      ? "Wala pong kasamang amenities sa " + name + "."
      : name + " does not include amenities.";
  }
  const facts = listedAmenityParts(row);
  if (!facts.length) {
    // A missing TEST DB record is not evidence that the real room has no
    // inclusions. Never fill gaps by guessing from another accommodation.
    return filipino
      ? (everydayTaglish
        ? "Hindi pa po complete yung listed amenities ng " + name + ". Paki-confirm na lang po sa Front Desk."
        : "Hindi pa po kumpleto ang nakalistang amenities ng " + name + ". Puwede po itong i-confirm sa Front Desk.")
      : "The listed amenities for " + name + " aren't complete yet. Please confirm with the Front Desk.";
  }

  // Convert only firmly supported structured text into smoother sentences.
  // If there's an unusual Admin-entered amenity, retain its exact meaning.
  const normalized = facts.map(x => x.toLowerCase());
  const count2Bedrooms = normalized.includes("2 separate bedrooms");
  const perBedroomAC = normalized.includes("air conditioner in each bedroom");
  const perBedroomCabinets = normalized.includes("cabinets in each bedroom");
  let details = facts.map(x => x.charAt(0).toLowerCase() + x.slice(1));
  if (count2Bedrooms && (perBedroomAC || perBedroomCabinets)) {
    const removals = new Set(["2 separate bedrooms", "air conditioner in each bedroom", "cabinets in each bedroom"]);
    details = details.filter(x => !removals.has(x.toLowerCase()));
    const bedroomPhrase = perBedroomAC && perBedroomCabinets
      ? (filipino ? "2 bedrooms na parehong may aircon at cabinets" :
         "2 bedrooms, each with air conditioning and cabinets")
      : perBedroomAC
        ? (filipino ? "2 bedrooms na parehong may aircon" :
           "2 bedrooms, each with air conditioning")
        : (filipino ? "2 bedrooms na parehong may cabinets" :
           "2 bedrooms, each with cabinets");
    details.push(bedroomPhrase);
  }

  const freeRaw = row?.free_entrance_pax;
  const free = freeRaw === null || freeRaw === undefined || String(freeRaw).trim() === ""
    ? NaN : Number(freeRaw);
  const freeStatement = Number.isSafeInteger(free) && free > 0
    ? (filipino ? " May " + free + " pax na free entrance din po." :
       " Free entrance is included for " + free + " guests.")
    : "";
  return filipino
    ? (everydayTaglish
      ? "Sa " + name + " po, included yung " + naturalList(details) + "." + freeStatement
      : "Sa " + name + " po, kasama ang " + naturalList(details) + "." + freeStatement)
    : name + " includes " + naturalList(details) + "." + freeStatement;
}

module.exports = { isNaturalRoomDetailsQuestion, listedAmenityParts, naturalRoomDetailsReply };
