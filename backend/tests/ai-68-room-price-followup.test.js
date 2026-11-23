"use strict";
// AI-68: Regression for the exact failed public customer conversation.
// Synthetic DB fixtures only; no Gemini calls, DB writes or payment actions.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const { matchRoomPriceFollowup,shortlistRoomFollowup,roomPriceFollowupReply }=
  require("../controllers/ai/aiRoomPriceFollowup");
const {verifiedAccommodationCards}=require("../controllers/ai/aiConversationStyle");
const {isResortQuestion}=require("../controllers/ai/aiResortScopeGuard");

const catalog=[
  {id:1,room_name:"Family Room A",category_name:"Rooms",status:"available",
    capacity:7,day_price:3500,overnight_price:4700},
  {id:2,room_name:"Family Room B",category_name:"Rooms",status:"available",
    capacity:20,day_price:8000,overnight_price:8000},
  {id:3,room_name:"Family Room C",category_name:"Rooms",status:"available",
    capacity:8,day_price:9000,overnight_price:6000},
  {id:4,room_name:"Cheap Cottage",category_name:"Cottages",status:"available",
    capacity:10,day_price:1000,overnight_price:1200},
  {id:5,room_name:"Under Maintenance Room",category_name:"Rooms",status:"maintenance",
    capacity:8,day_price:1000,overnight_price:1500},
  {id:6,room_name:"Small Room",category_name:"Rooms",status:"available",
    capacity:4,day_price:900,overnight_price:1300},
];
const originalContext={room_id:2,room_name:"Family Room B",guests:10,
  recommendation_category:"room",intent:"ask_recommendation",language_style:"taglish"};
const initialTurns=[
  {role:"user",text:"anong room ang pwede para sa 10 na tao"},
  {role:"assistant",text:"Ito po yung preview ng Family Room B."}
];

