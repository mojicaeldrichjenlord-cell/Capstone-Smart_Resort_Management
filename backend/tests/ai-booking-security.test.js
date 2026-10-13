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
let modelPrompts = [];
let returnedRooms = [];
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
          // Calls alternate between structured intent extraction and response.
          return {
            text: modelCalls % 2 === 1
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
  modelPrompts = [];
  returnedRooms = [{ ...exampleRoom }];
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
test("Incomplete booking details make no availability claim or query", async () => {
  const result = await post("/api/ai/chat", { message: "What rooms are available?" });
  assert.equal(result.status, 200);
  assert.equal(result.body.booking_preview, null);
  assert.equal(queries.length, 0);
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
