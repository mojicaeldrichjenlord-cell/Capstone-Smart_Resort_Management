// ============================================================
// FRONT DESK ADD ACCOMMODATION — PER-SLOT AVAILABILITY REGRESSION
// Isolated read-only mocks: no network, MySQL, payment, or booking writes.
// Run: node --test tests/frontdesk-add-accommodation-slots.test.js
// ============================================================
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
const js = fs.readFileSync(
  path.join(root, "frontend/frontdeskJS/frontdeskAddSlotAvailability.js"), "utf8");
const stay = fs.readFileSync(
  path.join(root, "frontend/frontdeskJS/frontdeskStay.js"), "utf8");
const html = fs.readFileSync(
  path.join(root, "frontend/frontdeskHTML/frontdeskGuests.html"), "utf8");

function setup(fetcher, initialRoom = { id: 99, category_name: "Room" }) {
  let room = initialRoom;
  let duration = 1;
  let date = "2026-11-19";
  let timerId = 0;
  const timers = new Map();
  const options = [
    { value: "", textContent: "Select time slot", disabled: false },
    ...["day_tour", "night", "day_extended", "night_extended"]
      .map(value => ({ value, textContent: value, disabled: false })),
  ];
  const select = { value: "", options };
  const note = { dataset: {}, textContent: "" };
  const elements = {
    addAccommodationSlot: select,
    addAccommodationSlotStatus: note,
    addAccommodationDate: { get value() { return date; } },
  };
  const effects = { duration: 0, preview: 0, availability: 0 };
  const ctx = {
    document: { getElementById: id => elements[id] || null },
    selectedAddAccommodationBookingId: 44,
    addAccommodationSelectionVersion: 0,
    getSelectedStayAccommodation: () => room,
    getPhilippineTodayForStay: () => "2026-11-17",
    getAddAccommodationDuration: () => duration,
    updateAddAccommodationDurationState: () => { effects.duration++; },
    updateAddAccommodationPreview: () => { effects.preview++; },
    scheduleAddAccommodationAvailabilityCheck: () => { effects.availability++; },
    fetch: fetcher,
    API_BASE: "http://mock-server/api",
    AbortController,
    setTimeout: (fn) => { const id = ++timerId; timers.set(id, fn); return id; },
    clearTimeout: id => timers.delete(id),
    console: { error: () => {} },
  };
  vm.runInNewContext(js, ctx);
  return {
    ctx, select, note, effects, options, 
    setRoom(v) { room = v; },
    setDate(v) { date = v; },
    setDuration(v) { duration = v; },
    fire() {
      const jobs = [...timers.values()];
      timers.clear();
      return Promise.all(jobs.map(fn => fn()));
    },
  };
}

test("four options show server-verified states, time windows and reject occupied slots", async () => {
  const calls = [];
  const fx = setup(async (url, init) => {
    assert.match(url, /check-item-availability$/);
    assert.equal(init.method, "POST");
    const payload = JSON.parse(init.body);
    calls.push(payload);
    return { ok: true, status: 200, json: async () => ({
      available: payload.slot_type !== "night",
    }) };
  });
  fx.select.value = "night"; // selected while requests are in flight
  fx.ctx.scheduleAddAccommodationSlotAvailabilityCheck();
  assert.match(fx.note.textContent, /Checking all four/);
  await fx.fire();
  assert.equal(calls.length, 4);
  assert.ok(calls.every(x => x.reservation_id === 44 && x.accommodation_id === 99));
  assert.ok(calls.every(x => x.check_in_date === "2026-11-19"));
  assert.ok(fx.options[1].textContent.includes("7:00 AM - 5:00 PM"));
  assert.ok(fx.options[1].textContent.includes("Available"));
  assert.ok(fx.options[2].textContent.includes("Unavailable"));
  assert.equal(fx.options[2].disabled, true);
  assert.equal(fx.select.value, ""); // no stale occupied selection
  assert.equal(fx.effects.availability, 1); // selected-slot check resets
  assert.match(fx.note.textContent, /3 of 4/);
});

test("extended schedules use 1-5 day duration; normal slots remain one day", async () => {
  const calls = [];
  const fx = setup(async (_url, init) => {
    calls.push(JSON.parse(init.body));
    return { ok: true, status: 200, json: async () => ({ available: true }) };
  }, { id: 86, category_name: "Rooms" });
  fx.setDuration(3);
  fx.ctx.scheduleAddAccommodationSlotAvailabilityCheck();
  await fx.fire();
  assert.deepEqual(calls.map(x => x.stay_duration), [1,1,3,3]);
  assert.match(fx.options[3].textContent, /22 Hours/);
  assert.match(fx.note.textContent, /Extended slots/);
  const before = calls.length;
  fx.select.value = "day_extended";
  fx.ctx.scheduleAddAccommodationSlotAvailabilityCheck(); // cached by room/date/duration
  await fx.fire();
  assert.equal(calls.length, before);
});

test("backend errors show Unable to verify, not booked/unavailable", async () => {
  const fx = setup(async (_url, init) => {
    const x = JSON.parse(init.body);
    if (x.slot_type === "night") throw new Error("offline");
    if (x.slot_type === "day_tour")
      return {ok:false,status:503,json:async()=>({message:"service unavailable"})};
    return {ok:true,status:200,json:async()=>({available:true})};
  });
  fx.ctx.scheduleAddAccommodationSlotAvailabilityCheck();
  await fx.fire();
  assert.match(fx.options[1].textContent, /Unable to verify/);
  assert.match(fx.options[2].textContent, /Unable to verify/);
  assert.equal(fx.options[1].disabled, false);
  assert.equal(fx.options[2].disabled, false);
  assert.match(fx.note.textContent, /could not be verified/);
});

test("changing rooms while requests are pending discards stale results", async () => {
  const pending = [];
  const fx = setup((_url, init) => new Promise(resolve => pending.push({
    payload: JSON.parse(init.body), resolve,
  })));
  fx.ctx.scheduleAddAccommodationSlotAvailabilityCheck();
  const oldJob = fx.fire();
  assert.equal(pending.length, 4);

  fx.setRoom({ id: 100, category_name: "Room" });
  fx.ctx.scheduleAddAccommodationSlotAvailabilityCheck();
  const newJob = fx.fire();
  assert.equal(pending.length, 8);

  for (const job of pending.slice(4))
    job.resolve({ok:true,status:200,json:async()=>({available:true})});
  await newJob;
  assert.match(fx.note.textContent, /4 of 4/);

  for (const job of pending.slice(0,4))
    job.resolve({ok:true,status:200,json:async()=>({available:false})});
  await oldJob;
  assert.match(fx.note.textContent, /4 of 4/); // unchanged by old booking
});

test("markup and selected slot handler preserve backend final checks", () => {
  assert.match(html, /id="addAccommodationSlotStatus"/);
  assert.match(html, /id="addAccommodationSlot"[^>]*>/);
  assert.match(html, /frontdeskAddSlotAvailability\.js/);
  assert.match(stay, /scheduleAddAccommodationSlotAvailabilityCheck\(\)/);
  assert.match(stay, /version !== addAccommodationSelectionVersion/);
  assert.match(stay, /checkAddAccommodationAvailabilityNow\(\)/);
  assert.match(stay, /\/add-accommodation/);
  assert.doesNotMatch(js, /\/add-accommodation|\/collect|\/payments/);
});
