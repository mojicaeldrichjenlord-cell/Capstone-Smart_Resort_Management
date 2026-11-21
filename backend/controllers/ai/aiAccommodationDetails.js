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

// AI-40: "Ask About This" must answer what the selected DB listing actually
// knows, even when Admin has not filled its separate amenities field.
// No hardcoded room facts, guesses, Gemini calls or reservation writes.
function focusedRoomOverview(room, language = "english") {
  const filipino = ["tagalog", "taglish"].includes(String(language).toLowerCase());
  const name = cleanedFact(room?.room_name || room?.name || "Accommodation", 90);
  const count = Number(room?.capacity ?? room?.max_capacity);
  const capacity = Number.isSafeInteger(count) && count > 0
    ? (filipino ? "good for up to " + count + " guests" : "listed for up to " + count + " guests")
    : (filipino ? "wala pang listed capacity" : "capacity is not listed");
  const sentences = [name + (filipino ? " po, " : " is ") + capacity + "."];

  const description = cleanedFact(room?.description);
  if (description && !/^(?:n\/a|none|null|not available|no description)$/i.test(description)) {
    sentences.push("Description: " + description.replace(/[.!?]+$/, "") + ".");
  }

  // Rooms must use their OWN amenities; only the confirmed Function Area
  // category gets category-wide inclusions when Admin left its list empty.
  const isPlainCottage = isPlainCottageCategory(room);
  const listedAmenities = isPlainCottage ? [] : listedAmenityParts(room);
  if (isPlainCottage) {
    sentences.push(filipino
      ? "Wala pong kasamang amenities sa cottage na ito."
      : "This cottage does not include amenities.");
  } else if (listedAmenities.length) {
    sentences.push((filipino ? "Listed amenities: " : "Listed amenities: ") +
      listedAmenities.join(", ") + ".");
  } else {
    sentences.push(filipino
      ? "Hindi pa nakalista ang specific amenities; paki-confirm na lang po sa Front Desk kung kailangan."
      : "Specific amenities are not listed yet; please confirm inclusions with Front Desk if needed.");
  }

  const rates = [
    listedRate(room?.day_price) ? "Day Tour " + listedRate(room.day_price) : "",
    listedRate(room?.overnight_price) ? "Night " + listedRate(room.overnight_price) : "",
    listedRate(room?.extended_price) ? "Extended " + listedRate(room.extended_price) : "",
  ].filter(Boolean);
  if (rates.length) {
    sentences.push("Listed rates: " + rates.join("; ") + ".");
  } else {
    sentences.push(filipino
      ? "Wala pang verified rates sa listing."
      : "Rates are not listed yet.");
  }

  const freeRaw = room?.free_entrance_pax;
  const free = freeRaw === null || freeRaw === undefined ||
    String(freeRaw).trim() === "" ? NaN : Number(freeRaw);
  if (Number.isSafeInteger(free) && free > 0) {
    sentences.push(filipino
      ? "May " + free + " pax na free entrance ayon sa listing."
      : "The listing includes free entrance for " + free + " guests.");
  }

  const status = String(room?.status || "").trim().toLowerCase();
  if (status && status !== "available") {
    sentences.push(filipino
      ? "Sa ngayon, hindi naka-mark na available ang listing na ito."
      : "This listing is not currently marked available.");
  }
  sentences.push(filipino
    ? "Exact date at slot availability, sa booking page pa mache-check."
    : "Exact date and slot availability must still be checked on the booking page.");

  return sentences.join(" ");
}

module.exports = { wantsFocusedRoomOverview, focusedRoomOverview };
