// ============================================================
// SMARTRESORT ADMIN / FRONT DESK WALK-IN PAYMENT SCRIPT
// FULL REPLACEMENT
//
// File to replace:
// frontend/adminJS/admin-walkin-payment.js
//
// Purpose:
// - Allow Administrator / Front Desk access
// - Load manual reservation draft from sessionStorage
// - Render reservation summary
// - Correctly read day_tour / night / day_extended / night_extended
// - Correctly compute accommodation total and 50% downpayment
// - Correctly multiply extended-stay price by stay_duration
// - Treat Day 22/23 Hours as DAY entrance rate and Night 22/23 Hours as NIGHT
// - Walk-in collects accommodation only; entrance is finalized after check-in
// - Handle Cash / GCash / Maya / PayPal manual payment rules
// - Send created_by using the logged-in staff account
// - Submit manual reservation to backend
// ============================================================

const ADMIN_WALKIN_DRAFT_KEY = "smartresort_admin_walkin_draft_v2";
const ADMIN_WALKIN_SUCCESS_RESET_KEY =
  "smartresort_admin_walkin_success_reset";

// If a successful submit somehow reloads this same payment page instead of
// navigating away, this URL hash survives the reload and lets startup recover.
const ADMIN_WALKIN_SUCCESS_REDIRECT_HASH =
  "#manual-reservation-created";

const ADMIN_FRONTDESK_PAYPAL_PENDING_KEY =
  "smartresort_frontdesk_paypal_pending_v1";

const PAYPAL_SDK_SCRIPT_ID =
  "paypal-web-sdk-v6-frontdesk";

const PAYPAL_SDK_URL =
  "https://www.sandbox.paypal.com/web-sdk/v6/core";

let walkInDraft = null;
let availableAccommodations = [];
let isSubmittingManualReservation = false;

// The normal POST response redirect remains the primary path.
// This watchdog handles the observed edge case where the backend has already
// created the reservation but the browser never receives/finishes the POST
// success response, leaving the staff on the payment page.
let manualReservationRedirectStarted = false;
let manualReservationWatchdogTimer = null;

let frontDeskPayPalSdkInstance = null;
let frontDeskPayPalPaymentSession = null;
let frontDeskPayPalSetupPromise = null;
let frontDeskPayPalButtonBound = false;
let frontDeskPayPalReservationCreating = false;

let computedTotals = {
  accommodationTotal: 0,
  requiredDownpayment: 0,
  estimatedEntranceFee: 0,
  paidAmount: 0,
  remainingBalance: 0,
};

// ============================================================
// SECTION 1: Page startup
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  checkStaffAccess();
  setupLogout();

  // ----------------------------------------------------------
  // SUCCESS-RELOAD RECOVERY
  //
  // We observed that the reservation can already be saved while the
  // browser unexpectedly reloads this same payment page. The successful
  // submission marker is checked before the draft is loaded, so the user
  // is sent to the correct Guest page instead of seeing a reset form.
  // ----------------------------------------------------------
  if (redirectFromCompletedManualReservation()) {
    return;
  }

  walkInDraft = getWalkInDraft();

  if (!walkInDraft) {
    alert(
      "No manual reservation draft found. Please create the reservation first.",
    );
    window.location.href = "admin-walkin.html";
    return;
  }

  walkInDraft.reservation_type = getManualReservationType();

  await loadAccommodations();

  ensureFrontDeskPayPalUi();
  setupPaymentForm();
  renderReservationSummary();
  updatePaymentRequirementUI();
  updatePaymentBreakdown();
});

// ============================================================
// SECTION 2: Administrator / Front Desk access
// ============================================================

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("getLoggedInUser error:", error);
    return null;
  }
}

function checkStaffAccess() {
  const user = getLoggedInUser();

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  const role = String(user.role || "").toLowerCase();

  if (!["admin", "frontdesk"].includes(role)) {
    alert("Access denied. Front Desk or Administrator account required.");
    window.location.href = "../index.html";
  }
}


// ============================================================
// SECTION 2.1: Role-aware success destination
//
// After a successful manual reservation:
// - Front Desk goes directly to Front Desk Guest Management.
// - Administrator goes directly to Admin Guests Inside.
//
// This prevents the payment page from looking like it is still waiting for
// another submission after the reservation has already been created.
// ============================================================

function getManualReservationSuccessDestination() {
  const user = getLoggedInUser();
  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  if (role === "admin") {
    return "/frontend/adminHTML/admin-guests-inside.html";
  }

  // Front Desk, legacy "staff", or safe operational fallback.
  return "/frontend/frontdeskHTML/frontdeskGuests.html";
}

function buildManualReservationSuccessUrl(data = {}) {
  const target = new URL(
    getManualReservationSuccessDestination(),
    window.location.origin,
  );

  target.searchParams.set("created", "1");

  if (data?.reservationCode) {
    target.searchParams.set(
      "reservationCode",
      String(data.reservationCode),
    );
  }

  if (data?.bookingId) {
    target.searchParams.set(
      "reservationId",
      String(data.bookingId),
    );
  }

  return target.href;
}

function markCompletedManualReservationInCurrentUrl() {
  try {
    const currentUrl = new URL(window.location.href);

    currentUrl.hash =
      ADMIN_WALKIN_SUCCESS_REDIRECT_HASH;

    // No reload here. This only places a recovery marker in the URL.
    window.history.replaceState(
      null,
      document.title,
      currentUrl.href,
    );
  } catch (error) {
    console.error(
      "Could not set manual reservation success marker:",
      error,
    );
  }
}

function redirectFromCompletedManualReservation() {
  if (
    window.location.hash !==
    ADMIN_WALKIN_SUCCESS_REDIRECT_HASH
  ) {
    return false;
  }

  const target = new URL(
    getManualReservationSuccessDestination(),
    window.location.origin,
  ).href;

  // This is running during a fresh page load, so there is no submit click
  // left to interfere with the navigation.
  window.location.replace(target);

  return true;
}

function redirectAfterSuccessfulManualReservation(data = {}) {
  if (manualReservationRedirectStarted) {
    return;
  }

  manualReservationRedirectStarted = true;

  if (manualReservationWatchdogTimer) {
    window.clearInterval(
      manualReservationWatchdogTimer,
    );
    manualReservationWatchdogTimer = null;
  }

  const target =
    buildManualReservationSuccessUrl(data);

  // ----------------------------------------------------------
  // IMPORTANT:
  // Mark this payment URL BEFORE navigating.
  //
  // If the browser unexpectedly reloads this exact payment page after the
  // reservation was saved, DOMContentLoaded sees the hash and redirects
  // again before it tries to read the cleared draft.
  // ----------------------------------------------------------
  markCompletedManualReservationInCurrentUrl();

  // Primary navigation.
  window.location.replace(target);

  // Independent fallback if the page is somehow still here.
  window.setTimeout(() => {
    if (
      window.location.hash ===
      ADMIN_WALKIN_SUCCESS_REDIRECT_HASH
    ) {
      window.open(target, "_self");
    }
  }, 250);
}

// ============================================================
// SECTION 2.2: Manual reservation creation watchdog
//
// Why this exists:
// We confirmed a real case where the reservation is already present in the
// database / Front Desk Guests page, but the payment page does not receive
// or finish the POST success flow and therefore never reaches its redirect.
//
// This watchdog does NOT create another reservation.
// It only checks GET /bookings?scope=all for a NEW matching reservation
// after the submit started. Once found, it redirects to Guests.
// ============================================================

function getBookingsArrayFromApiResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.bookings)) {
    return data.bookings;
  }

  return [];
}

