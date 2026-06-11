// ============================================================
// CUSTOMER BOOKING SCRIPT
// File: frontend/customerJS/booking.js
// Purpose:
// - Check customer access
// - Load accommodations
// - Build multi-accommodation booking draft
// - Searchable accommodation picker
// - Calculate entrance estimate and 50% downpayment
// - Move user to payment page
// - Works from frontend/customerHTML/booking.html
// ============================================================

const BOOKING_DRAFT_KEY = "smartresort_booking_draft_v2";
const CUSTOMER_MIN_BOOKING_DAYS_AHEAD = 0;

let availableAccommodations = [];
let bookingItemCounter = 0;

const bookingForm = document.getElementById("bookingForm");
const bookingMessage = document.getElementById("bookingMessage");
const bookingItemsWrap = document.getElementById("bookingItemsWrap");
const addItemBtn = document.getElementById("addItemBtn");

const params = new URLSearchParams(window.location.search);
const selectedRoomIdFromUrl = Number(params.get("room_id")) || null;

// ============================================================
// SECTION 1: Page startup
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (user.role === "admin" || user.role === "staff") {
    window.location.href = "../adminHTML/admin.html";
    return;
  }

  setupLogout();
  setupPricingGuideModal();
  setupContactNumberGuard();
  setupGlobalPickerClose();
  await loadAccommodations();
  prefillUserInfo(user);
  setupBookingForm(user);

  if (selectedRoomIdFromUrl) {
    sessionStorage.removeItem(BOOKING_DRAFT_KEY);
  } else {
    restoreDraftIfAny();
  }
});

// ============================================================
// SECTION 2: Logout
// ============================================================

function setupLogout() {
  const logoutBtns = [
    document.getElementById("logoutBtn"),
    document.getElementById("mobileLogoutBtn"),
  ].filter(Boolean);

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem("user");

      if (typeof showToast === "function") {
        showToast("Logged out successfully.", "success");
      } else {
        alert("Logged out successfully.");
      }

      setTimeout(() => {
        window.location.href = "../authHTML/login.html";
      }, 700);
    });
  });
}

// ============================================================
// SECTION 3: Pricing guide modal
// ============================================================

function setupPricingGuideModal() {
  const openPricingGuideBtn = document.getElementById("openPricingGuideBtn");
  const closePricingGuideBtn = document.getElementById("closePricingGuideBtn");
  const pricingModal = document.getElementById("pricingModal");

  if (openPricingGuideBtn && pricingModal) {
    openPricingGuideBtn.addEventListener("click", () => {
      pricingModal.classList.add("show");
    });
  }

  if (closePricingGuideBtn && pricingModal) {
    closePricingGuideBtn.addEventListener("click", () => {
      pricingModal.classList.remove("show");
    });
  }

  if (pricingModal) {
    pricingModal.addEventListener("click", (e) => {
      if (e.target === pricingModal) {
        pricingModal.classList.remove("show");
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && pricingModal) {
      pricingModal.classList.remove("show");
    }

    if (e.key === "Escape") {
      closeAllAccommodationPickers();
    }
  });
}

// ============================================================
// SECTION 4: Contact number guard
// Keeps customer contact number numeric, 11 digits max, and PH mobile format.
// ============================================================

function setupContactNumberGuard() {
  const contactInput = document.getElementById("contactNo");
  if (!contactInput) return;

  contactInput.setAttribute("inputmode", "numeric");
  contactInput.setAttribute("maxlength", "11");
  contactInput.setAttribute("autocomplete", "tel");
  contactInput.setAttribute("placeholder", "Example: 09123456789");

  contactInput.addEventListener("input", () => {
    contactInput.value = normalizeContactNumber(contactInput.value);
  });

  contactInput.addEventListener("paste", () => {
    setTimeout(() => {
      contactInput.value = normalizeContactNumber(contactInput.value);
    }, 0);
  });
}

function normalizeContactNumber(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 11);
}

function isValidPhilippineMobileNumber(value) {
  return /^09\d{9}$/.test(normalizeContactNumber(value));
}

// ============================================================
// SECTION 4: Prefill user information
// ============================================================

