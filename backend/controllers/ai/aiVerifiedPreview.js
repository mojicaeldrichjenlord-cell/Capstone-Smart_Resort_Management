"use strict";
// Identify natural accommodation-preview requests without a paid model call.
// Room identity, category, capacity and card details come ONLY from fresh DB rows.
function norm(value) {
  return String(value || "").normalize("NFKC").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").trim();
}

function hasPreviewWords(value) {
  return /\b(?:previews?|photos?|pictures?|images?|pics?|litrato|larawan|itsura|pakita|ipakita|patingin|silip|tingnan|tingin|show(?:\s+me)?|see(?:\s+the)?\s+photo)\b/i
    .test(String(value || ""));
}

function requestedCategory(value) {
  const text = norm(value);
  if (/\bsingle room (?:pool side|poolside)\b|\bpoolside (?:single )?room\b|\bpool side (?:single )?room\b/.test(text))
    return "single_poolside";
  if (/\bsingle room cottage\b/.test(text)) return "single_cottage";
  // Pool Shade is a distinct inventory group, not Nipa Hut, Pavilion,
  // Poolside Room, or every generic Cottage.
  if (/\bpool shades?\b|\bpoolside shades?\b|\bpool side shades?\b/.test(text))
    return "pool_shade";
  if (/\bbig shades?\b/.test(text)) return "big_shade";
  if (/\bsmall shades?\b/.test(text)) return "small_shade";
  if (/\bbig nipa huts?\b/.test(text)) return "big_nipa";
  if (/\bsmall nipa huts?\b/.test(text)) return "small_nipa";
  if (/\bnipa huts?\b/.test(text)) return "nipa_hut";
  if (/\bshades?\b/.test(text)) return "shade";
  if (/\bfamily rooms?\b/.test(text)) return "family";
  if (/\bdouble rooms?\b/.test(text)) return "double";
  if (/\bfunction areas?\b|\bfunction halls?\b|\bpavilions?\b|\bpavillions?\b/.test(text)) return "function";
  if (/\bcottages?\b|\bkubo\b|\bnipa huts?\b|\bshades?\b/.test(text)) return "cottage";
  if (/\bsingle rooms?\b/.test(text)) return "single";
  if (/\brooms?\b|\bkwarto\b|\bkuwarto\b/.test(text)) return "room";
  return "";
}

function guestCountFromText(value) {
  const text = String(value || "");
  const match = text.match(/\b(\d{1,3})\s*(?:na\s*)?(?:tao|pax|guests?|persons?|people)\b/i) ||
    text.match(/\b(?:para\s+sa|good\s+for|for)\s+(\d{1,3})\b/i);
  return match ? Number(match[1]) : 0;
}

function isVerifiedPreviewRequest(message) {
  const text = String(message || "");
  if (hasPreviewWords(text)) return true;
  // "May CR ba sa Pool Shade?" remains an amenity question, not a
  // discovery request. Explicit photos/previews still take priority.
  if (/\b(?:magkano|presyo|price|rates?|how much|cr|bathroom|toilet|aircon|air condition|amenit(?:y|ies)|inclusions?|kitchen|wifi|parking|free entrance)\b/i.test(text))
    return false;
  // A specific large-group accommodation recommendation should also show
  // options, even if the customer did not literally say "preview".
  const category = requestedCategory(text);
  if (!category) return false;
  // "Anong mga Pool Shade meron kayo?" is a catalog discovery request.
  // "Pool Shade hindi Nipa Hut" is a correction requiring fresh cards,
  // rather than another irrelevant generic Gemini response.
  if (/\b(?:anong|ano|alin|which|what|list|show|pakita|may|meron|available|recommend|suggest|hanap|hindi|not|instead|mali|ang sabi ko|ang tinutukoy ko)\b/i.test(text))
    return true;
  return Boolean(guestCountFromText(text) &&
    /\b(?:para\s+sa|good\s+for|for)\b/i.test(text));
}

function findExactNamedRoom(catalog, message) {
  const query = " " + norm(message) + " ";
  return (Array.isArray(catalog) ? catalog : [])
    .filter(room => {
      const name = norm(room.room_name || room.name);
      return name && query.includes(" " + name + " ");
    })
    .sort((a, b) => norm(b.room_name || b.name).length - norm(a.room_name || a.name).length)[0] || null;
}

function categoryMatches(room, category) {
  const name = norm(room.room_name || room.name);
  const kind = norm(room.category_name || room.category);
  if (category === "single_poolside") return /single room/.test(name) && /pool side|poolside/.test(name);
  if (category === "single_cottage") return /single room cottage/.test(name);
  if (category === "pool_shade") return /\bpool(?:side| side)? shade\b/.test(name) ||
    /\bpool(?:side| side)? shade\b/.test(kind);
  if (category === "big_shade") return /\bbig shade\b/.test(name);
  if (category === "small_shade") return /\bsmall shade\b/.test(name);
  if (category === "shade") return /\bshade\b/.test(name) ||
    (/\bshade\b/.test(kind) && !/\bnipa hut\b/.test(name));
  if (category === "big_nipa") return /\bbig nipa hut\b/.test(name);
  if (category === "small_nipa") return /\bsmall nipa hut\b/.test(name);
  if (category === "nipa_hut") return /\bnipa hut\b/.test(name);
  if (category === "family") return /\bfamily room\b/.test(name);
  if (category === "double") return /\bdouble room\b/.test(name);
  if (category === "function") return /function/.test(kind) || /\bpavill?ion\b|\bfunction area\b/.test(name);
  if (category === "cottage") return /cottage|shade|hut/.test(kind) ||
    /cottage|nipa hut|shade/.test(name);
  if (category === "single") return /single room/.test(name);
  if (category === "room") return /\broom\b/.test(kind) && !/function/.test(kind);
  return false;
}

