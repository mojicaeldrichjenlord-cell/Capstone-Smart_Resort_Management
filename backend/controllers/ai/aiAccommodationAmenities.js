// Evidence-based answers to simple CR/aircon/refrigerator questions.
// Uses only the selected accommodation's fresh Admin-managed DB details.
"use strict";

const {
  isPlainCottageCategory, isFunctionAreaCategory,
  hasListedAmenities,
} = require("./aiAccommodationCategoryPolicy");

const FEATURES = Object.freeze({
  cr: /\b(?:cr|comfort\s*room|bathroom|bath\s*room|restroom|toilet|t\s*&\s*b)\b/i,
  aircon: /\b(?:air[\s-]?(?:con(?:ditioner|ditioning|ditioned)?|condition(?:er|ed|ing)?)|a\/c|ac)\b/i,
  ref: /\b(?:ref|refrigerator|fridge|mini[\s-]?(?:ref|fridge|refrigerator))\b/i,
  karaoke: /\b(?:karaoke|videoke)\b/i,
  table: /\b(?:tables?|dining\s+tables?|lamesa|mesa)\b/i,
  tv: /\b(?:tv|television|smart\s+tv|telebisyon)\b/i,
  monoblock: /\b(?:monoblocks?|plastic\s+chairs?|monoblock\s+chairs?)\b/i,
  kitchen: /\b(?:kitchen|kusina|cooking\s+area|cooking\s+space)\b/i,
  living_room: /\b(?:living\s+room|sala|lounge\s+area)\b/i,
  cabinet: /\b(?:cabinets?|wardrobes?|closets?|aparador)\b/i,
});
const PRIVATE_CR = /\b(?:private|own|exclusive|sarili(?:ng)?|en[\s-]?suite|attached)\s+(?:cr|comfort\s*room|bathroom|bath\s*room|restroom|toilet|t\s*&\s*b)\b|\b(?:cr|comfort\s*room|bathroom|restroom|toilet)\s*(?:[-:(]\s*)?(?:private|own|exclusive|sarili(?:ng)?)\b/i;
const SHARED_CR = /\b(?:shared|common|communal|public)\s+(?:cr|comfort\s*room|bathroom|restroom|toilet)\b|\b(?:cr|bathroom|restroom|toilet)\s+(?:is\s+)?(?:shared|common|communal)\b/i;

// A guest may ask about multiple specific inclusions in one sentence.
// The multi-amenity path checks EACH feature against the fresh selected DB
// room, instead of letting a single-feature fast path ignore the rest.
function requestedAmenities(message) {
  const text = String(message || "").normalize("NFKC").toLowerCase();
  if (text.length > 300 || !/(?:\?|^\s*may\b|\b(?:meron|have|has|with|included|kasama|available|ba|bang)\b)/i.test(text)) return [];
  if (/\b(?:free|libre|extra|additional|charge|fee|bayad|magkano|how much)\b/i.test(text)) return [];
  // Bed questions ask for factual sleeping arrangements, not a recommendation.
  // Never derive bed count from bedroom count or accommodation capacity.
  const kinds = [];
  const bedInquiry = /\b(?:ilang|ilan|how many|number of|count of)\s+(?:po\s+)?(?:mga\s+)?(?:kama|beds?)\b|\b(?:bed\s+(?:sizes?|types?|count|configuration)|sleeping\s+arrangements?|(?:size|type)\s+(?:ng|of)\s+(?:mga\s+|the\s+)?(?:kama|beds?)|(?:anong|what)\s+(?:klaseng|kind of|size of|size|type)\s+(?:ng\s+)?(?:kama|beds?)|(?:queen|king|single|double|twin)[ -]?(?:size[ -]?)?(?:bed|kama)s?)\b/i.test(text);
  if (bedInquiry && !/\b(?:recommend|suggest|hanap|magandang|looking for|budget|available|availability|book|reserve)\b/i.test(text)) kinds.push("beds");
  if (FEATURES.cr.test(text)) {
    // Privacy must explicitly modify CR; "private kitchen at CR" does not
    // prove that the CR is private.
    kinds.push(PRIVATE_CR.test(text) ? "private_cr" : "cr");
  }
  if (FEATURES.aircon.test(text)) kinds.push("aircon");
  if (FEATURES.ref.test(text)) kinds.push("ref");
  if (FEATURES.karaoke.test(text)) kinds.push("karaoke");
  if (FEATURES.table.test(text)) kinds.push("table");
  if (FEATURES.tv.test(text)) kinds.push("tv");
  if (FEATURES.monoblock.test(text)) kinds.push("monoblock");
  if (FEATURES.kitchen.test(text)) kinds.push("kitchen");
  if (FEATURES.living_room.test(text)) kinds.push("living_room");
  if (FEATURES.cabinet.test(text)) kinds.push("cabinet");
  return kinds;
}
// Preserve the single-feature API for existing flows/tests.
function requestedAmenity(message) {
  const kinds = requestedAmenities(message);
  return kinds.length === 1 ? kinds[0] : null;
}

function negated(clause, pattern) {
  const feature = pattern.source;
  const before = new RegExp("(?:\\b(?:no|without|non|walang|wala|not\\s+(?:included|available))\\s+(?:(?:a|an|any|private|own|sarili(?:ng)?)\\s+){0,2})(?:" + feature + ")", "i");
  const after = new RegExp("(?:" + feature + ")\\s+(?:is\\s+)?(?:not\\s+(?:included|available)|excluded|wala)", "i");
  return before.test(clause) || after.test(clause);
}

function amenityEvidence(room, kind) {
  const feature = FEATURES[kind === "private_cr" ? "cr" : kind];
  if (!feature) return "unknown";
  // Confirmed resort rule: the Cottage category has no included amenities.
  // Classify using category_name ONLY, not "Single Room Cottage" in the name.
  if (isPlainCottageCategory(room)) return "none_included";
  // The resort confirmed inclusions for Function Areas. Until their DB
  // amenities are filled, answer only these three verified inclusions.
  if (isFunctionAreaCategory(room) && !hasListedAmenities(room) &&
      ["table", "monoblock", "karaoke"].includes(kind)) return "yes";
  // Analyze each list item/clause so a negative for one amenity cannot
  // accidentally negate a different amenity in the same Admin description.
  const clauses = [room?.amenities, room?.description]
    .filter(value => typeof value === "string")
    .flatMap(value => value.replace(/<[^>]*>/g, "\n")
      .replace(/&nbsp;|&amp;/gi, " ")
      .split(/[\n\r,;|•]+|(?<=[.!?])\s+/)
      .map(part => part.trim()).filter(Boolean));
  const findings = new Set();
  for (const clause of clauses) {
    if (!feature.test(clause)) continue;
    const isNegated = negated(clause, feature);
    if (kind === "private_cr") {
      // "CR" alone is NOT proof of a private CR.
      if (isNegated || SHARED_CR.test(clause)) findings.add("no");
      else if (PRIVATE_CR.test(clause)) findings.add("yes");
      // A listed "CR" does confirm a bathroom exists, but NOT privacy.
      else findings.add("listed_unspecified");
    } else {
      findings.add(isNegated ? "no" : "yes");
    }
  }
  // Explicit private/shared evidence takes precedence over a generic "CR".
  // Conflicting explicit details must remain unknown rather than guessed.
  if (kind === "private_cr" && findings.has("listed_unspecified")) {
    const explicit = [...findings].filter(x => x !== "listed_unspecified");
    return explicit.length === 1 ? explicit[0] :
      explicit.length === 0 ? "listed_unspecified" : "unknown";
  }
  return findings.size === 1 ? [...findings][0] : "unknown";
}

// Return explicitly listed bed facts. Missing or conflicting information must
// not be guessed. Keep count/type as recorded, including mixed bed types.
function bedDetailsReply(room, language = "english") {
  const name = String(room?.room_name || room?.name || "accommodation").slice(0,110);
  const fil = ["tagalog","taglish"].includes(String(language).toLowerCase());
  const bis = language === "bisaya";
  if (isPlainCottageCategory(room)) return fil ? "Wala pong included na kama sa " + name + "." : bis ? "Walay apil nga higdaanan sa " + name + "." : name + " does not include beds.";
  const clauses = [room?.amenities, room?.description].filter(v => typeof v === "string")
    .flatMap(v => v.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g,"\n").split(/[\n\r;|•]+/));
  // Only use lines which actually identify a bed (not just a bedroom).
  const bed = /\b(?:beds?|kama|bunk\s+bed|mattress(?:es)?)\b/i;
  const facts = [...new Set(clauses.map(v => v.trim()).filter(v => v && bed.test(v) && v.length <= 180))];
  if (facts.length) {
    const detail = facts.join("; ");
    return fil ? "Sa listed bed details ng " + name + ": " + detail + "."
      : bis ? "Ang nakalistang detalye sa higdaanan sa " + name + ": " + detail + "."
      : "The listed bed details for " + name + ": " + detail + ".";
  }
  return fil ? "Hindi pa po nakasaad ang exact bed count o size sa listing ng " + name + ". Paki-confirm na lang po sa Front Desk."
    : bis ? "Wala pa makumpirma ang detalye sa higdaanan sa " + name + ". Palihog pangutana sa Front Desk."
    : "The listing for " + name + " does not confirm the exact bed count or size. Please check with Front Desk.";
}
function amenityReply(room, kind, message, language = "english") {
  if (kind === "beds") return bedDetailsReply(room, language);
  const name = String(room?.room_name || room?.name || "accommodation").slice(0, 110);
  const status = amenityEvidence(room, kind);
  if (language === "bisaya") {
    const feature = {
      private_cr: "pribadong CR", cr: "CR", aircon: "aircon",
      ref: "refrigerator", karaoke: "karaoke", table: "lamesa", tv: "TV",
      monoblock: "monoblock chairs", kitchen: "kusina",
      living_room: "sala", cabinet: "cabinet",
    }[kind] || "kini nga amenity";
    if (status === "none_included")
      return "Walay apil nga amenities sa " + name + " sumala sa listing.";
    if (status === "yes") {
      if (kind === "cr" && amenityEvidence(room, "private_cr") === "yes")
        return "Oo, naay pribadong CR ang " + name + ".";
      return "Oo, naay " + feature + " ang " + name + ".";
    }
    if (status === "no")
      return "Sumala sa listing, walay " + feature + " ang " + name + ".";
    if (status === "listed_unspecified" && kind === "private_cr")
      return "Naay CR sa listing sa " + name + ", pero wala gikumpirma kung pribado ba. Palihog pangutana sa Front Desk.";
    return "Wala pa makumpirma sa listing sa " + name + " kung naa bay " + feature + ". Mahimo ninyo kining pangutan-on sa Front Desk.";
  }
  // For live voice, an explicitly chosen language must win over speech
  // transcript wording. Typed chat passes the detected conversation language.
  const filipino = ["tagalog", "taglish"].includes(String(language).toLowerCase());
  const everydayTaglish = String(language).toLowerCase() === "taglish";
  const item = {
    private_cr: filipino ? "sariling CR" : "a private bathroom",
    cr: filipino ? "CR" : "a bathroom",
    aircon: filipino ? "aircon" : "air conditioning",
    ref: filipino ? "ref" : "refrigerator",
    karaoke: "karaoke",
    table: "tables",
    tv: "a TV",
    monoblock: "monoblock chairs",
    kitchen: filipino ? "kitchen" : "a kitchen",
    living_room: filipino ? "living room" : "a living room",
    cabinet: filipino ? "cabinet" : "cabinets",
  }[kind];
  if (status === "none_included") {
    return filipino
      ? "Wala pong kasamang amenities sa " + name + "."
      : name + " does not include amenities.";
  }
  if (status === "yes") {
    // A generic CR question can mention "private" when the CURRENT
    // accommodation's verified details explicitly say Private CR.
    if (kind === "cr" && amenityEvidence(room, "private_cr") === "yes") {
      return filipino
        ? "Yes po, may sariling CR ang " + name + "."
        : "Yes, " + name + " has a private bathroom.";
    }
    // A one-feature question deserves a one-feature answer. Do not list
    // unrelated inclusions or upsell a booking/date when the guest just asks
    // "May aircon?" or "May sarili bang CR ito?".
    return filipino
      ? "Yes po, may " + item + " ang " + name + "."
      : "Yes, " + name + " has " + item + ".";
  }
  if (status === "no") {
    return filipino
      ? (kind === "private_cr"
        ? "Ayon po sa details, hindi private ang CR ng " + name + "."
        : "Ayon po sa details, walang " + item + " ang " + name + ".")
      : (kind === "private_cr"
        ? "The listed details say " + name + " does not have a private bathroom."
        : "The listed details say " + name + " does not include " + item + ".");
  }
  if (status === "listed_unspecified" && kind === "private_cr") {
    return filipino
      ? (everydayTaglish
        ? "May CR po yung " + name + ", pero hindi clear sa listing kung private. Paki-check na lang po sa Front Desk."
        : "May CR pong nakalista sa " + name + ", pero hindi nakasaad kung private ito. Puwede po itong i-confirm sa Front Desk.")
      : name + " lists a bathroom, but the details don't specify whether it's private. Please confirm with Front Desk.";
  }
  return filipino
    ? (everydayTaglish
      ? "Hindi pa po clear sa room details kung may " + item + " yung " + name + ". Paki-check na lang po sa Front Desk."
      : "Hindi po naka-indicate sa description o amenities ng " + name + " kung may " + item + ". Puwede po itong i-confirm sa Front Desk.")
    : "The description and amenities don't confirm whether " + name + " has " + item + ". Please check with Front Desk.";
}

