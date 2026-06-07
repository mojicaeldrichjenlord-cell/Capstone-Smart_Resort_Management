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
let isSubmittingReservation = false;

console.log(
  "[booking-payment] JS loaded. API_BASE:",
  typeof API_BASE !== "undefined" ? API_BASE : "API_BASE missing",
);

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

function getStayDuration(item) {
  return Math.max(1, Math.min(5, Number(item?.stay_duration || 1)));
}

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

      const stayDuration = getStayDuration(item);
      const slotPrice = Number(slot?.price || 0);
      const itemTotal = slotPrice * stayDuration;
      accommodationTotal += itemTotal;

      const checkOutDate = calculateCheckOutDate(
        item.check_in_date,
        slot?.start,
        slot?.end,
        stayDuration,
      );
      const durationLabel =
        item.slot_type === "extended"
          ? `${stayDuration} ${stayDuration === 1 ? "day" : "days"}`
          : item.slot_type === "overnight"
            ? "1 night only"
            : "1 day only";

      return `
        <div class="summary-item">
          <strong>${escapeHtml(accommodation.name)}</strong><br />
          Category: ${escapeHtml(accommodation.category_name)}<br />
          Slot: ${escapeHtml(slot?.label || "-")} (${formatTimeDisplay(slot?.start)} - ${formatTimeDisplay(slot?.end)})<br />
          Reservation Date: ${formatDateDisplay(item.check_in_date)}<br />
          Check-out Date: ${formatDateDisplay(checkOutDate)}<br />
          Stay Duration: ${escapeHtml(durationLabel)}<br />
          Max Capacity: ${accommodation.max_capacity || 0} guest(s)<br />
          Price: ₱${formatMoney(slotPrice)}${item.slot_type === "extended" ? ` × ${stayDuration} = ₱${formatMoney(itemTotal)}` : ""}
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

  const submitReservationBtn = document.getElementById("submitReservationBtn");

  if (paymentForm) {
    // Hard block native browser submit/reload.
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

    console.log("[booking-payment] paymentForm native submit blocked.");
  } else {
    console.error("[booking-payment] paymentForm was not found.");
  }

  if (submitReservationBtn) {
    submitReservationBtn.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        console.log("[booking-payment] Submit button clicked.");
        submitReservation(event);
        return false;
      },
      true,
    );

    console.log(
      "[booking-payment] submitReservationBtn click handler attached.",
    );
  } else {
    console.error("[booking-payment] submitReservationBtn was not found.");
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
  if (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
  }

  console.log("[booking-payment] Submit handler fired.");

  if (isSubmittingReservation) {
    console.warn("[booking-payment] Duplicate submit blocked.");
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
  const paymentReference = document
    .getElementById("paymentReference")
    ?.value.trim();

  const paymentReminderNote = document
    .getElementById("paymentReminderNote")
    ?.value.trim();

  const paymentProofInput = document.getElementById("paymentProof");
  const paymentProofFile = paymentProofInput?.files?.[0];

  if (!paymentReference) {
    showMessage("Please enter your payment reference number.", "error");
    document.getElementById("paymentReference")?.focus();
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

    console.log(
      "[booking-payment] Sending JSON request to:",
      `${API_BASE}/bookings`,
    );

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
      console.warn(
        "[booking-payment] Backend response was not JSON:",
        responseText,
      );
      data = {};
    }

    console.log("[booking-payment] Backend status:", response.status);
    console.log("[booking-payment] Backend response:", data);

    if (!response.ok) {
      throw new Error(data.message || responseText || "Reservation failed.");
    }

    sessionStorage.removeItem(BOOKING_DRAFT_KEY);

    console.log(
      "[booking-payment] Reservation created successfully. Redirecting to My Bookings.",
    );
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

function extractBookingId(data) {
  return (
    data?.bookingId ||
    data?.reservationId ||
    data?.reservation_id ||
    data?.id ||
    data?.booking?.id ||
    data?.data?.bookingId ||
    data?.data?.reservationId ||
    null
  );
}

async function fetchLatestUserBookingId(userId) {
  if (!userId) return null;

  try {
    const response = await fetch(`${API_BASE}/bookings/user/${userId}`);
    const data = await safeReadJson(response);

    if (!response.ok) {
      console.warn(
        "[booking-payment] Failed to fetch latest user booking:",
        data,
      );
      return null;
    }

    const bookings = Array.isArray(data?.bookings)
      ? data.bookings
      : Array.isArray(data)
        ? data
        : [];

    const latest = bookings[0];
    console.log("[booking-payment] Latest user booking fallback:", latest);

    return latest?.id || latest?.bookingId || latest?.reservationId || null;
  } catch (error) {
    console.warn("[booking-payment] Latest booking fallback failed:", error);
    return null;
  }
}

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

  console.log("[booking-payment] FORCE REDIRECT TO MY BOOKINGS:", targetUrl);

  window.location.href = targetUrl;

  setTimeout(() => {
    window.location.assign(targetUrl);
  }, 200);

  setTimeout(() => {
    window.location.replace(targetUrl);
  }, 500);
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
