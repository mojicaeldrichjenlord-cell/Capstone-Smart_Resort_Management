// Static regression checks for the shared Customer AI chat widget.
// Does not call Gemini, Aiven, Render, Vercel, payments or the browser.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "../../frontend");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

const pages = [
  "index.html", "rooms.html", "booking.html",
  "resort-map.html", "my-bookings.html", "profile.html"
];

test("all six Customer pages load the same viewport-safe chat CSS", () => {
  for (const page of pages) {
    const html = read("customerHTML/" + page);
    const style = html.indexOf("ai-chat-layout.css");
    const voice = html.indexOf("ai-voice.css");
    const previews = html.indexOf("ai-recommendations.css");
    assert.ok(style > voice && style > previews, page + ": shared CSS last");
    assert.match(html, /ai-chat\.js/);
    assert.match(html, /ai-voice\.js/);
    assert.match(html, /ai-chat-polish\.js/);
    assert.ok(html.indexOf("ai-chat-polish.js") > html.indexOf("ai-voice.js"));
    assert.ok(html.indexOf("ai-chat.js") > html.indexOf("api-config.js"));
    if (page === "index.html" || page === "rooms.html") {
      assert.match(html, /id="aiChatWindow"/);
    } else {
      assert.match(html, /ai-chat-widget\.js/);
      assert.ok(html.indexOf("ai-chat-widget.js") < html.indexOf("ai-chat.js"));
    }
  }
});

test("shared CSS keeps header/input fixed and chat scrollable inside viewport", () => {
  const css = read("sharedCSS/ai-chat-layout.css");
  assert.match(css, /\.ai-chat-window\.show\s*\{\s*display:\s*flex/);
  assert.match(css, /\.ai-chat-window\.maximized\.show\s*\{\s*display:\s*flex/);
  assert.match(css, /height:\s*min\(625px,\s*calc\(100dvh\s*-\s*100px\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*560px\)/);
  assert.match(css, /ai-chat-messages[\s\S]*?min-height:\s*0/);
  assert.match(css, /overflow-y:\s*auto/);
  assert.match(css, /ai-chat-input-area[\s\S]*?flex:\s*0 0 auto/);
  assert.match(css, /\.ai-voice-panel\[hidden\]\s*\{\s*display:\s*none\s*!important/);
});

test("voice panel collapse does not modify voice implementation", () => {
  const polish = read("js/ai-chat-polish.js");
  const mount = read("js/ai-chat-widget.js");
  assert.match(polish, /aria-expanded/);
  assert.match(polish, /panel\.hidden\s*=\s*true/);
  assert.match(polish, /aiChatMinimize/);
  assert.match(polish, /stopConversation/);
  assert.match(mount, /if \(document\.getElementById\("aiChatWindow"\)/);
  assert.match(mount, /id="aiChatMessages"/);
  assert.match(mount, /id="aiSendBtn"/);
  assert.match(mount, /id="aiMicBtn"/);
  assert.doesNotMatch(polish, /fetch\s*\(/);
});

test("existing accommodation chat context and buttons remain present", () => {
  const room = read("customerJS/rooms.js");
  const chat = read("js/ai-chat.js");
  assert.match(room, /function openAiForRoom/);
  assert.match(room, /savedContext\.room_id\s*=\s*roomId/);
  assert.match(chat, /function setAiFocusedAccommodation/);
  assert.match(chat, /function appendAiRecommendationCards/);
  assert.match(chat, /View Details/);
  assert.match(chat, /Book This/);
  assert.match(chat, /Ask About This/);
  assert.match(chat, /ai-reply-actions/);
});
