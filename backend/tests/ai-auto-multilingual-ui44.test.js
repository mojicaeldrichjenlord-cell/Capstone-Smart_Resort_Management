"use strict";
/* AI-44: Static multilingual UI safety checks; no network, mic, key or DB. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const voice = read("frontend/js/ai-voice.js");
const chat = read("frontend/js/ai-chat.js");
const speech = read("backend/controllers/ai/geminiSpeechController.js");
const backend = read("backend/controllers/ai/geminiChatController.js");
const scope = read("backend/controllers/ai/aiResortScopeGuard.js");

test("AI-44 customer voice has no manual language selector or persisted language setting", () => {
  assert.doesNotThrow(() => new vm.Script(voice));
  assert.doesNotThrow(() => new vm.Script(chat));
  assert.doesNotMatch(voice, /<select id="aiVoiceLanguage"/);
  assert.doesNotMatch(voice, /localStorage\.setItem\(KEY,\s*language\)/);
  assert.match(voice, /Automatic language detection/);
  assert.match(voice, /X-Arvic-Voice-Language": "auto"/);
  assert.match(voice, /if \(canRecord\(\) && !useBrowserFallback\) \{\s*return startRecordedInput\(kind\);/);
  assert.match(voice, /Browser microphone fallback: language recognition may be limited/);
});

test("AI-44 voice and text requests detect each utterance independently", () => {
  assert.match(chat, /input_source: "voice"/);
  assert.doesNotMatch(chat, /voice_language: window\.ArvicVoice/);
  assert.doesNotMatch(backend, /normalizeLanguageStyle\(req\.body\.voice_language\)/);
  assert.match(backend, /const isSpokenTurn = req\.body\.input_source === "voice"/);
  assert.match(backend, /if \(detectedLanguage\) mergedContext\.language_style = detectedLanguage/);
  assert.match(backend, /The CURRENT guest message controls reply language/);
});

test("AI-44 signed Gemini audio accepts mixed spoken languages without translating", () => {
  assert.match(speech, /Detect the spoken language automatically/);
  assert.match(speech, /Never translate into English/);
  assert.match(speech, /NO_SPEECH/);
  assert.doesNotMatch(speech, /Transcribe the speech faithfully in " \+ languageHint/);
});

test("AI-44 safe Romanized Mandarin greeting and multilingual resort guard", () => {
  assert.match(backend, /mode: "resort_greeting"/);
  assert.match(scope, /ni\\s\*hao/);
  assert.match(scope, /NON_RESORT_TASK/);
  assert.match(voice, /inferReplyLanguage\(content\)/);
  assert.match(voice, /getLocale\(\)\.tts/);
});

test("AI-44 all authenticated Customer pages load fresh voice implementation", () => {
  for (const page of ["index.html", "rooms.html", "booking.html",
    "my-bookings.html", "profile.html", "resort-map.html"]) {
    const html = read("frontend/customerHTML/" + page);
    assert.match(html, /ai-voice\.js\?v=20261127-qa127-release/, page);
    assert.match(html, /ai-voice\.css\?v=20261126-ai105-release/, page);
  }
  const landing = read("frontend/customerHTML/landing.html");
  assert.doesNotMatch(landing, /ai-voice\.js/);
});
