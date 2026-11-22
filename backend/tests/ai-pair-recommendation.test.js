"use strict";
// AI-51: Verified recommendation between two named or previously compared
// resort accommodations. Fixtures are synthetic, NOT resort production rates.
// Run: node --test backend/tests/ai-pair-recommendation.test.js
// No Gemini, payment or MySQL network calls.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  isPairRecommendationQuestion, pairForRecommendation, pairRecommendation,
  isComparisonQuestion, selectComparisonRooms,
} = require("../controllers/ai/aiAccommodationComparison");

const rooms=[
  {id:11,room_name:"Family Room A",category_name:"Rooms",status:"available",capacity:7,day_price:3500},
  {id:12,room_name:"Family Room B",category_name:"Rooms",status:"available",capacity:20,day_price:8000},
  {id:13,room_name:"Double Room 1",category_name:"Rooms",status:"available",capacity:12,day_price:5000},
  {id:14,room_name:"Double Room 2",category_name:"Rooms",status:"maintenance",capacity:24,day_price:9000},
];

test("10-person Family Room A vs B choice recommends B, not no match",()=>{
  const q="Kung 10 guests kami, alin sa Family Room A at B ang mas recommended mo at bakit?";
  assert.equal(isPairRecommendationQuestion(q),true);
  const pair=pairForRecommendation(rooms,q,{});
  assert.deepEqual(pair.rows.map(r=>r.room_name),["Family Room A","Family Room B"]);
  const {reply,chosen}=pairRecommendation(pair,10,"taglish");
  assert.equal(chosen.room_name,"Family Room B");
  assert.match(reply,/10 guests/);
  assert.match(reply,/20 guests/);
  assert.match(reply,/7 guests/);
  assert.match(reply,/booking page/i);
  assert.doesNotMatch(reply,/Wala po akong makitang matching/i);
});
test("Follow-up 'those two' resolves saved DB IDs, not previous chatbot words",()=>{
  const pair=pairForRecommendation(rooms,"Among those two rooms, which is better for 10 guests?",{compared_room_ids:[11,12]});
  assert.equal(pair.complete,true);
  assert.equal(pairRecommendation(pair,10,"english").chosen.room_name,"Family Room B");
  // A pair in context alone must not hijack unrelated generic room discovery.
  assert.equal(pairForRecommendation(rooms,"What other cottages are there?",{compared_room_ids:[11,12]}),null);
});
test("Only current DB values are used even when saved IDs are stale",()=>{
  const outdated={compared_room_ids:[11,999]};
  const pair=pairForRecommendation(rooms,"Which of those two rooms is better for 10 guests?",outdated);
  assert.equal(pair.complete,false);
  assert.equal(pairRecommendation(pair,10,"english").chosen,null);
});
test("All known eligible options are evaluated before filtering",()=>{
  const pair=pairForRecommendation(rooms,"Which room is better for 10 guests: Double Room 1 or Double Room 2?",{});
  assert.equal(pair.complete,true);
  // Maintenance listings are never given as a bookable recommendation.
  assert.equal(pairRecommendation(pair,10,"english").chosen.room_name,"Double Room 1");
});
test("No accommodation fits: don't invent a room or booking availability",()=>{
  const pair=pairForRecommendation(rooms,"Recommend Family Room A or B for 30 guests",{});
  const result=pairRecommendation(pair,30,"taglish");
  assert.equal(result.chosen,null);
  assert.match(result.reply,/Wala po sa dalawang listing/);
});
test("Two suitable rooms: choose closest adequate recorded capacity",()=>{
  const pair=pairForRecommendation(rooms,"Which is better for 5 guests, Family Room A or Family Room B?",{});
  assert.equal(pairRecommendation(pair,5,"english").chosen.room_name,"Family Room A");
});
test("No guest count: ask one simple clarification",()=>{
  const pair=pairForRecommendation(rooms,"Which do you recommend, Family Room A or B?",{});
  assert.equal(pairRecommendation(pair,0,"english").reply,"How many guests are in your group?");
});
test("Ordinary comparison and one-room inquiries retain existing routing",()=>{
  assert.equal(isComparisonQuestion("Ano pinagkaiba ng Family Room B at A?"),true);
  assert.equal(isPairRecommendationQuestion("Ano pinagkaiba ng Family Room B at A?"),false);
  assert.equal(selectComparisonRooms(rooms,"Ano pinagkaiba ng Family Room B at A?").complete,true);
  assert.equal(pairForRecommendation(rooms,"May aircon ba sa Family Room B?",{}),null);
});
test("Pair route precedes single-room preview in API",()=>{
  const source=fs.readFileSync(path.join(__dirname,"../controllers/ai/geminiChatController.js"),"utf8");
  assert.ok(source.indexOf("if (isPairRecommendationQuestion(message))")>0);
  assert.ok(source.indexOf("if (isPairRecommendationQuestion(message))")<
    source.indexOf("if (isVerifiedPreviewRequest(message)"));
  assert.match(source,/mode: "verified_pair_recommendation"/);
  assert.match(source,/context\.compared_room_ids = comparison\.rows\.map/);
});
