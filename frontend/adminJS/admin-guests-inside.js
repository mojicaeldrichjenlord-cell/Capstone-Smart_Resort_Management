// ============================================================
// SMARTRESORT ADMIN GUESTS INSIDE SCRIPT
// Purpose:
// - Check admin/staff access
// - Load active approved guests for today
// - Search active guests
// - Show only checked-in guests
// - Check out guests
// - Add/update extra bed fee
// - Open receipt page
// - Works from frontend/adminHTML/admin-guests-inside.html
// ============================================================

const EXTRA_BED_RATE = 200;

let allBookings = [];
let availableAccommodations = [];
let selectedExtraBedBookingId = null;
let selectedAddAccommodationBookingId = null;
let currentSearchTerm = "";

// ============================================================
// SECTION 1: Page startup
// Checks access, connects events, and loads guests.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupEvents();
  loadAvailableAccommodations();
  loadGuestsInside();
});

// ============================================================
// SECTION 2: Access checker
// Allows admin and staff only.
// ============================================================

function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (user.role !== "admin" && user.role !== "staff") {
    alert("Access denied. Admin or staff only.");
    window.location.href = "../index.html";
  }
}

// ============================================================
// SECTION 3: Setup page events
// Connects logout, refresh, search, modal, and keyboard actions.
// ============================================================

function setupEvents() {
  const logoutBtn = document.getElementById("logoutBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const extraBedInput = document.getElementById("extraBedCountInput");
  const saveExtraBedBtn = document.getElementById("saveExtraBedBtn");
  const cancelExtraBedBtn = document.getElementById("cancelExtraBedBtn");
  const extraBedModal = document.getElementById("extraBedModal");
  const guestSearchInput = document.getElementById("guestSearchInput");
  const addAccommodationSelect = document.getElementById("addAccommodationSelect");
  const addAccommodationSlot = document.getElementById("addAccommodationSlot");
  const addAccommodationDate = document.getElementById("addAccommodationDate");
  const addAccommodationStayDuration = document.getElementById("addAccommodationStayDuration");
  const saveAddAccommodationBtn = document.getElementById("saveAddAccommodationBtn");
  const cancelAddAccommodationBtn = document.getElementById("cancelAddAccommodationBtn");
  const addAccommodationModal = document.getElementById("addAccommodationModal");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem("user");
      showMessage("Logged out successfully.", "success");

      setTimeout(() => {
        window.location.href = "../authHTML/login.html";
      }, 700);
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadGuestsInside);
  }

  if (guestSearchInput) {
    guestSearchInput.addEventListener("input", () => {
      currentSearchTerm = guestSearchInput.value.trim().toLowerCase();
      refreshGuestsInsideView();
    });
  }

  if (extraBedInput) {
    extraBedInput.addEventListener("input", updateExtraBedPreview);
  }

  if (saveExtraBedBtn) {
    saveExtraBedBtn.addEventListener("click", saveExtraBed);
  }

  if (cancelExtraBedBtn) {
    cancelExtraBedBtn.addEventListener("click", closeExtraBedModal);
  }

  if (extraBedModal) {
    extraBedModal.addEventListener("click", (e) => {
      if (e.target === extraBedModal) {
        closeExtraBedModal();
      closeAddAccommodationModal();
      }
    });
  }

  if (addAccommodationSelect) {
    addAccommodationSelect.addEventListener("change", () => {
      populateAddAccommodationSlotOptions();
      updateAddAccommodationPreview();
    });
  }

  if (addAccommodationSlot) {
    addAccommodationSlot.addEventListener("change", () => {
      updateAddAccommodationStayDurationOptions();
      updateAddAccommodationPreview();
    });
  }

  if (addAccommodationDate) {
    addAccommodationDate.addEventListener("change", updateAddAccommodationPreview);
    addAccommodationDate.addEventListener("input", updateAddAccommodationPreview);
  }

  if (addAccommodationStayDuration) {
    addAccommodationStayDuration.addEventListener("change", updateAddAccommodationPreview);
  }

  if (saveAddAccommodationBtn) {
    saveAddAccommodationBtn.addEventListener("click", submitAddAccommodation);
  }

  if (cancelAddAccommodationBtn) {
    cancelAddAccommodationBtn.addEventListener("click", closeAddAccommodationModal);
  }

  if (addAccommodationModal) {
    addAccommodationModal.addEventListener("click", (e) => {
      if (e.target === addAccommodationModal) {
        closeAddAccommodationModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeExtraBedModal();
    }
  });
}


