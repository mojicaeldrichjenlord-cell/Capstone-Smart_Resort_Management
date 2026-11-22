"use strict";
// AI-52: Complete multi-amenity answers for a focused, freshly fetched DB room.
// Run: node --test backend/tests/ai-multi-amenity-followup.test.js
// Fixtures are synthetic; no Gemini credits, DB network, or payment calls.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  requestedAmenity, requestedAmenities, amenityEvidence,
  amenityReply, multiAmenityReply,
} = require("../controllers/ai/aiAccommodationAmenities");

const room = {
  id: 51, room_name: "Family Room B", category_name: "Rooms",
  amenities: "Private Cottage, Living Room, Kitchen, Private CR, 2 Separate Bedrooms, Air Conditioner in Each Bedroom, Cabinets in Each Bedroom",
  description: "Room accommodation for 8-20 pax",
};
test("The exact 'sariling CR at kitchen' follow-up covers BOTH properties", () => {
  const question = "May sariling CR at kitchen ba yan?";
  const features = requestedAmenities(question);
  assert.deepEqual(features, ["private_cr", "kitchen"]);
  assert.equal(requestedAmenity(question), null);
  assert.equal(amenityEvidence(room, "private_cr"), "yes");
  assert.equal(amenityEvidence(room, "kitchen"), "yes");
  assert.equal(multiAmenityReply(room, features, "taglish"),
    "Yes po, may sariling CR at kitchen ang Family Room B.");
});
test("A single-amenity CR question keeps its existing short response", () => {
  assert.deepEqual(requestedAmenities("May sariling CR ba yan?"), ["private_cr"]);
  assert.equal(requestedAmenity("May aircon ba yan?"), "aircon");
  assert.match(amenityReply(room, "private_cr", "May sariling CR ba yan?", "taglish"), /sariling CR/);
});
test("Private kitchen does NOT establish private CR", () => {
  assert.deepEqual(requestedAmenities("May CR at sariling kitchen ba?"), ["cr", "kitchen"]);
});
test("Missing amenity data is reported as unconfirmed, not fabricated", () => {
  const limited = {...room, amenities: "Private CR, Aircon", description: "Room"};
  const answer = multiAmenityReply(limited, ["private_cr", "kitchen"], "taglish");
  assert.match(answer, /may sariling CR/);
  assert.match(answer, /hindi pa po confirmed.*kitchen/i);
  assert.doesNotMatch(answer, /may sariling CR at kitchen/);
});
test("An explicitly negative kitchen record is acknowledged independently", () => {
  const limited = {...room, amenities: "Private CR, no kitchen", description: "Room"};
  const reply = multiAmenityReply(limited, ["private_cr", "kitchen"], "english");
  assert.match(reply, /includes private bathroom/);
  assert.match(reply, /does not include kitchen/);
});
test("Plain Cottage-category rules still override misleading amenity strings", () => {
  const cottage = {room_name:"Cottage", category_name:"Cottages", amenities:"Kitchen, Private CR"};
  const reply = multiAmenityReply(cottage, ["private_cr", "kitchen"], "taglish");
  assert.doesNotMatch(reply, /Yes po, may/);
  assert.match(reply, /walang .*sariling CR.*kitchen/i);
});
test("Missing selected room never permits an invented answer", () => {
  const backend=fs.readFileSync(path.join(__dirname, "../controllers/ai/geminiChatController.js"),"utf8");
  assert.match(backend, /const amenityKinds = requestedAmenities\(message\)/);
  assert.match(backend, /if \(amenityKinds\.length && !unresolvedNamedAmenityRoom/);
  assert.match(backend, /multiAmenityReply\(record, amenityKinds, language\)/);
  assert.match(backend, /if \(amenityKinds\.length\) \{/);
  assert.match(backend, /mode: "accommodation_selection_needed"/);
});
test("Fee and pricing questions are not turned into free amenity claims", () => {
  assert.deepEqual(requestedAmenities("Magkano ang extra fee sa kitchen?"), []);
  assert.deepEqual(requestedAmenities("May free kitchen ba kayo?"), []);
});
test("English and Bisaya responses each address both verified features", () => {
  const kinds=["private_cr","kitchen"];
  assert.match(multiAmenityReply(room,kinds,"english"),/private bathroom and kitchen/);
  assert.match(multiAmenityReply(room,kinds,"bisaya"),/pribadong CR ug kusina/);
});
