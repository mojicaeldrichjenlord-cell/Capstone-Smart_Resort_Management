"use strict";
// AI-65: Regression checks use synthetic messages only.
// No Gemini, MySQL, pricing changes, bookings or payment calls.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {explicitGuestCount} = require("../controllers/ai/aiRecommendationIntake");
const {guestCountFromText,selectVerifiedPreviews} = require("../controllers/ai/aiVerifiedPreview");
const {asksForAccommodationRecommendation,compoundTopics,compoundGuestReply} =
  require("../controllers/ai/aiCompoundGuestInquiry");
const {
  RESORT_INQUIRY_FACTS, matchVerifiedGuestAmenities,verifiedGuestAmenitiesReply,
  getUnverifiedResortPolicyReply,verifiedResortFacilityMentions,
  matchVerifiedResortFacilities,verifiedResortFacilitiesReply
} = require("../controllers/ai/resortInquiryKnowledge");
const {isResortQuestion} = require("../controllers/ai/aiResortScopeGuard");
const {isMixedEntranceAndCorkage,conciergeGuideReply} =
  require("../controllers/ai/aiConciergeGuidance");

test("English screenshot's 'group of 10' parses before recommendation",()=>{
  const message = "Hi! We're a group of 10 planning to stay overnight. Which room would you recommend? Can we bring our own food and speakers? Is Wi-Fi free in the room?";
  assert.equal(guestCountFromText(message),10);
  assert.equal(explicitGuestCount(message),10);
  assert.equal(asksForAccommodationRecommendation(message),true);
  assert.equal(compoundTopics(message)?.food,true);
  assert.equal(compoundTopics(message)?.audio,true);
  assert.equal(compoundTopics(message)?.wifi,true);
  const availableRooms = [
    {id:1,room_name:"Family Room A",category_name:"Rooms",status:"available",capacity:7,overnight_price:3500},
    {id:2,room_name:"Family Room B",category_name:"Rooms",status:"available",capacity:20,overnight_price:8000},
  ];
  const selected=selectVerifiedPreviews(availableRooms,"Recommend a room for 10 guests",[],{guests:10});
  assert.equal(selected.rows.length,1);
  assert.equal(selected.rows[0].id,2);
  const answer=compoundGuestReply(compoundTopics(message),message,{},"english",selected.rows[0],true);
  assert.equal(answer.previewRoom.id,2);
  assert.match(answer.reply,/Family Room B/);
  assert.match(answer.reply,/food and drinks/);
  assert.match(answer.reply,/no corkage fee/i);
  assert.match(answer.reply,/speakers/);
  assert.match(answer.reply,/free Wi-Fi/);
  assert.doesNotMatch(answer.reply,/How many guests/);
});
test("English group phrasings work, unrelated numbers do not",()=>{
  for (const q of ["We are a group of 10.", "A party of 10 will stay.",
    "There are 10 of us.", "We are 10 guests.", "10 of us plan to stay."])
    assert.equal(explicitGuestCount(q),10,q);
  assert.equal(explicitGuestCount("My room is #10."),0);
  assert.equal(explicitGuestCount("It costs 10000 pesos."),0);
});
test("Resort-approved zero corkage replaces all unknown answers",()=>{
  assert.match(RESORT_INQUIRY_FACTS.outsideFood,/NO CORKAGE FEE/);
  for (const [language,regex] of [
    ["english",/no corkage fee/i],["taglish",/walang corkage fee/i],
    ["tagalog",/walang corkage fee/i],["bisaya",/Walay corkage fee/i],
    ["spanish",/sin recargo|no se cobra/i],["mandarin",/不收取/]
  ]) {
    const answer=verifiedGuestAmenitiesReply({food:true,corkage:true},language);
    assert.match(answer,regex,language);
    assert.doesNotMatch(answer,/unconfirmed|not confirmed|hindi pa confirmed|hindi pa po kumpirmado/i,language);
  }
  assert.equal(matchVerifiedGuestAmenities("Is there a corkage fee?")?.food,true);
  assert.match(getUnverifiedResortPolicyReply({kind:"food",mentionsParking:false},"english"),/no corkage fee/i);
});
test("No corkage does not imply waived entrance or accommodation fees",()=>{
  assert.match(conciergeGuideReply("entrance_corkage","english"),/Entrance fees are separate/i);
  assert.match(conciergeGuideReply("entrance_corkage","english"),/no corkage fee/i);
  assert.match(conciergeGuideReply("entrance_corkage","taglish"),/walang corkage fee/i);
  assert.equal(isMixedEntranceAndCorkage("May entrance fee at corkage ba?"),true);
});
test("Convenience store and restobar are confirmed on resort premises",()=>{
  assert.match(RESORT_INQUIRY_FACTS.convenienceStore,/INSIDE/);
  assert.match(RESORT_INQUIRY_FACTS.restobar,/INSIDE/);
  for (const [q,kind] of [
    ["May convenience store ba sa loob?", "store"],
    ["Do you have a restobar?", "restobar"],
    ["May tindahan ba sa resort?", "store"],
    ["Is there a mini-mart?","store"]
  ]) {
    assert.equal(isResortQuestion(q),true,q);
    assert.equal(matchVerifiedResortFacilities(q)?.[kind],true,q);
  }
  const both=matchVerifiedResortFacilities("May convenience store at restobar ba?");
  assert.equal(both?.store,true);
  assert.equal(both?.restobar,true);
  assert.match(verifiedResortFacilitiesReply(both,"taglish"),/convenience store/);
  assert.match(verifiedResortFacilitiesReply(both,"taglish"),/restobar/);
});
test("Store menu and hours unknown: do not claim prices or operating hours",()=>{
  for(const q of ["Is the convenience store open now?",
    "What time does the restobar close?",
    "What is on the restobar menu?",
    "Does your restobar sell beer?",
    "How much are the items at the convenience store?"]) {
    assert.equal(matchVerifiedResortFacilities(q),null,q);
  }
});
test("Facility requests can be answered in English without Taglish leakage",()=>{
  const q="Do you have a convenience store and a restobar at the resort?";
  const topics=compoundTopics(q);
  assert.equal(topics?.store,true);
  assert.equal(topics?.restobar,true);
  const reply=compoundGuestReply(topics,q,{},"english");
  assert.match(reply.reply,/convenience store inside the resort/);
  assert.match(reply.reply,/on-site restobar/);
  assert.doesNotMatch(reply.reply,/\bpo\b/i);
});
test("Facilities plus food policy are answered together without unverified charges",()=>{
  const q="Can we bring our own food, and is there a convenience store and a restobar?";
  const topics=compoundTopics(q);
  assert.equal(topics?.food,true);
  assert.equal(topics?.store,true);
  assert.equal(topics?.restobar,true);
  const reply=compoundGuestReply(topics,q,{},"english");
  assert.match(reply.reply,/no corkage fee/i);
  assert.match(reply.reply,/convenience store/);
  assert.match(reply.reply,/restobar/);
});
test("Confirmed facilities route before general concierge and policy routes",()=>{
  const source=fs.readFileSync(path.join(__dirname,"../controllers/ai/geminiChatController.js"),"utf8");
  const facility=source.indexOf("const verifiedFacilities = matchVerifiedResortFacilities(message)");
  const concierge=source.indexOf("const conciergeIntent = matchConciergeGuide(message)");
  assert.ok(facility>0&&concierge>facility);
  assert.match(source,/mode: "verified_resort_facilities"/);
  assert.match(source,/recommendation_cards: combined\.previewRoom/);
});