async function loadAvailableAccommodations() {
  try {
    const response = await fetch(`${API_BASE}/rooms/available`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load accommodations.");
    }

    if (Array.isArray(data)) {
      availableAccommodations = data;
    } else if (Array.isArray(data.rooms)) {
      availableAccommodations = data.rooms;
    } else if (Array.isArray(data.accommodations)) {
      availableAccommodations = data.accommodations;
    } else {
      availableAccommodations = [];
    }

    populateAddAccommodationOptions();
  } catch (error) {
    console.error("loadAvailableAccommodations error:", error);
    showMessage(error.message || "Failed to load accommodations.", "error");
  }
}


// ============================================================
// SECTION 4: Load guests inside
// Gets all admin bookings, then filters active guests today.
// ============================================================

async function loadGuestsInside() {
  const tbody = document.getElementById("guestsInsideTableBody");

  try {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="15" class="table-message">Loading guests inside...</td>
        </tr>
      `;
    }

    let response = await fetch(`${API_BASE}/bookings?scope=today`);
    let data = await response.json();

    // Fallback for older backend routes.
    if (!response.ok) {
      response = await fetch(`${API_BASE}/admin/bookings`);
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to load guests inside.");
    }

    allBookings = Array.isArray(data) ? data : data.bookings || [];

    refreshGuestsInsideView();
  } catch (error) {
    console.error("loadGuestsInside error:", error);

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="15" class="table-message">Failed to load guests inside.</td>
        </tr>
      `;
    }

    showMessage(error.message || "Failed to load guests inside.", "error");
  }
}

// ============================================================
// SECTION 5: Refresh view
// Filters active guests, applies search, updates cards/table.
// ============================================================

function refreshGuestsInsideView() {
  const activeToday = getActiveGuestsToday(allBookings);
  const filteredGuests = filterGuestsInside(activeToday);

  updateSummary(filteredGuests);
  renderGuestsInside(filteredGuests);
}

// ============================================================
// SECTION 6: Search filter
// Searches reservation code, guest name, accommodation, contact, etc.
// ============================================================