test("AI-68: changed guest count refreshes a 20-capacity family room to a closer 7-capacity room",()=>{
  const intent=matchRoomPriceFollowup("para sa 7 na tao",initialTurns,originalContext);
  assert.equal(intent?.kind,"group");
  assert.equal(intent?.guests,7);
  assert.equal(intent?.scope,"room");
  const selection=shortlistRoomFollowup(catalog,intent,originalContext);
  assert.equal(selection.rows.length,1);
  assert.equal(selection.rows[0].id,1,"not stale Family Room B");
  assert.equal(verifiedAccommodationCards(selection.rows,false).length,1);
  assert.match(roomPriceFollowupReply(selection,"taglish"),/Family Room A/);
  assert.doesNotMatch(roomPriceFollowupReply(selection,"taglish"),/confirmed available/i);
});
test("AI-68: 'room na pang 7 na tao' is a new room search, never an old selected-room answer",()=>{
  const intent=matchRoomPriceFollowup("room na pang 7 na tao",initialTurns,originalContext);
  assert.equal(intent?.scope,"room");
  assert.equal(intent?.guests,7);
  const res=shortlistRoomFollowup(catalog,intent,originalContext);
  assert.equal(res.rows[0].id,1);
});
test("AI-68: cheapest follow-up to updated 7-guest room does not switch to cottage",()=>{
  const after7={room_id:1,room_name:"Family Room A",guests:7,
    recommendation_category:"room",intent:"ask_recommendation"};
  const turns=[...initialTurns,
    {role:"user",text:"para sa 7 na tao"},
    {role:"assistant",text:"Para sa 7 guests, ito po ang Family Room A."}];
  const intent=matchRoomPriceFollowup("may mas mura ba dyan",turns,after7);
  assert.equal(intent?.kind,"cheaper");
  assert.equal(intent?.scope,"room");
  assert.equal(intent?.guests,7);
  const s=shortlistRoomFollowup(catalog,intent,after7);
  assert.equal(s.baseline?.id,1);
  assert.deepEqual(s.rows,[],"no same-slot cheaper room that still fits 7");
  assert.match(roomPriceFollowupReply(s,"taglish"),/Wala po akong makitang mas murang room/);
});
test("AI-68: cheaper options relative to Family Room B include real less-expensive rooms with preview cards",()=>{
  const intent=matchRoomPriceFollowup("may mas mura ba dyan",initialTurns,{
    ...originalContext, guests:7
  });
  const s=shortlistRoomFollowup(catalog,intent,{...originalContext,guests:7});
  assert.equal(intent?.scope,"room");
  assert.deepEqual(s.rows.map(r=>r.id),[1,3]);
  assert.doesNotMatch(roomPriceFollowupReply(s,"taglish"),/cottage/i);
  assert.ok(s.rows.every(r=>Number(r.capacity)>=7));
  assert.ok(s.rows.every(r=>r.category_name==="Rooms"));
  assert.match(roomPriceFollowupReply(s,"taglish"),/Family Room B/);
  assert.match(roomPriceFollowupReply(s,"taglish"),/₱/);
});
test("AI-68: comparison uses SAME slot rates and excludes misleading day/night cross-comparison",()=>{
  const context={room_id:2,room_name:"Family Room B",guests:7,
    recommendation_category:"room",intent:"ask_recommendation"};
  const rows=[
    {...catalog[1]},
    {id:11,room_name:"Room Night Expensive",status:"available",category_name:"Rooms",
      capacity:8,day_price:1000,overnight_price:12000},
  ];
  const intent=matchRoomPriceFollowup("Is there a cheaper room overnight?",[],context);
  assert.equal(intent?.stay,"night");
  const s=shortlistRoomFollowup(rows,intent,context);
  assert.equal(s.rows.length,0,"day price must not make an overnight option cheaper");
  assert.doesNotMatch(roomPriceFollowupReply(s,"english"),/Yes, these/);
});
test("AI-68: updated room focus and overnight preferences carry through naturally",()=>{
  const context={...originalContext,slot_preference:"night"};
  const intent=matchRoomPriceFollowup("room na pang 7 na tao",initialTurns,context);
  assert.equal(intent?.stay,"night");
  const sel=shortlistRoomFollowup(catalog,intent,context);
  assert.equal(sel.rows[0].id,1);
  assert.match(roomPriceFollowupReply(sel,"taglish"),/Night ₱4,700/);
});
test("AI-68: unrelated financial and non-resort messages don't inherit stale room",()=>{
  for(const q of [
    "May mas mura bang groceries?",
    "Mas mura ba ang tuition sa school?",
    "Cheaper electricity bill?",
    "What about the refund?",
    "Is there a parking discount?",
    "How much is the entrance fee?",
  ]) assert.equal(matchRoomPriceFollowup(q,initialTurns,originalContext),null,q);
  assert.equal(matchRoomPriceFollowup("may mas mura ba dyan",[],{}),null);
  assert.equal(matchRoomPriceFollowup("para sa 7 na tao",[],{}),null);
});
test("AI-68: English cheaper wording and group updates are recognized",()=>{
  const q="Do you have a cheaper room for 7 guests?";
  const match=matchRoomPriceFollowup(q,[],originalContext);
  assert.equal(match?.kind,"cheaper");
  assert.equal(match?.scope,"room");
  assert.equal(match?.guests,7);
  const updated=matchRoomPriceFollowup("A room for 7 guests, please",[],{});
  assert.equal(updated?.kind,"group");
  assert.equal(updated?.scope,"room");
  assert.equal(updated?.guests,7);
});
test("AI-69: 'para sa 2 meron din ba?' inherits room category and shows fresh 2-pax room",()=>{
  const after7={room_id:1,room_name:"Family Room A",guests:7,
    recommendation_category:"room",intent:"ask_recommendation"};
  const turns=[...initialTurns,
    {role:"user",text:"para sa 7 na tao"},
    {role:"assistant",text:"Para sa 7 guests, ito po ang Family Room A."}];
  const intent=matchRoomPriceFollowup("para sa 2 meron din ba?",turns,after7);
  assert.equal(intent?.kind,"group");
  assert.equal(intent?.guests,2);
  assert.equal(intent?.scope,"room");
  const selection=shortlistRoomFollowup(catalog,intent,after7);
  assert.equal(selection.rows.length,1);
  assert.equal(selection.rows[0].id,6);
  assert.equal(selection.rows[0].capacity,4);
  assert.equal(verifiedAccommodationCards(selection.rows,false).length,1);
  assert.doesNotMatch(roomPriceFollowupReply(selection,"taglish"),/room o cottage/i);
});
test("AI-69: one-word 'room' retains 2 guests and gives the same best-fit preview",()=>{
  const after2={room_id:6,room_name:"Small Room",guests:2,
    recommendation_category:"room",intent:"ask_recommendation"};
  const turns=[
    {role:"user",text:"para sa 2 meron din ba?"},
    {role:"assistant",text:"May smaller rooms for 2 guests. Room or cottage?"},
  ];
  const intent=matchRoomPriceFollowup("room",turns,after2);
  assert.equal(intent?.kind,"group");
  assert.equal(intent?.guests,2);
  assert.equal(intent?.scope,"room");
  const selection=shortlistRoomFollowup(catalog,intent,after2);
  assert.equal(selection.rows[0]?.id,6);
  assert.equal(selection.rows.length,1);
});
test("AI-69: category choice 'cottage' is explicit and stays in cottages",()=>{
  const after2={room_id:6,room_name:"Small Room",guests:2,
    recommendation_category:"room",intent:"ask_recommendation"};
  const intent=matchRoomPriceFollowup("cottage",[],after2);
  assert.equal(intent?.kind,"group");
  assert.equal(intent?.scope,"cottage");
  const selection=shortlistRoomFollowup(catalog,intent,after2);
  assert.equal(selection.rows[0]?.id,4);
  assert.ok(selection.rows.every(x=>x.category_name==="Cottages"));
});
test("AI-69: repeats don't switch to more expensive room when best fit already shown",()=>{
  const ctx={room_id:6,room_name:"Small Room",guests:2,
    recommendation_category:"room",intent:"ask_recommendation"};
  const intent=matchRoomPriceFollowup("room",[],ctx);
  const selected=shortlistRoomFollowup(catalog,intent,ctx);
  assert.equal(selected.rows[0]?.id,6);
});
test("AI-69: casual changed group followup supports English too",()=>{
  const q="for 2 do you have one too?";
  const intent=matchRoomPriceFollowup(q,initialTurns,originalContext);
  assert.equal(intent?.kind,"group");
  assert.equal(intent?.guests,2);
  assert.equal(intent?.scope,"room");
});
test("AI-69: room choices and 2-guest replies without a valid context stay conservative",()=>{
  assert.equal(matchRoomPriceFollowup("room",[],{}),null);
  assert.equal(matchRoomPriceFollowup("para sa 2 meron din ba?",[],{}),null);
  const context={...originalContext,guests:7};
  for (const q of ["para sa 2 meron ding parking?", "may mas mura bang tuition?",
    "para sa 2 magkano ang entrance?"]) {
    assert.equal(matchRoomPriceFollowup(q,initialTurns,context),null,q);
  }
});

test("AI-68: new controller path is BEFORE compound/legacy preview and uses fresh DB",()=>{
  const source=fs.readFileSync(path.join(__dirname,
    "../controllers/ai/geminiChatController.js"),"utf8");
  const followup=source.indexOf("if (roomPriceFollowup) {");
  const compound=source.indexOf("const compoundPolicy = compoundTopics(message)");
  const preview=source.indexOf("if (isVerifiedPreviewRequest(message) && !previewMustUseBookingFlow)");
  assert.ok(followup>0 && followup<compound && compound<preview);
  assert.match(source,/const \[currentRooms\] = await db\.promise\(\)\.query\(/);
  assert.match(source,/a\.max_capacity >= \?/);
  assert.match(source,/mode: "verified_room_price_followup"/);
  assert.match(source,/verifiedAccommodationCards\(selection\.rows, false\)/);
  const client=fs.readFileSync(path.join(__dirname,
    "../../frontend/js/ai-chat.js"),"utf8");
  assert.match(client,/data\.mode === "verified_room_price_followup"/);
});
