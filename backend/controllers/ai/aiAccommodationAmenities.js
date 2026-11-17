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
  table: /\b(?:tables?|dining\s+tables?)\b/i,
  monoblock: /\b(?:monoblocks?|plastic\s+chairs?|monoblock\s+chairs?)\b/i,
});
const PRIVATE_CR = /\b(?:private|own|exclusive|sarili(?:ng)?|en[\s-]?suite|attached)\s+(?:cr|comfort\s*room|bathroom|bath\s*room|restroom|toilet|t\s*&\s*b)\b|\b(?:cr|comfort\s*room|bathroom|restroom|toilet)\s*(?:[-:(]\s*)?(?:private|own|exclusive|sarili(?:ng)?)\b/i;
const SHARED_CR = /\b(?:shared|common|communal|public)\s+(?:cr|comfort\s*room|bathroom|restroom|toilet)\b|\b(?:cr|bathroom|restroom|toilet)\s+(?:is\s+)?(?:shared|common|communal)\b/i;

// Broader, multi-amenity, fee or complex questions stay in normal Gemini flow.
function requestedAmenity(message) {
  const text = String(message || "").normalize("NFKC").toLowerCase();
  if (text.length > 300 || !/(?:\?|^\s*may\b|\b(?:meron|have|has|with|included|kasama|available|ba|bang)\b)/i.test(text)) return null;
  if (/\b(?:free|libre|extra|additional|charge|fee|bayad|magkano|how much)\b/i.test(text)) return null;
  const kinds = [];
  if (FEATURES.cr.test(text)) {
    kinds.push(/\b(?:sarili(?:ng)?|private|own|exclusive|en[\s-]?suite)\b/i.test(text) ? "private_cr" : "cr");
  }
  if (FEATURES.aircon.test(text)) kinds.push("aircon");
  if (FEATURES.ref.test(text)) kinds.push("ref");
  if (FEATURES.karaoke.test(text)) kinds.push("karaoke");
  if (FEATURES.table.test(text)) kinds.push("table");
  if (FEATURES.monoblock.test(text)) kinds.push("monoblock");
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

function amenityReply(room, kind, message, language = "english") {
  const name = String(room?.room_name || room?.name || "accommodation").slice(0, 110);
  const status = amenityEvidence(room, kind);
  // For live voice, an explicitly chosen language must win over speech
  // transcript wording. Typed chat passes the detected conversation language.
  const filipino = ["tagalog", "taglish"].includes(String(language).toLowerCase());
  const item = {
    private_cr: filipino ? "sariling CR" : "a private bathroom",
    cr: filipino ? "CR" : "a bathroom",
    aircon: filipino ? "aircon" : "air conditioning",
    ref: filipino ? "ref" : "refrigerator",
    karaoke: "karaoke",
    table: filipino ? "tables" : "tables",
    monoblock: "monoblock chairs",
  }[kind];
  if (status === "none_included") {
    return filipino
      ? "Wala pong kasamang amenities sa " + name + "."
      : name + " does not include amenities.";
  }
  if (status === "yes") {
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
      ? "May CR pong nakalista sa " + name + ", pero hindi nakasaad kung private ito. Puwede po itong i-confirm sa Front Desk."
      : name + " lists a bathroom, but the details don't specify whether it's private. Please confirm with Front Desk.";
  }
  return filipino
    ? "Hindi po naka-indicate sa description o amenities ng " + name + " kung may " + item + ". Puwede po itong i-confirm sa Front Desk."
    : "The description and amenities don't confirm whether " + name + " has " + item + ". Please check with Front Desk.";
}
module.exports = { requestedAmenity, amenityEvidence, amenityReply };