function filterGuestsInside(bookings) {
  if (!currentSearchTerm) return bookings;

  return bookings.filter((booking) => {
    const searchableText = [
      booking.reservation_code,
      booking.fullname,
      booking.room_name,
      booking.accommodation_name,
      booking.email,
      booking.phone,
      booking.contact_no,
      booking.booking_source,
      booking.payment_status,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(currentSearchTerm);
  });
}

// ============================================================
// SECTION 7: Active guests logic
// Shows approved bookings active for today's date.
// ============================================================

function getActiveGuestsToday(bookings) {
  const now = new Date();

  return bookings.filter((booking) => {
    const status = getReservationStatus(booking);
    const isCheckedIn = isBookingCheckedIn(booking);

    // Guests Inside must only show guests already allowed to enter.
    // Payment alone is not enough; admin/staff must click Check In / Allow Entry first.
    if (status !== "approved" || !isCheckedIn) {
      return false;
    }

    const checkInDate = booking.check_in || booking.check_in_date;
    const checkOutDate = booking.check_out || booking.check_out_date;

    const checkInDateTime = combineDateAndTime(
      checkInDate,
      booking.check_in_time,
      false
    );

    const checkOutDateTime = combineDateAndTime(
      checkOutDate,
      booking.check_out_time,
      true
    );

    if (!checkInDateTime || !checkOutDateTime) {
      return false;
    }

    return checkInDateTime <= now && checkOutDateTime >= now;
  });
}

function isBookingCheckedIn(booking) {
  const rawValue = booking.is_checked_in;

  return (
    rawValue === true ||
    rawValue === 1 ||
    rawValue === "1" ||
    String(rawValue || "").toLowerCase() === "true"
  );
}

// ============================================================
// SECTION 8: Reservation status helper
// Supports both booking.status and booking.reservation_status
// because some backend routes return different field names.
// ============================================================

function getReservationStatus(booking) {
  return String(
    booking.status ||
      booking.reservation_status ||
      booking.booking_status ||
      ""
  ).toLowerCase();
}

// ============================================================
// SECTION 8: Summary cards
// Updates total guests, active reservations, payment reminders.
// ============================================================

function updateSummary(bookings) {
  let totalGuests = 0;
  let needsPaymentCount = 0;
  let attentionCount = 0;

  bookings.forEach((booking) => {
    totalGuests += Number(booking.guests || booking.guest_count || 0);

    const remainingBalance = Number(booking.remaining_balance || 0);
    const entranceFee = getUnpaidEntranceFee(booking);
    const unpaidExtraBedFee = getUnpaidExtraBedFee(booking);
    const timeInfo = getTimeStatus(booking);

    if (remainingBalance > 0 || entranceFee > 0 || unpaidExtraBedFee > 0) {
      needsPaymentCount += 1;
    }

    if (timeInfo.level === "warning" || timeInfo.level === "danger") {
      attentionCount += 1;
    }
  });

  setText("totalGuestsInside", totalGuests);
  setText("activeReservations", bookings.length);
  setText("needsPaymentCount", needsPaymentCount);
  setText("attentionCount", attentionCount);
}

// ============================================================
// SECTION 9: Render guests table
// Creates active guest rows and action buttons.
// ============================================================

function renderGuestsInside(bookings) {
  const tbody = document.getElementById("guestsInsideTableBody");
  if (!tbody) return;

  if (!bookings.length) {
    const message = currentSearchTerm
      ? `No active guest found for "${escapeHtml(currentSearchTerm)}".`
      : "No active guests inside the resort today.";

    tbody.innerHTML = `
      <tr>
        <td colspan="15" class="table-message">
          ${message}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bookings
    .map((booking) => {
      const source = String(booking.booking_source || "online").toLowerCase();

      const paymentStatus = String(
        booking.payment_status || "pending"
      ).toLowerCase();

      const remainingBalance = Number(booking.remaining_balance || 0);
      const entranceFee = getUnpaidEntranceFee(booking);
      const extraBedCount = Number(booking.extra_bed_count || 0);
      const extraBedFee = Number(booking.extra_bed_fee || 0);
      const unpaidExtraBedFee = getUnpaidExtraBedFee(booking);
      const extraBedPaid = isExtraBedPaid(booking);

      const timeInfo = getTimeStatus(booking);
      const paymentClass = getPaymentClass(paymentStatus);

      const frontDeskNote = getFrontDeskNote(
        remainingBalance,
        entranceFee,
        unpaidExtraBedFee,
        timeInfo
      );

      const accommodationHtml = formatAccommodationDisplay(
        booking.room_name || booking.accommodation_name || "-"
      );

      const extraBedPaymentButton = renderExtraBedPaymentButton(
        Number(booking.id),
        extraBedFee,
        extraBedPaid
      );

      return `
        <tr class="${getRowClass(
          timeInfo,
          remainingBalance,
          entranceFee,
          unpaidExtraBedFee
        )}">
          <td>
            <strong>${escapeHtml(booking.reservation_code || `#${booking.id}`)}</strong>
          </td>

          <td>${escapeHtml(booking.fullname || "-")}</td>

          <td>${source === "manual" ? "Walk-in / Manual" : "Online"}</td>

          <td>${accommodationHtml}</td>

          <td>
            ${formatDate(booking.check_in || booking.check_in_date)}
            <br>
            <small>${formatTime(booking.check_in_time)}</small>
          </td>

          <td>
            ${formatDate(booking.check_out || booking.check_out_date)}
            <br>
            <small>${formatTime(booking.check_out_time)}</small>
          </td>

          <td>
            <strong>${Number(booking.guests || booking.guest_count || 0)}</strong>
          </td>

          <td>
            <span class="badge ${timeInfo.level}">
              ${escapeHtml(timeInfo.label)}
            </span>
          </td>

          <td>
            <span class="badge ${paymentClass}">
              ${formatPaymentStatus(paymentStatus)}
            </span>
          </td>

          <td class="${remainingBalance > 0 ? "money-warning" : "money-ok"}">
            ₱${formatMoney(remainingBalance)}
          </td>

          <td class="${entranceFee > 0 ? "money-warning" : "money-ok"}">
            ₱${formatMoney(entranceFee)}
          </td>

          <td>
            <div class="extra-bed-box">
              ${extraBedCount} bed(s)
              <small>₱200 each</small>
            </div>
          </td>

          <td class="${unpaidExtraBedFee > 0 ? "money-warning" : "money-ok"}">
            ₱${formatMoney(extraBedFee)}
            ${extraBedFee > 0 ? `<br><small>${extraBedPaid ? "Paid" : "Unpaid"}</small>` : ""}
          </td>

          <td>
            <strong>${escapeHtml(frontDeskNote)}</strong>
          </td>

          <td>
            <div class="action-buttons">
              <button class="action-btn extra-bed-btn" onclick="openExtraBedModal(${Number(
                booking.id
              )})">
                Extra Bed
              </button>

              <button class="action-btn add-accommodation-btn" onclick="openAddAccommodationModal(${Number(
                booking.id
              )})">
                Add Accommodation
              </button>

              ${extraBedPaymentButton}

              <button class="action-btn save-booking-btn" onclick="markAsCheckedOut(${Number(
                booking.id
              )})">
                Check Out
              </button>

              <button class="action-btn receipt-btn" onclick="viewReceipt(${Number(
                booking.id
              )})">
                Receipt
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

