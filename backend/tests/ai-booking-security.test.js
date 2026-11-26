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
          // Identify prompt type rather than relying on alternating calls.
          // A simple catalog question now skips structured extraction.
          return {
            text: String(contents).includes("You are interpreting natural language for Arvic Seaside Resort guest services")
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
        // Exact cheapest-price path: mock the SAME category/status/slot and
        // SQL ordering requirements, not the normal 150-row catalog.
        if (/FROM accommodations a\b/i.test(sql) &&
            /ORDER BY (?:LEAST\(|CASE WHEN a\.(?:day_price|overnight_price) > 0)/i.test(sql) &&
            /LIMIT 6\b/i.test(sql)) {
          const categories = sql.includes("IN (")
            ? params.filter(x => ["room", "cottage", "function area"].includes(x))
            : [];
          const lastParam = params.at(-1);
          const hasGuests = /a\.max_capacity >= \?/i.test(sql);
          const requiredGuests = hasGuests ? Number(lastParam) : 0;
          const dayOnly = /AND a\.day_price > 0 ORDER BY/i.test(sql);
          const nightOnly = /AND a\.overnight_price > 0 ORDER BY/i.test(sql);
          const rate = row => {
            const day = Number(row.day_price) > 0 ? Number(row.day_price) : Infinity;
            const night = Number(row.overnight_price) > 0
              ? Number(row.overnight_price) : Infinity;
            return dayOnly ? day : nightOnly ? night : Math.min(day, night);
          };
          return [catalogRows.filter(room =>
            String(room.status).toLowerCase() === "available" &&
            (!categories.length ||
              categories.includes(String(room.category_name).toLowerCase())) &&
            (!hasGuests || Number(room.capacity) >= requiredGuests) &&
            Number.isFinite(rate(room)))
            .sort((a,b) => rate(a) - rate(b) || Number(a.id) - Number(b.id))
            .slice(0, 6)];
        }
        // Simulate the fresh read-only grouped COUNT(*) endpoint. This mock
        // uses ALL current catalogRows, not the unrelated 150-card preview cap.
        if (/COUNT\(\*\) AS accommodation_count/i.test(sql) &&
            /GROUP BY c\.name/i.test(sql)) {
          const subtype = params?.[0]
            ? String(params[0]).toLowerCase().replace(/%/g, "") : "";
          const tally = new Map();
          for (const room of catalogRows) {
            if (subtype && !String(room.room_name).toLowerCase().includes(subtype)) continue;
            const category_name = room.category_name || null;
            const listing_status = String(room.status || "").trim().toLowerCase();
            const key = String(category_name) + "|" + listing_status;
            const prior = tally.get(key);
            if (prior) prior.accommodation_count++;
            else tally.set(key, { category_name, listing_status, accommodation_count: 1 });
          }
          return [[...tally.values()]];
        }
        if (/FROM accommodations a\b/i.test(sql) &&
            /LIMIT 150\b/i.test(sql)) return [catalogRows];
        if (/FROM accommodations a\b/i.test(sql) &&
            /LOWER\(a\.name\) LIKE \?/i.test(sql)) {
          return [roomLookup ? [roomLookup] : []];
        }
        if (/FROM accommodations a\b/i.test(sql) &&
            /LEFT JOIN accommodation_categories c\b/i.test(sql) &&
            /a\.description, a\.amenities/i.test(sql) && /ORDER BY a\.id ASC/i.test(sql))
          return [catalogRows];
        // Focused amenity/overview lookups must use a single fresh row by
        // immutable ID, never grab a similar or older accommodation.
        if (/FROM accommodations a\b/i.test(sql) &&
            /LEFT JOIN accommodation_categories c\b/i.test(sql) &&
            /WHERE a\.id = \? LIMIT 1\b/i.test(sql) &&
            /a\.description, a\.amenities/i.test(sql)) {
          const record = catalogRows.find(room =>
            Number(room.id) === Number(params?.[0]));
          return [record ? [record] : []];
        }
        if (/FROM reservation_items ri\b/i.test(sql)) return [[]];
        throw new Error("Unexpected SQL in AI integration test: " + sql);
      },
    };
  },
});

// Keep the broad mocked regression suite independent of a real demo budget.
// Dedicated Stage 85-A tests cover the actual limiter and cutoff separately.
process.env.AI_GEMINI_SESSION_CAP_USD = "100"; // Large mock-only allowance; no network requests.
process.env.AI_RATE_PER_MINUTE = "10000";
process.env.AI_RATE_PER_DAY = "10000";
process.env.AI_RATE_GLOBAL_PER_MINUTE = "10000";
process.env.AI_RATE_GLOBAL_PER_DAY = "10000";
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

