"use strict";
// No external network, Gemini, real bookings, payments, or MySQL writes.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { isRoomPaymentInquiry, resolvePaymentRoom, getPaymentStayKind,
  paymentReply, validRate } = require("../controllers/ai/aiFocusedPaymentReply");
const { wantsAccommodationCards } = require("../controllers/ai/aiConversationStyle");
const catalog = [
  {id:99,room_name:"Family Room A",category_name:"Room",status:"available",
    day_price:3500,overnight_price:3500},
  {id:100,room_name:"Family Room B",category_name:"Room",status:"available",
    day_price:8000,overnight_price:8000},
  {id:2,room_name:"Small Nipa Hut 2",category_name:"Cottage",status:"available",
    day_price:800,overnight_price:800},
];
const paymentQuestion =
  "Kung mag-a-book kami ng overnight sa Saturday, magkano po kaya ang babayaran namin at ano ang payment options?";

test("A spoken overnight amount + payment options query is not a room search", () => {
  assert.equal(isRoomPaymentInquiry(paymentQuestion),true);
  assert.equal(wantsAccommodationCards(paymentQuestion,"ask_recommendation"),false);
  assert.equal(wantsAccommodationCards("payment options", "ask_recommendation"),false);
  assert.equal(wantsAccommodationCards("Magkano ang downpayment?","ask_recommendation"),false);
  assert.equal(wantsAccommodationCards("Show me room options","ask_recommendation"),true);
});

// General rate-list questions must reach the fresh catalog/AI prompt,
 // instead of asking "which room?" before showing any current rate.
test("General accommodation rate inquiries do not become room payment follow-ups", () => {
  for (const message of [
    "What room rates do you offer?",
    "What are your cottage prices?",
    "Show all accommodation prices",
    "Ano po ang mga available na kwarto at cottage? Magkano po ang day tour?",
    "Magkano po ang kwarto at paano mag-reserve?",
  ]) {
    assert.equal(isRoomPaymentInquiry(message), false, message);
  }
  // The focused read-only price/payment flow is intentionally unchanged.
  for (const message of [
    "Magkano overnight sa Family Room A?",
    "What are the rates for Family Room B?",
    "What is the rate for the selected room?",
    "What payment methods can I use?",
  ]) {
    assert.equal(isRoomPaymentInquiry(message), true, message);
  }
});

test("Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears", () => {
  const context={room_id:100,room_name:"Family Room B"};
  const room=resolvePaymentRoom(catalog,paymentQuestion,context);
  assert.equal(room?.id,100);
  assert.equal(getPaymentStayKind(paymentQuestion,context),"overnight");
  const reply=paymentReply(paymentQuestion,context,room,"taglish");
  assert.match(reply,/Family Room B/);
  assert.match(reply,/₱8,000\.00/);
  assert.match(reply,/₱4,000\.00/);
  assert.match(reply,/PayPal/);
  assert.match(reply,/entrance fees/);
  assert.match(reply,/estimate/i);
  assert.doesNotMatch(reply,/Nipa Hut|confirmed available|already booked/i);
});

test("Fresh exact room name overrides a previously selected Family Room B", () => {
  const query="Magkano overnight sa Family Room A? At paano magbayad?";
  const room=resolvePaymentRoom(catalog,query,{room_id:100,room_name:"Family Room B"});
  assert.equal(room?.id,99);
  const reply=paymentReply(query,{},room,"taglish");
  assert.match(reply,/₱3,500\.00/);
  assert.match(reply,/₱1,750\.00/);
  assert.doesNotMatch(reply,/Family Room B/);
});

test("Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions", () => {
  const turns=[
    {role:"user",text:"nipa hut preview"},
    {role:"assistant",text:"Big Nipa Hut 10"},
    {role:"user",text:"may preview ka ng Family Room B?"},
    {role:"assistant",text:"Ito po ang preview ng Family Room B"},
  ];
  assert.equal(resolvePaymentRoom(catalog,paymentQuestion,{},turns)?.id,100);
});

test("Stale room ID or missing ID must never quote a different accommodation", () => {
  assert.equal(resolvePaymentRoom(catalog,paymentQuestion,
    {room_id:99,room_name:"Family Room B"}),null);
  assert.equal(resolvePaymentRoom(catalog,paymentQuestion,
    {room_id:999,room_name:"Missing Room"}),null);
  const reply=paymentReply(paymentQuestion,{},null,"taglish");
  assert.match(reply,/Anong room po/);
  assert.doesNotMatch(reply,/₱|Small Nipa/);
});