async function getManualReservationBaselineId() {
  try {
    const response = await fetch(
      `${API_BASE}/bookings?scope=all`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const bookings =
      getBookingsArrayFromApiResponse(data);

    return bookings.reduce(
      (maxId, booking) =>
        Math.max(
          maxId,
          Number(booking?.id || 0),
        ),
      0,
    );
  } catch (error) {
    console.warn(
      "Manual reservation baseline lookup failed:",
      error,
    );

    return null;
  }
}

function normalizeWatchdogText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeWatchdogPhone(value) {
  return String(value || "")
    .replace(/\D/g, "");
}

function bookingMatchesCurrentManualDraft(
  booking,
  baselineId,
) {
  if (!booking || !walkInDraft) {
    return false;
  }

  const bookingId = Number(booking.id || 0);

  if (
    Number.isFinite(baselineId) &&
    bookingId <= baselineId
  ) {
    return false;
  }

  if (
    normalizeWatchdogText(
      booking.booking_source,
    ) !== "manual"
  ) {
    return false;
  }

  const bookingPhone =
    normalizeWatchdogPhone(
      booking.contact_no || booking.phone,
    );

  const draftPhone =
    normalizeWatchdogPhone(
      walkInDraft.contact_no,
    );

  if (
    draftPhone &&
    bookingPhone !== draftPhone
  ) {
    return false;
  }

  const bookingFirstName =
    normalizeWatchdogText(
      booking.first_name,
    );

  const bookingLastName =
    normalizeWatchdogText(
      booking.last_name,
    );

  const draftFirstName =
    normalizeWatchdogText(
      walkInDraft.first_name,
    );

  const draftLastName =
    normalizeWatchdogText(
      walkInDraft.last_name,
    );

  if (
    draftFirstName &&
    bookingFirstName !== draftFirstName
  ) {
    return false;
  }

  if (
    draftLastName &&
    bookingLastName !== draftLastName
  ) {
    return false;
  }

  const firstDraftItem =
    Array.isArray(walkInDraft.items)
      ? walkInDraft.items[0]
      : null;

  const draftCheckInDate =
    String(
      firstDraftItem?.check_in_date || "",
    ).slice(0, 10);

  const bookingCheckInDate =
    String(
      booking.check_in_date ||
        booking.check_in ||
        "",
    ).slice(0, 10);

  if (
    draftCheckInDate &&
    bookingCheckInDate &&
    draftCheckInDate !== bookingCheckInDate
  ) {
    return false;
  }

  return true;
}

function startManualReservationCreationWatchdog(
  baselineId,
) {
  if (!Number.isFinite(baselineId)) {
    return;
  }

  if (manualReservationWatchdogTimer) {
    window.clearInterval(
      manualReservationWatchdogTimer,
    );
  }

  let attempts = 0;
  const maxAttempts = 20;

  manualReservationWatchdogTimer =
    window.setInterval(async () => {
      attempts += 1;

      if (
        manualReservationRedirectStarted ||
        attempts > maxAttempts
      ) {
        window.clearInterval(
          manualReservationWatchdogTimer,
        );
        manualReservationWatchdogTimer = null;
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/bookings?scope=all`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const matchedBooking =
          getBookingsArrayFromApiResponse(data)
            .find((booking) =>
              bookingMatchesCurrentManualDraft(
                booking,
                baselineId,
              ),
            );

        if (!matchedBooking) {
          return;
        }

        // The reservation definitely exists, even if the original POST
        // response is still pending or failed to finish in the browser.
        sessionStorage.removeItem(
          ADMIN_WALKIN_DRAFT_KEY,
        );

        sessionStorage.setItem(
          ADMIN_WALKIN_SUCCESS_RESET_KEY,
          "1",
        );

        showMessage(
          "Manual reservation created successfully.",
          "success",
        );

        redirectAfterSuccessfulManualReservation({
          bookingId: matchedBooking.id,
          reservationCode:
            matchedBooking.reservation_code,
        });
      } catch (error) {
        console.warn(
          "Manual reservation watchdog check failed:",
          error,
        );
      }
    }, 1200);
}

// ============================================================
// SECTION 3: Logout
// ============================================================

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (event) => {
    event.preventDefault();

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
// SECTION 4: Manual reservation draft
// ============================================================

function getWalkInDraft() {
  const raw = sessionStorage.getItem(ADMIN_WALKIN_DRAFT_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("getWalkInDraft error:", error);
    return null;
  }
}

// ============================================================
// SECTION 5: Manual reservation type helpers
// Walk-in:
// - Cash, GCash, or Maya
// - Full accommodation payment only
// - GCash/Maya reference is OPTIONAL
// - GCash/Maya proof screenshot is REQUIRED
// - Auto check-in
//
// Facebook / Messenger:
// - GCash or Maya
// - 50% downpayment or full payment
// - Reference is OPTIONAL
// - Proof screenshot is REQUIRED
// ============================================================

function getManualReservationType() {
  const value = String(
    walkInDraft?.reservation_type || "walkin",
  ).toLowerCase();

  return value === "facebook" ? "facebook" : "walkin";
}

function isWalkInManualReservation() {
  return getManualReservationType() === "walkin";
}

function isFacebookManualReservation() {
  return getManualReservationType() === "facebook";
}

function formatManualReservationType(
  type = getManualReservationType(),
) {
  return type === "facebook"
    ? "Facebook / Messenger Reservation"
    : "Walk-in Guest";
}


// ============================================================
// SECTION 5.1: Manual reservation date safety check
//
// This is a second frontend guard on the payment screen.
// Even if an old/stale sessionStorage draft contains a future walk-in date,
// submission is blocked before the API request is sent.
// ============================================================

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

function validateManualReservationDraftDates() {
  const items = Array.isArray(walkInDraft?.items)
    ? walkInDraft.items
    : [];

  const today = getPhilippineTodayInputDate();
  const reservationType = getManualReservationType();

  for (const item of items) {
    const checkInDate = String(item?.check_in_date || "").slice(0, 10);

    if (!checkInDate) {
      return {
        valid: false,
        message:
          "An accommodation item has no reservation date. Please go back and review the reservation.",
      };
    }

    if (reservationType === "walkin" && checkInDate !== today) {
      return {
        valid: false,
        message:
          "Walk-in guests must use today's reservation date because they are already onsite. Please go back and review the reservation.",
      };
    }

    if (reservationType === "facebook" && checkInDate < today) {
      return {
        valid: false,
        message:
          "Facebook/Messenger reservations cannot use a past reservation date. Please go back and review the reservation.",
      };
    }
  }

  return {
    valid: true,
    message: "",
  };
}

function enforcePaymentOptionsByReservationType() {
  const paymentMethod = document.getElementById("paymentMethod");
  const paymentType = document.getElementById("paymentType");

  if (!paymentMethod || !paymentType) return;

  const previousMethod = String(paymentMethod.value || "").toLowerCase();
  const previousType = String(paymentType.value || "").toLowerCase();

  const pending = readFrontDeskPayPalPending();
  const currentDraftSignature = getFrontDeskPayPalDraftSignature();

  const hasMatchingPendingPayPal =
    Boolean(pending?.bookingId) &&
    Boolean(currentDraftSignature) &&
    pending?.draftSignature === currentDraftSignature;

  paymentMethod.disabled = false;

  if (isWalkInManualReservation()) {
    // Walk-in:
    // Cash / GCash / Maya / PayPal
    // Full accommodation payment only.
    paymentMethod.innerHTML = `
      <option value="cash">Cash</option>
      <option value="gcash">GCash</option>
      <option value="paymaya">Maya / PayMaya</option>
      <option value="paypal">PayPal</option>
    `;

    paymentMethod.value = hasMatchingPendingPayPal
      ? "paypal"
      : ["cash", "gcash", "paymaya", "paypal"].includes(previousMethod)
        ? previousMethod
        : "cash";

    paymentType.innerHTML = `<option value="full">Full Payment</option>`;
    paymentType.value = "full";
    paymentType.disabled = true;
    paymentType.title =
      "Walk-in reservations must be full payment only.";

    if (hasMatchingPendingPayPal) {
      paymentMethod.disabled = true;
      paymentMethod.title =
        "A pending PayPal reservation already exists. Complete the PayPal checkout before changing payment method.";
    } else {
      paymentMethod.title = "";
    }

    return;
  }

  // Facebook / Messenger:
  // GCash / Maya / PayPal. Cash is intentionally excluded.
  paymentMethod.innerHTML = `
    <option value="gcash">GCash</option>
    <option value="paymaya">Maya / PayMaya</option>
    <option value="paypal">PayPal</option>
  `;

  paymentMethod.value = hasMatchingPendingPayPal
    ? "paypal"
    : ["gcash", "paymaya", "paypal"].includes(previousMethod)
      ? previousMethod
      : "gcash";

  paymentType.innerHTML = `
    <option value="downpayment">50% Down Payment</option>
    <option value="full">Full Payment</option>
  `;

  paymentType.value = hasMatchingPendingPayPal
    ? pending.paymentType === "full"
      ? "full"
      : "downpayment"
    : ["downpayment", "full"].includes(previousType)
      ? previousType
      : "downpayment";

  if (hasMatchingPendingPayPal) {
    paymentMethod.disabled = true;
    paymentType.disabled = true;
    paymentMethod.title =
      "A pending PayPal reservation already exists. Complete the PayPal checkout before changing payment method.";
    paymentType.title =
      "The PayPal payment type is locked because the reservation has already been created.";
  } else {
    paymentMethod.disabled = false;
    paymentType.disabled = false;
    paymentMethod.title = "";
    paymentType.title = "";
  }
}

// ============================================================
// SECTION 6: Load accommodations
// Supports all current backend response formats.
// ============================================================

async function loadAccommodations() {
  try {
    const response = await fetch(`${API_BASE}/rooms/available`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to load accommodations.",
      );
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

    console.log(
      "[admin-walkin-payment] Loaded accommodations:",
      availableAccommodations.length,
    );
  } catch (error) {
    console.error("loadAccommodations error:", error);

    availableAccommodations = [];

    showMessage(
      error.message || "Failed to load accommodations.",
      "error",
    );
  }
}

// ============================================================
// SECTION 7: Payment reference helpers
// GCash: exactly 13 digits
// Maya: 6 to 30 digits
// ============================================================

function normalizeReferenceNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function getReferenceMaxDigits(method) {
  return String(method || "").toLowerCase() === "gcash"
    ? 13
    : 30;
}

function formatReferenceNumberForDisplay(value, method) {
  const maxDigits = getReferenceMaxDigits(method);

  const digits = normalizeReferenceNumber(value).slice(
    0,
    maxDigits,
  );

  const groups = digits.match(/.{1,4}/g) || [];

  return groups.join("-");
}

function validateReferenceNumberByMethod(
  referenceNumber,
  method,
) {
  const cleanMethod = String(method || "").toLowerCase();
  const digits = normalizeReferenceNumber(referenceNumber);

  if (cleanMethod === "gcash") {
    return {
      valid: /^\d{13}$/.test(digits),
      message:
        "GCash reference number must be exactly 13 digits.",
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
// SECTION 8: Setup payment form
// ============================================================

function setupPaymentForm() {
  const form = document.getElementById("adminPaymentForm");
  const paymentMethod =
    document.getElementById("paymentMethod");
  const paymentType = document.getElementById("paymentType");
  const proofImage = document.getElementById("proofImage");
  const proofReference =
    document.getElementById("proofReference");
  const submitBtn =
    document.getElementById("submitPaymentBtn");

  enforcePaymentOptionsByReservationType();

  if (paymentMethod) {
    paymentMethod.addEventListener("change", () => {
      updatePaymentRequirementUI();
      updatePaymentBreakdown();

      if (proofReference) {
        proofReference.value =
          formatReferenceNumberForDisplay(
            proofReference.value,
            paymentMethod.value,
          );
      }
    });
  }

  if (paymentType) {
    paymentType.addEventListener(
      "change",
      () => {
        updatePaymentBreakdown();

        if (
          String(paymentMethod?.value || "").toLowerCase() ===
          "paypal"
        ) {
          updateFrontDeskPayPalAmountDisplay();
        }
      },
    );
  }

  if (proofReference) {
    proofReference.addEventListener("input", () => {
      proofReference.value =
        formatReferenceNumberForDisplay(
          proofReference.value,
          paymentMethod?.value || "gcash",
        );
    });

    proofReference.addEventListener("paste", () => {
      setTimeout(() => {
        proofReference.value =
          formatReferenceNumberForDisplay(
            proofReference.value,
            paymentMethod?.value || "gcash",
          );
      }, 0);
    });
  }

  if (proofImage) {
    proofImage.addEventListener(
      "change",
      previewProofImage,
    );
  }

  // adminPaymentForm is currently a DIV in the HTML.
  // This guard also works if it becomes a real FORM later.
  if (form) {
    form.setAttribute("novalidate", "novalidate");

    form.onsubmit = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      return false;
    };
  }

  if (submitBtn) {
    submitBtn.type = "button";

    // Manual Cash / GCash / Maya continues through the existing submit path.
    // PayPal uses its own PayPal button and this handler only acts as a guard.
    submitBtn.addEventListener(
      "click",
      submitManualReservation,
    );
  }
}

// ============================================================
// SECTION 9: Reservation summary
// ============================================================

function renderReservationSummary() {
  const container =
    document.getElementById("reservationSummaryList");

  if (!container || !walkInDraft) return;

  const fullName = [
    walkInDraft.first_name,
    walkInDraft.middle_name,
    walkInDraft.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const items = Array.isArray(walkInDraft.items)
    ? walkInDraft.items
    : [];

  computedTotals = computeTotals();

  container.innerHTML = `
    <div class="summary-item">
      <strong>Guest Name:</strong>
      ${escapeHtml(fullName || "N/A")}<br />

      <strong>Contact No:</strong>
      ${escapeHtml(walkInDraft.contact_no || "N/A")}<br />

      <strong>Guest Count:</strong>
      ${Number(walkInDraft.guest_count || 0)}<br />

      <strong>Reservation Type:</strong>
      ${escapeHtml(formatManualReservationType())}
    </div>

    <div class="summary-item">
      <strong>Entrance Type:</strong>
      ${escapeHtml(
        formatEntranceType(walkInDraft.entrance_type),
      )}<br />

      <strong>Estimated Entrance Fee:</strong>
      ₱${formatMoney(computedTotals.estimatedEntranceFee)}
    </div>

    ${
      items.length
        ? items
            .map((item, index) =>
              renderReservationItem(item, index),
            )
            .join("")
        : `
          <div class="summary-item">
            No accommodation item found.
          </div>
        `
    }
  `;
}

function renderReservationItem(item, index) {
  const accommodation = getAccommodationById(
    item.accommodation_id,
  );

  const slot = getSlotOptions(accommodation).find(
    (slotItem) => slotItem.value === item.slot_type,
  );

  const stayDuration = getStayDuration(item);

  const checkOutDate = calculateCheckOutDate(
    item.check_in_date,
    slot?.start,
    slot?.end,
    stayDuration,
  );

  const unitPrice = Number(slot?.price || 0);
  const itemTotal = unitPrice * stayDuration;

  const durationText =
    ["day_extended", "night_extended"].includes(
      String(item.slot_type || "").toLowerCase(),
    )
      ? `${stayDuration} ${
          stayDuration === 1 ? "day" : "days"
        }`
      : "Fixed schedule";

  return `
    <div class="summary-item">
      <strong>Accommodation ${index + 1}:</strong>
      ${escapeHtml(accommodation?.name || "N/A")}<br />

      <strong>Category:</strong>
      ${escapeHtml(
        accommodation?.category_name || "N/A",
      )}<br />

      <strong>Slot:</strong>
      ${escapeHtml(
        slot?.label || item.slot_type || "N/A",
      )}<br />

      <strong>Schedule:</strong>
      ${formatTimeDisplay(slot?.start)} -
      ${formatTimeDisplay(slot?.end)}<br />

      <strong>Stay Duration:</strong>
      ${escapeHtml(durationText)}<br />

      <strong>Check-in:</strong>
      ${formatDateDisplay(item.check_in_date)}<br />

      <strong>Check-out:</strong>
      ${formatDateDisplay(checkOutDate)}<br />

      <strong>Price:</strong>
      ₱${formatMoney(unitPrice)}
      ${
        stayDuration > 1
          ? ` × ${stayDuration} = ₱${formatMoney(
              itemTotal,
            )}`
          : ""
      }
    </div>
  `;
}

// ============================================================
// SECTION 10: Payment requirement UI
// ============================================================

function updatePaymentRequirementUI() {
  enforcePaymentOptionsByReservationType();
  ensureFrontDeskPayPalUi();

  const method =
    String(
      document.getElementById("paymentMethod")?.value ||
        "cash",
    ).toLowerCase();

  const paymentType =
    document.getElementById("paymentType");

  const methodHelp =
    document.getElementById("paymentMethodHelp");

  const referenceGroup =
    document.getElementById("referenceGroup");

  const proofGroup =
    document.getElementById("proofGroup");

  const referenceRequiredText =
    document.getElementById("referenceRequiredText");

  const proofRequiredText =
    document.getElementById("proofRequiredText");

  const proofReference =
    document.getElementById("proofReference");

  const proofImage =
    document.getElementById("proofImage");

  const proofPreview =
    document.getElementById("proofPreview");

  const paymentRuleNote =
    document.getElementById("paymentRuleNote");

  const submitBtn =
    document.getElementById("submitPaymentBtn");

  const paypalSection =
    document.getElementById("frontDeskPayPalSection");

  const isWalkIn = isWalkInManualReservation();
  const isCash = method === "cash";
  const isPayPal = method === "paypal";
  const isEWallet = ["gcash", "paymaya"].includes(method);

  // Only manual GCash/Maya requires screenshot proof.
  const requiresScreenshot = isEWallet;

  if (paymentType && isWalkIn) {
    paymentType.value = "full";
    paymentType.disabled = true;
    paymentType.title =
      "Walk-in reservations must be full payment only.";
  }

  if (proofReference) {
    proofReference.required = false;
    proofReference.disabled = isCash || isPayPal;

    if (isCash || isPayPal) {
      proofReference.value = "";
      proofReference.placeholder = isPayPal
        ? "Not required for PayPal"
        : "Not required for cash payment";
      proofReference.removeAttribute("maxlength");
    } else {
      proofReference.placeholder =
        method === "gcash"
          ? "Optional GCash reference"
          : "Optional Maya reference";

      proofReference.setAttribute(
        "maxlength",
        method === "gcash" ? "16" : "37",
      );

      proofReference.value =
        formatReferenceNumberForDisplay(
          proofReference.value,
          method,
        );
    }
  }

  if (proofImage) {
    proofImage.required = requiresScreenshot;
    proofImage.disabled = isCash || isPayPal;

    if (isCash || isPayPal) {
      proofImage.value = "";
    }
  }

  if (proofPreview && (isCash || isPayPal)) {
    proofPreview.style.display = "none";
    proofPreview.src = "";
  }

  if (referenceGroup) {
    referenceGroup.style.display =
      isEWallet ? "flex" : "none";
  }

  if (proofGroup) {
    proofGroup.style.display =
      isEWallet ? "flex" : "none";
  }

  if (referenceRequiredText) {
    referenceRequiredText.textContent = isEWallet
      ? " (Optional)"
      : " (Not needed)";

    referenceRequiredText.style.color = "#64748b";
  }

  if (proofRequiredText) {
    proofRequiredText.textContent = requiresScreenshot
      ? " *Required"
      : " (Not needed)";

    proofRequiredText.style.color = requiresScreenshot
      ? "#dc2626"
      : "#64748b";
  }

  if (methodHelp) {
    if (isWalkIn) {
      methodHelp.textContent =
        "Walk-in accepts Cash, GCash, Maya, or PayPal. GCash/Maya requires a proof screenshot; PayPal is verified automatically.";
    } else {
      methodHelp.textContent =
        "Facebook/Messenger accepts GCash, Maya, or PayPal. GCash/Maya requires a proof screenshot; PayPal is verified automatically.";
    }
  }

  if (paymentRuleNote) {
    if (isPayPal) {
      paymentRuleNote.innerHTML = isWalkIn
        ? `
          <strong>Walk-in PayPal Rule:</strong><br />
          Pay the full accommodation amount through PayPal. The
          reservation remains pending and the guest is not checked in
          until PayPal reports a successful capture. Entrance fee is
          still finalized and collected separately after Guest Adjustment.
        `
        : `
          <strong>Facebook / Messenger PayPal Rule:</strong><br />
          PayPal may collect either the selected 50% downpayment or the
          full accommodation amount. The reservation is approved only
          after PayPal reports a successful capture. Entrance fee remains
          for later Front Desk collection.
        `;
    } else {
      paymentRuleNote.innerHTML = isWalkIn
        ? `
          <strong>Walk-in Rule:</strong><br />
          Walk-in guests are already onsite. Payment may be
          Cash, GCash, or Maya and must be full accommodation
          payment. For GCash/Maya, upload the payment screenshot;
          the reference number is optional. The reservation will
          be automatically checked in after submission.
        `
        : `
          <strong>Facebook / Messenger Rule:</strong><br />
          GCash or Maya requires a payment proof screenshot.
          The reference number is optional.
        `;
    }
  }

  if (submitBtn) {
    submitBtn.style.display = isPayPal ? "none" : "";
  }

  if (paypalSection) {
    paypalSection.style.display = isPayPal ? "block" : "none";
  }

  updatePaymentBreakdown();
  updateFrontDeskPayPalAmountDisplay();

  if (isPayPal) {
    prepareFrontDeskPayPalCheckout().catch((error) => {
      console.error(
        "prepareFrontDeskPayPalCheckout error:",
        error,
      );

      setFrontDeskPayPalStatus(
        error.message ||
          "Unable to prepare PayPal Sandbox.",
        "error",
      );
    });
  }
}

// ============================================================
// SECTION 11: Payment breakdown
// ============================================================

function updatePaymentBreakdown() {
  computedTotals = computeTotals();

  const isWalkIn = isWalkInManualReservation();

  const paymentMethod = String(
    document.getElementById("paymentMethod")?.value ||
      "cash",
  ).toLowerCase();

  const isPayPal = paymentMethod === "paypal";

  const paymentType =
    document.getElementById("paymentType")?.value ||
    "full";

  const paidAmount =
    paymentType === "full"
      ? computedTotals.accommodationTotal
      : computedTotals.requiredDownpayment;

  const remainingBalance = Math.max(
    computedTotals.accommodationTotal - paidAmount,
    0,
  );

  const frontDeskReminder =
    remainingBalance +
    computedTotals.estimatedEntranceFee;

  const walkInAmountDueNow =
    computedTotals.accommodationTotal;

  computedTotals.paidAmount = paidAmount;
  computedTotals.remainingBalance = remainingBalance;

  setText(
    "paymentAccommodationTotal",
    `₱${formatMoney(
      computedTotals.accommodationTotal,
    )}`,
  );

  setText(
    "paymentDownpayment",
    `₱${formatMoney(
      computedTotals.requiredDownpayment,
    )}`,
  );

  setText(
    "paymentPaidAmount",
    `₱${formatMoney(paidAmount)}`,
  );

  setText(
    "paymentRemaining",
    `₱${formatMoney(remainingBalance)}`,
  );

  setText(
    "paymentEntranceFee",
    `₱${formatMoney(
      computedTotals.estimatedEntranceFee,
    )}`,
  );

  const downpaymentRow =
    document.getElementById("paymentDownpaymentRow");

  const totalCollectedRow =
    document.getElementById(
      "paymentTotalCollectedRow",
    );

  const collectionNote =
    document.getElementById(
      "paymentCollectionNote",
    );

  if (isWalkIn) {
    if (downpaymentRow) {
      downpaymentRow.style.display = "none";
    }

    if (totalCollectedRow) {
      totalCollectedRow.style.display = "flex";
    }

    setText(
      "paymentPaidLabel",
      isPayPal
        ? "PayPal Amount to Pay"
        : "Accommodation Paid",
    );

    setText(
      "paymentEntranceLabel",
      "Estimated Entrance Fee",
    );

    setText(
      "paymentTotalDueLabel",
      "Amount Due Now",
    );

    setText(
      "paymentFrontDeskReminder",
      `₱${formatMoney(walkInAmountDueNow)}`,
    );

    setText(
      "paymentTotalCollected",
      `₱${formatMoney(walkInAmountDueNow)}`,
    );

    if (collectionNote) {
      collectionNote.innerHTML = isPayPal
        ? `
          <strong>Walk-in PayPal Collection:</strong><br />
          PayPal will collect the full accommodation amount. The
          guest is checked in only after successful PayPal capture.
          Entrance fee remains an estimate and is collected separately
          after Guest Adjustment and Entrance Adjustment.
        `
        : `
          <strong>Walk-in Collection:</strong><br />
          The guest is already onsite. Collect the full accommodation
          amount during this manual reservation. The entrance fee shown
          above is only an estimate and is not collected yet. After the
          reservation is automatically checked in, verify actual guests,
          apply Entrance Adjustment, then collect the final entrance fee
          separately.
        `;
    }

    updateFrontDeskPayPalAmountDisplay();
    return;
  }

  // Facebook / Messenger view
  if (downpaymentRow) {
    downpaymentRow.style.display = "flex";
  }

  if (totalCollectedRow) {
    totalCollectedRow.style.display = "none";
  }

  setText(
    "paymentPaidLabel",
    isPayPal
      ? "PayPal Amount to Pay"
      : "Paid Amount",
  );

  setText(
    "paymentEntranceLabel",
    "Estimated Entrance Fee",
  );

  setText(
    "paymentTotalDueLabel",
    "Total Reminder for Front Desk",
  );

  setText(
    "paymentFrontDeskReminder",
    `₱${formatMoney(frontDeskReminder)}`,
  );

  if (collectionNote) {
    collectionNote.innerHTML = isPayPal
      ? `
        <strong>PayPal Reminder:</strong><br />
        PayPal collects only the selected accommodation payment
        (50% downpayment or full accommodation). Entrance fee is not
        included and remains for later Front Desk collection.
      `
      : `
        <strong>Reminder:</strong><br />
        Entrance fee is not included in the downpayment computation.
        It remains an estimate for Front Desk collection during guest
        arrival/check-in.
      `;
  }

  updateFrontDeskPayPalAmountDisplay();
}

// ============================================================
// SECTION 12: Submit manual reservation
// Step 2 created_by is included here.
// ============================================================

async function submitManualReservation(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }

  if (isSubmittingManualReservation) {
    return;
  }

  if (!walkInDraft) {
    showMessage(
      "Missing manual reservation draft.",
      "error",
    );
    return;
  }

  const loggedInUser = getLoggedInUser();
  const createdBy = Number(loggedInUser?.id || 0);
  const loggedInRole = String(
    loggedInUser?.role || "",
  ).toLowerCase();

  if (!createdBy) {
    showMessage(
      "Your logged-in staff account could not be identified. Please log in again.",
      "error",
    );
    return;
  }

  if (
    !["admin", "frontdesk"].includes(loggedInRole)
  ) {
    showMessage(
      "Only Front Desk Staff or Administrator accounts can create manual reservations.",
      "error",
    );
    return;
  }

  const paymentMethod =
    String(
      document.getElementById("paymentMethod")?.value ||
        "cash",
    ).toLowerCase();

  if (paymentMethod === "paypal") {
    showMessage(
      "Use the PayPal button to complete the automated PayPal payment.",
      "error",
    );

    prepareFrontDeskPayPalCheckout().catch((error) => {
      console.error(
        "prepareFrontDeskPayPalCheckout error:",
        error,
      );
    });

    return;
  }

  const paymentTypeSelect =
    document.getElementById("paymentType");

  const isWalkIn = isWalkInManualReservation();

  const paymentType = isWalkIn
    ? "full"
    : paymentTypeSelect?.value || "downpayment";

  const proofReferenceInput =
    document.getElementById("proofReference");

  const proofReference =
    normalizeReferenceNumber(
      proofReferenceInput?.value || "",
    );

  const proofImageInput =
    document.getElementById("proofImage");

  const proofImage =
    proofImageInput?.files?.[0] || null;

  const paymentNote =
    document
      .getElementById("paymentNote")
      ?.value.trim() || "";

  const requiresScreenshot =
    isProofRequired(paymentMethod);

  if (
    !Array.isArray(walkInDraft.items) ||
    !walkInDraft.items.length
  ) {
    showMessage(
      "No accommodation item was found in this reservation. Please go back and select an accommodation.",
      "error",
    );
    return;
  }

  const reservationDateValidation =
    validateManualReservationDraftDates();

  if (!reservationDateValidation.valid) {
    showMessage(
      reservationDateValidation.message,
      "error",
    );
    return;
  }

  const totals = computeTotals();

  if (totals.accommodationTotal <= 0) {
    showMessage(
      "Accommodation price could not be read. Please go back, select the accommodation and slot again, then continue to payment.",
      "error",
    );
    return;
  }

  if (
    isWalkIn &&
    !["cash", "gcash", "paymaya"].includes(paymentMethod)
  ) {
    showMessage(
      "Walk-in reservations only accept Cash, GCash, Maya, or PayPal.",
      "error",
    );
    return;
  }

  if (
    !isWalkIn &&
    !["gcash", "paymaya"].includes(paymentMethod)
  ) {
    showMessage(
      "Facebook/Messenger reservations must use GCash, Maya, or PayPal.",
      "error",
    );
    return;
  }

  if (
    proofReference &&
    ["gcash", "paymaya"].includes(paymentMethod)
  ) {
    const referenceValidation =
      validateReferenceNumberByMethod(
        proofReference,
        paymentMethod,
      );

    if (!referenceValidation.valid) {
      showMessage(
        referenceValidation.message,
        "error",
      );

      proofReferenceInput?.focus();
      return;
    }
  }

  if (requiresScreenshot && !proofImage) {
    showMessage(
      "Proof screenshot is required for GCash or Maya payments.",
      "error",
    );
    return;
  }

  const payload = {
    ...walkInDraft,
    created_by: createdBy,
    reservation_type:
      getManualReservationType(),
    payment_method: paymentMethod,
    payment_type: paymentType,
    proof_reference:
      proofReference || null,
    proof_image_data: null,
    note: combineNotes(
      walkInDraft.note,
      paymentNote,
    ),
  };

  const submitBtn =
    document.getElementById("submitPaymentBtn");

  const originalText = submitBtn
    ? submitBtn.textContent
    : "Submit Manual Reservation";

  try {
    isSubmittingManualReservation = true;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
      submitBtn.style.opacity = "0.7";
      submitBtn.style.cursor = "not-allowed";
    }

    const formData = new FormData();

    formData.append(
      "payload",
      JSON.stringify(payload),
    );

    if (proofImage) {
      formData.append(
        "proof_image",
        proofImage,
        proofImage.name,
      );
    }

    const baselineReservationId =
      await getManualReservationBaselineId();

    startManualReservationCreationWatchdog(
      baselineReservationId,
    );

    const response = await fetch(
      `${API_BASE}/bookings/walk-in`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      },
    );

    const data = await readFrontDeskJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to create manual reservation.",
      );
    }

    sessionStorage.removeItem(
      ADMIN_WALKIN_DRAFT_KEY,
    );

    sessionStorage.setItem(
      ADMIN_WALKIN_SUCCESS_RESET_KEY,
      "1",
    );

    const successMessage =
      data.message ||
      "Manual reservation created successfully.";

    showMessage(
      successMessage,
      "success",
    );

    redirectAfterSuccessfulManualReservation(data);
    return;
  } catch (error) {
    console.error(
      "submitManualReservation error:",
      error,
    );

    if (manualReservationRedirectStarted) {
      return;
    }

    isSubmittingManualReservation = false;

    const errorMessage =
      error.message ||
      "Failed to create manual reservation.";

    showMessage(errorMessage, "error");
    showReservationErrorModal(errorMessage);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
    }
  }
}

// ============================================================
// SECTION 12.1: Front Desk PayPal Sandbox checkout
//
// Initial-reservation PayPal only:
// - Walk-in: full accommodation payment
// - Facebook/Messenger: selected 50% or full accommodation payment
// - Entrance fee is excluded
// - Remaining-balance PayPal is implemented separately later
// ============================================================

function ensureFrontDeskPayPalUi() {
  if (
    document.getElementById("frontDeskPayPalSection")
  ) {
    return;
  }

  const form =
    document.getElementById("adminPaymentForm");

  if (!form) {
    return;
  }

  ensureFrontDeskPayPalStyles();

  const section = document.createElement("div");
  section.id = "frontDeskPayPalSection";
  section.className = "frontdesk-paypal-section";
  section.style.display = "none";

  section.innerHTML = `
    <div class="frontdesk-paypal-header">
      <div>
        <div class="frontdesk-paypal-kicker">
          AUTOMATED PAYPAL PAYMENT
        </div>
        <strong id="frontDeskPayPalTitle">
          Pay with PayPal
        </strong>
      </div>

      <span class="frontdesk-paypal-badge">
        Sandbox
      </span>
    </div>

    <div class="frontdesk-paypal-amount-row">
      <span>Amount to Pay</span>
      <strong id="frontDeskPayPalAmount">
        ₱0.00
      </strong>
    </div>

    <div
      id="frontDeskPayPalStatus"
      class="frontdesk-paypal-status"
    >
      Preparing PayPal Sandbox...
    </div>

    <paypal-button
      id="frontDeskPayPalButton"
      type="pay"
      hidden
    ></paypal-button>

    <p class="frontdesk-paypal-help">
      No GCash/Maya reference number or proof screenshot is
      required for PayPal. Payment is recorded only after PayPal
      reports a successful capture.
    </p>
  `;

  const submitBtn =
    document.getElementById("submitPaymentBtn");

  if (submitBtn?.parentElement) {
    submitBtn.parentElement.insertBefore(
      section,
      submitBtn,
    );
  } else {
    form.appendChild(section);
  }
}

function ensureFrontDeskPayPalStyles() {
  if (
    document.getElementById(
      "frontDeskPayPalDynamicStyles",
    )
  ) {
    return;
  }

  const style = document.createElement("style");
  style.id = "frontDeskPayPalDynamicStyles";

  style.textContent = `
    .frontdesk-paypal-section {
      width: 100%;
      margin: 16px 0;
      padding: 18px;
      border: 1px solid #cbd5e1;
      border-radius: 18px;
      background: #ffffff;
      box-sizing: border-box;
    }

    .frontdesk-paypal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .frontdesk-paypal-kicker {
      color: #0f766e;
      font-size: 0.78rem;
      font-weight: 900;
      letter-spacing: 0.12em;
      margin-bottom: 4px;
    }

    .frontdesk-paypal-header strong {
      color: #0f172a;
      font-size: 1.05rem;
    }

    .frontdesk-paypal-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 7px 11px;
      border-radius: 999px;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 0.78rem;
      font-weight: 900;
    }

    .frontdesk-paypal-amount-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 13px 14px;
      margin-bottom: 12px;
      border-radius: 14px;
      background: #f8fafc;
      color: #0f172a;
    }

    .frontdesk-paypal-amount-row strong {
      color: #0f766e;
      font-size: 1rem;
    }

    .frontdesk-paypal-status {
      padding: 12px 14px;
      margin-bottom: 12px;
      border-radius: 14px;
      background: #f8fafc;
      color: #475569;
      line-height: 1.45;
      font-size: 0.9rem;
    }

    .frontdesk-paypal-help {
      margin: 12px 0 0;
      color: #64748b;
      line-height: 1.55;
      font-size: 0.88rem;
    }

    #frontDeskPayPalButton {
      display: block;
      width: 100%;
      min-height: 48px;
    }
  `;

  document.head.appendChild(style);
}

function setFrontDeskPayPalStatus(
  message,
  type = "info",
) {
  const status =
    document.getElementById(
      "frontDeskPayPalStatus",
    );

  if (!status) return;

  status.textContent = message;

  if (type === "error") {
    status.style.background = "#fef2f2";
    status.style.color = "#b91c1c";
  } else if (type === "success") {
    status.style.background = "#ecfdf5";
    status.style.color = "#047857";
  } else {
    status.style.background = "#f8fafc";
    status.style.color = "#475569";
  }
}

function getFrontDeskPayPalAmount() {
  const isWalkIn = isWalkInManualReservation();

  if (isWalkIn) {
    return Number(
      computedTotals.accommodationTotal || 0,
    );
  }

  const paymentType =
    document.getElementById("paymentType")?.value ||
    "downpayment";

  return paymentType === "full"
    ? Number(
        computedTotals.accommodationTotal || 0,
      )
    : Number(
        computedTotals.requiredDownpayment || 0,
      );
}

function updateFrontDeskPayPalAmountDisplay() {
  const amountEl =
    document.getElementById(
      "frontDeskPayPalAmount",
    );

  const titleEl =
    document.getElementById(
      "frontDeskPayPalTitle",
    );

  if (amountEl) {
    amountEl.textContent =
      `₱${formatMoney(
        getFrontDeskPayPalAmount(),
      )}`;
  }

  if (titleEl) {
    if (isWalkInManualReservation()) {
      titleEl.textContent =
        "Walk-in Full Payment with PayPal";
    } else {
      const paymentType =
        document.getElementById("paymentType")?.value ||
        "downpayment";

      titleEl.textContent =
        paymentType === "full"
          ? "Facebook/Messenger Full Payment with PayPal"
          : "Facebook/Messenger 50% Downpayment with PayPal";
    }
  }
}

function getFrontDeskPayPalDraftSignature() {
  if (!walkInDraft) {
    return "";
  }

  return JSON.stringify({
    first_name: walkInDraft.first_name || "",
    middle_name: walkInDraft.middle_name || "",
    last_name: walkInDraft.last_name || "",
    contact_no: walkInDraft.contact_no || "",
    guest_count: Number(
      walkInDraft.guest_count || 0,
    ),
    entrance_type:
      walkInDraft.entrance_type || "",
    reservation_type:
      getManualReservationType(),
    note: walkInDraft.note || "",
    items: Array.isArray(walkInDraft.items)
      ? walkInDraft.items
      : [],
  });
}

function readFrontDeskPayPalPending() {
  const raw =
    sessionStorage.getItem(
      ADMIN_FRONTDESK_PAYPAL_PENDING_KEY,
    );

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    sessionStorage.removeItem(
      ADMIN_FRONTDESK_PAYPAL_PENDING_KEY,
    );

    return null;
  }
}

function saveFrontDeskPayPalPending(data) {
  sessionStorage.setItem(
    ADMIN_FRONTDESK_PAYPAL_PENDING_KEY,
    JSON.stringify(data),
  );
}

function clearFrontDeskPayPalPending() {
  sessionStorage.removeItem(
    ADMIN_FRONTDESK_PAYPAL_PENDING_KEY,
  );
}

async function readFrontDeskJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "Non-JSON response from server:",
      text,
    );

    throw new Error(
      "Server returned an invalid response. Check the backend terminal.",
    );
  }
}

function validateFrontDeskPayPalBeforeReservation() {
  if (!walkInDraft) {
    throw new Error(
      "Missing manual reservation draft.",
    );
  }

  const loggedInUser = getLoggedInUser();
  const createdBy = Number(
    loggedInUser?.id || 0,
  );

  const role = String(
    loggedInUser?.role || "",
  ).toLowerCase();

  if (!createdBy) {
    throw new Error(
      "Your logged-in staff account could not be identified. Please log in again.",
    );
  }

  if (!["admin", "frontdesk"].includes(role)) {
    throw new Error(
      "Only Front Desk Staff or Administrator accounts can create manual reservations.",
    );
  }

  if (
    !Array.isArray(walkInDraft.items) ||
    !walkInDraft.items.length
  ) {
    throw new Error(
      "No accommodation item was found in this reservation. Please go back and select an accommodation.",
    );
  }

  const reservationDateValidation =
    validateManualReservationDraftDates();

  if (!reservationDateValidation.valid) {
    throw new Error(
      reservationDateValidation.message,
    );
  }

  computedTotals = computeTotals();

  if (computedTotals.accommodationTotal <= 0) {
    throw new Error(
      "Accommodation price could not be read. Please go back and review the reservation.",
    );
  }

  const paymentMethod =
    String(
      document.getElementById("paymentMethod")?.value ||
        "",
    ).toLowerCase();

  if (paymentMethod !== "paypal") {
    throw new Error(
      "Select PayPal before starting PayPal checkout.",
    );
  }

  const paymentType =
    isWalkInManualReservation()
      ? "full"
      : document.getElementById("paymentType")?.value ||
        "downpayment";

  return {
    loggedInUser,
    createdBy,
    paymentType,
  };
}

async function createFrontDeskPayPalReservationIfNeeded() {
  const {
    createdBy,
    paymentType,
  } = validateFrontDeskPayPalBeforeReservation();

  const draftSignature =
    getFrontDeskPayPalDraftSignature();

  const pending =
    readFrontDeskPayPalPending();

  if (
    pending?.bookingId &&
    pending?.draftSignature === draftSignature
  ) {
    if (
      pending.paymentType &&
      pending.paymentType !== paymentType
    ) {
      throw new Error(
        "This PayPal reservation was already created with a different payment type. Complete the existing PayPal checkout first.",
      );
    }

    enforcePaymentOptionsByReservationType();

    return {
      bookingId: Number(pending.bookingId),
      reservationCode:
        pending.reservationCode || "",
      reused: true,
    };
  }

  if (pending?.bookingId) {
    throw new Error(
      "A different pending PayPal reservation already exists in this browser tab. Complete or cancel that reservation before starting another PayPal reservation.",
    );
  }

  const paymentNote =
    document
      .getElementById("paymentNote")
      ?.value.trim() || "";

  const payload = {
    ...walkInDraft,
    created_by: createdBy,
    reservation_type:
      getManualReservationType(),
    payment_method: "paypal",
    payment_type: paymentType,
    proof_reference: null,
    proof_image_data: null,
    note: combineNotes(
      walkInDraft.note,
      paymentNote,
    ),
  };

  setFrontDeskPayPalStatus(
    "Creating the pending manual reservation...",
    "info",
  );

  frontDeskPayPalReservationCreating = true;

  try {
    const formData = new FormData();

    formData.append(
      "payload",
      JSON.stringify(payload),
    );

    // IMPORTANT:
    // Do not start the old manual-reservation watchdog here.
    // A PayPal reservation must stay on this page until capture succeeds.
    const response = await fetch(
      `${API_BASE}/bookings/walk-in`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      },
    );

    const data =
      await readFrontDeskJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to create the PayPal manual reservation.",
      );
    }

    const bookingId = Number(
      data.bookingId ||
        data.reservationId ||
        data.id ||
        0,
    );

    if (!bookingId) {
      throw new Error(
        "Reservation was created but the backend did not return a reservation ID.",
      );
    }

    const pendingData = {
      bookingId,
      reservationCode:
        String(data.reservationCode || ""),
      draftSignature,
      paymentType,
      reservationType:
        getManualReservationType(),
      createdAt: new Date().toISOString(),
    };

    saveFrontDeskPayPalPending(
      pendingData,
    );

    enforcePaymentOptionsByReservationType();

    setFrontDeskPayPalStatus(
      "Reservation created. Preparing PayPal order...",
      "success",
    );

    return {
      bookingId,
      reservationCode:
        pendingData.reservationCode,
      reused: false,
    };
  } finally {
    frontDeskPayPalReservationCreating = false;
  }
}

async function createFrontDeskPayPalOrder() {
  const reservation =
    await createFrontDeskPayPalReservationIfNeeded();

  setFrontDeskPayPalStatus(
    reservation.reused
      ? "Reopening the existing PayPal checkout..."
      : "Creating PayPal Sandbox order...",
    "info",
  );

  const response = await fetch(
    `${API_BASE}/paypal/reservations/${reservation.bookingId}/order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({}),
    },
  );

  const data =
    await readFrontDeskJsonResponse(response);

  if (!response.ok || !data?.orderId) {
    throw new Error(
      data?.message ||
        "Failed to create PayPal order.",
    );
  }

  setFrontDeskPayPalStatus(
    `${data.paymentLabel || "PayPal payment"} ready: ${data.currency || "PHP"} ${data.amount || formatMoney(getFrontDeskPayPalAmount())}.`,
    "success",
  );

  return {
    orderId: data.orderId,
  };
}

