"use strict";
// AI-54: DB-backed online downpayment estimates and safe PayPal handoff.
// Run from repo root: node --test backend/tests/ai-same-rate-payment.test.js
// Synthetic rates only; no Gemini calls, payments or MySQL network traffic.
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isRoomPaymentInquiry, resolvePaymentRoom, paymentReply, getPaymentStayKind,
} = require("../controllers/ai/aiFocusedPaymentReply");

const catalog=[
  {id:1,room_name:"Family Room A",status:"available",day_price:3500,overnight_price:4500},
  {id:2,room_name:"Family Room B",status:"available",day_price:8000,overnight_price:8000},
];

test("Exact user's payment question: same Day and Night rate doesn't need clarification",()=>{
  const question="Kung i-book namin yang Family Room B, magkano ang downpayment at saan kami magbabayad?";
  assert.equal(isRoomPaymentInquiry(question),true);
  const room=resolvePaymentRoom(catalog,question,{room_id:2,room_name:"Family Room B"},[]);
  assert.equal(room.id,2);
  const reply=paymentReply(question,{},room,"taglish");
  assert.match(reply,/parehong ₱8,000\.00 ang listed Day Tour at Night rate/);
  assert.match(reply,/50% downpayment: ₱4,000\.00/);
  assert.match(reply,/remaining accommodation balance: ₱4,000\.00/);
  assert.match(reply,/online booking\/payment page.*PayPal/);
  assert.match(reply,/Automatic ang confirmation.*successful ang payment capture/);
  assert.match(reply,/walang screenshot upload na kailangan/);
  assert.match(reply,/entrance fees.*resort babayaran/);
  assert.doesNotMatch(reply,/Day Tour or Night ba ang plan/i);
});
test("An unspecified slot with different rates asks ONE necessary clarification",()=>{
  const text=paymentReply("Magkano downpayment sa Family Room A?",{},catalog[0],"taglish");
  assert.match(text,/Day Tour or Night ba ang plan niyo/);
  assert.doesNotMatch(text,/₱1,750|₱2,250/);
  assert.match(text,/PayPal/);
});
test("Explicit standard Night slot uses only its actual listed rate",()=>{
  const reply=paymentReply("Night slot sa Family Room A, magkano downpayment?",{},catalog[0],"taglish");
  assert.match(reply,/₱4,500\.00/);
  assert.match(reply,/₱2,250\.00/);
  assert.doesNotMatch(reply,/₱1,750\.00/);
});
test("Explicit extended or multi-day stay never uses a standard single-slot estimate",()=>{
  for(const q of ["2 nights sa Family Room B magkano downpayment?","Extended stay sa Family Room B magkano?"]){
    const reply=paymentReply(q,{},catalog[1],"taglish");
    assert.doesNotMatch(reply,/₱4,000\.00|₱8,000\.00/);
    assert.match(reply,/exact duration at total/);
  }
});
test("Missing/malformed rate or inactive room cannot receive guessed price",()=>{
  for(const room of [
    {...catalog[1],overnight_price:0},
    {...catalog[1],day_price:null},
    {...catalog[1],status:"maintenance"},
  ]){
    const reply=paymentReply("Magkano downpayment sa Family Room B?",{},room,"taglish");
    assert.doesNotMatch(reply,/₱4,000\.00/);
  }
});
test("Recognizes follow-up asking only where to pay",()=>{
  assert.equal(isRoomPaymentInquiry("Saan kami magbabayad?"),true);
  const reply=paymentReply("Saan kami magbabayad?",{},catalog[1],"taglish");
  assert.match(reply,/PayPal/);
});
test("English, Bisaya, Spanish, Mandarin responses retain same verified amount",()=>{
  const q="Family Room B payment and downpayment";
  for(const language of ["english","bisaya","spanish","mandarin"]){
    const reply=paymentReply(q,{},catalog[1],language);
    assert.match(reply,/₱8,000\.00/);
    assert.match(reply,/₱4,000\.00/);
    assert.match(reply,/PayPal/);
    assert.doesNotMatch(reply,/₱5,000\.00/);
  }
});
test("Saved Night slot is respected if guest doesn't change it",()=>{
  assert.equal(getPaymentStayKind("Magkano downpayment sa room?",{slot_preference:"night"}),"overnight");
  const reply=paymentReply("Magkano downpayment sa Family Room A?",{slot_preference:"night"},catalog[0],"taglish");
  assert.match(reply,/₱2,250\.00/);
});
