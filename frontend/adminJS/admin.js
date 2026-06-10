// ============================================================
// SMARTRESORT ADMIN DASHBOARD SCRIPT
// Purpose:
// - Load all reservations
// - Search/filter reservations
// - Staff-friendly reservation cards
// - View proof screenshot using Base64/file fallback
// - Quick admin actions: verify payment, check in / allow entry, and cancel
// ============================================================

let allBookings = [];

console.log("[admin-dashboard] PH TIME FIX V5 + VERIFY PAYMENT loaded.");

// ============================================================
// PH TIME FIX V5
// Treat backend/MySQL DATETIME as UTC, then display as Asia/Manila.
// ============================================================

function parseBackendDateTimeAsUtc(value) {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  if (raw.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(raw)) {
    const existingDate = new Date(raw);
    return Number.isNaN(existingDate.getTime()) ? null : existingDate;
  }

  const normalized = raw.replace(" ", "T");
  const utcDate = new Date(`${normalized}Z`);

  if (!Number.isNaN(utcDate.getTime())) {
    return utcDate;
  }

  const fallbackDate = new Date(raw);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

function formatPhilippineDateTime(value) {
  const date = parseBackendDateTimeAsUtc(value);
  if (!date) return "N/A";

  return date.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function getPhilippineDateKey(value) {
  const date = value ? parseBackendDateTimeAsUtc(value) : new Date();
  if (!date) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value || "0000";
  const month = parts.find((part) => part.type === "month")?.value || "00";
  const day = parts.find((part) => part.type === "day")?.value || "00";

  return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupEvents();
  loadBookings();
});

// ============================================================
// SECTION 1: Admin access
// ============================================================

function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (user.role !== "admin" && user.role !== "staff") {
    alert("Access denied. Admin only.");
    window.location.href = "../authHTML/login.html";
  }
}

// ============================================================
// SECTION 2: Events
// ============================================================

function setupEvents() {
  const logoutBtn = document.getElementById("logoutBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const paymentStatusFilter = document.getElementById("paymentStatusFilter");
  const paymentMethodFilter = document.getElementById("paymentMethodFilter");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem("user");
      showMessage("Logged out successfully.", "success");

      setTimeout(() => {
        window.location.href = "../authHTML/login.html";
      }, 600);
    });
  }

  if (refreshBtn) refreshBtn.addEventListener("click", loadBookings);
  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyFilters);
  if (paymentStatusFilter)
    paymentStatusFilter.addEventListener("change", applyFilters);
  if (paymentMethodFilter)
    paymentMethodFilter.addEventListener("change", applyFilters);
}

// ============================================================
// SECTION 3: Reservation container
// Replaces the old wide table content with clean reservation cards.
// ============================================================

function getReservationsContainer() {
  const oldTableBody = document.getElementById("adminBookingsTableBody");

  if (oldTableBody) {
    const tableWrap = oldTableBody.closest(".admin-table-wrap");

    if (tableWrap) {
      return tableWrap;
    }

    return oldTableBody;
  }

  return document.querySelector(".admin-table-wrap");
}

function setReservationsContent(html) {
  const container = getReservationsContainer();

  if (container) {
    container.innerHTML = html;
  }
}

// ============================================================
// SECTION 4: Load reservations
// ============================================================

