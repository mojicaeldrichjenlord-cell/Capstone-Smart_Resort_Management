// ============================================================
// CUSTOMER BOOKING PAYMENT SCRIPT
// File: frontend/customerJS/booking-payment.js
// Purpose:
// - Read booking draft from sessionStorage
// - Show reservation summary and payment breakdown
// - Show GCash/Maya QR details
// - Submit reservation with payment proof
// - Works from frontend/customerHTML/booking-payment.html
// ============================================================

const BOOKING_DRAFT_KEY = "smartresort_booking_draft_v2";

const PAYMENT_DETAILS = {
  gcash: {
    label: "GCash",
    accountName: "Arvic Seaside Beach Resort and Hotel",
    accountNumber: "09XX XXX XXXX",
    qrImage: "../images/payments/gcash-qr.png",
  },
  paymaya: {
    label: "Maya / PayMaya",
    accountName: "Arvic Seaside Beach Resort and Hotel",
    accountNumber: "09XX XXX XXXX",
    qrImage: "../images/payments/maya-qr.png",
  },
};

let bookingDraft = null;
let availableAccommodations = [];
let currentDownpaymentAmount = 0;

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
  await loadAccommodations();
  loadDraft();
  renderDraftSummary();
  setupPaymentForm();
  updateQrPlaceholder();
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
// SECTION 3: Load accommodations
// ============================================================

async function loadAccommodations() {
  try {
    const response = await fetch(`${API_BASE}/rooms/available`);
    const data = await safeReadJson(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load accommodations.");
    }

    availableAccommodations = Array.isArray(data) ? data : data.rooms || [];
  } catch (error) {
    console.error("loadAccommodations error:", error);
    showMessage(error.message || "Failed to load accommodations.", "error");
  }
}

// ============================================================
// SECTION 4: Load booking draft
// ============================================================

function loadDraft() {
  const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);

  if (!raw) {
    alert(
      "No reservation draft found. Please fill up the reservation form first.",
    );
    window.location.href = "booking.html";
    return;
  }

  try {
    bookingDraft = JSON.parse(raw);
  } catch (error) {
    console.error("loadDraft error:", error);
    alert("Reservation draft is invalid. Please start again.");
    window.location.href = "booking.html";
  }
}

// ============================================================
// SECTION 5: Accommodation helpers
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
// SECTION 6: Render draft summary and payment breakdown
// ============================================================

function renderDraftSummary() {
  if (!bookingDraft) return;

  const summaryList = document.getElementById("reservationSummaryList");
  if (!summaryList) return;

  const items = Array.isArray(bookingDraft.items) ? bookingDraft.items : [];
  let accommodationTotal = 0;

  summaryList.innerHTML = items
    .map((item, index) => {
      const accommodation = getAccommodationById(item.accommodation_id);

      if (!accommodation) {
        return `
          <div class="summary-item">
            <strong>Accommodation Item ${index + 1}</strong><br />
            Selected accommodation is unavailable or missing.
          </div>
        `;
      }

      const slot = getSlotOptions(accommodation).find((s) => {
        return s.value === item.slot_type;
      });

      const slotPrice = Number(slot?.price || 0);
      accommodationTotal += slotPrice;

      const checkOutDate = calculateCheckOutDate(
        item.check_in_date,
        slot?.start,
        slot?.end,
      );

      return `
        <div class="summary-item">
          <strong>${escapeHtml(accommodation.name)}</strong><br />
          Category: ${escapeHtml(accommodation.category_name)}<br />
          Slot: ${escapeHtml(slot?.label || "-")} (${formatTimeDisplay(slot?.start)} - ${formatTimeDisplay(slot?.end)})<br />
          Reservation Date: ${formatDateDisplay(item.check_in_date)}<br />
          Check-out Date: ${formatDateDisplay(checkOutDate)}<br />
          Max Capacity: ${accommodation.max_capacity || 0} guest(s)<br />
          Price: ₱${formatMoney(slotPrice)}
        </div>
      `;
    })
    .join("");

  const entranceFee = getEstimatedEntranceFee();
  const downpayment = accommodationTotal * 0.5;
  const remaining = accommodationTotal - downpayment;

  currentDownpaymentAmount = downpayment;

  document.getElementById("paymentAccommodationTotal").textContent =
    `₱${formatMoney(accommodationTotal)}`;

  document.getElementById("paymentDownpayment").textContent =
    `₱${formatMoney(downpayment)}`;

  document.getElementById("paymentRemaining").textContent =
    `₱${formatMoney(remaining)}`;

  document.getElementById("paymentEntranceFee").textContent =
    `₱${formatMoney(entranceFee)}`;

  document.getElementById("paymentFrontDeskReminder").textContent =
    `₱${formatMoney(remaining + entranceFee)}`;
}

// ============================================================
// SECTION 7: Entrance fee estimate
// ============================================================

