// ============================================================
// SMARTRESORT ADMIN WALK-IN SCRIPT
// Purpose:
// - Check admin access
// - Load available accommodations
// - Build manual reservation items
// - Searchable accommodation picker
// - Compute estimated entrance fee and down payment
// - Save draft to sessionStorage
// - Continue to manual payment screen
// - Works from frontend/adminHTML/admin-walkin.html
// ============================================================

const ADMIN_WALKIN_DRAFT_KEY = "smartresort_admin_walkin_draft_v2";

let availableAccommodations = [];
let bookingItemCounter = 0;

// ============================================================
// SECTION 1: Page startup
// Checks admin access, loads rooms, sets events, and restores draft.
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  checkAdminAccess();
  setupLogout();
  setupGlobalPickerClose();
  await loadAccommodations();
  setupManualForm();
  restoreDraftIfAny();
});

// ============================================================
// SECTION 2: Admin access checker
// Redirects unauthenticated or non-admin users.
// ============================================================

function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "../index.html";
  }
}

// ============================================================
// SECTION 3: Logout
// Clears localStorage user and returns to auth login page.
// ============================================================

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    localStorage.removeItem("user");

    if (typeof showToast === "function") {
      showToast("Logged out successfully.", "success");
    }

    setTimeout(() => {
      window.location.href = "../authHTML/login.html";
    }, 700);
  });
}

// ============================================================
// SECTION 4: Load available accommodations
// Gets accommodation records from backend.
// ============================================================

async function loadAccommodations() {
  try {
    const response = await fetch(`${API_BASE}/rooms/available`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load accommodations.");
    }

    availableAccommodations = Array.isArray(data) ? data : data.rooms || [];

    if (!availableAccommodations.length) {
      showMessage("No available accommodations found.", "error");
      return;
    }

    addBookingItem();
    updateSummary();
  } catch (error) {
    console.error("loadAccommodations error:", error);
    showMessage(error.message || "Failed to load accommodations.", "error");
  }
}

// ============================================================
// SECTION 5: Setup manual reservation form
// Connects add item, input changes, and form submit.
// ============================================================

function setupManualForm() {
  const addItemBtn = document.getElementById("addItemBtn");
  const form = document.getElementById("walkInForm");

  if (addItemBtn) {
    addItemBtn.addEventListener("click", () => {
      addBookingItem();
    });
  }

  [
    document.getElementById("guestCount"),
    document.getElementById("entranceType"),
    document.getElementById("customerNote"),
    document.getElementById("firstName"),
    document.getElementById("middleName"),
    document.getElementById("lastName"),
    document.getElementById("contactNo"),
  ].forEach((el) => {
    if (el) {
      el.addEventListener("input", updateSummary);
      el.addEventListener("change", updateSummary);
    }
  });

  if (form) {
    form.addEventListener("submit", goToPaymentScreen);
  }
}

// ============================================================
// SECTION 6: Continue to payment screen
// Saves walk-in reservation draft and redirects to payment page.
// ============================================================

function goToPaymentScreen(e) {
  e.preventDefault();

  const first_name = document.getElementById("firstName").value.trim();
  const middle_name = document.getElementById("middleName").value.trim();
  const last_name = document.getElementById("lastName").value.trim();
  const contact_no = document.getElementById("contactNo").value.trim();
  const guest_count = Number(document.getElementById("guestCount").value);
  const entrance_type = document.getElementById("entranceType").value;
  const customerNote = document.getElementById("customerNote").value.trim();
  const items = collectBookingItems();

  if (!first_name || !last_name || !contact_no || !guest_count) {
    showMessage("Please fill in all required guest information.", "error");
    return;
  }

  if (!items.length) {
    showMessage("Please add at least one accommodation item.", "error");
    return;
  }

  const draft = {
    first_name,
    middle_name,
    last_name,
    contact_no,
    guest_count,
    entrance_type,
    note: customerNote,
    items,
    saved_at: new Date().toISOString(),
  };

  sessionStorage.setItem(ADMIN_WALKIN_DRAFT_KEY, JSON.stringify(draft));

  window.location.href = "admin-walkin-payment.html";
}

// ============================================================
// SECTION 7: Add booking item card
// Creates one accommodation selector card.
// ============================================================