async function loadBookings() {
  try {
    setReservationsContent(`
      <div class="reservation-state-box">
        Loading reservation records...
      </div>
    `);

    /*
      Load all reservation records so the search bar and status filter can still
      find completed/cancelled/rejected bookings. The dashboard will hide those
      closed bookings by default in applyFilters().
    */
    const response = await fetch(`${API_BASE}/bookings?scope=all`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch reservation records.");
    }

    allBookings = Array.isArray(data) ? data : data.bookings || [];

    updateSummaryCards(allBookings);
    applyFilters();
  } catch (error) {
    console.error("loadBookings error:", error);

    setReservationsContent(`
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

function updateSummaryCards(bookings) {
  const today = getPhilippineDateKey();

  const totalBookings = bookings.length;

  const partiallyPaidCount = bookings.filter((booking) => {
    return (
      String(booking.payment_status || "").toLowerCase() === "partially_paid"
    );
  }).length;

  const approvedCount = bookings.filter((booking) => {
    return String(booking.status || "").toLowerCase() === "approved";
  }).length;

  const paidCount = bookings.filter((booking) => {
    return String(booking.payment_status || "").toLowerCase() === "paid";
  }).length;

  const onlineToday = bookings.filter((booking) => {
    const createdDate = getPhilippineDateKey(booking.created_at);
    const source = String(booking.booking_source || "online").toLowerCase();

    return createdDate === today && source !== "manual";
  }).length;

  const walkinToday = bookings.filter((booking) => {
    const createdDate = getPhilippineDateKey(booking.created_at);
    const source = String(booking.booking_source || "").toLowerCase();

    return createdDate === today && source === "manual";
  }).length;

  const guestsInside = bookings
    .filter((booking) => {
      const status = String(booking.status || "").toLowerCase();
      const checkIn = String(booking.check_in || "").slice(0, 10);
      const checkOut = String(booking.check_out || "").slice(0, 10);

      return (
        status === "approved" &&
        isBookingCheckedIn(booking) &&
        checkIn <= today &&
        checkOut >= today
      );
    })
    .reduce((sum, booking) => sum + Number(booking.guests || 0), 0);

  const todayRevenue = bookings.reduce((sum, booking) => {
    return sum + calculateTodayCollectedRevenue(booking, today);
  }, 0);

  setText("totalBookings", totalBookings);
  setText("partiallyPaidCount", partiallyPaidCount);
  setText("approvedCount", approvedCount);
  setText("paidCount", paidCount);
  setText("onlineToday", onlineToday);
  setText("walkinToday", walkinToday);
  setText("guestsInside", guestsInside);
  setText("todayRevenue", `₱${formatMoney(todayRevenue)}`);
}

function isBookingCheckedIn(booking) {
  return (
    Number(booking.is_checked_in || 0) === 1 ||
    String(booking.is_checked_in || "").toLowerCase() === "true"
  );
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getReservationDateKey(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function getCheckInDateState(booking) {
  const today = getPhilippineDateKey();
  const checkInDate = getReservationDateKey(
    booking.check_in || booking.check_in_date,
  );

  if (!checkInDate) return "missing";
  if (checkInDate === today) return "today";
  if (checkInDate > today) return "future";
  return "past";
}

// ============================================================
// SECTION 6: Filters
// Default behavior:
// - Hide completed, cancelled, and rejected records on first load.
// - Still allow search and status filters to find those hidden records.
// ============================================================

function isClosedReservationStatus(status) {
  return ["completed", "cancelled", "rejected"].includes(
    String(status || "").toLowerCase(),
  );
}

function isActiveDashboardRecord(booking) {
  return !isClosedReservationStatus(booking.status);
}

function shouldUseDefaultActiveView(searchValue, statusValue) {
  return !searchValue && (!statusValue || statusValue === "active");
}

function applyFilters() {
  const searchValue = String(
    document.getElementById("searchInput")?.value || "",
  )
    .trim()
    .toLowerCase();

  const statusValue = String(
    document.getElementById("statusFilter")?.value || "active",
  )
    .trim()
    .toLowerCase();

  const paymentStatusValue = String(
    document.getElementById("paymentStatusFilter")?.value || "",
  )
    .trim()
    .toLowerCase();

  const paymentMethodValue = String(
    document.getElementById("paymentMethodFilter")?.value || "",
  )
    .trim()
    .toLowerCase();

  let filtered = [...allBookings];

  /*
    Default dashboard view:
    - No search + Active/Current filter = hide completed/cancelled/rejected.
    Search behavior:
    - If the admin types in the search bar, search across all loaded records,
      including completed/cancelled/rejected, unless a specific status filter is selected.
  */
  if (shouldUseDefaultActiveView(searchValue, statusValue)) {
    filtered = filtered.filter(isActiveDashboardRecord);
  }

  if (searchValue) {
    filtered = filtered.filter((booking) => {
      const searchableText = `
        ${booking.id || ""}
        ${booking.reservation_code || ""}
        ${getBookingDisplayName(booking) || ""}
        ${booking.phone || ""}
        ${booking.contact_no || ""}
        ${booking.email || ""}
        ${booking.room_name || ""}
        ${booking.accommodation_name || ""}
        ${booking.booking_source || ""}
        ${booking.payment_method || ""}
        ${booking.payment_status || ""}
        ${booking.status || ""}
        ${getPaymentReference(booking) || ""}
      `.toLowerCase();

      return searchableText.includes(searchValue);
    });
  }

  if (statusValue && statusValue !== "active" && statusValue !== "all") {
    filtered = filtered.filter((booking) => {
      return String(booking.status || "").toLowerCase() === statusValue;
    });
  }

  if (paymentStatusValue) {
    filtered = filtered.filter((booking) => {
      return (
        String(booking.payment_status || "").toLowerCase() ===
        paymentStatusValue
      );
    });
  }

  if (paymentMethodValue) {
    filtered = filtered.filter((booking) => {
      return (
        String(booking.payment_method || "").toLowerCase() ===
        paymentMethodValue
      );
    });
  }

  renderBookings(filtered);
}

// ============================================================
// SECTION 7: Render reservation cards
// ============================================================

function renderBookings(bookings) {
  if (!bookings.length) {
    setReservationsContent(`
      <div class="reservation-state-box">
        No reservations found for the selected search/filter.
      </div>
    `);
    return;
  }

  setReservationsContent(`
    <div class="reservation-card-list">
      ${bookings.map((booking) => renderReservationCard(booking)).join("")}
    </div>
  `);
}

function renderReservationCard(booking) {
  const bookingId = Number(booking.id);
  const bookingStatus = String(booking.status || "pending").toLowerCase();
  const paymentStatus = String(
    booking.payment_status || "pending",
  ).toLowerCase();
  const paymentMethod = String(booking.payment_method || "cash").toLowerCase();
  const bookingSource = String(
    booking.booking_source || "online",
  ).toLowerCase();
  const proofSource = getProofSource(booking);
  const paymentReference = getPaymentReference(booking);

  return `
    <article class="reservation-card">
      <div class="reservation-card-main">
        <div class="reservation-topline">
          <div>
            <div class="reservation-code">
              ${escapeHtml(booking.reservation_code || `#${bookingId}`)}
            </div>
            <div class="reservation-id">
              Reservation ID: #${escapeHtml(bookingId || "-")}
            </div>
          </div>

          <div class="reservation-badges">
            <span class="source-badge source-${bookingSource}">
              ${formatBookingSource(bookingSource)}
            </span>

            <span class="status-badge status-${bookingStatus}">
              ${capitalize(bookingStatus)}
            </span>

            <span class="payment-badge payment-${paymentStatus}">
              ${formatPaymentStatus(paymentStatus)}
            </span>

            ${renderCheckInBadge(booking)}
          </div>
        </div>

        <div class="reservation-info-grid">
          <section class="reservation-info-box">
            <div class="info-label">Customer</div>
            <div class="info-strong">${escapeHtml(getBookingDisplayName(booking))}</div>
            <div>${escapeHtml(booking.phone || "-")}</div>
            <div>${escapeHtml(booking.email || "-")}</div>
          </section>

          <section class="reservation-info-box">
            <div class="info-label">Stay Details</div>
            <div class="info-strong">${escapeHtml(booking.room_name || "N/A")}</div>
            <div>Check-in: ${formatDate(booking.check_in)} • ${formatTime(booking.check_in_time)}</div>
            <div>Check-out: ${formatDate(booking.check_out)} • ${formatTime(booking.check_out_time)}</div>
            <div>Stay Duration: ${escapeHtml(formatStayDuration(booking))}</div>
            <div>Guests: ${Number(booking.guests || 0)}</div>
          </section>

          <section class="reservation-info-box">
            <div class="info-label">Payment</div>
            <div>Total: <strong>₱${formatMoney(booking.accommodation_total)}</strong></div>
            <div>Downpayment: <strong class="${getPaymentAmountHighlightClass(booking, booking.required_downpayment)}">₱${formatMoney(booking.required_downpayment)}</strong></div>
            <div>Paid: <strong>₱${formatMoney(booking.paid_amount)}</strong></div>
            <div>Remaining: <strong class="${getPaymentAmountHighlightClass(booking, booking.remaining_balance)}">₱${formatMoney(booking.remaining_balance)}</strong></div>            
            <div>Entrance Fee: <strong>₱${formatMoney(booking.estimated_entrance_fee)}</strong></div>
            <div>Entrance Paid: <strong>${isEntranceFeePaid(booking) ? "Yes" : "No"}</strong></div>
            <div>Method: ${formatPaymentMethod(paymentMethod)}</div>
          </section>

          <section class="reservation-info-box">
            <div class="info-label">Reference</div>
            ${renderPaymentReference(paymentReference)}
          </section>
        </div>

        <div class="reservation-footer">
          <div class="created-text">
            Created: ${formatDateTime(booking.created_at)}
          </div>

          <div class="proof-area">
            ${renderProofButton(proofSource, booking.proof_of_payment)}
          </div>
        </div>
      </div>

      <div class="reservation-actions">
        <button
          type="button"
          class="action-btn receipt-btn"
          onclick="viewReceipt(${bookingId})"
        >
          Receipt
        </button>

        ${renderVerifyPaymentButton(
          booking,
          bookingId,
          bookingStatus,
          paymentStatus,
        )}

        ${renderCheckInButton(booking, bookingId, bookingStatus)}

        ${renderCancelButton(booking, bookingId, bookingStatus)}
      </div>
    </article>
  `;
}

// ============================================================
// SECTION 8: Button renderers
// ============================================================

function renderCheckInBadge(booking) {
  if (!isBookingCheckedIn(booking)) return "";

  return `
    <span class="payment-badge payment-paid">
      Checked In
    </span>
  `;
}

function isEntranceFeePaid(booking) {
  return (
    Number(booking.entrance_fee_paid || 0) === 1 ||
    Number(booking.entrance_fee_collected || 0) > 0 ||
    String(booking.entrance_fee_paid || "").toLowerCase() === "true"
  );
}

function isDateToday(value, today) {
  if (!value) return false;
  return getPhilippineDateKey(value) === today;
}

function isExtraBedPaid(booking) {
  return (
    Number(booking.extra_bed_paid || 0) === 1 ||
    String(booking.extra_bed_paid || "").toLowerCase() === "true"
  );
}

function calculateTodayCollectedRevenue(booking, today) {
  const createdToday = isDateToday(booking.created_at, today);
  const checkedInToday = isDateToday(booking.checked_in_at, today);
  const extraBedPaidToday = isDateToday(booking.extra_bed_paid_at, today);

  let amount = 0;

  if (checkedInToday) {
    amount += Number(booking.accommodation_total || booking.paid_amount || 0);
    amount += Number(booking.entrance_fee_collected || 0);
  } else if (createdToday) {
    amount += Number(booking.paid_amount || booking.required_downpayment || 0);
  }

  if (isExtraBedPaid(booking) && extraBedPaidToday) {
    amount += Number(booking.extra_bed_fee || 0);
  }

  return amount;
}

function renderVerifyPaymentButton(
  booking,
  bookingId,
  bookingStatus,
  paymentStatus,
) {
  const bookingSource = String(
    booking.booking_source || "online",
  ).toLowerCase();
  const proofSource = getProofSource(booking);
  const paymentReference = getPaymentReference(booking);

  if (bookingSource === "manual") {
    return "";
  }

  if (
    bookingStatus === "cancelled" ||
    bookingStatus === "completed" ||
    bookingStatus === "rejected" ||
    paymentStatus === "rejected" ||
    paymentStatus === "partially_paid" ||
    paymentStatus === "paid"
  ) {
    return "";
  }

  if (!proofSource && !paymentReference) {
    return `
      <button
        type="button"
        class="action-btn verify-payment-btn muted"
        disabled
        title="No uploaded proof or reference number is available for verification."
      >
        No Payment Proof
      </button>
    `;
  }

  return `
    <button
      type="button"
      class="action-btn verify-payment-btn"
      onclick="verifyPayment(${bookingId}, this)"
      title="Mark the submitted 50% GCash/Maya payment proof as valid."
    >
      Verify Payment
    </button>
  `;
}

function renderCheckInButton(booking, bookingId, bookingStatus) {
  const paymentStatus = String(booking.payment_status || "").toLowerCase();

  if (
    bookingStatus === "cancelled" ||
    bookingStatus === "completed" ||
    bookingStatus === "rejected" ||
    paymentStatus === "rejected"
  ) {
    return "";
  }

  if (isBookingCheckedIn(booking)) {
    return `
      <button
        type="button"
        class="action-btn verify-payment-btn muted"
        disabled
        title="This guest is already inside the resort."
      >
        Already Inside
      </button>
    `;
  }

  const checkInState = getCheckInDateState(booking);

  if (checkInState === "missing") {
    return `
      <button
        type="button"
        class="action-btn verify-payment-btn muted"
        disabled
        title="This reservation has no valid check-in date."
      >
        No Check-in Date
      </button>
    `;
  }

  if (paymentStatus === "pending" || paymentStatus === "unpaid") {
    return `
      <button
        type="button"
        class="action-btn verify-payment-btn muted"
        disabled
        title="Verify the customer's 50% downpayment proof first before check-in."
      >
        Verify Payment First
      </button>
    `;
  }

  if (checkInState === "future") {
    return `
      <button
        type="button"
        class="action-btn verify-payment-btn muted"
        disabled
        title="Check-in is only allowed on the scheduled check-in date."
      >
        Not Yet Check-in Date
      </button>
    `;
  }

  if (checkInState === "past") {
    return `
      <button
        type="button"
        class="action-btn verify-payment-btn muted"
        disabled
        title="The scheduled check-in date has already passed. Review this reservation manually."
      >
        Check-in Date Passed
      </button>
    `;
  }

  return `
    <button
      type="button"
      class="action-btn verify-payment-btn"
      onclick="checkInReservation(${bookingId}, this)"
      title="Collect remaining balance and entrance fee, then allow entry."
    >
      Check In / Allow Entry
    </button>
  `;
}

function renderCancelButton(booking, bookingId, bookingStatus) {
  // Once the guest is already checked in / inside the resort,
  // cancellation is no longer the correct action.
  // Staff should use Guests Inside → Check Out instead.
  if (
    isBookingCheckedIn(booking) ||
    bookingStatus === "cancelled" ||
    bookingStatus === "completed" ||
    bookingStatus === "rejected"
  ) {
    return "";
  }

  return `
    <button
      type="button"
      class="action-btn cancel-booking-btn"
      onclick="cancelReservation(${bookingId}, this)"
    >
      Cancel
    </button>
  `;
}

// ============================================================
// SECTION 9: Quick admin actions
// ============================================================

async function verifyPayment(bookingId, button) {
  const confirmed = confirm(
    "Mark this payment proof as valid? This will approve the reservation and record the 50% downpayment as partially paid.",
  );

  if (!confirmed) return;

  await runAdminAction(button, "Verifying...", async () => {
    await updatePaymentStatusOnly(bookingId, "partially_paid");

    showMessage(
      "Payment verified. Reservation is now approved and partially paid.",
      "success",
    );
  });
}

async function checkInReservation(bookingId, button) {
  const confirmed = confirm(
    "Check in this guest and allow entry? This will record the remaining 50% as paid, mark the entrance fee as collected, and show the guest in Guests Inside.",
  );

  if (!confirmed) return;

  await runAdminAction(button, "Checking in...", async () => {
    await checkInBooking(bookingId);
    showMessage("Guest checked in successfully.", "success");
  });
}

async function cancelReservation(bookingId, button) {
  const confirmed = confirm("Cancel this reservation?");
  if (!confirmed) return;

  await runAdminAction(button, "Cancelling...", async () => {
    await updateReservationStatusOnly(bookingId, "cancelled");
    await updatePaymentStatusOnly(bookingId, "unpaid");
    showMessage("Reservation cancelled successfully.", "success");
  });
}

async function runAdminAction(button, loadingText, actionCallback) {
  const originalButtonText = button ? button.textContent : "";

  try {
    if (button) {
      button.disabled = true;
      button.textContent = loadingText;
      button.style.opacity = "0.7";
      button.style.cursor = "not-allowed";
    }

    await actionCallback();
    await loadBookings();
  } catch (error) {
    console.error("runAdminAction error:", error);
    showMessage(error.message || "Failed to process action.", "error");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalButtonText;
      button.style.opacity = "1";
      button.style.cursor = "pointer";
    }
  }
}

async function updateReservationStatusOnly(bookingId, status) {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update reservation status.");
  }

  return data;
}

async function updatePaymentStatusOnly(bookingId, payment_status) {
  const response = await fetch(
    `${API_BASE}/bookings/${bookingId}/payment-status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payment_status }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update payment status.");
  }

  return data;
}

