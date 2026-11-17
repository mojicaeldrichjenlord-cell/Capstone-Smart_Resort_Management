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


test("AI photo cards recover listed accommodation gallery when image is missing", async () => {
  // Execute the actual browser-side image helpers with mocked fetch: this is
  // a read-only test and never requests the live backend or production DB.
  const vm = require("node:vm");
  const chat = read("js/ai-chat.js");
  const start = chat.indexOf("const AI_ROOM_IMAGE_FALLBACK =");
  const end = chat.indexOf("function aiRoomMoney(amount)", start);
  assert.ok(start >= 0 && end > start);
  const calls = [];
  const methods = vm.runInNewContext(chat.slice(start, end) +
    "\n({ resolveAiRoomImage, setAiRecommendationPhoto, AI_ROOM_IMAGE_FALLBACK });", {
    AI_API_BASE: "https://smartresort-backend.onrender.com/api",
    encodeURIComponent,
    fetch: async (url) => {
      calls.push(url);
      return { ok: true, json: async () => ({
        room: {
          id: 86, name: "Single Room Cottage 1",
          image: "", gallery_images: ["/api/rooms/media/44"]
        }
      }) };
    }
  });
  const img = { src: "", onerror: null };
  methods.setAiRecommendationPhoto(img, { id: 86, name: "Single Room Cottage 1", image: "" });
  // The async detail load is a Promise chain; no timers or network needed.
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(calls.length, 1);
  assert.equal(calls[0], "https://smartresort-backend.onrender.com/api/rooms/86");
  assert.equal(img.src, "https://smartresort-backend.onrender.com/api/rooms/media/44");
  assert.equal(methods.resolveAiRoomImage("data:image/svg+xml;base64,YWJj"),
    methods.AI_ROOM_IMAGE_FALLBACK);
});

test("AI photo recovery refuses to render a different accommodation ID", async () => {
  const vm = require("node:vm");
  const chat = read("js/ai-chat.js");
  const start = chat.indexOf("const AI_ROOM_IMAGE_FALLBACK =");
  const end = chat.indexOf("function aiRoomMoney(amount)", start);
  assert.ok(start >= 0 && end > start);
  const methods = vm.runInNewContext(chat.slice(start, end) +
    "\n({ setAiRecommendationPhoto, AI_ROOM_IMAGE_FALLBACK });", {
    AI_API_BASE: "https://smartresort-backend.onrender.com/api",
    encodeURIComponent,
    fetch: async () => ({ ok: true, json: async () => ({
      room: { id: 999, name: "Another Room", image: "/api/rooms/media/12" }
    }) })
  });
  const img = { src: "", onerror: null };
  methods.setAiRecommendationPhoto(img, { id: 86, name: "Single Room Cottage 1", image: "" });
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(img.src, methods.AI_ROOM_IMAGE_FALLBACK);
});


test("AI image resolver matches deployed image path on hosted and local pages", () => {
  // Exact file path is known from the read-only Aiven image audit and the
  // GitHub frontend/images directory. Never attempt a production HTTP write.
  const vm = require("node:vm");
  const chat = read("js/ai-chat.js");
  const start = chat.indexOf("const AI_ROOM_IMAGE_FALLBACK =");
  const end = chat.indexOf("function aiRoomMoney(amount)", start);
  const snippet = chat.slice(start, end) + "\nresolveAiRoomImage;";
  const path = "images/accommodations/Single-Room-Cottage/single-room-cottage-1.jpg";
  const live = vm.runInNewContext(snippet, {
    AI_API_BASE: "https://smartresort-backend.onrender.com/api",
    encodeURIComponent,
    window: { location: { pathname: "/customerHTML/index.html" } }
  });
  assert.equal(live(path), "/images/accommodations/Single-Room-Cottage/single-room-cottage-1.jpg");
  assert.equal(live("frontend/" + path), "/images/accommodations/Single-Room-Cottage/single-room-cottage-1.jpg");
  const local = vm.runInNewContext(snippet, {
    AI_API_BASE: "http://127.0.0.1:5000/api",
    encodeURIComponent,
    window: { location: { pathname: "/frontend/customerHTML/rooms.html" } }
  });
  assert.equal(local(path), "/frontend/images/accommodations/Single-Room-Cottage/single-room-cottage-1.jpg");
  assert.equal(live("javascript:alert(1)").startsWith("data:image/svg+xml"), true);
});


test("AI recommendation photos resolve verified Cottage 1-5 filename case on Vercel", () => {
  // Live browser Console on 2026-11-17 returned 404 for the stored
  // Single-Room-Cottage-1.jpg filename; Git contains lowercase basename.
  // Windows Live Server did not surface this Linux case-sensitive mismatch.
  const vm = require("node:vm");
  const chat = read("js/ai-chat.js");
  const start = chat.indexOf("const AI_ROOM_IMAGE_FALLBACK =");
  const end = chat.indexOf("function aiRoomMoney(amount)", start);
  assert.ok(start >= 0 && end > start);
  const snippet = chat.slice(start, end) + "\nresolveAiRoomImage;";
  const live = vm.runInNewContext(snippet, {
    AI_API_BASE: "https://smartresort-backend.onrender.com/api",
    encodeURIComponent,
    window: { location: { pathname: "/customerHTML/index.html" } }
  });
  const local = vm.runInNewContext(snippet, {
    AI_API_BASE: "http://127.0.0.1:5000/api",
    encodeURIComponent,
    window: { location: { pathname: "/frontend/customerHTML/rooms.html" } }
  });
  for (let id = 1; id <= 5; id++) {
    const legacy = "images/accommodations/Single-Room-Cottage/Single-Room-Cottage-" + id + ".jpg";
    const canonical = "images/accommodations/Single-Room-Cottage/single-room-cottage-" + id + ".jpg";
    assert.equal(live(legacy), "/" + canonical);
    assert.equal(local(legacy), "/frontend/" + canonical);
    assert.equal(live(canonical), "/" + canonical);
  }
  // Preserve case on unrelated accommodation photos.
  const unrelated = "images/accommodations/Family-Room/Family-Room-A.jpg";
  assert.equal(live(unrelated), "/" + unrelated);
});