async function captureFrontDeskPayPalOrder(
  orderId,
) {
  const pending =
    readFrontDeskPayPalPending();

  if (!pending?.bookingId) {
    throw new Error(
      "Pending PayPal reservation information is missing. Please reopen the manual reservation.",
    );
  }

  setFrontDeskPayPalStatus(
    "PayPal approved. Capturing payment...",
    "info",
  );

  const response = await fetch(
    `${API_BASE}/paypal/reservations/${pending.bookingId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        orderId,
      }),
    },
  );

  const data =
    await readFrontDeskJsonResponse(response);

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.message ||
        "PayPal capture failed.",
    );
  }

  return data;
}

function loadFrontDeskPayPalSdk() {
  if (window.paypal?.createInstance) {
    return Promise.resolve();
  }

  const existingScript =
    document.getElementById(
      PAYPAL_SDK_SCRIPT_ID,
    );

  if (existingScript) {
    return new Promise((resolve, reject) => {
      if (window.paypal?.createInstance) {
        resolve();
        return;
      }

      existingScript.addEventListener(
        "load",
        () => resolve(),
        { once: true },
      );

      existingScript.addEventListener(
        "error",
        () =>
          reject(
            new Error(
              "Failed to load PayPal Sandbox SDK.",
            ),
          ),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script =
      document.createElement("script");

    script.id = PAYPAL_SDK_SCRIPT_ID;
    script.src = PAYPAL_SDK_URL;
    script.async = true;

    script.onload = () => {
      if (window.paypal?.createInstance) {
        resolve();
      } else {
        reject(
          new Error(
            "PayPal SDK loaded but createInstance is unavailable.",
          ),
        );
      }
    };

    script.onerror = () => {
      reject(
        new Error(
          "Failed to load PayPal Sandbox SDK.",
        ),
      );
    };

    document.head.appendChild(script);
  });
}

async function fetchFrontDeskPayPalConfig() {
  const response = await fetch(
    `${API_BASE}/paypal/config`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  const data =
    await readFrontDeskJsonResponse(response);

  if (
    !response.ok ||
    !data?.success ||
    !data?.clientId
  ) {
    throw new Error(
      data?.message ||
        "PayPal configuration is unavailable.",
    );
  }

  if (
    String(
      data.environment || "",
    ).toLowerCase() !== "sandbox"
  ) {
    throw new Error(
      "PayPal is not currently configured for Sandbox mode.",
    );
  }

  return data;
}

async function prepareFrontDeskPayPalCheckout() {
  ensureFrontDeskPayPalUi();

  if (
    frontDeskPayPalPaymentSession &&
    frontDeskPayPalSdkInstance
  ) {
    const button =
      document.getElementById(
        "frontDeskPayPalButton",
      );

    button?.removeAttribute("hidden");

    setFrontDeskPayPalStatus(
      "PayPal Sandbox is ready. Click the PayPal button to continue.",
      "success",
    );

    return;
  }

  if (frontDeskPayPalSetupPromise) {
    return frontDeskPayPalSetupPromise;
  }

  frontDeskPayPalSetupPromise = (async () => {
    setFrontDeskPayPalStatus(
      "Loading PayPal Sandbox...",
      "info",
    );

    const [config] = await Promise.all([
      fetchFrontDeskPayPalConfig(),
      loadFrontDeskPayPalSdk(),
    ]);

    frontDeskPayPalSdkInstance =
      await window.paypal.createInstance({
        clientId: config.clientId,
        components: ["paypal-payments"],
        pageType: "checkout",
      });

    const paymentMethods =
      await frontDeskPayPalSdkInstance
        .findEligibleMethods({
          currencyCode:
            config.currency || "PHP",
        });

    if (
      !paymentMethods?.isEligible?.("paypal")
    ) {
      throw new Error(
        "PayPal checkout is not eligible in this Sandbox session.",
      );
    }

    frontDeskPayPalPaymentSession =
      frontDeskPayPalSdkInstance
        .createPayPalOneTimePaymentSession({
          async onApprove(data) {
            try {
              isSubmittingManualReservation = true;

              const captureResult =
                await captureFrontDeskPayPalOrder(
                  data.orderId,
                );

              setFrontDeskPayPalStatus(
                `PayPal payment captured successfully. ${captureResult.paymentLabel || ""}`,
                "success",
              );

              showMessage(
                captureResult.message ||
                  "PayPal payment captured successfully.",
                "success",
              );

              const pending =
                readFrontDeskPayPalPending();

              sessionStorage.removeItem(
                ADMIN_WALKIN_DRAFT_KEY,
              );

              sessionStorage.setItem(
                ADMIN_WALKIN_SUCCESS_RESET_KEY,
                "1",
              );

              clearFrontDeskPayPalPending();

              window.setTimeout(() => {
                redirectAfterSuccessfulManualReservation({
                  bookingId:
                    captureResult.reservationId ||
                    pending?.bookingId,
                  reservationCode:
                    captureResult.reservationCode ||
                    pending?.reservationCode,
                });
              }, 700);
            } catch (error) {
              isSubmittingManualReservation = false;

              console.error(
                "Front Desk PayPal capture error:",
                error,
              );

              setFrontDeskPayPalStatus(
                error.message ||
                  "PayPal approved the checkout, but the backend could not finalize the payment.",
                "error",
              );

              showMessage(
                error.message ||
                  "Unable to finalize PayPal payment.",
                "error",
              );
            }
          },

          onCancel() {
            isSubmittingManualReservation = false;

            setFrontDeskPayPalStatus(
              "PayPal checkout was cancelled. The pending reservation is preserved so you can retry the same PayPal checkout.",
              "info",
            );

            showMessage(
              "PayPal checkout cancelled. Click the PayPal button to try again.",
              "error",
            );
          },

          onError(error) {
            isSubmittingManualReservation = false;

            console.error(
              "Front Desk PayPal payment-session error:",
              error,
            );

            setFrontDeskPayPalStatus(
              "PayPal encountered an error. The pending reservation is preserved for retry.",
              "error",
            );

            showMessage(
              "PayPal encountered an error. Please try again.",
              "error",
            );
          },
        });

    const paypalButton =
      document.getElementById(
        "frontDeskPayPalButton",
      );

    if (!paypalButton) {
      throw new Error(
        "Front Desk PayPal button element is missing.",
      );
    }

    paypalButton.removeAttribute("hidden");

    if (!frontDeskPayPalButtonBound) {
      paypalButton.addEventListener(
        "click",
        async (event) => {
          event.preventDefault();

          if (
            isSubmittingManualReservation ||
            frontDeskPayPalReservationCreating
          ) {
            return;
          }

          try {
            isSubmittingManualReservation = true;

            setFrontDeskPayPalStatus(
              "Preparing PayPal Sandbox checkout...",
              "info",
            );

            await frontDeskPayPalPaymentSession.start(
              {
                presentationMode: "auto",
              },
              createFrontDeskPayPalOrder(),
            );
          } catch (error) {
            isSubmittingManualReservation = false;

            console.error(
              "Front Desk PayPal checkout start error:",
              error,
            );

            setFrontDeskPayPalStatus(
              error.message ||
                "Unable to start PayPal checkout.",
              "error",
            );

            showMessage(
              error.message ||
                "Unable to start PayPal checkout.",
              "error",
            );
          }
        },
      );

      frontDeskPayPalButtonBound = true;
    }

    setFrontDeskPayPalStatus(
      "PayPal Sandbox is ready. Click the PayPal button to continue.",
      "success",
    );
  })();

  try {
    await frontDeskPayPalSetupPromise;
  } catch (error) {
    frontDeskPayPalSetupPromise = null;
    throw error;
  }
}

// ============================================================
// SECTION 13: Error modal
// ============================================================

function showReservationErrorModal(message) {
  ensureReservationErrorModalStyles();

  let modal = document.getElementById(
    "manualReservationErrorModal",
  );

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "manualReservationErrorModal";
    modal.className = "manual-error-modal";

    modal.innerHTML = `
      <div class="manual-error-backdrop"></div>

      <div
        class="manual-error-box"
        role="dialog"
        aria-modal="true"
      >
        <div class="manual-error-icon">!</div>

        <h2>Reservation Not Created</h2>

        <p id="manualReservationErrorText"></p>

        <div class="manual-error-actions">
          <button
            type="button"
            id="closeManualErrorBtn"
          >
            Okay, I Understand
          </button>

          <a
            href="admin-walkin.html"
            id="editManualReservationBtn"
          >
            Edit Reservation
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn =
      document.getElementById(
        "closeManualErrorBtn",
      );

    const backdrop =
      modal.querySelector(
        ".manual-error-backdrop",
      );

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
        document.body.style.overflow = "";
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", () => {
        modal.classList.remove("show");
        document.body.style.overflow = "";
      });
    }
  }

  const messageText =
    document.getElementById(
      "manualReservationErrorText",
    );

  if (messageText) {
    messageText.textContent =
      message ||
      "The reservation could not be created. Please review the reservation details.";
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function ensureReservationErrorModalStyles() {
  if (
    document.getElementById(
      "manualReservationErrorModalStyle",
    )
  ) {
    return;
  }

  const style = document.createElement("style");

  style.id =
    "manualReservationErrorModalStyle";

  style.textContent = `
    .manual-error-modal {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 18px;
    }

    .manual-error-modal.show {
      display: flex;
    }

    .manual-error-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(6px);
    }

    .manual-error-box {
      position: relative;
      z-index: 1;
      width: min(440px, 94vw);
      background: #ffffff;
      border-radius: 26px;
      padding: 26px;
      text-align: center;
      box-shadow:
        0 24px 70px rgba(15, 23, 42, 0.3);
      border: 1px solid #fee2e2;
    }

    .manual-error-icon {
      width: 56px;
      height: 56px;
      margin: 0 auto 14px;
      border-radius: 999px;
      background: #fee2e2;
      color: #991b1b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 950;
    }

    .manual-error-box h2 {
      margin: 0 0 10px;
      color: #0f172a;
      font-size: 1.45rem;
    }

    .manual-error-box p {
      margin: 0;
      color: #475569;
      line-height: 1.6;
      font-size: 0.96rem;
    }

    .manual-error-actions {
      display: flex;
      gap: 10px;
      margin-top: 22px;
    }

    .manual-error-actions button,
    .manual-error-actions a {
      flex: 1;
      border: none;
      border-radius: 999px;
      padding: 12px 14px;
      font-weight: 900;
      cursor: pointer;
      text-decoration: none;
      font-size: 0.9rem;
      text-align: center;
    }

    #closeManualErrorBtn {
      background: #fee2e2;
      color: #991b1b;
    }

    #editManualReservationBtn {
      background:
        linear-gradient(
          135deg,
          #0f766e,
          #14b8a6
        );
      color: #ffffff;
    }

    @media (max-width: 520px) {
      .manual-error-actions {
        flex-direction: column;
      }
    }
  `;

  document.head.appendChild(style);
}

// ============================================================
// SECTION 14: Payment proof helpers
// ============================================================

function isProofRequired(method) {
  const value = String(
    method || "",
  ).toLowerCase();

  return ["gcash", "paymaya"].includes(value);
}

function previewProofImage() {
  const input =
    document.getElementById("proofImage");

  const preview =
    document.getElementById("proofPreview");

  if (!input || !preview) return;

  const file = input.files?.[0];

  if (!file) {
    preview.style.display = "none";
    preview.src = "";
    return;
  }

  preview.src =
    URL.createObjectURL(file);

  preview.style.display = "block";
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = () =>
      resolve(reader.result);

    reader.onerror = () =>
      reject(
        new Error(
          "Failed to read proof image.",
        ),
      );

    reader.readAsDataURL(file);
  });
}

