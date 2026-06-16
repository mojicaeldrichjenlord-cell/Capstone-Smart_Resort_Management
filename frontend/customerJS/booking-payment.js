// ============================================================
// SMARTRESORT BOOKING PAYMENT SCRIPT
// File: frontend/customerJS/booking-payment.js
// Purpose:
// - Read booking draft from sessionStorage
// - Show reservation summary and payment breakdown
// - Show GCash/Maya QR in modal
// - Submit reservation with payment proof
// - Supports 4 slot types:
//   day_tour, night, day_extended, night_extended
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
let isSubmittingReservation = false;

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
  setupQrModal();
  await loadAccommodations();
  loadDraft();
  renderDraftSummary();
  setupPaymentForm();
  updateQrPlaceholder();
  updatePaymentReferenceUI();
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
// SECTION 3: QR modal
// ============================================================

function setupQrModal() {
  const openBtn = document.getElementById("openQrModalBtn");
  const closeBtn = document.getElementById("closeQrModalBtn");
  const modal = document.getElementById("qrPaymentModal");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => {
      updateQrPlaceholder();
      modal.classList.add("show");
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("show");
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal) {
      modal.classList.remove("show");
    }
  });
}

// ============================================================
// SECTION 4: Load accommodations
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
// SECTION 5: Load booking draft
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
// SECTION 6: Accommodation and slot helpers
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

function getStayDuration(item) {
  return Math.max(1, Math.min(5, Number(item?.stay_duration || 1)));
}

function isLongStaySlot(slotType) {
  return ["day_extended", "night_extended"].includes(String(slotType || ""));
}

function isOvernightStyleSlot(slotType) {
  return ["night", "day_extended", "night_extended"].includes(
    String(slotType || ""),
  );
}

