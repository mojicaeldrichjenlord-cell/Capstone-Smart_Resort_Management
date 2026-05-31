// ============================================================
// SMARTRESORT ADMIN DASHBOARD SCRIPT
// Purpose:
// - Load all reservations
// - Search/filter reservations
// - Update booking/payment status
// - Show payment reference number
// - View proof screenshot using popup modal
// - Sync reservation/payment dropdown status
// - Works from frontend/adminHTML/admin.html
// ============================================================

// ============================================================
// SECTION 1: Allowed reservation and payment statuses
// These arrays are used to generate dropdown options in the table.
// ============================================================

const BOOKING_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "completed",
];

const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "partially_paid",
  "rejected",
];

// ============================================================
// SECTION 2: Global variable for all booking records
// allBookings stores all reservations fetched from the backend.
// Filters will use this original list.
// ============================================================

let allBookings = [];

// ============================================================
// SECTION 3: Page startup
// Runs when the admin page is fully loaded.
// It checks admin access, sets button events, and loads bookings.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupEvents();
  loadBookings();
});

// ============================================================
// SECTION 4: Admin access checker
// This prevents normal customers from opening the admin dashboard.
// Since admin.html is now inside adminHTML, login/index paths need ../
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
// SECTION 5: Setup buttons and filter events
// This connects logout, refresh, search, and dropdown filters.
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
      }, 700);
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadBookings);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }

  if (paymentStatusFilter) {
    paymentStatusFilter.addEventListener("change", applyFilters);
  }

  if (paymentMethodFilter) {
    paymentMethodFilter.addEventListener("change", applyFilters);
  }
}

// ============================================================
// SECTION 6: Load all bookings from backend
// Fetches all reservations from /api/bookings and stores them.
// ============================================================

async function loadBookings() {
  const tbody = document.getElementById("adminBookingsTableBody");

  try {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="21" class="table-message">Loading reservations...</td>
        </tr>
      `;
    }

    const response = await fetch(`${API_BASE}/bookings`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch reservations.");
    }

    allBookings = Array.isArray(data) ? data : data.bookings || [];

    updateSummaryCards(allBookings);
    applyFilters();
  } catch (error) {
    console.error("loadBookings error:", error);

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="21" class="table-message">Failed to load reservations.</td>
        </tr>
      `;
    }

    showMessage(error.message || "Failed to load reservations.", "error");
  }
}

// ============================================================
// SECTION 7: Update dashboard summary cards
// Counts total, pending, approved, paid, today, walk-ins,
// guests inside, and today revenue.
// ============================================================

function updateSummaryCards(bookings) {
  const today = new Date().toISOString().slice(0, 10);

  const totalBookings = bookings.length;

  const pendingCount = bookings.filter(
    (booking) => String(booking.status || "").toLowerCase() === "pending",
  ).length;

  const approvedCount = bookings.filter(
    (booking) => String(booking.status || "").toLowerCase() === "approved",
  ).length;

  const paidCount = bookings.filter(
    (booking) => String(booking.payment_status || "").toLowerCase() === "paid",
  ).length;

  const todayBookings = bookings.filter((booking) => {
    const createdDate = String(booking.created_at || "").slice(0, 10);
    return createdDate === today;
  }).length;

  const walkinToday = bookings.filter((booking) => {
    const createdDate = String(booking.created_at || "").slice(0, 10);
    const source = String(booking.booking_source || "").toLowerCase();
    return createdDate === today && source === "manual";
  }).length;

  const guestsInside = bookings
    .filter((booking) => {
      const status = String(booking.status || "").toLowerCase();
      const checkIn = String(booking.check_in || "").slice(0, 10);
      const checkOut = String(booking.check_out || "").slice(0, 10);

      return status === "approved" && checkIn <= today && checkOut >= today;
    })
    .reduce((sum, booking) => sum + Number(booking.guests || 0), 0);

  const todayRevenue = bookings
    .filter((booking) => {
      const createdDate = String(booking.created_at || "").slice(0, 10);
      return createdDate === today;
    })
    .reduce((sum, booking) => {
      const paymentStatus = String(booking.payment_status || "").toLowerCase();

      if (paymentStatus === "paid" || paymentStatus === "partially_paid") {
        return (
          sum + Number(booking.paid_amount || booking.required_downpayment || 0)
        );
      }

      return sum;
    }, 0);

  const totalBookingsEl = document.getElementById("totalBookings");
  const pendingCountEl = document.getElementById("pendingCount");
  const approvedCountEl = document.getElementById("approvedCount");
  const paidCountEl = document.getElementById("paidCount");
  const todayBookingsEl = document.getElementById("todayBookings");
  const walkinTodayEl = document.getElementById("walkinToday");
  const guestsInsideEl = document.getElementById("guestsInside");
  const todayRevenueEl = document.getElementById("todayRevenue");

  if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
  if (pendingCountEl) pendingCountEl.textContent = pendingCount;
  if (approvedCountEl) approvedCountEl.textContent = approvedCount;
  if (paidCountEl) paidCountEl.textContent = paidCount;
  if (todayBookingsEl) todayBookingsEl.textContent = todayBookings;
  if (walkinTodayEl) walkinTodayEl.textContent = walkinToday;
  if (guestsInsideEl) guestsInsideEl.textContent = guestsInside;
  if (todayRevenueEl)
    todayRevenueEl.textContent = `₱${formatMoney(todayRevenue)}`;
}

