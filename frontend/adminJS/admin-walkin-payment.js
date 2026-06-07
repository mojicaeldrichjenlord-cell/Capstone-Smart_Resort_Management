// ============================================================
// SMARTRESORT ADMIN WALK-IN PAYMENT SCRIPT
// Purpose:
// - Check admin access
// - Load manual reservation draft from sessionStorage
// - Render reservation summary
// - Compute payment totals
// - Handle proof/reference requirement
// - Submit manual reservation to backend
// - Works from frontend/adminHTML/admin-walkin-payment.html
// ============================================================

const ADMIN_WALKIN_DRAFT_KEY = "smartresort_admin_walkin_draft_v2";
const ADMIN_WALKIN_SUCCESS_RESET_KEY = "smartresort_admin_walkin_success_reset";

let walkInDraft = null;
let availableAccommodations = [];
let isSubmittingManualReservation = false;

let computedTotals = {
  accommodationTotal: 0,
  requiredDownpayment: 0,
  estimatedEntranceFee: 0,
  paidAmount: 0,
  remainingBalance: 0,
};

// ============================================================
// SECTION 1: Page startup
// Checks admin access, loads draft, rooms, and renders payment page.
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  checkAdminAccess();
  setupLogout();

  walkInDraft = getWalkInDraft();

  if (!walkInDraft) {
    alert("No manual reservation draft found. Please create the reservation first.");
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
// Clears current user and returns to login page.
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
// SECTION 4: Get walk-in draft
// Reads manual reservation data from sessionStorage.
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
// SECTION 4.1: Manual reservation type helpers
// Walk-in = onsite guest, cash full payment, auto check-in.
// Facebook/Messenger = advance/manual booking, GCash/PayMaya proof required.
// ============================================================

function getManualReservationType() {
  const value = String(walkInDraft?.reservation_type || "walkin").toLowerCase();
  return value === "facebook" ? "facebook" : "walkin";
}

function isWalkInManualReservation() {
  return getManualReservationType() === "walkin";
}

function isFacebookManualReservation() {
  return getManualReservationType() === "facebook";
}

function formatManualReservationType(type = getManualReservationType()) {
  return type === "facebook" ? "Facebook / Messenger Reservation" : "Walk-in Guest";
}

function enforcePaymentOptionsByReservationType() {
  const paymentMethod = document.getElementById("paymentMethod");
  const paymentType = document.getElementById("paymentType");

  if (!paymentMethod || !paymentType) return;

  if (isWalkInManualReservation()) {
    paymentMethod.innerHTML = `<option value="cash">Cash</option>`;
    paymentMethod.value = "cash";
    paymentMethod.disabled = true;

    paymentType.innerHTML = `<option value="full">Full Payment</option>`;
    paymentType.value = "full";
    paymentType.disabled = true;
    paymentType.title = "Walk-in reservations are cash and full payment only.";
    return;
  }

  paymentMethod.disabled = false;
  paymentMethod.innerHTML = `
    <option value="gcash">GCash</option>
    <option value="paymaya">PayMaya</option>
  `;

  if (!["gcash", "paymaya"].includes(paymentMethod.value)) {
    paymentMethod.value = "gcash";
  }

  paymentType.disabled = false;
  paymentType.title = "";
  paymentType.innerHTML = `
    <option value="downpayment">50% Down Payment</option>
    <option value="full">Full Payment</option>
  `;

  if (!["downpayment", "full"].includes(paymentType.value)) {
    paymentType.value = "downpayment";
  }
}

// ============================================================
// SECTION 5: Load available accommodations
// Used to compute item labels, slot prices, and totals.
// ============================================================

async function loadAccommodations() {
  try {
    const response = await fetch(`${API_BASE}/rooms/available`);
    const data = await response.json();

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
// SECTION 6: Setup payment form
// Connects method/type changes, proof preview, and form submit.
// ============================================================

function setupPaymentForm() {
  const form = document.getElementById("adminPaymentForm");
  const paymentMethod = document.getElementById("paymentMethod");
  const paymentType = document.getElementById("paymentType");
  const proofImage = document.getElementById("proofImage");

  enforcePaymentOptionsByReservationType();

  if (paymentMethod) {
    paymentMethod.addEventListener("change", () => {
      updatePaymentRequirementUI();
      updatePaymentBreakdown();
    });
  }

  if (paymentType) {
    paymentType.addEventListener("change", updatePaymentBreakdown);
  }

  if (proofImage) {
    proofImage.addEventListener("change", previewProofImage);
  }

  if (form) {
    form.addEventListener("submit", submitManualReservation);
  }
}

// ============================================================
// SECTION 7: Render reservation summary
// Shows guest info, entrance type, and selected accommodations.
// ============================================================

function renderReservationSummary() {
  const container = document.getElementById("reservationSummaryList");
  if (!container || !walkInDraft) return;

  const fullName = [
    walkInDraft.first_name,
    walkInDraft.middle_name,
    walkInDraft.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const items = Array.isArray(walkInDraft.items) ? walkInDraft.items : [];

  computedTotals = computeTotals();

  container.innerHTML = `
    <div class="summary-item">
      <strong>Guest Name:</strong> ${escapeHtml(fullName || "N/A")}<br />
      <strong>Contact No:</strong> ${escapeHtml(walkInDraft.contact_no || "N/A")}<br />
      <strong>Guest Count:</strong> ${Number(walkInDraft.guest_count || 0)}<br />
      <strong>Reservation Type:</strong> ${formatManualReservationType()}
    </div>

    <div class="summary-item">
      <strong>Entrance Type:</strong> ${formatEntranceType(walkInDraft.entrance_type)}<br />
      <strong>Estimated Entrance Fee:</strong> ₱${formatMoney(
        computedTotals.estimatedEntranceFee
      )}
    </div>

    ${
      items.length
        ? items.map((item, index) => renderReservationItem(item, index)).join("")
        : `
          <div class="summary-item">
            No accommodation item found.
          </div>
        `
    }
  `;
}

// ============================================================
// SECTION 8: Render one reservation item summary
// Shows accommodation, slot, schedule, and price.
// ============================================================

function renderReservationItem(item, index) {
  const accommodation = getAccommodationById(item.accommodation_id);

  const slot = getSlotOptions(accommodation).find(
    (slotItem) => slotItem.value === item.slot_type
  );

  const stayDuration = getStayDuration(item);
  const checkOutDate = calculateCheckOutDate(
    item.check_in_date,
    slot?.start,
    slot?.end,
    stayDuration
  );
  const totalPrice = Number(slot?.price || 0) * stayDuration;
  const durationLabel = item.slot_type === "extended"
    ? `${stayDuration} ${stayDuration === 1 ? "day" : "days"}`
    : item.slot_type === "overnight"
      ? "1 night only"
      : "1 day only";

  return `
    <div class="summary-item">
      <strong>Accommodation ${index + 1}:</strong>
      ${escapeHtml(accommodation?.name || "N/A")}<br />

      <strong>Category:</strong>
      ${escapeHtml(accommodation?.category_name || "N/A")}<br />

      <strong>Slot:</strong>
      ${escapeHtml(slot?.label || item.slot_type || "N/A")}<br />

      <strong>Schedule:</strong>
      ${formatTimeDisplay(slot?.start)} - ${formatTimeDisplay(slot?.end)}<br />

      <strong>Check-in:</strong>
      ${formatDateDisplay(item.check_in_date)}<br />

      <strong>Check-out:</strong>
      ${formatDateDisplay(checkOutDate)}<br />

      <strong>Stay Duration:</strong>
      ${escapeHtml(durationLabel)}<br />

      <strong>Price:</strong>
      ₱${formatMoney(slot?.price || 0)}${item.slot_type === "extended" ? ` × ${stayDuration} = ₱${formatMoney(totalPrice)}` : ""}
    </div>
  `;
}

// ============================================================
// SECTION 9: Payment requirements UI
// Makes proof/reference required for electronic payments.
// ============================================================

function updatePaymentRequirementUI() {
  enforcePaymentOptionsByReservationType();

  const method = document.getElementById("paymentMethod")?.value || "cash";
  const paymentType = document.getElementById("paymentType");
  const methodHelp = document.getElementById("paymentMethodHelp");
  const referenceGroup = document.getElementById("referenceGroup");
  const proofGroup = document.getElementById("proofGroup");
  const referenceRequiredText = document.getElementById("referenceRequiredText");
  const proofRequiredText = document.getElementById("proofRequiredText");
  const proofReference = document.getElementById("proofReference");
  const proofImage = document.getElementById("proofImage");
  const proofPreview = document.getElementById("proofPreview");
  const paymentRuleNote = document.getElementById("paymentRuleNote");

  const isWalkIn = isWalkInManualReservation();
  const requiresProof = !isWalkIn && isProofRequired(method);

  if (paymentType && isWalkIn) {
    paymentType.value = "full";
    paymentType.disabled = true;
    paymentType.title = "Walk-in reservations are cash and full payment only.";
  }

  if (proofReference) {
    proofReference.required = requiresProof;
    proofReference.disabled = isWalkIn;

    if (isWalkIn) {
      proofReference.value = "";
      proofReference.placeholder = "Not required for walk-in cash payment";
    } else {
      proofReference.placeholder = "Example: 123456789012";
    }
  }

  if (proofImage) {
    proofImage.required = requiresProof;
    proofImage.disabled = isWalkIn;

    if (isWalkIn) {
      proofImage.value = "";
    }
  }

  if (proofPreview && isWalkIn) {
    proofPreview.style.display = "none";
    proofPreview.src = "";
  }

  if (referenceGroup) {
    referenceGroup.style.display = isWalkIn ? "none" : "flex";
  }

  if (proofGroup) {
    proofGroup.style.display = isWalkIn ? "none" : "flex";
  }

  if (referenceRequiredText) {
    referenceRequiredText.textContent = requiresProof ? " *Required" : " (Not needed)";
    referenceRequiredText.style.color = requiresProof ? "#dc2626" : "#64748b";
  }

  if (proofRequiredText) {
    proofRequiredText.textContent = requiresProof ? " *Required" : " (Not needed)";
    proofRequiredText.style.color = requiresProof ? "#dc2626" : "#64748b";
  }

  if (methodHelp) {
    methodHelp.textContent = isWalkIn
      ? "Walk-in reservations use Cash only and are automatically recorded as full payment."
      : "Facebook/Messenger reservations use GCash or PayMaya and require reference number plus proof screenshot.";
  }

  if (paymentRuleNote) {
    paymentRuleNote.innerHTML = isWalkIn
      ? `
        <strong>Walk-in Rule:</strong><br />
        Walk-in guests are already onsite, so the payment method is Cash only,
        full payment only, and the reservation will be automatically checked in
        after submission.
      `
      : `
        <strong>Facebook/Messenger Rule:</strong><br />
        Since this is a Facebook/Messenger reservation, only GCash or PayMaya is
        allowed. The admin must enter the transaction reference number and upload
        the proof screenshot before submitting.
      `;
  }

  updatePaymentBreakdown();
}

// ============================================================
// SECTION 10: Payment breakdown
// Computes full/downpayment, remaining balance, and front desk reminder.
// ============================================================

function updatePaymentBreakdown() {
  computedTotals = computeTotals();

  const paymentType = document.getElementById("paymentType")?.value || "full";

  const paidAmount =
    paymentType === "full"
      ? computedTotals.accommodationTotal
      : computedTotals.requiredDownpayment;

  const remainingBalance = Math.max(
    computedTotals.accommodationTotal - paidAmount,
    0
  );

  const frontDeskReminder = remainingBalance + computedTotals.estimatedEntranceFee;

  computedTotals.paidAmount = paidAmount;
  computedTotals.remainingBalance = remainingBalance;

  setText(
    "paymentAccommodationTotal",
    `₱${formatMoney(computedTotals.accommodationTotal)}`
  );
  setText("paymentDownpayment", `₱${formatMoney(computedTotals.requiredDownpayment)}`);
  setText("paymentPaidAmount", `₱${formatMoney(paidAmount)}`);
  setText("paymentRemaining", `₱${formatMoney(remainingBalance)}`);
  setText("paymentEntranceFee", `₱${formatMoney(computedTotals.estimatedEntranceFee)}`);
  setText("paymentFrontDeskReminder", `₱${formatMoney(frontDeskReminder)}`);
}

// ============================================================
// SECTION 11: Submit manual reservation
// Sends draft + payment information to backend.
// ============================================================

async function submitManualReservation(e) {
  e.preventDefault();

  if (isSubmittingManualReservation) {
    return;
  }

  if (!walkInDraft) {
    showMessage("Missing manual reservation draft.", "error");
    return;
  }

  const paymentMethod = document.getElementById("paymentMethod").value;
  const paymentTypeSelect = document.getElementById("paymentType");
  const isWalkIn = isWalkInManualReservation();
  const paymentType = isWalkIn ? "full" : paymentTypeSelect.value;
  const proofReference = document.getElementById("proofReference").value.trim();
  const proofImage = document.getElementById("proofImage").files[0] || null;
  const paymentNote = document.getElementById("paymentNote").value.trim();
  const requiresProof = !isWalkIn && isProofRequired(paymentMethod);

  if (isWalkIn && paymentMethod !== "cash") {
    showMessage("Walk-in reservations must use cash payment only.", "error");
    return;
  }

  if (!isWalkIn && !["gcash", "paymaya"].includes(paymentMethod)) {
    showMessage("Facebook/Messenger reservations must use GCash or PayMaya only.", "error");
    return;
  }

  if (requiresProof && !proofReference) {
    showMessage(
      "Reference number is required for PayMaya, or GCash.",
      "error"
    );
    return;
  }

  if (requiresProof && !proofImage) {
    showMessage(
      "Proof screenshot is required for PayMaya, or GCash.",
      "error"
    );
    return;
  }

  const payload = {
    ...walkInDraft,
    reservation_type: getManualReservationType(),
    payment_method: paymentMethod,
    payment_type: paymentType,
    proof_reference: proofReference || null,
    note: combineNotes(walkInDraft.note, paymentNote),
  };

  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));

  if (proofImage) {
    formData.append("proof_image", proofImage);
  }

  const submitBtn = document.getElementById("submitPaymentBtn");
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

    const response = await fetch(`${API_BASE}/bookings/walk-in`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create manual reservation.");
    }

    sessionStorage.removeItem(ADMIN_WALKIN_DRAFT_KEY);
    sessionStorage.setItem(ADMIN_WALKIN_SUCCESS_RESET_KEY, "1");

    showMessage(
      data.message || "Manual reservation created successfully.",
      "success"
    );

    showManualReservationSuccessModal({
      bookingId: data.bookingId,
      reservationCode: data.reservationCode,
      paymentMethod,
      paymentType,
      paidAmount: computedTotals.paidAmount,
      remainingBalance: computedTotals.remainingBalance,
      reservationType: getManualReservationType(),
    });
  } catch (error) {
    console.error("submitManualReservation error:", error);
    isSubmittingManualReservation = false;

    const errorMessage =
      error.message || "Failed to create manual reservation.";

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
// SECTION 12: Success popup
// Confirms that the manual reservation was saved.
// ============================================================

function showManualReservationSuccessModal(details = {}) {
  ensureSuccessModalStyles();

  const existingModal = document.getElementById("manualReservationSuccessModal");
  if (existingModal) {
    existingModal.remove();
  }

  const bookingId = details.bookingId;
  const reservationCode = details.reservationCode || `#${bookingId || "-"}`;
  const paymentType =
    details.paymentType === "full" ? "Full Payment" : "50% Down Payment";

  const modal = document.createElement("div");
  modal.id = "manualReservationSuccessModal";
  modal.className = "manual-success-modal show";

  modal.innerHTML = `
    <div class="manual-success-backdrop"></div>

    <div class="manual-success-box" role="dialog" aria-modal="true">
      <div class="manual-success-icon">✓</div>

      <h2>Manual Reservation Created</h2>

      <p>
        The manual reservation has been successfully saved in the system.
      </p>

      <div class="manual-success-details">
        <div>
          <span>Reservation Code</span>
          <strong>${escapeHtml(reservationCode)}</strong>
        </div>

        <div>
          <span>Reservation Type</span>
          <strong>${escapeHtml(formatManualReservationType(details.reservationType || getManualReservationType()))}</strong>
        </div>

        <div>
          <span>Payment Type</span>
          <strong>${escapeHtml(paymentType)}</strong>
        </div>

        <div>
          <span>Paid Amount</span>
          <strong>₱${formatMoney(details.paidAmount || 0)}</strong>
        </div>

        <div>
          <span>Remaining Balance</span>
          <strong>₱${formatMoney(details.remainingBalance || 0)}</strong>
        </div>
      </div>

      <div class="manual-success-actions">
        <button type="button" class="manual-success-primary" id="successViewReceiptBtn">
          View Receipt
        </button>

        <button type="button" class="manual-success-secondary" id="successCreateAnotherBtn">
          Create Another
        </button>

        <button type="button" class="manual-success-secondary" id="successDashboardBtn">
          Back to Dashboard
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  const viewReceiptBtn = document.getElementById("successViewReceiptBtn");
  const createAnotherBtn = document.getElementById("successCreateAnotherBtn");
  const dashboardBtn = document.getElementById("successDashboardBtn");

  if (viewReceiptBtn) {
    viewReceiptBtn.addEventListener("click", () => {
      if (bookingId) {
        window.location.href = `admin-booking-receipt.html?id=${bookingId}`;
      } else {
        window.location.href = "admin.html";
      }
    });
  }

  if (createAnotherBtn) {
    createAnotherBtn.addEventListener("click", () => {
      sessionStorage.removeItem(ADMIN_WALKIN_DRAFT_KEY);
      sessionStorage.setItem(ADMIN_WALKIN_SUCCESS_RESET_KEY, "1");
      window.location.href = "admin-walkin.html?new=1";
    });
  }

  if (dashboardBtn) {
    dashboardBtn.addEventListener("click", () => {
      window.location.href = "admin.html";
    });
  }
}

function ensureSuccessModalStyles() {
  if (document.getElementById("manualReservationSuccessModalStyle")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "manualReservationSuccessModalStyle";

  style.textContent = `
    .manual-success-modal {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 18px;
    }

    .manual-success-modal.show {
      display: flex;
    }

    .manual-success-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(6px);
    }

    .manual-success-box {
      position: relative;
      z-index: 1;
      width: min(94vw, 520px);
      background: #ffffff;
      border-radius: 28px;
      padding: 28px;
      text-align: center;
      border: 1px solid rgba(226, 232, 240, 0.96);
      box-shadow: 0 26px 70px rgba(15, 23, 42, 0.28);
    }

    .manual-success-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 14px;
      border-radius: 999px;
      background: #dcfce7;
      color: #166534;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 950;
      border: 1px solid #bbf7d0;
    }

    .manual-success-box h2 {
      margin: 0 0 8px;
      color: #0f172a;
      font-size: 1.55rem;
    }

    .manual-success-box p {
      margin: 0;
      color: #64748b;
      line-height: 1.55;
    }

    .manual-success-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 20px 0;
      text-align: left;
    }

    .manual-success-details div {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 12px;
    }

    .manual-success-details span {
      display: block;
      color: #64748b;
      font-size: 0.78rem;
      font-weight: 800;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .manual-success-details strong {
      color: #0f172a;
      font-size: 0.96rem;
    }

    .manual-success-actions {
      display: grid;
      gap: 10px;
    }

    .manual-success-primary,
    .manual-success-secondary {
      border: none;
      border-radius: 999px;
      padding: 12px 16px;
      font-weight: 950;
      cursor: pointer;
      transition: 0.2s ease;
    }

    .manual-success-primary {
      background: linear-gradient(135deg, #0f766e, #14b8a6);
      color: #ffffff;
      box-shadow: 0 12px 22px rgba(20, 184, 166, 0.18);
    }

    .manual-success-secondary {
      background: #e2e8f0;
      color: #0f172a;
    }

    .manual-success-primary:hover,
    .manual-success-secondary:hover {
      transform: translateY(-1px);
    }

    @media (max-width: 520px) {
      .manual-success-box {
        padding: 22px;
        border-radius: 22px;
      }

      .manual-success-details {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}

// ============================================================
// SECTION 12: Error popup
// Clearly shows why manual reservation was not created.
// ============================================================

function showReservationErrorModal(message) {
  ensureReservationErrorModalStyles();

  let modal = document.getElementById("manualReservationErrorModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "manualReservationErrorModal";
    modal.className = "manual-error-modal";

    modal.innerHTML = `
      <div class="manual-error-backdrop"></div>

      <div class="manual-error-box" role="dialog" aria-modal="true">
        <div class="manual-error-icon">!</div>

        <h2>Reservation Not Created</h2>

        <p id="manualReservationErrorText"></p>

        <div class="manual-error-actions">
          <button type="button" id="closeManualErrorBtn">
            Okay, I Understand
          </button>

          <a href="admin-walkin.html" id="editManualReservationBtn">
            Edit Reservation
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = document.getElementById("closeManualErrorBtn");
    const backdrop = modal.querySelector(".manual-error-backdrop");

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

  const messageText = document.getElementById("manualReservationErrorText");

  if (messageText) {
    messageText.textContent =
      message ||
      "The reservation could not be created. Please review the reservation details.";
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function ensureReservationErrorModalStyles() {
  if (document.getElementById("manualReservationErrorModalStyle")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "manualReservationErrorModalStyle";

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
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.3);
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
    }

    #closeManualErrorBtn {
      background: #fee2e2;
      color: #991b1b;
    }

    #editManualReservationBtn {
      background: linear-gradient(135deg, #0f766e, #14b8a6);
      color: white;
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
// SECTION 13: Payment method rule
// Returns true if transaction reference/proof is required.
// ============================================================

function isProofRequired(method) {
  const value = String(method || "").toLowerCase();
  return ["gcash", "paymaya"].includes(value);
}

// ============================================================
// SECTION 13: Proof screenshot preview
// Shows selected proof image before submit.
// ============================================================

function previewProofImage() {
  const input = document.getElementById("proofImage");
  const preview = document.getElementById("proofPreview");

  if (!input || !preview) return;

  const file = input.files[0];

  if (!file) {
    preview.style.display = "none";
    preview.src = "";
    return;
  }

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
}

// ============================================================
// SECTION 14: Compute totals
// Computes accommodation total, downpayment, entrance fee.
// ============================================================

function getStayDuration(item) {
  return Math.max(1, Math.min(5, Number(item?.stay_duration || 1)));
}

function computeTotals() {
  const items = Array.isArray(walkInDraft?.items) ? walkInDraft.items : [];
  const guestCount = Number(walkInDraft?.guest_count || 0);
  const entranceType = walkInDraft?.entrance_type || "pool_beach";

  let accommodationTotal = 0;
  let hasOvernightStyle = false;

  items.forEach((item) => {
    const accommodation = getAccommodationById(item.accommodation_id);
    if (!accommodation) return;

    const slot = getSlotOptions(accommodation).find(
      (slotItem) => slotItem.value === item.slot_type
    );

    if (!slot) return;

    accommodationTotal += Number(slot.price || 0) * getStayDuration(item);

    if (item.slot_type === "overnight" || item.slot_type === "extended") {
      hasOvernightStyle = true;
    }
  });

  const totalFreeEntrancePax = getTotalFreeEntrancePax(items, guestCount);
  const chargeableGuests = Math.max(guestCount - totalFreeEntrancePax, 0);

  const entranceRate =
    entranceType === "beach_only"
      ? hasOvernightStyle
        ? 200
        : 150
      : hasOvernightStyle
        ? 300
        : 250;

  const estimatedEntranceFee = chargeableGuests * entranceRate;
  const requiredDownpayment = accommodationTotal * 0.5;

  return {
    accommodationTotal,
    requiredDownpayment,
    estimatedEntranceFee,
    paidAmount: 0,
    remainingBalance: accommodationTotal,
  };
}

// ============================================================
// SECTION 15: Entrance fee free pax helper
// Deducts free entrance pax from total guests.
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

// ============================================================
// SECTION 16: Accommodation helpers
// Gets accommodation data and slot options.
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
  const isRoom = category === "room";

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
// SECTION 17: Checkout date helper
// Handles overnight/extended schedules crossing midnight.
// ============================================================

function calculateCheckOutDate(checkInDate, startTime, endTime, stayDuration = 1) {
  if (!checkInDate || !startTime || !endTime) {
    return checkInDate || "-";
  }

  const startParts = String(startTime).split(":");
  const endParts = String(endTime).split(":");

  if (startParts.length < 2 || endParts.length < 2) {
    return checkInDate;
  }

  const startMinutes = Number(startParts[0]) * 60 + Number(startParts[1]);
  const endMinutes = Number(endParts[0]) * 60 + Number(endParts[1]);
  const cleanDuration = Math.max(1, Math.min(5, Number(stayDuration || 1)));
  const daysToAdd = cleanDuration > 1 ? cleanDuration : endMinutes <= startMinutes ? 1 : 0;

  if (daysToAdd > 0) {
    const date = new Date(`${checkInDate}T00:00:00`);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split("T")[0];
  }

  return checkInDate;
}

// ============================================================
// SECTION 18: Combine notes
// Combines guest note and admin payment note.
// ============================================================

function combineNotes(originalNote, paymentNote) {
  const parts = [];

  if (originalNote) {
    parts.push(originalNote);
  }

  if (paymentNote) {
    parts.push(`Admin Payment Note: ${paymentNote}`);
  }

  return parts.join(" | ");
}

// ============================================================
// SECTION 19: Text setter
// Safely updates text content by ID.
// ============================================================

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

// ============================================================
// SECTION 20: Format helpers
// Formats payment method, entrance type, money, time, date, text.
// ============================================================

function formatPaymentMethod(method) {
  if (method === "gcash") return "GCash";
  if (method === "paymaya") return "PayMaya";
  if (method === "cash") return "Cash";


  return capitalize(method);
}

function formatEntranceType(type) {
  if (type === "beach_only") return "Beach Entrance Only";
  return "Pool & Beach Entrance";
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

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString();
}

function capitalize(text) {
  if (!text) return "";

  const value = String(text);
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function showMessage(message, type = "success") {
  const messageEl = document.getElementById("adminPaymentMessage");

  if (messageEl) {
    messageEl.textContent = message;
    messageEl.style.color = type === "error" ? "#dc2626" : "#047857";
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