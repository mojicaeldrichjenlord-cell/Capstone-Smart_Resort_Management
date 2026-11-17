"use strict";
// Manual Reservation time-slot preview QA — isolated mock tests only.
// NEVER calls a real booking API or writes an Aiven reservation.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const page = fs.readFileSync(
  path.join(__dirname, "../../frontend/adminJS/admin-walkin.js"), "utf8");
const html = fs.readFileSync(
  path.join(__dirname, "../../frontend/adminHTML/admin-walkin.html"), "utf8");
const css = fs.readFileSync(
  path.join(__dirname, "../../frontend/adminCSS/admin-walkin.css"), "utf8");

function extract(start, end) {
  const i = page.indexOf(start), j = page.indexOf(end, i + start.length);
  assert.ok(i >= 0 && j > i, "Missing Manual Reservation function: " + start);
  return page.slice(i, j);
}

function setup(config = {}) {
  const slots = [
    { value: "day_tour", label: "Day Tour", start: "07:00:00", end: "17:00:00" },
    { value: "night", label: "Night", start: "19:00:00", end: "05:00:00" },
    { value: "day_extended", label: "Day 22 Hours", start: "07:00:00", end: "05:00:00" },
    { value: "night_extended", label: "Night 22 Hours", start: "19:00:00", end: "17:00:00" },
  ];
  const room = { id: 94, name: "Single Room (Pool side) D", max_capacity: 4 };
  let reservationType = config.type || "walkin";
  const requests = [], statuses = [], cards = [];
  const createCard = (slot = "", date = "2026-11-16", duration = "1") => {
    const select = { value: slot, options: [
      { value: "", disabled: false },
      ...slots.map(x => ({ value: x.value, disabled: false, textContent: "" })),
    ] };
    const els = {
      ".accommodation-value": { value: "94" },
      ".slot-select": select,
      ".date-input": { value: date },
      ".stay-duration-select": { value: duration },
      ".capacity-display": { value: "-" },
      ".manual-slot-status": { dataset: {}, textContent: "" },
      ".manual-item-availability": { dataset: {}, textContent: "" },
    };
    const card = {
      dataset: { itemId: String(cards.length + 1) },
      isConnected: true,
      querySelector: key => els[key] || null,
    };
    cards.push(card);
    return { card, els };
  };
  const { card, els } = createCard();
  const nextBtn = { disabled: true, title: "" };
  const document = {
    querySelectorAll: selector => selector === ".booking-item-card" ? cards : [],
    getElementById: id => id === "manualNextPaymentBtn" ? nextBtn : null,
  };
  class FakeAbortController {
    constructor() { this.signal = { aborted: false }; }
    abort() { this.signal.aborted = true; }
  }
  const context = {
    document, manualSlotRequests: new WeakMap(), manualPaymentChecking: false,
    getAccommodationById: id => Number(id) === 94 ? room : null,
    getSlotOptions: () => slots,
    getStayDuration: item => Math.max(1, Math.min(5, Number(item?.stay_duration || 1))),
    getManualReservationType: () => reservationType,
    getPhilippineTodayInputDate: () => "2026-11-16",
    validateManualReservationSchedules: items => ({
      valid: !items.some(item =>
        item.check_in_date === "2026-11-16" && item.slot_type === "day_tour"),
      message: "Expired day-tour slot",
    }),
    calculateCheckOutDate: (date, start, end, duration) => {
      const d = new Date(date + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() +
        (duration > 1 ? duration : end <= start ? 1 : 0));
      return d.toISOString().slice(0, 10);
    },
    formatTimeDisplay: v => v,
    populateStayDurationOptions: () => {},
    // Simulates the native dropdown population while the REAL renderer
    // decides whether to recover a missing newly added item.
    populateSlotOptions: (id, card) => {
      const target = card || cards.find(x => Number(x.dataset.itemId) === Number(id));
      const picker = target?.querySelector(".slot-select");
      if (picker) picker.options = [
        { value: "", disabled: false },
        ...slots.map(x => ({ value: x.value, disabled: false, textContent: "" })),
      ];
      const capacity = target?.querySelector(".capacity-display");
      if (capacity) capacity.value = String(room.max_capacity);
    },
    updateItemPreview: () => {},
    updateSummary: () => {},
    showMessage: () => {},
    API_BASE: "http://unit-test.invalid",
    fetch: async (url, args) => {
      const payload = JSON.parse(args.body);
      requests.push(payload);
      const approved = config.fetchStatus ? config.fetchStatus(payload) :
        payload.slot_type !== "night";
      return {
        ok: true,
        json: async () => ({ available: approved, message: approved ? "Available" : "Booked" }),
      };
    },
    AbortController: FakeAbortController, Date, JSON, Promise, Number, String,
    Object, WeakMap, console: { error() {}, log() {} }, setTimeout: callback => {
      queueMicrotask(callback);
      return 1;
    }, clearTimeout: () => {},
  };
  const fn = extract("function getManualBookingCards()", "function getPhilippineTodayInputDate()");
  const helpers = vm.runInNewContext(fn +
    "\n;({getManualSlotCandidate,getManualLocalConflict,renderManualSlotStatuses," +
    "scheduleAllManualSlotChecks,scheduleManualSlotCheck,cancelManualSlotRequest," +
    "verifyManualSlotsBeforePayment,getManualPrecheckState})", context);
  return {
    room, slots, cards, createCard, card, els, nextBtn, requests, statuses, helpers,
    type: value => { reservationType = value; },
  };
}