// ============================================================
// SECTION 8: Search and filter logic
// Filters reservations by search text, status, payment status,
// and payment method.
// ============================================================

function applyFilters() {
  const searchValue = (document.getElementById("searchInput")?.value || "")
    .trim()
    .toLowerCase();

  const statusValue = (document.getElementById("statusFilter")?.value || "")
    .trim()
    .toLowerCase();

  const paymentStatusValue = (
    document.getElementById("paymentStatusFilter")?.value || ""
  )
    .trim()
    .toLowerCase();

  const paymentMethodValue = (
    document.getElementById("paymentMethodFilter")?.value || ""
  )
    .trim()
    .toLowerCase();

  let filtered = [...allBookings];

  if (searchValue) {
    filtered = filtered.filter((booking) => {
      const displayName = getBookingDisplayName(booking);

      const text = `
        ${booking.id || ""}
        ${booking.reservation_code || ""}
        ${displayName || ""}
        ${booking.phone || ""}
        ${booking.email || ""}
        ${booking.room_name || ""}
        ${booking.booking_source || ""}
        ${getPaymentReference(booking) || ""}
        ${booking.proof_of_payment || ""}
      `.toLowerCase();

      return text.includes(searchValue);
    });
  }

  if (statusValue) {
    filtered = filtered.filter(
      (booking) => String(booking.status || "").toLowerCase() === statusValue,
    );
  }

  if (paymentStatusValue) {
    filtered = filtered.filter(
      (booking) =>
        String(booking.payment_status || "").toLowerCase() ===
        paymentStatusValue,
    );
  }

  if (paymentMethodValue) {
    filtered = filtered.filter(
      (booking) =>
        String(booking.payment_method || "").toLowerCase() ===
        paymentMethodValue,
    );
  }

  renderBookings(filtered);
}

// ============================================================
// SECTION 9: Render admin booking table
// Creates all rows of the reservation table.
// ============================================================

