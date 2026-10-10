// ============================================================
// SMARTRESORT FRONT DESK WALK-IN PAYMENT SCRIPT
// FULL REPLACEMENT
//
// File to replace:
// frontend/adminJS/admin-walkin-payment.js
//
// Purpose:
// - Allow Front Desk access only
// - Load manual reservation draft from sessionStorage
// - Render reservation summary
// - Correctly read day_tour / night / day_extended / night_extended
// - Correctly compute accommodation total and 50% downpayment
// - Correctly multiply extended-stay price by stay_duration
// - Treat Day 22/23 Hours as DAY entrance rate and Night 22/23 Hours as NIGHT
// - Walk-in collects accommodation only; entrance is finalized after check-in
// - Handle Cash / GCash / Maya manual payment rules (no Front Desk PayPal)
// - Send created_by using the logged-in staff account
// - Submit manual reservation to backend
// - Authenticate manual reservation API requests with the short-lived
//   Front Desk token issued by the login endpoint (Cash / GCash / Maya)
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

let walkInDraft = null;
let availableAccommodations = [];
let isSubmittingManualReservation = false;

// The normal POST response redirect remains the primary path.
// This watchdog handles the observed edge case where the backend has already
// created the reservation but the browser never receives/finishes the POST
// success response, leaving the staff on the payment page.
let manualReservationRedirectStarted = false;
let manualReservationWatchdogTimer = null;

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
  if (!checkStaffAccess()) {
    return;
  }

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

  setupPaymentForm();
  renderReservationSummary();
  updatePaymentRequirementUI();
  updatePaymentBreakdown();
});

// ============================================================
// SECTION 2: Front Desk-only access
// ============================================================

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("getLoggedInUser error:", error);
    return null;
  }
}

// The backend verifies this signed token and derives created_by from it.
// Do not rely on the locally stored account ID as authentication.
function getFrontDeskAuthorizationHeader() {
  const token = String(
    sessionStorage.getItem("frontDeskToken") || "",
  ).trim();

  if (!/^fd1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error(
      "Your secure Front Desk session is missing. Please log out and log in again before submitting a reservation.",
    );
  }

  return `Bearer ${token}`;
}

function normalizeManualPaymentRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  return value === "staff"
    ? "frontdesk"
    : value;
}

function checkStaffAccess() {
  const user = getLoggedInUser();

  if (!user) {
    alert("Please login first.");
    window.location.replace("../authHTML/login.html");
    return false;
  }

  const role = normalizeManualPaymentRole(user.role);

  if (role === "frontdesk") {
    return true;
  }

  const routes = {
    admin: "admin.html",
    manager: "../managerHTML/managerDashboard.html",
    housekeeping:
      "../housekeepingHTML/housekeepingDashboard.html",
    customer: "../customerHTML/index.html",
  };

  alert(
    "Access denied. Manual reservations are handled by Front Desk.",
  );

  window.location.replace(
    routes[role] || "../authHTML/login.html",
  );

  return false;
}


// ============================================================
// SECTION 2.1: Front Desk success destination
//
// A successful manual reservation always returns to Front Desk
// Guest Management.
// ============================================================