// ============================================================
// SECTION 10: Open extra bed modal
// Loads selected guest extra bed count into modal.
// ============================================================

function openExtraBedModal(bookingId) {
  const booking = allBookings.find(
    (item) => Number(item.id) === Number(bookingId)
  );

  const modal = document.getElementById("extraBedModal");
  const input = document.getElementById("extraBedCountInput");
  const guestText = document.getElementById("extraBedGuestText");

  if (!booking || !modal || !input) {
    showMessage("Booking not found.", "error");
    return;
  }

  selectedExtraBedBookingId = Number(bookingId);
  input.value = Number(booking.extra_bed_count || 0);

  if (guestText) {
    guestText.textContent = `Add or modify extra bed count for ${
      booking.fullname || "this guest"
    }. Rate is ₱200 per extra bed.`;
  }

  updateExtraBedPreview();
  modal.classList.add("show");
}

// ============================================================
// SECTION 11: Close extra bed modal
// Resets selected booking and hides modal.
// ============================================================

function closeExtraBedModal() {
  const modal = document.getElementById("extraBedModal");
  const input = document.getElementById("extraBedCountInput");

  selectedExtraBedBookingId = null;

  if (input) {
    input.value = 0;
  }

  if (modal) {
    modal.classList.remove("show");
  }

  updateExtraBedPreview();
}

// ============================================================
// SECTION 12: Update extra bed fee preview
// Calculates count x 200.
// ============================================================

function updateExtraBedPreview() {
  const input = document.getElementById("extraBedCountInput");
  const preview = document.getElementById("extraBedFeePreview");

  const count = Math.max(0, Number(input?.value || 0));
  const fee = count * EXTRA_BED_RATE;

  if (preview) {
    preview.textContent = `₱${formatMoney(fee)}`;
  }
}

// ============================================================
// SECTION 13: Save extra bed count
// Updates backend then refreshes local table.
// ============================================================

