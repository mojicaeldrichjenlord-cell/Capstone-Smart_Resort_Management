// Category-specific accommodation amenity answers.
// No MySQL, Gemini, token consumption, booking mutations or network.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const policy = require("../controllers/ai/aiAccommodationCategoryPolicy");
const { amenityEvidence, amenityReply, requestedAmenity } =
  require("../controllers/ai/aiAccommodationAmenities");
const { focusedRoomOverview } = require("../controllers/ai/aiAccommodationDetails");

test("Only the Cottage CATEGORY means no included amenities", () => {
  const cottage = { name: "Big Shade 2", category_name: "Cottage" };
  assert.equal(policy.isPlainCottageCategory(cottage), true);
  assert.equal(amenityEvidence(cottage, "aircon"), "none_included");
  assert.equal(amenityReply(cottage, "cr", "May CR ba?", "taglish"),
    "Wala pong kasamang amenities sa Big Shade 2.");
  assert.match(focusedRoomOverview(cottage, "taglish"), /Wala pong kasamang amenities/);

  const single = { name: "Single Room Cottage 1", category_name: "Room",
    amenities: "1 Double Size Bed\nPrivate CR\nAir Conditioned" };
  assert.equal(policy.isPlainCottageCategory(single), false);
  assert.equal(amenityEvidence(single, "aircon"), "yes");
  assert.equal(amenityEvidence(single, "private_cr"), "yes");
  assert.match(focusedRoomOverview(single, "taglish"), /Private CR/);
});

test("Room without verified amenities remains unknown rather than falsely no amenities", () => {
  const room = { name: "Double Room 1", category_name: "Room", description: "2-6 pax" };
  assert.equal(amenityEvidence(room, "aircon"), "unknown");
  assert.match(amenityReply(room, "aircon", "May aircon?", "taglish"),
    /Hindi po naka-indicate/);
  assert.doesNotMatch(focusedRoomOverview(room, "english"),
    /does not include amenities/i);
});

test("Function Area has confirmed tables, monoblock chairs and karaoke fallback", () => {
  const hall = { name: "Beach Pavillion", category_name: "Function Areas" };
  assert.equal(policy.isFunctionAreaCategory(hall), true);
  assert.equal(amenityEvidence(hall, "karaoke"), "yes");
  assert.equal(amenityEvidence(hall, "table"), "yes");
  assert.equal(amenityEvidence(hall, "monoblock"), "yes");
  assert.match(focusedRoomOverview(hall, "taglish"), /tables, Monoblock chairs, Karaoke/i);
  assert.equal(requestedAmenity("May karaoke ba?"), "karaoke");
  assert.equal(requestedAmenity("May monoblock chairs po?"), "monoblock");
  assert.equal(requestedAmenity("May tables po?"), "table");
});

test("Admin-managed Function Area amenities take priority when populated", () => {
  const hall = { category_name: "Function Areas", amenities: "Tables\nKaraoke" };
  assert.equal(policy.hasListedAmenities(hall), true);
  assert.equal(amenityEvidence(hall, "karaoke"), "yes");
  assert.equal(amenityEvidence(hall, "monoblock"), "unknown");
  assert.doesNotMatch(focusedRoomOverview(hall, "english"), /Monoblock chairs/);
});

test("General category questions are short, accurate and category-scoped", () => {
  assert.equal(policy.generalCategoryAmenitiesReply(
    "Anong amenities ng mga cottages?", null, "taglish"),
    "Wala pong kasamang amenities sa aming mga cottage.");
  assert.match(policy.generalCategoryAmenitiesReply(
    "What amenities are in the Function Areas?", null, "english"), /tables, monoblock chairs, and karaoke/);
  assert.equal(policy.generalCategoryAmenitiesReply(
    "May karaoke ba sa Function Areas?", 93, "taglish"),
    "Yes po, may karaoke sa aming Function Areas.");
  assert.equal(policy.generalCategoryAmenitiesReply(
    "Anong amenities ng Single Room Cottage 1?", null, "taglish"), null);
  assert.equal(policy.generalCategoryAmenitiesReply(
    "May aircon ba ito?", 86, "taglish"), null);
  assert.equal(policy.generalCategoryAmenitiesReply(
    "Ano ang amenities ng rooms at cottages?", null, "taglish"), null);
});

test("AI focused DB paths read category name and do not update DB", () => {
  const source = fs.readFileSync(path.join(__dirname,
    "../controllers/ai/geminiChatController.js"), "utf8");
  const start = source.indexOf("// Amenity questions about the selected room");
  const end = source.indexOf("// Bounded previous turns:", start);
  assert.ok(start > 0 && end > start);
  const fast = source.slice(start, end);
  assert.match(fast, /c\.name AS category_name/);
  assert.match(fast, /verified_accommodation_amenity/);
  assert.match(fast, /verified_accommodation_overview/);
  assert.match(fast, /verified_category_amenities/);
  assert.match(fast, /generalCategoryAmenitiesReply\(/);
  assert.doesNotMatch(fast, /INSERT INTO|UPDATE accommodations|DELETE FROM/i);
});
