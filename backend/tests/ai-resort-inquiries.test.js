"use strict";
// UI-25: Verified resort-wide Q&A is based on owner-confirmed / published facts.
// No MySQL, Gemini, payment, reservation or network requests in this suite.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  RESORT_INQUIRY_FACTS, matchResortInquiry, guessInquiryLanguage,
  getResortInquiryReply, resortInquiryPromptLines,
} = require("../controllers/ai/resortInquiryKnowledge");
const source = fs.readFileSync(path.resolve(__dirname,
  "../controllers/ai/geminiChatController.js"), "utf8");
const landing = fs.readFileSync(path.resolve(__dirname,
  "../../frontend/customerHTML/landing.html"), "utf8");
const home = fs.readFileSync(path.resolve(__dirname,
  "../../frontend/customerHTML/index.html"), "utf8");

test("Owner-confirmed free parking covers natural Taglish and English paraphrases", () => {
  for (const question of [
    "May parking ba kayo?",
    "Libre po ba parking?",
    "Magkano parking fee ng sasakyan?",
    "May parking kayo para sa motor at van?",
    "Pwede mag-park ng bus?",
    "Is parking free for motorcycles?",
    "Can I park a bus at the resort?",
    "Do you have a car park?",
  ]) {
    const match = matchResortInquiry(question);
    assert.equal(match?.topic, "parking", question);
    assert.equal(match.qualified, false, question);
    const language = guessInquiryLanguage(question) || "english";
    const reply = getResortInquiryReply(match, language);
    assert.match(reply, /free|libre|libreng|gratis/i, question);
    assert.doesNotMatch(reply, /free (?:entrance|room)|unlimited|guaranteed slot/i);
  }
});

test("Parking answer in Taglish is short, natural, and limited to confirmed policy", () => {
  const match = matchResortInquiry("May parking po for van?");
  const reply = getResortInquiryReply(match, "taglish");
  assert.match(reply, /Yes po!/);
  assert.match(reply, /motor, kotse, van, o bus/);
  assert.match(reply, /Walang parking fee/);
  assert.doesNotMatch(reply, /covered|guarded|CCTV|unlimited|parking reservation/i);
  assert.match(RESORT_INQUIRY_FACTS.parking, /FREE on-site parking for ANY type of vehicle/);
});

test("Unverified parking capacity, reservations and security never become confirmed", () => {
  for (const question of [
    "May CCTV sa parking?",
    "Is the parking guarded?",
    "Ilang parking slots meron?",
    "Can I reserve a parking space?",
    "Saan exactly ang parking entrance?",
  ]) {
    const match = matchResortInquiry(question);
    assert.equal(match?.topic, "parking", question);
    assert.equal(match.qualified, true, question);
    assert.match(getResortInquiryReply(match, "taglish"), /hindi pa confirmed/);
  }
});

test("Parking + entrance admission questions answer both fees separately", () => {
  for (const question of [
    "May parking ba at libre rin ba entrance?",
    "Free parking and entrance fee?",
    "May parking fee at entrance fee ba?",
  ]) {
    const topic = matchResortInquiry(question);
    assert.equal(topic?.topic, "parkingEntrance", question);
    const reply = getResortInquiryReply(topic, "taglish");
    assert.match(reply, /Free po ang parking/);
    assert.match(reply, /Separate naman po ang entrance fee/);
    assert.doesNotMatch(reply, /libreng entrance|free entrance/i);
  }
});

test("Mixed or room-specific inquiries do not produce an incomplete generic answer", () => {
  for (const question of [
    "May parking at allowed ba dogs?",
    "May sariling private parking ang Family Room B?",
    "May parking ba sa Single Room Cottage 1?",
    "Can I park and use the WiFi?",
    "May pool shade preview kayo?",
    "May swimming pool sa Family Room B?",
    "What is the exact check-in time?",
    "Is Family Room B available tomorrow?",
  ]) {
    assert.equal(matchResortInquiry(question), null, question);
  }
});

test("Address, 24-hour opening, published contacts and pool fact are grounded", () => {
  for (const [question, topic, expected] of [
    ["Where is the resort located?", "location", /Mahogany Street/],
    ["Ano po address niyo?", "location", /Bagong Karsada/],
    ["Are you open 24 hours?", "openingHours", /24 hours/],
    ["Bukas ba kayo everyday?", "openingHours", /Monday to Sunday/],
    ["What's your contact number?", "contact", /0956-912-5625/],
    ["Do you have a swimming pool?", "pool", /swimming pool/],
  ]) {
    const match = matchResortInquiry(question);
    assert.equal(match?.topic, topic, question);
    const answer = getResortInquiryReply(match, guessInquiryLanguage(question) || "english");
    assert.match(answer, expected, question);
  }
  assert.match(home, /17 Mahogany Street, Brgy\. Bagong Karsada, Naic, Cavite/);
  assert.match(landing, /open 24 hours/i);
  assert.match(home, /tel:09569125625/);
  assert.match(home, /tel:09678170662/);
  assert.match(landing, /Swimming Pool/);
});

test("Pool admission and usage policy remain unconfirmed, not free by inference", () => {
  for (const question of ["Libre ba ang swimming pool?", "Swimming pool fee?", "How deep is the swimming pool?"]) {
    const match = matchResortInquiry(question);
    assert.equal(match?.topic, "pool", question);
    assert.equal(match.qualified, true, question);
    assert.match(getResortInquiryReply(match, "taglish"), /hindi pa confirmed/);
  }
});

test("Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary", () => {
  const prompt = resortInquiryPromptLines();
  assert.match(prompt, /FREE on-site parking for ANY type of vehicle/);
  assert.match(prompt, /Wi-Fi/);
  assert.match(prompt, /outside food\/corkage/);
  assert.match(prompt, /never invent a yes\/no/);
  assert.match(source, /const resortInquiry = matchResortInquiry\(message\)/);
  assert.match(source, /mode: "verified_resort_inquiry"/);
  assert.match(source, /\$\{resortInquiryPromptLines\(\)\}/);
  assert.ok(source.indexOf("const resortInquiry = matchResortInquiry(message)") <
    source.indexOf("const policyKind = matchGeneralPolicyQuestion(message)"));
  assert.doesNotMatch(prompt, /guest has a confirmed booking/);
});

test("Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ", () => {
  for (const question of ["", "Thanks", "Magkano po ang Family Room B?", "refund", "Find a cottage for 7 pax"]) {
    assert.equal(matchResortInquiry(question), null, question);
  }
});
