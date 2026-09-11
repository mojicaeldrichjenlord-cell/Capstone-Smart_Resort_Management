// ============================================================
// FRONT DESK STAY / ACCOMMODATION OPERATIONS
// File: frontend/frontdeskJS/frontdeskStay.js
//
// STEP 3F-F:
// - Add Accommodation for guests already inside
// - Extend Stay for an existing reservation item
// - Reuse backend availability/conflict validation
// - Add/extension price becomes UNPAID accommodation balance
// - Payment is NOT automatically marked as collected here
// ============================================================

let frontdeskStayAccommodations = [];

let selectedAddAccommodationBookingId = null;
let addAccommodationAvailabilityTimer = null;
let addAccommodationAvailabilityState = "unknown";

let selectedExtendStayBookingId = null;
let extendStayAvailabilityTimer = null;
let extendStayAvailabilityState = "unknown";

// ============================================================
// SECTION 1: STARTUP / MODAL EVENTS
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  setupFrontdeskStayEvents();
});

function setupFrontdeskStayEvents() {
  document
    .getElementById("closeAddAccommodationBtn")
    ?.addEventListener("click", closeAddAccommodationModal);

  document
    .getElementById("cancelAddAccommodationBtn")
    ?.addEventListener("click", closeAddAccommodationModal);

  document
    .getElementById("addAccommodationModal")
    ?.addEventListener("click", (event) => {
      if (event.target === document.getElementById("addAccommodationModal")) {
        closeAddAccommodationModal();
      }
    });

  [
    "addAccommodationSelect",
    "addAccommodationSlot",
    "addAccommodationDate",
    "addAccommodationStayDuration",
  ].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", () => {
      updateAddAccommodationDurationState();
      updateAddAccommodationPreview();
      scheduleAddAccommodationAvailabilityCheck();
    });
  });

  document
    .getElementById("saveAddAccommodationBtn")
    ?.addEventListener("click", submitAddAccommodation);

  document
    .getElementById("closeExtendStayBtn")
    ?.addEventListener("click", closeExtendStayModal);

  document
    .getElementById("cancelExtendStayBtn")
    ?.addEventListener("click", closeExtendStayModal);

  document
    .getElementById("extendStayModal")
    ?.addEventListener("click", (event) => {
      if (event.target === document.getElementById("extendStayModal")) {
        closeExtendStayModal();
      }
    });

  document
    .getElementById("extendStayItemSelect")
    ?.addEventListener("change", () => {
      updateExtendStayPreview();
      scheduleExtendStayAvailabilityCheck();
    });

  document
    .getElementById("extendStayDurationSelect")
    ?.addEventListener("change", () => {
      updateExtendStayPreview();
      scheduleExtendStayAvailabilityCheck();
    });

  document
    .getElementById("saveExtendStayBtn")
    ?.addEventListener("click", submitExtendStay);
}

// ============================================================
// SECTION 2: SHARED HELPERS
// ============================================================

function getStayBooking(bookingId) {
  if (typeof findGuestBookingById === "function") {
    return findGuestBookingById(bookingId);
  }

  return (
    allGuestBookings?.find(
      (booking) => Number(booking.id) === Number(bookingId),
    ) || null
  );
}

function canManageStayForBooking(booking) {
  if (!booking) return false;

  if (typeof getGuestState === "function") {
    return getGuestState(booking) === "inside";
  }

  return Number(booking.is_checked_in || 0) === 1;
}

function setStayAvailabilityStatus(elementId, type, message) {
  const element = document.getElementById(elementId);

  if (!element) return;

  element.className = `stay-availability-status ${type}`;
  element.textContent = message;
}