// AI-52: Every requested amenity must be addressed. This uses the SAME
// evidence checks as single-feature questions, and never interprets silence
// in a room description as evidence of absence.
function multiAmenityReply(room, kinds, language = "taglish") {
  if (Array.isArray(kinds) && kinds.includes("beds")) {
    const other = kinds.filter(k => k !== "beds");
    return [bedDetailsReply(room, language), other.length ? multiAmenityReply(room, other, language) : ""].filter(Boolean).join(" ");
  }
  const name = String(room?.room_name || room?.name || "accommodation")
    .replace(/<[^>]*>/g, " ").trim().slice(0, 110);
  const all = [...new Set(Array.isArray(kinds) ? kinds : [])].filter(k =>
    k === "private_cr" || Object.hasOwn(FEATURES, k));
  const filipino = ["tagalog", "taglish"].includes(language);
  const labels = {
    private_cr: {fil:"sariling CR", en:"private bathroom", bis:"pribadong CR"},
    cr: {fil:"CR", en:"bathroom", bis:"CR"},
    aircon: {fil:"aircon", en:"air conditioning", bis:"aircon"},
    ref: {fil:"ref", en:"refrigerator", bis:"refrigerator"},
    karaoke: {fil:"karaoke", en:"karaoke", bis:"karaoke"},
    table: {fil:"table", en:"table", bis:"lamesa"},
    tv: {fil:"TV", en:"TV", bis:"TV"},
    monoblock: {fil:"monoblock chairs", en:"monoblock chairs", bis:"monoblock chairs"},
    kitchen: {fil:"kitchen", en:"kitchen", bis:"kusina"},
    living_room: {fil:"living room", en:"living room", bis:"sala"},
    cabinet: {fil:"cabinets", en:"cabinets", bis:"cabinet"}
  };
  const known = [], denied = [], unclear = [];
  for (const kind of all) {
    const label = labels[kind]?.[language === "bisaya" ? "bis" :
      filipino ? "fil" : "en"] || kind;
    const status = amenityEvidence(room, kind);
    if (status === "yes") known.push(label);
    else if (status === "no" || status === "none_included") denied.push(label);
    else unclear.push(label);
  }
  if (!all.length) return "";
  const join = items => items.length === 1 ? items[0] :
    items.length === 2 ? items.join(filipino ? " at " :
      language === "bisaya" ? " ug " : " and ") :
      items.slice(0, -1).join(", ") +
      (filipino ? ", at " : language === "bisaya" ? ", ug " : ", and ") +
      items.at(-1);
  const messages = [];
  if (language === "bisaya") {
    if (known.length) messages.push("Oo, naay " + join(known) + " ang " + name + ".");
    if (denied.length) messages.push("Sumala sa listing, wala'y " + join(denied) + " ang " + name + ".");
    if (unclear.length) messages.push("Wala pa makumpirma sa records kung naa bay " +
      join(unclear) + ". Palihog pangutana sa Front Desk.");
  } else if (filipino) {
    if (known.length) messages.push("Yes po, may " + join(known) + " ang " + name + ".");
    if (denied.length) messages.push("Ayon po sa listing, walang " + join(denied) + " ang " + name + ".");
    if (unclear.length) messages.push("Hindi pa po confirmed sa room records kung may " +
      join(unclear) + " ang " + name + ". Paki-check na lang po sa Front Desk.");
  } else {
    if (known.length) messages.push("Yes, " + name + " includes " + join(known) + ".");
    if (denied.length) messages.push("Its listing says it does not include " + join(denied) + ".");
    if (unclear.length) messages.push("The records don't confirm " + join(unclear) +
      ". Please check with Front Desk.");
  }
  return messages.join(" ");
}
// Resolve explicit names from current inventory using whole-token matches.
function resolveAmenityTarget(rows, message) {
  const norm = v => String(v || "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const q = " " + norm(message) + " ", hits = [];
  for (const row of rows || []) {
    const name = norm(row.room_name || row.name);
    if (!name) continue;
    const needle = " " + name + " ";
    let at = q.indexOf(needle);
    while (at !== -1) {
      hits.push({row, start:at, end:at+needle.length});
      at = q.indexOf(needle, at+1);
    }
  }
  const full = hits.filter(h => !hits.some(other =>
    other.start <= h.start && other.end >= h.end &&
    (other.start < h.start || other.end > h.end)));
  const unique = [...new Map(full.map(h => [h.row.id, h.row])).values()];
  return {record: unique.length === 1 ? unique[0] : null, ambiguous: unique.length > 1};
}
module.exports = {
  resolveAmenityTarget, requestedAmenity, requestedAmenities, amenityEvidence,
  amenityReply, multiAmenityReply,
};
