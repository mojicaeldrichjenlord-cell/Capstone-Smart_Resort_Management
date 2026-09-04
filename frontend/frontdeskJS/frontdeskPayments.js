// ============================================================
// SMARTRESORT FRONT DESK PAYMENT MANAGEMENT
// File: frontend/frontdeskJS/frontdeskPayments.js
//
// Step 3E:
// - Front Desk role guard
// - Load payment/reservation records
// - Search/filter payment records
// - View GCash/Maya reference + proof
// - Verify valid online 50% downpayment proof
// - Monitor partially paid / paid / remaining balance
//
// Important:
// Remaining onsite balance collection is intentionally handled by
// the later Guest Check-In flow, not manually marked here.
// ============================================================

let allFrontDeskPayments = [];

// ============================================================
// SECTION 1: Startup
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const user = getLoggedInUser();

  if (!user) {
    window.location.href = "../authHTML/login.html";
    return;
  }

  const role = normalizeRole(user.role);

  if (role !== "frontdesk") {
    redirectByRole(role);
    return;
  }

  setupEvents();
  loadPayments();
});

// ============================================================
// SECTION 2: Role helpers
// ============================================================

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();

  if (value === "staff") {
    return "frontdesk";
  }

  return value;
}

function redirectByRole(role) {
  const routes = {
    customer: "../customerHTML/index.html",
    admin: "../adminHTML/admin.html",
    manager: "../managerHTML/managerDashboard.html",
    housekeeping: "../housekeepingHTML/housekeepingDashboard.html",
  };

  window.location.href = routes[role] || "../authHTML/login.html";
}

// ============================================================
// SECTION 3: Events
// ============================================================

function setupEvents() {
  document.getElementById("logoutBtn")?.addEventListener("click", (event) => {
    event.preventDefault();

    localStorage.removeItem("user");

    if (typeof showToast === "function") {
      showToast("Logged out successfully.", "success");
    }

    setTimeout(() => {
      window.location.href = "../authHTML/login.html";
    }, 500);
  });

  document.getElementById("refreshBtn")?.addEventListener("click", loadPayments);
  document.getElementById("searchInput")?.addEventListener("input", applyFilters);
  document
    .getElementById("paymentViewFilter")
    ?.addEventListener("change", applyFilters);
  document.getElementById("methodFilter")?.addEventListener("change", applyFilters);
  document.getElementById("sourceFilter")?.addEventListener("change", applyFilters);

  document.querySelectorAll("[data-close-proof]").forEach((element) => {
    element.addEventListener("click", closeProofModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProofModal();
    }
  });
}

// ============================================================
// SECTION 4: Load payment records
//
// Existing backend read endpoint:
// GET /api/bookings?scope=all
// ============================================================

async function loadPayments() {
  setRecordsContent(`
    <div class="payment-state-box">
      Loading payment records...
    </div>
  `);

  try {
    const response = await fetch(`${API_BASE}/bookings?scope=all`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load payment records.");
    }

    allFrontDeskPayments = Array.isArray(data)
      ? data
      : Array.isArray(data.bookings)
        ? data.bookings
        : [];

    updateSummary();
    applyFilters();
  } catch (error) {
    console.error("frontdesk loadPayments error:", error);

    setRecordsContent(`
      <div class="payment-state-box error">
        Failed to load payment records.
      </div>
    `);

    showMessage(
      error.message || "Failed to load payment records.",
      "error",
    );
  }
}

// ============================================================
// SECTION 5: Summary
// ============================================================

function updateSummary() {
  const needsVerification = allFrontDeskPayments.filter(
    needsPaymentVerification,
  ).length;

  const partiallyPaid = allFrontDeskPayments.filter(
    (booking) => getPaymentStatus(booking) === "partially_paid",
  ).length;

  const paid = allFrontDeskPayments.filter(
    (booking) => getPaymentStatus(booking) === "paid",
  ).length;

  const remaining = allFrontDeskPayments.reduce((sum, booking) => {
    const status = getReservationStatus(booking);

    if (["cancelled", "completed", "rejected"].includes(status)) {
      return sum;
    }

    return sum + toMoney(booking.remaining_balance);
  }, 0);

  setText("needsVerificationCount", needsVerification);
  setText("partiallyPaidCount", partiallyPaid);
  setText("paidCount", paid);
  setText("remainingBalanceTotal", `₱${formatMoney(remaining)}`);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value);
}

// ============================================================
// SECTION 6: Payment attention logic
// ============================================================