function setStayButtonState(buttonId, state, availableText) {
  const button = document.getElementById(buttonId);

  if (!button) return;

  if (!button.dataset.originalText) {
    button.dataset.originalText =
      button.textContent.trim() || availableText || "Save";
  }

  if (state === "available") {
    button.disabled = false;
    button.textContent = button.dataset.originalText;
    button.classList.remove("disabled-by-availability");
    return;
  }

  button.disabled = true;
  button.classList.add("disabled-by-availability");

  if (state === "checking") {
    button.textContent = "Checking...";
  } else if (state === "unavailable") {
    button.textContent = "Not Available";
  } else {
    button.textContent = "Complete Form";
  }
}

async function checkStayItemAvailability(payload) {
  try {
    const response = await fetch(
      `${API_BASE}/bookings/check-item-availability`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        available: false,
        message: data.message || "Failed to check availability.",
        schedule: data.schedule || null,
      };
    }

    return {
      available: Boolean(data.available),
      message: data.message || "",
      schedule: data.schedule || null,
    };
  } catch (error) {
    console.error("checkStayItemAvailability error:", error);

    return {
      available: false,
      message: "Unable to check availability. Please check backend connection.",
      schedule: null,
    };
  }
}

function getPhilippineTodayForStay() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    values[part.type] = part.value;
  });

  return `${values.year}-${values.month}-${values.day}`;
}

function getStaySlotPrice(accommodation, slotType, duration = 1) {
  if (!accommodation) return 0;

  const cleanSlot = String(slotType || "day_tour").toLowerCase();
  const cleanDuration = Math.max(1, Math.min(5, Number(duration || 1)));

  if (cleanSlot === "night") {
    return Number(accommodation.overnight_price || 0);
  }

  if (["day_extended", "night_extended"].includes(cleanSlot)) {
    return Number(accommodation.extended_price || 0) * cleanDuration;
  }

  return Number(accommodation.day_price || 0);
}

function getStaySlotLabel(slotType) {
  const labels = {
    day_tour: "Day Tour",
    night: "Night",
    day_extended: "Day 22/23 Hours",
    night_extended: "Night 22/23 Hours",
  };

  return labels[String(slotType || "")] || "Schedule";
}

function formatStaySchedule(schedule) {
  if (!schedule) {
    return "";
  }

  return [
    `Check-in: ${formatDate(schedule.check_in_date)} ${formatTime(
      schedule.check_in_time,
    )}`,
    `Check-out: ${formatDate(schedule.check_out_date)} ${formatTime(
      schedule.check_out_time,
    )}`,
  ].join(" | ");
}

async function refreshInsideStayView() {
  await loadGuestBookings();

  const filter = document.getElementById("arrivalFilter");

  if (filter) {
    filter.value = "inside";
    applyGuestFilters();
  }
}

// ============================================================
// SECTION 3: LOAD AVAILABLE ACCOMMODATIONS
// ============================================================

async function loadFrontdeskStayAccommodations(force = false) {
  if (frontdeskStayAccommodations.length && !force) {
    return frontdeskStayAccommodations;
  }

  const response = await fetch(`${API_BASE}/rooms/available`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load accommodations.");
  }

  frontdeskStayAccommodations = Array.isArray(data)
    ? data
    : Array.isArray(data.rooms)
      ? data.rooms
      : [];

  return frontdeskStayAccommodations;
}

// ============================================================
// SECTION 4: ADD ACCOMMODATION
// ============================================================

