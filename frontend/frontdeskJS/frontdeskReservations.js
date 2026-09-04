// ============================================================
// SMARTRESORT FRONT DESK RESERVATION RECORDS
// File: frontend/frontdeskJS/frontdeskReservations.js
//
// Step 3D scope:
// - Front Desk role guard
// - Load all reservation records
// - Search/filter records
// - Read-only reservation cards
// - No approve/reject/cancel/payment/check-in write actions yet
// ============================================================

let allFrontDeskReservations = [];

// ============================================================
// SECTION 1: Page startup
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
  loadReservations();
});

// ============================================================
// SECTION 2: Role / account helpers
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

  document.getElementById("refreshBtn")?.addEventListener("click", loadReservations);
  document.getElementById("searchInput")?.addEventListener("input", applyFilters);
  document.getElementById("statusFilter")?.addEventListener("change", applyFilters);
  document
    .getElementById("paymentStatusFilter")
    ?.addEventListener("change", applyFilters);
  document.getElementById("sourceFilter")?.addEventListener("change", applyFilters);
}

// ============================================================
// SECTION 4: Load reservation records
//
// Uses the same existing booking read endpoint as the Admin dashboard.
// No backend changes are required for this read-only step.
// ============================================================

async function loadReservations() {
  setRecordsContent(`
    <div class="reservation-state-box">
      Loading reservation records...
    </div>
  `);

  try {
    const response = await fetch(`${API_BASE}/bookings?scope=all`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load reservation records.");
    }

    allFrontDeskReservations = Array.isArray(data)
      ? data
      : Array.isArray(data.bookings)
        ? data.bookings
        : [];

    updateSummaryCards();
    applyFilters();
  } catch (error) {
    console.error("frontdesk loadReservations error:", error);

    setRecordsContent(`
      <div class="reservation-state-box error">
        Failed to load reservation records.
      </div>
    `);

    showMessage(
      error.message || "Failed to load reservation records.",
      "error",
    );
  }
}

// ============================================================
// SECTION 5: Summary cards
// ============================================================

function updateSummaryCards() {
  const active = allFrontDeskReservations.filter(
    (booking) => !isClosedStatus(getReservationStatus(booking)),
  ).length;

  const pending = allFrontDeskReservations.filter(
    (booking) => getReservationStatus(booking) === "pending",
  ).length;

  const partiallyPaid = allFrontDeskReservations.filter(
    (booking) => getPaymentStatus(booking) === "partially_paid",
  ).length;

  const paid = allFrontDeskReservations.filter(
    (booking) => getPaymentStatus(booking) === "paid",
  ).length;

  setText("activeCount", active);
  setText("pendingCount", pending);
  setText("partiallyPaidCount", partiallyPaid);
  setText("paidCount", paid);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value);
}

// ============================================================
// SECTION 6: Filters
// ============================================================

