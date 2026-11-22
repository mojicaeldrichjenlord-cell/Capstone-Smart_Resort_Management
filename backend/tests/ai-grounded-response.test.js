"use strict";
// AI-47: regression checks for knowledge grounding and multilingual FAQ paths.
// Run from the repository root:
//   node --test backend/tests/ai-grounded-response.test.js
// These do NOT call Gemini, MySQL, PayPal or any external service.
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  unknownRecordReply, clarifyAmbiguousResortQuestion,
  matchUnverifiedServiceQuestion, guardUnsupportedPesoClaims,
} = require("../controllers/ai/aiGroundedResponseRules");
const { isResortQuestion, resortOnlyReply } = require("../controllers/ai/aiResortScopeGuard");
const { getResortInquiryReply } = require("../controllers/ai/resortInquiryKnowledge");
const { guestCountQuestion, guestCountFollowUp } = require("../controllers/ai/aiRecommendationIntake");
const { verifiedPreviewReply } = require("../controllers/ai/aiVerifiedPreview");
const { amenityReply } = require("../controllers/ai/aiAccommodationAmenities");
const { paymentReply } = require("../controllers/ai/aiFocusedPaymentReply");
const { countReply } = require("../controllers/ai/aiAccommodationCounts");

test("Only verified resort topics pass the scope gate", () => {
  assert.equal(isResortQuestion("Naa moy parking diha?"), true);
  assert.equal(isResortQuestion("Do you offer a shuttle service?"), true);
  assert.equal(isResortQuestion("Who is Jose Rizal?"), false);
  assert.equal(isResortQuestion("How do I write Python code?"), false);
  assert.match(resortOnlyReply("bisaya"), /resort/i);
});
test("Unapproved services explicitly return unknown, never guessed rates", () => {
  assert.equal(matchUnverifiedServiceQuestion("Do you have promo codes?"), "promotions");
  assert.equal(matchUnverifiedServiceQuestion("Is there a shuttle service?"), "transport");
  assert.equal(matchUnverifiedServiceQuestion("How much is the room?"), null);
  assert.equal(matchUnverifiedServiceQuestion("Free parking and shuttle service?"), null);
  assert.match(unknownRecordReply("taglish"), /hindi pa confirmed/i);
  assert.match(unknownRecordReply("bisaya"), /records/i);
  assert.match(unknownRecordReply("mandarin"), /记录/u);
});
test("Unverified peso amounts are blocked; DB amounts and 50% deposits are allowed", () => {
  const evidence = [{ day_price: 4000, overnight_price: 5500 }];
  assert.equal(
    guardUnsupportedPesoClaims("₱4,000 ang listed rate.", { records: evidence }),
    "₱4,000 ang listed rate."
  );
  assert.equal(
    guardUnsupportedPesoClaims("Downpayment ₱2,000.", { records: evidence }),
    "Downpayment ₱2,000."
  );
  assert.equal(
    guardUnsupportedPesoClaims("₱9,999 ang rate.", { language: "taglish", records: evidence }),
    unknownRecordReply("taglish")
  );
  assert.equal(
    guardUnsupportedPesoClaims("Rate is PHP 5000.", { records: [] }),
    unknownRecordReply("english")
  );
});
test("Bare price and recommendation questions ask exactly one clarification", () => {
  assert.match(clarifyAmbiguousResortQuestion("Magkano?", "taglish"), /aling room/i);
  assert.match(clarifyAmbiguousResortQuestion("What do you recommend?", "english"), /how many guests/i);
  assert.match(clarifyAmbiguousResortQuestion("Pila ang presyo?", "bisaya"), /unsang kwarto/i);
  assert.equal(clarifyAmbiguousResortQuestion("How much is Family Room A?", "english"), null);
});
test("Verified facts can be answered in Bisaya without Gemini", () => {
  assert.match(getResortInquiryReply({ topic: "parking", qualified: false }, "bisaya"), /libre/i);
  assert.match(getResortInquiryReply({ topic: "openingHours", qualified: false }, "bisaya"), /24 oras/i);
  assert.match(guestCountQuestion("bisaya"), /pila mo kabuok/i);
  assert.match(
    verifiedPreviewReply({ targetKnown: true, rows: [{ room_name: "Family Room A" }] }, "bisaya"),
    /Family Room A/
  );
});
test("Bisaya follow-up guest count retains recommendation state", () => {
  const history = [
    { role: "user", text: "What room do you recommend?" },
    { role: "assistant", text: guestCountQuestion("bisaya") },
  ];
  assert.deepEqual(guestCountFollowUp("4 mi", history, { intent: "ask_recommendation" }),
    { category: "room", guests: 4 });
});
test("Accommodation and payment info remain tied to supplied DB rows", () => {
  const room = {
    room_name: "Family Room A",
    category_name: "Rooms",
    amenities: "Aircon, Private CR",
    overnight_price: 4000,
    status: "available",
  };
  assert.match(amenityReply(room, "aircon", "naa moy aircon?", "bisaya"), /naay aircon/i);
  assert.match(paymentReply("overnight price?", {}, room, "bisaya"), /₱4,000/);
  assert.match(
    countReply({ total: 2, listed: 2, room: { total: 2, listed: 2 } }, { scopes: ["room"] }, "bisaya"),
    /nakalista/
  );
});
