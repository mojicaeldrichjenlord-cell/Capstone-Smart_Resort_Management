// ============================================================
// PAYMONGO CUSTOMER PAYMENT PREPARATION - STEP 4
// File: frontend/customerJS/paymongo-payment-prep.js
//
// Purpose:
// - Adds the future automated PayMongo option.
// - Keeps the manual GCash/Maya proof-upload flow untouched.
// - When PayMongo checkout is eventually enabled:
//     1) Creates ONE unpaid PayMongo-ready reservation.
//     2) Saves its reservation ID in sessionStorage.
//     3) Calls /api/paymongo/create-checkout.
//     4) Redirects only when backend returns checkout_url.
//
// CURRENT STEP 4:
// - Button remains disabled because Step 2 backend still reports
//   checkout_enabled = false.
// - Therefore no unpaid reservation is created yet.
// ============================================================

const PAYMONGO_RESERVATION_STORAGE_KEY =
  "smartresort_paymongo_reservation_id";

const PAYMONGO_TRANSACTION_STORAGE_KEY =
  "smartresort_paymongo_transaction_id";

let isPreparingPayMongoReservation = false;

// ============================================================
// PAGE STARTUP
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  setupPayMongoPreparationUI();

  // Existing booking-payment.js loads accommodation data first,
  // so refresh the displayed amount shortly after page startup.
  setTimeout(syncPayMongoDownpaymentAmount, 500);
});

// ============================================================
// SECTION 1: Build PayMongo preparation UI
// ============================================================

function setupPayMongoPreparationUI() {
  const paymentForm = document.getElementById("paymentForm");

  if (!paymentForm || document.getElementById("paymongoPrepCard")) {
    return;
  }

  injectPayMongoPrepStyles();

  const card = document.createElement("div");
  card.id = "paymongoPrepCard";
  card.className = "paymongo-prep-card";

  card.innerHTML = `
    <div class="paymongo-prep-heading">
      <div>
        <span class="paymongo-prep-badge">Automated Checkout</span>
        <h3>Pay Downpayment Online</h3>
        <p>
          GCash and Maya payments will be processed through PayMongo once
          account verification and checkout activation are complete.
        </p>
      </div>

      <div class="paymongo-prep-amount">
        <small>50% Downpayment</small>
        <strong id="paymongoPrepAmount">₱0.00</strong>
      </div>
    </div>

    <div class="paymongo-prep-status" id="paymongoPrepStatus">
      Checking PayMongo readiness...
    </div>

    <button
      type="button"
      id="payMongoCheckoutBtn"
      class="paymongo-checkout-btn"
      disabled
    >
      Pay with GCash / Maya via PayMongo
    </button>

    <p class="paymongo-prep-note">
      Manual GCash/Maya payment with reference number and proof upload remains
      available below as the fallback payment method.
    </p>

    <div class="paymongo-manual-divider">
      <span>Manual Payment Fallback</span>
    </div>
  `;

  paymentForm.parentNode.insertBefore(card, paymentForm);

  const checkoutBtn = document.getElementById("payMongoCheckoutBtn");

  checkoutBtn?.addEventListener("click", async () => {
    await startPreparedPayMongoCheckout();
  });

  observeDownpaymentAmount();

  // If a PayMongo reservation was already prepared in this tab,
  // prevent a second manual reservation from the same draft.
  if (getPreparedReservationId()) {
    lockManualPaymentAfterPayMongoReservation();
  }

  checkPayMongoReadiness();
}

// ============================================================
// SECTION 2: PayMongo backend readiness check
// ============================================================

