"use strict";
// Regression tests: natural Taglish voice + chat tone without factual drift.
// No DB, Gemini, production bookings, payments, or external requests.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { verifiedPreviewReply } = require("../controllers/ai/aiVerifiedPreview");
const { paymentReply, getPaymentStayKind } = require("../controllers/ai/aiFocusedPaymentReply");
const { wantsAccommodationCards } = require("../controllers/ai/aiConversationStyle");
const { amenityReply } = require("../controllers/ai/aiAccommodationAmenities");
const { naturalRoomDetailsReply } = require("../controllers/ai/aiNaturalRoomDetails");
const { focusedRoomOverview } = require("../controllers/ai/aiAccommodationDetails");

const family = {
  room_name: "Family Room B", id: 100, status: "available",
  day_price: 8000, overnight_price: 8000
};

test("Taglish preview speaks like friendly Filipino resort staff", () => {
  const reply = verifiedPreviewReply({targetKnown:true,rows:[family]}, "taglish");
  assert.match(reply,/Ito po yung preview ng Family Room B/);
  assert.match(reply,/Click niyo lang yung View Details/);
  assert.doesNotMatch(reply,/Maaari|ninyong|sa pamamagitan|nakasaad/);
});

test("Exact preview result data stays untouched across Taglish, Tagalog and English", () => {
  const selection = {targetKnown:true,rows:[family]};
  for (const language of ["taglish","tagalog","english"]) {
    assert.match(verifiedPreviewReply(selection,language),/Family Room B/);
  }
  assert.match(verifiedPreviewReply(selection,"tagalog"),/Puwede ninyong/);
  assert.match(verifiedPreviewReply(selection,"english"),/Here's the preview/);
});

test("Taglish group alternatives are natural without false booking availability", () => {
  const selection={targetKnown:true,alternative:true,rows:[family]};
  const reply=verifiedPreviewReply(selection,"taglish");
  assert.match(reply,/group niyo/);
  assert.match(reply,/listed capacity/);
  assert.match(reply,/booking page/);
  assert.doesNotMatch(reply,/confirmed booking|may slot na|guaranteed/);
});

test("Taglish payment answers the focused room and keeps verified 50/50 amounts", () => {
  const q="Kung overnight kami sa Saturday, magkano po babayaran at ano ang payment options?";
  const reply=paymentReply(q,{},family,"taglish");
  assert.match(reply,/Family Room B/);
  assert.match(reply,/₱8,000\.00/);
  assert.match(reply,/₱4,000\.00/);
  assert.match(reply,/remaining room balance/);
  assert.match(reply,/PayPal/);
  assert.match(reply,/entrance fees/);
  assert.match(reply,/slot availability/);
  assert.doesNotMatch(reply,/ninyong|pamagitan|natitirang halaga|maipapaliwanag/);
  assert.doesNotMatch(reply,/Small Nipa Hut/);
  assert.equal(wantsAccommodationCards(q,"ask_recommendation"),false);
});

test("Friendly follow-up for unknown room or stay does not invent a quote", () => {
  const unknown=paymentReply("payment options",{},null,"taglish");
  assert.match(unknown,/Anong room po/);
  assert.doesNotMatch(unknown,/₱|confirmed booking/);
  const missing=paymentReply("magkano po",{},family,"taglish");
  assert.match(missing,/day tour or overnight/);
  assert.doesNotMatch(missing,/₱8,000|₱4,000/);
});

test("Pure English and pure Tagalog retain distinct wording", () => {
  const en=paymentReply("overnight payment options",{},family,"english");
  assert.match(en,/The current online checkout uses PayPal/);
  const tl=verifiedPreviewReply({targetKnown:false,rows:[]},"tagalog");
  assert.match(tl,/Anong accommodation po/);
});

test("AI style prompt and translation keep natural Taglish without rewriting facts", () => {
  const src=fs.readFileSync(path.resolve(__dirname,
    "../controllers/ai/geminiChatController.js"),"utf8");
  assert.match(src,/Reply in casual, everyday Filipino-English Taglish/);
  assert.match(src,/not a literal Filipino translation of English/);
  assert.match(src,/Never alter verified room details, pricing, payment policies/);
  assert.match(src,/Keep dates, times, room names, prices, and booking details accurate/);
  assert.match(src,/Avoid deep\/formal Tagalog/);
  assert.match(src,/Never reintroduce yourself each reply/);
});

test("Natural Taglish style does not alter payment or booking implementation", () => {
  const source=fs.readFileSync(path.resolve(__dirname,
    "../controllers/ai/aiFocusedPaymentReply.js"),"utf8");
  assert.doesNotMatch(source,/\b(?:INSERT|UPDATE|DELETE)\s+(?:INTO|accommodations)\b/);
  assert.doesNotMatch(source,/generateGemini\(|paypal\.capture|createReservation\(/);
  assert.equal(getPaymentStayKind("overnight",{}),"overnight");
});

test("Taglish amenity replies are concise and transparent about unknown features", () => {
  const verified={room_name:"Family Room B",category_name:"Room",amenities:"Private CR"};
  assert.equal(amenityReply(verified,"private_cr","May sarili ba itong CR?","taglish"),
    "Yes po, may sariling CR ang Family Room B.");
  const uncertain=amenityReply({room_name:"Family Room B",category_name:"Room",amenities:"CR"},
    "private_cr","May sarili bang CR?","taglish");
  assert.match(uncertain,/hindi clear sa listing/);
  assert.doesNotMatch(uncertain,/nakasaad|ninyong|pamagitan/);
});

test("Taglish room overview and details use everyday English terms without inventing amenities", () => {
  const room={room_name:"Family Room B",category_name:"Room",capacity:20,
    amenities:"Private CR | Kitchen",free_entrance_pax:8,overnight_price:8000};
  const details=naturalRoomDetailsReply(room,"taglish");
  assert.match(details,/included yung private CR at kitchen/i);
  assert.match(details,/8 pax na free entrance/);
  const overview=focusedRoomOverview(room,"taglish");
  assert.match(overview,/Check niyo na lang po yung date at slot/);
  assert.match(overview,/₱8,000/);
  assert.doesNotMatch(overview,/confirmed booking|available on Saturday/);
});

test("Missing room amenities remain unknown in a friendly Taglish response", () => {
  const room={room_name:"Family Room B",category_name:"Room",amenities:null};
  const answer=naturalRoomDetailsReply(room,"taglish");
  assert.match(answer,/Hindi pa po complete yung listed amenities/);
  assert.doesNotMatch(answer,/aircon|private CR|kitchen/);
});