function addBookingItem(preselectedId = null) {
  const wrap = document.getElementById("bookingItemsWrap");
  if (!wrap) return;

  bookingItemCounter += 1;

  const itemId = bookingItemCounter;
  const today = new Date().toISOString().split("T")[0];

  const card = document.createElement("div");
  card.className = "booking-item-card";
  card.dataset.itemId = itemId;

  card.innerHTML = `
    <div class="booking-item-header">
      <div class="booking-item-title">Accommodation Item ${itemId}</div>

      ${
        bookingItemCounter > 1
          ? `<button type="button" class="remove-item-btn" data-remove-id="${itemId}">Remove</button>`
          : ""
      }
    </div>

    <div class="walkin-grid">
      <div class="walkin-group">
        <label>Accommodation</label>

        <div class="custom-accommodation-picker" data-item-id="${itemId}">
          <input
            type="hidden"
            class="accommodation-value"
            data-item-id="${itemId}"
            value=""
          />

          <button
            type="button"
            class="accommodation-picker-button"
            data-item-id="${itemId}"
          >
            <span class="accommodation-picker-label">Select accommodation</span>
            <span class="accommodation-picker-arrow">▼</span>
          </button>

          <div class="accommodation-picker-panel" data-item-id="${itemId}">
            <input
              type="text"
              class="accommodation-search-input"
              data-item-id="${itemId}"
              placeholder="Search room, cottage, or function area..."
            />

            <div
              class="accommodation-options-list"
              data-item-id="${itemId}"
            ></div>
          </div>
        </div>
      </div>

      <div class="walkin-group">
        <label>Slot Type</label>

        <select class="slot-select" data-item-id="${itemId}">
          <option value="">Select slot</option>
        </select>
      </div>

      <div class="walkin-group">
        <label>Reservation Date</label>
        <input
          type="date"
          class="date-input"
          data-item-id="${itemId}"
          min="${today}"
          value="${today}"
        />
      </div>

      <div class="walkin-group">
        <label>Maximum Capacity (display only)</label>
        <input
          type="text"
          class="capacity-display"
          data-item-id="${itemId}"
          value="-"
          readonly
        />
      </div>
    </div>

    <div class="slot-preview" id="slotPreview-${itemId}">
      Select an accommodation and slot to preview its schedule and price.
    </div>
  `;

  wrap.appendChild(card);

  const removeBtn = card.querySelector(".remove-item-btn");
  const slotSelect = card.querySelector(".slot-select");
  const dateInput = card.querySelector(".date-input");

  bindAccommodationPicker(card, itemId);

  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      card.remove();
      updateSummary();
      refreshTitles();
    });
  }

  slotSelect.addEventListener("change", () => {
    updateItemPreview(itemId);
    updateSummary();
  });

  dateInput.addEventListener("input", () => {
    updateItemPreview(itemId);
    updateSummary();
  });

  dateInput.addEventListener("change", () => {
    updateItemPreview(itemId);
    updateSummary();
  });

  if (preselectedId) {
    setAccommodationSelection(card, itemId, preselectedId);
  }

  populateSlotOptions(itemId);
  updateItemPreview(itemId);
  refreshTitles();
}

// ============================================================
// SECTION 8: Searchable accommodation picker
// ============================================================

function bindAccommodationPicker(card, itemId) {
  const pickerButton = card.querySelector(".accommodation-picker-button");
  const pickerPanel = card.querySelector(".accommodation-picker-panel");
  const searchInput = card.querySelector(".accommodation-search-input");

  if (!pickerButton || !pickerPanel || !searchInput) return;

  renderAccommodationOptions(card, itemId, "");

  pickerButton.addEventListener("click", (event) => {
    event.stopPropagation();

    const isOpen = pickerPanel.classList.contains("show");
    closeAllAccommodationPickers();

    if (!isOpen) {
      pickerPanel.classList.add("show");
      searchInput.value = "";
      renderAccommodationOptions(card, itemId, "");

      setTimeout(() => {
        searchInput.focus();
      }, 50);
    }
  });

  pickerPanel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  searchInput.addEventListener("input", () => {
    renderAccommodationOptions(card, itemId, searchInput.value);
  });
}

