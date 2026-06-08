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
let selectedExtendStayBookingId = null;
let currentSearchTerm = "";
let addAccommodationAvailabilityTimer = null;
let addAccommodationAvailabilityState = "unknown";
let extendStayAvailabilityTimer = null;
let extendStayAvailabilityState = "unknown";

// ============================================================
// SECTION 1: Page startup
// Checks access, connects events, and loads guests.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupEvents();
  removeEntranceFeeReminderColumn();
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
      }
    });
  }

  if (addAccommodationSelect) {
    addAccommodationSelect.addEventListener("change", () => {
      populateAddAccommodationSlotOptions();
      updateAddAccommodationModeFields();
      updateAddAccommodationModeFields();
      updateAddAccommodationStayDurationOptions();
      updateAddAccommodationExtensionDateMinimum();
      updateAddAccommodationPreview();
      scheduleAddAccommodationAvailabilityCheck();
    });
  }

  if (addAccommodationSlot) {
    addAccommodationSlot.addEventListener("change", () => {
      updateAddAccommodationStayDurationOptions();
      updateAddAccommodationExtensionDateMinimum();
      updateAddAccommodationPreview();
      scheduleAddAccommodationAvailabilityCheck();
    });
  }

  if (addAccommodationDate) {
    addAccommodationDate.addEventListener("change", () => {
      updateAddAccommodationPreview();
      scheduleAddAccommodationAvailabilityCheck();
    });
    addAccommodationDate.addEventListener("input", () => {
      updateAddAccommodationPreview();
      scheduleAddAccommodationAvailabilityCheck();
    });
  }

  if (addAccommodationStayDuration) {
    addAccommodationStayDuration.addEventListener("change", () => {
      updateAddAccommodationPreview();
      scheduleAddAccommodationAvailabilityCheck();
    });
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
      closeExtendStayModal();
    }
  });
}


// ============================================================
// SECTION 3.1: Table cleanup
// Removes Entrance Fee Reminder from Guests Inside because only checked-in guests appear here.
// Entrance fee should already be handled during Check In / Allow Entry.
// ============================================================

