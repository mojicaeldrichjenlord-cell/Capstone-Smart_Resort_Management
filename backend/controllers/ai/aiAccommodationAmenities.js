// Evidence-based answers to simple CR/aircon/refrigerator questions.
// Uses only the selected accommodation's fresh Admin-managed DB details.
"use strict";

const FEATURES = Object.freeze({
  cr: /\b(?:cr|comfort\s*room|bathroom|bath\s*room|restroom|toilet|t\s*&\s*b)\b/i,
  aircon: /\b(?:air[\s-]?(?:con(?:ditioner|ditioning|ditioned)?|condition(?:er|ed|ing)?)|a\/c|ac)\b/i,
  ref: /\b(?:ref|refrigerator|fridge|mini[\s-]?(?:ref|fridge|refrigerator))\b/i,
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
    } else {
      findings.add(isNegated ? "no" : "yes");
    }
  }
  // Contradictory Admin text remains unverified; never guess.
  return findings.size === 1 ? [...findings][0] : "unknown";
}

function amenityReply(room, kind, message, language = "english") {
  const name = String(room?.room_name || room?.name || "accommodation").slice(0, 110);
  const status = amenityEvidence(room, kind);
  const filipino = /\b(?:may|meron|ba|bang|yung|ung|sarili|sariling|po|kasama|naka)\b/i.test(String(message || "")) ||
    ["tagalog", "taglish"].includes(String(language).toLowerCase());
  const item = {
    private_cr: filipino ? "sariling CR" : "private bathroom",
    cr: filipino ? "CR" : "bathroom",
    aircon: filipino ? "aircon" : "air conditioning",
    ref: filipino ? "ref" : "refrigerator",
  }[kind];
  if (status === "yes") {
    return filipino
      ? "Yes po, may " + item + " ang " + name + " ayon sa nakalistang description o amenities."
      : "Yes, " + name + " lists " + item + " in its description or amenities.";
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
  return filipino
    ? "Hindi po naka-indicate sa description o amenities ng " + name + " kung may " + item + ". Puwede po itong i-confirm sa Front Desk."
    : "The description and amenities don't confirm whether " + name + " has " + item + ". Please check with Front Desk.";
}
module.exports = { requestedAmenity, amenityEvidence, amenityReply };
