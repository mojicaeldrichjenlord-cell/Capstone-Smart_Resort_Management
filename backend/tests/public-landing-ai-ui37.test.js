"use strict";
/*
 * UI-37: Public landing AI inquiry regression (no Gemini calls or secrets).
 * Shared resort answers remain available without login, but no booking or
 * customer-specific chat state is exposed by this public widget.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const landing = read("frontend/customerHTML/landing.html");
const home = read("frontend/customerHTML/index.html");
const chat = read("frontend/js/ai-chat.js");
const aiRoutes = read("backend/routes/aiRoutes.js");

test("UI-37 public landing includes a complete accessible AI chat widget", () => {
  assert.match(landing, /data-ai-chat-surface="public"/);
  for (const id of ["aiChatToggle", "aiChatWindow", "aiChatMessages",
                    "aiChatInput", "aiSendBtn", "aiNewChatBtn",
                    "aiChatMaximize", "aiChatClose"]) {
    assert.match(landing, new RegExp('id="' + id + '"'), "Missing " + id);
  }
  assert.match(landing, /Ask about our resort · No login required/);
  assert.match(landing, /sharedCSS\/ai-chat-layout\.css/);
  assert.match(landing, /sharedCSS\/ai-chat-airy\.css/);
  assert.match(landing, /sharedCSS\/ai-recommendations\.css/);
  assert.match(landing, /sharedJS\/api-config\.js/);
  assert.match(landing, /js\/ai-chat\.js/);
  assert.match(landing, /js\/ai-chat-polish\.js/);
  assert.doesNotMatch(landing, /id="aiMicBtn"|js\/ai-voice\.js/);
  assert.doesNotMatch(landing, /customerJS\/index\.js/);
  assert.match(home, /id="aiChatWindow"/);
});

test("UI-37 guest greeting and stored chat are isolated from customer Home", () => {
  assert.match(chat, /document\.body\?\.dataset\.aiChatSurface === "public"/);
  assert.match(chat, /arvic_public_ai_context_v1/);
  assert.match(chat, /arvic_public_ai_chat_history_v1/);
  assert.match(chat, /arvic_public_ai_window_state_v1/);
  assert.match(chat, /smartresort_ai_chat_history_v1/);
  assert.match(chat, /AI_IS_PUBLIC_LANDING\s*\?\s*"Welcome po sa Arvic Seaside/);
  assert.match(chat, /"Hi po! Anong accommodation o booking details/);
  // The guest welcome is DOM-only and cannot accidentally invoke Gemini on page load.
  assert.match(chat, /appendAiMessage\(\s*"assistant",[\s\S]*?AI_IS_PUBLIC_LANDING[\s\S]*?false\s*\);/);
});

test("UI-37 public accommodations can be discussed but booking links require login", () => {
  assert.match(chat, /if \(AI_IS_PUBLIC_LANDING\) return "\.\.\/authHTML\/login\.html"/);
  assert.match(chat, /AI_IS_PUBLIC_LANDING \? "Login to Book" : "Book This"/);
  assert.match(chat, /AI_IS_PUBLIC_LANDING \? "Login for Details" : "View Details"/);
  assert.match(chat, /function createBookingFromPreview[\s\S]*?if \(AI_IS_PUBLIC_LANDING\) \{[\s\S]*?window\.location\.href = "\.\.\/authHTML\/login\.html";/);
  assert.doesNotMatch(landing, /id="customerToken"/);
});

test("UI-37 existing public chat keeps server-side scope, payload and credit guards", () => {
  assert.match(aiRoutes, /router\.post\("\/chat", limitAiPayload\("chat"\), aiRateGuard\.middleware, chatWithGemini\)/);
  assert.doesNotMatch(aiRoutes, /router\.post\("\/chat", requireCustomerAuth/);
  assert.match(aiRoutes, /router\.post\("\/create-booking"[\s\S]*?res\.status\(410\)/);
  assert.match(aiRoutes, /router\.post\("\/voice", requireCustomerAuth/);
  assert.match(aiRoutes, /router\.post\("\/transcribe", requireCustomerAuth/);
});
