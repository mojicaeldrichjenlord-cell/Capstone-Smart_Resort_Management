"use strict";
// Regression coverage for natural AI preview intent and verified static
// accommodation photos. No MySQL writes, Gemini calls or booking/payment APIs.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
  isVerifiedPreviewRequest, selectVerifiedPreviews, verifiedPreviewReply,
} = require("../controllers/ai/aiVerifiedPreview");

const catalog = [
  {id:99,room_name:"Family Room A",category_name:"Room",capacity:7,status:"available"},
  {id:100,room_name:"Family Room B",category_name:"Room",capacity:20,status:"available"},
  {id:30,room_name:"Big Shade 2 Cottage",category_name:"Cottage",capacity:25,status:"available"},
  {id:39,room_name:"Beach Pavilion",category_name:"Function Area",capacity:120,status:"available"},
  {id:101,room_name:"Pool Pavilion",category_name:"Function Area",capacity:150,status:"available"},
  {id:86,room_name:"Single Room Cottage 1",category_name:"Room",capacity:4,status:"available"},
  {id:93,room_name:"Single Room (Pool side) A",category_name:"Room",capacity:4,status:"available"},
  {id:94,room_name:"Single Room (Pool side) B",category_name:"Room",capacity:4,status:"available"},
  {id:95,room_name:"Single Room (Pool side) C",category_name:"Room",capacity:4,status:"available"},
  {id:41,room_name:"Double Room 1",category_name:"Room",capacity:6,status:"available"},
  {id:42,room_name:"Double Room 2",category_name:"Room",capacity:6,status:"maintenance"},
  {id:61,room_name:"Pool Shade A",category_name:"Cottage",capacity:8,status:"available"},
  {id:62,room_name:"Pool Shade C",category_name:"Cottage",capacity:8,status:"available"},
  {id:63,room_name:"Pool Shade E",category_name:"Cottage",capacity:8,status:"maintenance"},
  {id:64,room_name:"Big Nipa Hut 10",category_name:"Cottage",capacity:20,status:"available"},
  {id:65,room_name:"Small Shade 3",category_name:"Cottage",capacity:10,status:"available"},
];
function ids(result) { return result.rows.map(room => room.id); }

test("Natural named Family Room B photo request returns that exact room", () => {
  const msg = "may preview ka ng family room b?";
  assert.equal(isVerifiedPreviewRequest(msg), true);
  const selection = selectVerifiedPreviews(catalog,msg,[],{room_id:99,room_name:"Family Room A"});
  assert.deepEqual(ids(selection),[100]);
  assert.match(verifiedPreviewReply(selection,"taglish"),/Family Room B/);
});

test("Poolside, double rooms and general cottages are identified by requested category", () => {
  assert.deepEqual(ids(selectVerifiedPreviews(catalog,"single room pool side may preview ba?")),[93,94,95]);
  assert.deepEqual(ids(selectVerifiedPreviews(catalog,"double room preview")),[41]);
  assert.ok(ids(selectVerifiedPreviews(catalog,"cottage photos")).includes(30));
  assert.ok(!ids(selectVerifiedPreviews(catalog,"double room preview")).includes(42),
    "Never show maintenance inventory as available listing");
});

test("100-person cottage inquiry offers verified larger Function Areas, not tiny cottages", () => {
  const msg = "anong cottage naman para sa 100 na tao";
  assert.equal(isVerifiedPreviewRequest(msg),true);
  const result = selectVerifiedPreviews(catalog,msg);
  assert.deepEqual(ids(result),[39,101]);
  assert.equal(result.alternative,true);
  assert.match(verifiedPreviewReply(result,"taglish"),/Wala pong cottage/);
});

test("Short preview follow-up uses latest user category, not old selected accommodation", () => {
  const result = selectVerifiedPreviews(catalog,"may preview ba?",[
    {role:"user",text:"may family room kayo"},
    {role:"assistant",text:"May Family Room B po"},
    {role:"user",text:"anong cottage para sa 100 na tao"},
    {role:"assistant",text:"May function area po"},
  ],{room_id:100,room_name:"Family Room B"});
  assert.deepEqual(ids(result),[39,101]);
});

test("An unqualified preview asks which accommodation; saved focused ID is validated", () => {
  assert.deepEqual(ids(selectVerifiedPreviews(catalog,"may preview ba?")),[]);
  assert.match(verifiedPreviewReply(selectVerifiedPreviews(catalog,"may preview ba?"),"taglish"),/Anong accommodation/);
  assert.deepEqual(ids(selectVerifiedPreviews(catalog,"may preview ba?",[],{room_id:100,room_name:"Family Room B"})),[100]);
  assert.deepEqual(ids(selectVerifiedPreviews(catalog,"may preview ba?",[],{room_id:100,room_name:"Family Room A"})),[]);
});

test("Amenity-only queries do not trigger preview cards", () => {
  for (const msg of ["may CR ba ito?", "magkano ang rate?", "ilang free entrance ang Family Room A?"]) {
    assert.equal(isVerifiedPreviewRequest(msg),false,msg);
  }
});

const frontend = fs.readFileSync(
  path.join(__dirname,"../../frontend/js/ai-chat.js"),"utf8");
const controller = fs.readFileSync(
  path.join(__dirname,"../controllers/ai/geminiChatController.js"),"utf8");

