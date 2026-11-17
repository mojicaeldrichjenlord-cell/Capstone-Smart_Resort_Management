// Verified AI answers about free entrance pax.
// Offline regression: no Gemini, no backend listener, no DB writes.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  isFreeEntranceQuestion,
  explicitEntranceRoomName,
  verifiedFreeEntranceReply,
} = require("../controllers/ai/aiAccommodationEntrance");

test("Recognizes free entrance questions but not paid entrance or inventory queries", () => {
  assert.equal(isFreeEntranceQuestion("Ilang free entrance sa Family Room B?"), true);
  assert.equal(isFreeEntranceQuestion("May free entrance ba ito?"), true);
  assert.equal(isFreeEntranceQuestion("How many complimentary entrance passes?"), true);
  assert.equal(isFreeEntranceQuestion("May free entrance sa Single Room Cottage 1?"), true);
  assert.equal(isFreeEntranceQuestion("Magkano ang entrance fee?"), false);
  assert.equal(isFreeEntranceQuestion("May cottage pa kayo?"), false);
  assert.equal(isFreeEntranceQuestion("Ano ang amenities?"), false);
});

test("Explicit names override older selected room and never guess ambiguous names", () => {
  assert.equal(explicitEntranceRoomName("Ilang free entrance sa Family Room B?"), "Family Room B");
  assert.equal(explicitEntranceRoomName("How many free entrance in double room 2?"), "Double Room 2");
  assert.equal(explicitEntranceRoomName("May free entrance sa Single Room Cottage 1?"), "Single Room Cottage 1");
  assert.equal(explicitEntranceRoomName("Free entrance for Single Room (Pool side) C?"), "Single Room (Pool side) C");
  assert.equal(explicitEntranceRoomName("Ilang free entrance sa Family Room A at Family Room B?"), null);
  assert.equal(explicitEntranceRoomName("Ilang free entrance sa Family Room C?"), null);
  assert.equal(explicitEntranceRoomName("May free entrance ba ito?"), null);
});

test("Verified room A/B, Double and Single answers use only DB free_entrance_pax", () => {
  assert.equal(verifiedFreeEntranceReply({room_name:"Family Room A",free_entrance_pax:3}, "taglish"),
    "May 3 pax na free entrance po ang Family Room A.");
  assert.equal(verifiedFreeEntranceReply({room_name:"Family Room B",free_entrance_pax:8}, "taglish"),
    "May 8 pax na free entrance po ang Family Room B.");
  assert.equal(verifiedFreeEntranceReply({room_name:"Double Room 1",free_entrance_pax:4}, "taglish"),
    "May 4 pax na free entrance po ang Double Room 1.");
  assert.equal(verifiedFreeEntranceReply({room_name:"Single Room Cottage 1",free_entrance_pax:2}, "english"),
    "Single Room Cottage 1 includes free entrance for 2 guests.");
});

test("Null or zero is not interpreted as included free entrance", () => {
  assert.match(verifiedFreeEntranceReply({room_name:"Mystery Room",free_entrance_pax:null},"taglish"),
    /Hindi pa po naka-indicate/);
  assert.match(verifiedFreeEntranceReply({room_name:"Mystery Room",free_entrance_pax:undefined},"english"),
    /not listed/);
  assert.match(verifiedFreeEntranceReply({room_name:"Test",free_entrance_pax:-1},"english"),
    /not listed/);
  assert.equal(verifiedFreeEntranceReply({room_name:"No-Free Room",free_entrance_pax:0},"taglish"),
    "Wala pong kasamang free entrance ang No-Free Room.");
});

test("Chat controller reads fresh DB column with parameterized lookup before Gemini", () => {
  const src = fs.readFileSync(path.join(__dirname,
    "../controllers/ai/geminiChatController.js"), "utf8");
  const first = src.indexOf("// FREE ENTRANCE —");
  const after = src.indexOf("// Amenity questions about the selected room", first);
  assert.ok(first > 0 && after > first);
  const focused = src.slice(first, after);
  assert.match(focused, /isFreeEntranceQuestion\(message\)/);
  assert.match(focused, /SELECT id, name AS room_name, free_entrance_pax/);
  assert.match(focused, /WHERE /);
  assert.match(focused, /name = \? LIMIT 2/);
  assert.match(focused, /id = \? LIMIT 1/);
  assert.match(focused, /verified_accommodation_free_entrance/);
  assert.match(focused, /verifiedFreeEntranceReply\(record, language\)/);
  assert.doesNotMatch(focused, /\bUPDATE\b|\bINSERT\b|\bDELETE\b/);
  // Existing selected-room amenity fast path must remain in place.
  assert.match(src, /mode: "verified_accommodation_amenity"/);
});