// ============================================================
// SECTION 7: Render draft summary and payment breakdown
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

      const slotType = String(item.slot_type || "").toLowerCase();

      const slot = getSlotOptions(accommodation).find((s) => {
        return s.value === slotType;
      });

      const stayDuration = isLongStaySlot(slotType) ? getStayDuration(item) : 1;
      const slotPrice = Number(slot?.price || 0);
      const itemTotal = slotPrice * stayDuration;
      accommodationTotal += itemTotal;

      const checkOutDate = calculateCheckOutDate(
        item.check_in_date,
        slot?.start,
        slot?.end,
        stayDuration,
      );

      const durationLabel = isLongStaySlot(slotType)
        ? `${stayDuration} ${stayDuration === 1 ? "day" : "days"}`
        : "Fixed schedule only";

      return `
        <div class="summary-item">
          <strong>${escapeHtml(accommodation.name)}</strong><br />
          Category: ${escapeHtml(accommodation.category_name)}<br />
          Slot: ${escapeHtml(slot?.label || "-")} (${formatTimeDisplay(slot?.start)} - ${formatTimeDisplay(slot?.end)})<br />
          Reservation Date: ${formatDateDisplay(item.check_in_date)}<br />
          Check-out Date: ${formatDateDisplay(checkOutDate)}<br />
          Stay Duration: ${escapeHtml(durationLabel)}<br />
          Max Capacity: ${accommodation.max_capacity || 0} guest(s)<br />
          Price: ₱${formatMoney(slotPrice)}${isLongStaySlot(slotType) ? ` × ${stayDuration} = ₱${formatMoney(itemTotal)}` : ""}
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

  updateQrPlaceholder();
}

// ============================================================
// SECTION 8: Entrance fee estimate
// ============================================================

function getEstimatedEntranceFee() {
  if (!bookingDraft) return 0;

  const guestCount = Number(bookingDraft.guest_count || 0);
  const entranceType = bookingDraft.entrance_type || "pool_beach";
  const items = Array.isArray(bookingDraft.items) ? bookingDraft.items : [];

  const hasOvernightStyle = items.some((item) => {
    return isOvernightStyleSlot(item.slot_type);
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
// SECTION 9: Payment reference number helpers
// ============================================================

function normalizeReferenceNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function getReferenceMaxDigits(method) {
  const cleanMethod = String(method || "").toLowerCase();
  return cleanMethod === "gcash" ? 13 : 30;
}

function formatReferenceNumberForDisplay(value, method) {
  const maxDigits = getReferenceMaxDigits(method);
  const digits = normalizeReferenceNumber(value).slice(0, maxDigits);
  const groups = digits.match(/.{1,4}/g) || [];

  return groups.join("-");
}

function validateReferenceNumberByMethod(referenceNumber, method) {
  const cleanMethod = String(method || "").toLowerCase();
  const digits = normalizeReferenceNumber(referenceNumber);

  if (cleanMethod === "gcash") {
    return {
      valid: /^\d{13}$/.test(digits),
      message: "GCash reference number must be exactly 13 digits.",
      digits,
    };
  }

  if (cleanMethod === "paymaya") {
    return {
      valid: /^\d{6,30}$/.test(digits),
      message:
        "Maya / PayMaya reference number must be numbers only, 6 to 30 digits.",
      digits,
    };
  }

  return {
    valid: true,
    message: "",
    digits,
  };
}

// ============================================================
// SECTION 10: Payment form setup
// ============================================================

function setupPaymentForm() {
  const paymentMethod = document.getElementById("paymentMethod");
  const paymentProof = document.getElementById("paymentProof");
  const paymentReference = document.getElementById("paymentReference");
  const paymentForm = document.getElementById("paymentForm");

  if (paymentMethod) {
    paymentMethod.addEventListener("change", () => {
      updateQrPlaceholder();
      updatePaymentReferenceUI();
    });
  }

  if (paymentReference) {
    paymentReference.addEventListener("input", () => {
      paymentReference.value = formatReferenceNumberForDisplay(
        paymentReference.value,
        paymentMethod?.value || "gcash",
      );
    });

    paymentReference.addEventListener("paste", () => {
      setTimeout(() => {
        paymentReference.value = formatReferenceNumberForDisplay(
          paymentReference.value,
          paymentMethod?.value || "gcash",
        );
      }, 0);
    });
  }

  if (paymentProof) {
    paymentProof.addEventListener("change", updateProofPreview);
  }

  const submitReservationBtn = document.getElementById("submitReservationBtn");

  if (paymentForm) {
    paymentForm.setAttribute("novalidate", "novalidate");
    paymentForm.setAttribute("onsubmit", "return false;");

    paymentForm.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        submitReservation(event);
        return false;
      },
      true,
    );
  }

  if (submitReservationBtn) {
    submitReservationBtn.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        submitReservation(event);
        return false;
      },
      true,
    );
  }
}

// ============================================================
// SECTION 11: QR payment box
// ============================================================

function updateQrPlaceholder() {
  const method = document.getElementById("paymentMethod")?.value || "gcash";
  const box = document.getElementById("qrPlaceholderBox");
  const qrMethodPreview = document.getElementById("qrMethodPreview");

  const details = PAYMENT_DETAILS[method] || PAYMENT_DETAILS.gcash;

  if (qrMethodPreview) {
    qrMethodPreview.textContent = `Selected method: ${details.label}`;
  }

  if (!box) return;

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
      Your reservation will remain pending until admin verifies your proof.
    </div>
  `;
}

function updatePaymentReferenceUI() {
  const method = document.getElementById("paymentMethod")?.value || "gcash";
  const referenceInput = document.getElementById("paymentReference");
  const helpText = document.getElementById("paymentReferenceHelp");

  if (referenceInput) {
    referenceInput.placeholder =
      method === "gcash"
        ? "GCash: 1234-5678-9012-3"
        : "Maya: 1234-5678-9012";

    referenceInput.setAttribute("maxlength", method === "gcash" ? "16" : "37");
    referenceInput.value = formatReferenceNumberForDisplay(
      referenceInput.value,
      method,
    );
  }

  if (helpText) {
    helpText.textContent =
      method === "gcash"
        ? "GCash reference number must be exactly 13 digits."
        : "Maya / PayMaya reference number must be numbers only, 6 to 30 digits.";
  }
}

// ============================================================
// SECTION 12: Proof preview and validation
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
// SECTION 13: Submit reservation
// ============================================================