function getManualReservationSuccessDestination() {
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

  paymentMethod.disabled = false;
  paymentMethod.title = "";

  if (isWalkInManualReservation()) {
    // Walk-in: full accommodation payment, Cash / GCash / Maya only.
    paymentMethod.innerHTML = `
      <option value="cash">Cash</option>
      <option value="gcash">GCash</option>
      <option value="paymaya">Maya / PayMaya</option>
    `;
    paymentMethod.value = ["cash", "gcash", "paymaya"].includes(previousMethod)
      ? previousMethod
      : "cash";
    paymentType.innerHTML = `<option value="full">Full Payment</option>`;
    paymentType.value = "full";
    paymentType.disabled = true;
    paymentType.title = "Walk-in reservations must be full payment only.";
    return;
  }

  // Facebook/Messenger: GCash / Maya only (full or 50% downpayment).
  paymentMethod.innerHTML = `
    <option value="gcash">GCash</option>
    <option value="paymaya">Maya / PayMaya</option>
  `;
  paymentMethod.value = ["gcash", "paymaya"].includes(previousMethod)
    ? previousMethod
    : "gcash";
  paymentType.innerHTML = `
    <option value="downpayment">50% Down Payment</option>
    <option value="full">Full Payment</option>
  `;
  paymentType.value = ["downpayment", "full"].includes(previousType)
    ? previousType
    : "downpayment";
  paymentType.disabled = false;
  paymentType.title = "";
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

    // Cash, GCash, and Maya all use the secure Front Desk submit path.
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

  const method = String(
    document.getElementById("paymentMethod")?.value || "cash",
  ).toLowerCase();
  const isWalkIn = isWalkInManualReservation();
  const isCash = method === "cash";
  const requiresScreenshot = ["gcash", "paymaya"].includes(method);

  const methodHelp = document.getElementById("paymentMethodHelp");
  const referenceGroup = document.getElementById("referenceGroup");
  const proofGroup = document.getElementById("proofGroup");
  const referenceRequiredText = document.getElementById("referenceRequiredText");
  const proofRequiredText = document.getElementById("proofRequiredText");
  const proofReference = document.getElementById("proofReference");
  const proofImage = document.getElementById("proofImage");
  const proofPreview = document.getElementById("proofPreview");
  const paymentRuleNote = document.getElementById("paymentRuleNote");
  const submitBtn = document.getElementById("submitPaymentBtn");

  if (proofReference) {
    proofReference.required = false;
    proofReference.disabled = isCash;
    if (isCash) {
      proofReference.value = "";
      proofReference.placeholder = "Not required for cash payment";
      proofReference.removeAttribute("maxlength");
    } else {
      proofReference.placeholder = method === "gcash"
        ? "Optional GCash reference" : "Optional Maya reference";
      proofReference.setAttribute("maxlength", method === "gcash" ? "16" : "37");
      proofReference.value = formatReferenceNumberForDisplay(
        proofReference.value, method,
      );
    }
  }

  if (proofImage) {
    proofImage.required = requiresScreenshot;
    proofImage.disabled = isCash;
    if (isCash) proofImage.value = "";
  }
  if (proofPreview && isCash) {
    proofPreview.style.display = "none";
    proofPreview.src = "";
  }
  if (referenceGroup) referenceGroup.style.display = requiresScreenshot ? "flex" : "none";
  if (proofGroup) proofGroup.style.display = requiresScreenshot ? "flex" : "none";

  if (referenceRequiredText) {
    referenceRequiredText.textContent = requiresScreenshot ? " (Optional)" : " (Not needed)";
    referenceRequiredText.style.color = "#64748b";
  }
  if (proofRequiredText) {
    proofRequiredText.textContent = requiresScreenshot ? " *Required" : " (Not needed)";
    proofRequiredText.style.color = requiresScreenshot ? "#dc2626" : "#64748b";
  }

  if (methodHelp) {
    methodHelp.textContent = isWalkIn
      ? "Walk-in accepts Cash, GCash, or Maya. GCash/Maya needs proof screenshot; reference is optional."
      : "Facebook/Messenger accepts GCash or Maya. A proof screenshot is required; reference is optional.";
  }

  const pendingLegacyPayPal = getMatchingLegacyPayPalPending();
  if (paymentRuleNote) {
    paymentRuleNote.innerHTML = pendingLegacyPayPal
      ? `<strong>Existing Pending Reservation:</strong><br />
         This draft already has a PayPal-created reservation (ID ${Number(pendingLegacyPayPal.bookingId)}).
         Do not submit a duplicate. Ask authorized staff to review/cancel the existing
         reservation before making a new manual reservation.`
      : isWalkIn
        ? `<strong>Walk-in Rule:</strong><br />
           Collect the full accommodation amount through Cash, GCash, or Maya.
           For GCash/Maya, upload the payment proof screenshot (reference optional).
           After submission, the reservation is automatically checked in.
           Entrance fee is finalized and collected separately.`
        : `<strong>Facebook / Messenger Rule:</strong><br />
           Only GCash or Maya is accepted. Upload a payment proof screenshot
           (reference optional). Collect either the selected 50% downpayment
           or full accommodation payment. Entrance fee is collected at arrival.`;
  }

  if (submitBtn) {
    submitBtn.style.display = "";
    submitBtn.disabled = Boolean(pendingLegacyPayPal);
    submitBtn.title = pendingLegacyPayPal
      ? "Resolve the previously created PayPal reservation before submitting again."
      : "";
  }
  // Deliberately no PayPal SDK setup, buttons, or checkout calls.
  updatePaymentBreakdown();
}

// ============================================================
// SECTION 11: Payment breakdown
// Highlight the actual selected accommodation payment separately from
// entrance fee and later Front Desk collections. Presentation only:
// this does NOT change computedTotals or reservation payment payloads.
// ============================================================

