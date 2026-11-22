"use strict";
// AI-50 regression tests. Run at repository root:
// node --test backend/tests/ai-accommodation-comparison.test.js
// Fixtures are synthetic; NO real resort rates are assumed by these tests.
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isComparisonQuestion, selectComparisonRooms, comparisonReply
} = require("../controllers/ai/aiAccommodationComparison");
const fixtures = [
  { id:1, room_name:"Family Room A", category_name:"Rooms", status:"available",
    capacity:20, day_price:8000, overnight_price:8000,
    free_entrance_pax:10, amenities:"Private CR, Kitchen, 2 separate bedrooms",
    description:"Two bedrooms and living room." },
  { id:2, room_name:"Family Room B", category_name:"Rooms", status:"available",
    capacity:20, day_price:8000, overnight_price:8000,
    free_entrance_pax:10, amenities:"Private CR, Kitchen, 2 separate bedrooms",
    description:"Two bedrooms and living room." },
  { id:3, room_name:"Double Room 1", category_name:"Rooms", status:"available",
    capacity:6, day_price:3500, overnight_price:4000, amenities:"Aircon, CR" },
  { id:4, room_name:"Double Room 2", category_name:"Rooms", status:"available",
    capacity:8, day_price:4500, overnight_price:5000, amenities:"Aircon, Private CR" },
];
test("Family Room B at A resolves both exact DB listings, not only B", () => {
  const result = selectComparisonRooms(fixtures,"ano pinag kaiba ng family room b at a");
  assert.equal(result.complete,true);
  assert.deepEqual(result.rows.map(x=>x.room_name),["Family Room A","Family Room B"]);
  const answer=comparisonReply(result,"taglish");
  assert.match(answer,/Family Room A vs Family Room B/);
  assert.match(answer,/pareho/);
  assert.match(answer,/₱8,000\.00/);
  assert.match(answer,/hindi pa verified/i);
});
test("Explicit room pairs in either order work",()=>{
  for(const message of [
    "Ano ang pagkakaiba ng Family Room A at Family Room B?",
    "Family Room B vs Family Room A",
    "Difference between Family Room A and B",
    "A vs Family Room B"
  ]) {
    const selection=selectComparisonRooms(fixtures,message);
    assert.equal(selection.complete,true,message);
    assert.equal(selection.rows.length,2,message);
  }
});
test("Different capacities, rates and amenities come from each supplied row",()=>{
  const selection=selectComparisonRooms(fixtures,"Compare Double Room 1 vs Double Room 2");
  assert.equal(selection.complete,true);
  const response=comparisonReply(selection,"english");
  assert.match(response,/6 guests/);
  assert.match(response,/8 guests/);
  assert.match(response,/₱3,500\.00/);
  assert.match(response,/₱4,500\.00/);
  assert.match(response,/Private CR/);
});
test("Unverified counterpart is never fabricated from the first room",()=>{
  const result=selectComparisonRooms(fixtures,"Difference between Family Room A and C");
  assert.equal(result.complete,false);
  assert.deepEqual(result.missing,["family room c"]);
  const reply=comparisonReply(result,"taglish");
  assert.match(reply,/hindi ko po ma-verify/i);
  assert.doesNotMatch(reply,/₱8,000/);
});
test("An ordinary single-room inquiry never triggers comparison",()=>{
  assert.equal(isComparisonQuestion("Ano amenities ng Family Room B?"),false);
  assert.equal(selectComparisonRooms(fixtures,"Ano amenities ng Family Room B?"),null);
});
test("HTML in Admin record descriptions is not executed or repeated",()=>{
  const rows=fixtures.map(r=>({...r}));
  rows[0].description="<script>alert(1)</script>Family A room";
  rows[1].description="Family B room";
  const answer=comparisonReply(selectComparisonRooms(rows,"Compare Family Room A vs B"),"taglish");
  assert.doesNotMatch(answer,/<script|alert\(1\)/i);
  assert.match(answer,/Family A room/);
});
test("Stale single-room focus cannot replace comparison request",()=>{
  const backend = require("node:fs").readFileSync(
    require("node:path").join(__dirname, "../controllers/ai/geminiChatController.js"),"utf8");
  const frontend = require("node:fs").readFileSync(
    require("node:path").join(__dirname, "../../frontend/js/ai-chat.js"),"utf8");
  assert.ok(backend.indexOf('if (isComparisonQuestion(message))') <
    backend.indexOf('if (isVerifiedPreviewRequest(message)'));
  assert.match(frontend,/data\.mode === "verified_accommodation_comparison"/);
});