async function saveExtraBed() {
  const input = document.getElementById("extraBedCountInput");
  const count = Number(input?.value || 0);

  if (!selectedExtraBedBookingId) {
    showMessage("No selected booking.", "error");
    return;
  }

  if (Number.isNaN(count) || count < 0 || !Number.isInteger(count)) {
    showMessage(
      "Extra bed count must be a whole number and cannot be negative.",
      "error"
    );
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/admin/bookings/${selectedExtraBedBookingId}/extra-bed`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extra_bed_count: count,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update extra bed.");
    }

    allBookings = allBookings.map((booking) => {
      if (Number(booking.id) === Number(selectedExtraBedBookingId)) {
        return {
          ...booking,
          extra_bed_count: data.extra_bed_count,
          extra_bed_fee: data.extra_bed_fee,
          extra_bed_paid: data.extra_bed_paid || 0,
          extra_bed_paid_at: data.extra_bed_paid_at || null,
        };
      }

      return booking;
    });

    refreshGuestsInsideView();
    closeExtraBedModal();

    showMessage("Extra bed updated successfully.", "success");
  } catch (error) {
    console.error("saveExtraBed error:", error);
    showMessage(error.message || "Failed to update extra bed.", "error");
  }
}


function renderExtraBedPaymentButton(bookingId, extraBedFee, extraBedPaid) {
  const fee = Number(extraBedFee || 0);

  if (fee <= 0) {
    return "";
  }

  if (extraBedPaid) {
    return `
      <button class="action-btn save-payment-btn" disabled style="opacity:0.65;cursor:not-allowed;">
        Extra Bed Paid
      </button>
    `;
  }

  return `
    <button
      class="action-btn save-payment-btn"
      onclick="markExtraBedPaid(${Number(bookingId)})"
    >
      Mark Extra Bed Paid
    </button>
  `;
}

async function markExtraBedPaid(bookingId) {
  if (!confirm("Mark this extra bed fee as paid?")) return;

  try {
    const response = await fetch(
      `${API_BASE}/admin/bookings/${Number(bookingId)}/extra-bed-paid`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to mark extra bed as paid.");
    }

    allBookings = allBookings.map((booking) => {
      if (Number(booking.id) === Number(bookingId)) {
        return {
          ...booking,
          extra_bed_paid: 1,
          extra_bed_paid_at: data.extra_bed_paid_at || new Date().toISOString(),
        };
      }

      return booking;
    });

    refreshGuestsInsideView();
    showMessage("Extra bed fee marked as paid.", "success");
  } catch (error) {
    console.error("markExtraBedPaid error:", error);
    showMessage(error.message || "Failed to mark extra bed as paid.", "error");
  }
}

// ============================================================
// SECTION 14: Payment note
// Booking balance and entrance fee are collected during Check In / Allow Entry
// from the Admin Dashboard. Extra bed fee is shown here as a front-desk reminder.
// ============================================================


// ============================================================
// SECTION 14.1: Add accommodation to active reservation
// Adds an onsite accommodation under the same reservation code.
// ============================================================

async function openAddAccommodationModal(bookingId) {
  const booking = allBookings.find(
    (item) => Number(item.id) === Number(bookingId)
  );

  const modal = document.getElementById("addAccommodationModal");
  const guestText = document.getElementById("addAccommodationReservationText");
  const dateInput = document.getElementById("addAccommodationDate");

  if (!booking || !modal) {
    showMessage("Booking not found.", "error");
    return;
  }

  selectedAddAccommodationBookingId = Number(bookingId);

  if (!availableAccommodations.length) {
    await loadAvailableAccommodations();
  }

  if (guestText) {
    guestText.textContent = `Add an onsite accommodation for ${
      booking.fullname || "this guest"
    } under reservation ${booking.reservation_code || `#${booking.id}`}. This add-on is recorded as cash paid now.`;
  }

  if (dateInput) {
    dateInput.min = getTodayInputDate();
    dateInput.value = getTodayInputDate();
  }

  populateAddAccommodationOptions();
  populateAddAccommodationSlotOptions();
  updateAddAccommodationStayDurationOptions();
  updateAddAccommodationPreview();

  modal.classList.add("show");
}

function closeAddAccommodationModal() {
  const modal = document.getElementById("addAccommodationModal");

  selectedAddAccommodationBookingId = null;

  if (modal) {
    modal.classList.remove("show");
  }
}

function populateAddAccommodationOptions() {
  const select = document.getElementById("addAccommodationSelect");
  if (!select) return;

  if (!availableAccommodations.length) {
    select.innerHTML = `<option value="">No accommodation available</option>`;
    return;
  }

  select.innerHTML = `
    <option value="">Select accommodation</option>
    ${availableAccommodations
      .map(
        (item) => `
          <option value="${Number(item.id)}">
            ${escapeHtml(item.name)} (${escapeHtml(item.category_name || "Accommodation")})
          </option>
        `
      )
      .join("")}
  `;
}

function populateAddAccommodationSlotOptions() {
  const accommodationSelect = document.getElementById("addAccommodationSelect");
  const slotSelect = document.getElementById("addAccommodationSlot");

  if (!slotSelect) return;

  const accommodation = getAccommodationById(accommodationSelect?.value);

  if (!accommodation) {
    slotSelect.innerHTML = `<option value="">Select slot</option>`;
    updateAddAccommodationStayDurationOptions();
    return;
  }

  const options = getSlotOptions(accommodation);

  slotSelect.innerHTML = `
    <option value="">Select slot</option>
    ${options
      .map(
        (slot) => `
          <option value="${slot.value}">
            ${slot.label} (${formatTime(slot.start)} - ${formatTime(slot.end)}) - ₱${formatMoney(slot.price)}
          </option>
        `
      )
      .join("")}
  `;

  updateAddAccommodationStayDurationOptions();
}

function updateAddAccommodationStayDurationOptions() {
  const slotSelect = document.getElementById("addAccommodationSlot");
  const durationSelect = document.getElementById("addAccommodationStayDuration");

  if (!durationSelect) return;

  const slotType = String(slotSelect?.value || "").toLowerCase();

  if (slotType === "extended") {
    durationSelect.disabled = false;
    durationSelect.innerHTML = [1, 2, 3, 4, 5]
      .map((day) => `<option value="${day}">${day} day${day > 1 ? "s" : ""}</option>`)
      .join("");
    return;
  }

  durationSelect.disabled = true;
  durationSelect.innerHTML = `<option value="1">1 day/night only</option>`;
}

function updateAddAccommodationPreview() {
  const preview = document.getElementById("addAccommodationPreview");
  const accommodationSelect = document.getElementById("addAccommodationSelect");
  const slotSelect = document.getElementById("addAccommodationSlot");
  const dateInput = document.getElementById("addAccommodationDate");
  const durationSelect = document.getElementById("addAccommodationStayDuration");

  if (!preview) return;

  const accommodation = getAccommodationById(accommodationSelect?.value);

  if (!accommodation) {
    preview.innerHTML = "Select an accommodation to preview the add-on.";
    return;
  }

  const slot = getSlotOptions(accommodation).find(
    (item) => item.value === slotSelect?.value
  );

  if (!slot) {
    preview.innerHTML = `
      <strong>${escapeHtml(accommodation.name)}</strong><br>
      Category: ${escapeHtml(accommodation.category_name || "Accommodation")}<br>
      Select a slot to continue.
    `;
    return;
  }

  const checkInDate = dateInput?.value || getTodayInputDate();
  const stayDuration = getValidStayDuration(
    durationSelect?.value,
    slot.value
  );
  const checkOutDate = calculateAddOnCheckOutDate(
    checkInDate,
    slot.start,
    slot.end,
    stayDuration
  );
  const total = Number(slot.price || 0) * stayDuration;

  preview.innerHTML = `
    <strong>${escapeHtml(accommodation.name)}</strong><br>
    Category: ${escapeHtml(accommodation.category_name || "Accommodation")}<br>
    Schedule: ${escapeHtml(slot.label)} (${formatTime(slot.start)} - ${formatTime(slot.end)})<br>
    Stay Duration: ${stayDuration} day${stayDuration > 1 ? "s" : ""}<br>
    Check-in: ${formatDate(checkInDate)} ${formatTime(slot.start)}<br>
    Check-out: ${formatDate(checkOutDate)} ${formatTime(slot.end)}<br>
    Cash to collect now: <strong>₱${formatMoney(total)}</strong>
  `;
}

async function submitAddAccommodation() {
  if (!selectedAddAccommodationBookingId) {
    showMessage("No selected reservation.", "error");
    return;
  }

  const accommodationId = Number(
    document.getElementById("addAccommodationSelect")?.value || 0
  );
  const slotType = document.getElementById("addAccommodationSlot")?.value || "";
  const checkInDate = document.getElementById("addAccommodationDate")?.value || "";
  const stayDuration = getValidStayDuration(
    document.getElementById("addAccommodationStayDuration")?.value,
    slotType
  );

  if (!accommodationId || !slotType || !checkInDate) {
    showMessage("Please complete the add accommodation form.", "error");
    return;
  }

  const confirmed = confirm(
    "Add this accommodation to the active reservation? This will be recorded as cash paid now."
  );

  if (!confirmed) return;

  const saveBtn = document.getElementById("saveAddAccommodationBtn");
  const originalText = saveBtn ? saveBtn.textContent : "Add Accommodation";

  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Adding...";
    }

    const response = await fetch(
      `${API_BASE}/bookings/${selectedAddAccommodationBookingId}/add-accommodation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accommodation_id: accommodationId,
          slot_type: slotType,
          check_in_date: checkInDate,
          stay_duration: stayDuration,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add accommodation.");
    }

    closeAddAccommodationModal();
    await loadGuestsInside();

    showMessage(data.message || "Accommodation added successfully.", "success");
  } catch (error) {
    console.error("submitAddAccommodation error:", error);
    showMessage(error.message || "Failed to add accommodation.", "error");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = originalText;
    }
  }
}