test("A pair of explicitly named rooms never silently quotes only one", () => {
  const msg="Magkano ang Family Room A at Family Room B?";
  assert.equal(resolvePaymentRoom(catalog,msg,{room_id:100,room_name:"Family Room B"}),null);
});

test("Unknown, zero and invalid rates do not turn into zero-amount quotations", () => {
  for(const value of [null,undefined,0,"",NaN,-1]) assert.equal(validRate(value),null);
  const room={id:100,room_name:"Family Room B",overnight_price:null};
  const reply=paymentReply(paymentQuestion,{},room,"taglish");
  assert.doesNotMatch(reply,/₱0|₱4,000/);
  assert.match(reply,/day tour or overnight/);
});

test("Extended/multiple nights are not priced as a single overnight stay", () => {
  assert.equal(getPaymentStayKind("Overnight 2 nights",{}),null);
  assert.equal(getPaymentStayKind("23 hours overnight",{}),null);
  // A numbered accommodation name is not a request for that many days.
  assert.equal(getPaymentStayKind("Small Nipa Hut 20 day tour downpayment",{}),"day");
  assert.equal(getPaymentStayKind("Small Nipa Hut 2 day tour price",{}),"day");
  assert.equal(getPaymentStayKind("20 days",{}),null);
  assert.equal(getPaymentStayKind("Day Tour",{}),"day");
  assert.equal(getPaymentStayKind("What will I pay?",{slot_preference:"night"}),"overnight");
});

test("Entrance-only or photo-only questions keep their existing specialized handling", () => {
  assert.equal(isRoomPaymentInquiry("Magkano ang entrance fee?"),false);
  assert.equal(isRoomPaymentInquiry("May photo ng Family Room B?"),false);
  assert.equal(isRoomPaymentInquiry("May preview ka?"),false);
  assert.equal(isRoomPaymentInquiry("What payment methods can I use?"),true);
});

test("Backend answers payment questions before broad recommendation and with no card payload", () => {
  const source=fs.readFileSync(path.resolve(__dirname,
    "../controllers/ai/geminiChatController.js"),"utf8");
  const pathPosition=source.indexOf("if (isRoomPaymentInquiry(message))");
  assert.ok(pathPosition>0);
  // AI-45: Preview shortcut now includes a booking-window safety guard.
  const previewPosition = source.indexOf(
    "if (isVerifiedPreviewRequest(message) && !previewMustUseBookingFlow)"
  );
  assert.ok(previewPosition > pathPosition);
  assert.match(source, /req\.body\.check_in \|\| req\.body\.check_out/);
  const tail=source.slice(pathPosition,source.indexOf("// Fixed resort-policy FAQ:",pathPosition));
  assert.match(tail,/getAccommodationCatalog/);
  assert.match(tail,/resolvePaymentRoom/);
  assert.match(tail,/paymentReply/);
  assert.match(tail,/recommendation_cards: \[\]/);
  assert.doesNotMatch(tail,/generateGemini\(/);
});

test("Unavailable accommodation cannot be quoted as a payable booking", () => {
  const room={id:100,room_name:"Family Room B",status:"maintenance",
    day_price:8000,overnight_price:8000};
  const reply=paymentReply(paymentQuestion,{},room,"taglish");
  assert.match(reply,/hindi currently available sa listing/);
  assert.doesNotMatch(reply,/₱8,000|₱4,000/);
});

test("Estimated payment breakdown includes onsite accommodation balance separately from entrance", () => {
  const room=resolvePaymentRoom(catalog,paymentQuestion,
    {room_id:100,room_name:"Family Room B"});
  const reply=paymentReply(paymentQuestion,{},room,"taglish");
  assert.match(reply,/₱4,000\.00 yung remaining room balance/);
  assert.match(reply,/entrance fees/);
});

test("Everyday Taglish payment wording keeps exact verified amounts without formal language", () => {
  const room=resolvePaymentRoom(catalog,paymentQuestion,
    {room_id:100,room_name:"Family Room B"});
  const reply=paymentReply(paymentQuestion,{},room,"taglish");
  assert.match(reply,/yung listed overnight rate/);
  assert.match(reply,/remaining room balance/);
  assert.match(reply,/₱8,000\.00/);
  assert.match(reply,/₱4,000\.00/);
  assert.doesNotMatch(reply,/maipapaliwanag|ninyo|inyong|pamagitan|natitirang halaga/);
  const english=paymentReply(paymentQuestion,{},room,"english");
  assert.match(english,/The current online checkout uses PayPal/);
});