// ============================================================
// SECTION 15: Accommodation / slot helpers
//
// IMPORTANT:
// These slot values match admin-walkin.js and the backend:
// - day_tour
// - night
// - day_extended
// - night_extended
// ============================================================

function getAccommodationById(id) {
  return (
    availableAccommodations.find(
      (item) =>
        Number(item.id) === Number(id),
    ) || null
  );
}

function getSlotOptions(accommodation) {
  if (!accommodation) return [];

  const category = String(
    accommodation.category_name || "",
  ).toLowerCase();

  const isRoom =
    category.includes("room");

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
      price: Number(
        accommodation.day_price || 0,
      ),
      start: dayStart,
      end: dayEnd,
    },
    {
      value: "night",
      label: "Night",
      price: Number(
        accommodation.overnight_price ||
          0,
      ),
      start: nightStart,
      end: nightEnd,
    },
    {
      value: "day_extended",
      label: `Day ${extendedLabel}`,
      price: Number(
        accommodation.extended_price ||
          0,
      ),
      start: dayStart,
      end: dayExtendedEnd,
    },
    {
      value: "night_extended",
      label: `Night ${extendedLabel}`,
      price: Number(
        accommodation.extended_price ||
          0,
      ),
      start: nightStart,
      end: nightExtendedEnd,
    },
  ];
}

