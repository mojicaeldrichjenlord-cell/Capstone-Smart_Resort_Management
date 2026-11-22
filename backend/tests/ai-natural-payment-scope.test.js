"use strict";
// AI-58: A natural partial-payment follow-up must pass the resort-only gate.
// Run: node --test backend/tests/ai-natural-payment-scope.test.js
// Read-only deterministic tests, no Gemini, DB or network.
const test=require("node:test");
const assert=require("node:assert/strict");
const {
  isResortQuestion,isResortPaymentFollowUp
}=require("../controllers/ai/aiResortScopeGuard");
const {isRoomPaymentInquiry,asksFullVsPartialPayment,paymentReply}=
  require("../controllers/ai/aiFocusedPaymentReply");

const context={room_id:2,room_name:"Family Room B"};
const room={id:2,room_name:"Family Room B",status:"available",day_price:8000,overnight_price:8000};
const recent=[
  {role:"user",text:"How much do we need to pay upfront for that room?"},
  {role:"assistant",text:"Estimated 50% downpayment is ₱4,000."},
];

test("Exact failed question passes scope and reaches verified payment response",()=>{
  const q="Can I pay half first, then settle the rest when we arrive?";
  assert.equal(isResortQuestion(q,context,recent),true);
  assert.equal(isRoomPaymentInquiry(q),true);
  assert.equal(asksFullVsPartialPayment(q),true);
  const reply=paymentReply(q,context,room,"english");
  assert.match(reply,/No, you don't need to pay the full amount upfront/);
  assert.match(reply,/₱4,000\.00/);
  assert.match(reply,/PayPal/);
});
test("Natural payment paraphrases are recognized with a focused room",()=>{
  for(const q of [
    "Do I have to pay everything now?",
    "Do we need to pay the full amount before arriving?",
    "Can I pay half first?",
    "Can we pay only part of the amount?",
  ]){
    assert.equal(isResortQuestion(q,context,recent),true,q);
    assert.equal(isRoomPaymentInquiry(q),true,q);
  }
});
test("Current user question can preserve context for a later short follow-up",()=>{
  assert.equal(isResortQuestion("Can I pay half first?",{},[
    {role:"user",text:"Is the PayPal downpayment required for Family Room B?"}
  ]),true);
  assert.equal(isResortQuestion("Can I pay half first?",{},[]),true);
});
test("Unrelated payments never inherit accommodation scope",()=>{
  for(const q of [
    "Can I pay half first for my electricity bill?",
    "Can I pay half first for a car loan?",
    "Can I pay half first for my credit card?",
    "Can I pay half first for pizza?",
  ]) assert.equal(isResortQuestion(q,context,recent),false,q);
});
test("Historical facts, financial trivia, and programming are still excluded",()=>{
  for(const q of [
    "Who is Jose Rizal?",
    "What is the capital of Japan?",
    "Write a Python program",
    "Pay my rent for me",
  ]) assert.equal(isResortQuestion(q,context,recent),false,q);
});
