// Short, verified overviews for an explicitly focused accommodation.
// Does not invent details, call Gemini, check dates, or mutate bookings/payments.
"use strict";

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
function cleanedFact(value, maxLength = 90) {
  return String(value || "").replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ")
    .trim().slice(0, maxLength);
}

function listedRate(value) {
  if (value === null || value === undefined || String(value).trim() === "") return "";
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? "₱" + new Intl.NumberFormat("en-PH", {maximumFractionDigits: 2}).format(amount)
    : "";
}

function focusedRoomOverview(room, language = "english") {
  const taglish = ["tagalog", "taglish"].includes(String(language).toLowerCase());
  const name = cleanedFact(room?.room_name || room?.name || "Accommodation", 90);
  const count = Number(room?.capacity ?? room?.max_capacity);
  const capacity = Number.isSafeInteger(count) && count > 0
    ? (taglish ? `good for up to ${count} guests` : `listed for up to ${count} guests`)
    : (taglish ? "hindi pa nakalista ang capacity" : "capacity is not listed");
  const amenities = String(room?.amenities || "").split(/[\n\r,;|•]+/)
    .map(value => cleanedFact(value, 55)).filter(Boolean).slice(0, 3);
  const overview = amenities.length ? amenities.join(", ")
    : cleanedFact(String(room?.description || "").split(/[.!?]/)[0], 120);
  const rates = [
    listedRate(room?.day_price) ? "Day Tour " + listedRate(room.day_price) : "",
    listedRate(room?.overnight_price) ? "Night " + listedRate(room.overnight_price) : "",
  ].filter(Boolean).join("; ");
  if (taglish) {
    return `${name} po ay ${capacity}. ${overview ? "Nakalista ang " + overview + ". " : "Wala pang nakalistang room inclusions. "}${rates ? "Listed rates: " + rates + "; " : ""}i-confirm pa rin po ang date at slot sa booking page.`;
  }
  return `${name} is ${capacity}. ${overview ? "Listed details: " + overview + ". " : "Room inclusions are not listed yet. "}${rates ? "Listed rates: " + rates + "; " : ""}please confirm the date and slot on the booking page.`;
}

module.exports = { wantsFocusedRoomOverview, focusedRoomOverview };