function photoHelpers(pathname) {
  const start = frontend.indexOf("const AI_ROOM_IMAGE_FALLBACK =");
  const end = frontend.indexOf("function aiRoomMoney(",start);
  assert.ok(start >= 0 && end > start);
  return vm.runInNewContext(
    frontend.slice(start,end) +
      "\n;({resolveAiRoomImage,verifiedAiRoomStaticPhoto})",
    {AI_API_BASE:"https://smartresort-backend.onrender.com/api",
     window:{location:{pathname}},encodeURIComponent,Set,Number,fetch:async()=>({ok:false})}
  );
}

test("Case-correct verified Family/Double/Function photo paths on production Vercel", () => {
  const image = photoHelpers("/customerHTML/index.html");
  assert.equal(
    image.resolveAiRoomImage("images/accommodations/family-room-b/Family-Room-B-Cover.jpg"),
    "/images/accommodations/Family-Room-B/family-room-b-cover.jpg");
  assert.equal(
    image.verifiedAiRoomStaticPhoto({name:"Family Room B"}),
    "images/accommodations/Family-Room-B/family-room-b-cover.jpg");
  assert.equal(
    image.verifiedAiRoomStaticPhoto({name:"Double Room 2"}),
    "images/accommodations/Double-Room/Double-Room-2.jpg");
  assert.equal(
    image.verifiedAiRoomStaticPhoto({name:"Beach Pavilion"}),
    "images/accommodations/Function-Area/Beach-Pavillion.jpg");
  assert.equal(
    image.verifiedAiRoomStaticPhoto({name:"Single Room (Pool side) C"}),
    "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-C.jpg");
  assert.equal(image.verifiedAiRoomStaticPhoto({name:"Unknown Listing"}),"");
});

test("Localhost static paths and Aiven-backed media URLs are handled separately", () => {
  const image = photoHelpers("/frontend/customerHTML/index.html");
  assert.equal(
    image.resolveAiRoomImage("images/accommodations/Family-Room-A/family-room-a-cover.jpg"),
    "/frontend/images/accommodations/Family-Room-A/family-room-a-cover.jpg");
  assert.equal(
    image.resolveAiRoomImage("api/rooms/media/42"),
    "https://smartresort-backend.onrender.com/api/rooms/media/42");
  assert.equal(
    image.resolveAiRoomImage("javascript:alert(1)").startsWith("data:image/svg+xml"),true);
});

test("Controller routes explicit previews before generic Gemini and cards remain DB-owned", () => {
  assert.match(controller,/require\("\.\/aiVerifiedPreview"\)/);
  const direct = controller.indexOf("if (isVerifiedPreviewRequest(message))");
  const model = controller.indexOf("const response = await generateGemini(ai, finalPrompt)");
  assert.ok(direct > 0 && model > direct);
  assert.match(controller,/recommendation_cards: verifiedAccommodationCards\(selection.rows, false\)/);
  assert.match(frontend,/function setAiRecommendationPhoto/);
  assert.match(frontend,/addCandidate\(verifiedAiRoomStaticPhoto\(room\)\)/);
});

test("Pool Shade discovery identifies only Pool Shade records, never Nipa Hut or Pavilion", () => {
  const msg = "anong mga pool shade meron kayo";
  assert.equal(isVerifiedPreviewRequest(msg), true);
  const selection = selectVerifiedPreviews(catalog, msg);
  assert.equal(selection.category, "pool_shade");
  assert.deepEqual(ids(selection), [61, 62]);
  assert.ok(!ids(selection).includes(63), "Maintenance records must stay hidden");
});

test("Follow-up 'may preview kaba' preserves the most recent Pool Shade category", () => {
  const selection = selectVerifiedPreviews(catalog, "may preview kaba", [
    {role:"user",text:"anong mga pool shade meron kayo"},
    {role:"assistant",text:"Meron po kaming iba't ibang pool shade"},
  ], {room_id:64,room_name:"Big Nipa Hut 10"});
  assert.deepEqual(ids(selection), [61, 62]);
  assert.equal(selection.category, "pool_shade");
});

test("Correcting 'pool shade hindi nipa hut' returns only Pool Shade cards", () => {
  const correction = "pool shade hindi nipa hut";
  assert.equal(isVerifiedPreviewRequest(correction), true);
  const selection = selectVerifiedPreviews(catalog, correction, [
    {role:"user",text:"nipa hut preview"},
  ], {room_id:64,room_name:"Big Nipa Hut 10"});
  assert.deepEqual(ids(selection), [61, 62]);
});

test("Generic Nipa Hut, Shade, Pool Pavilion, and Poolside Room stay separate", () => {
  assert.deepEqual(ids(selectVerifiedPreviews(catalog, "nipa hut preview")), [64]);
  assert.deepEqual(ids(selectVerifiedPreviews(catalog, "pool pavilion preview")), [101]);
  assert.deepEqual(ids(selectVerifiedPreviews(catalog, "single room pool side preview")), [93,94,95]);
  assert.deepEqual(ids(selectVerifiedPreviews(catalog, "pool shade preview")), [61,62]);
  assert.deepEqual(ids(selectVerifiedPreviews(catalog, "small shade preview")), [65]);
});

test("Pool Shade amenity questions do not trigger an unsolicited preview card", () => {
  assert.equal(isVerifiedPreviewRequest("may CR ba sa Pool Shade?"), false);
  assert.equal(isVerifiedPreviewRequest("magkano ang Pool Shade A?"), false);
  assert.equal(isVerifiedPreviewRequest("Pool Shade A picture"), true);
});

test("Frontend clears an older focused room when a new category preview replaces it", () => {
  assert.match(frontend, /data\.mode === "verified_accommodation_preview"/);
  assert.match(frontend, /delete merged\.room_id;/);
  assert.match(frontend, /delete merged\.room_name;/);
});
