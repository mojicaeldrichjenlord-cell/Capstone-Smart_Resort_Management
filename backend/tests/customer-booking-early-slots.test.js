"use strict";
// Regression tests for date-first, early time-slot display.
// Pure mock checks; no network, Gemini, database or booking writes.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(
  path.join(__dirname, "../../frontend/customerJS/booking.js"), "utf8"
);
const css = fs.readFileSync(
  path.join(__dirname, "../../frontend/customerCSS/booking.css"), "utf8"
);

function section(from, until) {
  const i = script.indexOf(from);
  const j = script.indexOf(until, i + from.length);
  assert.ok(i >= 0 && j > i, "Missing booking helper: " + from);
  return script.slice(i, j);
}
const candidate = section("function buildCustomerSlotCandidate(",
  "function getCustomerCardSelection(");
const statusHelpers = section("function cancelCustomerSlotAvailabilityRequest(",
  "function scheduleAllCustomerAvailabilityChecks(");

function setup({ conflict = () => false, fetchStatus = () => true } = {}) {
  const room = { id: 94, name: "Single Room Poolside D" };
  const slots = [
    { value: "day_tour", label: "Day Tour", start: "07:00:00", end: "17:00:00" },
    { value: "night", label: "Night", start: "19:00:00", end: "05:00:00" },
    { value: "day_extended", label: "Day 22 Hours", start: "07:00:00", end: "05:00:00" },
    { value: "night_extended", label: "Night 22 Hours", start: "19:00:00", end: "17:00:00" },
  ];
  const selection = {
    value: "",
    options: [{ value: "", disabled: false }, ...slots.map(slot =>
      ({ value: slot.value, disabled: false, textContent: "" }))],
  };
  const note = { dataset: {}, textContent: "" };
  const date = { value: "2026-11-19" };
  const days = { value: "1" };
  const elements = {
    ".slot-select": selection,
    ".booking-slot-status": note,
    ".accommodation-value": { value: "94" },
    ".date-input": date,
    ".stay-duration-select": days,
  };
  const card = {
    isConnected: true,
    dataset: { itemId: "1" },
    querySelector: key => elements[key] || null,
  };
  const cache = new WeakMap();
  const calls = { fetched: [], cleared: 0, payment: [] };
  const context = {
    getSlotOptions: () => slots,
    calculateCheckOutDate: (startDate, startTime, endTime, duration) => {
      // UTC date-only arithmetic avoids timezone-dependent test failures.
      const result = new Date(startDate + "T00:00:00Z");
      result.setUTCDate(result.getUTCDate() +
        (duration > 1 ? duration : endTime <= startTime ? 1 : 0));
      return result.toISOString().slice(0, 10);
    },
    getStayDuration: item => Number(item?.stay_duration || 1),
    getAccommodationById: id => id === 94 ? room : null,
    isDateBefore: (one, two) => one < two,
    getCustomerEarliestBookingDate: () => "2026-11-18",
    formatTimeDisplay: time => time,
    getCustomerLocalConflict: conflict,
    populateStayDurationOptions: () => { calls.cleared++; },
    // Emulate native options being rebuilt for a second accommodation card.
    populateSlotOptions: (itemId, targetCard) => {
      assert.equal(targetCard, card, "must refresh the exact selected card");
      assert.equal(Number(itemId), Number(card.dataset.itemId));
      selection.options = [{ value: "", disabled: false }, ...slots.map(slot =>
        ({ value: slot.value, disabled: false, textContent: "" }))];
    },
    updateItemPreview: () => {},
    updateSummary: () => {},
    setCustomerCardAvailability: (card, state, message) => calls.payment.push({ state, message }),
    requestCustomerItemAvailability: async (candidate, signal) => {
      calls.fetched.push(candidate);
      return { available: fetchStatus(candidate, signal) };
    },
    customerSlotAvailabilityRequests: cache,
    setTimeout: fn => { queueMicrotask(fn); return 1; },
    clearTimeout: () => {},
    AbortController, Date, Promise, JSON, Number, String, WeakMap,
    scheduleAllCustomerAvailabilityChecks: () => {},
  };
  const helpers = vm.runInNewContext(candidate + statusHelpers +
    ";({buildCustomerSlotCandidate,renderCustomerSlotAvailability," +
    "scheduleCustomerSlotAvailabilityCheck,cancelCustomerSlotAvailabilityRequest})",
    context);
  return { room, slots, selection, note, date, days, card, cache, calls, helpers };
}