async function checkInBooking(bookingId) {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}/check-in`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to check in reservation.");
  }

  return data;
}

// ============================================================
// SECTION 10: Receipt
// ============================================================

function viewReceipt(bookingId) {
  window.location.href = `admin-booking-receipt.html?id=${bookingId}`;
}

// ============================================================
// SECTION 11: Payment reference
// ============================================================

function getPaymentReference(booking) {
  const directReference =
    booking.proof_reference ||
    booking.payment_reference ||
    booking.reference_number ||
    booking.transaction_reference;

  if (directReference) {
    return String(directReference).trim();
  }

  const note = String(booking.note || "");
  const match = note.match(/Reference Number:\s*([^|]+)/i);

  if (match && match[1]) {
    return match[1].trim();
  }

  return "";
}

function groupReferenceNumber(reference) {
  const cleanReference = String(reference || "")
    .replace(/\s+/g, "")
    .trim();

  if (!cleanReference) return [];

  return cleanReference.match(/.{1,4}/g) || [cleanReference];
}

function renderPaymentReference(reference) {
  if (!reference) {
    return `<span class="no-proof-text">No reference</span>`;
  }

  const groups = groupReferenceNumber(reference);

  return `
    <div class="reference-box">
      <div class="reference-chip-row">
        ${groups
          .map(
            (group) =>
              `<span class="reference-chip">${escapeHtml(group)}</span>`,
          )
          .join("")}
      </div>

      <div class="reference-full">${escapeHtml(reference)}</div>

      <button
        type="button"
        class="copy-ref-btn"
        onclick="copyReferenceNumber('${escapeForInline(reference)}')"
      >
        Copy Reference
      </button>
    </div>
  `;
}

async function copyReferenceNumber(reference) {
  try {
    await navigator.clipboard.writeText(reference);
    showMessage("Reference number copied.", "success");
  } catch (error) {
    console.error("copyReferenceNumber error:", error);

    const tempInput = document.createElement("input");
    tempInput.value = reference;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    tempInput.remove();

    showMessage("Reference number copied.", "success");
  }
}

// ============================================================
// SECTION 12: Proof screenshot
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

  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  let backendBase = "";

  if (typeof API_BASE !== "undefined" && API_BASE) {
    backendBase = String(API_BASE).replace(/\/api\/?$/, "");
  } else {
    backendBase = "http://127.0.0.1:5000";
  }

  if (value.startsWith("/uploads/")) {
    return `${backendBase}${value}`;
  }

  if (value.startsWith("uploads/")) {
    return `${backendBase}/${value}`;
  }

  return "";
}

function renderProofButton(proofUrl, rawProofPath = "") {
  if (!proofUrl) {
    const rawValue = String(rawProofPath || "").trim();

    if (rawValue) {
      return `<span class="no-proof-text">Invalid proof path</span>`;
    }

    return `<span class="no-proof-text">No proof</span>`;
  }

  return `
    <button
      type="button"
      class="proof-link-btn"
      onclick="openProofModal('${escapeForInline(proofUrl)}')"
    >
      View Proof
    </button>
  `;
}

function openProofModal(imageUrl) {
  let modal = document.getElementById("proofImageModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "proofImageModal";

    modal.innerHTML = `
      <div class="proof-modal-backdrop" onclick="closeProofModal()"></div>

      <div class="proof-modal-content">
        <button
          type="button"
          class="proof-modal-close"
          onclick="closeProofModal()"
          aria-label="Close proof modal"
        >
          ×
        </button>

        <div class="proof-modal-header">
          <h3>Proof of Payment</h3>
          <p>Check the screenshot and compare the reference number.</p>
        </div>

        <img id="proofModalImage" src="" alt="Proof of payment screenshot" />

        <p id="proofModalError" class="proof-modal-error" style="display:none;">
          Screenshot cannot be loaded. Please check the proof file or upload format.
        </p>
      </div>
    `;

    document.body.appendChild(modal);

    const style = document.createElement("style");
    style.id = "proofModalStyle";

    style.textContent = `
      #proofImageModal {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
      }

      #proofImageModal.show {
        display: flex;
      }

      .proof-modal-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(6px);
      }

      .proof-modal-content {
        position: relative;
        z-index: 1;
        width: min(92vw, 760px);
        max-height: 92vh;
        background: #ffffff;
        border-radius: 24px;
        padding: 20px;
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.35);
        border: 1px solid rgba(226, 232, 240, 0.95);
        overflow: auto;
      }

      .proof-modal-close {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 38px;
        height: 38px;
        border: none;
        border-radius: 999px;
        background: #ef4444;
        color: white;
        font-size: 1.4rem;
        font-weight: 900;
        cursor: pointer;
        line-height: 1;
      }

      .proof-modal-header {
        padding-right: 46px;
        margin-bottom: 14px;
      }

      .proof-modal-header h3 {
        margin: 0 0 4px;
        color: #0f172a;
        font-size: 1.25rem;
      }

      .proof-modal-header p {
        margin: 0;
        color: #64748b;
        font-size: 0.92rem;
        line-height: 1.5;
      }

      #proofModalImage {
        width: 100%;
        max-height: 68vh;
        object-fit: contain;
        display: block;
        border-radius: 18px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
      }

      .proof-modal-error {
        margin: 14px 0 0;
        padding: 14px 16px;
        border-radius: 14px;
        background: #fee2e2;
        color: #991b1b;
        font-weight: 800;
        line-height: 1.5;
      }

      @media (max-width: 600px) {
        .proof-modal-content {
          width: 96vw;
          padding: 16px;
          border-radius: 20px;
        }

        #proofModalImage {
          max-height: 62vh;
        }
      }
    `;

    document.head.appendChild(style);
  }

  const image = document.getElementById("proofModalImage");
  const errorText = document.getElementById("proofModalError");

  if (errorText) errorText.style.display = "none";

  if (image) {
    image.style.display = "block";
    image.src = "";

    image.onerror = () => {
      image.style.display = "none";
      if (errorText) errorText.style.display = "block";
    };

    image.onload = () => {
      if (errorText) errorText.style.display = "none";
      image.style.display = "block";
    };

    image.src = imageUrl;
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeProofModal() {
  const modal = document.getElementById("proofImageModal");

  if (modal) {
    modal.classList.remove("show");
  }

  document.body.style.overflow = "";
}

// ============================================================
// SECTION 13: Formatting helpers
// ============================================================

function getBookingDisplayName(booking) {
  return (
    booking.fullname ||
    [booking.first_name, booking.middle_name, booking.last_name]
      .filter(Boolean)
      .join(" ") ||
    "N/A"
  );
}

function formatBookingSource(source) {
  if (source === "manual") return "Manual";
  return "Online";
}

function formatDate(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-PH", {
    timeZone: "Asia/Manila",
  });
}

function formatTime(timeValue) {
  if (!timeValue) return "N/A";

  const timeText = String(timeValue).trim();
  const parts = timeText.split(":");

  if (parts.length < 2) return timeText;

  let hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) return timeText;

  const suffix = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${suffix}`;
}

