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

// Compound parties need semantic interpretation; a single number is not necessarily the total.
function hasCompoundParty(value) {
  const q=String(value||"").normalize("NFKC");
  return /\b(?:couple|adults?|parents?|mag[- ]?asawa|matanda)\b[\s\S]{0,50}\b(?:with|plus|and|at|kasama|may)\b[\s\S]{0,45}\b(?:children|kids?|bata|anak|adults?|guests?|tao)\b/i.test(q) ||
    /\b(?:children|kids?|bata|anak)\b[\s\S]{0,45}\b(?:with|plus|and|at|kasama)\b[\s\S]{0,45}\b(?:adults?|parents?|matanda|guests?|tao)\b/i.test(q);
}
function guestCountFromText(value) {
  if (hasCompoundParty(value)) return 0;
  const text = String(value || "").normalize("NFKC");
  if (/\b(?:the\s+two\s+of\s+us|dalawa(?:ng)?\s+lang\s+(?:po\s+)?(?:kami|tayo)|kaming\s+dalawa|aming\s+dalawa|we(?:[’\']re| are)\s+a\s+couple|for\s+a\s+couple)\b/i.test(text)) return 2;
  const match = text.match(/\b(\d{1,3})\s*(?:na\s*)?(?:tao|pax|guests?|persons?|people|kami)\b/i) ||
    text.match(/\b(?:para\s+sa|good\s+for|for)\s+(\d{1,3})\b(?!\s*(?:nights?|days?|hours?|rooms?|cottages?|months?|weeks?|gabi|araw|oras|kwarto|pesos?|php|years?)\b|[,.]\d)/i) ||
    // AI-65: English group-size phrasing in compound resort questions.
    text.match(/\b(?:group|party)\s+of\s+(\d{1,3})\b/i) ||
    text.match(/\b(?:we(?:'re| are)|there are)\s+(\d{1,3})\s+(?:of\s+us|guests?|people)\b/i) ||
    text.match(/\b(\d{1,3})\s+of\s+us\b/i);
  if (match) {
    const count = Number(match[1]);
    return Number.isSafeInteger(count) && count > 0 && count <= 200 ? count : 0;
  }
  // AI-45: Written-out counts in genuine group-size phrases (not room
  // names, day/night slot numbers or arbitrary history trivia).
  const words = {
    isa: 1, isang: 1, dalawa: 2, dalawang: 2, tatlo: 3, tatlong: 3, apat: 4, lima: 5, limang: 5,
    anim: 6, pito: 7, pitong: 7, walo: 8, walong: 8, siyam: 9, sampu: 10, sampung: 10,
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  };
  const wordList = Object.keys(words).join("|");
  const phrase = new RegExp(
    "\\b(?:para\\s+sa|good\\s+for|for)\\s+(?:mga\\s+)?(" +
    wordList + ")(?=\\b)(?!\\s*(?:nights?|days?|hours?|rooms?|cottages?|months?|weeks?|gabi|araw|oras|kwarto|pesos?|years?)\\b)", "i"
  );
  const people = new RegExp(
    "\\b(" + wordList + ")\\s+(?:na\\s+|po\\s+|lang\\s+)*(?:tao|kami|kaming|bisita|guests?|people|persons?|pax)\\b", "i"
  );
  const named = text.match(phrase) || text.match(people);
  return named ? words[named[1].toLowerCase()] || 0 : 0;
}

function isVerifiedPreviewRequest(message) {
  const text = String(message || "");
  // A preview shortcut does not filter by price or verify booking dates.
  // Route budget- and date-constrained requests to the full data-aware flow;
  // otherwise a 10-person budget search can show unaffordable listings or
  // a Saturday availability request can look like a confirmed booking slot.
  if (/\b(?:budget|under|below|less\s+than|up\s+to|maximum|not\s+more\s+than)\b|₱|\bphp\s*\d/i.test(text) ||
      /\b(?:on|this|next)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month)\b|\b(?:tomorrow|bukas|today|tonight|specific\s+date|available\s+(?:on|for))\b/i.test(text) ||
      /\b\d{4}-\d{1,2}-\d{1,2}\b/.test(text)) return false;
  // Structural questions about a named accommodation are not previews,
  // even when they begin with "What about Double Room 1?".
  if (/\b(?:ilan|ilang|how many|number of|count of|bilang ng)\s+(?:po\s+)?(?:mga\s+|the\s+)?(?:bed\s*rooms?|beds?|kama|silid(?:\s+tulugan)?|tulugan)\b/i.test(text)) return false;
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
  // Both "Room" and "Rooms" are valid Admin-managed category labels.
  if (category === "room") return /\brooms?\b/.test(kind) && !/function/.test(kind);
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
  // Follow-up catalog questions must keep a previously confirmed guest
  // count. An explicit new count in this message still takes priority.
  const savedGuests = Number(context?.guests);
  const validSavedGuests = Number.isSafeInteger(savedGuests) && savedGuests > 0 &&
    savedGuests <= 200 ? savedGuests : 0;
  const requestedGuests = guestCountFromText(current) ||
    guestCountFromText(source) || validSavedGuests;

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
  const first=selection?.rows?.[0];
  const count=Number(selection?.requestedGuests);
  if(first&&count>0&&!selection.alternative){
    const name=String(first.room_name||first.name||"Accommodation");
    if(language==="taglish"||language==="tagalog") return (count===2?"Para sa inyong dalawa":"Para sa group niyo na "+count+" guests")+", magandang option po ang "+name+". Anong date po ang plan ninyo para ma-check ko rin ang availability?";
    if(language==="english") return "For your group of "+count+", I'd suggest "+name+". Here are some suitable options. When are you planning to visit so I can check the schedule?";
    if(language==="bisaya") return "Para sa "+count+" ka guests, maayo nga option ang "+name+". Kanus-a mo magbisita aron ma-check nato ang schedule?";
    if(language==="spanish") return "Para su grupo de "+count+" personas, les recomiendo "+name+". ¿En qué fecha planean visitarnos para comprobar la disponibilidad?";
    if(language==="mandarin") return "您们一共"+count+"位，推荐考虑"+name+"。计划哪天入住呢？我可以帮您查询空房。";
  }
  // Keep the separate pure-Tagalog wording while using everyday Taglish in
  // voice and text chat. Room selection and card facts remain unchanged.
  if (language === "bisaya") {
    if (!selection?.targetKnown) return "Unsang kwarto o cottage ang gusto ninyong tan-awon?";
    if (!selection.rows?.length) return "Walay nakalistang accommodation nga mohaom sa inyong gipangita. Suwayi og laing klase o guest count.";
    if (selection.alternative) return "Walay cottage nga igo sa inyong grupo sumala sa listed capacity. Mao ni ang mas dagkong Function Areas; i-check gihapon ang date ug slot sa booking page.";
    if (selection.rows.length === 1) {
      const name = String(selection.rows[0].room_name || selection.rows[0].name || "accommodation");
      return "Mao ni ang preview sa " + name + ". I-klik ang View Details para sa photos ug impormasyon.";
    }
    return "Mao ni ang mga accommodation nga mohaom sa inyong gipangita. Tan-awa ang photos ug details sa cards.";
  }
  const taglish = language === "taglish";
  if (taglish) {
    if (!selection?.targetKnown) return "Sure po! Anong room or cottage ang gusto niyong makita?";
    if (!selection.rows?.length) return "Wala po akong makitang matching accommodation sa listing. Try po natin ibang type or guest count.";
    if (selection.alternative) return "Wala pong cottage na kasya sa group niyo. Ito po yung larger Function Areas based sa listed capacity. Check niyo na lang po ang dates at slots sa booking page.";
    if (selection.rows.length === 1) {
      const name = String(selection.rows[0].room_name || selection.rows[0].name || "accommodation");
      return "Ito po yung preview ng " + name + ". Click niyo lang yung View Details para sa photos and info.";
    }
    return "Ito po yung matching accommodations. Check niyo lang yung photos and details sa cards.";
  }
  const tagalog = language === "tagalog";
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
  requestedCategory, guestCountFromText, hasCompoundParty, categoryMatches, findExactNamedRoom,
};