function needsPaymentVerification(booking) {
  const source = getBookingSource(booking);
  const paymentStatus = getPaymentStatus(booking);
  const reservationStatus = getReservationStatus(booking);
  const method = getPaymentMethod(booking);

  if (source !== "online") {
    return false;
  }

  if (!["gcash", "paymaya", "maya"].includes(method)) {
    return false;
  }

  if (!["pending", "unpaid"].includes(paymentStatus)) {
    return false;
  }

  if (["cancelled", "completed", "rejected"].includes(reservationStatus)) {
    return false;
  }

  return Boolean(getPaymentReference(booking) || getProofSource(booking));
}

// ============================================================
// SECTION 7: Filters
// ============================================================

function applyFilters() {
  const search = String(document.getElementById("searchInput")?.value || "")
    .trim()
    .toLowerCase();

  const paymentView = String(
    document.getElementById("paymentViewFilter")?.value || "attention",
  )
    .trim()
    .toLowerCase();

  const method = String(
    document.getElementById("methodFilter")?.value || "",
  )
    .trim()
    .toLowerCase();

  const source = String(
    document.getElementById("sourceFilter")?.value || "",
  )
    .trim()
    .toLowerCase();

  let filtered = [...allFrontDeskPayments];

  if (paymentView === "attention") {
    filtered = filtered.filter(needsPaymentVerification);
  } else if (paymentView === "pending") {
    filtered = filtered.filter((booking) =>
      ["pending", "unpaid"].includes(getPaymentStatus(booking)),
    );
  } else if (paymentView === "partially_paid") {
    filtered = filtered.filter(
      (booking) => getPaymentStatus(booking) === "partially_paid",
    );
  } else if (paymentView === "paid") {
    filtered = filtered.filter(
      (booking) => getPaymentStatus(booking) === "paid",
    );
  }

  if (method) {
    filtered = filtered.filter((booking) => {
      const bookingMethod = getPaymentMethod(booking);

      if (method === "paymaya") {
        return ["paymaya", "maya"].includes(bookingMethod);
      }

      return bookingMethod === method;
    });
  }

  if (source) {
    filtered = filtered.filter(
      (booking) => getBookingSource(booking) === source,
    );
  }

  if (search) {
    filtered = filtered.filter((booking) => {
      const searchable = [
        booking.id,
        booking.reservation_code,
        getGuestName(booking),
        booking.phone,
        booking.contact_no,
        booking.email,
        getPaymentReference(booking),
        getPaymentMethod(booking),
        getPaymentStatus(booking),
        getBookingSource(booking),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(search);
    });
  }

  renderPayments(filtered);
}

// ============================================================
// SECTION 8: Render
// ============================================================

function renderPayments(bookings) {
  const recordCount = document.getElementById("recordCount");

  if (recordCount) {
    recordCount.textContent = `${bookings.length} ${
      bookings.length === 1 ? "record" : "records"
    }`;
  }

  if (!bookings.length) {
    setRecordsContent(`
      <div class="payment-state-box">
        No payment records found for the selected filter.
      </div>
    `);

    return;
  }

  setRecordsContent(`
    <div class="frontdesk-payment-list">
      ${bookings.map(renderPaymentCard).join("")}
    </div>
  `);
}

function renderPaymentCard(booking) {
  const id = Number(booking.id || 0);
  const source = getBookingSource(booking);
  const paymentStatus = getPaymentStatus(booking);
  const reservationStatus = getReservationStatus(booking);
  const method = getPaymentMethod(booking);

  const reference = getPaymentReference(booking);
  const proof = getProofSource(booking);

  const accommodationTotal = toMoney(booking.accommodation_total);
  const requiredDownpayment = toMoney(booking.required_downpayment);
  const paidAmount = toMoney(booking.paid_amount);
  const remainingBalance = toMoney(booking.remaining_balance);

  const canVerify = needsPaymentVerification(booking);

  return `
    <article class="frontdesk-payment-card">
      <div class="payment-card-head">
        <div>
          <div class="reservation-code">
            ${escapeHtml(
              booking.reservation_code ||
                `Reservation #${booking.id || "-"}`,
            )}
          </div>

          <div class="reservation-id">
            Reservation ID: #${escapeHtml(booking.id || "-")}
          </div>
        </div>

        <div class="payment-badges">
          <span class="source-badge source-${escapeHtml(source)}">
            ${escapeHtml(formatSource(source))}
          </span>

          <span class="status-badge status-${escapeHtml(reservationStatus)}">
            ${escapeHtml(formatReservationStatus(reservationStatus))}
          </span>

          <span class="payment-badge payment-${escapeHtml(paymentStatus)}">
            ${escapeHtml(formatPaymentStatus(paymentStatus))}
          </span>
        </div>
      </div>

      <div class="payment-detail-grid">
        <section class="payment-detail-box">
          <span class="detail-label">Guest</span>
          <strong>${escapeHtml(getGuestName(booking))}</strong>
          <span>${escapeHtml(booking.phone || booking.contact_no || "-")}</span>
          ${
            booking.email
              ? `<span>${escapeHtml(booking.email)}</span>`
              : ""
          }
        </section>

        <section class="payment-detail-box">
          <span class="detail-label">Payment Breakdown</span>

          <span>
            Accommodation:
            <strong>₱${formatMoney(accommodationTotal)}</strong>
          </span>

          <span>
            Required 50%:
            <strong>₱${formatMoney(requiredDownpayment)}</strong>
          </span>

          <span>
            Paid:
            <strong>₱${formatMoney(paidAmount)}</strong>
          </span>

          <span>
            Remaining:
            <strong class="${remainingBalance > 0 ? "amount-attention" : ""}">
              ₱${formatMoney(remainingBalance)}
            </strong>
          </span>
        </section>

        <section class="payment-detail-box">
          <span class="detail-label">Payment Information</span>

          <span>
            Method:
            <strong>${escapeHtml(formatPaymentMethod(method))}</strong>
          </span>

          <span>
            Reference:
            <strong>${escapeHtml(reference || "No reference")}</strong>
          </span>

          <span>
            Source:
            <strong>${escapeHtml(formatSource(source))}</strong>
          </span>
        </section>

        <section class="payment-detail-box payment-proof-box">
          <span class="detail-label">Payment Proof</span>

          ${
            proof
              ? `
                <button
                  type="button"
                  class="proof-btn"
                  onclick="openProofModal(
                    '${escapeForInline(proof)}',
                    '${escapeForInline(
                      booking.reservation_code || `#${booking.id || "-"}`,
                    )}'
                  )"
                >
                  View Proof
                </button>
              `
              : `<span class="no-proof-text">No proof available</span>`
          }
        </section>
      </div>

      <div class="payment-card-footer">
        <div class="payment-record-note">
          ${
            canVerify
              ? "Submitted payment is waiting for Front Desk verification."
              : getPaymentRecordNote(booking)
          }
        </div>

        <div class="payment-actions">
          ${
            canVerify
              ? `
                <button
                  type="button"
                  class="btn-primary verify-payment-btn"
                  onclick="verifyPayment(${id}, this)"
                >
                  Verify 50% Downpayment
                </button>
              `
              : ""
          }
        </div>
      </div>
    </article>
  `;
}

