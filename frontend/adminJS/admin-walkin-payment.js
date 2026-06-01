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

let walkInDraft = null;
let availableAccommodations = [];

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
      <strong>Guest Count:</strong> ${Number(walkInDraft.guest_count || 0)}
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

  const checkOutDate = calculateCheckOutDate(
    item.check_in_date,
    slot?.start,
    slot?.end
  );

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

      <strong>Price:</strong>
      ₱${formatMoney(slot?.price || 0)}
    </div>
  `;
}

// ============================================================
// SECTION 9: Payment requirements UI
// Makes proof/reference required for electronic payments.
// ============================================================

function updatePaymentRequirementUI() {
  const method = document.getElementById("paymentMethod")?.value || "cash";
  const methodHelp = document.getElementById("paymentMethodHelp");
  const referenceRequiredText = document.getElementById("referenceRequiredText");
  const proofRequiredText = document.getElementById("proofRequiredText");
  const proofReference = document.getElementById("proofReference");
  const proofImage = document.getElementById("proofImage");
  const paymentRuleNote = document.getElementById("paymentRuleNote");

  const requiresProof = isProofRequired(method);

  if (proofReference) {
    proofReference.required = requiresProof;
  }

  if (proofImage) {
    proofImage.required = requiresProof;
  }

  if (referenceRequiredText) {
    referenceRequiredText.textContent = requiresProof ? " *Required" : " (Optional)";
    referenceRequiredText.style.color = requiresProof ? "#dc2626" : "#64748b";
  }

  if (proofRequiredText) {
    proofRequiredText.textContent = requiresProof ? " *Required" : " (Optional)";
    proofRequiredText.style.color = requiresProof ? "#dc2626" : "#64748b";
  }

  if (methodHelp) {
    methodHelp.textContent = requiresProof
      ? "Reference number and proof screenshot are required for this payment method."
      : "Cash payment does not require uploaded proof.";
  }

  if (paymentRuleNote) {
    paymentRuleNote.innerHTML = requiresProof
      ? `
        <strong>Payment Rule:</strong><br />
        Since ${formatPaymentMethod(method)} is selected, the admin must enter
        the transaction reference number and upload the proof screenshot sent by
        the customer.
      `
      : `
        <strong>Payment Rule:</strong><br />
        Since Cash is selected, proof screenshot and reference number are
        optional because the payment is personally verified at the front desk.
      `;
  }
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

  if (!walkInDraft) {
    showMessage("Missing manual reservation draft.", "error");
    return;
  }

  const paymentMethod = document.getElementById("paymentMethod").value;
  const paymentType = document.getElementById("paymentType").value;
  const proofReference = document.getElementById("proofReference").value.trim();
  const proofImage = document.getElementById("proofImage").files[0] || null;
  const paymentNote = document.getElementById("paymentNote").value.trim();
  const requiresProof = isProofRequired(paymentMethod);

  if (requiresProof && !proofReference) {
    showMessage(
      "Reference number is required for PayMaya, or Gcash.",
      "error"
    );
    return;
  }

  if (requiresProof && !proofImage) {
    showMessage(
      "Proof screenshot is required for PayMaya, or Gcash.",
      "error"
    );
    return;
  }

  const payload = {
    ...walkInDraft,
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
  const originalText = submitBtn ? submitBtn.textContent : "Submit Manual Reservation";

  try {
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

    showMessage(data.message || "Manual reservation created successfully.", "success");

    setTimeout(() => {
      window.location.href = `admin-booking-receipt.html?id=${data.bookingId}`;
    }, 900);
  } catch (error) {
    console.error("submitManualReservation error:", error);
    showMessage(error.message || "Failed to create manual reservation.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
    }
  }
}

// ============================================================
// SECTION 12: Payment method rule
// Returns true if transaction reference/proof is required.
// ============================================================

function isProofRequired(method) {
  const value = String(method || "").toLowerCase();
  return ["gcash", "paymaya", "bank_transfer"].includes(value);
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

    accommodationTotal += Number(slot.price || 0);

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

function calculateCheckOutDate(checkInDate, startTime, endTime) {
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

  if (endMinutes <= startMinutes) {
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + 1);
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