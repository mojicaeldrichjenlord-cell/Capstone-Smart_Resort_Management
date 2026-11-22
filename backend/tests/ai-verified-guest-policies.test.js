"use strict";
// AI-61: Client-confirmed food, Wi-Fi and pool policies, 2026-11-22.
// Run: node --test backend/tests/ai-verified-guest-policies.test.js
// No Gemini, MySQL, PayPal or other external calls.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {
  RESORT_INQUIRY_FACTS, matchVerifiedGuestAmenities,
  verifiedGuestAmenitiesReply, matchVerifiedPetPolicy,
  verifiedPetPolicyReply, resortInquiryPromptLines,
}=require("../controllers/ai/resortInquiryKnowledge");
const {isResortQuestion}=require("../controllers/ai/aiResortScopeGuard");

function answer(q,lang="taglish") {
  const match=matchVerifiedGuestAmenities(q);
  assert.ok(match,"No grounded matcher for "+q);
  return verifiedGuestAmenitiesReply(match,lang);
}

test("Own food and drinks allowed, with separate unknown corkage amount",()=>{
  assert.match(answer("Pwede ba magdala ng sariling pagkain at inumin?","tagalog"),/maaaring po kayong magdala ng sariling pagkain at inumin/i);
  assert.match(answer("Can we bring our own food and drinks?","english"),/you may bring your own food and drinks/);
  const corkage=answer("Is there a corkage fee for outside food?","english");
  assert.match(corkage,/may bring/);
  assert.match(corkage,/hasn't been confirmed/);
  assert.doesNotMatch(corkage,/no corkage|corkage is free|₱\d/);
});
test("Free Wi-Fi is in Rooms only; Single Room Cottage is a Room",()=>{
  assert.match(answer("May free Wi-Fi ba sa Family Room B?","taglish"),/free Wi-Fi sa rooms/);
  assert.match(answer("Does Single Room Cottage have Wi-Fi?","english"),/Yes, free Wi-Fi is available in resort rooms/);
  const plain=answer("Is there Wi-Fi in the cottage?","english");
  assert.match(plain,/rooms only, not in cottages/);
  assert.doesNotMatch(plain,/yes, cottages have Wi-Fi/i);
});
test("Wi-Fi password/speed aren't invented",()=>{
  const response=answer("What's the Wi-Fi password and speed?","english");
  assert.match(response,/Wi-Fi.*rooms only/i);
  assert.match(response,/password, speed and signal strength aren't confirmed/i);
});
test("Pool is always open and has no particular swimwear restrictions",()=>{
  assert.match(answer("Can we swim at 2 AM?","english"),/pool is always open, including at night/);
  assert.match(answer("May restrictions ba sa damit sa pool?","tagalog"),/walang partikular na pagbabawal sa kasuotang panlangoy/);
  assert.equal(isResortQuestion("Can we swim at 2 AM?"),true);
});
test("Pool fee, lifeguards, age/depth requirements are NOT fabricated",()=>{
  const fee=answer("How much is the pool entrance fee?","english");
  assert.match(fee,/Pool admission fees aren't confirmed/);
  const safety=answer("May life guard ba sa pool?","taglish");
  assert.match(safety,/safety, age at supervision rules/);
  assert.doesNotMatch(fee,/pool is free|free admission|₱\d/i);
});
test("Free parking and the pool can be discussed without promising free pool access",()=>{
  const q="Is parking free and is the pool open?";
  const m=matchVerifiedGuestAmenities(q);
  assert.ok(m.parking&&m.pool);
  assert.equal(m.poolFee,false);
  const text=verifiedGuestAmenitiesReply(m,"english");
  assert.match(text,/Parking for vehicles is free/);
  assert.match(text,/pool is always open/);
  assert.doesNotMatch(text,/Pool admission fees aren't confirmed/);
});
test("Compound pet + Wi-Fi gets both approved facts",()=>{
  const q="Are pets allowed and do you have Wi-Fi?";
  const reply=answer(q,"english");
  assert.match(reply,/Wi-Fi is available in room accommodations only/);
  assert.match(reply,/Pets and other animals aren't allowed/);
  // Older pet-only handler is still grounded.
  assert.match(verifiedPetPolicyReply(matchVerifiedPetPolicy("Can I bring my dog?"),"english"),/not allowed/);
});
test("Unrelated free food, cottage booking and price inquiries aren't hijacked",()=>{
  for(const question of [
    "May libreng pagkain ba kayo?",
    "Do you have a Pool Shade available?",
    "Magkano ang Family Room B?",
    "How do I pay the downpayment?",
    "Is smoking allowed?",
    "Do you allow alcoholic drinks?"
  ]) assert.equal(matchVerifiedGuestAmenities(question),null,question);
  assert.equal(isResortQuestion("Is smoking allowed?"),true);
  assert.equal(isResortQuestion("Are alcoholic drinks allowed?"),true);
});
test("Known policy is available to grounded AI in its prompt",()=>{
  const prompt=resortInquiryPromptLines();
  assert.match(RESORT_INQUIRY_FACTS.outsideFood,/MAY bring their own food/);
  assert.match(RESORT_INQUIRY_FACTS.roomWifi,/FREE Wi-Fi.*ONLY in room/);
  assert.match(RESORT_INQUIRY_FACTS.pool,/ALWAYS OPEN/);
  assert.match(prompt,/Corkage fees.*remain unverified/);
  assert.match(prompt,/alcohol, smoking, videoke rules/);
});
test("Multilingual direct answers preserve verified limitations",()=>{
  const q="Is there free Wi-Fi at the resort?";
  for(const lang of ["english","tagalog","taglish","bisaya","spanish","mandarin"]){
    const text=answer(q,lang);
    assert.ok(text.length>15,lang);
    assert.doesNotMatch(text,/all areas|everywhere|pool admission is free/i);
  }
});
test("Verified route precedes unverified legacy fallback",()=>{
  const code=fs.readFileSync(path.join(__dirname,"../controllers/ai/geminiChatController.js"),"utf8");
  assert.ok(code.indexOf("const verifiedGuestPolicy = matchVerifiedGuestAmenities(message)")>0);
  assert.ok(code.indexOf("const verifiedGuestPolicy = matchVerifiedGuestAmenities(message)")<
    code.indexOf("const unverifiedPolicy = matchUnverifiedResortPolicy("));
});
test("Offline customer AI mirrors new verified policies",()=>{
  const code=fs.readFileSync(path.join(__dirname,"../../frontend/js/ai-chat.js"),"utf8");
  const start=code.indexOf("function getOfflineVerifiedResortReply(message, language, context) {");
  const end=code.indexOf("// Stage 85-D",start);
  assert.ok(start>0&&end>start);
  const offline=new Function(code.slice(start,end)+"\nreturn getOfflineVerifiedResortReply;")();
  assert.match(offline("Can we bring our own food?","english",{}).reply,/may bring your own food and drinks/);
  assert.match(offline("Is Wi-Fi available in a cottage?","english",{}).reply,/rooms only, not in cottages/);
  assert.match(offline("Can we swim at 2 AM?","english",{}).reply,/pool is always open/);
  assert.match(offline("Is the pool free?","english",{}).reply,/fees haven't been confirmed/);
  assert.match(offline("Can I bring my dog and use Wi-Fi?","english",{}).reply,/animals and pets are not allowed/);
});
