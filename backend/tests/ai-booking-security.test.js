// Isolated AI booking security and availability regression tests.
// No real Gemini request, Aiven/MySQL query, reservation write or PayPal call.
// Run: node --test tests/ai-booking-security.test.js
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { before, beforeEach, after, test } = require("node:test");

let queries = [];
let modelCalls = 0;
let successfulModelCalls = 0;
let injectedFailures = 0;
let injectedStatus = 503;
let modelPrompts = [];
let returnedRooms = [];
let catalogRows = [];
let roomLookup = null;
let extraction = {};

function substitute(moduleName, value) {
  const filepath = require.resolve(moduleName);
  const fake = new Module(filepath);
  fake.filename = filepath;
  fake.loaded = true;
  fake.exports = value;
  require.cache[filepath] = fake;
}

substitute("@google/genai", {
  GoogleGenAI: class FakeGoogleGenAI {
    constructor() {
      this.models = {
        async generateContent({ contents }) {
          modelPrompts.push(contents);
          modelCalls++;
          if (injectedFailures > 0) {
            injectedFailures--;
            throw Object.assign(new Error("Mock Gemini upstream capacity failure"), {
              status: injectedStatus,
            });
          }
          successfulModelCalls++;
          if (String(contents).includes("fluent, natural English")) {
            return { text: "Mock English translation" };
          }
          // Successes alternate independently from failed attempts.
          return {
            text: successfulModelCalls % 2 === 1
              ? JSON.stringify(extraction)
              : "Mock AI response; no external service called.",
          };
        },
      };
    }
  },
});
substitute("../config/db", {
  promise() {
    return {
      async query(query, params) {
        const sql = String(query).replace(/\s+/g, " ").trim();
        queries.push({ sql, params });
        if (!/^SELECT\b/i.test(sql) ||
            /\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b/i.test(sql)) {
          throw new Error("AI tests must only make read-only queries.");
        }
        if (/FROM accommodations a\b/i.test(sql) &&
            /NOT EXISTS\b/i.test(sql)) return [returnedRooms];
        if (/FROM accommodations a\b/i.test(sql) &&
            /LIMIT 150\b/i.test(sql)) return [catalogRows];
        if (/FROM accommodations a\b/i.test(sql) &&
            /LOWER\(a\.name\) LIKE \?/i.test(sql)) {
          return [roomLookup ? [roomLookup] : []];
        }
        if (/FROM reservation_items ri\b/i.test(sql)) return [[]];
        throw new Error("Unexpected SQL in AI integration test: " + sql);
      },
    };
  },
});

process.env.GEMINI_API_KEY = "mock-local-key-no-real-network";
const express = require("express");
const app = express();
app.use(express.json());
app.use("/api/ai", require("../routes/aiRoutes"));

let server, base;
before(async () => {
  server = await new Promise(resolve => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  base = "http://127.0.0.1:" + server.address().port;
});
after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
const exampleRoom = {
  id: 61, room_name: "Family Room A",
  description: "Room for 3 to 7 guests",
  image: "test.jpg", amenities: "Air conditioned",
  status: "available", capacity: 7,
  day_price: 3500, overnight_price: 4300, extended_price: 5000,
  category_name: "Room",
};
beforeEach(() => {
  queries = [];
  modelCalls = 0;
  successfulModelCalls = 0;
  injectedFailures = 0;
  injectedStatus = 503;
  modelPrompts = [];
  returnedRooms = [{ ...exampleRoom }];
  catalogRows = [{ ...exampleRoom }];
  roomLookup = { ...exampleRoom };
  extraction = {};
});

async function post(endpoint, payload) {
  const response = await fetch(base + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });
  return { status: response.status, body: await response.json() };
}
const futureContext = {
  message: "Find a day tour room for three guests",
  check_in: "2099-04-10",
  check_in_time: "07:00:00",
  check_out: "2099-04-10",
  check_out_time: "17:00:00",
  guests: 3,
  wants_booking: true,
};