function getEstimatedEntranceFee() {
  if (!bookingDraft) return 0;

  const guestCount = Number(bookingDraft.guest_count || 0);
  const entranceType = bookingDraft.entrance_type || "pool_beach";
  const items = Array.isArray(bookingDraft.items) ? bookingDraft.items : [];

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

function getTotalFreeEntrancePax(items, guestCount) {
  let total = 0;

  items.forEach((item) => {
    const accommodation = getAccommodationById(item.accommodation_id);
    if (!accommodation) return;

    total += Number(accommodation.free_entrance_pax || 0);
  });

  return Math.min(total, Number(guestCount || 0));
}

// ============================================================
// SECTION 8: Payment form setup
// ============================================================

function setupPaymentForm() {
  const paymentMethod = document.getElementById("paymentMethod");
  const paymentProof = document.getElementById("paymentProof");
  const paymentForm = document.getElementById("paymentForm");

  if (paymentMethod) {
    paymentMethod.addEventListener("change", updateQrPlaceholder);
  }

  if (paymentProof) {
    paymentProof.addEventListener("change", updateProofPreview);
  }

  if (paymentForm) {
    paymentForm.addEventListener("submit", submitReservation);
  }
}

// ============================================================
// SECTION 9: QR payment box
// ============================================================

function updateQrPlaceholder() {
  const method = document.getElementById("paymentMethod")?.value || "gcash";
  const box = document.getElementById("qrPlaceholderBox");

  if (!box) return;

  const details = PAYMENT_DETAILS[method] || PAYMENT_DETAILS.gcash;

  box.innerHTML = `
    <div class="qr-payment-badge">${escapeHtml(details.label)} Selected</div>

    <img
      src="${escapeHtml(details.qrImage)}"
      alt="${escapeHtml(details.label)} QR Code"
      onerror="this.src='../images/no-image.jpg'"
    />

    <div class="qr-payment-title">${escapeHtml(details.label)} Payment</div>

    <p class="qr-payment-detail">
      <strong>Account Name:</strong><br />
      ${escapeHtml(details.accountName)}
    </p>

    <p class="qr-payment-detail">
      <strong>Account Number:</strong><br />
      ${escapeHtml(details.accountNumber)}
    </p>

    <div class="qr-payment-amount">
      Amount to Pay: ₱${formatMoney(currentDownpaymentAmount)}
    </div>

    <div class="qr-payment-reminder">
      Scan the QR code using your selected payment app.
      After payment, enter your reference number and upload the transaction screenshot.
      Your reservation is approved, but your payment will remain pending until admin verifies it.
    </div>
  `;
}

// ============================================================
// SECTION 10: Proof preview and validation
// ============================================================

function updateProofPreview() {
  const input = document.getElementById("paymentProof");
  const preview = document.getElementById("proofPreview");

  if (!input || !preview) return;

  const file = input.files && input.files[0];

  if (!file) {
    preview.classList.remove("show");
    preview.textContent = "No screenshot selected yet.";
    return;
  }

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/heic",
    "image/heif",
  ];
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    input.value = "";
    preview.classList.add("show");
    preview.textContent =
      "Invalid file type. Please upload PNG, JPG, JPEG, WEBP, HEIC, or HEIF only.";
    return;
  }

  if (file.size > maxSize) {
    input.value = "";
    preview.classList.add("show");
    preview.textContent =
      "File is too large. Please upload an image below 5MB.";
    return;
  }

  preview.classList.add("show");
  preview.textContent = `Selected proof: ${file.name}`;
}

// ============================================================
// SECTION 11: Submit reservation
// ============================================================

async function submitReservation(e) {
  e.preventDefault();

  if (!bookingDraft) {
    showMessage("Reservation draft is missing.", "error");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const paymentMethod = document.getElementById("paymentMethod").value;
  const paymentReference = document
    .getElementById("paymentReference")
    .value.trim();

  const paymentReminderNote = document
    .getElementById("paymentReminderNote")
    .value.trim();

  const paymentProofInput = document.getElementById("paymentProof");
  const paymentProofFile = paymentProofInput?.files?.[0];

  if (!paymentReference) {
    showMessage("Payment reference number is required.", "error");
    return;
  }

  if (!paymentProofFile) {
    showMessage("Please upload your proof of transaction screenshot.", "error");
    return;
  }

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/heic",
    "image/heif",
  ];
  const maxSize = 5 * 1024 * 1024;

  if (!allowedTypes.includes(paymentProofFile.type)) {
    showMessage(
      "Invalid proof image. Please upload PNG, JPG, JPEG, WEBP, HEIC, or HEIF only.",
      "error",
    );
    return;
  }

  if (paymentProofFile.size > maxSize) {
    showMessage(
      "Proof image is too large. Please upload an image below 5MB.",
      "error",
    );
    return;
  }

  const payload = {
    ...bookingDraft,
    user_id: bookingDraft.user_id || user?.id,
    payment_method: paymentMethod,
    payment_type: "downpayment",
    proof_reference: paymentReference,
    note: [bookingDraft.note, paymentReminderNote].filter(Boolean).join(" | "),
  };

  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));

  // Backend route uses upload.single("proof_image"),
  // so the field name must be proof_image.
  formData.append("proof_image", paymentProofFile);

  const submitBtn = document.querySelector(
    '#paymentForm button[type="submit"]',
  );
  const originalText = submitBtn ? submitBtn.textContent : "Submit Reservation";

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    const response = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      body: formData,
    });

    const data = await safeReadJson(response);

    if (!response.ok) {
      throw new Error(data.message || "Reservation failed.");
    }

    sessionStorage.removeItem(BOOKING_DRAFT_KEY);

    if (data.bookingId) {
      window.location.href = `booking-receipt.html?id=${data.bookingId}`;
    } else {
      window.location.href = "my-bookings.html";
    }
  } catch (error) {
    console.error("submitReservation error:", error);
    showMessage(
      error.message || "Something went wrong. Please try again.",
      "error",
    );
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

// ============================================================
// SECTION 12: Safer JSON reader
// Helps show a clearer error if backend returns HTML instead of JSON.
// ============================================================

async function safeReadJson(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Non-JSON response from server:", text);

    throw new Error(
      "Server returned HTML instead of JSON. Check if backend route /api/bookings is running correctly.",
    );
  }
}

// ============================================================
// SECTION 13: Date and format helpers
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
  const messageEl = document.getElementById("paymentMessage");

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
