"use strict";
/*
 * UI-38 — chat bubbles follow message content instead of spanning the
 * full conversation row. Shared by public Landing and Customer pages.
 * Static checks only; no Gemini API, database or live payments.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const css = read("frontend/sharedCSS/ai-chat-layout.css");
const js = read("frontend/js/ai-chat.js");

test("UI-38 conversation rows are flex columns with direction-aware alignment", () => {
  assert.match(css, /\.ai-chat-window \.ai-message\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;[^}]*align-items:\s*flex-start;/s);
  assert.match(css, /\.ai-chat-window \.ai-message\.user\s*\{[^}]*align-items:\s*flex-end;/s);
  assert.match(css, /\.ai-chat-window \.ai-message > \.ai-bubble\s*\{[^}]*width:\s*fit-content;/s);
  assert.match(css, /\.ai-chat-window \.ai-message > \.ai-bubble\s*\{[^}]*max-width:\s*min\(88%,\s*640px\);/s);
  assert.match(css, /\.ai-chat-window \.ai-message\.user > \.ai-bubble\s*\{[^}]*max-width:\s*min\(85%,\s*560px\);/s);
  assert.match(css, /\.ai-chat-window \.ai-message > \.ai-bubble\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
});

test("UI-38 reply actions and structured booking previews remain usable", () => {
  assert.match(css, /\.ai-chat-window \.ai-message\.assistant > \.ai-reply-actions\s*\{[^}]*align-self:\s*flex-start;/s);
  assert.match(css, /\.ai-chat-window \.ai-message\.assistant > \.ai-bubble:has\(\.ai-confirm-booking-btn\)\s*\{[^}]*width:\s*min\(100%,\s*430px\);/s);
  assert.match(js, /wrapper\.className = \`ai-message \$\{role\}\`/);
  assert.match(js, /wrapper\.appendChild\(bubble\)/);
  assert.match(js, /appendReplyActions\(wrapper, text\)/);
});

test("UI-38 fresh CSS is requested across Landing and all Customer chat pages", () => {
  for (const page of ["landing.html", "index.html", "rooms.html", "booking.html",
                      "resort-map.html", "my-bookings.html", "profile.html"]) {
    const html = read("frontend/customerHTML/" + page);
    assert.match(html, /ai-chat-layout\.css\?v=20261121-ui38/, page);
    assert.match(html, /ai-chat\.js/, page);
  }
  const landing = read("frontend/customerHTML/landing.html");
  assert.match(landing, /data-ai-chat-surface="public"/);
  assert.match(landing, /id="aiChatMessages"/);
});
