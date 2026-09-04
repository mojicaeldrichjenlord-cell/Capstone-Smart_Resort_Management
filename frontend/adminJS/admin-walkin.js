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
const ADMIN_WALKIN_SUCCESS_RESET_KEY = "smartresort_admin_walkin_success_reset";

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
  prepareManualReservationDraft();
  setupManualForm();
  setupContactNumberInputGuard();
  setupReservationTypeField();
  setupManualReservationDateRules();

  const restoreDraft = shouldRestoreManualDraft();

  if (!restoreDraft) {
    forceClearManualForm();
  }

  await loadAccommodations();

  if (restoreDraft) {
    restoreDraftIfAny();
  } else {
    ensureAtLeastOneBookingItem();
    refreshAllAccommodationPickers();
    updateSummary();

    // Some browsers apply autofill after DOMContentLoaded.
    setTimeout(() => {
      forceClearManualForm();
      ensureAtLeastOneBookingItem();
      refreshAllAccommodationPickers();
      updateSummary();
    }, 200);
  }
});

// ============================================================
// SECTION 2: Administrator / Front Desk access checker
// Redirects unauthenticated users or accounts without manual-reservation access.
// ============================================================

function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  const role = String(user.role || "").toLowerCase();

  if (!["admin", "frontdesk"].includes(role)) {
    alert("Access denied. Administrator or Front Desk account required.");
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

    if (Array.isArray(data)) {
      availableAccommodations = data;
    } else if (Array.isArray(data.rooms)) {
      availableAccommodations = data.rooms;
    } else if (Array.isArray(data.accommodations)) {
      availableAccommodations = data.accommodations;
    } else {
      availableAccommodations = [];
    }

    console.log("[admin-walkin] Loaded accommodations:", availableAccommodations.length);

    if (!availableAccommodations.length) {
      showMessage("No available accommodations found.", "error");
      return;
    }

    refreshAllAccommodationPickers();
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
    document.getElementById("manualReservationType"),
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
// SECTION 5.1: Manual reservation type
// Adds a clear choice between walk-in and Facebook/Messenger booking.
// ============================================================

function setupReservationTypeField() {
  if (document.getElementById("manualReservationType")) {
    return;
  }

  const guestInfoSection = document.querySelector(".section-box");
  const firstNameField = document.getElementById("firstName");
  const targetGrid = firstNameField?.closest(".walkin-grid");

  if (!targetGrid && !guestInfoSection) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = targetGrid ? "walkin-group full-width" : "manual-type-injected-box";
  wrapper.innerHTML = `
    <label for="manualReservationType">Reservation Type</label>
    <select id="manualReservationType" required>
      <option value="walkin">Walk-in Guest</option>
      <option value="facebook">Facebook / Messenger Reservation</option>
    </select>
    <small class="field-help">
      Walk-in is for guests already onsite. Facebook/Messenger is for guests who message the resort instead of using the website.
    </small>
  `;

  if (targetGrid) {
    targetGrid.insertBefore(wrapper, targetGrid.firstElementChild);
  } else {
    guestInfoSection.insertBefore(wrapper, guestInfoSection.firstElementChild?.nextSibling || null);
  }

  const reservationType = document.getElementById("manualReservationType");
  if (reservationType) {
    reservationType.addEventListener("change", updateSummary);
  }
}

function getManualReservationType() {
  return document.getElementById("manualReservationType")?.value || "walkin";
}

function formatManualReservationType(type) {
  return type === "facebook" ? "Facebook / Messenger Reservation" : "Walk-in Guest";
}


// ============================================================
// SECTION 5.2: Manual reservation date rules
//
// Final rule:
// - Walk-in Guest = TODAY ONLY because the guest is already onsite.
// - Facebook / Messenger = TODAY OR FUTURE.
//
// This protects the manual reservation UI from creating a future reservation
// that is immediately auto-checked-in as a walk-in.
// ============================================================

function setupManualReservationDateRules() {
  const reservationType = document.getElementById("manualReservationType");

  if (
    reservationType &&
    reservationType.dataset.dateRuleBound !== "true"
  ) {
    reservationType.dataset.dateRuleBound = "true";

    reservationType.addEventListener("change", () => {
      applyManualReservationDateRules();
      updateSummary();
    });
  }

  applyManualReservationDateRules();
}

function getPhilippineTodayInputDate() {
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

function applyManualReservationDateRules() {
  const today = getPhilippineTodayInputDate();
  const reservationType = getManualReservationType();
  const dateInputs = [
    ...document.querySelectorAll(".booking-item-card .date-input"),
  ];

  dateInputs.forEach((dateInput) => {
    dateInput.min = today;

    if (reservationType === "walkin") {
      // Walk-in means the guest is physically onsite now.
      // Force every accommodation item to today's date.
      dateInput.max = today;
      dateInput.value = today;
      dateInput.title = "Walk-in reservations are limited to today only.";
    } else {
      // Facebook/Messenger reservations may be today or a future date.
      dateInput.removeAttribute("max");
      dateInput.title =
        "Facebook/Messenger reservations may use today or a future date.";

      if (!dateInput.value || dateInput.value < today) {
        dateInput.value = today;
      }
    }

    const card = dateInput.closest(".booking-item-card");
    const itemId = Number(card?.dataset?.itemId || 0);

    if (itemId) {
      updateItemPreview(itemId);
    }
  });
}

function validateManualReservationDates(items, reservationType) {
  const today = getPhilippineTodayInputDate();

  for (const item of items) {
    const checkInDate = String(item?.check_in_date || "").slice(0, 10);

    if (!checkInDate) {
      return {
        valid: false,
        message: "Each accommodation item must have a reservation date.",
      };
    }

    if (reservationType === "walkin" && checkInDate !== today) {
      return {
        valid: false,
        message:
          "Walk-in guests must use today's reservation date because they are already onsite.",
      };
    }

    if (reservationType === "facebook" && checkInDate < today) {
      return {
        valid: false,
        message:
          "Facebook/Messenger reservations cannot use a past reservation date.",
      };
    }
  }

  return {
    valid: true,
    message: "",
  };
}

// ============================================================
// SECTION 5.1: Contact number validation
// Keeps contact number numeric and exactly 11 digits, starting with 09.
// ============================================================

function setupContactNumberInputGuard() {
  const contactInput = document.getElementById("contactNo");
  if (!contactInput) return;

  contactInput.setAttribute("inputmode", "numeric");
  contactInput.setAttribute("maxlength", "11");
  contactInput.setAttribute("placeholder", "Example: 09123456789");
  contactInput.setAttribute("autocomplete", "off");

  contactInput.addEventListener("input", () => {
    contactInput.value = String(contactInput.value || "")
      .replace(/\D/g, "")
      .slice(0, 11);
  });
}

function isValidPhilippineMobileNumber(contactNo) {
  return /^09\d{9}$/.test(String(contactNo || "").trim());
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
  const reservation_type = getManualReservationType();
  const guest_count = Number(document.getElementById("guestCount").value);
  const entrance_type = document.getElementById("entranceType").value;
  const customerNote = document.getElementById("customerNote").value.trim();
  const items = collectBookingItems();

  if (!first_name || !last_name || !contact_no || !guest_count) {
    showMessage("Please fill in all required guest information.", "error");
    return;
  }

  if (!isValidPhilippineMobileNumber(contact_no)) {
    showMessage("Contact number must be exactly 11 digits and start with 09.", "error");
    document.getElementById("contactNo")?.focus();
    return;
  }

  if (!items.length) {
    showMessage("Please add at least one accommodation item.", "error");
    return;
  }

  const reservationDateValidation =
    validateManualReservationDates(items, reservation_type);

  if (!reservationDateValidation.valid) {
    showMessage(reservationDateValidation.message, "error");
    applyManualReservationDateRules();
    return;
  }

  const draft = {
    first_name,
    middle_name,
    last_name,
    contact_no,
    reservation_type,
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
  const today = getPhilippineTodayInputDate();

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
        <label>Stay Duration</label>
        <select class="stay-duration-select" data-item-id="${itemId}">
          <option value="1">1 day only</option>
        </select>
        <small class="field-help">
          Day Tour and Night are fixed schedules. Day/Night 22 Hours or 23 Hours can be 1 to 5 days depending on category.
        </small>
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
  const stayDurationSelect = card.querySelector(".stay-duration-select");
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
    populateStayDurationOptions(itemId);
    updateItemPreview(itemId);
    updateSummary();
  });

  if (stayDurationSelect) {
    stayDurationSelect.addEventListener("change", () => {
      updateItemPreview(itemId);
      updateSummary();
    });
  }

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
  populateStayDurationOptions(itemId);
  updateItemPreview(itemId);
  refreshTitles();
  applyManualReservationDateRules();
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
// SECTION 9: Manual draft/session handling
// - New manual reservation from navbar/dashboard starts blank.
// - Back from payment page restores draft for editing.
// - Create Another after success starts blank.
// ============================================================

function refreshAllAccommodationPickers() {
  document.querySelectorAll(".booking-item-card").forEach((card) => {
    const itemId = Number(card.dataset.itemId || 0);
    if (!itemId) return;

    renderAccommodationOptions(card, itemId, "");
    populateSlotOptions(itemId);
    updateItemPreview(itemId);
  });
}

function prepareManualReservationDraft() {
  const cameFromPaymentPage = document.referrer.includes(
    "admin-walkin-payment.html"
  );

  const forceReset =
    sessionStorage.getItem(ADMIN_WALKIN_SUCCESS_RESET_KEY) === "1";

  if (forceReset) {
    sessionStorage.removeItem(ADMIN_WALKIN_DRAFT_KEY);
    sessionStorage.removeItem(ADMIN_WALKIN_SUCCESS_RESET_KEY);
    return;
  }

  if (!cameFromPaymentPage) {
    sessionStorage.removeItem(ADMIN_WALKIN_DRAFT_KEY);
  }
}

function shouldRestoreManualDraft() {
  const cameFromPaymentPage = document.referrer.includes(
    "admin-walkin-payment.html"
  );

  return cameFromPaymentPage && Boolean(sessionStorage.getItem(ADMIN_WALKIN_DRAFT_KEY));
}

function forceClearManualForm() {
  const form = document.getElementById("walkInForm");

  if (form) {
    form.setAttribute("autocomplete", "off");
    form.reset();
  }

  const fieldsToClear = [
    "firstName",
    "middleName",
    "lastName",
    "contactNo",
    "customerNote",
  ];

  fieldsToClear.forEach((id) => {
    const field = document.getElementById(id);
    if (field) {
      field.value = "";
      field.setAttribute("autocomplete", "off");
    }
  });

  const reservationType = document.getElementById("manualReservationType");
  if (reservationType) {
    reservationType.value = "walkin";
  }

  const guestCount = document.getElementById("guestCount");
  if (guestCount) {
    guestCount.value = "1";
    guestCount.setAttribute("autocomplete", "off");
  }

  const entranceType = document.getElementById("entranceType");
  if (entranceType) {
    entranceType.value = "pool_beach";
  }

  const wrap = document.getElementById("bookingItemsWrap");
  if (wrap) {
    wrap.innerHTML = "";
  }

  bookingItemCounter = 0;
}

function ensureAtLeastOneBookingItem() {
  const wrap = document.getElementById("bookingItemsWrap");
  if (!wrap) return;

  if (!wrap.querySelector(".booking-item-card")) {
    addBookingItem();
  }
}

// ============================================================
// SECTION 10: Restore draft
// Restores data only when returning from payment screen.
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
    if (draft.reservation_type && document.getElementById("manualReservationType")) {
      document.getElementById("manualReservationType").value = draft.reservation_type;
    }
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
        populateStayDurationOptions(index + 1);
        const stayDurationSelect = card.querySelector(".stay-duration-select");
        if (stayDurationSelect) stayDurationSelect.value = String(item.stay_duration || 1);
        dateInput.value = item.check_in_date || dateInput.value;

        updateItemPreview(index + 1);
      });
    }

    applyManualReservationDateRules();
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

  const isRoom = category.includes("room");
  const isCottage =
    category.includes("cottage") ||
    category.includes("shade") ||
    category.includes("hut");
  const isFunction =
    category.includes("function") ||
    category.includes("pavilion");

  let dayStart = "08:00:00";
  let dayEnd = "18:00:00";
  let nightStart = "20:00:00";
  let nightEnd = "06:00:00";
  let dayExtendedEnd = "06:00:00";
  let nightExtendedEnd = "18:00:00";
  let extendedLabel = "23 Hours";

  if (isRoom) {
    dayStart = "07:00:00";
    dayEnd = "17:00:00";
    nightStart = "19:00:00";
    nightEnd = "05:00:00";
    dayExtendedEnd = "05:00:00";
    nightExtendedEnd = "17:00:00";
    extendedLabel = "22 Hours";
  } else if (isCottage) {
    dayStart = "06:00:00";
    dayEnd = "17:00:00";
    nightStart = "18:00:00";
    nightEnd = "05:00:00";
    dayExtendedEnd = "05:00:00";
    nightExtendedEnd = "17:00:00";
    extendedLabel = "23 Hours";
  } else if (isFunction) {
    dayStart = "08:00:00";
    dayEnd = "18:00:00";
    nightStart = "20:00:00";
    nightEnd = "06:00:00";
    dayExtendedEnd = "06:00:00";
    nightExtendedEnd = "18:00:00";
    extendedLabel = "23 Hours";
  }

  return [
    {
      value: "day_tour",
      label: "Day Tour",
      price: Number(accommodation.day_price || 0),
      start: dayStart,
      end: dayEnd,
    },
    {
      value: "night",
      label: "Night",
      price: Number(accommodation.overnight_price || 0),
      start: nightStart,
      end: nightEnd,
    },
    {
      value: "day_extended",
      label: `Day ${extendedLabel}`,
      price: Number(accommodation.extended_price || 0),
      start: dayStart,
      end: dayExtendedEnd,
    },
    {
      value: "night_extended",
      label: `Night ${extendedLabel}`,
      price: Number(accommodation.extended_price || 0),
      start: nightStart,
      end: nightExtendedEnd,
    },
  ];
}