function renderAccommodationOptions(card, itemId, searchText = "") {
  const list = card.querySelector(".accommodation-options-list");
  if (!list) return;

  const query = String(searchText || "").trim().toLowerCase();

  const filtered = availableAccommodations.filter((item) => {
    const haystack = [
      item.name,
      item.category_name,
      item.map_label,
      item.description,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  if (!filtered.length) {
    list.innerHTML = `
      <div class="accommodation-empty-state">
        No accommodation found.
      </div>
    `;
    return;
  }

  list.innerHTML = filtered
    .map((item) => {
      const capacity = Number(item.max_capacity || 0);
      const category = item.category_name || "Accommodation";
      const mapLabel = item.map_label || "No map label";

      return `
        <button
          type="button"
          class="accommodation-option-btn"
          data-accommodation-id="${escapeHtml(item.id)}"
        >
          <strong>${escapeHtml(item.name)}</strong>
          <span>
            ${escapeHtml(category)} • Capacity ${capacity} • ${escapeHtml(mapLabel)}
          </span>
        </button>
      `;
    })
    .join("");

  list.querySelectorAll(".accommodation-option-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedId = Number(button.dataset.accommodationId);
      setAccommodationSelection(card, itemId, selectedId);
      closeAllAccommodationPickers();
    });
  });
}

function setAccommodationSelection(card, itemId, accommodationId) {
  const hiddenInput = card.querySelector(".accommodation-value");
  const label = card.querySelector(".accommodation-picker-label");

  const accommodation = getAccommodationById(accommodationId);

  if (!hiddenInput || !label) return;

  if (!accommodation) {
    hiddenInput.value = "";
    label.textContent = "Select accommodation";
  } else {
    hiddenInput.value = String(accommodation.id);
    label.textContent = `${accommodation.name} (${accommodation.category_name})`;
  }

  populateSlotOptions(itemId);
  updateItemPreview(itemId);
  updateSummary();
}

function closeAllAccommodationPickers() {
  document.querySelectorAll(".accommodation-picker-panel").forEach((panel) => {
    panel.classList.remove("show");
  });
}

function setupGlobalPickerClose() {
  document.addEventListener("click", () => {
    closeAllAccommodationPickers();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllAccommodationPickers();
    }
  });
}

// ============================================================
// SECTION 9: Restore draft
// Restores data when returning from payment screen.
// ============================================================

function restoreDraftIfAny() {
  const raw = sessionStorage.getItem(ADMIN_WALKIN_DRAFT_KEY);
  if (!raw) return;

  try {
    const draft = JSON.parse(raw);

    if (draft.first_name) document.getElementById("firstName").value = draft.first_name;
    if (draft.middle_name) document.getElementById("middleName").value = draft.middle_name;
    if (draft.last_name) document.getElementById("lastName").value = draft.last_name;
    if (draft.contact_no) document.getElementById("contactNo").value = draft.contact_no;
    if (draft.guest_count) document.getElementById("guestCount").value = draft.guest_count;
    if (draft.entrance_type) document.getElementById("entranceType").value = draft.entrance_type;
    if (draft.note) document.getElementById("customerNote").value = draft.note;

    if (Array.isArray(draft.items) && draft.items.length) {
      const wrap = document.getElementById("bookingItemsWrap");
      wrap.innerHTML = "";
      bookingItemCounter = 0;

      draft.items.forEach((item, index) => {
        addBookingItem(Number(item.accommodation_id) || null);

        const card = wrap.children[index];
        if (!card) return;

        const slotSelect = card.querySelector(".slot-select");
        const dateInput = card.querySelector(".date-input");

        setAccommodationSelection(card, index + 1, Number(item.accommodation_id) || null);

        slotSelect.value = item.slot_type || "";
        dateInput.value = item.check_in_date || dateInput.value;

        updateItemPreview(index + 1);
      });
    }

    updateSummary();
  } catch (error) {
    console.error("restoreDraftIfAny error:", error);
  }
}

// ============================================================
// SECTION 10: Refresh item titles after remove
// Keeps item numbering readable.
// ============================================================