async function checkPayMongoReadiness() {
  const statusBox = document.getElementById("paymongoPrepStatus");
  const checkoutBtn = document.getElementById("payMongoCheckoutBtn");

  if (!statusBox || !checkoutBtn) return;

  try {
    const response = await fetch(`${API_BASE}/paymongo/status`, {
      headers: {
        Accept: "application/json",
      },
    });

    const data = await safePayMongoJson(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "PayMongo status check failed.");
    }

    const credentialsReady = data.credentials_configured === true;
    const checkoutReady = data.checkout_enabled === true;

    if (!credentialsReady) {
      checkoutBtn.disabled = true;
      statusBox.className = "paymongo-prep-status waiting";
      statusBox.textContent =
        "PayMongo verification/credentials are not ready yet. Use the manual payment option below for now.";
      return;
    }

    if (!checkoutReady) {
      checkoutBtn.disabled = true;
      statusBox.className = "paymongo-prep-status waiting";
      statusBox.textContent =
        "PayMongo credentials are detected, but automated checkout is still in preparation.";
      return;
    }

    // IMPORTANT:
    // We do NOT require a reservation ID before enabling the button.
    // Clicking it will safely create the unpaid PayMongo-ready
    // reservation first, then immediately request checkout.
    checkoutBtn.disabled = false;
    statusBox.className = "paymongo-prep-status ready";

    if (getPreparedReservationId()) {
      statusBox.textContent =
        "Your PayMongo reservation is prepared. Continue to secure checkout.";
    } else {
      statusBox.textContent =
        "Automated PayMongo checkout is ready. Your reservation will be created before secure checkout opens.";
    }
  } catch (error) {
    console.error("checkPayMongoReadiness error:", error);

    checkoutBtn.disabled = true;
    statusBox.className = "paymongo-prep-status error";
    statusBox.textContent =
      "Could not check PayMongo readiness. The manual payment option below is still available.";
  }
}

// ============================================================
// SECTION 3: Create PayMongo-ready reservation ONCE
//
// This is the Step 4 bridge:
// booking draft -> /api/bookings/paymongo -> reservation ID
//
// The existing /api/bookings manual-proof route is NOT used.
// ============================================================

async function ensurePayMongoReservation() {
  const existingReservationId = getPreparedReservationId();

  if (existingReservationId) {
    return {
      reservationId: existingReservationId,
      paymentTransactionId: getPreparedPaymentTransactionId(),
    };
  }

  if (isPreparingPayMongoReservation) {
    throw new Error(
      "Your PayMongo reservation is already being prepared. Please wait.",
    );
  }

  if (typeof bookingDraft === "undefined" || !bookingDraft) {
    throw new Error(
      "Reservation draft is missing. Please return to the reservation form.",
    );
  }

  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user?.id) {
    throw new Error("User session is missing. Please login again.");
  }

  const payload = {
    ...bookingDraft,
    user_id: bookingDraft.user_id || user.id,

    // PayMongo route does not accept/use manual proof.
    payment_method: "other",
    payment_type: "downpayment",
    proof_reference: null,
    proof_of_payment: null,
    proof_image_data: null,
  };

  try {
    isPreparingPayMongoReservation = true;

    const response = await fetch(`${API_BASE}/bookings/paymongo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await safePayMongoJson(response);

    if (!response.ok || !data.bookingId) {
      throw new Error(
        data.message || "Unable to prepare reservation for PayMongo.",
      );
    }

    sessionStorage.setItem(
      PAYMONGO_RESERVATION_STORAGE_KEY,
      String(data.bookingId),
    );

    if (data.paymentTransactionId) {
      sessionStorage.setItem(
        PAYMONGO_TRANSACTION_STORAGE_KEY,
        String(data.paymentTransactionId),
      );
    }

    sessionStorage.setItem(
      "smartresort_paymongo_return_context",
      JSON.stringify({
        reservation_id: Number(data.bookingId),
        reservation_code: data.reservationCode || null,
        payment_transaction_id: data.paymentTransactionId || null,
      }),
    );

    // Once a PayMongo reservation exists, do not let the same
    // draft also create a separate manual-proof reservation.
    lockManualPaymentAfterPayMongoReservation();

    return {
      reservationId: Number(data.bookingId),
      reservationCode: data.reservationCode || null,
      paymentTransactionId: data.paymentTransactionId || null,
      requiredDownpayment: Number(data.requiredDownpayment || 0),
    };
  } finally {
    isPreparingPayMongoReservation = false;
  }
}

// ============================================================
// SECTION 4: Reservation -> PayMongo checkout
//
// Step 2 backend intentionally does not return checkout_url yet.
// When the real API call is activated, this code is already ready.
// ============================================================

async function startPreparedPayMongoCheckout() {
  const checkoutBtn = document.getElementById("payMongoCheckoutBtn");
  const statusBox = document.getElementById("paymongoPrepStatus");
  const originalText =
    checkoutBtn?.textContent || "Pay with GCash / Maya via PayMongo";

  try {
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Preparing reservation...";
    }

    if (statusBox) {
      statusBox.className = "paymongo-prep-status waiting";
      statusBox.textContent =
        "Preparing your reservation for secure PayMongo checkout...";
    }

    const preparedReservation = await ensurePayMongoReservation();
    const reservationId = Number(preparedReservation.reservationId);

    if (!reservationId) {
      throw new Error("PayMongo reservation ID was not created.");
    }

    if (checkoutBtn) {
      checkoutBtn.textContent = "Opening secure checkout...";
    }

    if (statusBox) {
      statusBox.textContent =
        "Reservation prepared. Opening secure PayMongo checkout...";
    }

    const response = await fetch(`${API_BASE}/paymongo/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        reservation_id: reservationId,
      }),
    });

    const data = await safePayMongoJson(response);

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to create PayMongo checkout.",
      );
    }

    if (!data.checkout_url) {
      throw new Error(
        "PayMongo checkout URL is not available yet.",
      );
    }

    // Reservation now exists in MySQL. The booking draft is no
    // longer needed to create another reservation.
    sessionStorage.removeItem("smartresort_booking_draft_v2");

    window.location.href = data.checkout_url;
  } catch (error) {
    console.error("startPreparedPayMongoCheckout error:", error);

    const reservationAlreadyPrepared = Boolean(
      getPreparedReservationId(),
    );

    if (statusBox) {
      statusBox.className = "paymongo-prep-status error";
      statusBox.textContent = reservationAlreadyPrepared
        ? `${error.message} Your reservation is already prepared, so retry PayMongo instead of submitting another reservation.`
        : error.message || "Unable to prepare PayMongo checkout.";
    }

    showPayMongoPrepMessage(
      error.message || "Unable to prepare PayMongo checkout.",
      "error",
    );

    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = reservationAlreadyPrepared
        ? "Retry PayMongo Checkout"
        : originalText;
    }
  }
}