function getStayDuration(item) {
  const slotType = String(
    item?.slot_type || "",
  ).toLowerCase();

  if (
    ![
      "day_extended",
      "night_extended",
    ].includes(slotType)
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.min(
      5,
      Math.floor(
        Number(
          item?.stay_duration || 1,
        ),
      ),
    ),
  );
}

// ============================================================
// SECTION 16: Payment total calculation
// ============================================================

function computeTotals() {
  const items = Array.isArray(
    walkInDraft?.items,
  )
    ? walkInDraft.items
    : [];

  const guestCount = Number(
    walkInDraft?.guest_count || 0,
  );

  const entranceType =
    walkInDraft?.entrance_type ||
    "pool_beach";

  let accommodationTotal = 0;
  let hasOvernightStyle = false;

  items.forEach((item) => {
    const accommodation =
      getAccommodationById(
        item.accommodation_id,
      );

    if (!accommodation) return;

    const slot = getSlotOptions(
      accommodation,
    ).find(
      (slotItem) =>
        slotItem.value ===
        item.slot_type,
    );

    if (!slot) return;

    const stayDuration =
      getStayDuration(item);

    accommodationTotal +=
      Number(slot.price || 0) *
      stayDuration;

    // Entrance rate follows the selected DAY/NIGHT schedule family.
    // Day 22/23 Hours remains a DAY entrance rate even though the stay
    // itself crosses midnight. Only Night / Night 22/23 Hours uses the
    // overnight entrance rate.
    if (
      item.slot_type === "night" ||
      item.slot_type ===
        "night_extended"
    ) {
      hasOvernightStyle = true;
    }
  });

  const totalFreeEntrancePax =
    getTotalFreeEntrancePax(
      items,
      guestCount,
    );

  const chargeableGuests = Math.max(
    guestCount -
      totalFreeEntrancePax,
    0,
  );

  const entranceRate =
    entranceType === "beach_only"
      ? hasOvernightStyle
        ? 200
        : 150
      : hasOvernightStyle
        ? 300
        : 250;

  const estimatedEntranceFee =
    chargeableGuests *
    entranceRate;

  const requiredDownpayment =
    accommodationTotal * 0.5;

  return {
    accommodationTotal,
    requiredDownpayment,
    estimatedEntranceFee,
    paidAmount: 0,
    remainingBalance:
      accommodationTotal,
  };
}