function getAccommodationById(id) {
  return (
    availableAccommodations.find((item) => Number(item.id) === Number(id)) ||
    null
  );
}

function getSlotOptions(accommodation) {
  if (!accommodation) return [];

  const category = String(accommodation.category_name || "").toLowerCase();
  const isRoom = category === "room" || category.includes("room");

  return [
    {
      value: "day_tour",
      label: "Day Tour",
      price: Number(accommodation.day_price || 0),
      start: accommodation.day_start_time,
      end: accommodation.day_end_time,
    },
    {
      value: "overnight",
      label: "Overnight",
      price: Number(accommodation.overnight_price || 0),
      start: accommodation.overnight_start_time,
      end: accommodation.overnight_end_time,
    },
    {
      value: "extended",
      label: isRoom ? "22 Hours" : "23 Hours",
      price: Number(accommodation.extended_price || 0),
      start: accommodation.extended_start_time,
      end: accommodation.extended_end_time,
    },
  ];
}

function getValidStayDuration(value, slotType) {
  const duration = Math.max(1, Math.min(5, Math.floor(Number(value || 1))));
  return slotType === "extended" ? duration : 1;
}

function calculateAddOnCheckOutDate(checkInDate, startTime, endTime, stayDuration = 1) {
  if (!checkInDate || !startTime || !endTime) return checkInDate || "";

  const startParts = String(startTime).split(":");
  const endParts = String(endTime).split(":");

  if (startParts.length < 2 || endParts.length < 2) {
    return checkInDate;
  }

  const startMinutes = Number(startParts[0]) * 60 + Number(startParts[1]);
  const endMinutes = Number(endParts[0]) * 60 + Number(endParts[1]);

  const daysToAdd =
    Number(stayDuration || 1) > 1
      ? Number(stayDuration || 1)
      : endMinutes <= startMinutes
        ? 1
        : 0;

  const date = new Date(`${checkInDate}T00:00:00`);
  date.setDate(date.getDate() + daysToAdd);

  return toInputDateValue(date);
}