function prefillUserInfo(user) {
  const fullname = String(user.fullname || "").trim();

  if (fullname) {
    const parts = fullname.split(" ");

    if (parts.length >= 1) {
      document.getElementById("firstName").value = parts[0] || "";
    }

    if (parts.length >= 2) {
      document.getElementById("lastName").value =
        parts[parts.length - 1] || "";
    }

    if (parts.length > 2) {
      document.getElementById("middleName").value = parts.slice(1, -1).join(" ");
    }
  }

  if (user.phone) {
    document.getElementById("contactNo").value = normalizeContactNumber(user.phone);
  }
}

// ============================================================
// SECTION 5: Load accommodations
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

    addBookingItem(selectedRoomIdFromUrl);
    updateSummary();
  } catch (error) {
    console.error("loadAccommodations error:", error);
    showMessage(error.message || "Failed to load accommodations.", "error");
  }
}

// ============================================================
// SECTION 6: Booking form setup
// ============================================================

function setupBookingForm(user) {
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

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const first_name = document.getElementById("firstName").value.trim();
    const middle_name = document.getElementById("middleName").value.trim();
    const last_name = document.getElementById("lastName").value.trim();
    const contactInput = document.getElementById("contactNo");
    const contact_no = normalizeContactNumber(contactInput.value);
    contactInput.value = contact_no;
    const guest_count = Number(document.getElementById("guestCount").value);
    const entrance_type = document.getElementById("entranceType").value;
    const customerNote = document.getElementById("customerNote").value.trim();

    const items = collectBookingItems();

    if (!first_name || !last_name || !contact_no || !guest_count) {
      showMessage("Please fill in all required guest information.", "error");
      return;
    }

    if (!isValidPhilippineMobileNumber(contact_no)) {
      showMessage(
        "Contact number must be exactly 11 digits and start with 09.",
        "error"
      );
      contactInput.focus();
      return;
    }

    if (!items.length) {
      showMessage("Please add at least one accommodation item.", "error");
      return;
    }

    const earliestDate = getCustomerEarliestBookingDate();

    const hasInvalidDate = items.some((item) => {
      return isDateBefore(item.check_in_date, earliestDate);
    });

    if (hasInvalidDate) {
      showMessage(
        `Customer reservations must be booked at least ${CUSTOMER_MIN_BOOKING_DAYS_AHEAD} days ahead. Earliest available date is ${formatDateDisplay(earliestDate)}.`,
        "error"
      );
      resetInvalidDateInputs();
      return;
    }

    const draft = {
      user_id: user.id,
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

    sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));

    window.location.href = "booking-payment.html";
  });
}

// ============================================================
// SECTION 7: Add booking item card
// ============================================================

