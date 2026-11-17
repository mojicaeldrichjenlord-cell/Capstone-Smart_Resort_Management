// ============================================================
// FRONT DESK: CUSTOMER-STYLE AVAILABILITY FOR EACH TIME SLOT
// Applies ONLY to Guests Inside > Add Accommodation.
// Uses the existing read-only server conflict check for all four slots.
// "Available" is a preview, NOT a held booking. Save does another check.
// ============================================================

const ADD_STAY_SLOT_TYPES = ["day_tour", "night", "day_extended", "night_extended"];
let addAccommodationSlotRequest = null;

function getAddStaySlotTimes(accommodation, slotType) {
  // Mirrors backend buildSlotConfig category schedules for DISPLAY only.
  // Backend owns authoritative schedule and overnight overlap checking.
  const category = String(accommodation?.category_name || "").toLowerCase();
  const isRoom = category.includes("room");
  const isCottage = category.includes("cottage") ||
    category.includes("shade") || category.includes("hut");
  const dayStart = isRoom ? "07:00" : isCottage ? "06:00" : "08:00";
  const dayEnd = isRoom || isCottage ? "17:00" : "18:00";
  const nightStart = isRoom ? "19:00" : isCottage ? "18:00" : "20:00";
  const nightEnd = isRoom || isCottage ? "05:00" : "06:00";
  const extended = isRoom ? "22" : "23";
  return {
    day_tour: ["Day Tour", dayStart, dayEnd],
    night: ["Night", nightStart, nightEnd],
    day_extended: ["Day " + extended + " Hours", dayStart, nightEnd],
    night_extended: ["Night " + extended + " Hours", nightStart, dayEnd],
  }[slotType] || ["Schedule", dayStart, dayEnd];
}

function formatAddStaySlotTime(raw) {
  const [hour, minute] = String(raw).split(":").map(Number);
  const hour12 = hour % 12 || 12;
  return hour12 + ":" + String(minute).padStart(2, "0") +
    (hour < 12 ? " AM" : " PM");
}

function getAddStaySlotBaseLabel(accommodation, slotType) {
  const [name, start, end] = getAddStaySlotTimes(accommodation, slotType);
  if (!accommodation) return name;
  return name + " (" + formatAddStaySlotTime(start) +
    " - " + formatAddStaySlotTime(end) + ")";
}

function cancelAddAccommodationSlotAvailability() {
  const active = addAccommodationSlotRequest;
  if (active?.timer) clearTimeout(active.timer);
  if (active?.controller) active.controller.abort();
  addAccommodationSlotRequest = null;
}

function getAddAccommodationSlotKey() {
  const accommodation = getSelectedStayAccommodation();
  const date = String(document.getElementById("addAccommodationDate")?.value || "");
  if (!selectedAddAccommodationBookingId || !accommodation ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      date < getPhilippineTodayForStay()) return null;
  return JSON.stringify({
    reservation_id: Number(selectedAddAccommodationBookingId),
    accommodation_id: Number(accommodation.id),
    check_in_date: date,
    stay_duration: getAddAccommodationDuration(),
  });
}

function renderAddAccommodationSlotAvailability(request = null) {
  const select = document.getElementById("addAccommodationSlot");
  const note = document.getElementById("addAccommodationSlotStatus");
  if (!select || !note) return;

  const accommodation = getSelectedStayAccommodation();
  const valid = Boolean(getAddAccommodationSlotKey());
  let available = 0, errors = 0, checking = 0;

  for (const slotType of ADD_STAY_SLOT_TYPES) {
    const option = [...select.options].find(item => item.value === slotType);
    if (!option) continue;

    const state = valid ? (request?.results?.[slotType] || "checking") : "incomplete";
    const suffix = state === "available" ? "Available" :
      state === "unavailable" ? "Unavailable" :
      state === "error" ? "Unable to verify" :
      state === "checking" ? "Checking..." : "";
    option.textContent = getAddStaySlotBaseLabel(accommodation, slotType) +
      (suffix ? " — " + suffix : "");
    // Conflicting/ended slots cannot be chosen. Unknown slots can be
    // selected to retry, but final Save stays disabled until verified.
    option.disabled = state === "unavailable" || state === "incomplete";
    if (state === "available") available++;
    if (state === "error") errors++;
    if (state === "checking") checking++;
  }

  if (!valid) {
    note.dataset.state = "incomplete";
    note.textContent = "Select an accommodation and valid date to see available time slots.";
  } else if (checking) {
    note.dataset.state = "checking";
    note.textContent = "Checking all four time slots for the selected date...";
  } else if (errors === ADD_STAY_SLOT_TYPES.length) {
    note.dataset.state = "error";
    note.textContent = "Unable to verify time slots. Check the backend connection or change the selection to retry.";
  } else {
    note.dataset.state = errors ? "error" : "ready";
    note.textContent = available + " of 4 time slots currently show available." +
      (getAddAccommodationDuration() > 1 ? " Extended slots use the selected stay duration." : "") +
      (errors ? " Some could not be verified; please retry." : "") +
      " Availability is rechecked before saving.";
  }

  // Do not keep a previously selected slot if backend marks it unavailable.
  const chosen = [...select.options].find(item => item.value === select.value);
  if (select.value && chosen?.disabled) {
    select.value = "";
    addAccommodationSelectionVersion++;
    updateAddAccommodationDurationState();
    updateAddAccommodationPreview();
    scheduleAddAccommodationAvailabilityCheck();
  }
}

function scheduleAddAccommodationSlotAvailabilityCheck() {
  const key = getAddAccommodationSlotKey();
  if (!key) {
    cancelAddAccommodationSlotAvailability();
    renderAddAccommodationSlotAvailability();
    return;
  }

  const prior = addAccommodationSlotRequest;
  // A short cache avoids 4 new checks when only switching time slots.
  // Final selected-slot and save checks are never cached.
  if (prior?.key === key && Date.now() - prior.createdAt < 20000) {
    renderAddAccommodationSlotAvailability(prior);
    return;
  }

  cancelAddAccommodationSlotAvailability();
  const controller = new AbortController();
  const request = {
    key, controller, createdAt: Date.now(), timer: null, results: null,
  };
  addAccommodationSlotRequest = request;
  renderAddAccommodationSlotAvailability(request);

  request.timer = setTimeout(async () => {
    const params = JSON.parse(key);
    const checks = await Promise.allSettled(ADD_STAY_SLOT_TYPES.map(async slotType => {
      const duration = ["day_extended", "night_extended"].includes(slotType)
        ? params.stay_duration : 1;
      const response = await fetch(API_BASE + "/bookings/check-item-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          mode: "add",
          reservation_id: params.reservation_id,
          accommodation_id: params.accommodation_id,
          check_in_date: params.check_in_date,
          stay_duration: duration,
          slot_type: slotType,
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      // A service error does NOT mean the slot is already booked.
      if (!response.ok && response.status >= 500) return "error";
      if (!response.ok) return "unavailable";
      return data.available === true ? "available" : "unavailable";
    }));

    if (controller.signal.aborted || addAccommodationSlotRequest !== request ||
        getAddAccommodationSlotKey() !== key) return;
    request.results = {};
    ADD_STAY_SLOT_TYPES.forEach((slotType, index) => {
      const result = checks[index];
      request.results[slotType] =
        result.status === "fulfilled" ? result.value : "error";
    });
    renderAddAccommodationSlotAvailability(request);
  }, 350);
}
