// Short, verified overviews for an explicitly focused accommodation.
// Does not invent details, call Gemini, check dates, or mutate bookings/payments.
"use strict";

const { isPlainCottageCategory } = require("./aiAccommodationCategoryPolicy");
const { listedAmenityParts } = require("./aiNaturalRoomDetails");

// Keep "Tell me more about this room" on topic instead of jumping into a
// check-in questionnaire. Never hijack a question naming a different room.
function wantsFocusedRoomOverview(message, roomName) {
  const text = String(message || "").normalize("NFKC").trim().toLowerCase();
  const focusedName = String(roomName || "").normalize("NFKC").trim().toLowerCase();
  if (!text || text.length > 300 || !focusedName) return false;
  const isOverview = /^(?:(?:please|pakiusap)\s+)?(?:tell me (?:more )?about|can you tell me about|describe|more details (?:about|on)|what(?:'s| is) included (?:in|with)|what (?:are )?the (?:amenities|inclusions)|ano(?:ng| ang) (?:mga )?(?:amenities|inclusions|kasama|details)|paki(?:describe|kwento)|pakikwento)\b/i.test(text);
  if (!isOverview) return false;
  if (text.includes(focusedName)) return true;
  // A follow-up can refer to the currently selected accommodation by pronoun.
  // A different explicit property name must go through normal understanding.
  return /\b(?:this room|that room|this accommodation|that accommodation|this one|about it|in it|with it|nito|niyan|ito|iyan|yan|dito)\b/i.test(text) &&
    !/\b(?:single|double|family)\s+room\s+[a-z0-9]|\b(?:room|cottage|pavilion|shade|hut)\s+(?:\(?pool\s*side\)?\s*)?[a-z0-9]{1,4}\b/i.test(text.replace(/\bthis (?:room|accommodation)\b/g, ""));
}

// Room description and amenities are Admin-managed data, not trusted HTML.
// Clean Admin-managed DB facts before sending them back to the browser.
// The message renderer escapes HTML again; remove script/style text too.
function cleanedFact(value, maxLength = 230) {
  return String(value ?? "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ")
    .trim().slice(0, maxLength);
}

function listedRate(value) {
  if (value === null || value === undefined || String(value).trim() === "") return "";
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? "₱" + new Intl.NumberFormat("en-PH", { maximumFractionDigits: 2 }).format(amount)
    : "";
}

// AI-41: A card-click overview is a conversation, not a database printout.
// Keep the verified accommodation ID, rates, capacity and category policies,
// but phrase them like a concise resort concierge. No Gemini calls needed.
function friendlyList(items, filipino) {
  if (items.length < 2) return items.join("");
  const conjunction = filipino ? "at" : "and";
  if (items.length === 2) return items.join(" " + conjunction + " ");
  return items.slice(0, -1).join(", ") + ", " + conjunction + " " + items.at(-1);
}

function conversationalAmenities(room, filipino) {
  const facts = listedAmenityParts(room);
  const names = new Set(facts.map(x => x.toLowerCase()));
  const hasTwoBedrooms = names.has("2 separate bedrooms");
  const hasEachAC = names.has("air conditioner in each bedroom");
  const hasEachCabinet = names.has("cabinets in each bedroom");
  const grouped = hasTwoBedrooms && (hasEachAC || hasEachCabinet);
  const special = new Set(grouped
    ? ["2 separate bedrooms", "air conditioner in each bedroom", "cabinets in each bedroom"]
    : []);
  const terms = facts.filter(x => !special.has(x.toLowerCase())).map(x => {
    const normalized = x.toLowerCase().replace(/\s+/g, " ").trim();
    if (/^private\s+(?:cr|comfort room|bathroom)$/.test(normalized))
      return filipino ? "sariling CR" : "private bathroom";
    if (/^(?:tv|television|smart tv|led tv)$/.test(normalized)) return normalized === "tv" ? "TV" : normalized.replace(/tv$/, "TV");
    if (/^(?:air[ -]?(?:conditioned|conditioning|conditioner|con)|a\/c|ac)$/.test(normalized))
      return filipino ? "aircon" : "air conditioning";
    if (/^(?:wifi|wi-fi)$/.test(normalized)) return "Wi-Fi";
    // Most Admin amenity labels use Title Case. Lowercase them as ordinary
    // sentence terms rather than producing "tV" or "air Conditioned".
    return normalized;
  });
  if (grouped) {
    const features = [
      hasEachAC ? (filipino ? "aircon" : "air conditioning") : "",
      hasEachCabinet ? (filipino ? "cabinets" : "cabinets") : "",
    ].filter(Boolean);
    terms.push(filipino
      ? "2 bedrooms na parehong may " + friendlyList(features, true)
      : "2 bedrooms, each with " + friendlyList(features, false));
  }
  return friendlyList(terms, filipino);
}

function conversationalRates(room, filipino) {
  const day = listedRate(room?.day_price);
  const night = listedRate(room?.overnight_price);
  const extended = listedRate(room?.extended_price);
  if (!day && !night && !extended) return "";
  const parts = [];
  if (day && night && day === night) {
    parts.push(filipino
      ? day + " po for Day Tour or Night"
      : "Day Tour and Night are both " + day);
  } else {
    if (day) parts.push(filipino ? day + " for Day Tour" : "Day Tour is " + day);
    if (night) parts.push(filipino ? night + " for Night" : "Night is " + night);
  }
  if (extended) parts.push(filipino
    ? extended + " for Extended"
    : "Extended is " + extended);
  return parts.join(filipino ? ", at " : "; ") + ".";
}

function focusedRoomOverview(room, language = "english") {
  const filipino = ["tagalog", "taglish"].includes(String(language).toLowerCase());
  const name = cleanedFact(room?.room_name || room?.name || "Accommodation", 90);
  const count = Number(room?.capacity ?? room?.max_capacity);
  const capacity = Number.isSafeInteger(count) && count > 0;
  const sentences = [];

  if (capacity) {
    sentences.push(filipino
      ? "Yung " + name + " po, good for up to " + count + " guests."
      : name + " can accommodate up to " + count + " guests.");
  } else {
    sentences.push(filipino
      ? "Yung " + name + " po, wala pang indicated guest capacity."
      : "The guest capacity for " + name + " isn't listed yet.");
  }

  const plainCottage = isPlainCottageCategory(room);
  const amenities = plainCottage ? "" : conversationalAmenities(room, filipino);
  const description = cleanedFact(room?.description);
  // Don't parrot generic Admin descriptions that only repeat the room type or
  // guest-count range. Preserve other genuinely supplied descriptions.
  const usefulDescription = description &&
    !/^(?:n\/a|none|null|not available|no description|room accommodation\b|room for \d+|(?:good for|up to) \d+|family room(?:\s|$)|double room(?:\s|$))/i.test(description);
  if (amenities) {
    sentences.push(filipino
      ? "May " + amenities + "."
      : "It comes with " + amenities + ".");
  } else if (plainCottage) {
    sentences.push(filipino
      ? "Wala pong included amenities sa cottage na ito."
      : "This cottage doesn't include amenities.");
  } else if (!usefulDescription) {
    sentences.push(filipino
      ? "Hindi pa po naka-detail ang amenities, so pa-confirm na lang sa Front Desk."
      : "The amenities aren't specified yet, so please check with Front Desk.");
  }
  if (usefulDescription) {
    const detail = description.replace(/[.!?]+$/, "");
    // Avoid repeating a full room description when the amenities already
    // convey exactly the same text.
    if (!amenities || !amenities.toLowerCase().includes(detail.toLowerCase())) {
      sentences.push(detail + ".");
    }
  }

  const rates = conversationalRates(room, filipino);
  if (rates) sentences.push(rates);

  const rawFree = room?.free_entrance_pax;
  const free = rawFree === null || rawFree === undefined ||
    String(rawFree).trim() === "" ? NaN : Number(rawFree);
  if (Number.isSafeInteger(free) && free > 0) {
    sentences.push(filipino
      ? "May free entrance din po for " + free + " guests."
      : "Free entrance is included for " + free + " guests.");
  }

  const status = String(room?.status || "").trim().toLowerCase();
  if (status && status !== "available") {
    sentences.push(filipino
      ? "Hindi po currently marked as available ang accommodation na ito."
      : "This accommodation isn't currently marked available.");
  }
  sentences.push(filipino
    ? "Check niyo na lang po yung date at slot sa booking page."
    : "Please check the booking page for your date and slot.");

  return sentences.join(" ");
}

module.exports = { wantsFocusedRoomOverview, focusedRoomOverview };