// ============================================================
// SECTION 12: Populate slot dropdown
// Updates slot options based on selected accommodation.
// ============================================================


function getStayDuration(item) {
  return Math.max(1, Math.min(5, Number(item?.stay_duration || 1)));
}

function getAllowedStayDurations(slotType) {
  return ["day_extended", "night_extended"].includes(slotType)
    ? [1, 2, 3, 4, 5]
    : [1];
}

function populateStayDurationOptions(itemId) {
  const card = document.querySelector(`.booking-item-card[data-item-id="${itemId}"]`);
  if (!card) return;

  const slotType = card.querySelector(".slot-select")?.value || "";
  const staySelect = card.querySelector(".stay-duration-select");
  if (!staySelect) return;

  const previousValue = Number(staySelect.value || 1);
  const allowed = getAllowedStayDurations(slotType);
  const canExtendStay = ["day_extended", "night_extended"].includes(slotType);

  staySelect.innerHTML = allowed
    .map((days) => {
      const label = canExtendStay
        ? `${days} ${days === 1 ? "day" : "days"}`
        : "1 day/night only";

      return `<option value="${days}">${label}</option>`;
    })
    .join("");

  staySelect.value = allowed.includes(previousValue) ? String(previousValue) : "1";
  staySelect.disabled = !canExtendStay;
}

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
    populateStayDurationOptions(itemId);
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

  populateStayDurationOptions(itemId);
}