function removeEntranceFeeReminderColumn() {
  const table = document.querySelector(".guests-table");
  if (!table) return;

  const headers = Array.from(table.querySelectorAll("thead th"));
  const entranceIndex = headers.findIndex((header) =>
    String(header.textContent || "").trim().toLowerCase().includes("entrance fee")
  );

  if (entranceIndex < 0) return;

  headers[entranceIndex].remove();
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
          <td colspan="9" class="table-message">Loading guests inside...</td>
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
          <td colspan="9" class="table-message">Failed to load guests inside.</td>
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
    const itemSearchText = Array.isArray(booking.items)
      ? booking.items
          .map((item) =>
            [
              item.accommodation_name,
              item.category_name,
              item.slot_label,
              item.check_in_date,
              item.check_out_date,
              item.check_in_time,
              item.check_out_time,
            ].join(" ")
          )
          .join(" ")
      : "";

    const searchableText = [
      booking.reservation_code,
      booking.fullname,
      booking.room_name,
      booking.accommodation_name,
      itemSearchText,
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

    // Guests Inside should show guests once admin/staff already clicked Check In / Allow Entry.
    // Do not hide the guest just because the scheduled check-in time is later than the current time.
    if (status !== "approved" || !isCheckedIn) {
      return false;
    }

    const checkOutDateTime = getLatestCheckOutDateTime(booking);

    // If checkout date/time is missing, still show the checked-in guest so staff can monitor it.
    if (!checkOutDateTime) {
      return true;
    }

    // Hide only when all reservation items are already past their checkout time.
    return checkOutDateTime >= now;
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
    const unpaidExtraBedFee = getUnpaidExtraBedFee(booking);
    const timeInfo = getTimeStatus(booking);

    // Guests Inside should normally have no remaining accommodation balance
    // because check-in/front desk processing collects it first.
    // Payment reminder here is mainly for unpaid extra bed.
    if (unpaidExtraBedFee > 0) {
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
        <td colspan="9" class="table-message">
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
      const extraBedCount = Number(booking.extra_bed_count || 0);
      const extraBedFee = Number(booking.extra_bed_fee || 0);
      const unpaidExtraBedFee = getUnpaidExtraBedFee(booking);
      const extraBedPaid = isExtraBedPaid(booking);

      const timeInfo = getTimeStatus(booking);
      const paymentClass = getPaymentClass(paymentStatus);

      const frontDeskNote = getFrontDeskNote(
        remainingBalance,
        unpaidExtraBedFee,
        timeInfo
      );

      const bookingItems = getBookingItems(booking);

      const accommodationHtml = formatAccommodationDisplay(
        bookingItems,
        booking.room_name || booking.accommodation_name || "-",
        Number(booking.id)
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
          unpaidExtraBedFee
        )}">
          <td>
            <strong>${escapeHtml(booking.reservation_code || `#${booking.id}`)}</strong>
          </td>

          <td>${escapeHtml(booking.fullname || "-")}</td>
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
            <div class="extra-bed-combined ${unpaidExtraBedFee > 0 ? "unpaid" : "paid"}">
              <strong>${extraBedCount} bed(s)</strong>
              <small>₱200 each</small>
              <span>Fee: ₱${formatMoney(extraBedFee)}</span>
              ${
                extraBedFee > 0
                  ? `<em class="${extraBedPaid ? "paid-text" : "unpaid-text"}">${extraBedPaid ? "Paid" : "Unpaid"}</em>`
                  : `<em class="paid-text">No fee</em>`
              }
            </div>
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
    } under reservation ${booking.reservation_code || `#${booking.id}`}. Collect payment first before saving. This add-on will be recorded as paid onsite.`;
  }

  if (dateInput) {
    dateInput.min = getTodayInputDate();
    dateInput.value = getTodayInputDate();
  }

  populateAddAccommodationOptions();
  populateAddAccommodationSlotOptions();
  updateAddAccommodationModeFields();
  updateAddAccommodationStayDurationOptions();
  updateAddAccommodationExtensionDateMinimum();
  updateAddAccommodationPreview();

  modal.classList.add("show");

  // Run one more check after the modal is visible so the status box/button
  // does not stay stuck on "Select schedule to check availability."
  setTimeout(() => {
    scheduleAddAccommodationAvailabilityCheck();
  }, 150);
}

function closeAddAccommodationModal() {
  const modal = document.getElementById("addAccommodationModal");

  selectedAddAccommodationBookingId = null;

  if (modal) {
    modal.classList.remove("show");
  }
}

function getSelectedAddAccommodationBooking() {
  if (!selectedAddAccommodationBookingId) return null;

  return (
    allBookings.find(
      (booking) => Number(booking.id) === Number(selectedAddAccommodationBookingId)
    ) || null
  );
}

function getLatestReservationItemForAccommodation(accommodationId) {
  const booking = getSelectedAddAccommodationBooking();

  if (!booking || !accommodationId) return null;

  const matchingItems = getBookingItems(booking).filter(
    (item) => Number(item.accommodation_id) === Number(accommodationId)
  );

  if (!matchingItems.length) return null;

  return matchingItems.reduce((latest, item) => {
    const latestDateTime = latest
      ? combineDateAndTime(
          latest.check_out_date || latest.check_out,
          latest.check_out_time,
          true
        )
      : null;

    const itemDateTime = combineDateAndTime(
      item.check_out_date || item.check_out,
      item.check_out_time,
      true
    );

    if (!itemDateTime) return latest;
    if (!latestDateTime) return item;

    return itemDateTime.getTime() > latestDateTime.getTime() ? item : latest;
  }, matchingItems[0]);
}

function isSelectedAccommodationExtensionMode() {
  const accommodationId = Number(
    document.getElementById("addAccommodationSelect")?.value || 0
  );

  return Boolean(getLatestReservationItemForAccommodation(accommodationId));
}

function getSelectedExtensionItem() {
  const accommodationId = Number(
    document.getElementById("addAccommodationSelect")?.value || 0
  );

  return getLatestReservationItemForAccommodation(accommodationId);
}

function updateAddAccommodationExtensionDateMinimum() {
  const dateInput = document.getElementById("addAccommodationDate");
  if (!dateInput) return;

  const today = getTodayInputDate();
  const extensionItem = getSelectedExtensionItem();

  if (!extensionItem) {
    dateInput.min = today;

    if (!dateInput.value || dateInput.value < today) {
      dateInput.value = today;
    }

    return;
  }

  const checkOutDate = String(
    extensionItem.check_out_date || extensionItem.check_out || today
  ).slice(0, 10);

  dateInput.min = checkOutDate;
  dateInput.value = checkOutDate;
}

function setAddAccommodationGroupVisibility(inputId, shouldShow) {
  const input = document.getElementById(inputId);
  const group = input?.closest(".add-accommodation-form-group");

  if (group) {
    group.style.display = shouldShow ? "" : "none";
  }

  if (input) {
    input.disabled = !shouldShow;
  }
}

function updateAddAccommodationModeFields() {
  const isExtensionMode = Boolean(getSelectedExtensionItem());

  /*
    Same accommodation = Extension mode:
    - Hide Slot Type and Reservation Date because they are not used.
    - Extension starts from the current checkout, so no gap is created.
    Different accommodation = Normal add-on:
    - Keep original Slot Type and Reservation Date behavior.
  */
  setAddAccommodationGroupVisibility("addAccommodationSlot", !isExtensionMode);
  setAddAccommodationGroupVisibility("addAccommodationDate", !isExtensionMode);
  updateExtensionTypeVisibility();
}

function ensureExtensionTypeControl() {
  let select = document.getElementById("addAccommodationExtensionType");

  if (select) return select;

  const durationSelect = document.getElementById("addAccommodationStayDuration");
  const durationGroup = durationSelect?.closest(".add-accommodation-form-group");

  if (!durationGroup || !durationGroup.parentNode) return null;

  const group = document.createElement("div");
  group.className = "add-accommodation-form-group";
  group.id = "addAccommodationExtensionTypeGroup";

  group.innerHTML = `
    <label for="addAccommodationExtensionType">Extension Type</label>
    <select id="addAccommodationExtensionType"></select>
    <small id="addAccommodationExtensionTypeHelp">
      Extension starts from the current checkout and still checks availability.
    </small>
  `;

  durationGroup.parentNode.insertBefore(group, durationGroup);

  select = document.getElementById("addAccommodationExtensionType");

  if (select) {
    select.addEventListener("change", () => {
      updateAddAccommodationStayDurationOptions();
      updateAddAccommodationPreview();
      scheduleAddAccommodationAvailabilityCheck();
    });
  }

  return select;
}

function getExtensionHalfTypeForItem(item) {
  const hour = Number(String(item?.check_out_time || "00:00:00").split(":")[0]);

  /*
    If the current checkout is in the morning, the practical half extension
    is the day-side extension until 7:00 PM.
    If the current checkout is in the afternoon/evening, the practical half
    extension is the overnight-side extension until 5:00 AM next day.
  */
  return hour < 12 ? "day_half" : "overnight_half";
}

function getExtensionHalfLabelForType(type) {
  return type === "day_half"
    ? "Half-day / Day Extension (until 5:00 PM)"
    : "Half-day / Overnight Extension (until 5:00 AM)";
}

function updateExtensionTypeOptions() {
  const select = ensureExtensionTypeControl();
  const item = getSelectedExtensionItem();

  if (!select || !item) return;

  const halfType = getExtensionHalfTypeForItem(item);
  const currentValue = select.value;

  select.innerHTML = `
    <option value="${halfType}">${getExtensionHalfLabelForType(halfType)}</option>
    <option value="full_day">Full-day Extension</option>
  `;

  select.value = currentValue === "full_day" ? "full_day" : halfType;

  const help = document.getElementById("addAccommodationExtensionTypeHelp");

  if (help) {
    help.textContent =
      halfType === "day_half"
        ? "Day extension starts from the current checkout and ends at 5:00 PM the same day."
        : "Overnight extension starts from the current checkout and ends at 5:00 AM next day.";
  }
}

function getSelectedExtensionType() {
  const selectedValue = document.getElementById("addAccommodationExtensionType")?.value;

  if (selectedValue) {
    return selectedValue;
  }

  const item = getSelectedExtensionItem();

  return item ? getExtensionHalfTypeForItem(item) : "overnight_half";
}

function updateExtensionTypeVisibility() {
  const isExtensionMode = Boolean(getSelectedExtensionItem());
  const select = ensureExtensionTypeControl();
  const group = document.getElementById("addAccommodationExtensionTypeGroup");

  if (group) {
    group.style.display = isExtensionMode ? "" : "none";
  }

  if (select) {
    select.disabled = !isExtensionMode;
  }

  if (isExtensionMode) {
    updateExtensionTypeOptions();
  }
}

function getExtensionDurationValue() {
  const durationSelect = document.getElementById("addAccommodationStayDuration");

  if (["overnight_half", "day_half"].includes(getSelectedExtensionType())) {
    return 1;
  }

  return Math.max(
    1,
    Math.min(5, Math.floor(Number(durationSelect?.value || 1)))
  );
}

function getExtensionDurationUnit(extensionItem, amount = 1) {
  return getExtensionUnitLabel(extensionItem, amount);
}

function getExtensionPreviewDetails(extensionItem, duration) {
  if (!extensionItem) return null;

  const extensionType = getSelectedExtensionType();
  const currentCheckOutDate = String(
    extensionItem.check_out_date || extensionItem.check_out || ""
  ).slice(0, 10);
  const currentCheckOutTime = extensionItem.check_out_time || "00:00:00";

  if (extensionType === "overnight_half") {
    return {
      currentCheckOutDate,
      currentCheckOutTime,
      newCheckOutDate: addDaysToDateOnly(currentCheckOutDate, 1),
      newCheckOutTime: "05:00:00",
      extensionFee: getOvernightExtensionPrice(extensionItem),
      extensionType,
    };
  }

  if (extensionType === "day_half") {
    return {
      currentCheckOutDate,
      currentCheckOutTime,
      newCheckOutDate: currentCheckOutDate,
      newCheckOutTime: "17:00:00",
      extensionFee: getDayExtensionPrice(extensionItem),
      extensionType,
    };
  }

  const unitPrice = getItemUnitPrice(extensionItem);
  const extensionFee = unitPrice * duration;

  return {
    currentCheckOutDate,
    currentCheckOutTime,
    newCheckOutDate: addDaysToDateOnly(currentCheckOutDate, duration),
    newCheckOutTime: currentCheckOutTime,
    extensionFee,
    extensionType,
  };
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

  const extensionItem = getSelectedExtensionItem();

  if (extensionItem) {
    const extensionType = getSelectedExtensionType();

    if (["overnight_half", "day_half"].includes(extensionType)) {
      durationSelect.disabled = true;
      durationSelect.innerHTML = `<option value="1">1 half-day extension only</option>`;
      return;
    }

    durationSelect.disabled = false;
    durationSelect.innerHTML = [1, 2, 3, 4, 5]
      .map((value) => `<option value="${value}">${value} day${value > 1 ? "s" : ""}</option>`)
      .join("");
    return;
  }

  const slotType = String(slotSelect?.value || "").toLowerCase();

  if (slotType === "extended" || slotType === "overnight") {
    durationSelect.disabled = false;

    const unit = slotType === "overnight" ? "night" : "day";

    durationSelect.innerHTML = [1, 2, 3, 4, 5]
      .map((value) => `<option value="${value}">${value} ${unit}${value > 1 ? "s" : ""}</option>`)
      .join("");
    return;
  }

  durationSelect.disabled = true;
  durationSelect.innerHTML = `<option value="1">1 day only</option>`;
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
    setAddAccommodationButtonState("incomplete");
    return;
  }

  const extensionItem = getLatestReservationItemForAccommodation(
    Number(accommodation.id)
  );

  if (extensionItem) {
    updateAddAccommodationModeFields();

    const stayDuration = getExtensionDurationValue();
    const details = getExtensionPreviewDetails(extensionItem, stayDuration);
    const unitLabel = getExtensionUnitLabel(extensionItem, stayDuration);
    const currentName =
      extensionItem.accommodation_name ||
      extensionItem.room_name ||
      extensionItem.name ||
      accommodation.name;

    preview.innerHTML = `
      <strong>${escapeHtml(currentName)}</strong><br>
      Category: ${escapeHtml(accommodation.category_name || "Accommodation")}<br>
      Mode: <strong>${details.extensionType === "day_half" ? "Half-day / Day Extension" : details.extensionType === "overnight_half" ? "Half-day / Overnight Extension" : "Full-day Extension"}</strong><br>
      Current checkout: ${formatDate(details.currentCheckOutDate)} ${formatTime(details.currentCheckOutTime)}<br>
      New checkout: ${formatDate(details.newCheckOutDate)} ${formatTime(details.newCheckOutTime)}<br>
      Extension duration: ${["overnight_half", "day_half"].includes(details.extensionType) ? "1 half-day extension" : `${stayDuration} ${escapeHtml(unitLabel)}`}<br>
      Cash to collect now: <strong>₱${formatMoney(details.extensionFee)}</strong>
      <div class="extension-note">
        No gap will be created. This extends the same accommodation starting from the current checkout time.
      </div>
      <div id="addAccommodationAvailabilityStatus" class="availability-status muted">
        Checking extension availability...
      </div>
    `;

    scheduleAddAccommodationAvailabilityCheck();
    return;
  }

  updateAddAccommodationModeFields();

  const slot = getSlotOptions(accommodation).find(
    (item) => item.value === slotSelect?.value
  );

  if (!slot) {
    preview.innerHTML = `
      <strong>${escapeHtml(accommodation.name)}</strong><br>
      Category: ${escapeHtml(accommodation.category_name || "Accommodation")}<br>
      Select a slot to continue.
    `;
    setAddAccommodationButtonState("incomplete");
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

  const durationUnit = slot.value === "overnight" ? "night" : "day";

  preview.innerHTML = `
    <strong>${escapeHtml(accommodation.name)}</strong><br>
    Category: ${escapeHtml(accommodation.category_name || "Accommodation")}<br>
    Schedule: ${escapeHtml(slot.label)} (${formatTime(slot.start)} - ${formatTime(slot.end)})<br>
    Stay Duration: ${stayDuration} ${durationUnit}${stayDuration > 1 ? "s" : ""}<br>
    Check-in: ${formatDate(checkInDate)} ${formatTime(slot.start)}<br>
    Check-out: ${formatDate(checkOutDate)} ${formatTime(slot.end)}<br>
    Cash to collect now: <strong>₱${formatMoney(total)}</strong>
    <div id="addAccommodationAvailabilityStatus" class="availability-status muted">
      Checking availability...
    </div>
  `;

  scheduleAddAccommodationAvailabilityCheck();
}

function getAddAccommodationAvailabilityPayload() {
  const accommodationId = Number(
    document.getElementById("addAccommodationSelect")?.value || 0
  );

  if (!accommodationId) {
    return null;
  }

  const extensionItem = getLatestReservationItemForAccommodation(accommodationId);

  if (extensionItem) {
    return {
      mode: "extend",
      reservation_id: Number(selectedAddAccommodationBookingId),
      reservation_item_id: Number(extensionItem.id),
      extension_type: getSelectedExtensionType(),
      extension_duration: getExtensionDurationValue(),
    };
  }

  const slotType = document.getElementById("addAccommodationSlot")?.value || "";
  const checkInDate = document.getElementById("addAccommodationDate")?.value || "";
  const stayDuration = getValidStayDuration(
    document.getElementById("addAccommodationStayDuration")?.value,
    slotType
  );

  if (!slotType || !checkInDate) {
    return null;
  }

  return {
    mode: "add",
    accommodation_id: accommodationId,
    slot_type: slotType,
    check_in_date: checkInDate,
    stay_duration: stayDuration,
  };
}

function scheduleAddAccommodationAvailabilityCheck() {
  clearTimeout(addAccommodationAvailabilityTimer);

  if (!document.getElementById("addAccommodationAvailabilityStatus")) {
    setAddAccommodationButtonState("incomplete");
    return;
  }

  addAccommodationAvailabilityState = "checking";
  setAvailabilityStatus(
    "addAccommodationAvailabilityStatus",
    "checking",
    "Checking availability..."
  );
  setAddAccommodationButtonState("checking");

  addAccommodationAvailabilityTimer = setTimeout(() => {
    checkAddAccommodationAvailabilityNow(false);
  }, 350);
}

async function checkAddAccommodationAvailabilityNow(showErrors = true) {
  const payload = getAddAccommodationAvailabilityPayload();

  if (!payload) {
    addAccommodationAvailabilityState = "unknown";
    setAvailabilityStatus(
      "addAccommodationAvailabilityStatus",
      "muted",
      "Complete the form to check availability."
    );
    setAddAccommodationButtonState("incomplete");
    return false;
  }

  const result = await checkItemAvailability(payload);

  if (result.available) {
    addAccommodationAvailabilityState = "available";
    setAvailabilityStatus(
      "addAccommodationAvailabilityStatus",
      "available",
      `✅ AVAILABLE — ${result.message || "This schedule is available."}`
    );
    setAddAccommodationButtonState("available");
    return true;
  }

  addAccommodationAvailabilityState = "unavailable";
  setAvailabilityStatus(
    "addAccommodationAvailabilityStatus",
    "unavailable",
    `❌ NOT AVAILABLE — ${result.message || "Please choose another schedule."}`
  );
  setAddAccommodationButtonState("unavailable");

  if (showErrors) {
    showMessage(result.message || "Selected accommodation is not available.", "error");
  }

  return false;
}


async function submitAddAccommodation() {
  if (!selectedAddAccommodationBookingId) {
    showMessage("No selected reservation.", "error");
    return;
  }

  const accommodationId = Number(
    document.getElementById("addAccommodationSelect")?.value || 0
  );

  if (!accommodationId) {
    showMessage("Please select an accommodation.", "error");
    return;
  }

  const extensionItem = getLatestReservationItemForAccommodation(accommodationId);
  const isExtensionMode = Boolean(extensionItem);

  const slotType = document.getElementById("addAccommodationSlot")?.value || "";
  const checkInDate = document.getElementById("addAccommodationDate")?.value || "";
  const stayDuration = isExtensionMode
    ? getExtensionDurationValue()
    : getValidStayDuration(
        document.getElementById("addAccommodationStayDuration")?.value,
        slotType
      );

  if (!isExtensionMode && (!slotType || !checkInDate)) {
    showMessage("Please complete the add accommodation form.", "error");
    return;
  }

  const available = await checkAddAccommodationAvailabilityNow();

  if (!available) {
    return;
  }

  const confirmed = confirm(
    isExtensionMode
      ? getSelectedExtensionType() === "day_half"
        ? "Payment should be collected first. Continue half-day / day extension with no schedule gap?"
        : getSelectedExtensionType() === "overnight_half"
          ? "Payment should be collected first. Continue half-day / overnight extension with no schedule gap?"
          : "Payment should be collected first. Continue full-day extension with no schedule gap?"
      : "Payment should be collected first. Continue adding this accommodation as paid onsite?"
  );

  if (!confirmed) return;

  const saveBtn = document.getElementById("saveAddAccommodationBtn");
  const originalText = saveBtn ? saveBtn.textContent : "Add Accommodation";

  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = isExtensionMode ? "Extending..." : "Adding...";
    }

    const endpoint = isExtensionMode
      ? `${API_BASE}/bookings/${selectedAddAccommodationBookingId}/extend-stay`
      : `${API_BASE}/bookings/${selectedAddAccommodationBookingId}/add-accommodation`;

    const body = isExtensionMode
      ? {
          reservation_item_id: Number(extensionItem.id),
          extension_type: getSelectedExtensionType(),
          extension_duration: stayDuration,
        }
      : {
          accommodation_id: accommodationId,
          slot_type: slotType,
          check_in_date: checkInDate,
          stay_duration: stayDuration,
        };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          (isExtensionMode ? "Failed to extend stay." : "Failed to add accommodation.")
      );
    }

    closeAddAccommodationModal();
    await loadGuestsInside();

    showMessage(
      data.message ||
        (isExtensionMode
          ? "Stay extended successfully."
          : "Accommodation added successfully."),
      "success"
    );
  } catch (error) {
    console.error("submitAddAccommodation error:", error);
    showMessage(
      error.message ||
        (isExtensionMode ? "Failed to extend stay." : "Failed to add accommodation."),
      "error"
    );
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
  return slotType === "extended" || slotType === "overnight" ? duration : 1;
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


// ============================================================
// SECTION 16.1: Extend stay
// Allows front desk to extend the same accommodation if available.
// Extension is recorded as cash paid onsite.
// ============================================================

function ensureExtendStayModal() {
  let modal = document.getElementById("extendStayModal");

  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "extendStayModal";
  modal.className = "extend-stay-modal";

  modal.innerHTML = `
    <div class="extend-stay-modal-box">
      <h2>Extend Stay</h2>
      <p id="extendStayReservationText">
        Select the accommodation and extension duration. The extension is recorded as cash paid onsite.
      </p>

      <div class="extend-stay-form-group">
        <label for="extendStayItemSelect">Accommodation to Extend</label>
        <select id="extendStayItemSelect"></select>
        <small>Only accommodations under this active reservation are shown.</small>
      </div>

      <div class="extend-stay-form-group">
        <label for="extendStayDurationSelect">Extension Duration</label>
        <select id="extendStayDurationSelect">
          <option value="1">1 day/night</option>
          <option value="2">2 days/nights</option>
          <option value="3">3 days/nights</option>
          <option value="4">4 days/nights</option>
          <option value="5">5 days/nights</option>
        </select>
        <small>Front desk must collect the extension payment before saving.</small>
      </div>

      <div id="extendStayPreview" class="extend-stay-preview">
        Select an accommodation to preview the extension.
      </div>

      <div class="extend-stay-modal-actions">
        <button type="button" class="modal-btn primary" id="saveExtendStayBtn">
          Save Extension
        </button>
        <button type="button" class="modal-btn light" id="cancelExtendStayBtn">
          Cancel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeExtendStayModal();
    }
  });

  modal.querySelector("#extendStayItemSelect")?.addEventListener("change", () => {
    updateExtendStayPreview();
    scheduleExtendStayAvailabilityCheck();
  });
  modal.querySelector("#extendStayDurationSelect")?.addEventListener("change", () => {
    updateExtendStayPreview();
    scheduleExtendStayAvailabilityCheck();
  });
  modal.querySelector("#saveExtendStayBtn")?.addEventListener("click", submitExtendStay);
  modal.querySelector("#cancelExtendStayBtn")?.addEventListener("click", closeExtendStayModal);

  return modal;
}