async function submitReservation(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
  }

  if (isSubmittingReservation) {
    return false;
  }

  if (!bookingDraft) {
    showMessage("Reservation draft is missing.", "error");
    return false;
  }

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user?.id) {
    showMessage("User session is missing. Please login again.", "error");
    return false;
  }

  const paymentMethod =
    document.getElementById("paymentMethod")?.value || "gcash";
  const paymentReferenceInput = document.getElementById("paymentReference");
  const paymentReference = normalizeReferenceNumber(
    paymentReferenceInput?.value || "",
  );

  const paymentReminderNote = document
    .getElementById("paymentReminderNote")
    ?.value.trim();

  const paymentProofInput = document.getElementById("paymentProof");
  const paymentProofFile = paymentProofInput?.files?.[0];

  const referenceValidation = validateReferenceNumberByMethod(
    paymentReference,
    paymentMethod,
  );

  if (!referenceValidation.valid) {
    showMessage(referenceValidation.message, "error");
    paymentReferenceInput?.focus();
    return false;
  }

  if (!paymentProofFile) {
    showMessage("Please upload your proof of transaction screenshot.", "error");
    paymentProofInput?.focus();
    return false;
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
    return false;
  }

  if (paymentProofFile.size > maxSize) {
    showMessage(
      "Proof image is too large. Please upload an image below 5MB.",
      "error",
    );
    return false;
  }

  const payload = {
    ...bookingDraft,
    user_id: bookingDraft.user_id || user.id,
    payment_method: paymentMethod,
    payment_type: "downpayment",
    proof_reference: paymentReference,
    note: [bookingDraft.note, paymentReminderNote].filter(Boolean).join(" | "),
  };

  const proofImageData = await fileToBase64(paymentProofFile);

  const jsonPayload = {
    ...payload,
    proof_image_data: proofImageData,
  };

  const submitBtn =
    document.getElementById("submitReservationBtn") ||
    document.querySelector('#paymentForm button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : "Submit Reservation";

  try {
    isSubmittingReservation = true;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    const response = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(jsonPayload),
    });

    const responseText = await response.text();
    let data = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (jsonError) {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.message || responseText || "Reservation failed.");
    }

    sessionStorage.removeItem(BOOKING_DRAFT_KEY);

    showMessage(
      "Reservation submitted successfully. Redirecting to My Bookings...",
      "success",
    );

    redirectToMyBookings();
    return false;
  } catch (error) {
    isSubmittingReservation = false;
    console.error("submitReservation error:", error);
    showMessage(
      error.message || "Something went wrong. Please try again.",
      "error",
    );

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  return false;
}

// ============================================================
// SECTION 14: File and redirect helpers
// ============================================================

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read proof image."));
    reader.readAsDataURL(file);
  });
}

function redirectToMyBookings() {
  const targetUrl = new URL("my-bookings.html", window.location.href).href;

  window.location.href = targetUrl;

  setTimeout(() => {
    window.location.assign(targetUrl);
  }, 200);

  setTimeout(() => {
    window.location.replace(targetUrl);
  }, 500);
}

// ============================================================
// SECTION 15: Safe JSON reader
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
// SECTION 16: Date and format helpers
// ============================================================

function calculateCheckOutDate(
  checkInDate,
  startTime,
  endTime,
  stayDuration = 1,
) {
  if (!checkInDate || !startTime || !endTime) return checkInDate || "-";

  const startParts = String(startTime).split(":");
  const endParts = String(endTime).split(":");

  if (startParts.length < 2 || endParts.length < 2) return checkInDate;

  const startMinutes = Number(startParts[0]) * 60 + Number(startParts[1]);
  const endMinutes = Number(endParts[0]) * 60 + Number(endParts[1]);
  const cleanDuration = Math.max(1, Math.min(5, Number(stayDuration || 1)));
  const daysToAdd =
    cleanDuration > 1 ? cleanDuration : endMinutes <= startMinutes ? 1 : 0;

  if (daysToAdd > 0) {
    const date = new Date(`${checkInDate}T00:00:00`);
    date.setDate(date.getDate() + daysToAdd);
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

  const date = new Date(`${String(dateValue).slice(0, 10)}T00:00:00`);

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
