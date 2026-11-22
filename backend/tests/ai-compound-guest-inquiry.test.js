"use strict";
// AI-63: Cross-reference mixed FAQs without losing the full guest inquiry.
// Run: node --test backend/tests/ai-compound-guest-inquiry.test.js
// All fixtures synthetic; 0 Gemini credits, no SQL writes or PayPal calls.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {compoundTopics,compoundRoom,compoundGuestReply}=
  require("../controllers/ai/aiCompoundGuestInquiry");
const {isResortQuestion}=require("../controllers/ai/aiResortScopeGuard");
const {verifiedAccommodationCards}=require("../controllers/ai/aiConversationStyle");

const question="10 guests po kami, balak naming mag-overnight. Pwede ba kaming magdala ng food, drinks at sariling videoke? May Wi-Fi din ba sa room?";
const rooms=[
  {id:7,room_name:"Family Room A",status:"available",category_name:"Rooms",capacity:7,day_price:3500,overnight_price:3500,image:"family-a.jpg"},
  {id:8,room_name:"Family Room B",status:"available",category_name:"Rooms",capacity:20,day_price:8000,overnight_price:8000,image:"family-b.jpg"},
  {id:9,room_name:"Big Cottage",status:"available",category_name:"Cottages",capacity:20,day_price:1800,overnight_price:2000,image:"big-cottage.jpg"},
];
const focus={room_id:8,room_name:"Family Room B"};
test("Exact screenshot's compound question detects food + own audio + Wi-Fi",()=>{
  assert.equal(isResortQuestion(question,focus),true);
  const m=compoundTopics(question);
  assert.ok(m);
  assert.equal(m.food,true);
  assert.equal(m.audio,true);
  assert.equal(m.wifi,true);
  assert.equal(m.alcohol,false);
});
test("The SAME reply addresses all questions before the room preview",()=>{
  const room=compoundRoom(rooms,question,focus);
  assert.equal(room.id,8);
  const result=compoundGuestReply(compoundTopics(question),question,focus,"taglish",room);
  assert.match(result.reply,/magdala ng sariling food at drinks/);
  assert.match(result.reply,/magdala at gumamit ng sariling videoke at speakers/);
  assert.match(result.reply,/free Wi-Fi sa rooms/);
  assert.match(result.reply,/10 guests/);
  assert.match(result.reply,/Family Room B/);
  assert.match(result.reply,/listed capacity.*20/);
  assert.match(result.reply,/overnight date at slot sa booking page/);
  assert.equal(result.previewRoom.id,8);
  assert.equal(verifiedAccommodationCards([result.previewRoom],false).length,1);
  assert.doesNotMatch(result.reply,/₱|guaranteed|confirmed.*availability/);
});
test("Pure English paraphrase also answers all parts in English",()=>{
  const q="We're 10 guests staying overnight. Can we bring our own food and speakers, and do the rooms have Wi-Fi?";
  const answer=compoundGuestReply(compoundTopics(q),q,focus,"english",rooms[1]);
  assert.match(answer.reply,/you may bring your own food and drinks/i);
  assert.match(answer.reply,/bring and use your own videoke\/karaoke equipment or speakers/i);
  assert.match(answer.reply,/free Wi-Fi is available in resort rooms/i);
  assert.equal(answer.previewRoom.id,8);
});
test("Pure Tagalog policy question receives Filipino-language answers",()=>{
  const q="Sampu kaming bisita, maaari po bang magdala ng sariling pagkain at videoke at may Wi-Fi ba sa kuwarto?";
  const result=compoundGuestReply(compoundTopics(q),q,{},"tagalog");
  assert.match(result.reply,/maaari po kayong magdala ng sariling pagkain at inumin/i);
  assert.match(result.reply,/Maaari po kayong magdala at gumamit ng sarili ninyong videoke/i);
  assert.match(result.reply,/may libreng Wi-Fi sa mga kuwarto/i);
  assert.equal(result.previewRoom,null);
});
test("Cottage focus cannot be misrepresented as having free room Wi-Fi",()=>{
  const q="20 guests po kami sa cottage. Pwede kami magdala ng food at may Wi-Fi?";
  const result=compoundGuestReply(compoundTopics(q),q,{}, "taglish",rooms[2]);
  assert.match(result.reply,/Sa rooms lang po may free Wi-Fi, hindi sa cottages/i);
  assert.equal(result.previewRoom.id,9);
});
test("A Room-category unit named 'Single Room Cottage' retains room Wi-Fi policy",()=>{
  const unit={...rooms[1],room_name:"Single Room Cottage",category_name:"Rooms"};
  const q="10 guests kami, puwede ba magdala ng food at may Wi-Fi sa Single Room Cottage?";
  const result=compoundGuestReply(compoundTopics(q),q,{}, "taglish",unit);
  assert.match(result.reply,/may free Wi-Fi sa rooms/);
  assert.doesNotMatch(result.reply,/hindi sa cottages/);
});
test("Don't show a 7-capacity room to 10 guests as a confirmed match",()=>{
  const result=compoundGuestReply(compoundTopics(question),question,
    {room_id:7,room_name:"Family Room A"},"taglish",rooms[0]);
  assert.equal(result.previewRoom,null);
  assert.match(result.reply,/capacity.*7 guests.*below sa 10/);
});
test("Missing/renamed/stale selected-room context cannot generate a fake preview",()=>{
  assert.equal(compoundRoom(rooms,question,{room_id:8,room_name:"Old Name"}),null);
  assert.equal(compoundRoom(rooms,question,{room_id:1,room_name:"Family Room B"}),null);
  const noRoom=compoundGuestReply(compoundTopics(question),question,{},"taglish");
  assert.match(noRoom.reply,/puwede rin akong magpakita ng suitable rooms/);
  assert.equal(noRoom.previewRoom,null);
});
test("Inactive room is not advertised in optional card",()=>{
  const room={...rooms[1],status:"maintenance"};
  const result=compoundGuestReply(compoundTopics(question),question,focus,"taglish",room);
  assert.equal(result.previewRoom,null);
  assert.match(result.reply,/Wi-Fi/);
});
test("Other verified compound policies such as pets + alcohol stay accurate",()=>{
  const result=compoundGuestReply(
    compoundTopics("Can I bring my dog and alcoholic drinks?"),
    "Can I bring my dog and alcoholic drinks?",{},"english");
  assert.match(result.reply,/guests may bring alcoholic drinks/);
  assert.match(result.reply,/Pets and other animals aren't allowed/);
});
test("Single-topic inquiries and questions needing other facts preserve old handlers",()=>{
  for(const q of [
    "May Wi-Fi ba sa room?",
    "Pwede magdala ng sariling videoke?",
    "May sariling CR at kitchen ba yan?",
    "Does Family Room B include videoke and Wi-Fi?",
    "What are the room rates for 10 guests who want free Wi-Fi and food?",
    "What is the downpayment for 10 guests, with food and Wi-Fi?",
    "May pool shade ba for 10 guests?",
    "Do you sell beer and have parking?",
    "Can we reserve a room on 2026-12-18 and bring food and videoke?",
    "Is a room available tomorrow with Wi-Fi and food?",
    "Can we check in tonight and bring food and speakers?",
    "Is there an available slot for 10 guests with food and Wi-Fi?",
  ])assert.equal(compoundTopics(q),null,q);
});
test("Compound-policy handler executes BEFORE preview and attaches only verified cards",()=>{
  const source=fs.readFileSync(path.join(__dirname,
    "../controllers/ai/geminiChatController.js"),"utf8");
  const compound=source.indexOf("const compoundPolicy = compoundTopics(message)");
  const preview=source.indexOf("if (isVerifiedPreviewRequest(message) && !previewMustUseBookingFlow)");
  assert.ok(compound>0 && preview>compound);
  assert.match(source,/mode: "verified_compound_guest_inquiry"/);
  assert.match(source,/compoundRoom\(catalog, message, scopeContext\)/);
  assert.match(source,/verifiedAccommodationCards\(\[combined\.previewRoom\], false\)/);
});