function addBookingItem(preselectedId = null) {
  if (!bookingItemsWrap) return;

  bookingItemCounter += 1;

  const itemId = bookingItemCounter;
  const earliestBookingDate = getCustomerEarliestBookingDate();

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

    <div class="booking-form-grid">
      <div class="booking-form-group">
        <label>Accommodation</label>

        <div class="custom-accommodation-picker" data-item-id="${itemId}" style="position:relative;">
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
            style="
              width:100%;
              min-height:48px;
              padding:12px 44px 12px 14px;
              border:1px solid #cbd5e1;
              border-radius:14px;
              background:#ffffff;
              color:#0f172a;
              text-align:left;
              cursor:pointer;
              font-size:0.95rem;
              line-height:1.4;
              position:relative;
            "
          >
            <span class="accommodation-picker-label">Select accommodation</span>
            <span style="
              position:absolute;
              right:14px;
              top:50%;
              transform:translateY(-50%);
              color:#64748b;
              font-size:0.85rem;
            ">▼</span>
          </button>

          <div
            class="accommodation-picker-panel"
            data-item-id="${itemId}"
            style="
              display:none;
              position:absolute;
              left:0;
              right:0;
              top:calc(100% + 8px);
              z-index:1000;
              background:#ffffff;
              border:1px solid #cbd5e1;
              border-radius:18px;
              box-shadow:0 18px 45px rgba(15,23,42,0.18);
              padding:10px;
            "
          >
            <input
              type="text"
              class="accommodation-search-input"
              data-item-id="${itemId}"
              placeholder="Search room, cottage, or function area..."
              style="
                width:100%;
                border:1px solid #dbe7ef;
                border-radius:12px;
                padding:11px 12px;
                outline:none;
                font-size:0.92rem;
                margin-bottom:8px;
              "
            />

            <div
              class="accommodation-options-list"
              data-item-id="${itemId}"
              style="
                max-height:260px;
                overflow-y:auto;
                display:flex;
                flex-direction:column;
                gap:6px;
                padding-right:4px;
              "
            ></div>
          </div>
        </div>
      </div>

      <div class="booking-form-group">
        <label>Slot Type</label>
        <select class="slot-select" data-item-id="${itemId}">
          <option value="">Select slot</option>
        </select>
      </div>

      <div class="booking-form-group">
        <label>Stay Duration</label>
        <select class="stay-duration-select" data-item-id="${itemId}">
          <option value="1">1 day only</option>
        </select>
        <small class="field-help">
          Day Tour is 1 day only. Overnight can be 1 to 5 nights. 22 Hours / 23 Hours can be 1 to 5 days.
        </small>
      </div>

      <div class="booking-form-group">
        <label>Reservation Date</label>
        <input
          type="date"
          class="date-input"
          data-item-id="${itemId}"
          min="${earliestBookingDate}"
          value="${earliestBookingDate}"
        />
        <small class="field-help">
          Customer online reservations must be booked at least ${CUSTOMER_MIN_BOOKING_DAYS_AHEAD} days ahead.
        </small>
      </div>

      <div class="booking-form-group">
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

  bookingItemsWrap.appendChild(card);

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
    enforceDateInputMinimum(dateInput);
    updateItemPreview(itemId);
    updateSummary();
  });

  dateInput.addEventListener("change", () => {
    enforceDateInputMinimum(dateInput);
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

    const isOpen = pickerPanel.style.display === "block";
    closeAllAccommodationPickers();

    if (!isOpen) {
      pickerPanel.style.display = "block";
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
      <div style="
        padding:14px;
        text-align:center;
        color:#64748b;
        background:#f8fafc;
        border-radius:12px;
        font-size:0.9rem;
      ">
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
          style="
            width:100%;
            border:none;
            border-radius:13px;
            background:#f8fafc;
            color:#0f172a;
            padding:11px 12px;
            text-align:left;
            cursor:pointer;
            line-height:1.4;
          "
          onmouseover="this.style.background='#e0f2fe'"
          onmouseout="this.style.background='#f8fafc'"
        >
          <strong style="display:block;font-size:0.95rem;">
            ${escapeHtml(item.name)}
          </strong>

          <span style="display:block;color:#475569;font-size:0.84rem;">
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
    panel.style.display = "none";
  });
}

function setupGlobalPickerClose() {
  document.addEventListener("click", () => {
    closeAllAccommodationPickers();
  });
}

// ============================================================
// SECTION 9: Restore booking draft
// ============================================================

function restoreDraftIfAny() {
  const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
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
      bookingItemsWrap.innerHTML = "";
      bookingItemCounter = 0;

      draft.items.forEach((item, index) => {
        addBookingItem(Number(item.accommodation_id) || null);

        const card = bookingItemsWrap.children[index];
        if (!card) return;

        const slotSelect = card.querySelector(".slot-select");
        const dateInput = card.querySelector(".date-input");

        setAccommodationSelection(card, index + 1, Number(item.accommodation_id) || null);

        slotSelect.value = item.slot_type || "";
        populateStayDurationOptions(index + 1);
        const stayDurationSelect = card.querySelector(".stay-duration-select");
        if (stayDurationSelect) stayDurationSelect.value = String(item.stay_duration || 1);

        const earliestBookingDate = getCustomerEarliestBookingDate();

        if (item.check_in_date && !isDateBefore(item.check_in_date, earliestBookingDate)) {
          dateInput.value = item.check_in_date;
        } else {
          dateInput.value = earliestBookingDate;
        }

        dateInput.min = earliestBookingDate;

        updateItemPreview(index + 1);
      });
    }

    updateSummary();
  } catch (error) {
    console.error("restoreDraftIfAny error:", error);
  }
}

// ============================================================
// SECTION 10: Item helpers
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


function getStayDuration(item) {
  return Math.max(1, Math.min(5, Number(item?.stay_duration || 1)));
}

