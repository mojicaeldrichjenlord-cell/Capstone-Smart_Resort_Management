"use strict";
// AI-60: Client-confirmed 2026-11-22 property-wide NO ANIMALS policy.
// node --test backend/tests/ai-verified-pets-policy.test.js
// No Gemini, DB, payment calls or network.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {
  RESORT_INQUIRY_FACTS,matchVerifiedPetPolicy,verifiedPetPolicyReply,
  matchUnverifiedResortPolicy,resortInquiryPromptLines,
}=require("../controllers/ai/resortInquiryKnowledge");
const {isResortQuestion}=require("../controllers/ai/aiResortScopeGuard");
const q="pwede ba mag dala ng aso?";

test("Exact failed pet question is in resort scope and receives confirmed NO",()=>{
  assert.equal(isResortQuestion(q),true);
  const match=matchVerifiedPetPolicy(q);
  assert.ok(match);
  assert.match(verifiedPetPolicyReply(match,"tagalog"),/bawal magdala ng mga hayop/);
  assert.doesNotMatch(verifiedPetPolicyReply(match,"tagalog"),/hindi pa kumpirmado|unknown/i);
});
test("Dogs, cats, all animals and generic pets cannot be brought to any room",()=>{
  for(const message of [
    "Pet-friendly ba kayo?","Can I bring my dog to Family Room B?",
    "May pusa po ako, pwede dalhin?","Are animals allowed at your resort?",
    "Can we bring pets into our cottage?","Pwede ba hayop sa resort?",
  ]){
    assert.equal(isResortQuestion(message),true,message);
    assert.ok(matchVerifiedPetPolicy(message),message);
    assert.equal(matchUnverifiedResortPolicy(message),null,message);
  }
});
test("Spanish and Mandarin pet questions remain allowed inside resort scope",()=>{
  for(const [q,l,part] of [
    ["¿Puedo traer a mi perro?","spanish","no se permiten mascotas"],
    ["可以带宠物吗？","mandarin","禁止携带宠物"],
    ["Pwede ba magdala og iro?","bisaya","bawal magdala og mga hayop"]
  ]){
    assert.equal(isResortQuestion(q),true,q);
    assert.match(verifiedPetPolicyReply(matchVerifiedPetPolicy(q),l),
      new RegExp(part));
  }
});
test("Known parking can accompany pet policy without implying pet permission",()=>{
  const reply=verifiedPetPolicyReply(
    matchVerifiedPetPolicy("Are dogs allowed and is parking free?"),"english");
  assert.match(reply,/not allowed/);
  assert.match(reply,/Parking for vehicles is free/);
  assert.doesNotMatch(reply,/pets.*free parking/i);
});
test("Mixed pets + Wi-Fi/corkage answer newly verified facts and still-unknown corkage separately",()=>{
  const reply=verifiedPetPolicyReply(
    matchVerifiedPetPolicy("Can I bring my dog and is there Wi-Fi or corkage?"),"english");
  assert.match(reply,/not allowed/);
  assert.match(reply,/Free Wi-Fi is available in rooms only/);
  assert.match(reply,/You may bring your own food and drinks/);
  assert.match(reply,/Corkage fees haven't been confirmed/);
});
test("Unrelated topics do not produce pet-policy answer",()=>{
  assert.equal(matchVerifiedPetPolicy("Do you have free parking?"),null);
  assert.equal(matchVerifiedPetPolicy("What is the room downpayment?"),null);
  assert.equal(matchVerifiedPetPolicy("Can I bring outside food?"),null);
});
test("Knowledge prompt says NO animals and does not call pet rules unverified",()=>{
  assert.match(RESORT_INQUIRY_FACTS.pets,/NOT ALLOWED/);
  const prompt=resortInquiryPromptLines();
  assert.match(prompt,/NO-ANIMALS\/NO-PETS/);
  assert.doesNotMatch(prompt,/unverified pet rules/i);
});
test("Routing happens before unknown policy and direct Gemini fallback",()=>{
  const api=fs.readFileSync(path.join(__dirname,"../controllers/ai/geminiChatController.js"),"utf8");
  assert.ok(api.indexOf("const petPolicy = matchVerifiedPetPolicy(message)")>0);
  assert.ok(api.indexOf("const petPolicy = matchVerifiedPetPolicy(message)")<
    api.indexOf("const unverifiedPolicy = matchUnverifiedResortPolicy("));
  assert.match(api,/mode: "verified_pet_policy"/);
});
test("Offline chatbot reuses the same approved no-animals fact",()=>{
  const src=fs.readFileSync(path.join(__dirname,"../../frontend/js/ai-chat.js"),"utf8");
  const begin=src.indexOf("function getOfflineVerifiedResortReply(message, language, context) {");
  const end=src.indexOf("// Stage 85-D",begin);
  assert.ok(begin>=0 && end>begin);
  const offline=new Function(src.slice(begin,end)+"\nreturn getOfflineVerifiedResortReply;")();
  const reply=offline("pwede ba mag dala ng aso?","taglish",{}).reply;
  assert.match(reply,/Bawal magdala ng pets/i);
  assert.doesNotMatch(reply,/hindi pa confirmed.*pet/i);
});