function refreshTitles() {
  const cards = [...document.querySelectorAll(".booking-item-card")];

  cards.forEach((card, index) => {
    const newItemId = index + 1;

    const title = card.querySelector(".booking-item-title");

    if (title) {
      title.textContent = `Accommodation Item ${newItemId}`;
    }

    card.dataset.itemId = String(newItemId);

    card.querySelectorAll("[data-item-id]").forEach((element) => {
      element.dataset.itemId = String(newItemId);
    });

    const preview = card.querySelector(".slot-preview");

    if (preview) {
      preview.id = `slotPreview-${newItemId}`;
    }
  });
}

// ============================================================
// SECTION 11: Accommodation helpers
// Gets selected accommodation and available slot options.
// ============================================================

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

// ============================================================
// SECTION 12: Populate slot dropdown
// Updates slot options based on selected accommodation.
// ============================================================

function populateSlotOptions(itemId) {
  const card = document.querySelector(`.booking-item-card[data-item-id="${itemId}"]`);
  if (!card) return;

  const accommodationValue = card.querySelector(".accommodation-value");
  const slotSelect = card.querySelector(".slot-select");
  const capacityDisplay = card.querySelector(".capacity-display");

  const accommodation = getAccommodationById(accommodationValue?.value);

  if (!accommodation) {
    slotSelect.innerHTML = `<option value="">Select slot</option>`;
    capacityDisplay.value = "-";
    return;
  }

  capacityDisplay.value = accommodation.max_capacity || 0;

  const options = getSlotOptions(accommodation);

  slotSelect.innerHTML = `
    <option value="">Select slot</option>

    ${options
      .map(
        (slot) => `
          <option value="${slot.value}">
            ${slot.label} (${formatTimeDisplay(slot.start)} - ${formatTimeDisplay(slot.end)})
          </option>
        `
      )
      .join("")}
  `;
}

// ============================================================
// SECTION 13: Update item preview
// Shows selected accommodation schedule, price, and map label.
// ============================================================

function updateItemPreview(itemId) {
  const card = document.querySelector(`.booking-item-card[data-item-id="${itemId}"]`);
  if (!card) return;

  const accommodationValue = card.querySelector(".accommodation-value");
  const slotSelect = card.querySelector(".slot-select");
  const dateInput = card.querySelector(".date-input");
  const preview = document.getElementById(`slotPreview-${itemId}`);

  const accommodation = getAccommodationById(accommodationValue?.value);

  if (!preview) return;

  if (!accommodation) {
    preview.innerHTML = `
      Select an accommodation and slot to preview its schedule and price.
    `;
    return;
  }

  const slot = getSlotOptions(accommodation).find(
    (item) => item.value === slotSelect.value
  );

  if (!slot) {
    preview.innerHTML = `
      <strong>${escapeHtml(accommodation.name)}</strong><br>
      Category: ${escapeHtml(accommodation.category_name)}<br>
      Map Label: ${escapeHtml(accommodation.map_label || "Not set")}<br>
      Select a slot to continue.
    `;
    return;
  }

  const checkOutDate = calculateCheckOutDate(dateInput.value, slot.start, slot.end);

  preview.innerHTML = `
    <strong>${escapeHtml(accommodation.name)}</strong><br>
    Category: ${escapeHtml(accommodation.category_name)}<br>
    Map Label: ${escapeHtml(accommodation.map_label || "Not set")}<br>
    Schedule: ${escapeHtml(slot.label)} (${formatTimeDisplay(slot.start)} - ${formatTimeDisplay(slot.end)})<br>
    Reservation Date: ${formatDateDisplay(dateInput.value)}<br>
    Check-out Date: ${formatDateDisplay(checkOutDate)}<br>
    Price: ₱${formatMoney(slot.price)}
  `;
}

// ============================================================
// SECTION 14: Collect booking items
// Gets selected accommodation, slot, and date from all cards.
// ============================================================

function collectBookingItems() {
  const cards = [...document.querySelectorAll(".booking-item-card")];
  const items = [];

  for (const card of cards) {
    const accommodationId = card.querySelector(".accommodation-value")?.value;
    const slotType = card.querySelector(".slot-select")?.value;
    const checkInDate = card.querySelector(".date-input")?.value;

    if (!accommodationId || !slotType || !checkInDate) {
      continue;
    }

    items.push({
      accommodation_id: Number(accommodationId),
      slot_type: slotType,
      check_in_date: checkInDate,
    });
  }

  return items;
}