test("Retired AI create-booking route refuses unauthenticated direct writes", async () => {
  const result = await post("/api/ai/create-booking", {
    user_id: 42, room_id: 61, guests: 3,
  });
  assert.equal(result.status, 410);
  assert.equal(result.body.success, false);
  assert.match(result.body.message, /secure Customer reservation page/i);
  assert.equal(queries.length, 0);
  assert.equal(modelCalls, 0);
});
test("Retired AI create-booking cannot write with a spoofed user_id", async () => {
  const result = await post("/api/ai/create-booking", {
    user_id: 99999, room_id: 61,
    check_in: "2099-04-10", payment_method: "paypal",
  });
  assert.equal(result.status, 410);
  assert.equal(queries.length, 0);
});
test("AI chat with missing message is rejected without DB access", async () => {
  const result = await post("/api/ai/chat", { message: "  " });
  assert.equal(result.status, 400);
  assert.equal(queries.length, 0);
  assert.equal(modelCalls, 0);
});
test("Incomplete booking details use fresh catalog but never claim date availability", async () => {
  const result = await post("/api/ai/chat", { message: "What rooms are available?" });
  assert.equal(result.status, 200);
  assert.equal(result.body.booking_preview, null);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /FROM accommodations a/);
  assert.match(queries[0].sql, /LIMIT 150/);
  assert.doesNotMatch(queries[0].sql, /reservation_items/);
  assert.equal(result.body.catalog_recommendations[0].availability_verified, false);
  assert.match(modelPrompts[1], /Fresh general accommodation catalog/);
  assert.match(modelPrompts[1], /NOT a verified booking slot/);
  assert.equal(modelCalls, 2);
});
test("Invalid same-day reversed times never query availability", async () => {
  const result = await post("/api/ai/chat", {
    ...futureContext, check_in_time: "17:00:00", check_out_time: "07:00:00",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.booking_preview, null);
  assert.equal(queries.length, 0);
});
test("Valid same-day day tour checks current reservation_items and offers a suggestion", async () => {
  const result = await post("/api/ai/chat", { ...futureContext });
  assert.equal(result.status, 200);
  assert.equal(result.body.matched_rooms.length, 1);
  assert.equal(result.body.booking_preview.room_id, 61);
  assert.equal(result.body.booking_preview.booking_schema, "accommodations_v2");
  assert.equal(result.body.booking_preview.day_price, 3500);
  assert.equal(result.body.booking_preview.overnight_price, 4300);
  assert.equal(result.body.booking_preview.estimated_total, undefined);
  assert.equal(queries.length, 1);
  const { sql, params } = queries[0];
  assert.match(sql, /FROM accommodations a\b/);
  assert.match(sql, /FROM reservation_items ri\b/);
  assert.match(sql, /JOIN reservations r\b/);
  assert.match(sql, /TIMESTAMP\(ri\.check_in_date, ri\.check_in_time\)/);
  assert.deepEqual(params, [3, "2099-04-10", "17:00:00", "2099-04-10", "07:00:00"]);
});
test("Occupied window cannot generate an AI booking suggestion", async () => {
  returnedRooms = [];
  roomLookup = null;
  const result = await post("/api/ai/chat", futureContext);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.matched_rooms, []);
  assert.equal(result.body.booking_preview, null);
  assert.equal(queries.length, 1);
});
test("Alternative schedule checks active reservation_items without writing", async () => {
  returnedRooms = [];
  const result = await post("/api/ai/chat", {
    ...futureContext, room_name: "Family Room A",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.booking_preview, null);
  assert.equal(result.body.alternative_dates.length, 4);
  assert.equal(result.body.alternative_dates[0].check_in, "2099-04-11");
  assert.equal(result.body.alternative_dates[0].check_out, "2099-04-11");
  assert.equal(queries.length, 6); // inventory + room lookup + 4 window checks
  assert.ok(queries.slice(2).every(q =>
    /FROM reservation_items ri\b/i.test(q.sql) &&
    /JOIN reservations r\b/i.test(q.sql)
  ));
});
test("Legacy SQL writer removed; frontend navigates through secure Customer form", () => {
  const controller = fs.readFileSync(path.join(
    __dirname, "../controllers/ai/geminiChatController.js"), "utf8");
  const frontend = fs.readFileSync(path.join(
    __dirname, "../../frontend/js/ai-chat.js"), "utf8");
  assert.doesNotMatch(controller, /\bINSERT INTO bookings\b/i);
  assert.doesNotMatch(controller, /\bFROM bookings\b/i);
  assert.doesNotMatch(controller, /exports\.createBookingFromChat/);
  assert.doesNotMatch(frontend, /\/ai\/create-booking/);
  assert.match(frontend, /\/customerHTML\/booking\.html\?room_id=/);
  assert.match(frontend, /Continue to Booking/);
  assert.match(frontend, /preview\?\.booking_schema !== "accommodations_v2"/);
});


test("Spanish text chat overrides an older English chat-language preference", async () => {
  const result = await post("/api/ai/chat", {
    message: "Hola, quiero una habitación disponible.",
    context: { language_style: "english" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.extracted_context.language_style, "spanish");
  assert.match(modelPrompts[1], /Reply entirely in natural Spanish/);
});
test("Mandarin text chat overrides an older Spanish chat-language preference", async () => {
  const result = await post("/api/ai/chat", {
    message: "你好，我想预订一个房间。",
    context: { language_style: "spanish" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.extracted_context.language_style, "mandarin");
  assert.match(modelPrompts[1], /Simplified Chinese characters/);
});
test("English voice session replies in English even if guest changes spoken language", async () => {
  const result = await post("/api/ai/chat", {
    message: "你好，我想预订一个房间。",
    voice_language: "english",
    context: { language_style: "mandarin" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.extracted_context.language_style, "english");
  assert.match(modelPrompts[1], /Reply in clear English/);
});
test("Mandarin voice session replies in Mandarin even if transcript is English", async () => {
  const result = await post("/api/ai/chat", {
    message: "Do you have a family room?",
    voice_language: "mandarin",
    context: { language_style: "english" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.extracted_context.language_style, "mandarin");
  assert.match(modelPrompts[1], /Reply entirely in Mandarin Chinese/);
});
test("Taglish and Spanish voice preferences use the selected fixed reply language", async () => {
  const taglish = await post("/api/ai/chat", {
    message: "Hello", voice_language: "taglish",
  });
  assert.equal(taglish.status, 200);
  assert.equal(taglish.body.extracted_context.language_style, "taglish");
  assert.match(modelPrompts[1], /Reply in natural Taglish/);
  modelCalls = 0;
  successfulModelCalls = 0;
  injectedFailures = 0;
  injectedStatus = 503;
  modelPrompts = [];
  const spanish = await post("/api/ai/chat", {
    message: "Hello", voice_language: "spanish",
  });
  assert.equal(spanish.status, 200);
  assert.equal(spanish.body.extracted_context.language_style, "spanish");
  assert.match(modelPrompts[1], /Reply entirely in natural Spanish/);
});


test("Live voice Gemini prompt is concise and conversational while retaining booking rules", async () => {
  const result = await post("/api/ai/chat", {
    message: "Help me find a family cottage.",
    voice_language: "english",
  });
  assert.equal(result.status, 200);
  assert.match(modelPrompts[1], /LIVE SPOKEN CONVERSATION/);
  assert.match(modelPrompts[1], /one or two short sentences/);
  assert.match(modelPrompts[1], /Ask at most ONE useful follow-up question/);
  assert.match(modelPrompts[1], /Never invent or promise a booking/);
});
test("Normal text chat is not forced into live spoken-conversation style", async () => {
  const result = await post("/api/ai/chat", {
    message: "How can I book?",
  });
  assert.equal(result.status, 200);
  assert.doesNotMatch(modelPrompts[1], /LIVE SPOKEN CONVERSATION/);
});


test("English translation route responds with the English text", async () => {
  const result = await post("/api/ai/translate-english", {
    text: "你好，欢迎来到 Arvic Seaside。",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(result.body.translated_text, "Mock English translation");
  assert.equal(modelCalls, 1);
  assert.match(modelPrompts[0], /fluent, natural English/);
  assert.equal(queries.length, 0);
});

test("Temporary Gemini 503 during extraction recovers after one retry", async () => {
  injectedFailures = 1;
  const result = await post("/api/ai/chat", {
    message: "How can you help me book?",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(modelCalls, 3);
  assert.equal(queries.length, 0);
});

test("Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors", async () => {
  injectedFailures = 2;
  const result = await post("/api/ai/chat", { message: "Hello" });
  assert.equal(result.status, 503);
  assert.equal(result.body.success, false);
  assert.equal(result.body.code, "GEMINI_BUSY");
  assert.equal(modelCalls, 2);
  assert.doesNotMatch(JSON.stringify(result.body), /Mock Gemini upstream capacity failure/);
  assert.equal(queries.length, 0);
});

test("Gemini free-tier 429 is not retried on translation", async () => {
  injectedStatus = 429;
  injectedFailures = 1;
  const result = await post("/api/ai/translate-english", { text: "你好" });
  assert.equal(result.status, 429);
  assert.equal(result.body.code, "GEMINI_RATE_LIMIT");
  assert.equal(modelCalls, 1);
  assert.equal(queries.length, 0);
});

test("AI reply actions offer English and Tagalog, not Taglish translation", () => {
  const ui = fs.readFileSync(path.join(
    __dirname, "../../frontend/js/ai-chat.js"), "utf8");
  assert.match(ui, /Translate to English/);
  assert.match(ui, /Translate to Tagalog/);
  assert.doesNotMatch(ui, /Translate to Taglish/);
  assert.doesNotMatch(ui, /\/ai\/translate-taglish/);
  assert.match(ui, /\/ai\/translate-english/);
});


test("Newly created Admin accommodation appears in the next catalog query", async () => {
  let result = await post("/api/ai/chat", { message: "What cottages do you have?" });
  assert.equal(result.status, 200);
  assert.equal(result.body.catalog_recommendations.length, 0);
  assert.equal(queries.length, 1);

  catalogRows = [{
    ...exampleRoom, id: 102, room_name: "New Family Cottage",
    category_name: "Cottage", capacity: 12,
    day_price: 2500, overnight_price: 3800,
  }];
  queries = [];
  result = await post("/api/ai/chat", {
    message: "Any cottages for 10 guests?",
    guests: 10,
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.booking_preview, null);
  assert.equal(result.body.catalog_recommendations[0].id, 102);
  assert.equal(result.body.catalog_recommendations[0].name, "New Family Cottage");
  assert.equal(result.body.catalog_recommendations[0].availability_verified, false);
  assert.match(modelPrompts.at(-1), /New Family Cottage/);
  assert.equal(queries.length, 1);
});

test("Admin price update is reflected immediately without stale AI cache", async () => {
  catalogRows = [{ ...exampleRoom, day_price: 1500, overnight_price: 2200 }];
  let response = await post("/api/ai/chat", { message: "How much is a room?" });
  assert.equal(response.status, 200);
  assert.equal(response.body.catalog_recommendations[0].day_price, 1500);
  catalogRows = [{ ...exampleRoom, day_price: 4000, overnight_price: 4700 }];
  response = await post("/api/ai/chat", { message: "How much is a room?" });
  assert.equal(response.status, 200);
  assert.equal(response.body.catalog_recommendations[0].day_price, 4000);
  assert.match(modelPrompts.at(-1), /Day Tour: PHP 4,000/);
  assert.equal(queries.length, 2);
});

test("Unavailable accommodation is described but not recommended", async () => {
  catalogRows = [{
    ...exampleRoom, id: 102, category_name: "Cottage",
    room_name: "Maintenance Cottage", status: "maintenance",
  }];
  const result = await post("/api/ai/chat", {
    message: "Do you have Maintenance Cottage?",
    room_name: "Maintenance Cottage",
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.match(modelPrompts[1], /Maintenance Cottage/);
  assert.match(modelPrompts[1], /Admin status: maintenance/);
  assert.equal(result.body.booking_preview, null);
});

test("Budget and capacity filter read current rates and exclude mismatches", async () => {
  catalogRows = [
    { ...exampleRoom, id: 110, room_name: "Large Cottage", category_name: "Cottage", capacity: 12, day_price: 3000, overnight_price: 4500 },
    { ...exampleRoom, id: 111, room_name: "Small Cottage", category_name: "Cottage", capacity: 4, day_price: 1200, overnight_price: 2200 },
    { ...exampleRoom, id: 112, room_name: "Expensive Cottage", category_name: "Cottage", capacity: 15, day_price: 5900, overnight_price: 6900 },
  ];
  const result = await post("/api/ai/chat", {
    message: "Need a day tour cottage for 10 guests under 3500",
    guests: 10, max_price: 3500,
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.catalog_recommendations.map(v => v.id), [110]);
  assert.match(modelPrompts[1], /Large Cottage/);
  assert.doesNotMatch(modelPrompts[1], /Small Cottage/);
});

test("Unrelated conversation is not forced to read the accommodation catalog", async () => {
  const response = await post("/api/ai/chat", { message: "Hello" });
  assert.equal(response.status, 200);
  assert.equal(queries.length, 0);
  assert.deepEqual(response.body.catalog_recommendations, []);
});

test("Verified date availability uses reservation schedules, not catalog guesses", async () => {
  catalogRows = [{ ...exampleRoom, id: 999, room_name: "No Slot Checked" }];
  const result = await post("/api/ai/chat", futureContext);
  assert.equal(result.status, 200);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /reservation_items/);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.equal(result.body.booking_preview.room_id, 61);
});


test("HTTP 429 on accommodation inquiry returns actual live catalog without Gemini", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const result = await post("/api/ai/chat", {
    message: "What accommodations do you offer? Names, capacities and day tour rates please.",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(result.body.mode, "database_fallback");
  assert.match(result.body.reply, /Family Room A/);
  assert.match(result.body.reply, /3,500/);
  assert.match(result.body.reply, /Please provide check-in\/out dates/i);
  assert.equal(result.body.catalog_recommendations[0].availability_verified, false);
  assert.equal(result.body.booking_preview, null);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /FROM accommodations a/);
  assert.doesNotMatch(queries[0].sql, /reservation_items/);
  assert.equal(modelCalls, 1); // Never retry free-tier rate limits.
});

test("Database backup rereads newly updated Admin prices during HTTP 429", async () => {
  injectedStatus = 429;
  injectedFailures = 1;
  catalogRows = [{ ...exampleRoom, day_price: 1200 }];
  const first = await post("/api/ai/chat", { message: "What room rates do you offer?" });
  assert.equal(first.status, 200);
  assert.match(first.body.reply, /1,200/);
  catalogRows = [{ ...exampleRoom, day_price: 2700 }];
  injectedFailures = 1;
  const second = await post("/api/ai/chat", { message: "What room rates do you offer?" });
  assert.equal(second.status, 200);
  assert.match(second.body.reply, /2,700/);
  assert.doesNotMatch(second.body.reply, /1,200/);
  assert.equal(queries.length, 2);
});

test("Maintenance rooms are excluded from 429 offline recommendations", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  catalogRows = [{ ...exampleRoom, status: "maintenance" }];
  const result = await post("/api/ai/chat", { message: "Do you have Family Room A?" });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.match(result.body.reply, /No matching listed accommodation/i);
  assert.equal(result.body.booking_preview, null);
});

test("Voice session maintains the selected Taglish language during 429 backup", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const result = await post("/api/ai/chat", {
    message: "Do you have a room?",
    voice_language: "taglish",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "database_fallback");
  assert.match(result.body.reply, /Temporarily limited ang AI/i);
  assert.equal(result.body.extracted_context.language_style, "taglish");
  assert.equal(result.body.booking_preview, null);
});

test("HTTP 429 with valid stay details checks reservation_items and creates no booking", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const result = await post("/api/ai/chat", futureContext);
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "database_fallback");
  assert.equal(result.body.matched_rooms.length, 1);
  assert.equal(result.body.booking_preview, null);
  assert.match(result.body.reply, /preliminary matches/i);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /reservation_items/);
  assert.equal(modelCalls, 1);
});

test("Non-resort questions still show accurate Gemini 429 with no database lookup", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const result = await post("/api/ai/chat", { message: "Hello" });
  assert.equal(result.status, 429);
  assert.equal(result.body.code, "GEMINI_RATE_LIMIT");
  assert.equal(queries.length, 0);
});

test("Persistent Gemini 503 can still answer read-only accommodation questions", async () => {
  injectedFailures = 2;
  injectedStatus = 503;
  const result = await post("/api/ai/chat", {
    message: "What room rates are available at the resort?",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "database_fallback");
  assert.match(result.body.reply, /Family Room A/);
  assert.equal(queries.length, 1);
  assert.equal(modelCalls, 2); // One bounded retry, then database fallback.
});


test("Quota fallback parses explicit guest count and peso budget without Gemini", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  catalogRows = [
    { ...exampleRoom, id: 104, room_name: "Suitable Cottage", category_name: "Cottage", capacity: 12, day_price: 3000 },
    { ...exampleRoom, id: 105, room_name: "Small Cottage", category_name: "Cottage", capacity: 4, day_price: 1200 },
    { ...exampleRoom, id: 106, room_name: "Expensive Cottage", category_name: "Cottage", capacity: 14, day_price: 7000, overnight_price: 7500 },
  ];
  const result = await post("/api/ai/chat", {
    message: "Recommend a day tour cottage for 10 guests under ₱3,500.",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "database_fallback");
  assert.deepEqual(result.body.catalog_recommendations.map(r => r.id), [104]);
  assert.equal(result.body.extracted_context.guests, 10);
  assert.equal(result.body.extracted_context.max_price, 3500);
  assert.match(result.body.reply, /Suitable Cottage/);
  assert.doesNotMatch(result.body.reply, /Small Cottage|Expensive Cottage/);
  assert.equal(queries.length, 1);
  assert.equal(result.body.booking_preview, null);
});

test("Quota fallback never guesses check-in dates from free-text", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const result = await post("/api/ai/chat", {
    message: "Is a room free on Saturday for 5 guests?",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "database_fallback");
  assert.equal(result.body.extracted_context.guests, 5);
  assert.equal(result.body.extracted_context.check_in, null);
  assert.equal(result.body.extracted_context.check_out, null);
  assert.equal(result.body.catalog_recommendations[0].availability_verified, false);
  assert.match(result.body.reply, /Please provide check-in\/out dates/i);
  assert.equal(queries.length, 1);
  assert.doesNotMatch(queries[0].sql, /reservation_items/);
});