function renderBookings(bookings) {
  const tbody = document.getElementById("adminBookingsTableBody");
  if (!tbody) return;

  if (!bookings.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="21" class="table-message">No reservations found.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bookings
    .map((booking) => {
      const bookingStatus = String(booking.status || "pending").toLowerCase();
      const paymentMethod = String(
        booking.payment_method || "cash",
      ).toLowerCase();
      const paymentStatus = String(
        booking.payment_status || "pending",
      ).toLowerCase();
      const bookingSource = String(
        booking.booking_source || "online",
      ).toLowerCase();
      const paymentReference = getPaymentReference(booking);
      const proofSource = getProofSource(booking);

      return `
        <tr>
          <td><strong>#${booking.id}</strong></td>

          <td><strong>${escapeHtml(booking.reservation_code || "-")}</strong></td>

          <td>
            <div class="source-badge source-${bookingSource}">
              ${formatBookingSource(bookingSource)}
            </div>
          </td>

          <td>
            <div style="font-weight:800;color:#0f172a;">
              ${escapeHtml(getBookingDisplayName(booking))}
            </div>
          </td>

          <td>${escapeHtml(booking.phone || "-")}</td>

          <td>${escapeHtml(booking.email || "-")}</td>

          <td>
            <div style="font-weight:700;color:#0f172a;">
              ${escapeHtml(booking.room_name || "N/A")}
            </div>
          </td>

          <td>${formatDate(booking.check_in)}</td>
          <td>${formatTime(booking.check_in_time)}</td>
          <td>${formatDate(booking.check_out)}</td>
          <td>${formatTime(booking.check_out_time)}</td>
          <td>${booking.guests || 0}</td>
          <td>₱${formatMoney(booking.accommodation_total)}</td>
          <td>₱${formatMoney(booking.required_downpayment)}</td>

          <td>
            <div class="status-badge status-${bookingStatus}">
              ${capitalize(bookingStatus)}
            </div>
          </td>

          <td>${formatPaymentMethod(paymentMethod)}</td>

          <td>${renderPaymentReference(paymentReference)}</td>

          <td>${renderProofButton(proofSource, booking.proof_of_payment)}</td>

          <td>
            <div class="payment-badge payment-${paymentStatus}">
              ${formatPaymentStatus(paymentStatus)}
            </div>
          </td>

          <td>${formatDateTime(booking.created_at)}</td>

          <td>
            ${renderActionButtons(booking)}
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderActionButtons(booking) {
  const bookingId = Number(booking.id);
  const bookingStatus = String(booking.status || "pending").toLowerCase();
  const paymentStatus = String(booking.payment_status || "pending").toLowerCase();

  const isClosed = ["cancelled", "rejected", "completed"].includes(bookingStatus);
  const isPaymentRejected = paymentStatus === "rejected";
  const isPaid = paymentStatus === "paid";
  const isPartiallyPaid = paymentStatus === "partially_paid";

  return `
    <div class="action-buttons simplified-actions">
      <button
        type="button"
        class="action-btn receipt-btn"
        onclick="viewReceipt(${bookingId})"
      >
        Receipt
      </button>

      ${
        !isClosed && !isPaymentRejected && !isPartiallyPaid && !isPaid
          ? `
            <button
              type="button"
              class="action-btn verify-payment-btn"
              onclick="verifyPayment(${bookingId})"
            >
              Verify Payment
            </button>
          `
          : ""
      }

      ${
        !isClosed && !isPaymentRejected
          ? `
            <button
              type="button"
              class="action-btn reject-payment-btn"
              onclick="rejectPayment(${bookingId})"
            >
              Reject Payment
            </button>
          `
          : ""
      }

      ${
        bookingStatus === "approved"
          ? `
            <button
              type="button"
              class="action-btn complete-booking-btn"
              onclick="completeReservation(${bookingId})"
            >
              Complete
            </button>
          `
          : ""
      }

      ${
        !isClosed
          ? `
            <button
              type="button"
              class="action-btn cancel-booking-btn"
              onclick="cancelReservation(${bookingId})"
            >
              Cancel
            </button>
          `
          : ""
      }
    </div>
  `;
}

// ============================================================
// SECTION 10: Sync reservation and payment dropdowns
// Keeps status dropdowns logically connected before saving.
// ============================================================

function setupStatusDropdownSync(bookings) {
  bookings.forEach((booking) => {
    const bookingSelect = document.getElementById(
      `bookingStatus-${booking.id}`,
    );
    const paymentSelect = document.getElementById(
      `paymentStatus-${booking.id}`,
    );

    if (!bookingSelect || !paymentSelect) return;

    bookingSelect.addEventListener("change", () => {
      const reservationStatus = bookingSelect.value;

      if (reservationStatus === "rejected") {
        paymentSelect.value = "rejected";
      }

      if (reservationStatus === "cancelled") {
        paymentSelect.value = "unpaid";
      }

      if (reservationStatus === "completed") {
        paymentSelect.value = "paid";
      }
    });

    paymentSelect.addEventListener("change", () => {
      const paymentStatus = paymentSelect.value;

      if (paymentStatus === "paid" || paymentStatus === "partially_paid") {
        if (bookingSelect.value === "pending") {
          bookingSelect.value = "approved";
        }
      }

      if (paymentStatus === "rejected") {
        bookingSelect.value = "rejected";
      }
    });
  });
}

// ============================================================
// SECTION 11: Extract payment reference number
// This finds the payment reference from possible fields.
// If not found in direct fields, it extracts from the note text.
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

// ============================================================
// SECTION 12: Group reference number for easier reading
// Example: 91728339131839 becomes [9172] [8339] [1318] [39]
// ============================================================

function groupReferenceNumber(reference) {
  const cleanReference = String(reference || "")
    .replace(/\s+/g, "")
    .trim();

  if (!cleanReference) {
    return [];
  }

  return cleanReference.match(/.{1,4}/g) || [cleanReference];
}

// ============================================================
// SECTION 13: Render highlighted reference number
// Shows reference number in small chips and includes a copy button.
// ============================================================

function renderPaymentReference(reference) {
  if (!reference) {
    return `<span class="no-proof-text">No reference</span>`;
  }

  const groups = groupReferenceNumber(reference);

  return `
    <div class="reference-box">
      <div class="reference-label">Reference No.</div>

      <div class="reference-chip-row">
        ${groups
          .map(
            (group) => `
              <span class="reference-chip">${escapeHtml(group)}</span>
            `,
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

// ============================================================
// SECTION 14: Build proof screenshot URL
// Converts uploaded proof path into a complete backend URL.
// If proof value is not an upload path, it will not show as image.
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

// ============================================================
// SECTION 15: Render proof screenshot button
// If proof path exists but is not image path, show clear message.
// ============================================================

function renderProofButton(proofUrl, rawProofPath = "") {
  if (!proofUrl) {
    const rawValue = String(rawProofPath || "").trim();

    if (rawValue) {
      return `
        <span class="no-proof-text">
          Invalid proof path
        </span>
      `;
    }

    return `<span class="no-proof-text">No proof</span>`;
  }

  return `
    <button
      type="button"
      class="proof-link-btn"
      onclick="openProofModal('${escapeForInline(proofUrl)}')"
    >
      View Screenshot
    </button>
  `;
}

// ============================================================
// SECTION 16: Proof screenshot modal
// Shows uploaded proof inside a popup with an X close button.
// If the image file is missing, it shows a clear error.
// ============================================================

function openProofModal(imageUrl) {
  let modal = document.getElementById("proofImageModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "proofImageModal";

    modal.innerHTML = `
      <div class="proof-modal-backdrop" onclick="closeProofModal()"></div>

      <div class="proof-modal-content">
        <button type="button" class="proof-modal-close" onclick="closeProofModal()">
          ×
        </button>

        <div class="proof-modal-header">
          <h3>Proof of Payment</h3>
          <p>Check the screenshot and compare the reference number.</p>
        </div>

        <img id="proofModalImage" src="" alt="Proof of payment screenshot" />

        <p id="proofModalError" class="proof-modal-error" style="display:none;">
          Screenshot cannot be loaded. Please check if the uploaded proof file still exists.
        </p>

        <div class="proof-modal-actions">
          <button type="button" class="proof-modal-btn" onclick="closeProofModal()">
            Close
          </button>
        </div>
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
        width: min(92vw, 720px);
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

      .proof-modal-actions {
        margin-top: 14px;
        display: flex;
        justify-content: flex-end;
      }

      .proof-modal-btn {
        border: none;
        border-radius: 999px;
        padding: 11px 18px;
        background: #0f172a;
        color: white;
        font-weight: 800;
        cursor: pointer;
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

  if (errorText) {
    errorText.style.display = "none";
  }

  if (image) {
    image.style.display = "block";
    image.src = "";

    image.onerror = () => {
      image.style.display = "none";

      if (errorText) {
        errorText.style.display = "block";
      }
    };

    image.onload = () => {
      if (errorText) {
        errorText.style.display = "none";
      }

      image.style.display = "block";
    };

    image.src = imageUrl;
  }

  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}

// ============================================================
// SECTION 17: Close proof screenshot modal
// Hides the popup and restores page scrolling.
// ============================================================

function closeProofModal() {
  const modal = document.getElementById("proofImageModal");

  if (modal) {
    modal.classList.remove("show");
  }

  document.body.style.overflow = "";
}

// ============================================================
// SECTION 18: Copy reference number
// Copies payment reference to clipboard.
// ============================================================

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
// SECTION 19: Escape text for inline onclick attributes
// Prevents quotes and special characters from breaking onclick.
// ============================================================

function escapeForInline(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, " ");
}

// ============================================================
// SECTION 20: Quick admin action helpers
// Updates reservation/payment status using simple staff-friendly buttons.
// ============================================================

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
  const response = await fetch(`${API_BASE}/bookings/${bookingId}/payment-status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payment_status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update payment status.");
  }

  return data;
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

async function verifyPayment(bookingId) {
  const button = event?.currentTarget || null;

  await runAdminAction(button, "Verifying...", async () => {
    await updateReservationStatusOnly(bookingId, "approved");
    await updatePaymentStatusOnly(bookingId, "partially_paid");
    showMessage("Payment marked as partially paid.", "success");
  });
}

async function rejectPayment(bookingId) {
  const confirmed = confirm("Reject this payment proof?");
  if (!confirmed) return;

  const button = event?.currentTarget || null;

  await runAdminAction(button, "Rejecting...", async () => {
    await updatePaymentStatusOnly(bookingId, "rejected");
    showMessage("Payment proof rejected.", "success");
  });
}

async function cancelReservation(bookingId) {
  const confirmed = confirm("Cancel this reservation?");
  if (!confirmed) return;

  const button = event?.currentTarget || null;

  await runAdminAction(button, "Cancelling...", async () => {
    await updateReservationStatusOnly(bookingId, "cancelled");
    await updatePaymentStatusOnly(bookingId, "unpaid");
    showMessage("Reservation cancelled.", "success");
  });
}

async function completeReservation(bookingId) {
  const confirmed = confirm(
    "Mark this reservation as completed? This will also mark payment as paid.",
  );
  if (!confirmed) return;

  const button = event?.currentTarget || null;

  await runAdminAction(button, "Completing...", async () => {
    await updateReservationStatusOnly(bookingId, "completed");
    await updatePaymentStatusOnly(bookingId, "paid");
    showMessage("Reservation completed and payment marked as paid.", "success");
  });
}

// ============================================================
// SECTION 21: Open admin receipt page
// Redirects admin to the old root receipt page for now.
// Later, when receipt page is moved into adminHTML, change this path.
// ============================================================

function viewReceipt(bookingId) {
  window.location.href = `admin-booking-receipt.html?id=${bookingId}`;
}

// ============================================================
// SECTION 22: Booking display helpers
// Used for name, source, dates, times, money, and labels.
// ============================================================

function getBookingDisplayName(booking) {
  return booking.fullname || "N/A";
}

function formatBookingSource(source) {
  if (source === "manual") return "Manual";
  return "Online";
}

function formatDate(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
}

function formatTime(timeValue) {
  if (!timeValue) return "N/A";

  const timeText = String(timeValue).trim();

  if (!timeText) {
    return "N/A";
  }

  const parts = timeText.split(":");

  if (parts.length < 2) {
    return timeText;
  }

  let hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) {
    return timeText;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${suffix}`;
}

function formatDateTime(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
}

function formatPaymentMethod(method) {
  if (method === "gcash") return "GCash";
  if (method === "paymaya") return "PayMaya";
  if (method === "cash") return "Cash";
  if (method === "bank_transfer") return "Bank Transfer";
  if (method === "other") return "Other";

  return capitalize(method);
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
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ============================================================
// SECTION 23: Message helper
// Uses toast if available, otherwise alert.
// ============================================================

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}

// ============================================================
// SECTION 24: HTML escaping helper
// Prevents unsafe text from breaking the table layout.
// ============================================================

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