function updatePaymentDueHighlight({
  amount,
  isWalkIn,
  paymentType,
  paymentMethod,
  estimatedEntranceFee,
}) {
  const breakdown = document.querySelector(".payment-breakdown");
  if (!breakdown) return;

  if (!document.getElementById("paymentDueHighlightStyle")) {
    const style = document.createElement("style");
    style.id = "paymentDueHighlightStyle";
    style.textContent = `
      .payment-due-highlight {
        background: linear-gradient(130deg, #ccfbf1, #f0fdfa);
        color: #0f172a;
        border: 2px solid #14b8a6;
        border-radius: 16px;
        padding: 17px 18px 15px;
        margin-bottom: 18px;
        box-shadow: 0 8px 22px rgba(20,184,166,.16);
      }
      .payment-due-highlight__label {
        display: block;
        color: #115e59;
        font-size: .79rem;
        font-weight: 900;
        letter-spacing: .075em;
        text-transform: uppercase;
      }
      .payment-due-highlight__amount {
        display: block;
        font-size: clamp(1.75rem, 3vw, 2.5rem);
        line-height: 1.2;
        font-weight: 900;
        color: #0f172a;
        letter-spacing: -.035em;
        margin: 5px 0 4px;
        font-variant-numeric: tabular-nums;
        overflow-wrap: anywhere;
      }
      .payment-due-highlight__description {
        display: block;
        font-size: .88rem;
        color: #115e59;
        font-weight: 650;
        line-height: 1.5;
      }
      .payment-due-highlight__later {
        margin: 11px 0 0;
        padding-top: 10px;
        border-top: 1px solid #99f6e4;
        font-size: .79rem;
        color: #334155;
        line-height: 1.5;
      }
      @media (max-width: 450px) {
        .payment-due-highlight { padding: 14px; }
      }
    `;
    document.head.appendChild(style);
  }

  let card = document.getElementById("paymentDueHighlight");
  if (!card) {
    card = document.createElement("div");
    card.id = "paymentDueHighlight";
    card.className = "payment-due-highlight";
    card.setAttribute("role", "status");
    card.setAttribute("aria-live", "polite");
    card.innerHTML = `
      <span class="payment-due-highlight__label">Amount to Collect Now</span>
      <strong class="payment-due-highlight__amount" id="paymentDueNowAmount"></strong>
      <span class="payment-due-highlight__description" id="paymentDueNowDescription"></span>
      <p class="payment-due-highlight__later" id="paymentDueNowLater"></p>
    `;
    breakdown.insertBefore(card, breakdown.firstChild);
  }

  const methodNames = {
    cash: "cash",
    gcash: "GCash",
    paymaya: "Maya",
  };
  const method = methodNames[paymentMethod] || "selected method";
  const typeLabel =
    isWalkIn || paymentType === "full"
      ? "FULL ACCOMMODATION PAYMENT"
      : "50% ACCOMMODATION DOWN PAYMENT";

  const label = card.querySelector(".payment-due-highlight__label");
  if (label) label.textContent = `AMOUNT TO PAY NOW · ${typeLabel}`;
  setText("paymentDueNowAmount", `₱${formatMoney(amount)}`);
  setText(
    "paymentDueNowDescription",
    `${isWalkIn ? "Collect" : "Collect / verify"} the ${
      isWalkIn || paymentType === "full" ? "full payment" : "50% downpayment"
    } via ${method}.`,
  );
  setText(
    "paymentDueNowLater",
    `Entrance fee (~₱${formatMoney(estimatedEntranceFee)}) is NOT included above. ` +
      "It is estimated now and finalized/collected separately at check-in.",
  );
}