test("AI-36 history trivia is politely refused with zero Gemini credits or SQL reads", async () => {
  const result = await post("/api/ai/chat", {
    message: "ano full name ni bonifacio",
    voice_language: "taglish",
    context: { room_id: 61, room_name: "Family Room A", guests: 20 },
    recent_turns: [
      { role: "user", text: "Anong magandang room para sa 20 guests?" },
      { role: "assistant", text: "Ito po yung matching preview." },
    ],
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(result.body.mode, "resort_scope_only");
  assert.equal(result.body.resort_scope_allowed, false);
  assert.match(result.body.reply, /Resort inquiries lang po/i);
  assert.doesNotMatch(result.body.reply, /Andres|Bonifacio|historical/i);
  assert.deepEqual(result.body.recommendation_cards, []);
  assert.equal(result.body.booking_preview, null);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

test("AI-36 second non-resort turn is still blocked even after prior refusal", async () => {
  const result = await post("/api/ai/chat", {
    message: "si jose rizal",
    input_source: "voice",
    context: { room_id: 61, language_style: "taglish" },
    recent_turns: [
      { role: "user", text: "ano full name ni bonifacio" },
      { role: "assistant", text: "Resort inquiries lang po ang masasagot ko." },
    ],
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "resort_scope_only");
  assert.match(result.body.reply, /Resort inquiries lang po/i);
  assert.doesNotMatch(result.body.reply, /Jose|Protacio|Mercado|Rizal/i);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

test("AI-36 mixed history and parking request cannot get a generic AI answer", async () => {
  const result = await post("/api/ai/chat", {
    message: "Ano full name ni Bonifacio? May parking ba sa resort?",
    voice_language: "taglish",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "resort_scope_only");
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

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
// AI-LIVE-04: A "how many" question must never be misrouted to photo previews.
// Count ALL current DB records (including maintenance) and distinguish them
// from admin-listed status and still-unverified date/time slots.
// AI-LIVE-05: The screenshot's cottage count -> cheapest follow-up must use
// a fresh per-category DB sort. A cheap ROOM must never leak into cottages,
// and overnight must not be quoted from the Day Tour field.
test("AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices", async () => {
  catalogRows = Array.from({ length: 45 }, (_, i) => ({
    ...exampleRoom, id: 100 + i, room_name: "Cottage " + (i + 1),
    category_name: "Cottage", capacity: 10,
    day_price: 2500 + i, overnight_price: 3500 + i,
  }));
  catalogRows.push(
    { ...exampleRoom, id: 45, room_name: "Small Nipa Hut 2",
      category_name: "Cottage", day_price: 800, overnight_price: 950 },
    { ...exampleRoom, id: 46, room_name: "Cheap Unrelated Room",
      category_name: "Room", day_price: 300, overnight_price: 400 },
    { ...exampleRoom, id: 47, room_name: "Maintenance Cottage",
      category_name: "Cottage", status: "maintenance",
      day_price: 100, overnight_price: 150 },
  );
  // One cottage counted separately was substituted with the cheap Nipa Hut.
  catalogRows.splice(0, 2);
  const first = await post("/api/ai/chat", {
    message: "Ilang cottages meron kayo?",
  });
  assert.equal(first.body.mode, "verified_accommodation_count");
  assert.match(first.body.reply, /45 cottages/i);
  queries = [];

  const follow = await post("/api/ai/chat", {
    message: "Ano naman ang pinakamura sa mga yun?",
    context: first.body.extracted_context,
    recent_turns: [
      { role: "user", text: "Ilang cottages meron kayo?" },
      { role: "assistant", text: first.body.reply },
    ],
  });
  assert.equal(follow.status, 200);
  assert.equal(follow.body.mode, "verified_cheapest_accommodation");
  assert.match(follow.body.reply, /Small Nipa Hut 2/);
  assert.match(follow.body.reply, /₱800\.00.*Day Tour/i);
  assert.match(follow.body.reply, /Overnight: ₱950\.00/i);
  assert.doesNotMatch(follow.body.reply,
    /Cheap Unrelated Room|Maintenance Cottage|check.in|kailan.*balak/i);
  assert.deepEqual(follow.body.recommendation_cards.map(x=>x.id), [45]);
  assert.equal(follow.body.recommendation_cards[0].day_price, 800);
  assert.equal(follow.body.recommendation_cards[0].overnight_price, 950);
  assert.equal(follow.body.recommendation_cards[0].availability_verified, false);
  assert.equal(follow.body.extracted_context.room_id, 45);
  assert.equal(queries.length, 1);
  assert.ok(queries.every(q => /^SELECT\b/i.test(q.sql)));
  assert.match(queries[0].sql, /ORDER BY LEAST\(/i);
  assert.match(queries[0].sql, /LIMIT 6\b/i);
  assert.doesNotMatch(queries[0].sql, /reservation_items|LIMIT 150/i);
  assert.equal(modelCalls, 0);
});

test("AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800", async () => {
  catalogRows = [
    { ...exampleRoom, id: 10, room_name: "Small Nipa Hut 1",
      category_name: "Cottage", day_price: 800, overnight_price: 1600 },
    { ...exampleRoom, id: 11, room_name: "Small Nipa Hut 2",
      category_name: "Cottage", day_price: 900, overnight_price: 1000 },
  ];
  const payload = { message: "What's the cheapest cottage?" };
  const first = await post("/api/ai/chat", payload);
  assert.match(first.body.reply, /Small Nipa Hut 1/);
  assert.match(first.body.reply, /₱800\.00/);
  catalogRows[0].day_price = 1300;
  queries = [];
  const second = await post("/api/ai/chat", payload);
  assert.equal(second.body.mode, "verified_cheapest_accommodation");
  assert.match(second.body.reply, /Small Nipa Hut 2/);
  assert.match(second.body.reply, /₱900\.00/);
  assert.doesNotMatch(second.body.reply, /Small Nipa Hut 1|₱800\.00/);
  assert.deepEqual(second.body.recommendation_cards.map(x=>x.id), [11]);
  assert.equal(queries.length, 1);
  assert.equal(modelCalls, 0);
});

test("AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices", async () => {
  catalogRows = [
    { ...exampleRoom, id: 12, room_name: "Cheap Day Room",
      category_name: "Room", day_price: 100, overnight_price: 4200 },
    { ...exampleRoom, id: 13, room_name: "Cheapest Night Room",
      category_name: "Room", day_price: 3000, overnight_price: 900 },
    { ...exampleRoom, id: 14, room_name: "Unpriced Room",
      category_name: "Room", day_price: 0, overnight_price: null },
  ];
  const response = await post("/api/ai/chat", {
    message: "Which room has the cheapest overnight rate?",
  });
  assert.equal(response.body.mode, "verified_cheapest_accommodation");
  assert.match(response.body.reply, /Cheapest Night Room/);
  assert.match(response.body.reply, /₱900\.00.*Overnight/i);
  assert.doesNotMatch(response.body.reply, /Cheap Day Room|Unpriced Room/i);
  assert.deepEqual(response.body.recommendation_cards.map(x=>x.id), [13]);
  assert.equal(modelCalls, 0);
});

test("AI-LIVE-05 same-priced listings never select an arbitrary old room", async () => {
  catalogRows = [
    { ...exampleRoom, id: 10, room_name: "Small Nipa Hut 1",
      category_name: "Cottage", day_price: 800, overnight_price: 1200 },
    { ...exampleRoom, id: 11, room_name: "Small Nipa Hut 2",
      category_name: "Cottage", day_price: 800, overnight_price: 1500 },
  ];
  const response = await post("/api/ai/chat", {
    message: "Ano pinakamurang cottage niyo?",
    context: { room_id: 61, room_name: "Family Room A" },
  });
  assert.equal(response.body.mode, "verified_cheapest_accommodation");
  assert.deepEqual(response.body.recommendation_cards.map(x=>x.id), [10,11]);
  assert.equal(Object.hasOwn(response.body.extracted_context,"room_id"),false);
  assert.equal(Object.hasOwn(response.body.extracted_context,"room_name"),false);
  assert.doesNotMatch(response.body.reply, /Family Room A/);
  assert.equal(response.body.booking_preview, null);
  assert.equal(modelCalls, 0);
});

test("AI-LIVE-05 selected cheapest room remains focused for a CR follow-up", async () => {
  catalogRows = [
    { ...exampleRoom, id: 92, room_name: "Big Nipa Hut",
      category_name: "Cottage", day_price: 500 },
    { ...exampleRoom, id: 93, room_name: "Family Room B",
      category_name: "Room", day_price: 4000, overnight_price: 4500 },
    { ...exampleRoom, id: 94, room_name: "Double Room 1",
      category_name: "Room", day_price: 2000, overnight_price: 2700,
      amenities: "Private CR, aircon", description: "Double room" },
  ];
  const first = await post("/api/ai/chat", {
    message: "What's the cheapest room?",
    context: { room_id: 92, room_name: "Big Nipa Hut" },
  });
  assert.equal(first.body.mode, "verified_cheapest_accommodation");
  assert.equal(first.body.extracted_context.room_id, 94);
  assert.equal(first.body.extracted_context.room_name, "Double Room 1");
  assert.deepEqual(first.body.recommendation_cards.map(x => x.id), [94]);
  queries = [];
  const second = await post("/api/ai/chat", {
    message: "may cr ba siya?",
    context: first.body.extracted_context,
    recent_turns: [
      { role: "user", text: "What's the cheapest room?" },
      { role: "assistant", text: first.body.reply },
    ],
  });
  assert.equal(second.body.mode, "verified_accommodation_amenity");
  assert.match(second.body.reply, /may sariling CR ang Double Room 1/i);
  assert.doesNotMatch(second.body.reply, /Big Nipa Hut|Family Room B|date|check.in/i);
  assert.deepEqual(queries[0].params, [94]);
  assert.equal(queries.length, 1);
  assert.equal(modelCalls, 0);
});

test("AI-LIVE-05 unknown scope asks rooms or cottages without spending credits", async () => {
  const response = await post("/api/ai/chat", {
    message: "Ano naman pinakamura sa mga yun?",
    context: { room_id: 61, room_name: "Family Room A" },
  });
  assert.equal(response.body.mode, "verified_cheapest_accommodation");
  // Per-message Filipino detection may naturally say "kuwarto" here.
  assert.match(response.body.reply, /(?:rooms, cottages, o function areas|kuwarto, cottage, o function area)/i);
  assert.equal(queries.length, 0);
  assert.equal(modelCalls, 0);
  assert.equal(response.body.booking_preview, null);
});

test("AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards", async () => {
  catalogRows = [
    { ...exampleRoom, id: 81, room_name: "Family Room A", category_name: "Room" },
    { ...exampleRoom, id: 82, room_name: "Family Room B", category_name: "Room" },
    { ...exampleRoom, id: 83, room_name: "Double Room 1", category_name: "Room", status: "maintenance" },
    { ...exampleRoom, id: 84, room_name: "Big Nipa Hut 1", category_name: "Cottage" },
    { ...exampleRoom, id: 85, room_name: "Function Area A", category_name: "Function Area" },
  ];
  const result = await post("/api/ai/chat", {
    message: "ilang rooms meron kayo?",
    context: { room_id: 84, room_name: "Big Nipa Hut 1", language_style: "english" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "verified_accommodation_count");
  assert.match(result.body.reply, /3 rooms/i);
  assert.match(result.body.reply, /2 marked available/i);
  assert.match(result.body.reply, /(?:date at time|petsa at oras)/i);
  assert.doesNotMatch(result.body.reply, /Nipa Hut|5 accommodations|room preview/i);
  assert.deepEqual(result.body.recommendation_cards, []);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.equal(result.body.booking_preview, null);
  assert.equal(result.body.extracted_context.room_id, 84); // Never steal focus.
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /COUNT\(\*\) AS accommodation_count/i);
  assert.match(queries[0].sql, /GROUP BY c\.name/i);
  assert.doesNotMatch(queries[0].sql, /LIMIT 150|reservation_items/i);
  assert.equal(modelCalls, 0);
});

test("Inventory counting always re-reads Admin state and never caps at 150", async () => {
  catalogRows = Array.from({ length: 160 }, (_, index) => ({
    ...exampleRoom, id: 200 + index, room_name: "Room " + index, category_name: "Room",
  }));
  const first = await post("/api/ai/chat", { message: "How many rooms do you have?" });
  assert.equal(first.body.mode, "verified_accommodation_count");
  assert.match(first.body.reply, /160 rooms/);
  assert.equal(modelCalls, 0);
  catalogRows.push({ ...exampleRoom, id: 1000, room_name: "New Room", category_name: "Room" });
  queries = [];
  const second = await post("/api/ai/chat", { message: "Ilang kwarto meron kayo?" });
  assert.equal(second.body.mode, "verified_accommodation_count");
  assert.match(second.body.reply, /161 rooms/);
  assert.equal(queries.length, 1);
  assert.equal(modelCalls, 0);
});

test("Count questions distinguish room, cottage, function and available listing statuses", async () => {
  catalogRows = [
    { ...exampleRoom, id: 10, room_name: "Family Room B", category_name: "Room" },
    { ...exampleRoom, id: 11, room_name: "Single Room Cottage 1", category_name: "Room", status: "maintenance" },
    { ...exampleRoom, id: 12, room_name: "Small Nipa Hut 2", category_name: "Cottage" },
    { ...exampleRoom, id: 13, room_name: "Function Area A", category_name: "Function Area" },
  ];
  const cases = [
    ["Ilang available na rooms meron kayo?", /1 room.*marked available/i],
    ["Ilang cottages at rooms?", /2 rooms.*1 cottage/i],
    ["How many accommodations are listed?", /4 accommodations/i],
    ["Ilan pong family rooms?", /1 family room/i],
    ["How many function areas are there?", /1 function area/i],
  ];
  for (const [message, expected] of cases) {
    queries = [];
    const result = await post("/api/ai/chat", { message });
    assert.equal(result.body.mode, "verified_accommodation_count", message);
    assert.match(result.body.reply, expected, message);
    assert.equal(queries.length, 1, message);
    assert.ok(queries.every(q => /^SELECT\b/i.test(q.sql)), message);
    assert.equal(modelCalls, 0, message);
  }
});

// AI-37: The assistant acts like a receptionist, asking group size first.
// No raw Gemini recommendations, guessed capacity or unnecessary catalog read.
test("AI-37 generic recommendation asks for guests first, no random cards or credits", async () => {
  const result = await post("/api/ai/chat", {
    message: "anong room ang massuggest mo?",
    voice_language: "taglish",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "recommendation_needs_guest_count");
  assert.match(result.body.reply, /Ilan po kayong guests/i);
  assert.equal(result.body.extracted_context.intent, "ask_recommendation");
  assert.deepEqual(result.body.recommendation_cards, []);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.equal(result.body.booking_preview, null);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

test("AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards", async () => {
  catalogRows = [
    { ...exampleRoom, id: 1, room_name: "Small Room", capacity: 3 },
    { ...exampleRoom, id: 2, room_name: "Double Room 1", capacity: 7 },
    { ...exampleRoom, id: 3, room_name: "Big Nipa Hut", category_name: "Cottage", capacity: 20 },
  ];
  const first = await post("/api/ai/chat", {
    message: "Anong room ang massuggest mo?", voice_language: "taglish",
  });
  assert.equal(first.body.mode, "recommendation_needs_guest_count");
  queries = [];
  modelCalls = 0;
  const second = await post("/api/ai/chat", {
    message: "4 kami",
    voice_language: "taglish",
    context: first.body.extracted_context,
    recent_turns: [
      { role: "user", text: "Anong room ang massuggest mo?" },
      { role: "assistant", text: first.body.reply },
    ],
  });
  assert.equal(second.status, 200);
  assert.equal(second.body.mode, "verified_accommodation_preview");
  assert.equal(second.body.extracted_context.guests, 4);
  assert.equal(second.body.extracted_context.room_name, "Double Room 1");
  assert.deepEqual(second.body.recommendation_cards.map(r => r.id), [2]);
  assert.equal(second.body.recommendation_cards[0].availability_verified, false);
  assert.doesNotMatch(second.body.reply, /date at|check.in/i);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /SELECT.*FROM accommodations a/i);
  assert.equal(modelCalls, 0);
});

test("AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini", async () => {
  for (const answer of ["4", "apat kami", "4 po"]) {
    const result = await post("/api/ai/chat", {
      message: answer,
      context: { intent: "ask_recommendation", language_style: "taglish" },
      recent_turns: [
        { role: "user", text: "Anong room ang massuggest mo?" },
        { role: "assistant", text: "Sure po! Ilan po kayong guests?" },
      ],
    });
    assert.equal(result.status, 200, answer);
    assert.equal(result.body.mode, "verified_accommodation_preview", answer);
    assert.equal(result.body.extracted_context.guests, 4, answer);
    assert.equal(modelCalls, 0, answer);
  }
});

test("AI-37 previously supplied guests are reused; explicit group size takes precedence", async () => {
  catalogRows = [
    { ...exampleRoom, id: 17, room_name: "Double Room 2", capacity: 7 },
    { ...exampleRoom, id: 18, room_name: "Small Room", capacity: 3 },
  ];
  const saved = await post("/api/ai/chat", {
    message: "Anong magandang room?", context: { guests: 6, room_id: 77, room_name: "Old Nipa Hut" },
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.mode, "verified_accommodation_preview");
  assert.equal(saved.body.extracted_context.guests, 6);
  assert.deepEqual(saved.body.recommendation_cards.map(r => r.id), [17]);
  assert.equal(modelCalls, 0);

  const fromForm = await post("/api/ai/chat", {
    message: "What room do you recommend?", guests: 5,
  });
  assert.equal(fromForm.body.mode, "verified_accommodation_preview");
  assert.equal(fromForm.body.extracted_context.guests, 5);
  assert.deepEqual(fromForm.body.recommendation_cards.map(r => r.id), [17]);
  assert.equal(modelCalls, 0);
});


test("AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic", async () => {
  catalogRows = [
    { ...exampleRoom, id: 71, room_name: "Double Room 1", capacity: 7, day_price: 4000 },
    { ...exampleRoom, id: 94, room_name: "Family Room B", capacity: 20, day_price: 8000 },
    { ...exampleRoom, id: 95, room_name: "Big Nipa Hut", category_name: "Cottage", capacity: 20 },
  ];
  const first = await post("/api/ai/chat", {
    message: "Anong room ang massuggest mo?", voice_language: "taglish",
  });
  assert.equal(first.status, 200);
  assert.equal(first.body.mode, "recommendation_needs_guest_count");

  const ten = await post("/api/ai/chat", {
    message: "10",
    voice_language: "taglish",
    context: first.body.extracted_context,
    recent_turns: [
      { role: "user", text: "Anong room ang massuggest mo?" },
      { role: "assistant", text: first.body.reply },
    ],
  });
  assert.equal(ten.status, 200);
  assert.equal(ten.body.extracted_context.guests, 10);
  assert.deepEqual(ten.body.recommendation_cards.map(room => room.id), [94]);
  assert.equal(ten.body.extracted_context.room_id, 94);

  // A new capacity filter must be evaluated against a fresh catalog read.
  queries = [];
  modelCalls = 0;
  const seven = await post("/api/ai/chat", {
    message: "7 pala",
    voice_language: "taglish",
    context: ten.body.extracted_context,
    recent_turns: [
      { role: "user", text: "Anong room ang massuggest mo?" },
      { role: "assistant", text: first.body.reply },
      { role: "user", text: "10" },
      { role: "assistant", text: ten.body.reply },
    ],
  });
  assert.equal(seven.status, 200);
  assert.equal(seven.body.mode, "verified_accommodation_preview");
  assert.equal(seven.body.extracted_context.guests, 7);
  assert.match(seven.body.reply, /7 guests na/i);
  assert.deepEqual(seven.body.recommendation_cards.map(room => room.id), [71,94]);
  assert.equal(Object.hasOwn(seven.body.extracted_context, "room_id"), false);
  assert.equal(seven.body.booking_preview, null);
  assert.equal(seven.body.recommendation_cards[0].availability_verified, false);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /FROM accommodations a/i);
  assert.doesNotMatch(queries[0].sql, /reservation_items/i);
  assert.equal(modelCalls, 0);
});

test("AI-38 corrected guest count sees newly updated Admin prices and inventory", async () => {
  catalogRows = [{ ...exampleRoom, id: 94, room_name: "Family Room B",
    capacity: 20, day_price: 8000 }];
  const first = await post("/api/ai/chat", {
    message: "Recommend a room",
  });
  const ten = await post("/api/ai/chat", {
    message: "10", context: first.body.extracted_context,
    recent_turns: [
      { role: "user", text: "Recommend a room" },
      { role: "assistant", text: first.body.reply },
    ],
  });
  assert.deepEqual(ten.body.recommendation_cards.map(room=>room.id), [94]);

  // Test's in-memory mock represents a fresh Admin edit/new room.
  catalogRows = [
    { ...exampleRoom, id: 94, room_name: "Family Room B",
      capacity: 20, day_price: 7900 },
    { ...exampleRoom, id: 71, room_name: "Double Room 1",
      capacity: 7, day_price: 4000 },
  ];
  queries = [];
  modelCalls = 0;
  const response = await post("/api/ai/chat", {
    message: "5 na lang kami",
    context: ten.body.extracted_context,
    recent_turns: [
      { role: "user", text: "Recommend a room" },
      { role: "assistant", text: first.body.reply },
      { role: "user", text: "10" },
      { role: "assistant", text: ten.body.reply },
    ],
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.mode, "verified_accommodation_preview");
  assert.equal(response.body.extracted_context.guests, 5);
  assert.deepEqual(response.body.recommendation_cards.map(room=>room.id), [71,94]);
  assert.equal(response.body.recommendation_cards.find(room=>room.id===94).day_price, 7900);
  assert.equal(queries.length, 1);
  assert.equal(modelCalls, 0);
});

test("AI-38 original family-room scope persists after revising 10 guests to 7", async () => {
  catalogRows = [
    { ...exampleRoom, id: 94, room_name: "Family Room B", capacity: 20 },
    { ...exampleRoom, id: 93, room_name: "Family Room A", capacity: 8 },
    { ...exampleRoom, id: 71, room_name: "Double Room 1", capacity: 7 },
  ];
  const first = await post("/api/ai/chat", { message:"Recommend a family room" });
  const ten = await post("/api/ai/chat", {
    message:"10", context:first.body.extracted_context,
    recent_turns:[
      {role:"user",text:"Recommend a family room"},
      {role:"assistant",text:first.body.reply},
    ],
  });
  assert.deepEqual(ten.body.recommendation_cards.map(room=>room.id), [94]);
  const seven = await post("/api/ai/chat", {
    message:"7 guests pala", context:ten.body.extracted_context,
    recent_turns:[
      {role:"user",text:"Recommend a family room"},
      {role:"assistant",text:first.body.reply},
      {role:"user",text:"10"},
      {role:"assistant",text:ten.body.reply},
    ],
  });
  assert.equal(seven.status, 200);
  assert.equal(seven.body.extracted_context.guests, 7);
  assert.deepEqual(seven.body.recommendation_cards.map(room=>room.id), [93,94]);
  assert.equal(modelCalls, 0);
});


test("AI-45 natural two-to-seven follow-up retains group search even after language switch", async () => {
  catalogRows = [
    { ...exampleRoom, id: 71, room_name: "Double Room 1", capacity: 7, day_price: 4000 },
    { ...exampleRoom, id: 72, room_name: "Small Room", capacity: 3, day_price: 2000 },
    { ...exampleRoom, id: 94, room_name: "Family Room B", capacity: 20, day_price: 8000 },
  ];
  const original = "Anong room ang maganda para sa dalawa?";
  const first = await post("/api/ai/chat", {
    message: original,
    context: { language_style: "mandarin" },
    recent_turns: [
      {role:"user",text:"Nihao ma?"},
      {role:"assistant",text:"你好！欢迎咨询 Arvic Seaside Resort。"},
    ],
  });
  assert.equal(first.status, 200);
  assert.equal(first.body.mode, "verified_accommodation_preview");
  assert.equal(first.body.extracted_context.guests, 2);
  assert.equal(first.body.extracted_context.intent, "ask_recommendation");
  assert.equal(first.body.extracted_context.recommendation_category, "room");
  assert.deepEqual(first.body.recommendation_cards.map(room => room.id), [72,71,94]);
  assert.equal(modelCalls, 0);
  const recent = [
    {role:"user",text:"Nihao ma?"},
    {role:"assistant",text:"你好！欢迎咨询 Arvic Seaside Resort。"},
    {role:"user",text:original},
    {role:"assistant",text:first.body.reply},
  ];
  for (const message of ["Pito pala kami", "7 pala kami"]) {
    queries = [];
    const result = await post("/api/ai/chat", {
      message, context:first.body.extracted_context, recent_turns:recent,
    });
    assert.equal(result.status, 200, message);
    assert.equal(result.body.mode, "verified_accommodation_preview", message);
    assert.equal(result.body.extracted_context.guests, 7, message);
    assert.equal(result.body.extracted_context.intent, "ask_recommendation", message);
    assert.deepEqual(result.body.recommendation_cards.map(room => room.id), [71,94], message);
    assert.match(result.body.reply, /7 guests na|7位客人/, message);
    assert.equal(modelCalls, 0, message);
    assert.equal(queries.length, 1, message);
    assert.equal(result.body.booking_preview, null, message);
  }
});

test("AI-45 a guest-specific family-room preview keeps category on count correction", async () => {
  catalogRows = [
    { ...exampleRoom, id: 11, room_name: "Family Room A", capacity: 7 },
    { ...exampleRoom, id: 12, room_name: "Family Room B", capacity: 10 },
    { ...exampleRoom, id: 13, room_name: "Double Room 1", capacity: 7 },
  ];
  const initial = "Anong family room ang maganda para sa dalawa?";
  const first = await post("/api/ai/chat", {message:initial});
  assert.equal(first.body.mode,"verified_accommodation_preview");
  assert.equal(first.body.extracted_context.recommendation_category, "family");
  const second = await post("/api/ai/chat", {
    message:"Pito pala kami",
    context:first.body.extracted_context,
    recent_turns:[
      {role:"user",text:initial},
      {role:"assistant",text:first.body.reply},
    ],
  });
  assert.equal(second.body.mode,"verified_accommodation_preview");
  assert.deepEqual(second.body.recommendation_cards.map(r=>r.id),[11,12]);
  assert.equal(second.body.extracted_context.guests,7);
  assert.equal(second.body.extracted_context.recommendation_category,"family");
  assert.equal(modelCalls,0);
});

test("AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction", async () => {
  const previous = [
    { role: "user", text: "Recommend a room" },
    { role: "assistant", text: "Sure po! Ilan po kayong guests?" },
    { role: "user", text: "10" },
    { role: "assistant", text: "Yes po, free parking ang resort." },
  ];
  for(const message of ["7 pala", "7pm pala", "Si Jose Rizal?"]) {
    queries = [];
    modelCalls = 0;
    const response = await post("/api/ai/chat", {
      message, context: {
        intent:"ask_recommendation", guests:10, room_id:94,
        room_name:"Family Room B",
      }, recent_turns: previous,
    });
    assert.equal(response.status, 200, message);
    assert.equal(response.body.mode, "resort_scope_only", message);
    assert.equal(queries.length, 0, message);
    assert.equal(modelCalls, 0, message);
  }
});

test("AI-37 selecting a named accommodation or browsing rooms still works without guest question", async () => {
  const browse = await post("/api/ai/chat", { message: "What rooms are available?" });
  assert.equal(browse.body.mode, "verified_accommodation_preview");
  assert.ok(browse.body.recommendation_cards.length > 0);
  assert.equal(modelCalls, 0);
});

test("Undated room discovery uses fresh DB preview without claiming slot availability", async () => {
  const result = await post("/api/ai/chat", { message: "What rooms are available?" });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "verified_accommodation_preview");
  assert.equal(result.body.booking_preview, null);
  assert.deepEqual(result.body.matched_rooms, []);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.equal(result.body.recommendation_cards[0].id, 61);
  assert.equal(result.body.recommendation_cards[0].availability_verified, false);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /FROM accommodations a/);
  assert.match(queries[0].sql, /LIMIT 150/);
  assert.doesNotMatch(queries[0].sql, /reservation_items/);
  assert.equal(modelCalls, 0); // Pure DB preview is cheaper than a generic Gemini catalog.
});

// AI-LIVE-03: Reproduce real chat: recommend a single Family Room B for
// 20 guests, then "may CR ba sya?". Prior Big Nipa Hut must never leak.
test("AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB", async () => {
  catalogRows = [
    { ...exampleRoom, id: 78, room_name: "Big Nipa Hut",
      category_name: "Cottage", capacity: 25, amenities: "",
      description: "Open-air cottage" },
    { ...exampleRoom, id: 100, room_name: "Family Room B",
      category_name: "Room", capacity: 20,
      amenities: "Private CR, aircon", description: "Two-bedroom family room" },
    { ...exampleRoom, id: 101, room_name: "Family Room A",
      category_name: "Room", capacity: 7 },
  ];
  const question = "anong magandang room para sa 20 guests?";
  const first = await post("/api/ai/chat", {
    message: question,
    context: { room_id: 78, room_name: "Big Nipa Hut", language_style: "taglish" },
  });
  assert.equal(first.status, 200);
  assert.equal(first.body.mode, "verified_accommodation_preview");
  assert.deepEqual(first.body.recommendation_cards.map(room => room.id), [100]);
  assert.equal(first.body.extracted_context.room_id, 100);
  assert.equal(first.body.extracted_context.room_name, "Family Room B");
  assert.equal(first.body.extracted_context.guests, 20);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 1);

  queries = [];
  const second = await post("/api/ai/chat", {
    message: "may cr ba sya?",
    context: first.body.extracted_context,
    recent_turns: [
      { role: "user", text: question },
      { role: "assistant", text: first.body.reply },
    ],
  });
  assert.equal(second.status, 200);
  assert.equal(second.body.mode, "verified_accommodation_amenity");
  assert.equal(second.body.extracted_context.room_id, 100);
  assert.match(second.body.reply, /may sariling CR ang Family Room B/i);
  assert.doesNotMatch(second.body.reply, /Big Nipa Hut|check.in date|anong date|balak.*check.in/i);
  assert.deepEqual(second.body.recommendation_cards, []);
  assert.equal(second.body.booking_preview, null);
  assert.equal(queries.length, 1);
  assert.deepEqual(queries[0].params, [100]);
  assert.match(queries[0].sql, /^SELECT\b/);
  assert.equal(modelCalls, 0);
});

test("AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR", async () => {
  catalogRows = [
    { ...exampleRoom, id: 78, room_name: "Big Nipa Hut",
      category_name: "Cottage", capacity: 25 },
    { ...exampleRoom, id: 100, room_name: "Family Room B",
      category_name: "Room", capacity: 20 },
    { ...exampleRoom, id: 101, room_name: "Family Room C",
      category_name: "Room", capacity: 22 },
  ];
  const first = await post("/api/ai/chat", {
    message: "anong magandang room para sa 20 guests?",
    context: { room_id: 78, room_name: "Big Nipa Hut" },
  });
  assert.equal(first.status, 200);
  assert.equal(first.body.mode, "verified_accommodation_preview");
  assert.deepEqual(first.body.recommendation_cards.map(room => room.id), [100, 101]);
  assert.equal(Object.hasOwn(first.body.extracted_context, "room_id"), false);
  assert.equal(Object.hasOwn(first.body.extracted_context, "room_name"), false);

  queries = [];
  modelCalls = 0;
  const second = await post("/api/ai/chat", {
    message: "may cr ba sya?",
    context: first.body.extracted_context,
  });
  assert.equal(second.status, 200);
  assert.equal(second.body.mode, "accommodation_selection_needed");
  assert.match(second.body.reply, /Aling room po/);
  assert.doesNotMatch(second.body.reply, /Big Nipa Hut|May sariling CR|anong date/i);
  assert.equal(queries.length, 0);
  assert.equal(modelCalls, 0);
  assert.equal(second.body.booking_preview, null);
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
  assert.match(frontend, /new URLSearchParams\(\{room_id:String\(roomId\)\}\)/);
  assert.match(frontend, /AI_IS_PUBLIC_LANDING \? "\.\.\/authHTML\/login\.html\?"\+query : "booking\.html\?"\+query/);
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
test("Voice response switches to Mandarin when the guest speaks Mandarin", async () => {
  const result = await post("/api/ai/chat", {
    message: "你好，我想预订一个房间。",
    input_source: "voice",
    context: { language_style: "english" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.extracted_context.language_style, "mandarin");
  assert.match(modelPrompts.at(-1), /Simplified Chinese characters/);
});
test("Voice response switches back to English when the guest speaks English", async () => {
  const result = await post("/api/ai/chat", {
    message: "Do you have a family room?",
    input_source: "voice",
    context: { language_style: "mandarin" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.extracted_context.language_style, "english");
  assert.equal(modelCalls, 1);
  assert.match(modelPrompts.at(-1), /The CURRENT guest message controls reply language/);
});
test("AI-44 Taglish and Spanish voice messages follow the latest guest language", async () => {
  const taglish = await post("/api/ai/chat", {
    message: "May room available po ba kayo?",
    input_source: "voice",
    context: { language_style: "spanish" },
  });
  assert.equal(taglish.status, 200);
  assert.equal(taglish.body.extracted_context.language_style, "taglish");
  modelCalls = 0; successfulModelCalls = 0; injectedFailures = 0;
  injectedStatus = 503; modelPrompts = [];
  const spanish = await post("/api/ai/chat", {
    message: "Hola, tienen habitaciones?",
    input_source: "voice",
    context: { language_style: "taglish" },
  });
  assert.equal(spanish.status, 200);
  assert.equal(spanish.body.extracted_context.language_style, "spanish");
});

test("Live voice Gemini prompt remains concise and obeys booking rules", async () => {
  const result = await post("/api/ai/chat", {
    message: "Help me find a family cottage.",
    input_source: "voice",
  });
  assert.equal(result.status, 200);
  assert.match(modelPrompts.at(-1), /LIVE SPOKEN CONVERSATION/);
  assert.match(modelPrompts.at(-1), /one or two short sentences/);
  assert.match(modelPrompts.at(-1), /Ask at most ONE useful follow-up question/);
  assert.match(modelPrompts.at(-1), /Never invent or promise a booking/);
  assert.match(modelPrompts.at(-1), /same language as the current spoken message/);
});

test("Normal text chat is not forced into live spoken-conversation style", async () => {
  const result = await post("/api/ai/chat", {
    message: "How can I book?",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "concierge_booking");
  assert.equal(result.body.handoff, "booking");
  assert.match(result.body.reply, /PayPal/);
  assert.equal(modelCalls, 0);
  assert.doesNotMatch(result.body.reply, /LIVE SPOKEN CONVERSATION/);
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


test("New Admin accommodation appears immediately in the verified preview catalog", async () => {
  const initial = await post("/api/ai/chat", { message: "What cottages do you have?" });
  assert.equal(initial.status, 200);
  assert.equal(initial.body.mode, "verified_accommodation_preview");
  assert.deepEqual(initial.body.recommendation_cards, []);
  assert.equal(queries.length, 1);

  catalogRows = [{
    ...exampleRoom, id: 102, room_name: "New Family Cottage",
    category_name: "Cottage", capacity: 12,
    day_price: 2500, overnight_price: 3800,
  }];
  queries = [];
  const result = await post("/api/ai/chat", {
    message: "Any cottages for 10 guests?", guests: 10,
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "verified_accommodation_preview");
  assert.equal(result.body.booking_preview, null);
  assert.equal(result.body.extracted_context.guests, 10);
  assert.equal(result.body.recommendation_cards[0].id, 102);
  assert.equal(result.body.recommendation_cards[0].name, "New Family Cottage");
  assert.equal(result.body.recommendation_cards[0].availability_verified, false);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.equal(queries.length, 1);
  assert.equal(modelCalls, 0);
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
  // A named accommodation is explicitly supplied, so the safe flow
  // still extracts intent first instead of taking the general-catalog shortcut.
  assert.equal(modelCalls, 2);
  assert.match(modelPrompts[0], /You are interpreting natural language for Arvic Seaside Resort guest services/);
  assert.match(modelPrompts.at(-1), /Maintenance Cottage/);
  assert.match(modelPrompts.at(-1), /Admin status: maintenance/);
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
  assert.match(result.body.reply, /Please (?:provide check-in\/out|choose) dates/i);
  assert.match(result.body.reply, /fixed Day Tour/i);
  assert.equal(result.body.catalog_recommendations[0].availability_verified, false);
  assert.equal(result.body.booking_preview, null);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /FROM accommodations a/);
  assert.doesNotMatch(queries[0].sql, /reservation_items/);
  assert.equal(modelCalls, 1); // Never retry free-tier rate limits.
});

// A 429 on the final reply must reuse the already-read catalog within
// this request, while the NEXT request fetches fresh admin edits.
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

test("Voice quota fallback uses language of current spoken question", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const result = await post("/api/ai/chat", {
    message: "Do you have a room?",
    input_source: "voice",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "database_fallback");
  assert.match(result.body.reply, /Our AI service is temporarily limited/i);
  assert.equal(result.body.extracted_context.language_style, "english");
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
  assert.equal(result.body.mode, "verified_catalog_rates");
  assert.match(result.body.reply, /Family Room A/);
  assert.equal(queries.length, 1);
  assert.equal(modelCalls, 0);
  assert.equal(result.body.recommendation_cards[0].availability_verified, false);
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
  assert.match(result.body.reply, /Please (?:provide check-in\/out|choose) dates/i);
  assert.match(result.body.reply, /fixed Day Tour/i);
  assert.equal(queries.length, 1);
  assert.doesNotMatch(queries[0].sql, /reservation_items/);
});


test("English accommodation question remains English during Gemini quota fallback", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const result = await post("/api/ai/chat", {
    message: "Hello AI! What accommodations do you currently offer at Arvic Seaside? Please tell me their names, capacities, and day tour rates.",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "database_fallback");
  assert.equal(result.body.extracted_context.language_style, "english");
  assert.match(result.body.reply, /^Our AI service is temporarily limited/);
  assert.match(result.body.reply, /Family Room A/);
  assert.equal(queries.length, 1);
});


test("Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL", async () => {
  const result = await post("/api/ai/chat", {
    message: "Hello AI! What accommodations do you currently offer at Arvic Seaside? Please tell me their names, capacities, and day tour rates.",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.reply, "Mock AI response; no external service called.");
  assert.equal(modelCalls, 1);
  assert.equal(modelPrompts.length, 1);
  assert.match(modelPrompts[0], /Fresh general accommodation catalog/);
  assert.match(modelPrompts[0], /Family Room A/);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /FROM accommodations a/);
  assert.doesNotMatch(queries[0].sql, /reservation_items/);
  assert.equal(result.body.booking_preview, null);
  assert.equal(result.body.catalog_recommendations[0].availability_verified, false);
});

test("Undated cottage catalog uses one fresh DB read and zero Gemini credits", async () => {
  const result = await post("/api/ai/chat", {
    message: "What cottages do you have?",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "verified_accommodation_preview");
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 1);
  assert.equal(result.body.booking_preview, null);
  assert.deepEqual(result.body.recommendation_cards, []); // Mock catalog only has a Room.
});

test("Explicit booking windows still take the safe extraction and slot-check flow", async () => {
  const result = await post("/api/ai/chat", futureContext);
  assert.equal(result.status, 200);
  assert.equal(modelCalls, 2);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /reservation_items/);
  assert.equal(result.body.booking_preview.room_id, 61);
});

test("Undated preview retains saved guest count and excludes undersized cottages", async () => {
  const result = await post("/api/ai/chat", {
    message: "What cottages do you have?",
    context: { guests: 10 },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "verified_accommodation_preview");
  assert.equal(result.body.extracted_context.guests, 10);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 1);
  assert.deepEqual(result.body.recommendation_cards, []);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.equal(result.body.booking_preview, null);
});

test("Voice catalog reply uses current English and retains speech prompt", async () => {
  const result = await post("/api/ai/chat", {
    message: "What accommodations do you offer?",
    input_source: "voice",
  });
  assert.equal(result.status, 200);
  assert.equal(modelCalls, 1);
  assert.equal(result.body.extracted_context.language_style, "english");
  assert.match(modelPrompts[0], /LIVE SPOKEN CONVERSATION/);
  assert.match(modelPrompts[0], /The CURRENT guest message controls reply language/);
});

test("Optimized prompt does not duplicate full booking context and live details", async () => {
  const result = await post("/api/ai/chat", futureContext);
  assert.equal(result.status, 200);
  assert.match(modelPrompts.at(-1), /Saved booking details/);
  assert.doesNotMatch(modelPrompts.at(-1), /Live booking details:/);
  assert.equal((modelPrompts.at(-1).match(/Saved booking details/g)||[]).length, 1);
});


test("Quota fallback does not issue a second catalog SQL read after optimized Gemini call", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const response = await post("/api/ai/chat", {
    message: "What accommodations do you offer?",
  });
  assert.equal(response.status, 200);
  // Generic accommodation catalog needs Gemini; explicit room-photo
  // discovery now correctly takes a separate zero-credit preview route.
  assert.equal(response.body.mode, "database_fallback");
  assert.equal(response.body.catalog_recommendations[0].availability_verified, false);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /FROM accommodations a/);
  assert.equal(modelCalls, 1);
  assert.equal(response.body.booking_preview, null);
});

test("English spoken catalog quota fallback does not inherit old Mandarin", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const response = await post("/api/ai/chat", {
    message: "Do you have a family room?",
    input_source: "voice",
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.extracted_context.language_style, "english");
  assert.match(response.body.reply, /^Our AI service is temporarily limited/);
  assert.equal(modelCalls, 1);
  assert.equal(queries.length, 1);
  assert.equal(response.body.booking_preview, null);
});


test("Oversized AI message is rejected before Gemini and database access", async () => {
  const result = await post("/api/ai/chat", {
    message: "Can I book?" + "x".repeat(2200),
  });
  assert.equal(result.status, 413);
  assert.equal(result.body.code, "AI_INPUT_TOO_LONG");
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

test("Oversized stored AI context cannot inflate token usage", async () => {
  const result = await post("/api/ai/chat", {
    message: "Hello",
    context: { room_name: "x".repeat(13000) },
  });
  assert.equal(result.status, 413);
  assert.equal(result.body.code, "AI_INPUT_TOO_LONG");
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

test("Oversized translation is rejected before paid Gemini calls", async () => {
  const result = await post("/api/ai/translate-english", {
    text: "x".repeat(6100),
  });
  assert.equal(result.status, 413);
  assert.equal(result.body.code, "AI_INPUT_TOO_LONG");
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

test("Normal short chat and translation remain usable after size limits", async () => {
  const question = await post("/api/ai/chat", { message: "Hello" });
  assert.equal(question.status, 200);
  assert.equal(modelCalls, 2);
  const translated = await post("/api/ai/translate-english", {
    text: "Hola",
  });
  assert.equal(translated.status, 200);
  assert.equal(translated.body.translated_text, "Mock English translation");
  assert.equal(modelCalls, 3);
});


// Demo QA regression: use the real Philippine calendar date and never give
// guests stale years as sample booking dates in the AI's instructions.
test("AI prompts use current Philippine date and explicitly reject stale examples", async () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = type => parts.find(part => part.type === type).value;
  const date = get("year") + "-" + get("month") + "-" + get("day");
  const result = await post("/api/ai/chat", {
    message: "Paano po kayo mag-book ng room?",
  });
  assert.equal(result.status, 200);
  assert.match(modelPrompts[0], new RegExp("Today at the resort in the Philippines \\(Asia/Manila\\) is " + date.replace(/-/g, "\\-")));
  assert.match(modelPrompts.at(-1), new RegExp("Current resort date: " + date.replace(/-/g, "\\-")));
  assert.match(modelPrompts.at(-1), /Never use old example dates/);
});

// Asking for two categories must not silently filter out rooms just because
// "cottage" also appears. The rates must come from the current mocked catalog.
test("AI compares rooms and cottages with their current independent catalog rates", async () => {
  catalogRows = [
    { ...exampleRoom, id: 80, room_name: "Current Test Room", category_name: "Room",
      day_price: 3000, overnight_price: 4500 },
    { ...exampleRoom, id: 81, room_name: "Current Test Cottage", category_name: "Cottage",
      day_price: 800, overnight_price: 1300 },
  ];
  const result = await post("/api/ai/chat", {
    message: "Ano po ang mga available na kwarto at cottage? Magkano po ang day tour?",
  });
  assert.equal(result.status, 200);
  assert.equal(queries.length, 1);
  assert.equal(result.body.mode, "verified_catalog_rates");
  assert.deepEqual(result.body.recommendation_cards.map(room => room.name),
    ["Current Test Room", "Current Test Cottage"]);
  assert.equal(result.body.recommendation_cards[0].day_price, 3000);
  assert.equal(result.body.recommendation_cards[1].day_price, 800);
  assert.match(result.body.reply, /Current Test Room: Day Tour ₱3,000\.00/);
  assert.match(result.body.reply, /Current Test Cottage: Day Tour ₱800\.00/);
  assert.equal(modelCalls, 0);
  assert.ok(result.body.recommendation_cards.every(room => room.availability_verified === false));
});

// Text chat and manual translation should keep the same polite Filipino tone,
// while preserving accommodation names and prices supplied by the source.
test("Tagalog replies and translations request consistently polite customer tone", async () => {
  const reply = await post("/api/ai/chat", {
    message: "Magkano po ang kwarto at paano mag-reserve?",
  });
  assert.equal(reply.status, 200);
  assert.equal(reply.body.mode, "concierge_booking");
  assert.match(reply.body.reply, /po\b/i);
  assert.match(reply.body.reply, /PayPal/);
  assert.match(reply.body.reply, /Family Room A: Day Tour ₱3,500\.00/);
  assert.equal(modelCalls, 0);
  modelPrompts = [];
  const translated = await post("/api/ai/translate", {
    text: "Your room costs PHP 3,000 for the day tour.",
  });
  assert.equal(translated.status, 200);
  assert.match(modelPrompts.at(-1), /Consistently use polite "po", "kayo", and "ninyo"/);
  assert.match(modelPrompts.at(-1), /Do not introduce outdated example dates/);
});


// Demo safety: payment-only follow-ups should use a known 50% policy, never
// the unrelated accommodation catalog, even with stale prior booking context.
test("Standard Taglish downpayment policy is returned locally even with stale context", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const result = await post("/api/ai/chat", {
    message: "Magkano po ang downpayment?",
    context: { intent: "ask_price", room_name: "Old Room", language_style: "taglish" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "policy_answer");
  assert.ok(["tagalog", "taglish"].includes(result.body.extracted_context.language_style));
  assert.match(result.body.reply, /50%/);
  assert.match(result.body.reply, /PayPal/);
  assert.match(result.body.reply, /(?:remaining|natitirang) 50%/i);
  assert.doesNotMatch(result.body.reply, /Family Room A|Old Room/);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.equal(queries.length, 0);
  assert.equal(modelCalls, 0);
});

test("Local policy answers Filipino paunang bayad without listing rooms", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const result = await post("/api/ai/chat", {
    message: "Magkano po ang paunang bayad?",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "policy_answer");
  assert.match(result.body.reply, /50%/);
  assert.match(result.body.reply, /PayPal/);
  assert.ok(["tagalog", "taglish"].includes(result.body.extracted_context.language_style));
  assert.equal(queries.length, 0);
  assert.equal(modelCalls, 0);
});

// A current verified room payment can be answered from SQL without Gemini.
// An injected 429 does not require calling the model or reverting to fallback.
test("Named cottage deposit is verified locally without Gemini even during quota outage", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  catalogRows = [
    { ...exampleRoom, id: 81, room_name: "Small Nipa Hut 2",
      category_name: "Cottage", day_price: 800, overnight_price: 900 },
    { ...exampleRoom, id: 82, room_name: "Small Nipa Hut 20",
      category_name: "Cottage", day_price: 1200 },
    { ...exampleRoom, id: 83, room_name: "TEST ROOM",
      category_name: "Cottage", day_price: 500 },
  ];
  const result = await post("/api/ai/chat", {
    message: "Magkano po ang day tour ng Small Nipa Hut 2? Paano po mag-book online at magkano ang downpayment?",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "verified_accommodation_payment");
  assert.equal(result.body.extracted_context.room_id, 81);
  assert.match(result.body.reply, /Small Nipa Hut 2/);
  assert.match(result.body.reply, /₱800\.00/);
  assert.match(result.body.reply, /₱400\.00/);
  assert.match(result.body.reply, /PayPal/);
  assert.match(result.body.reply, /entrance fees/i);
  assert.match(result.body.reply, /booking page/i);
  assert.doesNotMatch(result.body.reply, /Small Nipa Hut 20|TEST ROOM/);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.deepEqual(result.body.recommendation_cards, []);
  assert.equal(result.body.booking_preview, null);
  assert.equal(queries.length, 1);
  assert.ok(queries.every(q => /^SELECT\b/i.test(q.sql)));
  assert.equal(modelCalls, 0);
});

test("Focused payment never mistakes Nipa Hut 20 for Hut 2", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  catalogRows = [
    { ...exampleRoom, id: 81, room_name: "Small Nipa Hut 2",
      category_name: "Cottage", day_price: 800 },
    { ...exampleRoom, id: 82, room_name: "Small Nipa Hut 20",
      category_name: "Cottage", day_price: 1200 },
  ];
  const result = await post("/api/ai/chat", {
    message: "How much is the Small Nipa Hut 20 day tour downpayment?",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "verified_accommodation_payment");
  assert.equal(result.body.extracted_context.room_id, 82);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.match(result.body.reply, /Small Nipa Hut 20/);
  assert.match(result.body.reply, /₱1,200\.00/);
  assert.match(result.body.reply, /₱600\.00/);
  assert.doesNotMatch(result.body.reply, /Small Nipa Hut 2(?:\s|—|,|\.)/);
  assert.equal(result.body.booking_preview, null);
  assert.equal(queries.length, 1);
  assert.equal(modelCalls, 0);
});

test("Local policy answers plain English online booking deposit without SQL", async () => {
  injectedFailures = 1;
  injectedStatus = 429;
  const result = await post("/api/ai/chat", {
    message: "How much is the deposit for online reservations?",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "policy_answer");
  assert.match(result.body.reply, /50%/);
  assert.match(result.body.reply, /PayPal/);
  assert.deepEqual(result.body.catalog_recommendations, []);
  assert.equal(queries.length, 0);
  assert.equal(modelCalls, 0);
});


// Regression from the Nov 10 live test: Gemini previously withheld the known
// 50% policy, incorrectly saying the percentage would be confirmed later.
test("Observed English question gets correct fixed 50% policy using zero API calls", async () => {
  const result = await post("/api/ai/chat", {
    message: "What is the required downpayment for an online reservation at Arvic Seaside?",
    context: { payment_method: "paypal", language_style: "english", room_name: "Old Room" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "policy_answer");
  assert.match(result.body.reply, /50% of the final accommodation price/i);
  assert.match(result.body.reply, /entrance fee/i);
  assert.match(result.body.reply, /PayPal/i);
  assert.doesNotMatch(result.body.reply, /percentage.*confirmed|exact percentage.*booking page/i);
  assert.equal(queries.length, 0);
  assert.equal(modelCalls, 0);
  assert.equal(result.body.booking_preview, null);
});
test("Named cottage deposit quotes a fresh verified price without paid Gemini", async () => {
  catalogRows = [{ ...exampleRoom, id: 81, room_name: "Small Nipa Hut 2",
    category_name: "Cottage", day_price: 800 }];
  const result = await post("/api/ai/chat", {
    message: "How much is the Small Nipa Hut 2 day tour downpayment?",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "verified_accommodation_payment");
  assert.equal(result.body.extracted_context.room_id, 81);
  assert.match(result.body.reply, /₱800\.00/);
  assert.match(result.body.reply, /₱400\.00/);
  assert.match(result.body.reply, /booking(?:\/payment)? page/i);
  assert.equal(result.body.booking_preview, null);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 1);
  assert.ok(queries.every(q => /^SELECT\b/i.test(q.sql)));
});

test("Cancellation plus refund question is handled accurately without Gemini", async () => {
  const result = await post("/api/ai/chat", {
    message: "Can I cancel my booking and get a refund?",
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "policy_answer");
  assert.equal(result.body.policy_topic, "cancellationRefund");
  assert.match(result.body.reply, /1 day before check-in/);
  assert.match(result.body.reply, /manual|management/i);
  assert.doesNotMatch(result.body.reply, /automatic.*refund.*yes/i);
  assert.equal(queries.length, 0);
  assert.equal(modelCalls, 0);
});


// Stage 85-B verified resort policies must be correct, not inferred by Gemini.
// The answers do not query MySQL, change money or consume live API credits.
const policyAccuracyCases = [
  {
    name: "Refund policy avoids promising any refund",
    question: "What is the refund policy?",
    topic: "refund", response: /not processed automatically/i,
    verify: /resort management/i,
  },
  {
    name: "Cancellation requires one day and pending/approved",
    question: "How do I cancel my reservation?",
    topic: "cancellation", response: /pending or approved/i,
    verify: /at least 1 day before check-in/i,
  },
  {
    name: "Taglish cancellation stays polite and gives the actual rule",
    question: "Pwede po ba mag-cancel ng booking?",
    voice_language: "taglish",
    topic: "cancellation", response: /po/,
    verify: /at least 1 day before check-in/i,
  },
  {
    name: "Entrance fees are separate and not a fixed price",
    question: "How much is the entrance fee?",
    topic: "entrance", response: /separate from the accommodation downpayment/i,
    verify: /estimate/i,
  },
  {
    name: "Tagalog entrance fee does not invent pesos",
    question: "Magkano ang entrance fee?",
    topic: "entrance", response: /(?:Hiwalay|Separate) po/i,
    verify: /Front Desk/i,
  },
  {
    name: "Walk-in guidance never guarantees accommodation availability",
    question: "Do you accept walk-ins?",
    topic: "walkin", response: /subject to availability/i,
    verify: /Front Desk/i,
  },
  {
    name: "Taglish walk-in is same-day and onsite",
    question: "Pwede po ba mag walk in?",
    topic: "walkin", response: /same-day/i,
    verify: /(?:Onsite po|Sa Front Desk po ang accommodation payment)/i,
  },
  {
    name: "AI never claims that chat confirms a reservation",
    question: "Can you confirm my reservation?",
    topic: "booking", response: /cannot confirm or pay for a reservation in chat/i,
    verify: /booking page/i,
  },
];
for (const testCase of policyAccuracyCases) {
  test("Policy accuracy: " + testCase.name, async () => {
    const result = await post("/api/ai/chat", {
      message: testCase.question,
      ...(testCase.voice_language ? { voice_language: testCase.voice_language } : {}),
      context: { room_name: "Old Room", language_style: "english" },
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.mode, "policy_answer");
    assert.equal(result.body.policy_topic, testCase.topic);
    assert.match(result.body.reply, testCase.response);
    assert.match(result.body.reply, testCase.verify);
    assert.equal(result.body.booking_preview, null);
    assert.deepEqual(result.body.catalog_recommendations, []);
    assert.equal(queries.length, 0);
    assert.equal(modelCalls, 0);
  });
}

test("A named accommodation keeps fresh database lookups rather than generic policy", async () => {
  const result = await post("/api/ai/chat", {
    message: "How much is the entrance fee for Small Nipa Hut 2?",
  });
  assert.equal(result.status, 200);
  assert.notEqual(result.body.mode, "policy_answer");
  assert.ok(modelCalls >= 1);
});

test("A customer-specific refund amount is not guessed by generic policy", async () => {
  const result = await post("/api/ai/chat", {
    message: "How much is the refund for booking 45332?",
  });
  assert.equal(result.status, 200);
  assert.notEqual(result.body.mode, "policy_answer");
  assert.ok(modelCalls >= 1);
});

test("General policy facts are embedded in Gemini prompt for non-FAQ conversations", async () => {
  const result = await post("/api/ai/chat", {
    message: "I need help planning a family trip. Please explain the basics.",
  });
  assert.equal(result.status, 200);
  assert.ok(modelCalls >= 1);
  assert.match(modelPrompts.at(-1), /Automated refunds and dispute decisions are outside the current system scope/);
  assert.match(modelPrompts.at(-1), /Customers may cancel their own pending\/approved reservations/);
  assert.match(modelPrompts.at(-1), /Entrance fees are separate/);
});


test("Spanish cancellation FAQ overrides stale English preference without Gemini", async () => {
  const result = await post("/api/ai/chat", {
    message: "¿Puedo cancelar mi reserva?",
    context: { language_style: "english" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "policy_answer");
  assert.equal(result.body.policy_topic, "cancellation");
  assert.equal(result.body.extracted_context.language_style, "spanish");
  assert.match(result.body.reply, /al menos un día/i);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

test("Mandarin refund FAQ overrides stale English preference without Gemini", async () => {
  const result = await post("/api/ai/chat", {
    message: "退款怎么办？",
    context: { language_style: "english" },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.mode, "policy_answer");
  assert.equal(result.body.policy_topic, "refund");
  assert.equal(result.body.extracted_context.language_style, "mandarin");
  assert.match(result.body.reply, /不会自动退款/);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});


// Stage 85-C: invalid explicit dates must not silently move to the next year.
// No MySQL availability query and no paid final response for an invalid window.
test("Past explicit year never rolls forward to create a misleading AI booking preview", async () => {
  const r = await post("/api/ai/chat", {
    ...futureContext,
    check_in: "2025-11-10",
    check_out: "2025-11-10",
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.mode, "invalid_window");
  assert.equal(r.body.reason, "PAST_DATE");
  assert.equal(r.body.extracted_context.check_in, "2025-11-10");
  assert.deepEqual(r.body.matched_rooms, []);
  assert.equal(r.body.booking_preview, null);
  assert.equal(queries.length, 0);
  assert.ok(modelCalls <= 1); // at most intent extraction; no final Gemini call
});
test("Impossible February 30 is rejected without querying availability", async () => {
  const r = await post("/api/ai/chat", {
    ...futureContext,
    check_in: "2099-02-30",
    check_out: "2099-03-01",
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.mode, "invalid_window");
  assert.equal(r.body.reason, "INVALID_DATE_TIME");
  assert.equal(r.body.booking_preview, null);
  assert.equal(queries.length, 0);
});
test("Reversed same-day window returns an actionable invalid-window response", async () => {
  const r = await post("/api/ai/chat", {
    ...futureContext,
    check_in_time: "17:00:00",
    check_out_time: "07:00:00",
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.mode, "invalid_window");
  assert.equal(r.body.reason, "INVALID_ORDER");
  assert.equal(r.body.booking_preview, null);
  assert.equal(queries.length, 0);
});
test("Valid future overnight window continues fresh reservation availability lookup", async () => {
  const r = await post("/api/ai/chat", {
    ...futureContext,
    check_in: "2099-04-10", check_out: "2099-04-11",
    check_in_time: "19:00:00", check_out_time: "05:00:00",
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.booking_preview.room_id, 61);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /NOT EXISTS/);
  assert.deepEqual(queries[0].params,
    [3, "2099-04-11", "05:00:00", "2099-04-10", "19:00:00"]);
});


test("Missing accommodation prices are not misrepresented as free PHP 0.00", async () => {
  catalogRows = [{
    ...exampleRoom,
    day_price: null, overnight_price: 0, extended_price: "not set",
  }];
  const r = await post("/api/ai/chat", {
    message: "What room rates do you offer?",
  });
  assert.equal(r.status, 200);
  assert.equal(queries.length, 1);
  assert.equal(r.body.mode, "verified_catalog_rates");
  assert.match(r.body.reply, /Day Tour not listed/i);
  assert.match(r.body.reply, /Overnight not listed/i);
  assert.match(r.body.reply, /Extended not listed/i);
  assert.doesNotMatch(r.body.reply, /₱0\.00/);
  assert.equal(modelCalls, 0);
});

test("Fresh positive accommodation rate stays numerically exact in AI prompt", async () => {
  catalogRows = [{
    ...exampleRoom,
    day_price: 3500, overnight_price: 4300, extended_price: 5000,
  }];
  const r = await post("/api/ai/chat", {
    message: "What room rates do you offer?",
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.mode, "verified_catalog_rates");
  assert.match(r.body.reply, /Day Tour ₱3,500\.00/);
  assert.match(r.body.reply, /Overnight ₱4,300\.00/);
  assert.match(r.body.reply, /Extended ₱5,000\.00/);
  assert.equal(modelCalls, 0);
});


// Stage AI-RESORT-01: all of these are real HTTP-handler tests with fake
// Gemini/MySQL fixtures, so routing regressions cannot hide behind unit tests.
test("Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls", async () => {
  const r = await post("/api/ai/chat", {
    message: "Magkano po parking fee para sa van?",
    context: {room_id: 61, room_name: "Family Room A", language_style: "taglish"},
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.mode, "verified_resort_inquiry");
  assert.equal(r.body.inquiry_topic, "parking");
  assert.match(r.body.reply, /free parking|Walang parking fee|libreng paradahan/i);
  assert.deepEqual(r.body.recommendation_cards, []);
  assert.equal(r.body.extracted_context.room_id, 61, "should preserve focus without using it for parking");
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

// AI-LIVE-01: A van or bus is covered by the owner-confirmed free parking
// policy. This exact question must NEVER reach Gemini, an SQL lookup, or a
// speculative "check whether your vehicle will fit" reply.
test("Actual customer van/bus parking question uses verified zero-credit FAQ", async () => {
  const r = await post("/api/ai/chat", {
    message: "May parking po ba kayo? Libre ba kahit van o bus?",
    context: { room_id: 61, room_name: "Family Room A", language_style: "english" },
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.mode, "verified_resort_inquiry");
  assert.equal(r.body.inquiry_topic, "parking");
  assert.equal(r.body.extracted_context.room_id, 61);
  assert.match(r.body.reply, /free parking|libreng paradahan/i);
  assert.match(r.body.reply, /van/i);
  assert.match(r.body.reply, /bus/i);
  assert.match(r.body.reply, /Walang parking fee|libreng paradahan/i);
  assert.doesNotMatch(r.body.reply, /check|confirm|kasya|capacity|available slot/i);
  assert.deepEqual(r.body.recommendation_cards, []);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

test("Parking + entrance question explains fee distinction without room suggestions", async () => {
  const r = await post("/api/ai/chat", {
    message: "May parking ba at libre rin ba entrance?",
    voice_language: "taglish",
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.mode, "verified_resort_inquiry");
  assert.equal(r.body.inquiry_topic, "parkingEntrance");
  assert.match(r.body.reply, /(?:Free po ang parking|Libre po ang paradahan)/i);
  assert.match(r.body.reply, /Separate naman po ang entrance fee|Hiwalay po ang entrance fee/i);
  assert.deepEqual(r.body.recommendation_cards, []);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

test("Multi-facility resort question stays grounded with read-only catalog SQL", async () => {
  const r = await post("/api/ai/chat", {
    message: "What facilities does the resort have, including any parking?",
  });
  assert.equal(r.status, 200);
  assert.notEqual(r.body.mode, "verified_resort_inquiry");
  // The broader facilities question may read one fresh accommodation
  // catalog in addition to resort policy knowledge. Enforce read-only SQL;
  // it must not treat the result as a confirmed room booking slot.
  assert.equal(queries.length, 1);
  assert.ok(queries.every(q => /^SELECT\b/i.test(q.sql)));
  assert.equal(r.body.booking_preview, null);
  assert.ok(modelCalls > 0);
  assert.match(modelPrompts.at(-1), /FREE on-site parking for ANY type of vehicle/);
  assert.match(modelPrompts.at(-1), /Animals and pets are NOT ALLOWED/);
  assert.match(modelPrompts.at(-1), /NO CORKAGE FEE/);
});

test("Client-verified Wi-Fi, no pets and outside food policies use zero credits", async () => {
  for (const [message,mode,fact] of [
    ["May WiFi ba kayo?","verified_guest_policies",/(?:room|kuwarto)/i],
    ["Pet-friendly ba kayo?","verified_pet_policy",/bawal|not allowed|hindi.*pet.friendly/i],
    ["Pwede outside food?","verified_guest_policies",/puwede|pwede|maaari|allowed|may bring/i],
  ]) {
    const r = await post("/api/ai/chat", { message, voice_language: "taglish" });
    assert.equal(r.status, 200, message);
    assert.equal(r.body.mode, mode, message);
    assert.match(r.body.reply, fact, message);
    assert.deepEqual(r.body.recommendation_cards, []);
  }
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 0);
});

test("Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy", async () => {
  const r = await post("/api/ai/chat", {
    message: "May WiFi dito?", voice_language: "taglish",
    context: { room_id: 61, room_name: "Family Room A" }
  });
  assert.equal(r.status, 200);
  assert.equal(r.body.mode, "verified_guest_policies");
  assert.match(r.body.reply, /rooms?|kuwarto/i);
  assert.match(r.body.reply, /free|libreng?/i);
  assert.equal(r.body.extracted_context.room_id, 61);
  assert.equal(modelCalls, 0);
});


test("AI-40 Ask About This returns verified facts for every selected accommodation type", async () => {
  catalogRows = [
    { ...exampleRoom, id: 71, room_name: "Double Room 1",
      category_name: "Room", capacity: 7, description: "",
      amenities: "", day_price: 4000, overnight_price: 4000,
      extended_price: null, free_entrance_pax: null },
    { ...exampleRoom, id: 72, room_name: "Family Room A",
      category_name: "Room", capacity: 7, description: "Two-bedroom family room",
      amenities: "Private CR, Air conditioned",
      day_price: 3500, overnight_price: 4500, free_entrance_pax: 2 },
    { ...exampleRoom, id: 73, room_name: "Big Nipa Hut 1",
      category_name: "Cottage", capacity: 20, description: "",
      amenities: "", day_price: 900, overnight_price: 1200 },
    { ...exampleRoom, id: 74, room_name: "Function Area A",
      category_name: "Function Area", capacity: 50, description: "Event venue",
      amenities: "", day_price: 7000, overnight_price: 8000 },
    { ...exampleRoom, id: 75, room_name: "Single Room Cottage 1",
      category_name: "Room", capacity: 4, description: "Near the cottages",
      amenities: "Air conditioned, Private CR", day_price: 3000,
      overnight_price: 3300 },
  ];
  for (const room of catalogRows) {
    const response = await post("/api/ai/chat", {
      message: "Tell me more about " + room.room_name + ".",
      context: { room_id: room.id, room_name: room.room_name, language_style: "taglish" },
    });
    assert.equal(response.status, 200, room.room_name);
    assert.equal(response.body.mode, "verified_accommodation_overview", room.room_name);
    assert.equal(response.body.extracted_context.room_id, room.id);
    assert.equal(response.body.extracted_context.room_name, room.room_name);
    assert.ok(response.body.reply.includes(room.room_name), room.room_name);
    assert.match(response.body.reply, new RegExp(String(room.capacity) + " guests"));
    assert.match(response.body.reply, /₱/);
    assert.doesNotMatch(response.body.reply, /Description:|Listed amenities:|Listed rates:/i);
    assert.ok(response.body.reply.includes(
      Number(room.day_price).toLocaleString("en-PH")), room.room_name);
    assert.doesNotMatch(response.body.reply,
      /availability (?:is|has been) confirmed|guaranteed booking/i);
  }
  // Mocked SQL must read the exact clicked ID only; not the old selected
  // recommendation, an unrelated first room, or an arbitrary Gemini answer.
  assert.equal(queries.length, catalogRows.length);
  assert.ok(queries.every(q => /WHERE a\.id = \? LIMIT 1/i.test(q.sql)));
  assert.deepEqual(queries.map(q => Number(q.params[0])),
    catalogRows.map(room => room.id));
  assert.equal(modelCalls, 0);
});

test("AI-40 empty amenities still return capacity and rates, not only a Front Desk referral", async () => {
  catalogRows = [
    { ...exampleRoom, id: 71, room_name: "Double Room 1",
      category_name: "Room", capacity: 7, description: "", amenities: "",
      day_price: 4000, overnight_price: 4000, free_entrance_pax: null },
    { ...exampleRoom, id: 72, room_name: "Other Private Room",
      description: "Private pool and a balcony", amenities: "Karaoke",
      day_price: 9999, overnight_price: 9999 },
  ];
  const response = await post("/api/ai/chat", {
    message: "Tell me more about Double Room 1.",
    context: { room_id: 71, room_name: "Double Room 1" },
  });
  assert.equal(response.body.mode, "verified_accommodation_overview");
  assert.match(response.body.reply, /Double Room 1/);
  assert.match(response.body.reply, /7 guests/);
  assert.match(response.body.reply, /4,000/);
  assert.match(response.body.reply, /amenities aren't specified yet/i);
  assert.doesNotMatch(response.body.reply, /Private pool|balcony|Karaoke|9,999/i);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 1);
});

test("AI-40 stale selected room IDs and renamed listings are not silently described", async () => {
  catalogRows = [{ ...exampleRoom, id: 80, room_name: "Renamed Family Room",
    description: "Aircon and private CR", day_price: 6700 }];
  for (const [id, name] of [
    [80, "Old Family Room Name"],
    [5000, "Deleted Room"],
  ]) {
    const response = await post("/api/ai/chat", {
      message: "Tell me more about " + name + ".",
      context: { room_id: id, room_name: name },
    });
    assert.equal(response.body.mode, "accommodation_selection_needed");
    assert.match(response.body.reply, /select its latest card/i);
    assert.doesNotMatch(response.body.reply, /Aircon|private CR|6,700/i);
    assert.ok(!Object.hasOwn(response.body.extracted_context, "room_id"));
    assert.ok(!Object.hasOwn(response.body.extracted_context, "room_name"));
  }
  assert.equal(modelCalls, 0);
});


test("AI-41 Ask About This follows the visitor's genuine Taglish question, not card English", async () => {
  catalogRows = [{ ...exampleRoom, id: 71, room_name: "Family Room A",
    category_name: "Room", capacity: 7,
    description: "Room accommodation for 3-7 pax",
    amenities: "Private Cottage, Living Room, Kitchen, Private CR, 2 Separate Bedrooms, Air Conditioner in Each Bedroom, Cabinets in Each Bedroom",
    day_price: 3500, overnight_price: 3500, extended_price: 6000,
    free_entrance_pax: 3 }];
  const response = await post("/api/ai/chat", {
    message: "Tell me more about Family Room A.",
    context: { room_id: 71, room_name: "Family Room A", language_style: "english" },
    recent_turns: [
      { role: "user", text: "anong room ang pwede sa 7 na tao" },
      { role: "assistant", text: "Ito po yung mga room na good for 7 guests." },
    ],
  });
  assert.equal(response.body.mode, "verified_accommodation_overview");
  assert.match(response.body.reply, /^Yung Family Room A po, good for up to 7 guests\./);
  assert.match(response.body.reply, /sariling CR/i);
  assert.match(response.body.reply, /2 bedrooms na parehong may aircon at cabinets/i);
  assert.match(response.body.reply, /₱3,500 po for Day Tour or Night/);
  assert.match(response.body.reply, /₱6,000 for Extended/);
  assert.match(response.body.reply, /free entrance din po for 3 guests/);
  assert.doesNotMatch(response.body.reply,
    /Description:|Listed amenities:|Listed rates:|Room accommodation for 3-7 pax/i);
  assert.ok(response.body.reply.length < 480, "A card overview should be conversational, not an inventory dump");
  assert.equal(modelCalls, 0, "Verified overview should not spend Gemini tokens");
  assert.equal(queries.length, 1);
});

test("AI-44 clicked room description uses guest English for both text and voice", async () => {
  catalogRows = [{ ...exampleRoom, id: 72, room_name: "Double Room 2",
    category_name: "Room", capacity: 7, description: "",
    amenities: "", day_price: 4000, overnight_price: 4000 }];
  const payload = {
    message: "Tell me more about Double Room 2.",
    context: { room_id: 72, room_name: "Double Room 2", language_style: "taglish" },
    recent_turns: [{ role: "user", text: "Which rooms can accommodate seven guests?" }],
  };
  const english = await post("/api/ai/chat", payload);
  assert.equal(english.body.mode, "verified_accommodation_overview");
  assert.match(english.body.reply, /^Double Room 2 can accommodate up to 7 guests\./);
  assert.match(english.body.reply, /both ₱4,000/);
  assert.match(english.body.reply, /amenities aren't specified yet/i);
  assert.doesNotMatch(english.body.reply, /private CR|aircon|balcony/i);
  const voice = await post("/api/ai/chat", {
    ...payload, input_source: "voice",
  });
  assert.match(voice.body.reply, /^Double Room 2 can accommodate up to 7 guests/);
  assert.equal(modelCalls, 0);
  assert.equal(queries.length, 2);
});


test("AI-44 Mandarin pinyin greeting is answered in Chinese with no model call", async () => {
  const oldCalls = modelCalls;
  const oldQueries = queries.length;
  const response = await post("/api/ai/chat", { message: "ni hao ma?" });
  assert.equal(response.status, 200);
  assert.equal(response.body.mode, "resort_greeting");
  assert.equal(response.body.extracted_context.language_style, "mandarin");
  assert.match(response.body.reply, /你好/);
  assert.match(response.body.reply, /Arvic Seaside Resort/);
  assert.doesNotMatch(response.body.reply, /Resort inquiries lang|questions regarding/i);
  assert.equal(modelCalls, oldCalls);
  assert.equal(queries.length, oldQueries);
});

test("AI-111 explicit cottage amenity question overrides previous room", async () => {
  catalogRows = [
    {...exampleRoom,id:99,room_name:"Family Room A",category_name:"Room",amenities:"Private CR, aircon"},
    {...exampleRoom,id:103,room_name:"Small Nipa Hut 3",category_name:"Cottage",amenities:"",description:"Open cottage"},
    {...exampleRoom,id:130,room_name:"Small Nipa Hut 30",category_name:"Cottage",amenities:""},
  ];
  const first = await post("/api/ai/chat",{
    message:"May aircon at sariling CR ba ang Small Nipa Hut 3?",
    context:{room_id:99,room_name:"Family Room A",language_style:"taglish"}
  });
  assert.equal(first.status,200);
  assert.equal(first.body.mode,"verified_accommodation_amenity");
  assert.equal(first.body.extracted_context.room_id,103);
  assert.match(first.body.reply,/Small Nipa Hut 3\b/i);
  assert.match(first.body.reply,/walang|wala/i);
  assert.doesNotMatch(first.body.reply,/Family Room A|Small Nipa Hut 30/);
  const second = await post("/api/ai/chat",{
    message:"May aircon ba siya?",context:first.body.extracted_context
  });
  assert.equal(second.body.extracted_context.room_id,103);
  assert.match(second.body.reply,/Wala/i);
});


test("FINAL-B1 bedroom and bed counts plus amenities override old accommodation focus", async () => {
  catalogRows = [
    {...exampleRoom,id:99,room_name:"Family Room A",amenities:"Private Cottage\n2 Separate Bedrooms\n2 Queen-Size Beds\nPrivate CR"},
    {...exampleRoom,id:97,room_name:"Double Room 1",description:"",amenities:"2 Separate Bedrooms\n2 Queen Size Beds (1 per Bedroom)\nKitchen\nPrivate CR"},
    {...exampleRoom,id:98,room_name:"Double Room 2",amenities:"Kitchen"},
  ];
  const first = await post("/api/ai/chat", {
    message:"What about Double Room 1? How many bedrooms and beds does it have? Does it also have a kitchen and private bathroom?",
    room_id:99,guests:15,context:{room_id:99,room_name:"Family Room A",guests:6,language_style:"taglish"},
  });
  assert.equal(first.status,200);
  assert.equal(first.body.mode,"verified_accommodation_amenity");
  assert.equal(first.body.extracted_context.room_id,97);
  assert.equal(first.body.extracted_context.language_style,"english");
  assert.match(first.body.reply,/2 bedrooms/i);
  assert.match(first.body.reply,/2 Queen Size Beds \(1 per Bedroom\)/i);
  assert.match(first.body.reply,/kitchen/i);
  assert.match(first.body.reply,/private bathroom/i);
  assert.doesNotMatch(first.body.reply,/Family Room A|2 double rooms listed|Private Cottage/i);
  assert.equal(modelCalls,0);
  assert.equal(queries.length,1);
  assert.doesNotMatch(queries[0].sql,/COUNT\(\*\)/i);
  const second = await post("/api/ai/chat", {
    message:"How many bedrooms does it have?",context:first.body.extracted_context,
  });
  assert.equal(second.status,200);
  assert.equal(second.body.mode,"verified_accommodation_amenity");
  assert.match(second.body.reply,/2 bedrooms/i);
  assert.equal(second.body.extracted_context.room_id,97);
});

test("FINAL-B1 structural counts remain distinct from inventory counts", () => {
  const {matchAccommodationCountQuestion} = require("../controllers/ai/aiAccommodationCounts");
  const {requestedAmenities, multiAmenityReply} = require("../controllers/ai/aiAccommodationAmenities");
  assert.equal(matchAccommodationCountQuestion("How many double rooms do you have?").subtype,"double");
  assert.equal(matchAccommodationCountQuestion("Ilang rooms meron kayo?").scopes[0],"room");
  for(const q of ["How many bedrooms does Double Room 1 have?","Ilang kama meron sa Family Room A?","How many beds and bedrooms does Double Room 1 have?"]) {
    assert.equal(matchAccommodationCountQuestion(q),null,q);
  }
  assert.deepEqual(requestedAmenities("How many bedrooms and beds does it have?"),["bedrooms","beds"]);
  assert.deepEqual(requestedAmenities("Ilang kama at bedrooms meron sa Family Room A?"),["bedrooms","beds"]);
  assert.match(multiAmenityReply({room_name:"Test Room",category_name:"Room",amenities:"2 Queen Size Beds (1 per Bedroom)"},["bedrooms","beds"],"english"),/does not confirm the exact bedroom count/i);
  assert.match(multiAmenityReply({room_name:"Test Room",category_name:"Room",amenities:"2 Separate Bedrooms"},["bedrooms","beds"],"english"),/does not confirm the exact bed count/i);
});


test("FINAL-B2 cottage switch answers every requested amenity including bed presence", async () => {
  catalogRows = [
    {...exampleRoom,id:97,room_name:"Double Room 1",category_name:"Room",amenities:"2 Queen Size Beds\nPrivate CR\nAircon\nRefrigerator"},
    {...exampleRoom,id:103,room_name:"Small Nipa Hut 3",category_name:"Cottage",description:"Open cottage",amenities:""},
  ];
  const result = await post("/api/ai/chat", {
    message:"Paano naman yung Small Nipa Hut 3? May sarili ba itong CR, aircon, refrigerator at kama?",
    context:{room_id:97,room_name:"Double Room 1",language_style:"english"},
  });
  assert.equal(result.status,200);
  assert.equal(result.body.mode,"verified_accommodation_amenity");
  assert.equal(result.body.extracted_context.room_id,103);
  assert.equal(result.body.extracted_context.language_style,"taglish");
  assert.match(result.body.reply,/wala pong included na kama/i);
  assert.match(result.body.reply,/CR/i);
  assert.match(result.body.reply,/aircon/i);
  assert.match(result.body.reply,/ref/i);
  assert.doesNotMatch(result.body.reply,/Double Room 1|Queen Size Beds/i);
  assert.equal(modelCalls,0);
});


test("FINAL-D1 voice recommendation with rate uses guest count and overnight pricing", async () => {
  catalogRows=[
    {...exampleRoom,id:1,room_name:"Small Room",category_name:"Room",capacity:2,overnight_price:900},
    {...exampleRoom,id:2,room_name:"Day Only Room",category_name:"Room",capacity:4,overnight_price:0},
    {...exampleRoom,id:3,room_name:"Single Room Cottage 1",category_name:"Room",capacity:4,overnight_price:3000},
    {...exampleRoom,id:4,room_name:"Family Room A",category_name:"Room",capacity:7,overnight_price:3500},
    {...exampleRoom,id:5,room_name:"Small Nipa Hut 3",category_name:"Cottage",capacity:6,overnight_price:800},
    {...exampleRoom,id:6,room_name:"Maintenance Room",category_name:"Room",capacity:4,overnight_price:1000,status:"maintenance"}
  ];
  const result=await post("/api/ai/chat",{
    message:"Hello, apat kami na mag-overnight. Anong room ang ma-recommend mo at magkano?",
    input_source:"voice"
  });
  assert.equal(result.status,200);
  assert.equal(result.body.mode,"verified_personalized_rates");
  assert.equal(result.body.extracted_context.guests,4);
  assert.equal(result.body.extracted_context.slot_preference,"night");
  assert.deepEqual(result.body.recommendation_cards.map(r=>Number(r.id)),[3,4]);
  assert.match(result.body.reply,/Single Room Cottage 1.*₱3,000\.00.*Overnight/i);
  assert.doesNotMatch(result.body.reply,/Small Room|Day Only Room|Maintenance Room|Small Nipa Hut/);
  assert.ok(result.body.recommendation_cards.every(r=>r.availability_verified===false));
  assert.equal(modelCalls,0);
  assert.equal(queries.length,1);
});


test("FINAL-D2 mixed private bathroom and free Wi-Fi follow-up keeps verified room context",async()=>{
  catalogRows=[
    {...exampleRoom,id:86,room_name:"Single Room Cottage 1",category_name:"Room",description:"",amenities:"Private CR\nAircon"},
    {...exampleRoom,id:103,room_name:"Small Nipa Hut 3",category_name:"Cottage",description:"",amenities:""}
  ];
  const first=await post("/api/ai/chat",{message:"Does Single Room Cottage 1 have air conditioning?",input_source:"voice",context:{language_style:"taglish"}});
  assert.equal(first.status,200);
  assert.equal(first.body.extracted_context.room_id,86);
  const second=await post("/api/ai/chat",{message:"Does it have a private bathroom and free Wi-Fi too?",input_source:"voice",context:first.body.extracted_context});
  assert.equal(second.status,200);
  assert.equal(second.body.mode,"verified_accommodation_amenity");
  assert.equal(second.body.extracted_context.room_id,86);
  assert.equal(second.body.extracted_context.language_style,"english");
  assert.match(second.body.reply,/Single Room Cottage 1 has a private bathroom/i);
  assert.match(second.body.reply,/free Wi-Fi is available in resort rooms/i);
  assert.equal(modelCalls,0);
  assert.equal(queries.length,2);
  const third=await post("/api/ai/chat",{message:"Does Small Nipa Hut 3 have air conditioning and free Wi-Fi?",context:second.body.extracted_context});
  assert.equal(third.status,200);
  assert.equal(third.body.extracted_context.room_id,103);
  assert.match(third.body.reply,/Small Nipa Hut 3 does not include amenities/i);
  assert.match(third.body.reply,/not in cottages/i);
  assert.doesNotMatch(third.body.reply,/Single Room Cottage 1/i);
  assert.equal(modelCalls,0);
});
test("FINAL-D2 mixed policy and amenity questions never invent stale or ambiguous room details",async()=>{
  catalogRows=[{...exampleRoom,id:86,room_name:"Single Room Cottage 1",category_name:"Room",amenities:"Private CR"}];
  const result=await post("/api/ai/chat",{message:"Does it have a private bathroom and free Wi-Fi too?",context:{room_id:86,room_name:"Old Room Name",language_style:"english"}});
  assert.equal(result.status,200);
  assert.equal(result.body.mode,"accommodation_selection_needed");
  assert.match(result.body.reply,/free Wi-Fi/i);
  assert.match(result.body.reply,/which accommodation/i);
  assert.doesNotMatch(result.body.reply,/has a private bathroom/i);
  assert.equal(modelCalls,0);
});
