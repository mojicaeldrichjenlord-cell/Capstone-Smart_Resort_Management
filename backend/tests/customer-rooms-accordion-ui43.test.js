"use strict";
/*
 * UI-43 mobile/iPad accommodation accordion regression tests.
 * No browser, production DB, Gemini or payment calls are made.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const js = read("frontend/customerJS/rooms.js");
const css = read("frontend/customerCSS/rooms-accordion-ui43.css");
const html = read("frontend/customerHTML/rooms.html");
const images = read("frontend/customerJS/rooms-image-mobile-fix.js");

function between(from, to) {
  const a = js.indexOf(from);
  const b = js.indexOf(to, a);
  assert.ok(a >= 0 && b > a, "Missing source block " + from);
  return js.slice(a, b);
}

function fakeCard(id) {
  const attrs = {};
  const classes = new Set();
  const panel = { hidden: false };
  const card = {
    dataset: { roomId: String(id) },
    classList: {
      toggle(name, on) { if (on) classes.add(name); else classes.delete(name); },
      add(name) { classes.add(name); },
      contains(name) { return classes.has(name); },
    },
    querySelector(selector) {
      if (selector === ".room-accordion-toggle") return button;
      if (selector === ".room-accordion-panel") return panel;
      return null;
    },
    scrollIntoView() { card.scrolled = true; },
  };
  const button = {
    attrs,
    setAttribute(name, value) { attrs[name] = value; },
    closest(selector) { return selector === ".room-ai-card" ? card : null; },
  };
  return { card, button, panel, attrs };
}

function fakePage(mobile = true) {
  let compact = mobile;
  const listeners = {};
  const roomCards = [fakeCard(97), fakeCard(98)];
  const container = {
    innerHTML: "",
    contains(node) { return roomCards.some(x => x.button === node); },
    addEventListener(event, callback) { listeners[event] = callback; },
  };
  const document = {
    getElementById(id) {
      if (id === "roomsContainer") return container;
      if (id === "room-card-98") return roomCards[1].card;
      return null;
    },
    querySelectorAll(selector) {
      return selector === "#roomsContainer .room-ai-card"
        ? roomCards.map(x => x.card) : [];
    },
  };
  const mediaListeners = {};
  const window = {
    matchMedia(query) {
      assert.equal(query, "(max-width: 1199px), (pointer: coarse)");
      return {
        matches: compact,
        addEventListener(event, handler) { mediaListeners[event] = handler; },
      };
    },
    location: { search: "?room_id=98" },
    requestAnimationFrame(fn) { fn(); },
  };
  const source = [
    'const ROOMS_ACCORDION_QUERY = "(max-width: 1199px), (pointer: coarse)";',
    "let expandedRoomId = null;",
    between("function isCompactRoomLayout()", "let currentViewerImages ="),
    between("function renderRooms(rooms)", "// ============================================================\n// SECTION 8:"),
    between("function focusRequestedAiAccommodation()", "// ============================================================\n// SECTION 6:"),
    "({ renderRooms, syncRoomAccordionState, setupRoomAccordion,",
    "  focusRequestedAiAccommodation,",
    "  setOpenRoom: value => expandedRoomId = value, getOpenRoom: () => expandedRoomId })",
  ].join("\n");
  const helpers = {
    document, window, URLSearchParams,
    // Mimic a successfully loaded catalog, so renderRooms uses the card path.
    allRooms: [{ id: 97 }, { id: 98 }],
    updateCategoryCount() {},
    renderRoomMessage() { return "No accommodations"; },
    resolveImagePath(x) { return x || "fallback.jpg"; },
    escapeHtml(x) { return String(x || ""); },
    escapeForJs(x) { return String(x || ""); },
    formatMoney(x) { return Number(x || 0).toLocaleString("en-PH", {minimumFractionDigits:2, maximumFractionDigits:2}); },
    getExtendedLabel() { return "22 Hours"; },
    getAccommodationGroup() { return "rooms"; },
    getGroupLabel() { return "Rooms"; },
    capitalize(x) { return x || "Available"; },
    formatAmenitiesList() { return "<ul><li>Private CR</li></ul>"; },
    formatTimeRange() { return "7 AM - 5 PM"; },
  };
  const page = vm.runInNewContext(source, helpers);
  return {
    ...page, container, roomCards, listeners, mediaListeners,
    setCompact(value) { compact = value; },
  };
}

test("UI-43 core JS/CSS is valid and only the Customer rooms page loads accordion CSS", () => {
  assert.doesNotThrow(() => new vm.Script(js));
  assert.match(html, /rooms-accordion-ui43\.css\?v=20261121-ui43/);
  assert.match(html, /customerJS\/rooms\.js\?v=20261121-ui43/);
  assert.match(html, /class="rooms-compact-hint"/);
  assert.match(css, /@media \(max-width: 1199px\), \(pointer: coarse\)/);
  assert.match(css, /room-accordion-panel\[hidden\][^{]*\{[^}]*display:\s*none\s*!important;/s);
  assert.match(css, /:focus-visible/);
  assert.match(images, /card\.querySelector\("\.room-accordion-thumb"\)/);
});

test("UI-43 compact accommodation rows are collapsed and keep all original actions", () => {
  const page = fakePage(true);
  const sample = {
    id: 97, name: "Double Room 1", category_name: "Room", image: "cover.jpg",
    description: "For 3-7 pax", status: "available", max_capacity: 7,
    amenities: "Private CR", day_price: 4000, overnight_price: 4000,
    extended_price: 7000, gallery_images: ["other.jpg"],
  };
  page.renderRooms([sample]);
  const markup = page.container.innerHTML;
  assert.match(markup, /room-accordion-toggle/);
  assert.match(markup, /aria-controls="room-panel-97"/);
  assert.match(markup, /aria-expanded="false"/);
  assert.match(markup, /id="room-panel-97"[\s\S]*?role="region" hidden/);
  assert.match(markup, /Double Room 1/);
  assert.match(markup, /Up to 7 guests/);
  assert.match(markup, /Day ₱4,000\.00 · Night ₱4,000\.00/);
  assert.match(markup, /room-gallery-strip/);
  assert.match(markup, /Amenities \/ Inclusions/);
  assert.match(markup, /Schedule Preview:/);
  assert.match(markup, /booking\.html\?room_id=97/);
  assert.match(markup, /Reserve This/);
  assert.match(markup, /Ask AI About This/);
  assert.match(markup, /openImageViewerFromRoom/);
});

test("UI-43 tap / keyboard button behavior allows only one expanded room", () => {
  const page = fakePage(true);
  const [first, second] = page.roomCards;
  page.setupRoomAccordion();
  page.syncRoomAccordionState();
  const click = target => page.listeners.click({
    target: { closest(selector) { return selector === ".room-accordion-toggle" ? target.button : null; } },
  });
  assert.equal(first.panel.hidden, true);
  assert.equal(second.panel.hidden, true);
  click(first);
  assert.equal(first.panel.hidden, false);
  assert.equal(first.attrs["aria-expanded"], "true");
  assert.equal(second.panel.hidden, true);
  click(second);
  assert.equal(first.panel.hidden, true);
  assert.equal(first.attrs["aria-expanded"], "false");
  assert.equal(second.panel.hidden, false);
  click(second);
  assert.equal(second.panel.hidden, true);
  assert.equal(page.getOpenRoom(), null);
});

test("UI-43 responsive change preserves desktop layout and restores compact state", () => {
  const page = fakePage(true);
  page.setupRoomAccordion();
  page.setOpenRoom(97);
  page.syncRoomAccordionState();
  page.setCompact(false);
  page.mediaListeners.change();
  assert.ok(page.roomCards.every(x => x.panel.hidden === false));
  assert.ok(page.roomCards.every(x => x.attrs["aria-expanded"] === "true"));
  page.setCompact(true);
  page.mediaListeners.change();
  assert.equal(page.roomCards[0].panel.hidden, false);
  assert.equal(page.roomCards[1].panel.hidden, true);
});

test("UI-43 AI deep link automatically expands its requested accommodation", () => {
  const page = fakePage(true);
  page.syncRoomAccordionState();
  page.focusRequestedAiAccommodation();
  assert.equal(page.getOpenRoom(), 98);
  assert.equal(page.roomCards[1].panel.hidden, false);
  assert.equal(page.roomCards[0].panel.hidden, true);
  assert.equal(page.roomCards[1].card.scrolled, true);
  assert.equal(page.roomCards[1].card.classList.contains("ai-room-focused"), true);
});

test("UI-43 desktop renders full cards without visible accordion controls", () => {
  const page = fakePage(false);
  const room = {
    id: 98, name: "Double Room 2", category_name: "Room", image: "cover.jpg",
    max_capacity: 7, day_price: 4000, overnight_price: 4000,
  };
  page.renderRooms([room]);
  assert.match(page.container.innerHTML, /aria-expanded="true"/);
  assert.doesNotMatch(page.container.innerHTML, /id="room-panel-98"[\s\S]*?role="region" hidden/);
  assert.match(css, /#roomsContainer \.room-accordion-toggle,\s*\.rooms-compact-hint\s*\{[^}]*display:\s*none;/s);
});

test("UI-43 category filters and existing gallery enhancer remain in original flow", () => {
  assert.match(js, /currentFilter = button\.dataset\.filter \|\| "all"/);
  assert.match(js, /renderRooms\(getFilteredRooms\(\)\)/);
  assert.match(images, /const originalRenderRooms = window\.renderRooms/);
  assert.match(images, /enhanceRenderedAccommodationImages\(rooms\)/);
  assert.match(js, /setupRoomAccordion\(\);\s*setupImageViewerControls\(\);\s*loadRooms\(\)/);
  assert.match(js, /function openAiForRoom\(roomName, roomId\)/);
});