function formatDateTime(dateValue) {
  return formatPhilippineDateTime(dateValue);
}

function formatStayDuration(booking) {
  const duration = Number(booking.stay_duration || 1);
  const slotLabel = String(booking.slot_label || "").toLowerCase();

  if (slotLabel.includes("22") || slotLabel.includes("23")) {
    return `${duration} ${duration === 1 ? "day" : "days"}`;
  }

  if (slotLabel.includes("overnight")) {
    return `${duration} ${duration === 1 ? "night" : "nights"}`;
  }

  return "1 day only";
}

function formatPaymentMethod(method) {
  if (method === "gcash") return "GCash";
  if (method === "paymaya") return "PayMaya / Maya";
  if (method === "cash") return "Cash";

  return capitalize(method);
}


function getPaymentAmountHighlightClass(booking, amountValue) {
  const amount = Number(amountValue || 0);
  const paymentStatus = String(booking?.payment_status || "").toLowerCase();

  if (amount <= 0 || paymentStatus === "paid") {
    return "payment-amount-green";
  }

  if (paymentStatus === "partially_paid") {
    return "payment-amount-yellow";
  }

  return "payment-amount-red";
}

function formatPaymentStatus(status) {
  if (status === "pending") return "Pending";
  if (status === "unpaid") return "Unpaid";
  if (status === "paid") return "Paid";
  if (status === "partially_paid") return "Partially Paid";
  if (status === "rejected") return "Rejected";

  return capitalize(status);
}

function formatMoney(value) {
  const num = Number(value || 0);

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function capitalize(text) {
  if (!text) return "";

  const value = String(text);
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}

function escapeForInline(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, " ");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