function openExtendStayModal(bookingId) {
  const booking = allBookings.find(
    (item) => Number(item.id) === Number(bookingId)
  );

  if (!booking) {
    showMessage("Booking not found.", "error");
    return;
  }

  const items = getBookingItems(booking);

  if (!items.length) {
    showMessage("No accommodation items available to extend.", "error");
    return;
  }

  selectedExtendStayBookingId = Number(bookingId);

  const modal = ensureExtendStayModal();
  const guestText = document.getElementById("extendStayReservationText");
  const itemSelect = document.getElementById("extendStayItemSelect");
  const durationSelect = document.getElementById("extendStayDurationSelect");

  if (guestText) {
    guestText.textContent = `Extend stay for ${
      booking.fullname || "this guest"
    } under reservation ${booking.reservation_code || `#${booking.id}`}. This extension is recorded as cash paid onsite.`;
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
            ${index + 1}. ${escapeHtml(name)} - ${escapeHtml(item.slot_label || "Schedule")}
          </option>
        `;
      })
      .join("");
  }

  if (durationSelect) {
    durationSelect.value = "1";
  }

  updateExtendStayPreview();
  scheduleExtendStayAvailabilityCheck();
  modal.classList.add("show");
}

function closeExtendStayModal() {
  const modal = document.getElementById("extendStayModal");

  selectedExtendStayBookingId = null;

  if (modal) {
    modal.classList.remove("show");
  }
}

function getSelectedExtendStayItem() {
  if (!selectedExtendStayBookingId) return null;

  const booking = allBookings.find(
    (item) => Number(item.id) === Number(selectedExtendStayBookingId)
  );

  if (!booking) return null;

  const selectedItemId = Number(
    document.getElementById("extendStayItemSelect")?.value || 0
  );

  return getBookingItems(booking).find(
    (item) => Number(item.id) === Number(selectedItemId)
  ) || null;
}

function getExtensionDuration() {
  return Math.max(
    1,
    Math.min(
      5,
      Math.floor(Number(document.getElementById("extendStayDurationSelect")?.value || 1))
    )
  );
}

function updateExtendStayPreview() {
  const preview = document.getElementById("extendStayPreview");
  if (!preview) return;

  const item = getSelectedExtendStayItem();

  if (!item) {
    preview.innerHTML = "Select an accommodation to preview the extension.";
    return;
  }

  const duration = getExtensionDuration();
  const unitLabel = getExtensionUnitLabel(item, duration);
  const oldCheckOutDate = item.check_out_date || item.check_out || "";
  const oldCheckOutTime = item.check_out_time || "";
  const newCheckOutDate = addDaysToDateOnly(oldCheckOutDate, duration);
  const unitPrice = getItemUnitPrice(item);
  const extensionFee = unitPrice * duration;
  const name = item.accommodation_name || item.room_name || item.name || "Accommodation";

  preview.innerHTML = `
    <strong>${escapeHtml(name)}</strong><br>
    Current checkout: ${formatDate(oldCheckOutDate)} ${formatTime(oldCheckOutTime)}<br>
    New checkout: ${formatDate(newCheckOutDate)} ${formatTime(oldCheckOutTime)}<br>
    Extension: ${duration} ${escapeHtml(unitLabel)}<br>
    Cash to collect now: <strong>₱${formatMoney(extensionFee)}</strong><br>
    <div id="extendStayAvailabilityStatus" class="availability-status muted">
      Checking extension availability...
    </div>
  `;

  scheduleExtendStayAvailabilityCheck();
}


function getExtendStayAvailabilityPayload() {
  if (!selectedExtendStayBookingId) return null;

  const item = getSelectedExtendStayItem();

  if (!item) return null;

  return {
    mode: "extend",
    reservation_id: Number(selectedExtendStayBookingId),
    reservation_item_id: Number(item.id),
    extension_duration: getExtensionDuration(),
  };
}

function scheduleExtendStayAvailabilityCheck() {
  clearTimeout(extendStayAvailabilityTimer);

  extendStayAvailabilityState = "checking";
  setAvailabilityStatus(
    "extendStayAvailabilityStatus",
    "checking",
    "Checking extension availability..."
  );
  setButtonAvailability("saveExtendStayBtn", false);

  extendStayAvailabilityTimer = setTimeout(() => {
    checkExtendStayAvailabilityNow(false);
  }, 350);
}

async function checkExtendStayAvailabilityNow(showErrors = true) {
  const payload = getExtendStayAvailabilityPayload();

  if (!payload) {
    extendStayAvailabilityState = "unknown";
    setAvailabilityStatus(
      "extendStayAvailabilityStatus",
      "muted",
      "Select accommodation and duration to check availability."
    );
    setButtonAvailability("saveExtendStayBtn", false);
    return false;
  }

  const result = await checkItemAvailability(payload);

  if (result.available) {
    extendStayAvailabilityState = "available";
    setAvailabilityStatus(
      "extendStayAvailabilityStatus",
      "available",
      `Available: ${result.message || "This extension is available."}`
    );
    setButtonAvailability("saveExtendStayBtn", true);
    return true;
  }

  extendStayAvailabilityState = "unavailable";
  setAvailabilityStatus(
    "extendStayAvailabilityStatus",
    "unavailable",
    `Not available: ${result.message || "Please choose another option."}`
  );
  setButtonAvailability("saveExtendStayBtn", false);

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
    showMessage("Please select an accommodation to extend.", "error");
    return;
  }

  const duration = getExtensionDuration();
  const unitLabel = getExtensionUnitLabel(item, duration);
  const extensionFee = getItemUnitPrice(item) * duration;

  const available = await checkExtendStayAvailabilityNow();

  if (!available) {
    return;
  }

  const confirmed = confirm(
    `Extend this stay by ${duration} ${unitLabel}?\n\nCash to collect now: ₱${formatMoney(extensionFee)}`
  );

  if (!confirmed) return;

  const saveBtn = document.getElementById("saveExtendStayBtn");
  const originalText = saveBtn ? saveBtn.textContent : "Save Extension";

  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
    }

    const response = await fetch(
      `${API_BASE}/bookings/${selectedExtendStayBookingId}/extend-stay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservation_item_id: Number(item.id),
          extension_duration: duration,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to extend stay.");
    }

    closeExtendStayModal();
    await loadGuestsInside();

    showMessage(data.message || "Stay extended successfully.", "success");
  } catch (error) {
    console.error("submitExtendStay error:", error);
    showMessage(error.message || "Failed to extend stay.", "error");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = originalText;
    }
  }
}

