"use strict";
// Read-only accommodation INVENTORY counts, not booking-slot availability.
// Count questions are different from "show/recommend rooms" preview requests.
// Run against a fresh aggregate SQL result on every request; no Gemini credits.

const COUNT_WORDS = /\b(?:ilan|ilang|pila\s+ka|pila\s+ang|how\s+many|number\s+of|total\s+(?:number\s+of|count\s+of)?|count\s+of|gaano\s+karami(?:ng)?|bilang\s+ng)\b/i;
const ROOM_WORDS = /\b(?:rooms?|kwarto|kuwarto)\b/i;
const COTTAGE_WORDS = /\b(?:cottages?|kubo|kottages?|nipa\s+huts?|pool\s+shades?|shades?)\b/i;
const FUNCTION_WORDS = /\b(?:function\s+(?:areas?|halls?)|pavill?ions?)\b/i;
const ALL_WORDS = /\b(?:accommodations?|units?|places?\s+to\s+stay|matutuluyan)\b/i;
const COMPLEX = /\b(?:tomorrow|today|tonight|bukas|mamaya|ngayon|sa\s+petsa|on\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|next\s+(?:week|month)|this\s+(?:week|month)|booked|reserved|reservation|occupied|occupancy|dates?|check[ -]?in|check[ -]?out|schedule|slots?|petsa|oras|guests?|pax|tao|kasya|capacity|budget|magkano|price|rates?|presyo|bayad|entrance|free\s+entrance|inclusions?|amenit(?:y|ies)|types?|kinds?|uri)\b/i;

function matchAccommodationCountQuestion(message) {
  const text = String(message || "").normalize("NFKC").trim().toLowerCase();
  if (!text || text.length > 280 || !COUNT_WORDS.test(text) ||
      COMPLEX.test(text) || /\b\d{4}-\d{1,2}-\d{1,2}\b/.test(text)) {
    return null;
  }
  // Count the object of the question, not a room name elsewhere in it.
  // A bedroom, bed or fixture count is about an accommodation's details,
  // not the number of accommodations in the resort's inventory.
  if (/\b(?:ilan|ilang|pila\s+ka|pila\s+ang|how\s+many|number\s+of|count\s+of|bilang\s+ng)\s+(?:po\s+)?(?:mga\s+|the\s+)?(?:bed\s*rooms?|beds?|kama|silid(?:\s+tulugan)?|tulugan|bathrooms?|comfort\s+rooms?|toilets?|cr|tables?|chairs?|air\s*conditioners?|tv(?:s)?|refrigerators?)\b/i.test(text) ||
      /\b(?:single|double|family)\s+room\s+(?:[a-z]|\d+)\b/i.test(text)) return null;
  const scopes = [];
  if (ROOM_WORDS.test(text)) scopes.push("room");
  if (COTTAGE_WORDS.test(text)) scopes.push("cottage");
  if (FUNCTION_WORDS.test(text)) scopes.push("function");
  if (!scopes.length && ALL_WORDS.test(text)) scopes.push("all");
  if (!scopes.length) return null;

  // Explicit family/double/single room types count actual named Room rows.
  // We deliberately do not infer a room type from "20 pax" or older context.
  const subtype = scopes.length === 1 && scopes[0] === "room"
    ? (/\bfamily\s+rooms?\b/.test(text) ? "family" :
       /\bdouble\s+rooms?\b/.test(text) ? "double" :
       /\bsingle\s+rooms?\b/.test(text) ? "single" : null)
    : null;
  // "Ilang available rooms?" means Admin listing status, NOT free slots on
  // a particular booking date (date-bound questions are excluded above).
  const availableOnly = /\b(?:available|bookable|bakante|bakanteng)\b/i.test(text);
  return { scopes, subtype, availableOnly };
}

function categoryGroup(category) {
  const categoryName = String(category || "").trim().toLowerCase();
  if (/^rooms?$/.test(categoryName)) return "room";
  if (/^cottages?$/.test(categoryName)) return "cottage";
  if (/^function\s+areas?$|^function\s+halls?$|^pavill?ions?$/.test(categoryName)) return "function";
  return "other";
}