async function openAddAccommodationModal(bookingId) {
  const booking = getStayBooking(bookingId);
  const modal = document.getElementById("addAccommodationModal");

  if (!booking || !modal) {
    showMessage("Reservation not found.", "error");
    return;
  }

  if (!canManageStayForBooking(booking)) {
    showMessage(
      "Add Accommodation is only available for guests already checked in.",
      "error",
    );
    return;
  }

  selectedAddAccommodationBookingId = Number(bookingId);
  addAccommodationAvailabilityState = "unknown";

  const reservationText = document.getElementById(
    "addAccommodationReservationText",
  );

  if (reservationText) {
    reservationText.textContent = `Add another accommodation for ${getGuestName(
      booking,
    )} under reservation ${
      booking.reservation_code || `#${booking.id}`
    }. The new price will remain unpaid until accommodation balance collection.`;
  }

  const accommodationSelect = document.getElementById(
    "addAccommodationSelect",
  );

  if (accommodationSelect) {
    accommodationSelect.innerHTML =
      '<option value="">Loading accommodations...</option>';
  }

  const dateInput = document.getElementById("addAccommodationDate");
  const slotSelect = document.getElementById("addAccommodationSlot");
  const durationSelect = document.getElementById(
    "addAccommodationStayDuration",
  );

  if (dateInput) {
    dateInput.value = getPhilippineTodayForStay();
    dateInput.min = getPhilippineTodayForStay();
  }

  if (slotSelect) {
    slotSelect.value = "day_tour";
  }

  if (durationSelect) {
    durationSelect.value = "1";
  }

  setStayAvailabilityStatus(
    "addAccommodationAvailabilityStatus",
    "muted",
    "Select accommodation and schedule to check availability.",
  );

  setStayButtonState(
    "saveAddAccommodationBtn",
    "incomplete",
    "Add as Unpaid Accommodation Balance",
  );

  modal.classList.add("show");
  document.body.classList.add("guest-modal-open");

  try {
    const accommodations = await loadFrontdeskStayAccommodations(true);

    if (!accommodations.length) {
      throw new Error("No available accommodations are currently listed.");
    }

    if (accommodationSelect) {
      accommodationSelect.innerHTML = [
        '<option value="">Select accommodation</option>',
        ...accommodations.map(
          (accommodation) => `
            <option value="${Number(accommodation.id)}">
              ${escapeHtml(accommodation.name)} - ${escapeHtml(
                accommodation.category_name || "Accommodation",
              )}
            </option>
          `,
        ),
      ].join("");
    }

    updateAddAccommodationDurationState();
    updateAddAccommodationPreview();
  } catch (error) {
    console.error("openAddAccommodationModal error:", error);

    if (accommodationSelect) {
      accommodationSelect.innerHTML =
        '<option value="">Unable to load accommodations</option>';
    }

    showMessage(
      error.message || "Failed to load available accommodations.",
      "error",
    );
  }
}

function closeAddAccommodationModal() {
  clearTimeout(addAccommodationAvailabilityTimer);

  selectedAddAccommodationBookingId = null;
  addAccommodationAvailabilityState = "unknown";

  document
    .getElementById("addAccommodationModal")
    ?.classList.remove("show");

  document.body.classList.remove("guest-modal-open");
}

function getSelectedStayAccommodation() {
  const id = Number(
    document.getElementById("addAccommodationSelect")?.value || 0,
  );

  return (
    frontdeskStayAccommodations.find(
      (accommodation) => Number(accommodation.id) === id,
    ) || null
  );
}

function getAddAccommodationDuration() {
  return Math.max(
    1,
    Math.min(
      5,
      Math.floor(
        Number(
          document.getElementById("addAccommodationStayDuration")?.value || 1,
        ),
      ),
    ),
  );
}

function updateAddAccommodationDurationState() {
  const slotType = String(
    document.getElementById("addAccommodationSlot")?.value || "day_tour",
  );

  const durationSelect = document.getElementById(
    "addAccommodationStayDuration",
  );

  if (!durationSelect) return;

  const canUseMultipleDays = ["day_extended", "night_extended"].includes(
    slotType,
  );

  durationSelect.disabled = !canUseMultipleDays;

  if (!canUseMultipleDays) {
    durationSelect.value = "1";
  }
}

function getAddAccommodationAvailabilityPayload() {
  if (!selectedAddAccommodationBookingId) return null;

  const accommodation = getSelectedStayAccommodation();
  const slotType = String(
    document.getElementById("addAccommodationSlot")?.value || "",
  );
  const checkInDate = String(
    document.getElementById("addAccommodationDate")?.value || "",
  ).trim();

  if (!accommodation || !slotType || !checkInDate) {
    return null;
  }

  return {
    mode: "add",
    reservation_id: Number(selectedAddAccommodationBookingId),
    accommodation_id: Number(accommodation.id),
    slot_type: slotType,
    check_in_date: checkInDate,
    stay_duration: getAddAccommodationDuration(),
  };
}

function updateAddAccommodationPreview() {
  const preview = document.getElementById("addAccommodationPreview");

  if (!preview) return;

  const accommodation = getSelectedStayAccommodation();
  const slotType = String(
    document.getElementById("addAccommodationSlot")?.value || "day_tour",
  );
  const checkInDate = String(
    document.getElementById("addAccommodationDate")?.value || "",
  ).trim();
  const duration = getAddAccommodationDuration();

  if (!accommodation || !checkInDate) {
    preview.innerHTML = `
      <strong>Add Accommodation Preview</strong>
      <span>Complete the form to preview the unpaid accommodation balance.</span>
    `;
    return;
  }

  const amount = getStaySlotPrice(accommodation, slotType, duration);

  preview.innerHTML = `
    <strong>${escapeHtml(accommodation.name)}</strong>
    <span>${escapeHtml(getStaySlotLabel(slotType))} • ${duration} ${
      duration === 1 ? "day" : "days"
    }</span>
    <span>Selected date: ${escapeHtml(formatDate(checkInDate))}</span>
    <span>
      Accommodation balance to add:
      <b>₱${formatMoney(amount)}</b>
    </span>
    <small>
      This action does not mark the amount as paid. The backend will add it to
      the reservation's remaining accommodation balance.
    </small>
  `;
}

function scheduleAddAccommodationAvailabilityCheck() {
  clearTimeout(addAccommodationAvailabilityTimer);

  const payload = getAddAccommodationAvailabilityPayload();

  if (!payload) {
    addAccommodationAvailabilityState = "unknown";

    setStayAvailabilityStatus(
      "addAccommodationAvailabilityStatus",
      "muted",
      "Complete the accommodation, slot, and date first.",
    );

    setStayButtonState(
      "saveAddAccommodationBtn",
      "incomplete",
      "Add as Unpaid Accommodation Balance",
    );

    return;
  }

  addAccommodationAvailabilityState = "checking";

  setStayAvailabilityStatus(
    "addAccommodationAvailabilityStatus",
    "checking",
    "Checking accommodation availability...",
  );

  setStayButtonState(
    "saveAddAccommodationBtn",
    "checking",
    "Add as Unpaid Accommodation Balance",
  );

  addAccommodationAvailabilityTimer = setTimeout(() => {
    checkAddAccommodationAvailabilityNow(false);
  }, 350);
}

async function checkAddAccommodationAvailabilityNow(showErrors = true) {
  const payload = getAddAccommodationAvailabilityPayload();

  if (!payload) {
    addAccommodationAvailabilityState = "unknown";

    setStayButtonState(
      "saveAddAccommodationBtn",
      "incomplete",
      "Add as Unpaid Accommodation Balance",
    );

    return false;
  }

  const result = await checkStayItemAvailability(payload);

  if (result.available) {
    addAccommodationAvailabilityState = "available";

    setStayAvailabilityStatus(
      "addAccommodationAvailabilityStatus",
      "available",
      `${result.message || "Selected schedule is available."}${
        result.schedule ? ` ${formatStaySchedule(result.schedule)}` : ""
      }`,
    );

    setStayButtonState(
      "saveAddAccommodationBtn",
      "available",
      "Add as Unpaid Accommodation Balance",
    );

    return true;
  }

  addAccommodationAvailabilityState = "unavailable";

  setStayAvailabilityStatus(
    "addAccommodationAvailabilityStatus",
    "unavailable",
    result.message || "Selected schedule is not available.",
  );

  setStayButtonState(
    "saveAddAccommodationBtn",
    "unavailable",
    "Add as Unpaid Accommodation Balance",
  );

  if (showErrors) {
    showMessage(
      result.message || "Selected accommodation is not available.",
      "error",
    );
  }

  return false;
}

async function submitAddAccommodation() {
  if (!selectedAddAccommodationBookingId) {
    showMessage("No selected reservation.", "error");
    return;
  }

  const payload = getAddAccommodationAvailabilityPayload();

  if (!payload) {
    showMessage(
      "Please select accommodation, schedule, and reservation date.",
      "error",
    );
    return;
  }

  const accommodation = getSelectedStayAccommodation();

  if (!accommodation) {
    showMessage("Please select an accommodation.", "error");
    return;
  }

  const available = await checkAddAccommodationAvailabilityNow();

  if (!available) {
    return;
  }

  const amount = getStaySlotPrice(
    accommodation,
    payload.slot_type,
    payload.stay_duration,
  );

  const confirmed = confirm(
    [
      `Add ${accommodation.name} to this active reservation?`,
      "",
      `Schedule: ${getStaySlotLabel(payload.slot_type)}`,
      `Date: ${formatDate(payload.check_in_date)}`,
      `Accommodation balance to add: ₱${formatMoney(amount)}`,
      "",
      "This does NOT record payment as collected.",
      "The amount will become part of the unpaid accommodation balance.",
    ].join("\n"),
  );

  if (!confirmed) return;

  const saveButton = document.getElementById("saveAddAccommodationBtn");
  const originalText =
    saveButton?.dataset.originalText ||
    saveButton?.textContent ||
    "Add as Unpaid Accommodation Balance";

  try {
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Adding...";
    }

    const response = await fetch(
      `${API_BASE}/bookings/${Number(
        selectedAddAccommodationBookingId,
      )}/add-accommodation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          accommodation_id: payload.accommodation_id,
          slot_type: payload.slot_type,
          check_in_date: payload.check_in_date,
          stay_duration: payload.stay_duration,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add accommodation.");
    }

    closeAddAccommodationModal();

    showMessage(
      data.message ||
        "Accommodation added to the unpaid accommodation balance.",
      "success",
    );

    await refreshInsideStayView();
  } catch (error) {
    console.error("submitAddAccommodation error:", error);

    showMessage(error.message || "Failed to add accommodation.", "error");
  } finally {
    if (saveButton && document.body.contains(saveButton)) {
      saveButton.disabled = false;
      saveButton.textContent = originalText;
    }
  }
}

