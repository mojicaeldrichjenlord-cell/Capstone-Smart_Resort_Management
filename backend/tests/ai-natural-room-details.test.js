// Regression tests for natural (non-scripted) resort room questions.
// Uses verified DB-shaped rows, no MySQL writes and no Gemini calls.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  isNaturalRoomDetailsQuestion,
  naturalRoomDetailsReply,
} = require("../controllers/ai/aiNaturalRoomDetails");
const { requestedAmenity, amenityReply } =
  require("../controllers/ai/aiAccommodationAmenities");

const familyA = {
  id: 99, room_name: "Family Room A", category_name: "Room", free_entrance_pax: 3,
  amenities: "Private Cottage\nLiving Room\nKitchen\nPrivate CR\n" +
    "2 Separate Bedrooms\nAir Conditioner in Each Bedroom\nCabinets in Each Bedroom",
};
const familyB = { ...familyA, id: 100, room_name: "Family Room B", free_entrance_pax: 8 };

test("Multiple everyday ways to ask for the same accommodation details", () => {
  for (const question of [
    "anong meron sa family room b",
    "ano meron sa Family Room B?",
    "ano po ang kasama sa family room b?",
    "What does Family Room B have?",
    "What's included in this room?",
    "What are the amenities of Family Room B?",
    "What comes with Family Room B?",
    "Tell me about Family Room B",
    "Can you describe this room?",
    "Pakikwento ang Family Room B",
  ]) {
    assert.equal(isNaturalRoomDetailsQuestion(question), true, question);
  }
});

test("Feature and booking questions are not hijacked by generic details flow", () => {
  for (const question of [
    "does it have a cr?", "may aircon ba?", "may refrigerator ba?",
    "is Family Room B available?", "magkano ang Family Room B?",
    "i want to book Family Room B", "what time is check in?",
    "may Family Room B kayo?",
  ]) {
    assert.equal(isNaturalRoomDetailsQuestion(question), false, question);
  }
  assert.equal(requestedAmenity("does it have a cr?"), "cr");
  assert.equal(requestedAmenity("may sarili ba itong CR?"), "private_cr");
});

test("Family A and B answer from their own verified amenities and free pax", () => {
  const a = naturalRoomDetailsReply(familyA, "taglish");
  const b = naturalRoomDetailsReply(familyB, "taglish");
  assert.match(a, /^Sa Family Room A po,/);
  assert.match(b, /^Sa Family Room B po,/);
  for (const result of [a, b]) {
    assert.match(result, /private cottage/i);
    assert.match(result, /living room/i);
    assert.match(result, /kitchen/i);
    assert.match(result, /private CR/);
    assert.match(result, /2 bedrooms na parehong may aircon at cabinets/);
    assert.doesNotMatch(result, /refrigerator|fridge|\bTV\b|guaranteed|booking confirmed/i);
  }
  assert.match(a, /3 pax na free entrance/);
  assert.match(b, /8 pax na free entrance/);
  assert.doesNotMatch(a, /8 pax na free entrance/);
  assert.doesNotMatch(b, /3 pax na free entrance/);
});

test("Single-feature English/Taglish CR stays direct", () => {
  assert.equal(amenityReply(familyA, "cr", "Does it have a CR?", "english"),
    "Yes, Family Room A has a private bathroom.");
  assert.equal(amenityReply(familyB, "private_cr", "May sarili bang CR?", "taglish"),
    "Yes po, may sariling CR ang Family Room B.");
});

