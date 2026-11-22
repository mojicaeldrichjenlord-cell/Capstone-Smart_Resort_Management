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
test("Menus, stock, sales, and prices still cannot be assumed",()=>{
  for(const q of [
    "What is on the restobar menu?",
    "Does your restobar sell beer?",
    "How much are the items at the convenience store?",
    "Does the convenience store sell medicine?"
  ]) {
    assert.equal(matchVerifiedResortFacilities(q),null,q);
  }
});
test("AI-66: verified restobar closing and opening hours are read directly",()=>{
  assert.match(RESORT_INQUIRY_FACTS.restobar,/6:00 PM to 6:00 AM THE NEXT DAY/);
  for (const q of [
    "What time does the restobar close?",
    "When does your restobar open?",
    "Is the restobar open right now?",
    "Anong oras nagsasara ang restobar?",
    "What are the operating hours of the restobar?",
    "Bukas ba ang restobar araw-araw?"
  ]) {
    const matched=matchVerifiedResortFacilities(q);
    assert.equal(matched?.restobar,true,q);
    assert.equal(matched?.hours,true,q);
    const reply=verifiedResortFacilitiesReply(matched,"english");
    assert.match(reply,/daily/);
    assert.match(reply,/6:00 PM/);
    assert.match(reply,/6:00 AM/);
    assert.match(reply,/next day/);
  }
  assert.match(verifiedResortFacilitiesReply(
    matchVerifiedResortFacilities("Anong oras nagsasara ang restobar?"),"taglish"
  ),/6:00 AM po ang closing/);
  assert.match(verifiedResortFacilitiesReply(
    matchVerifiedResortFacilities("Anong oras bukas ang restobar?"),"tagalog"
  ),/6:00 PM hanggang 6:00 AM/);
});
test("AI-66: convenience store is verified open 24/7",()=>{
  assert.match(RESORT_INQUIRY_FACTS.convenienceStore,/24\/7/);
  for(const q of ["What time does the convenience store open?",
    "Is the convenience store open now?",
    "Is your mini-mart 24/7?",
    "Anong oras bukas ang convenience store?"]) {
    const matched=matchVerifiedResortFacilities(q);
    assert.equal(matched?.store,true,q);
    assert.equal(matched?.hours,true,q);
    assert.match(verifiedResortFacilitiesReply(matched,"english"),/open 24\/7/);
  }
  assert.match(verifiedResortFacilitiesReply(
    matchVerifiedResortFacilities("Bukas ba 24/7 ang convenience store?"),"taglish"
  ),/Open 24\/7 po/);
});
test("AI-66: combined policies and facility schedules retain all facts",()=>{
  const q="Can we bring our own food and what time does the restobar close?";
  const topics=compoundTopics(q);
  assert.equal(topics?.food,true);
  assert.equal(topics?.restobar,true);
  assert.equal(topics?.facilityHours,true);
  const reply=compoundGuestReply(topics,q,{},"english");
  assert.match(reply.reply,/no corkage fee/i);
  assert.match(reply.reply,/6:00 PM/);
  assert.match(reply.reply,/6:00 AM/);
  assert.doesNotMatch(reply.reply,/not specified|unconfirmed/i);
});

test("AI-67: restobar offers general food and drinks without invented items",()=>{
  assert.match(RESORT_INQUIRY_FACTS.restobar,/SERVES FOOD AND DRINKS/);
  for(const q of [
    "Does the restobar serve food and drinks?",
    "Do you have food at the restobar?",
    "May food at drinks ba sa restobar?",
    "May pagkain at inumin ba sa restobar?"
  ]) {
    const match = matchVerifiedResortFacilities(q);
    assert.equal(match?.restobar,true,q);
    assert.equal(match?.offerings,true,q);
    const english=verifiedResortFacilitiesReply(match,"english");
    assert.match(english,/restobar serves food and drinks/);
    assert.doesNotMatch(english,/pizza|beer|rice|chicken|₱/i);
    const taglish=verifiedResortFacilitiesReply(match,"taglish");
    assert.match(taglish,/may food at drinks sa restobar/i);
  }
});
test("AI-67: restobar hours and general food/drinks can be stated together",()=>{
  const match=matchVerifiedResortFacilities(
    "What time does the restobar open, and does it serve food and drinks?");
  assert.equal(match?.hours,true);
  assert.equal(match?.offerings,true);
  assert.match(verifiedResortFacilitiesReply(match,"english"),/6:00 PM/);
  assert.match(verifiedResortFacilitiesReply(match,"english"),/serves food and drinks/);
});
test("AI-67: general restobar offerings do not claim specific menu, prices or alcohol sales",()=>{
  for(const q of [
    "What's on your restobar menu?",
    "What are the prices of food at the restobar?",
    "Does the restobar serve beer?",
    "Can I bring my own food into the restobar?",
    "Does the convenience store sell food?",
    "Is pizza on your restobar menu?"
  ]) {
    assert.equal(matchVerifiedResortFacilities(q),null,q);
  }
});
test("AI-67: multi-facility message includes food/drinks and schedules",()=>{
  const q="Does the restobar serve food and drinks, and is the convenience store open 24/7?";
  const topics=compoundTopics(q);
  assert.equal(topics?.store,true);
  assert.equal(topics?.restobar,true);
  assert.equal(topics?.facilityOfferings,true);
  assert.equal(topics?.facilityHours,true);
  const reply=compoundGuestReply(topics,q,{},"english");
  assert.match(reply.reply,/restobar serves food and drinks/);
  assert.match(reply.reply,/convenience store.*open 24\/7/);
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