function getTodayInputDate() {
  const now = new Date();
  return toInputDateValue(now);
}

function toInputDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ============================================================
// SECTION 15: Check out guest
// Marks booking as completed.
// ============================================================

async function markAsCheckedOut(bookingId) {
  if (!confirm("Mark this guest as checked out / completed?")) return;

  try {
    let response = await fetch(`${API_BASE}/admin/bookings/${bookingId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "completed" }),
    });

    let data = await response.json();

    if (!response.ok) {
      response = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      });

      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to mark as completed.");
    }

    allBookings = allBookings.map((booking) => {
      if (Number(booking.id) === Number(bookingId)) {
        return {
          ...booking,
          status: "completed",
        };
      }

      return booking;
    });

    refreshGuestsInsideView();

    showMessage("Guest checked out successfully.", "success");
  } catch (error) {
    console.error("markAsCheckedOut error:", error);
    showMessage(error.message || "Failed to check out guest.", "error");
  }
}

// ============================================================
// SECTION 16: View receipt
// Opens organized admin receipt page.
// ============================================================

function viewReceipt(bookingId) {
  window.location.href = `admin-booking-receipt.html?id=${bookingId}`;
}

// ============================================================
// SECTION 17: Accommodation display helper
// Handles accommodation text like "Room A +2 more".
// ============================================================

function formatAccommodationDisplay(name) {
  const text = String(name || "-").trim();

  if (!text || text === "-") {
    return `<div class="guest-accommodation-list">-</div>`;
  }

  const accommodations = text
    .split(/,|\n|\+/)
    .map((item) => item.replace(/\d+\s*more/gi, "").trim())
    .filter(Boolean);

  if (!accommodations.length) {
    return `<div class="guest-accommodation-list">${escapeHtml(text)}</div>`;
  }

  return `
    <div class="guest-accommodation-list">
      ${accommodations
        .map(
          (item, index) => `
            <div class="guest-accommodation-item">
              <span class="guest-accommodation-number">${index + 1}.</span>
              <span>${escapeHtml(item)}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

// ============================================================
// SECTION 18: Time status
// Detects active, ending soon, or overdue.
// ============================================================

function getTimeStatus(booking) {
  const now = new Date();
  const checkOutDate = booking.check_out || booking.check_out_date;
  const checkOutTime = booking.check_out_time;
  const checkOutDateTime = combineDateAndTime(checkOutDate, checkOutTime);

  if (!checkOutDateTime) {
    return {
      label: "Active Today",
      level: "active",
    };
  }

  const diffMs = checkOutDateTime.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 0) {
    return {
      label: "Overdue",
      level: "danger",
    };
  }

  if (diffMinutes <= 60) {
    return {
      label: `${diffMinutes}m left`,
      level: "warning",
    };
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return {
    label: `${hours}h ${minutes}m left`,
    level: "active",
  };
}

// ============================================================
// SECTION 19: Front desk note
// Gives staff a clear action note.
// ============================================================

function getUnpaidEntranceFee(booking) {
  const entranceFee = Number(booking.estimated_entrance_fee || 0);
  const entrancePaidValue = booking.entrance_fee_paid;
  const entranceCollected = Number(booking.entrance_fee_collected || 0);

  const isEntrancePaid =
    entrancePaidValue === true ||
    entrancePaidValue === 1 ||
    entrancePaidValue === "1" ||
    String(entrancePaidValue || "").toLowerCase() === "true" ||
    entranceCollected > 0;

  return isEntrancePaid ? 0 : entranceFee;
}

function isExtraBedPaid(booking) {
  const rawValue = booking.extra_bed_paid;
  const paidAt = booking.extra_bed_paid_at;

  return (
    rawValue === true ||
    rawValue === 1 ||
    rawValue === "1" ||
    String(rawValue || "").toLowerCase() === "true" ||
    Boolean(paidAt)
  );
}

function getUnpaidExtraBedFee(booking) {
  const fee = Number(booking.extra_bed_fee || 0);

  if (fee <= 0) return 0;

  return isExtraBedPaid(booking) ? 0 : fee;
}

function getFrontDeskNote(remainingBalance, entranceFee, extraBedFee, timeInfo) {
  const totalToCollect =
    Number(remainingBalance || 0) +
    Number(entranceFee || 0) +
    Number(extraBedFee || 0);

  if (timeInfo.level === "danger") {
    return totalToCollect > 0
      ? `OVERDUE - collect ₱${formatMoney(totalToCollect)}`
      : "OVERDUE - check guest now";
  }

  if (totalToCollect > 0) {
    return `Collect ₱${formatMoney(totalToCollect)} onsite`;
  }

  if (timeInfo.level === "warning") {
    return "Near check-out time";
  }

  return "No urgent action";
}

// ============================================================
// SECTION 20: Row class helper
// Adds row background class based on priority.
// ============================================================

function getRowClass(timeInfo, remainingBalance, entranceFee, extraBedFee) {
  if (timeInfo.level === "danger") return "guest-row-danger";
  if (timeInfo.level === "warning") return "guest-row-warning";

  if (remainingBalance > 0 || entranceFee > 0 || extraBedFee > 0) {
    return "guest-row-payment";
  }

  return "";
}

// ============================================================
// SECTION 21: Date/time helpers
// Combines date and time for countdown logic.
// ============================================================

function combineDateAndTime(dateValue, timeValue, defaultEndOfDay = true) {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (!timeValue) {
    if (defaultEndOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date;
  }

  const timeText = String(timeValue).trim();
  const parts = timeText.split(":");

  if (parts.length < 2) {
    if (defaultEndOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    if (defaultEndOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date;
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
}

function normalizeDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

// ============================================================
// SECTION 22: Payment/status formatting
// Formats payment badges and readable dates.
// ============================================================

function getPaymentClass(status) {
  if (status === "paid") return "paid";
  if (status === "partially_paid") return "partial";
  if (status === "unpaid") return "danger";

  return "pending";
}

function formatPaymentStatus(status) {
  if (status === "paid") return "Paid";
  if (status === "partially_paid") return "Partially Paid";
  if (status === "pending") return "Pending";
  if (status === "unpaid") return "Unpaid";
  if (status === "rejected") return "Rejected";

  return capitalize(status);
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
}

function formatTime(value) {
  if (!value) return "N/A";

  const text = String(value).trim();
  const parts = text.split(":");

  if (parts.length < 2) return text;

  let hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) return text;

  const suffix = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${suffix}`;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function capitalize(text) {
  if (!text) return "";

  const value = String(text);
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ============================================================
// SECTION 23: DOM and message helpers
// Updates text and shows toast/alert.
// ============================================================

function setText(id, value) {
  const el = document.getElementById(id);

  if (el) {
    el.textContent = value;
  }
}

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}

// ============================================================
// SECTION 24: Escape helper
// Prevents unsafe text from breaking table HTML.
// ============================================================

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}