// ============================================================
// SECTION 5: Prevent duplicate manual reservation after the
// PayMongo reservation has already been created.
// ============================================================

function lockManualPaymentAfterPayMongoReservation() {
  const submitReservationBtn =
    document.getElementById("submitReservationBtn");

  if (submitReservationBtn) {
    submitReservationBtn.disabled = true;
    submitReservationBtn.title =
      "A PayMongo reservation has already been prepared for this booking.";
  }

  const paymentMethod = document.getElementById("paymentMethod");
  const paymentReference = document.getElementById("paymentReference");
  const paymentProof = document.getElementById("paymentProof");
  const paymentReminderNote =
    document.getElementById("paymentReminderNote");
  const openQrModalBtn = document.getElementById("openQrModalBtn");

  [
    paymentMethod,
    paymentReference,
    paymentProof,
    paymentReminderNote,
    openQrModalBtn,
  ]
    .filter(Boolean)
    .forEach((element) => {
      element.disabled = true;
    });

  const divider = document.querySelector(".paymongo-manual-divider");

  if (
    divider &&
    !document.getElementById("paymongoManualLockedMessage")
  ) {
    const note = document.createElement("p");
    note.id = "paymongoManualLockedMessage";
    note.className = "paymongo-manual-locked";
    note.textContent =
      "Manual fallback is locked because a PayMongo reservation has already been created for this booking. Retry PayMongo checkout or manage the reservation from My Bookings.";

    divider.insertAdjacentElement("afterend", note);
  }
}

// ============================================================
// SECTION 6: Stored reservation/transaction helpers
// ============================================================

function getPreparedReservationId() {
  const params = new URLSearchParams(window.location.search);
  const queryReservationId = Number(params.get("reservation_id"));

  if (
    Number.isInteger(queryReservationId) &&
    queryReservationId > 0
  ) {
    return queryReservationId;
  }

  const storedReservationId = Number(
    sessionStorage.getItem(PAYMONGO_RESERVATION_STORAGE_KEY),
  );

  if (
    Number.isInteger(storedReservationId) &&
    storedReservationId > 0
  ) {
    return storedReservationId;
  }

  return null;
}

function getPreparedPaymentTransactionId() {
  const storedId = Number(
    sessionStorage.getItem(PAYMONGO_TRANSACTION_STORAGE_KEY),
  );

  return Number.isInteger(storedId) && storedId > 0
    ? storedId
    : null;
}

// ============================================================
// SECTION 7: Keep 50% amount synced with existing page
// ============================================================