// ============================================================
// SECTION 5: EXTEND STAY
// ============================================================

function openExtendStayModal(bookingId) {
  const booking = getStayBooking(bookingId);
  const modal = document.getElementById("extendStayModal");

  if (!booking || !modal) {
    showMessage("Reservation not found.", "error");
    return;
  }

  if (!canManageStayForBooking(booking)) {
    showMessage(
      "Extend Stay is only available for guests already checked in.",
      "error",
    );
    return;
  }

  const items = Array.isArray(booking.items) ? booking.items : [];

  if (!items.length) {
    showMessage("No accommodation items are available to extend.", "error");
    return;
  }

  selectedExtendStayBookingId = Number(bookingId);
  extendStayAvailabilityState = "unknown";

  const reservationText = document.getElementById("extendStayReservationText");
  const itemSelect = document.getElementById("extendStayItemSelect");
  const durationSelect = document.getElementById("extendStayDurationSelect");

  if (reservationText) {
    reservationText.textContent = `Extend an existing accommodation for ${getGuestName(
      booking,
    )} under reservation ${
      booking.reservation_code || `#${booking.id}`
    }. The extension fee will remain unpaid until accommodation balance collection.`;
  }

  if (itemSelect) {
    itemSelect.innerHTML = items
      .map((item, index) => {
        const name =
          item.accommodation_name ||
          item.room_name ||
          item.name ||
          `Accommodation ${index + 1}`;

        return `
          <option value="${Number(item.id)}">
            ${index + 1}. ${escapeHtml(name)} - ${escapeHtml(
              item.slot_label || "Schedule",
            )}
          </option>
        `;
      })
      .join("");
  }

  if (durationSelect) {
    durationSelect.value = "1";
  }

  setStayAvailabilityStatus(
    "extendStayAvailabilityStatus",
    "muted",
    "Select an accommodation and extension duration.",
  );

  setStayButtonState(
    "saveExtendStayBtn",
    "incomplete",
    "Add Extension as Unpaid Balance",
  );

  updateExtendStayPreview();

  modal.classList.add("show");
  document.body.classList.add("guest-modal-open");

  scheduleExtendStayAvailabilityCheck();
}

function closeExtendStayModal() {
  clearTimeout(extendStayAvailabilityTimer);

  selectedExtendStayBookingId = null;
  extendStayAvailabilityState = "unknown";

  document.getElementById("extendStayModal")?.classList.remove("show");
  document.body.classList.remove("guest-modal-open");
}

function getSelectedExtendStayItem() {
  const booking = getStayBooking(selectedExtendStayBookingId);

  if (!booking) return null;

  const itemId = Number(
    document.getElementById("extendStayItemSelect")?.value || 0,
  );

  return (
    (booking.items || []).find((item) => Number(item.id) === itemId) || null
  );
}

function getExtendStayDuration() {
  return Math.max(
    1,
    Math.min(
      5,
      Math.floor(
        Number(document.getElementById("extendStayDurationSelect")?.value || 1),
      ),
    ),
  );
}

function getExtendStayEstimatedFee(item, duration) {
  if (!item) return 0;

  const oldStayDuration = Math.max(1, Number(item.stay_duration || 1));
  const currentItemPrice = Number(item.item_price || 0);
  const unitPrice = currentItemPrice / oldStayDuration;

  return Math.max(unitPrice, 0) * Math.max(1, Number(duration || 1));
}

function getExtendStayAvailabilityPayload() {
  if (!selectedExtendStayBookingId) return null;

  const item = getSelectedExtendStayItem();

  if (!item) return null;

  return {
    mode: "extend",
    reservation_id: Number(selectedExtendStayBookingId),
    reservation_item_id: Number(item.id),
    extension_duration: getExtendStayDuration(),
  };
}

function updateExtendStayPreview() {
  const preview = document.getElementById("extendStayPreview");
  const item = getSelectedExtendStayItem();

  if (!preview) return;

  if (!item) {
    preview.innerHTML = `
      <strong>Extend Stay Preview</strong>
      <span>Select an accommodation item to continue.</span>
    `;
    return;
  }

  const duration = getExtendStayDuration();
  const estimatedFee = getExtendStayEstimatedFee(item, duration);
  const name =
    item.accommodation_name || item.room_name || item.name || "Accommodation";

  preview.innerHTML = `
    <strong>${escapeHtml(name)}</strong>
    <span>
      Current checkout:
      ${escapeHtml(formatDate(item.check_out_date || ""))}
      ${escapeHtml(formatTime(item.check_out_time || ""))}
    </span>
    <span>Extension duration: ${duration} ${duration === 1 ? "day" : "days"}</span>
    <span>
      Estimated accommodation balance to add:
      <b>₱${formatMoney(estimatedFee)}</b>
    </span>
    <small>
      The backend calculates the final extension fee and conflict window before
      saving. Payment is not automatically collected.
    </small>
  `;
}

function scheduleExtendStayAvailabilityCheck() {
  clearTimeout(extendStayAvailabilityTimer);

  const payload = getExtendStayAvailabilityPayload();

  if (!payload) {
    extendStayAvailabilityState = "unknown";

    setStayAvailabilityStatus(
      "extendStayAvailabilityStatus",
      "muted",
      "Select an accommodation item and duration.",
    );

    setStayButtonState(
      "saveExtendStayBtn",
      "incomplete",
      "Add Extension as Unpaid Balance",
    );

    return;
  }

  extendStayAvailabilityState = "checking";

  setStayAvailabilityStatus(
    "extendStayAvailabilityStatus",
    "checking",
    "Checking extension availability...",
  );

  setStayButtonState(
    "saveExtendStayBtn",
    "checking",
    "Add Extension as Unpaid Balance",
  );

  extendStayAvailabilityTimer = setTimeout(() => {
    checkExtendStayAvailabilityNow(false);
  }, 350);
}

async function checkExtendStayAvailabilityNow(showErrors = true) {
  const payload = getExtendStayAvailabilityPayload();

  if (!payload) {
    extendStayAvailabilityState = "unknown";
    return false;
  }

  const result = await checkStayItemAvailability(payload);

  if (result.available) {
    extendStayAvailabilityState = "available";

    setStayAvailabilityStatus(
      "extendStayAvailabilityStatus",
      "available",
      `${result.message || "Extension is available."}${
        result.schedule ? ` ${formatStaySchedule(result.schedule)}` : ""
      }`,
    );

    setStayButtonState(
      "saveExtendStayBtn",
      "available",
      "Add Extension as Unpaid Balance",
    );

    return true;
  }

  extendStayAvailabilityState = "unavailable";

  setStayAvailabilityStatus(
    "extendStayAvailabilityStatus",
    "unavailable",
    result.message || "Selected extension is not available.",
  );

  setStayButtonState(
    "saveExtendStayBtn",
    "unavailable",
    "Add Extension as Unpaid Balance",
  );

  if (showErrors) {
    showMessage(result.message || "Selected extension is not available.", "error");
  }

  return false;
}

async function submitExtendStay() {
  if (!selectedExtendStayBookingId) {
    showMessage("No selected reservation.", "error");
    return;
  }

  const item = getSelectedExtendStayItem();

  if (!item) {
    showMessage("Please select an accommodation item to extend.", "error");
    return;
  }

  const duration = getExtendStayDuration();
  const estimatedFee = getExtendStayEstimatedFee(item, duration);

  const available = await checkExtendStayAvailabilityNow();

  if (!available) {
    return;
  }

  const name =
    item.accommodation_name || item.room_name || item.name || "Accommodation";

  const confirmed = confirm(
    [
      `Extend ${name} by ${duration} ${duration === 1 ? "day" : "days"}?`,
      "",
      `Estimated accommodation balance to add: ₱${formatMoney(estimatedFee)}`,
      "",
      "This does NOT record payment as collected.",
      "The backend will calculate the final extension fee and add it to the unpaid accommodation balance.",
    ].join("\n"),
  );

  if (!confirmed) return;

  const saveButton = document.getElementById("saveExtendStayBtn");
  const originalText =
    saveButton?.dataset.originalText ||
    saveButton?.textContent ||
    "Add Extension as Unpaid Balance";

  try {
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Extending...";
    }

    const response = await fetch(
      `${API_BASE}/bookings/${Number(
        selectedExtendStayBookingId,
      )}/extend-stay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          reservation_item_id: Number(item.id),
          extension_duration: duration,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to extend stay.");
    }

    closeExtendStayModal();

    showMessage(
      data.message || "Stay extension added to accommodation balance.",
      "success",
    );

    await refreshInsideStayView();
  } catch (error) {
    console.error("submitExtendStay error:", error);

    showMessage(error.message || "Failed to extend stay.", "error");
  } finally {
    if (saveButton && document.body.contains(saveButton)) {
      saveButton.disabled = false;
      saveButton.textContent = originalText;
    }
  }
}