test("Manual Reservation layout shows date before slot and disables payment initially", () => {
  assert.ok(page.indexOf('<label>Reservation Date</label>') <
    page.indexOf('<label for="manualSlot-'));
  assert.match(page, /id="manualSlotStatus-/);
  assert.match(html, /id="manualNextPaymentBtn" disabled/);
  assert.match(css, /\.manual-slot-status/);
  assert.match(page, /async function goToPaymentScreen/);
});

test("Walk-in checks today; Facebook may check future, no 2-day online rule", () => {
  const h = setup();
  assert.equal(h.helpers.getManualSlotCandidate(h.card, "night").check_in_date,
    "2026-11-16");
  h.els[".date-input"].value = "2026-11-17";
  assert.equal(h.helpers.getManualPrecheckState(h.card,
    h.helpers.getManualSlotCandidate(h.card, "night"), {}), "unavailable");
  h.type("facebook");
  assert.equal(h.helpers.getManualPrecheckState(h.card,
    h.helpers.getManualSlotCandidate(h.card, "night"), {}), "checking");
});

test("Expired day-tour, occupied night and available extended slots are differentiated", () => {
  const h = setup();
  h.helpers.renderManualSlotStatuses(h.card, {
    day_tour: "available", night: "unavailable",
    day_extended: "available", night_extended: "error",
  });
  const option = value => h.els[".slot-select"].options.find(item => item.value === value);
  assert.equal(option("day_tour").disabled, true, "expired day slot");
  assert.equal(option("night").disabled, true, "booked night");
  assert.match(option("night").textContent, /Unavailable/);
  assert.equal(option("day_extended").disabled, false);
  assert.equal(option("night_extended").disabled, false, "network error is not booked");
  assert.match(option("night_extended").textContent, /Unable to verify/);
});

test("Overlapping accommodations in one manual reservation become unavailable", () => {
  const h = setup({ type: "facebook" });
  h.els[".date-input"].value = "2026-11-19";
  h.createCard("night", "2026-11-19");
  assert.match(h.helpers.getManualLocalConflict(h.card,
    h.helpers.getManualSlotCandidate(h.card, "night")), /overlapping/);
  h.helpers.renderManualSlotStatuses(h.card, {
    day_tour: "available", night: "available",
    day_extended: "available", night_extended: "available",
  });
  assert.equal(h.els[".slot-select"].options.find(x => x.value === "night").disabled, true);
});

test("Pre-check requests exactly four statuses, caches briefly and updates on date change", async () => {
  const h = setup({ type: "facebook" });
  h.els[".date-input"].value = "2026-11-19";
  h.helpers.scheduleManualSlotCheck(h.card);
  for (let i = 0; i < 16; i++) await Promise.resolve();
  assert.equal(h.requests.length, 4);
  assert.equal(h.els[".slot-select"].options.find(x => x.value === "night").disabled, true);
  h.helpers.scheduleManualSlotCheck(h.card);
  for (let i = 0; i < 12; i++) await Promise.resolve();
  assert.equal(h.requests.length, 4);
  h.els[".date-input"].value = "2026-11-20";
  h.helpers.scheduleManualSlotCheck(h.card);
  for (let i = 0; i < 16; i++) await Promise.resolve();
  assert.equal(h.requests.length, 8);
});

test("Final pre-payment recheck rejects occupied slot and preserves draft safety", async () => {
  const h = setup({ type: "facebook" });
  h.els[".slot-select"].value = "night";
  h.els[".date-input"].value = "2026-11-19";
  const valid = await h.helpers.verifyManualSlotsBeforePayment([h.card]);
  assert.equal(valid, false);
  assert.equal(h.els[".manual-item-availability"].dataset.state, "unavailable");
  assert.match(page, /if \(!verified\) return/);
  assert.match(page, /sessionStorage\.setItem\(ADMIN_WALKIN_DRAFT_KEY/);
  assert.match(page, /validateManualReservationDates\(items, reservation_type\)/);
  assert.match(page, /validateManualReservationSchedules\(items\)/);
  assert.match(page, /getManualLocalConflict/);
});


test("Verified open manual slot enables payment navigation, no booking is created", async () => {
  const h = setup({ type: "facebook" });
  h.els[".slot-select"].value = "day_extended";
  h.els[".date-input"].value = "2026-11-19";
  const valid = await h.helpers.verifyManualSlotsBeforePayment([h.card]);
  assert.equal(valid, true);
  assert.equal(h.els[".manual-item-availability"].dataset.state, "available");
  assert.equal(h.nextBtn.disabled, false);
  assert.match(page, /manualPaymentChecking = true/);
  assert.match(page, /verifyManualSlotsBeforePayment\(cards\)/);
});

test("A newly selected second accommodation restores four missing slots and capacity", () => {
  const h = setup({ type: "facebook" });
  const second = h.createCard("", "2026-11-19");
  second.els[".slot-select"].options = [{ value: "", disabled: false }];
  second.els[".capacity-display"].value = "-";
  h.helpers.renderManualSlotStatuses(second.card, {
    day_tour: "available", night: "available",
    day_extended: "unavailable", night_extended: "available",
  });
  assert.deepEqual(
    Array.from(second.els[".slot-select"].options, o => o.value),
    ["", "day_tour", "night", "day_extended", "night_extended"],
  );
  assert.equal(second.els[".capacity-display"].value, "4");
  assert.match(second.els[".manual-slot-status"].textContent, /3 of 4/);
  assert.equal(second.els[".slot-select"].options[3].disabled, true);
});

test("After removal, re-added item keeps stable identity and populates its own slots", () => {
  const rooms = [{ id: 101, name: "Beach Pavilion", category_name: "Function Area", max_capacity: 80 }];
  const slots = [
    { value: "day_tour", label: "Day Tour", start: "08:00:00", end: "18:00:00" },
    { value: "night", label: "Night", start: "20:00:00", end: "06:00:00" },
    { value: "day_extended", label: "Day 23 Hours", start: "08:00:00", end: "06:00:00" },
    { value: "night_extended", label: "Night 23 Hours", start: "20:00:00", end: "18:00:00" },
  ];
  const cards = [];
  const createCard = (id) => {
    const elements = {
      ".booking-item-title": { textContent: "" },
      ".accommodation-value": { value: "" },
      ".accommodation-picker-label": { textContent: "" },
      ".slot-select": { innerHTML: "", value: "" },
      ".capacity-display": { value: "-" },
      ".stay-duration-select": { innerHTML: "", value: "1", disabled: true },
    };
    const card = {
      dataset: { itemId: String(id) },
      querySelector: selector => elements[selector] || null,
    };
    cards.push(card);
    return { card, elements };
  };
  const document = {
    querySelectorAll: selector => selector === ".booking-item-card" ? cards : [],
    querySelector: selector => {
      const id = /data-item-id="(\\d+)"/.exec(selector)?.[1];
      return cards.find(c => c.dataset.itemId === id) || null;
    },
  };
  const context = {
    document,
    getAccommodationById: id => rooms.find(r => Number(r.id) === Number(id)) || null,
    getSlotOptions: () => slots,
    getAllowedStayDurations: () => [1],
    formatTimeDisplay: value => value,
    updateItemPreview: () => {},
    updateSummary: () => {},
    scheduleAllManualSlotChecks: () => {},
  };
  const fragment = extract("function setAccommodationSelection(", "function closeAllAccommodationPickers(") +
    extract("function refreshTitles()", "function getAccommodationById(") +
    extract("function populateStayDurationOptions(", "function updateItemPreview(");
  const { setAccommodationSelection, refreshTitles } = vm.runInNewContext(
    fragment + "\n;({setAccommodationSelection,refreshTitles})", context,
  );
  createCard(1);
  const removed = createCard(2);
  cards.splice(cards.indexOf(removed.card), 1);
  refreshTitles();
  const second = createCard(3);
  refreshTitles();
  setAccommodationSelection(second.card, 3, 101);
  assert.equal(second.card.dataset.itemId, "3",
    "Internal item IDs must never be renumbered after removing another card.");
  assert.equal(second.elements[".booking-item-title"].textContent, "Accommodation Item 2");
  assert.equal(second.elements[".capacity-display"].value, 80);
  assert.equal((second.elements[".slot-select"].innerHTML.match(
    /<option value="(?:day_tour|night|day_extended|night_extended)"/g) || []).length, 4);
  assert.equal(cards[0].dataset.itemId, "1");
});