function getTotalFreeEntrancePax(
  items,
  guestCount,
) {
  let total = 0;

  items.forEach((item) => {
    const accommodation =
      getAccommodationById(
        item.accommodation_id,
      );

    if (!accommodation) return;

    total += Number(
      accommodation.free_entrance_pax ||
        0,
    );
  });

  return Math.min(
    total,
    Number(guestCount || 0),
  );
}

// ============================================================
// SECTION 17: Checkout date helper
// ============================================================

function calculateCheckOutDate(
  checkInDate,
  startTime,
  endTime,
  stayDuration = 1,
) {
  if (
    !checkInDate ||
    !startTime ||
    !endTime
  ) {
    return checkInDate || "-";
  }

  const startParts =
    String(startTime).split(":");

  const endParts =
    String(endTime).split(":");

  if (
    startParts.length < 2 ||
    endParts.length < 2
  ) {
    return checkInDate;
  }

  const startMinutes =
    Number(startParts[0]) * 60 +
    Number(startParts[1]);

  const endMinutes =
    Number(endParts[0]) * 60 +
    Number(endParts[1]);

  const cleanDuration = Math.max(
    1,
    Math.min(
      5,
      Math.floor(
        Number(stayDuration || 1),
      ),
    ),
  );

  const daysToAdd =
    cleanDuration > 1
      ? cleanDuration
      : endMinutes <= startMinutes
        ? 1
        : 0;

  if (daysToAdd > 0) {
    const date = new Date(
      `${checkInDate}T00:00:00`,
    );

    date.setDate(
      date.getDate() + daysToAdd,
    );

    return toInputDateValue(date);
  }

  return checkInDate;
}