function syncPayMongoDownpaymentAmount() {
  const source = document.getElementById("paymentDownpayment");
  const target = document.getElementById("paymongoPrepAmount");

  if (!source || !target) return;

  target.textContent = source.textContent || "₱0.00";
}

function observeDownpaymentAmount() {
  const source = document.getElementById("paymentDownpayment");

  if (!source || typeof MutationObserver === "undefined") return;

  const observer = new MutationObserver(() => {
    syncPayMongoDownpaymentAmount();
  });

  observer.observe(source, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

// ============================================================
// SECTION 8: Safe JSON/message helpers
// ============================================================

async function safePayMongoJson(response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      "Backend returned an invalid PayMongo response.",
    );
  }
}

function showPayMongoPrepMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
    return;
  }

  const paymentMessage =
    document.getElementById("paymentMessage");

  if (paymentMessage) {
    paymentMessage.textContent = message;
    paymentMessage.style.color =
      type === "error" ? "#b91c1c" : "#047857";
  }
}

// ============================================================
// SECTION 9: Styles
// ============================================================

function injectPayMongoPrepStyles() {
  if (document.getElementById("paymongoPrepStyles")) return;

  const style = document.createElement("style");
  style.id = "paymongoPrepStyles";

  style.textContent = `
    .paymongo-prep-card {
      margin: 14px 0 22px;
      padding: 18px;
      border: 1px solid #bae6fd;
      border-radius: 20px;
      background:
        linear-gradient(
          135deg,
          rgba(236, 254, 255, 0.98),
          rgba(255, 255, 255, 0.98)
        );
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
    }

    .paymongo-prep-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .paymongo-prep-heading h3 {
      margin: 8px 0 6px;
      color: #0f172a;
    }

    .paymongo-prep-heading p {
      margin: 0;
      color: #475569;
      line-height: 1.55;
    }

    .paymongo-prep-badge {
      display: inline-flex;
      padding: 6px 10px;
      border-radius: 999px;
      background: #0f766e;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 800;
    }

    .paymongo-prep-amount {
      min-width: 150px;
      padding: 12px 14px;
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid #dbeafe;
      text-align: right;
    }

    .paymongo-prep-amount small {
      display: block;
      color: #64748b;
      margin-bottom: 4px;
    }

    .paymongo-prep-amount strong {
      color: #0f766e;
      font-size: 1.2rem;
    }

    .paymongo-prep-status {
      margin-top: 14px;
      padding: 11px 13px;
      border-radius: 14px;
      font-size: 0.9rem;
      font-weight: 700;
      line-height: 1.45;
      background: #f8fafc;
      color: #475569;
    }

    .paymongo-prep-status.waiting {
      background: #fff7ed;
      color: #9a3412;
    }

    .paymongo-prep-status.ready {
      background: #ecfdf5;
      color: #047857;
    }

    .paymongo-prep-status.error {
      background: #fef2f2;
      color: #b91c1c;
    }

    .paymongo-checkout-btn {
      width: 100%;
      margin-top: 12px;
      padding: 14px 16px;
      border: none;
      border-radius: 14px;
      background:
        linear-gradient(135deg, #0f766e, #0891b2);
      color: #ffffff;
      font-weight: 900;
      cursor: pointer;
      transition:
        transform 0.18s ease,
        opacity 0.18s ease;
    }

    .paymongo-checkout-btn:not(:disabled):hover {
      transform: translateY(-1px);
    }

    .paymongo-checkout-btn:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .paymongo-prep-note {
      margin: 12px 0 0;
      color: #64748b;
      font-size: 0.86rem;
      line-height: 1.5;
    }

    .paymongo-manual-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 18px;
      color: #64748b;
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .paymongo-manual-divider::before,
    .paymongo-manual-divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #cbd5e1;
    }

    .paymongo-manual-locked {
      margin: 12px 0 0;
      padding: 11px 13px;
      border-radius: 14px;
      background: #fff7ed;
      color: #9a3412;
      font-size: 0.86rem;
      font-weight: 700;
      line-height: 1.5;
    }

    @media (max-width: 700px) {
      .paymongo-prep-heading {
        flex-direction: column;
      }

      .paymongo-prep-amount {
        width: 100%;
        text-align: left;
        box-sizing: border-box;
      }
    }
  `;

  document.head.appendChild(style);
}