// ============================================================
// SECTION 15: Calculate checkout date
// Handles overnight slots where checkout date becomes next day.
// ============================================================

function calculateCheckOutDate(checkInDate, startTime, endTime) {
  if (!checkInDate || !startTime || !endTime) return checkInDate || "-";

  const startParts = String(startTime).split(":");
  const endParts = String(endTime).split(":");

  if (startParts.length < 2 || endParts.length < 2) return checkInDate;

  const startMinutes = Number(startParts[0]) * 60 + Number(startParts[1]);
  const endMinutes = Number(endParts[0]) * 60 + Number(endParts[1]);

  if (endMinutes <= startMinutes) {
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + 1);

    return date.toISOString().split("T")[0];
  }

  return checkInDate;
}

// ============================================================
// SECTION 16: Entrance fee calculation
// Estimates entrance fee after free entrance pax deduction.
// ============================================================

function getTotalFreeEntrancePax(items, guestCount) {
  let total = 0;

  items.forEach((item) => {
    const accommodation = getAccommodationById(item.accommodation_id);
    if (!accommodation) return;

    total += Number(accommodation.free_entrance_pax || 0);
  });

  return Math.min(total, Number(guestCount || 0));
}

function getEstimatedEntranceFee() {
  const guestCount = Number(document.getElementById("guestCount").value || 0);
  const entranceType = document.getElementById("entranceType").value;

  const items = collectBookingItems();

  const hasOvernightStyle = items.some(
    (item) => item.slot_type === "overnight" || item.slot_type === "extended"
  );

  const totalFreeEntrancePax = getTotalFreeEntrancePax(items, guestCount);
  const chargeableGuests = Math.max(guestCount - totalFreeEntrancePax, 0);

  const rate =
    entranceType === "beach_only"
      ? hasOvernightStyle
        ? 200
        : 150
      : hasOvernightStyle
        ? 300
        : 250;

  return chargeableGuests * rate;
}

// ============================================================
// SECTION 17: Update summary
// Updates all amount preview boxes.
// ============================================================

function updateSummary() {
  const items = collectBookingItems();

  let accommodationTotal = 0;

  items.forEach((item) => {
    const accommodation = getAccommodationById(item.accommodation_id);
    if (!accommodation) return;

    const slot = getSlotOptions(accommodation).find(
      (s) => s.value === item.slot_type
    );

    if (!slot) return;

    accommodationTotal += Number(slot.price || 0);
  });

  const requiredDownpayment = accommodationTotal * 0.5;
  const remainingBalance = accommodationTotal - requiredDownpayment;
  const estimatedEntranceFee = getEstimatedEntranceFee();

  document.getElementById("summaryItemCount").textContent = `${items.length} item(s)`;
  document.getElementById("estimatedEntranceFee").textContent = `₱${formatMoney(estimatedEntranceFee)}`;
  document.getElementById("accommodationTotal").textContent = `₱${formatMoney(accommodationTotal)}`;
  document.getElementById("requiredDownpayment").textContent = `₱${formatMoney(requiredDownpayment)}`;

  document.getElementById("highlightAccommodationTotal").textContent = `₱${formatMoney(accommodationTotal)}`;
  document.getElementById("highlightDownpayment").textContent = `₱${formatMoney(requiredDownpayment)}`;
  document.getElementById("highlightRemainingBalance").textContent = `₱${formatMoney(remainingBalance)}`;
  document.getElementById("highlightEntranceFee").textContent = `₱${formatMoney(estimatedEntranceFee)}`;
}

// ============================================================
// SECTION 18: Format helpers
// Formats money, time, dates, messages, and safe HTML.
// ============================================================

function formatMoney(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTimeDisplay(timeValue) {
  if (!timeValue) return "N/A";

  const timeText = String(timeValue).trim();
  const parts = timeText.split(":");

  if (parts.length < 2) return timeText;

  let hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) return timeText;

  const suffix = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${suffix}`;
}

function formatDateDisplay(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString();
}

function showMessage(message, type = "success") {
  const messageEl = document.getElementById("walkInMessage");

  if (messageEl) {
    messageEl.textContent = message;
    messageEl.style.color = type === "error" ? "red" : "green";
  }

  if (typeof showToast === "function") {
    showToast(message, type);
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}