function toInputDateValue(date) {
  const value =
    date instanceof Date
      ? date
      : new Date(date);

  if (
    Number.isNaN(value.getTime())
  ) {
    return "";
  }

  const year = value.getFullYear();

  const month = String(
    value.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    value.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ============================================================
// SECTION 18: Notes
// ============================================================

function combineNotes(
  originalNote,
  paymentNote,
) {
  const parts = [];

  if (originalNote) {
    parts.push(originalNote);
  }

  if (paymentNote) {
    parts.push(
      `Staff Payment Note: ${paymentNote}`,
    );
  }

  return parts.join(" | ");
}

// ============================================================
// SECTION 19: DOM / format helpers
// ============================================================

function setText(id, value) {
  const element =
    document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function formatEntranceType(type) {
  if (type === "beach_only") {
    return "Beach Entrance Only";
  }

  return "Pool & Beach Entrance";
}

function formatMoney(value) {
  return Number(
    value || 0,
  ).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTimeDisplay(timeValue) {
  if (!timeValue) return "N/A";

  const timeText =
    String(timeValue).trim();

  const parts =
    timeText.split(":");

  if (parts.length < 2) {
    return timeText;
  }

  let hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) {
    return timeText;
  }

  const suffix =
    hours >= 12 ? "PM" : "AM";

  hours %= 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${suffix}`;
}

function formatDateDisplay(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(
    `${dateValue}T00:00:00`,
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    return dateValue;
  }

  return date.toLocaleDateString();
}

function showMessage(
  message,
  type = "success",
) {
  const messageEl =
    document.getElementById(
      "adminPaymentMessage",
    );

  if (messageEl) {
    messageEl.textContent = message;

    messageEl.style.color =
      type === "error"
        ? "#dc2626"
        : "#047857";
  }

  if (
    typeof showToast === "function"
  ) {
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