function getPaymentRecordNote(booking) {
  const paymentStatus = getPaymentStatus(booking);

  if (paymentStatus === "partially_paid") {
    return "Downpayment verified. Remaining accommodation balance is collected during check-in.";
  }

  if (paymentStatus === "paid") {
    return "Accommodation payment is fully paid.";
  }

  if (paymentStatus === "rejected") {
    return "Payment/reservation was rejected.";
  }

  if (!getPaymentReference(booking) && !getProofSource(booking)) {
    return "No payment reference or proof is currently available.";
  }

  return "Payment record is available for monitoring.";
}

// ============================================================
// SECTION 9: Verify payment
//
// Existing backend endpoint:
// PUT /api/bookings/:id/payment-status
// body: { payment_status: "partially_paid" }
//
// Current backend behavior:
// - paid_amount = required_downpayment
// - remaining_balance = accommodation_total - downpayment
// - reservation_status = approved
// ============================================================

async function verifyPayment(bookingId, button) {
  if (!bookingId) {
    showMessage("Invalid reservation ID.", "error");
    return;
  }

  const confirmed = confirm(
    "Verify this payment proof? This will record the required 50% accommodation downpayment as paid and confirm the reservation.",
  );

  if (!confirmed) {
    return;
  }

  const originalText = button?.textContent || "Verify 50% Downpayment";

  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Verifying...";
    }

    const response = await fetch(
      `${API_BASE}/bookings/${bookingId}/payment-status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_status: "partially_paid",
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to verify payment.");
    }

    showMessage(
      "Payment verified. Reservation is confirmed and the 50% downpayment is recorded.",
      "success",
    );

    await loadPayments();
  } catch (error) {
    console.error("frontdesk verifyPayment error:", error);

    showMessage(
      error.message || "Failed to verify payment.",
      "error",
    );
  } finally {
    if (button && document.body.contains(button)) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

// ============================================================
// SECTION 10: Proof modal
// ============================================================

function openProofModal(imageUrl, reservationCode) {
  const modal = document.getElementById("proofModal");
  const image = document.getElementById("proofModalImage");
  const label = document.getElementById("proofModalReservation");

  if (!modal || !image) {
    return;
  }

  image.src = imageUrl;

  if (label) {
    label.textContent = reservationCode || "-";
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("proof-modal-open");
}

function closeProofModal() {
  const modal = document.getElementById("proofModal");
  const image = document.getElementById("proofModalImage");

  if (!modal) {
    return;
  }

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("proof-modal-open");

  if (image) {
    image.removeAttribute("src");
  }
}

// ============================================================
// SECTION 11: Data helpers
// ============================================================

function getBookingSource(booking) {
  return String(booking.booking_source || "online").toLowerCase();
}

function getPaymentMethod(booking) {
  return String(booking.payment_method || "").toLowerCase();
}

function getPaymentStatus(booking) {
  return String(booking.payment_status || "pending").toLowerCase();
}

function getReservationStatus(booking) {
  return String(
    booking.status || booking.reservation_status || "pending",
  ).toLowerCase();
}

function getGuestName(booking) {
  const direct =
    booking.customer_name ||
    booking.fullname ||
    booking.guest_name ||
    booking.name;

  if (direct) {
    return String(direct);
  }

  const parts = [
    booking.first_name,
    booking.middle_name,
    booking.last_name,
  ].filter(Boolean);

  return parts.join(" ").trim() || "Guest";
}

function getPaymentReference(booking) {
  const direct =
    booking.proof_reference ||
    booking.payment_reference ||
    booking.reference_number ||
    booking.transaction_reference;

  if (direct) {
    return String(direct).trim();
  }

  const note = String(booking.note || "");
  const match = note.match(/Reference Number:\s*([^|]+)/i);

  if (match?.[1]) {
    return match[1].trim();
  }

  // Current reservations may store the manual reference in
  // proof_of_payment when no uploaded file path exists.
  const rawProof = String(booking.proof_of_payment || "").trim();

  if (rawProof && !rawProof.includes("/") && /^\d+$/.test(rawProof)) {
    return rawProof;
  }

  return "";
}

// ============================================================
// SECTION 12: Proof helpers
// ============================================================

function getProofSource(booking) {
  const proofImageData = String(booking?.proof_image_data || "").trim();

  if (proofImageData.startsWith("data:image/")) {
    return proofImageData;
  }

  return getProofUrl(booking?.proof_of_payment);
}

function getProofUrl(proofPath) {
  const value = String(proofPath || "").trim();

  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  let backendBase = "http://127.0.0.1:5000";

  if (typeof API_BASE !== "undefined" && API_BASE) {
    backendBase = String(API_BASE).replace(/\/api\/?$/, "");
  }

  if (value.startsWith("/uploads/")) {
    return `${backendBase}${value}`;
  }

  if (value.startsWith("uploads/")) {
    return `${backendBase}/${value}`;
  }

  return "";
}

// ============================================================
// SECTION 13: Formatting helpers
// ============================================================

function formatSource(source) {
  return source === "manual" ? "Manual" : "Online";
}

function formatPaymentMethod(method) {
  const labels = {
    gcash: "GCash",
    paymaya: "Maya",
    maya: "Maya",
    cash: "Cash",
    walk_in: "Cash",
    other: "Other",
  };

  return labels[method] || titleCase(method || "-");
}

function formatReservationStatus(status) {
  const labels = {
    pending: "Pending",
    approved: "Reservation Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
  };

  return labels[status] || titleCase(status);
}

function formatPaymentStatus(status) {
  const labels = {
    pending: "Pending",
    unpaid: "Unpaid",
    partially_paid: "Partially Paid",
    paid: "Paid",
    rejected: "Rejected",
  };

  return labels[status] || titleCase(status);
}

function titleCase(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toMoney(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ============================================================
// SECTION 14: DOM helpers
// ============================================================

function setRecordsContent(html) {
  const container = document.getElementById("paymentRecords");

  if (container) {
    container.innerHTML = html;
  }
}

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
    return;
  }

  alert(message);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeForInline(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n");
}