function getDayExtensionPrice(item) {
  const accommodation = getAccommodationById(item?.accommodation_id);

  return Number(accommodation?.day_price || item?.day_price || 0);
}

function getOvernightExtensionPrice(item) {
  const accommodation = getAccommodationById(item?.accommodation_id);

  return Number(accommodation?.overnight_price || item?.overnight_price || 0);
}

function getItemUnitPrice(item) {
  const itemPrice = Number(item.item_price || 0);
  const stayDuration = Math.max(1, Number(item.stay_duration || 1));

  if (itemPrice > 0) {
    return itemPrice / stayDuration;
  }

  return 0;
}

function getExtensionUnitLabel(item, amount = 1) {
  const slotLabel = String(item.slot_label || item.slot_type || "").toLowerCase();
  const plural = Number(amount || 0) !== 1;

  if (slotLabel.includes("overnight")) {
    return plural ? "nights" : "night";
  }

  return plural ? "days" : "day";
}

function addDaysToDateOnly(dateValue, daysToAdd = 0) {
  const cleanDate = String(dateValue || "").slice(0, 10);

  if (!cleanDate) return "";

  const date = new Date(`${cleanDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) return cleanDate;

  date.setDate(date.getDate() + Number(daysToAdd || 0));

  return toInputDateValue(date);
}

function viewReceipt(bookingId) {
  window.location.href = `admin-booking-receipt.html?id=${bookingId}`;
}

// ============================================================
// SECTION 17: Accommodation display helper
// Handles accommodation text like "Room A +2 more".
// ============================================================

function getBookingItems(booking) {
  if (Array.isArray(booking.items) && booking.items.length) {
    return booking.items;
  }

  if (Array.isArray(booking.reservation_items) && booking.reservation_items.length) {
    return booking.reservation_items;
  }

  return [];
}

function formatAccommodationDisplay(items, fallbackName = "-", bookingId = 0) {
  const validItems = Array.isArray(items) ? items : [];

  if (validItems.length) {
    return `
      <div class="guest-simple-accommodation-list">
        ${validItems
          .map((item, index) => {
            const name =
              item.accommodation_name ||
              item.room_name ||
              item.name ||
              `Accommodation ${index + 1}`;

            return `
              <div class="guest-simple-accommodation-item">
                <span>${index + 1}.</span>
                <strong>${escapeHtml(name)}</strong>
              </div>
            `;
          })
          .join("")}

        ${
          validItems.length > 1
            ? `<button type="button" class="view-items-btn" onclick="openAccommodationDetails(${Number(bookingId)})" title="View check-in, check-out, and time status per accommodation">
                View details
              </button>`
            : `<small class="single-item-note">${escapeHtml(formatItemShortInfo(validItems[0]))}</small>`
        }
      </div>
    `;
  }

  const text = String(fallbackName || "-").trim();

  if (!text || text === "-") {
    return `<div class="guest-simple-accommodation-list">-</div>`;
  }

  const accommodations = text
    .split(/,|\n|\+/)
    .map((item) => item.replace(/\d+\s*more/gi, "").trim())
    .filter(Boolean);

  if (!accommodations.length) {
    return `<div class="guest-simple-accommodation-list">${escapeHtml(text)}</div>`;
  }

  return `
    <div class="guest-simple-accommodation-list">
      ${accommodations
        .map(
          (item, index) => `
            <div class="guest-simple-accommodation-item">
              <span>${index + 1}.</span>
              <strong>${escapeHtml(item)}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function openAccommodationDetails(bookingId) {
  const booking = allBookings.find((item) => Number(item.id) === Number(bookingId));

  if (!booking) {
    showMessage("Booking not found.", "error");
    return;
  }

  const items = getBookingItems(booking);

  if (!items.length) {
    showMessage("No accommodation details available.", "error");
    return;
  }

  let modal = document.getElementById("accommodationDetailsModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "accommodationDetailsModal";
    modal.className = "accommodation-details-modal";

    modal.innerHTML = `
      <div class="accommodation-details-box">
        <div class="accommodation-details-header">
          <div>
            <h2>Accommodation Details</h2>
            <p id="accommodationDetailsSubtitle"></p>
          </div>

          <button type="button" onclick="closeAccommodationDetails()" aria-label="Close">
            ×
          </button>
        </div>

        <div id="accommodationDetailsList" class="accommodation-details-list"></div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  const subtitle = document.getElementById("accommodationDetailsSubtitle");
  const list = document.getElementById("accommodationDetailsList");

  if (subtitle) {
    subtitle.textContent = `${booking.reservation_code || `#${booking.id}`} • ${booking.fullname || "Guest"}`;
  }

  if (list) {
    list.innerHTML = items
      .map((item, index) => {
        const name =
          item.accommodation_name ||
          item.room_name ||
          item.name ||
          `Accommodation ${index + 1}`;

        return `
          <div class="accommodation-detail-card">
            <strong>${index + 1}. ${escapeHtml(name)}</strong>
            <p>${escapeHtml(formatItemShortInfo(item))}</p>
            ${renderItemTimeStatus(item)}
            <div>Check-in: <b>${formatDate(item.check_in_date || item.check_in)} • ${formatTime(item.check_in_time)}</b></div>
            <div>Check-out: <b>${formatDate(item.check_out_date || item.check_out)} • ${formatTime(item.check_out_time)}</b></div>
            <div>Price: <b>₱${formatMoney(item.item_price)}</b></div>
            <div class="early-entry-note">Note: Early entry is allowed if the accommodation is ready.</div>
          </div>
        `;
      })
      .join("");
  }

  modal.classList.add("show");
}

function closeAccommodationDetails() {
  const modal = document.getElementById("accommodationDetailsModal");

  if (modal) {
    modal.classList.remove("show");
  }
}


function renderItemTimeStatus(item) {
  const status = getItemTimeStatus(item);

  return `
            <div class="item-time-status-row">
              <span class="item-time-status ${status.level}">
                ${escapeHtml(status.label)}
              </span>
            </div>`;
}

function getItemTimeStatus(item) {
  const now = new Date();

  const checkInDateTime = combineDateAndTime(
    item.check_in_date || item.check_in,
    item.check_in_time,
    false,
  );

  const checkOutDateTime = combineDateAndTime(
    item.check_out_date || item.check_out,
    item.check_out_time,
    true,
  );

  if (!checkInDateTime || !checkOutDateTime) {
    return {
      label: "Schedule not available",
      level: "info",
    };
  }

  if (now < checkInDateTime) {
    const diffMinutes = Math.max(
      0,
      Math.floor((checkInDateTime.getTime() - now.getTime()) / 60000),
    );

    return {
      label: `Scheduled in ${formatDurationLeft(diffMinutes)}`,
      level: "pending",
    };
  }

  if (now > checkOutDateTime) {
    return {
      label: "Schedule ended",
      level: "danger",
    };
  }

  const diffMinutes = Math.max(
    0,
    Math.floor((checkOutDateTime.getTime() - now.getTime()) / 60000),
  );

  return {
    label: `${formatDurationLeft(diffMinutes)} left`,
    level: diffMinutes <= 60 ? "warning" : "active",
  };
}

function formatDurationLeft(totalMinutes) {
  const minutes = Math.max(0, Number(totalMinutes || 0));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  return `${mins}m`;
}


function formatItemShortInfo(item) {
  if (!item) return "";

  const slotLabel = item.slot_label || formatSlotType(item.slot_type);
  const duration = formatItemDuration(item);

  return `${slotLabel} • ${duration}`;
}

function formatSlotType(slotType) {
  const value = String(slotType || "").toLowerCase();

  if (value === "day_tour") return "Day Tour";
  if (value === "overnight") return "Overnight";
  if (value === "extended") return "22/23 Hours";

  return "Schedule";
}

function formatItemDuration(item) {
  const duration = Math.max(1, Number(item.stay_duration || 1));
  const slotType = String(item.slot_type || item.slot_label || "").toLowerCase();

  if (slotType.includes("overnight")) {
    return `${duration} ${duration === 1 ? "night" : "nights"}`;
  }

  if (slotType.includes("22") || slotType.includes("23") || slotType.includes("extended")) {
    return `${duration} ${duration === 1 ? "day" : "days"}`;
  }

  return "1 day";
}


// ============================================================
// SECTION 18: Time status
// Detects active, ending soon, or overdue.
// ============================================================

function getLatestCheckOutDateTime(booking) {
  const items = Array.isArray(booking?.items) ? booking.items : [];
  const checkOutTimes = [];

  items.forEach((item) => {
    const itemCheckOut = combineDateAndTime(
      item.check_out_date,
      item.check_out_time,
      true
    );

    if (itemCheckOut) {
      checkOutTimes.push(itemCheckOut);
    }
  });

  const mainCheckOut = combineDateAndTime(
    booking.check_out || booking.check_out_date,
    booking.check_out_time,
    true
  );

  if (mainCheckOut) {
    checkOutTimes.push(mainCheckOut);
  }

  if (!checkOutTimes.length) {
    return null;
  }

  return checkOutTimes.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest
  );
}

function getTimeStatus(booking) {
  const now = new Date();
  const checkOutDateTime = getLatestCheckOutDateTime(booking);

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

function getFrontDeskNote(remainingBalance, extraBedFee, timeInfo) {
  const totalToCollect =
    Number(remainingBalance || 0) +
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

function getRowClass(timeInfo, remainingBalance, extraBedFee) {
  if (timeInfo.level === "danger") return "guest-row-danger";
  if (timeInfo.level === "warning") return "guest-row-warning";

  if (remainingBalance > 0 || extraBedFee > 0) {
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


async function checkItemAvailability(payload) {
  try {
    const response = await fetch(`${API_BASE}/bookings/check-item-availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        available: false,
        message: data.message || "Failed to check availability.",
      };
    }

    return {
      available: Boolean(data.available),
      message: data.message || "",
      schedule: data.schedule || null,
    };
  } catch (error) {
    console.error("checkItemAvailability error:", error);

    return {
      available: false,
      message: "Unable to check availability. Please check backend connection.",
    };
  }
}

function setAvailabilityStatus(elementId, type, message) {
  const el = document.getElementById(elementId);

  if (!el) return;

  el.className = `availability-status ${type}`;
  el.textContent = message;
}


function setAddAccommodationButtonState(state) {
  const button = document.getElementById("saveAddAccommodationBtn");

  if (!button) return;

  if (!button.dataset.originalText) {
    button.dataset.originalText = "Add Accommodation";
  }

  if (state === "available") {
    button.disabled = false;
    button.classList.remove("disabled-by-availability");
    button.textContent = button.dataset.originalText;
    button.title = "Available. Collect payment first, then add accommodation.";
    return;
  }

  button.disabled = true;
  button.classList.add("disabled-by-availability");

  if (state === "checking") {
    button.textContent = "Checking...";
    button.title = "Checking availability. Please wait.";
    return;
  }

  if (state === "unavailable") {
    button.textContent = "Not Available";
    button.title = "Selected schedule is not available.";
    return;
  }

  button.textContent = "Complete Form";
  button.title = "Complete the form to check availability.";
}


function setButtonAvailability(buttonId, isAvailable) {
  const button = document.getElementById(buttonId);

  if (!button) return;

  button.disabled = !isAvailable;
  button.classList.toggle("disabled-by-availability", !isAvailable);

  if (buttonId === "saveAddAccommodationBtn") {
    button.title = isAvailable
      ? "Available. Collect payment first, then add accommodation."
      : "Not available or still checking. Please choose another schedule.";

    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent.trim() || "Add Accommodation";
    }

    button.textContent = isAvailable ? button.dataset.originalText : "Not Available";
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