function countSummary(rows, intent) {
  const grouped = { room: { total: 0, listed: 0 },
    cottage: { total: 0, listed: 0 },
    function: { total: 0, listed: 0 },
    other: { total: 0, listed: 0 } };
  for (const row of Array.isArray(rows) ? rows : []) {
    const category = categoryGroup(row.category_name);
    const n = Number(row.accommodation_count);
    // Prevent malformed DB results from causing misleading totals.
    if (!Number.isSafeInteger(n) || n < 0) continue;
    grouped[category].total += n;
    if (String(row.listing_status || "").trim().toLowerCase() === "available") {
      grouped[category].listed += n;
    }
  }
  const scopes = intent?.scopes || [];
  const pick = scopes.includes("all")
    ? Object.values(grouped)
    : scopes.map(scope => grouped[scope]).filter(Boolean);
  return {
    ...grouped,
    total: pick.reduce((sum, x) => sum + x.total, 0),
    listed: pick.reduce((sum, x) => sum + x.listed, 0),
  };
}

function countReply(summary, intent, language = "taglish") {
  const scopes = intent?.scopes || [];
  const english = language === "english";
  const pureTagalog = language === "tagalog";
  const bisaya = language === "bisaya";
  const names = {
    room: intent?.subtype ? intent.subtype + " room" : "room",
    cottage: "cottage",
    function: "function area",
    all: "accommodation",
  };
  const plural = (kind, n) => {
    const name = names[kind];
    return n === 1 ? name : name + "s";
  };
  const selectedCount = kind => {
    const source = kind === "all" ? summary : summary[kind];
    return intent?.availableOnly ? (source?.listed || 0) : (source?.total || 0);
  };
  const items = scopes.map(kind => {
    const n = selectedCount(kind);
    return n + " " + plural(kind, n);
  });
  const nounList = items.length > 1 ? items.slice(0, -1).join(", ") +
    (english ? " and " : " at ") + items[items.length - 1] : items[0];
  const suffix = bisaya
    ? "Kadaghanon lang kini sa listing, dili pa kumpirmadong bakante sa imong petsa ug oras."
    : english
    ? "This is the current listing count, not confirmed availability for a date or time."
    : pureTagalog
      ? "Bilang ito ng mga nakalista, hindi pa kumpirmadong bakante sa napiling petsa at oras."
      : "Listing count lang po ito; hindi pa confirmed ang availability sa specific date at time.";
  if (summary.total === 0) {
    if (bisaya) return "Wala pay nakalistang accommodation nga mohaom sa gipangita. Palihog kumpirmaha sa Front Desk.";
    return english
      ? "No matching accommodations are currently recorded in the resort system. Please confirm with Front Desk."
      : pureTagalog
        ? "Wala pong nakatalang ganitong accommodation sa system ngayon. Maaari pong magtanong sa Front Desk."
        : "Wala pong naka-list na matching accommodation sa system ngayon. Paki-confirm po sa Front Desk.";
  }
  if (intent?.availableOnly) {
    if (bisaya) return "Sa kasamtangang listing, " + nounList + " ang gi-mark nga available. " + suffix;
    return english
      ? "Currently " + nounList + " are marked available in the listing. " + suffix
      : pureTagalog
        ? "Sa kasalukuyang listahan, " + nounList + " ang nakatalang available. " + suffix
        : "Sa current listing, " + nounList + " ang marked available po. " + suffix;
  }
  const statusNote = summary.listed < summary.total
    ? (english ? " (" + summary.listed + " marked available)"
      : " (" + summary.listed + " marked available)") : "";
  if (bisaya) return "Naay " + nounList + " nga nakalista sa resort" + statusNote + ". " + suffix;
  return english
    ? "The resort currently has " + nounList + " listed" + statusNote + ". " + suffix
    : pureTagalog
      ? "May " + nounList + " pong nakalista sa resort ngayon" + statusNote + ". " + suffix
      : "May " + nounList + " po kami sa current listing" + statusNote + ". " + suffix;
}

module.exports = {
  matchAccommodationCountQuestion,
  categoryGroup,
  countSummary,
  countReply,
};
