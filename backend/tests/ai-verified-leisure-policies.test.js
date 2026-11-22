"use strict";
// AI-62: Client-approved alcohol/smoking/vaping/own audio policies.
// Run: node --test backend/tests/ai-verified-leisure-policies.test.js
// Synthetic, no MySQL/Gemini/PayPal calls.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {
  RESORT_INQUIRY_FACTS,matchVerifiedLeisurePolicies,
  verifiedLeisurePoliciesReply,resortInquiryPromptLines,
}=require("../controllers/ai/resortInquiryKnowledge");
const {isResortQuestion}=require("../controllers/ai/aiResortScopeGuard");

function reply(question,lang="taglish"){
  assert.equal(isResortQuestion(question),true,question+" should be in scope");
  const matched=matchVerifiedLeisurePolicies(question);
  assert.ok(matched,question+" should match");
  return verifiedLeisurePoliciesReply(matched,lang);
}
test("Confirmed alcoholic drinks permission, without inventing beverage sales or corkage waivers",()=>{
  const taglish=reply("Pwede po magdala ng alak?");
  assert.match(taglish,/puwede magdala ng alcoholic drinks/);
  assert.match(taglish,/walang specific time restrictions/i);
  const english=reply("Are alcoholic drinks allowed?","english");
  assert.match(english,/guests may bring alcoholic drinks/);
  for(const q of ["Do you sell beer?","Do you serve wine?","Can I buy alcohol at your resort?"]){
    assert.equal(matchVerifiedLeisurePolicies(q),null,q);
  }
  assert.doesNotMatch(english,/corkage is free|no fee|₱\d/);
});
test("Smoking/vaping policy is recognized in natural Tagalog and English",()=>{
  assert.match(reply("Pwede ba mag yosi?"),/Allowed po ang smoking at vaping/);
  assert.match(reply("Is smoking allowed?","english"),/Smoking and vaping are allowed/);
  assert.match(reply("Is vaping allowed?","english"),/no specific time restrictions/i);
});
test("Smoke inside a specific room is not promised without location confirmation",()=>{
  const resp=reply("Can I smoke in the room?","english");
  assert.match(resp,/Smoking and vaping are allowed/);
  assert.match(resp,/inside a specific room or area hasn't been confirmed/);
});
test("Bring-your-own karaoke or speakers is allowed without resort time restrictions",()=>{
  for(const q of [
    "Can I bring my own videoke?","Can we bring our own Bluetooth speaker?",
    "Are there time restrictions on our own speakers?","Kahit 2 AM ba pwede magvideoke?",
    "Pwede ba magdala ng sariling speaker?"
  ]){
    const resp=reply(q,"english");
    assert.match(resp,/bring and use your own videoke\/karaoke equipment or speakers/);
    assert.match(resp,/no specific time restrictions/);
  }
});
test("Guest-owned equipment must NOT be mistaken for room-included equipment",()=>{
  for(const q of [
    "May sariling karaoke ba sa Family Room B?",
    "May videoke ba sa Family Room B?",
    "Do you have karaoke in a Family Room?",
    "Are there speakers in the rooms?",
    "Is karaoke included in Double Room?"
  ]) assert.equal(matchVerifiedLeisurePolicies(q),null,q);
});
test("Unrelated consumer electronics, payments or resort service retail aren't hijacked",()=>{
  assert.equal(isResortQuestion("What are the best speakers in 2026?"),false);
  assert.equal(matchVerifiedLeisurePolicies("How much is the downpayment?"),null);
  assert.equal(matchVerifiedLeisurePolicies("Do you offer videoke rentals?"),null);
});
test("Approved policies appear in grounded Gemini prompt",()=>{
  assert.match(RESORT_INQUIRY_FACTS.leisurePolicies,/NO TIME RESTRICTIONS/);
  assert.match(RESORT_INQUIRY_FACTS.outsideFood,/including alcoholic drinks/);
  const prompt=resortInquiryPromptLines();
  assert.match(prompt,/smoking\/vaping.*OWN videoke\/speakers ARE ALLOWED/);
  assert.match(prompt,/Corkage fees.*remain unverified/);
  assert.doesNotMatch(prompt,/alcohol, smoking, videoke rules and other missing policies/);
});
test("Natural answers exist for all supported languages",()=>{
  const m=matchVerifiedLeisurePolicies("Can I bring alcoholic drinks and use my own speakers?");
  for(const lang of ["english","tagalog","taglish","bisaya","spanish","mandarin"]){
    const txt=verifiedLeisurePoliciesReply(m,lang);
    assert.ok(txt.length>35,lang);
    assert.doesNotMatch(txt,/₱\d|no corkage|free alcohol/i);
  }
});
test("Fast path precedes unknown resort services and Gemini",()=>{
  const api=fs.readFileSync(path.join(__dirname,"../controllers/ai/geminiChatController.js"),"utf8");
  const fast=api.indexOf("const leisurePolicy = matchVerifiedLeisurePolicies(message)");
  const fallback=api.indexOf("const unknownService = matchUnverifiedServiceQuestion(message)");
  assert.ok(fast>0&&fallback>fast);
  assert.match(api,/mode: "verified_leisure_policies"/);
});
test("Customer offline fallback mirrors all confirmed permissions",()=>{
  const source=fs.readFileSync(path.join(__dirname,"../../frontend/js/ai-chat.js"),"utf8");
  const begin=source.indexOf("function getOfflineVerifiedResortReply(message, language, context) {");
  const end=source.indexOf("// Stage 85-D",begin);
  assert.ok(begin>0&&end>begin);
  const offline=new Function(source.slice(begin,end)+"\nreturn getOfflineVerifiedResortReply;")();
  for(const [q,expect] of [
    ["Pwede ba magdala ng alak?",/may bring alcoholic drinks/],
    ["Is smoking allowed?",/Smoking and vaping are allowed/],
    ["Can I bring my own speakers?",/bring and use your own videoke or speakers/],
    ["Are there time restrictions on our own speakers?",/no specific time restrictions/],
    ["Can I smoke in the room?",/isn't confirmed/],
  ]){
    const actual=offline(q,"english",{})?.reply;
    assert.match(actual,expect,q);
  }
  assert.equal(offline("May sariling karaoke ba sa Family Room B?","taglish",{}),null);
});