// ============================================================
// SECTION 13: Update item preview
// Shows selected accommodation schedule, price, and map label.
// ============================================================

function updateItemPreview(itemId) {
  const card = document.querySelector(
    `.booking-item-card[data-item-id="${itemId}"]`
  );

  if (!card) return;

  const accommodationValue = card.querySelector(".accommodation-value");
  const slotSelect = card.querySelector(".slot-select");
  const stayDurationSelect = card.querySelector(".stay-duration-select");
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

  const isLongStaySlot = ["day_extended", "night_extended"].includes(slot.value);
  const stayDuration = isLongStaySlot
    ? Number(stayDurationSelect?.value || 1)
    : 1;

  const checkOutDate = calculateCheckOutDate(
    dateInput.value,
    slot.start,
    slot.end,
    stayDuration
  );

  const totalPrice = Number(slot.price || 0) * stayDuration;
  const durationLabel = isLongStaySlot
    ? `${stayDuration} ${stayDuration === 1 ? "day" : "days"}`
    : "Fixed schedule only";

  preview.innerHTML = `
    <strong>${escapeHtml(accommodation.name)}</strong><br>
    Category: ${escapeHtml(accommodation.category_name)}<br>
    Map Label: ${escapeHtml(accommodation.map_label || "Not set")}<br>
    Schedule: ${escapeHtml(slot.label)} (${formatTimeDisplay(slot.start)} - ${formatTimeDisplay(slot.end)})<br>
    Stay Duration: ${escapeHtml(durationLabel)}<br>
    Reservation Date: ${formatDateDisplay(dateInput.value)}<br>
    Check-out Date: ${formatDateDisplay(checkOutDate)}<br>
    Price: ₱${formatMoney(slot.price)}${isLongStaySlot ? ` × ${stayDuration} = ₱${formatMoney(totalPrice)}` : ""}
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
    const stayDuration = Number(card.querySelector(".stay-duration-select")?.value || 1);

    if (!accommodationId || !slotType || !checkInDate) {
      continue;
    }

    items.push({
      accommodation_id: Number(accommodationId),
      slot_type: slotType,
      check_in_date: checkInDate,
      stay_duration: ["day_extended", "night_extended"].includes(slotType)
        ? Math.max(1, Math.min(5, stayDuration))
        : 1,
    });
  }

  return items;
}

// ============================================================
// SECTION 15: Calculate checkout date
// Handles overnight slots where checkout date becomes next day.
// ============================================================

function calculateCheckOutDate(checkInDate, startTime, endTime, stayDuration = 1) {
  if (!checkInDate || !startTime || !endTime) return checkInDate || "-";

  const startParts = String(startTime).split(":");
  const endParts = String(endTime).split(":");

  if (startParts.length < 2 || endParts.length < 2) return checkInDate;

  const startMinutes = Number(startParts[0]) * 60 + Number(startParts[1]);
  const endMinutes = Number(endParts[0]) * 60 + Number(endParts[1]);
  const cleanDuration = Math.max(1, Math.min(5, Number(stayDuration || 1)));
  const daysToAdd = cleanDuration > 1 ? cleanDuration : endMinutes <= startMinutes ? 1 : 0;

  if (daysToAdd > 0) {
    const date = new Date(`${checkInDate}T00:00:00`);
    date.setDate(date.getDate() + daysToAdd);
    return toInputDateValue(date);
  }

  return checkInDate;
}

// ============================================================
// SECTION 15.1: Local date formatter
// Converts a Date object to YYYY-MM-DD without UTC timezone shifting.
// This fixes the missing toInputDateValue() error used by Night and
// Day/Night 22/23 Hours checkout-date calculations.
// ============================================================

function toInputDateValue(dateValue) {
  const date =
    dateValue instanceof Date
      ? dateValue
      : new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
    (item) => item.slot_type === "night" || item.slot_type === "day_extended" || item.slot_type === "night_extended"
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

    const slot = getSlotOptions(accommodation).find((slotItem) => {
      return slotItem.value === item.slot_type;
    });

    if (!slot) return;

    accommodationTotal += Number(slot.price || 0) * getStayDuration(item);
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

  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(dateValue))
    ? new Date(`${dateValue}T00:00:00`)
    : new Date(dateValue);

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