function getAllowedStayDurations(slotType) {
  return slotType === "extended" || slotType === "overnight"
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

  staySelect.innerHTML = allowed
    .map((days) => {
      const label = slotType === "extended"
        ? `${days} ${days === 1 ? "day" : "days"}`
        : slotType === "overnight"
          ? `${days} ${days === 1 ? "night" : "nights"}`
          : "1 day only";
      return `<option value="${days}">${label}</option>`;
    })
    .join("");

  staySelect.value = allowed.includes(previousValue) ? String(previousValue) : "1";
  staySelect.disabled = !["overnight", "extended"].includes(slotType);
}

function populateSlotOptions(itemId) {
  const card = document.querySelector(
    `.booking-item-card[data-item-id="${itemId}"]`
  );

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

  const stayDuration = Number(stayDurationSelect?.value || 1);
  const checkOutDate = calculateCheckOutDate(
    dateInput.value,
    slot.start,
    slot.end,
    stayDuration
  );
  const totalPrice = Number(slot.price || 0) * stayDuration;
  const durationLabel = slot.value === "extended"
    ? `${stayDuration} ${stayDuration === 1 ? "day" : "days"}`
    : slot.value === "overnight"
      ? `${stayDuration} ${stayDuration === 1 ? "night" : "nights"}`
      : "1 day only";

  preview.innerHTML = `
    <strong>${escapeHtml(accommodation.name)}</strong><br>
    Category: ${escapeHtml(accommodation.category_name)}<br>
    Map Label: ${escapeHtml(accommodation.map_label || "Not set")}<br>
    Schedule: ${escapeHtml(slot.label)} (${formatTimeDisplay(slot.start)} - ${formatTimeDisplay(slot.end)})<br>
    Stay Duration: ${escapeHtml(durationLabel)}<br>
    Reservation Date: ${formatDateDisplay(dateInput.value)}<br>
    Check-out Date: ${formatDateDisplay(checkOutDate)}<br>
    Price: ₱${formatMoney(slot.price)}${["overnight", "extended"].includes(slot.value) ? ` × ${stayDuration} = ₱${formatMoney(totalPrice)}` : ""}
  `;
}

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
      stay_duration: ["overnight", "extended"].includes(slotType)
        ? Math.max(1, Math.min(5, stayDuration))
        : 1,
    });
  }

  return items;
}

// ============================================================
// SECTION 11: Date and entrance fee calculations
// ============================================================

function getCustomerEarliestBookingDate() {
  const today = getDateOnlyLocal();
  today.setDate(today.getDate() + CUSTOMER_MIN_BOOKING_DAYS_AHEAD);
  return toInputDateValue(today);
}

function getDateOnlyLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function toInputDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isDateBefore(dateValue, minimumDateValue) {
  if (!dateValue || !minimumDateValue) return false;

  const date = new Date(`${dateValue}T00:00:00`);
  const minimumDate = new Date(`${minimumDateValue}T00:00:00`);

  if (Number.isNaN(date.getTime()) || Number.isNaN(minimumDate.getTime())) {
    return false;
  }

  return date < minimumDate;
}

function enforceDateInputMinimum(dateInput) {
  if (!dateInput) return;

  const earliestBookingDate = getCustomerEarliestBookingDate();

  dateInput.min = earliestBookingDate;

  if (!dateInput.value || isDateBefore(dateInput.value, earliestBookingDate)) {
    dateInput.value = earliestBookingDate;

    showMessage(
      `Earliest available customer booking date is ${formatDateDisplay(earliestBookingDate)}.`,
      "error"
    );
  }
}

function resetInvalidDateInputs() {
  const dateInputs = [...document.querySelectorAll(".date-input")];

  dateInputs.forEach((dateInput) => {
    enforceDateInputMinimum(dateInput);
  });
}

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

  const hasOvernightStyle = items.some((item) => {
    return item.slot_type === "overnight" || item.slot_type === "extended";
  });

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

function updateSummary() {
  const items = collectBookingItems();

  let accommodationTotal = 0;

  items.forEach((item) => {
    const accommodation = getAccommodationById(item.accommodation_id);
    if (!accommodation) return;

    const slot = getSlotOptions(accommodation).find((s) => {
      return s.value === item.slot_type;
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
// SECTION 12: Format and message helpers
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

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString();
}

function showMessage(message, type = "success") {
  if (bookingMessage) {
    bookingMessage.textContent = message;
    bookingMessage.style.color = type === "error" ? "red" : "green";
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