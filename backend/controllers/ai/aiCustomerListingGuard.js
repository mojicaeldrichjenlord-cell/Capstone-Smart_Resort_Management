"use strict";
// Customer-facing AI must not advertise unmistakable internal QA placeholders.
// This is a narrow temporary safeguard, NOT a replacement for publishing
// controls. Admin should mark TEST ROOM unavailable before a public launch.
//
// Never filter based on a suspiciously low price alone: legitimate offers
// must retain their exact Admin-managed rates.
const HIDDEN_QA_NAMES = Object.freeze([
  "test room",
  "test room only",
  "testing room",
  "demo room",
  "dummy room",
]);
const norm = value => String(value || "").normalize("NFKC")
  .trim().replace(/\s+/g, " ").toLowerCase();

function isInternalQaListing(room) {
  return HIDDEN_QA_NAMES.includes(norm(room?.room_name || room?.name));
}

// SQL predicate must run BEFORE ORDER BY/LIMIT so a very cheap test record
// cannot crowd genuine listings out of a bounded cheapest-price query.
// No user input is interpolated into this static predicate.
const PUBLIC_AI_SQL_FILTER = "LOWER(TRIM(a.name)) NOT IN (" +
  HIDDEN_QA_NAMES.map(name => "'" + name + "'").join(", ") + ")";

module.exports = {
  HIDDEN_QA_NAMES, isInternalQaListing, PUBLIC_AI_SQL_FILTER,
};