function selectVerifiedPreviews(catalog, message, recentTurns = [], context = {}) {
  const listed = (Array.isArray(catalog) ? catalog : []).filter(room =>
    String(room.status || "").trim().toLowerCase() === "available");
  const current = String(message || "");
  const currentCategory = requestedCategory(current);
  const directlyNamed = findExactNamedRoom(listed, current);

  // For "may preview ba?", carry forward the most recent customer's
  // property/category question, not an arbitrary recommendation from the AI.
  const prior = Array.isArray(recentTurns)
    ? recentTurns.slice(-8).reverse().find(turn =>
        turn?.role === "user" && (requestedCategory(turn.text) ||
          findExactNamedRoom(listed, turn.text)))?.text || ""
    : "";
  const source = currentCategory || directlyNamed ? current : prior;
  const category = currentCategory || requestedCategory(source);
  let explicitName = directlyNamed || findExactNamedRoom(listed, source);
  // A correction like "Pool Shade, hindi Nipa Hut" must not use a
  // negated accommodation name, even when one exactly matches a DB row.
  if (category && explicitName && !categoryMatches(explicitName, category)) {
    explicitName = null;
  }
  const requestedGuests = guestCountFromText(current) || guestCountFromText(source) || 0;

  let matches = [];
  let alternative = false;
  if (explicitName) {
    matches = [explicitName];
  } else if (category) {
    matches = listed.filter(room => categoryMatches(room, category));
  } else {
    // A true selected-room follow-up is legitimate when a room was explicitly
    // chosen with "Ask About This", but not if a newer category was stated.
    const id = Number(context?.room_id);
    const name = norm(context?.room_name);
    matches = listed.filter(room => Number(room.id) === id &&
      Number.isSafeInteger(id) && id > 0 && (!name || norm(room.room_name || room.name) === name));
  }

  if (requestedGuests > 0) {
    matches = matches.filter(room => Number(room.capacity) >= requestedGuests);
    // A 100-person cottage inquiry should not return a tiny cottage. Offer
    // DB-verified large Function Areas instead when matching cottages lack capacity.
    if (!matches.length && (category === "cottage" || category === "single_cottage")) {
      matches = listed.filter(room => categoryMatches(room, "function") &&
        Number(room.capacity) >= requestedGuests);
      alternative = matches.length > 0;
    }
  }

  matches.sort((a, b) =>
    requestedGuests
      ? Number(a.capacity) - Number(b.capacity) ||
        String(a.room_name || a.name).localeCompare(String(b.room_name || b.name))
      : String(a.room_name || a.name).localeCompare(String(b.room_name || b.name)));
  const seen = new Set();
  const rows = matches.filter(room => {
    const id = Number(room.id);
    if (!Number.isSafeInteger(id) || id < 1 || seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, 3);

  return {
    rows, category, alternative, requestedGuests,
    specific: Boolean(explicitName),
    targetKnown: Boolean(explicitName || category || matches.length),
  };
}

function verifiedPreviewReply(selection, language) {
  const tagalog = language === "tagalog" || language === "taglish";
  if (!selection?.targetKnown) return tagalog
    ? "Anong accommodation po ang gusto ninyong makita? Sabihin lang ang pangalan o uri."
    : "Which accommodation would you like to preview? Tell me its name or type.";
  if (!selection.rows?.length) return tagalog
    ? "Wala po akong makitang listed accommodation na tugma sa hinahanap ninyo. Maaari po kayong pumili ng ibang uri o guest count."
    : "I couldn't find a listed accommodation matching that request. Try another type or guest count.";
  if (selection.alternative) return tagalog
    ? "Wala pong cottage na tugma sa bilang ninyo. Ito po ang mas malalaking Function Area na kasya ayon sa listed capacity. I-check pa rin ang available date at slot sa booking page."
    : "No listed cottage fits your group. Here are larger Function Areas with sufficient listed capacity; check dates and slots on the booking page.";
  if (selection.rows.length === 1) {
    const name = String(selection.rows[0].room_name || selection.rows[0].name || "accommodation");
    return tagalog ? "Ito po ang preview ng " + name + ". Puwede ninyong tingnan ang photos at details dito."
      : "Here's the preview for " + name + ". You can view its photos and details here.";
  }
  return tagalog
    ? "Ito po ang mga matching accommodation previews. Puwede ninyong tingnan ang details ng bawat isa."
    : "Here are some matching accommodation previews. You can view each one's details.";
}

module.exports = {
  isVerifiedPreviewRequest, selectVerifiedPreviews, verifiedPreviewReply,
  requestedCategory, guestCountFromText,
};