test("time slot selection follows reservation date and shows a live hint", () => {
  const date = script.indexOf('<label>Reservation Date</label>');
  const slot = script.indexOf('<label for="slotSelect-');
  assert.ok(date >= 0 && slot > date);
  assert.match(script, /booking-slot-status/);
  assert.match(script, /aria-describedby="slotStatus-/);
  assert.match(css, /\.booking-slot-status\[data-state="mixed"\]/);
});

test("night / extended calculations reuse the same checkout logic", () => {
  const { room, helpers } = setup();
  assert.equal(helpers.buildCustomerSlotCandidate(room, "2026-11-19", "night", 1).end,
    "2026-11-20 05:00:00");
  const extended = helpers.buildCustomerSlotCandidate(room, "2026-11-19",
    "day_extended", 3);
  assert.equal(extended.stay_duration, 3);
  assert.equal(extended.end, "2026-11-22 05:00:00");
  assert.equal(helpers.buildCustomerSlotCandidate(room, "2026-11-19",
    "day_tour", 3).stay_duration, 1);
});

test("only confirmed unavailable slots are disabled, and invalid choice clears", () => {
  const { card, selection, note, calls, helpers } = setup();
  const results = { results: { day_tour: "available", night: "unavailable",
    day_extended: "available", night_extended: "error" } };
  assert.equal(helpers.renderCustomerSlotAvailability(card, results), false);
  const option = value => selection.options.find(item => item.value === value);
  assert.equal(option("night").disabled, true);
  assert.match(option("night").textContent, /Unavailable/);
  assert.equal(option("night_extended").disabled, false);
  assert.match(option("night_extended").textContent, /Unable to verify/);
  assert.match(note.textContent, /2 of 4/);
  selection.value = "night";
  assert.equal(helpers.renderCustomerSlotAvailability(card, results), true);
  assert.equal(selection.value, "");
  assert.equal(calls.payment.at(-1).state, "incomplete");
});

test("other items in same booking disable overlapping slots", () => {
  const { card, selection, helpers } = setup({
    conflict: (card, candidate) =>
      candidate.slot_type === "day_tour" ? "Overlaps another booking item" : "",
  });
  helpers.renderCustomerSlotAvailability(card, { results: {
    day_tour: "available", night: "available",
    day_extended: "available", night_extended: "available",
  } });
  assert.equal(selection.options.find(item => item.value === "day_tour").disabled, true);
  assert.equal(selection.options.find(item => item.value === "night").disabled, false);
});

test("four server checks run once per date/duration; fresh changes recheck", async () => {
  const { card, date, days, calls, helpers } = setup({
    fetchStatus: candidate => candidate.slot_type !== "night",
  });
  helpers.scheduleCustomerSlotAvailabilityCheck(card);
  for (let i = 0; i < 12; i++) await Promise.resolve();
  assert.equal(calls.fetched.length, 4);
  helpers.scheduleCustomerSlotAvailabilityCheck(card);
  for (let i = 0; i < 12; i++) await Promise.resolve();
  assert.equal(calls.fetched.length, 4, "same date cached in short UI window");
  days.value = "2";
  helpers.scheduleCustomerSlotAvailabilityCheck(card);
  for (let i = 0; i < 12; i++) await Promise.resolve();
  assert.equal(calls.fetched.length, 8);
  assert.equal(calls.fetched.at(-1).stay_duration, 2);
  date.value = "2026-11-20";
  helpers.scheduleCustomerSlotAvailabilityCheck(card);
  for (let i = 0; i < 12; i++) await Promise.resolve();
  assert.equal(calls.fetched.length, 12);
  assert.equal(calls.fetched.at(-1).check_in_date, "2026-11-20");
});

test("keeps existing final payment validation and two-day date policy", () => {
  assert.match(script, /CUSTOMER_MIN_BOOKING_DAYS_AHEAD\s*=\s*2/);
  assert.match(script, /verifyCustomerAvailabilityBeforePayment\(\)/);
  assert.match(script, /requestCustomerItemAvailability\(selection/);
  assert.match(script, /function getCustomerLocalConflict/);
  assert.match(script, /nextBtn\.disabled\s*=\s*disabled/);
});


test("QA-16E: missing Item 2 slots are restored before showing statuses", () => {
  const { card, selection, helpers, note } = setup({
    conflict: (card, candidate) => candidate.slot_type === "day_tour"
      ? "Overlaps item 1" : "",
  });
  card.dataset.itemId = "2";
  // Actual browser failure: label/hidden accommodation ID exists, but
  // native select has only its placeholder while the status said '0 of 4'.
  selection.options = [{ value: "", disabled: false, textContent: "" }];
  helpers.renderCustomerSlotAvailability(card, { results: {
    day_tour: "available", night: "available",
    day_extended: "available", night_extended: "available",
  } });
  assert.equal(selection.options.length, 5);
  assert.equal(selection.options.find(o => o.value === "day_tour").disabled, true);
  assert.match(selection.options.find(o => o.value === "day_tour").textContent,
    /Unavailable/);
  assert.equal(selection.options.find(o => o.value === "night").disabled, false);
  assert.match(note.textContent, /3 of 4/);
});

test("QA-16E: extra booking card is populated directly without global ID lookup", () => {
  const populate = section("function populateSlotOptions(", "function updateItemPreview(");
  const options = [
    {value: "day_tour", label: "Day Tour", start: "06:00:00", end: "17:00:00"},
    {value: "night", label: "Night", start: "18:00:00", end: "05:00:00"},
    {value: "day_extended", label: "Day 23 Hours", start: "06:00:00", end: "05:00:00"},
    {value: "night_extended", label: "Night 23 Hours", start: "18:00:00", end: "17:00:00"},
  ];
  let nativeOptions = "";
  const select = {
    set innerHTML(value) { nativeOptions = value; },
    get innerHTML() { return nativeOptions; },
  };
  const capacity = { value: "-" };
  const card = {
    querySelector(key) {
      return ({
        ".accommodation-value": { value: "77" },
        ".slot-select": select, ".capacity-display": capacity,
      })[key] || null;
    },
  };
  let refreshedId = null;
  const populateOptions = vm.runInNewContext(populate +
    ";populateSlotOptions", {
    document: { querySelector: () => { throw new Error("global lookup must not be used"); } },
    getAccommodationById: id => Number(id) === 77
      ? { id: 77, max_capacity: 25 } : null,
    getSlotOptions: () => options,
    formatTimeDisplay: time => time,
    populateStayDurationOptions: (id, chosenCard) => {
      assert.equal(chosenCard, card);
      refreshedId = id;
    },
  });
  populateOptions(2, card);
  assert.equal(capacity.value, 25);
  assert.equal(refreshedId, 2);
  for (const opt of options) {
    assert.match(nativeOptions, new RegExp('value="' + opt.value + '"'));
  }
});


test("QA-16H: selected Item 2 preview uses its own card and correct price", () => {
  const previewSource = section("function updateItemPreview(", "// Reads completed accommodation cards");
  const preview = { innerHTML: "Select an accommodation and slot to preview its schedule and price." };
  const card = {
    querySelector: selector => ({
      ".accommodation-value": { value: "74" },
      ".slot-select": { value: "day_tour" },
      ".stay-duration-select": { value: "1" },
      ".date-input": { value: "2026-11-20" },
      ".slot-preview": preview,
    })[selector] || null,
  };
  const render = vm.runInNewContext(previewSource + ";updateItemPreview", {
    document: {
      querySelector: () => { throw Error("global card lookup should not run"); },
      getElementById: () => { throw Error("global preview lookup should not run"); },
    },
    getAccommodationById: id => Number(id) === 74
      ? { id: 74, name: "Big Shade 2", category_name: "Cottage", map_label: "Cottage - Big Shade 2" }
      : null,
    getSlotOptions: () => [{ value: "day_tour", label: "Day Tour",
      price: 1500, start: "06:00:00", end: "17:00:00" }],
    calculateCheckOutDate: date => date,
    escapeHtml: value => String(value),
    formatTimeDisplay: value => value,
    formatDateDisplay: value => value,
    formatMoney: value => Number(value).toFixed(2),
    Number, String,
  });
  render(2, card);
  assert.match(preview.innerHTML, /Big Shade 2/);
  assert.match(preview.innerHTML, /Day Tour/);
  assert.match(preview.innerHTML, /2026-11-20/);
  assert.match(preview.innerHTML, /1,?500\.00|1500\.00/);
  assert.doesNotMatch(preview.innerHTML, /Select an accommodation and slot/);
});

test("QA-16H: slot/date/duration listeners pass original card directly", () => {
  const listeners = section("  slotSelect.addEventListener(\"change\"", "  if (preselectedId) {");
  assert.match(listeners, /populateStayDurationOptions\(itemId, card\)/);
  assert.equal((listeners.match(/updateItemPreview\(itemId, card\)/g) || []).length, 4);
  const previewSource = section("function updateItemPreview(", "// Reads completed accommodation cards");
  assert.match(previewSource, /card\.querySelector\("\.slot-preview"\)/);
  assert.doesNotMatch(previewSource, /document\.getElementById\(/);
});