function updatePaymentBreakdown() {
  computedTotals = computeTotals();
  const isWalkIn = isWalkInManualReservation();
  const paymentMethod = String(
    document.getElementById("paymentMethod")?.value || "cash",
  ).toLowerCase();
  const paymentType = isWalkIn
    ? "full"
    : document.getElementById("paymentType")?.value || "downpayment";

  const paidAmount = paymentType === "full"
    ? computedTotals.accommodationTotal
    : computedTotals.requiredDownpayment;
  const remainingBalance = Math.max(
    computedTotals.accommodationTotal - paidAmount, 0,
  );
  const frontDeskReminder = remainingBalance + computedTotals.estimatedEntranceFee;

  computedTotals.paidAmount = paidAmount;
  computedTotals.remainingBalance = remainingBalance;

  updatePaymentDueHighlight({
    amount: paidAmount,
    isWalkIn,
    paymentType,
    paymentMethod,
    estimatedEntranceFee: computedTotals.estimatedEntranceFee,
  });

  setText("paymentAccommodationTotal", `₱${formatMoney(computedTotals.accommodationTotal)}`);
  setText("paymentDownpayment", `₱${formatMoney(computedTotals.requiredDownpayment)}`);
  setText("paymentPaidAmount", `₱${formatMoney(paidAmount)}`);
  setText("paymentRemaining", `₱${formatMoney(remainingBalance)}`);
  setText("paymentEntranceFee", `₱${formatMoney(computedTotals.estimatedEntranceFee)}`);

  const downpaymentRow = document.getElementById("paymentDownpaymentRow");
  const totalCollectedRow = document.getElementById("paymentTotalCollectedRow");
  const collectionNote = document.getElementById("paymentCollectionNote");

  if (downpaymentRow) {
    downpaymentRow.style.display = isWalkIn
      ? "none" : paymentType === "downpayment" ? "flex" : "none";
  }
  if (totalCollectedRow) totalCollectedRow.style.display = isWalkIn ? "flex" : "none";

  setText("paymentPaidLabel", "Accommodation Payment Selected");
  setText("paymentEntranceLabel", "Estimated Entrance Fee");
  setText("paymentTotalDueLabel", isWalkIn
    ? "Amount Due Now" : "Est. to Collect at Arrival (Later)");
  setText("paymentFrontDeskReminder", `₱${formatMoney(
    isWalkIn ? computedTotals.accommodationTotal : frontDeskReminder,
  )}`);

  if (isWalkIn) {
    setText("paymentTotalCollected", `₱${formatMoney(computedTotals.accommodationTotal)}`);
    if (collectionNote) {
      collectionNote.innerHTML = `
        <strong>Walk-in Collection:</strong><br />
        Collect the full accommodation amount now via Cash, GCash, or Maya.
        The entrance fee shown above is only an estimate. After automatic
        check-in, verify guest details, apply entrance adjustments, and
        collect the final entrance fee separately.`;
    }
  } else if (collectionNote) {
    collectionNote.innerHTML = `
      <strong>Reminder:</strong><br />
      The selected 50% downpayment or full accommodation payment is handled now
      via GCash or Maya. The entrance fee is NOT included; it is estimated
      and collected separately at arrival/check-in.`;
  }
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
  const loggedInRole =
    normalizeManualPaymentRole(
      loggedInUser?.role,
    );

  if (!createdBy) {
    showMessage(
      "Your logged-in staff account could not be identified. Please log in again.",
      "error",
    );
    return;
  }

  if (loggedInRole !== "frontdesk") {
    showMessage(
      "Only Front Desk accounts can create manual reservations.",
      "error",
    );
    return;
  }

  const paymentMethod =
    String(
      document.getElementById("paymentMethod")?.value ||
        "cash",
    ).toLowerCase();

  // Prevent duplicate bookings if the same draft already created a PayPal
  // reservation before manual PayPal was removed from Front Desk.
  if (getMatchingLegacyPayPalPending()) {
    showMessage(
      "An earlier PayPal reservation exists for this draft. Ask authorized staff to review/cancel it before submitting another reservation.",
      "error",
    );
    return;
  }
  // Defense-in-depth for tampered selectors: Front Desk cannot submit PayPal.
  if (!["cash", "gcash", "paymaya"].includes(paymentMethod)) {
    showMessage("Manual payments accept only Cash, GCash, or Maya.", "error");
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
      "Walk-in reservations only accept Cash, GCash, or Maya.",
      "error",
    );
    return;
  }

  if (
    !isWalkIn &&
    !["gcash", "paymaya"].includes(paymentMethod)
  ) {
    showMessage(
      "Facebook/Messenger reservations must use GCash or Maya.",
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

    const frontDeskAuthHeader =
      getFrontDeskAuthorizationHeader();

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
          Authorization: frontDeskAuthHeader,
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
// SECTION 12.1: Legacy manual PayPal duplicate-prevention only.
// Front Desk PayPal checkout, SDK, and capture have been REMOVED.
// Customer online PayPal processing lives elsewhere and is unaffected.
// ============================================================
function getManualDraftSignatureForLegacyPayPal() {
  if (!walkInDraft) return "";
  return JSON.stringify({
    first_name: walkInDraft.first_name || "",
    middle_name: walkInDraft.middle_name || "",
    last_name: walkInDraft.last_name || "",
    contact_no: walkInDraft.contact_no || "",
    guest_count: Number(walkInDraft.guest_count || 0),
    entrance_type: walkInDraft.entrance_type || "",
    reservation_type: getManualReservationType(),
    note: walkInDraft.note || "",
    items: Array.isArray(walkInDraft.items) ? walkInDraft.items : [],
  });
}

function getMatchingLegacyPayPalPending() {
  const raw = sessionStorage.getItem(ADMIN_FRONTDESK_PAYPAL_PENDING_KEY);
  if (!raw) return null;
  try {
    const pending = JSON.parse(raw);
    return pending?.bookingId &&
      pending?.draftSignature === getManualDraftSignatureForLegacyPayPal()
      ? pending : null;
  } catch (error) {
    return null;
  }
}

// Shared JSON response parser still required by manual reservation submit.
async function readFrontDeskJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Non-JSON response from server:", text);
    throw new Error(
      "Server returned an invalid response. Check the backend terminal.",
    );
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