test("Missing test DB amenity is UNKNOWN; no fabricated Family B features", () => {
  const staleTest = { id:100, room_name:"Family Room B", category_name:"Room", amenities: null, free_entrance_pax:8 };
  assert.match(naturalRoomDetailsReply(staleTest,"taglish"), /Hindi pa po kumpleto/);
  assert.doesNotMatch(naturalRoomDetailsReply(staleTest,"taglish"), /aircon|private CR|refrigerator/);
  assert.match(amenityReply(staleTest,"cr","does it have a cr?","english"), /don't confirm/i);
});

test("Function Area and ordinary Cottage category remain distinguished", () => {
  assert.match(naturalRoomDetailsReply({
    room_name:"Beach Pavillion",category_name:"Function Area",
    amenities:"Tables\nMonoblock Chairs\nKaraoke",
  },"taglish"), /tables, monoblock Chairs, at karaoke/i);
  assert.equal(naturalRoomDetailsReply({
    room_name:"Big Shade 2",category_name:"Cottage",amenities:null,
  },"taglish"), "Wala pong kasamang amenities sa Big Shade 2.");
  assert.match(naturalRoomDetailsReply({
    room_name:"Single Room Cottage 1",category_name:"Room",
    amenities:"Private CR\nAir Conditioned",
  },"taglish"), /private CR at air Conditioned/i);
});

test("HTML and unknown free entrance data cannot contaminate answer", () => {
  const msg=naturalRoomDetailsReply({
    room_name:"Family Room B",category_name:"Room",free_entrance_pax:null,
    amenities:"<script>evil</script>Private CR\nKitchen",
  },"taglish");
  assert.doesNotMatch(msg, /<script>|evil|free entrance/);
  assert.match(msg,/private CR/);
});

test("Controller routes exact read-only DB facts before Gemini", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../controllers/ai/geminiChatController.js"), "utf8"
  );
  const start = source.indexOf("// Natural open-ended room details:");
  const end = source.indexOf("// Room overview fast path:", start);
  assert.ok(start > 0 && end > start);
  const code = source.slice(start, end);
  assert.match(code,/getAccommodationCatalog\(\)/);
  assert.match(code,/mentions.length === 1/);
  assert.match(code,/WHERE a\.id = \? LIMIT 1/);
  assert.match(code,/a\.free_entrance_pax/);
  assert.match(code,/naturalRoomDetailsReply\(room, language\)/);
  assert.match(code,/verified_natural_room_details/);
  assert.doesNotMatch(code,/\b(?:UPDATE|DELETE|INSERT)\s+(?:INTO|accommodations)\b/i);
  assert.doesNotMatch(code,/generateGemini\(/);
});


// Execute the exact live controller fast paths with isolated request/DB
// mocks, so selected A cannot leak into an explicit question about B.
function extractFastHandler(source, startText, endText, globals) {
  const begin = source.indexOf(startText);
  const end = source.indexOf(endText, begin);
  assert.ok(begin > 0 && end > begin);
  const expression = source.slice(begin, end);
  return new Function(...Object.keys(globals),
    "return (async function(){ " + expression + "\nreturn null; })()"
  )(...Object.values(globals));
}

const source = fs.readFileSync(
  path.join(__dirname, "../controllers/ai/geminiChatController.js"), "utf8"
);
const { explicitEntranceRoomName } = require("../controllers/ai/aiAccommodationEntrance");

function testDb(state, rowsById) {
  return {
    promise: () => ({query: async (sql, params) => {
      state.push({ sql, params });
      if (/WHERE a\.name = \?/.test(sql)) {
        return [Object.values(rowsById).filter(r => r.room_name === params[0])];
      }
      return [[rowsById[params[0]]].filter(Boolean)];
    }}),
  };
}

test("Named CR question about B overrides older selected A with exact DB lookup", async () => {
  const queries = [], out = {};
  const req = { body: { message: "Does Family Room B have a CR?",
    context: { room_id: 99, room_name: "Family Room A", language_style: "taglish" } } };
  const res = {status: () => ({json: data => Object.assign(out, data)})};
  await extractFastHandler(source, "    const amenityKind = requestedAmenity(message);",
    "    // Natural open-ended room details:", {
      req, res, db: testDb(queries, {99:familyA,100:familyB}),
      message:req.body.message,
      requestedAmenity, explicitEntranceRoomName, amenityReply,
      normalizeLanguageStyle: v => v || null,
      detectLanguageFromMessage: () => null,
      mergeContext: (old, next) => ({...old,...next}),
    });
  assert.equal(queries.length, 1);
  assert.equal(queries[0].params[0], "Family Room B");
  assert.equal(out.mode, "verified_accommodation_amenity");
  assert.equal(out.extracted_context.room_name, "Family Room B");
  assert.equal(out.reply, "Yes, Family Room B has a private bathroom.");
});

