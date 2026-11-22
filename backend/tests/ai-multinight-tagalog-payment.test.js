"use strict";
// AI-59: Explicit multi-night stays never reuse a one-slot 50% estimate.
// Run: node --test backend/tests/ai-multinight-tagalog-payment.test.js
// Synthetic fixtures: no live DB, Gemini credits, payments or network.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {
  isExtendedOrMultiDayStay, getPaymentStayKind,
  isRoomPaymentInquiry, paymentReply,
}=require("../controllers/ai/aiFocusedPaymentReply");

const room={id:2,room_name:"Family Room B",status:"available",day_price:8000,overnight_price:8000};
const failed="Kung dalawang gabi po kaming mananatili sa Family Room B, apat na libo pa rin po ba ang paunang bayad namin?";

test("Exact failed Tagalog question: no one-night ₱4,000 deposit quote",()=>{
  assert.equal(isRoomPaymentInquiry(failed),true);
  assert.equal(isExtendedOrMultiDayStay(failed),true);
  assert.equal(getPaymentStayKind(failed,{}),null);
  const reply=paymentReply(failed,{},room,"tagalog");
  assert.match(reply,/50% ng kabuuang pinal na presyo/);
  assert.match(reply,/buong pananatili/);
  assert.match(reply,/booking page/);
  assert.match(reply,/PayPal/);
  assert.doesNotMatch(reply,/₱4,000\.00|₱8,000\.00/);
  assert.doesNotMatch(reply,/for one standard slot/i);
});
test("Multi-day indicators in everyday Tagalog, Taglish, English, Bisaya, Spanish and Mandarin",()=>{
  for(const phrase of [
    "dalawang gabi","tatlong gabi","dalawang araw","2 nights","3 days",
    "two nights","three nights","2 gabi","2 araw","several nights",
    "multiple days","extended stay","duha ka gabii","dos noches","三晚","两天"
  ]) assert.equal(isExtendedOrMultiDayStay(phrase),true,phrase);
});
test("One standard slot, one night, capacity and day-tour labels are not multi-day",()=>{
  for(const phrase of [
    "isang gabi","one night","1 gabi","night slot","overnight","day tour",
    "Small Nipa Hut 20 day tour","20 pax","two bedrooms","20 guests"
  ]) assert.equal(isExtendedOrMultiDayStay(phrase),false,phrase);
});
test("A saved night preference cannot force a one-night quote for 2 nights",()=>{
  const reply=paymentReply(failed,{slot_preference:"night"},room,"tagalog");
  assert.doesNotMatch(reply,/₱4,000\.00|₱8,000\.00/);
  assert.match(reply,/50% ng kabuuang pinal na presyo/);
});
test("English two-night reply is grounded and does not invent 2-night total",()=>{
  const q="What if we book Family Room B for 2 nights? Would the ₱4,000 downpayment still apply?";
  const reply=paymentReply(q,{},room,"english");
  assert.match(reply,/50% of the final accommodation total/);
  assert.match(reply,/whole stay/);
  assert.doesNotMatch(reply,/₱4,000\.00|₱8,000\.00|₱16,000\.00/);
});
test("Nonstandard duration never assumes the room is bookable",()=>{
  const reply=paymentReply(failed,{}, {...room,status:"maintenance"},"tagalog");
  assert.doesNotMatch(reply,/₱4,000\.00|₱8,000\.00/);
  assert.match(reply,/hindi po kasalukuyang available/i);
});
test("The one-night 50% estimate still works for a verified standard slot",()=>{
  const q="For Family Room B night, how much is the downpayment?";
  const reply=paymentReply(q,{},room,"english");
  assert.match(reply,/₱8,000\.00/);
  assert.match(reply,/₱4,000\.00/);
});
test("Pure Tagalog is not misclassified merely by the English room name",()=>{
  const source=fs.readFileSync(path.join(__dirname,
    "../controllers/ai/geminiChatController.js"),"utf8");
  const start=source.indexOf("function detectLanguageFromMessage(message) {");
  const end=source.indexOf("// Combine details from the current question",start);
  assert.ok(start>=0 && end>start);
  const detect=new Function("normalizeText",
    source.slice(start,end)+"return detectLanguageFromMessage;")(
      s=>String(s||"").trim().toLowerCase());
  assert.equal(detect(failed),"tagalog");
  assert.equal(detect("What if we stay at Family Room B for 2 nights?"),"english");
  assert.equal(detect("2 nights kami sa Family Room B, magkano downpayment?"),"taglish");
});
