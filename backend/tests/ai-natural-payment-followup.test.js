"use strict";
// AI-57: Direct, concise full-versus-partial payment explanations.
// Run: node --test backend/tests/ai-natural-payment-followup.test.js
// Uses synthetic room rates; no MySQL, Gemini or PayPal calls.
const test=require("node:test");
const assert=require("node:assert/strict");
const {asksFullVsPartialPayment,paymentReply,isRoomPaymentInquiry}=require("../controllers/ai/aiFocusedPaymentReply");
const room={id:2,room_name:"Family Room B",status:"available",day_price:8000,overnight_price:8000};

test("Natural English paraphrases trigger payment-arrangement guidance",()=>{
  for(const prompt of [
    "Do we need to pay the full amount before arriving, or can we just pay part of it to secure the room?",
    "Do I have to pay everything now?",
    "Can I pay half first?",
    "Could I pay only part of the amount?"
  ]){
    assert.equal(isRoomPaymentInquiry(prompt),true,prompt);
    assert.equal(asksFullVsPartialPayment(prompt),true,prompt);
    const reply=paymentReply(prompt,{},room,"english");
    assert.match(reply,/No, you don't need to pay the full amount upfront/i);
    assert.match(reply,/Family Room B/);
    assert.match(reply,/₱4,000\.00/);
    assert.match(reply,/₱8,000\.00/);
    assert.match(reply,/PayPal/);
    assert.match(reply,/separate entrance fees/);
    assert.match(reply,/successful PayPal capture/);
    assert.match(reply,/final amount and available slot/);
    assert.ok(reply.length<450,"Follow-up should be shorter than full FAQ");
  }
});
test("Short arrangement answers mirror Taglish, Filipino and other supported languages",()=>{
  for(const [language,phrase] of [
    ["taglish","Hindi po kailangang full payment"],
    ["tagalog","Hindi po kailangang bayaran agad"],
    ["bisaya","Dili kinahanglan bayran"],
    ["spanish","No es necesario pagar todo"],
    ["mandarin","不用提前支付全部金额"],
  ]){
    const reply=paymentReply("Do we need to pay the full amount?",{},room,language);
    assert.ok(reply.startsWith(phrase),language);
    assert.match(reply,/₱4,000\.00/);
    assert.match(reply,/PayPal/);
  }
});
test("An ordinary downpayment amount inquiry retains detailed answer",()=>{
  const prompt="How much do we need to pay upfront for that room, and where can we pay?";
  assert.equal(asksFullVsPartialPayment(prompt),false);
  const reply=paymentReply(prompt,{},room,"english");
  assert.match(reply,/Estimated 50% downpayment: ₱4,000\.00/);
});
test("Different rates without slot: no guessed deposit and no false short answer",()=>{
  const different={...room,day_price:5000,overnight_price:8000};
  const reply=paymentReply("Do we need to pay the full amount?",{},different,"english");
  assert.match(reply,/Day Tour or Night/);
  assert.doesNotMatch(reply,/₱4,000\.00|₱2,500\.00/);
});
test("Maintenance or missing rate: never quote outdated values",()=>{
  for(const invalid of [{...room,status:"maintenance"},{...room,overnight_price:null}]){
    const reply=paymentReply("Can I pay half first?",{},invalid,"english");
    assert.doesNotMatch(reply,/₱4,000\.00/);
  }
});
test("Explicit multi-day stays are not priced as one standard slot",()=>{
  const reply=paymentReply("Can I pay half first for 2 nights?",{},room,"english");
  assert.doesNotMatch(reply,/₱4,000\.00/);
  assert.match(reply,/exact duration and total/);
});