test("Pronoun CR question honors selected room, not previous other room", async () => {
  const queries = [], out = {};
  const req = { body: {message: "does it have a cr?",
    context: {room_id:99,room_name:"Family Room A",language_style:"taglish"}}};
  const res={status:()=>({json: v=>Object.assign(out,v)})};
  await extractFastHandler(source, "    const amenityKind = requestedAmenity(message);",
    "    // Natural open-ended room details:",{
      req,res,db:testDb(queries,{99:familyA,100:familyB}),message:req.body.message,
      requestedAmenity,explicitEntranceRoomName,amenityReply,
      normalizeLanguageStyle:v=>v||null,detectLanguageFromMessage:()=>null,
      mergeContext:(a,b)=>({...a,...b}),
    });
  assert.equal(queries[0].params[0], 99);
  assert.equal(out.reply, "Yes, Family Room A has a private bathroom.");
});

test("Unrecognized Family Room C does not get A's amenities as an answer", async () => {
  const queries=[],out={};
  const req={body:{message:"Does Family Room C have a CR?",
    context:{room_id:99,room_name:"Family Room A"}}};
  const res={status:()=>({json:v=>Object.assign(out,v)})};
  await extractFastHandler(source,"    const amenityKind = requestedAmenity(message);",
    "    // Natural open-ended room details:",{
      req,res,db:testDb(queries,{99:familyA}),message:req.body.message,
      requestedAmenity,explicitEntranceRoomName,amenityReply,
      normalizeLanguageStyle:v=>v||null,detectLanguageFromMessage:()=>null,
      mergeContext:(a,b)=>({...a,...b}),
    });
  assert.equal(queries.length,0);
  assert.equal(Object.keys(out).length,0);
});

test("Natural named B details override older selected A and list DB-factual 8 pax",async()=>{
  const queries=[],out={};
  const req={body:{message:"anong meron sa family room b?",
    context:{room_id:99,room_name:"Family Room A"}}};
  const res={status:()=>({json:v=>Object.assign(out,v)})};
  const getAccommodationCatalog=async()=>[familyA,familyB];
  await extractFastHandler(source,"    // Natural open-ended room details:",
    "    // Room overview fast path:",{
      req,res,db:testDb(queries,{99:familyA,100:familyB}),
      getAccommodationCatalog,message:req.body.message,
      isNaturalRoomDetailsQuestion,
      normalizeText:v=>String(v||"").toLowerCase(),
      normalizeLanguageStyle:v=>v||null,
      detectLanguageFromMessage:()=>null,
      mergeContext:(a,b)=>({...a,...b}),
      naturalRoomDetailsReply,
    });
  assert.equal(queries.length,1);
  assert.equal(queries[0].params[0],100);
  assert.equal(out.mode,"verified_natural_room_details");
  assert.equal(out.extracted_context.room_id,100);
  assert.match(out.reply,/Family Room B/);
  assert.match(out.reply,/8 pax na free entrance/);
  assert.doesNotMatch(out.reply,/refrigerator|fridge|\bTV\b/i);
});

test("Two named rooms require comparison instead of arbitrary A or B",async()=>{
  const queries=[],out={};
  const req={body:{message:"anong meron sa family room a at family room b?",
    context:{room_id:99,room_name:"Family Room A"}}};
  const res={status:()=>({json:v=>Object.assign(out,v)})};
  await extractFastHandler(source,"    // Natural open-ended room details:",
    "    // Room overview fast path:",{
      req,res,db:testDb(queries,{99:familyA,100:familyB}),
      getAccommodationCatalog:async()=>[familyA,familyB],
      message:req.body.message,
      isNaturalRoomDetailsQuestion,
      normalizeText:v=>String(v||"").toLowerCase(),
      normalizeLanguageStyle:v=>v||null,
      detectLanguageFromMessage:()=>null,
      mergeContext:(a,b)=>({...a,...b}),
      naturalRoomDetailsReply,
    });
  assert.equal(queries.length,0);
  assert.equal(Object.keys(out).length,0);
});