function applyFilters() {
  const search = String(document.getElementById("searchInput")?.value || "")
    .trim()
    .toLowerCase();

  const status = String(
    document.getElementById("statusFilter")?.value || "active",
  )
    .trim()
    .toLowerCase();

  const paymentStatus = String(
    document.getElementById("paymentStatusFilter")?.value || "",
  )
    .trim()
    .toLowerCase();

  const source = String(
    document.getElementById("sourceFilter")?.value || "",
  )
    .trim()
    .toLowerCase();

  let filtered = [...allFrontDeskReservations];

  // Default active/current view.
  if (!search && status === "active") {
    filtered = filtered.filter(
      (booking) => !isClosedStatus(getReservationStatus(booking)),
    );
  }

  // Search all records when text is entered.
  if (search) {
    filtered = filtered.filter((booking) => {
      const searchable = [
        booking.id,
        booking.reservation_code,
        getGuestName(booking),
        booking.phone,
        booking.contact_no,
        booking.email,
        booking.room_name,
        booking.accommodation_name,
        booking.booking_source,
        booking.payment_method,
        getPaymentStatus(booking),
        getReservationStatus(booking),
        booking.proof_reference,
        booking.reference_number,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(search);
    });
  }

  if (status && status !== "active" && status !== "all") {
    filtered = filtered.filter(
      (booking) => getReservationStatus(booking) === status,
    );
  }

  if (paymentStatus) {
    filtered = filtered.filter(
      (booking) => getPaymentStatus(booking) === paymentStatus,
    );
  }

  if (source) {
    filtered = filtered.filter(
      (booking) =>
        String(booking.booking_source || "online").toLowerCase() === source,
    );
  }

  renderReservations(filtered);
}

// ============================================================
// SECTION 7: Render records
// ============================================================

function renderReservations(bookings) {
  const recordCount = document.getElementById("recordCount");

  if (recordCount) {
    recordCount.textContent = `${bookings.length} ${
      bookings.length === 1 ? "record" : "records"
    }`;
  }

  if (!bookings.length) {
    setRecordsContent(`
      <div class="reservation-state-box">
        No reservations found for the selected search/filter.
      </div>
    `);

    return;
  }

  setRecordsContent(`
    <div class="frontdesk-reservation-list">
      ${bookings.map(renderReservationCard).join("")}
    </div>
  `);
}

function renderReservationCard(booking) {
  const reservationStatus = getReservationStatus(booking);
  const paymentStatus = getPaymentStatus(booking);
  const source = String(booking.booking_source || "online").toLowerCase();

  const accommodationTotal = toMoney(
    booking.accommodation_total ?? booking.total_price ?? 0,
  );

  const requiredDownpayment = toMoney(
    booking.required_downpayment ?? booking.downpayment ?? 0,
  );

  const paidAmount = toMoney(booking.paid_amount ?? 0);
  const remainingBalance = toMoney(booking.remaining_balance ?? 0);

  const paymentMethod = formatPaymentMethod(booking.payment_method);

  return `
    <article class="frontdesk-reservation-card">
      <div class="reservation-card-head">
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

        <div class="reservation-badges">
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

      <div class="reservation-detail-grid">
        <section class="reservation-detail-box">
          <span class="detail-label">Guest</span>
          <strong>${escapeHtml(getGuestName(booking))}</strong>
          <span>${escapeHtml(booking.phone || booking.contact_no || "-")}</span>
          ${
            booking.email
              ? `<span>${escapeHtml(booking.email)}</span>`
              : ""
          }
        </section>

        <section class="reservation-detail-box">
          <span class="detail-label">Stay Details</span>
          <strong>${escapeHtml(getAccommodationName(booking))}</strong>
          <span>Check-in: ${escapeHtml(formatDate(booking.check_in || booking.check_in_date))}</span>
          <span>Check-out: ${escapeHtml(formatDate(booking.check_out || booking.check_out_date))}</span>
          <span>Guests: ${escapeHtml(booking.guests ?? booking.guest_count ?? "-")}</span>
        </section>

        <section class="reservation-detail-box">
          <span class="detail-label">Payment</span>
          <span>Total: <strong>₱${formatMoney(accommodationTotal)}</strong></span>
          <span>Downpayment: <strong>₱${formatMoney(requiredDownpayment)}</strong></span>
          <span>Paid: <strong>₱${formatMoney(paidAmount)}</strong></span>
          <span>Remaining: <strong>₱${formatMoney(remainingBalance)}</strong></span>
          <span>Method: ${escapeHtml(paymentMethod)}</span>
        </section>

        <section class="reservation-detail-box">
          <span class="detail-label">Record Information</span>
          <span>Source: ${escapeHtml(formatSource(source))}</span>
          <span>Created: ${escapeHtml(formatDateTime(booking.created_at))}</span>
          ${
            booking.created_by
              ? `<span>Created by Staff ID: ${escapeHtml(booking.created_by)}</span>`
              : ""
          }
        </section>
      </div>
    </article>
  `;
}

function setRecordsContent(html) {
  const container = document.getElementById("reservationRecords");

  if (container) {
    container.innerHTML = html;
  }
}

// ============================================================
// SECTION 8: Data helpers
// ============================================================

function getReservationStatus(booking) {
  return String(
    booking.status || booking.reservation_status || "pending",
  ).toLowerCase();
}

function getPaymentStatus(booking) {
  return String(booking.payment_status || "pending").toLowerCase();
}

function isClosedStatus(status) {
  return ["completed", "cancelled", "rejected"].includes(
    String(status || "").toLowerCase(),
  );
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

function getAccommodationName(booking) {
  return (
    booking.room_name ||
    booking.accommodation_name ||
    booking.accommodations ||
    "Accommodation"
  );
}

function formatSource(source) {
  return source === "manual" ? "Manual" : "Online";
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

function formatPaymentMethod(method) {
  const value = String(method || "-").toLowerCase();

  const labels = {
    gcash: "GCash",
    paymaya: "Maya",
    maya: "Maya",
    cash: "Cash",
    walk_in: "Cash",
    other: "Other",
  };

  return labels[value] || titleCase(value);
}

function titleCase(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// ============================================================
// SECTION 9: Date / money helpers
// ============================================================

function formatDate(value) {
  if (!value) return "-";

  const raw = String(value).slice(0, 10);
  const parts = raw.split("-");

  if (parts.length !== 3) {
    return String(value);
  }

  const date = new Date(`${raw}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "-";

  const raw = String(value).trim();

  let date;

  if (raw.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(raw)) {
    date = new Date(raw);
  } else {
    date = new Date(`${raw.replace(" ", "T")}Z`);
  }

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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
// SECTION 10: UI helpers
// ============================================================

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
    return;
  }

  alert(message);
}
