// ============================================================
// SMARTRESORT ADMIN DASHBOARD SCRIPT
// Purpose:
// - Load all reservations
// - Search/filter reservations
// - Staff-friendly reservation cards
// - View proof screenshot using Base64/file fallback
// - Quick admin actions: verify, reject, complete, cancel
// ============================================================

let allBookings = [];

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
  if (paymentStatusFilter) paymentStatusFilter.addEventListener("change", applyFilters);
  if (paymentMethodFilter) paymentMethodFilter.addEventListener("change", applyFilters);
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
        Loading reservations...
      </div>
    `);

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

    setReservationsContent(`
      <div class="reservation-state-box error">
        Failed to load reservations.
      </div>
    `);

    showMessage(error.message || "Failed to load reservations.", "error");
  }
}

// ============================================================
// SECTION 5: Summary cards
// ============================================================

function updateSummaryCards(bookings) {
  const today = new Date().toISOString().slice(0, 10);

  const totalBookings = bookings.length;

  const pendingCount = bookings.filter((booking) => {
    return String(booking.status || "").toLowerCase() === "pending";
  }).length;

  const approvedCount = bookings.filter((booking) => {
    return String(booking.status || "").toLowerCase() === "approved";
  }).length;

  const paidCount = bookings.filter((booking) => {
    return String(booking.payment_status || "").toLowerCase() === "paid";
  }).length;

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
        return sum + Number(booking.paid_amount || booking.required_downpayment || 0);
      }

      return sum;
    }, 0);

  setText("totalBookings", totalBookings);
  setText("pendingCount", pendingCount);
  setText("approvedCount", approvedCount);
  setText("paidCount", paidCount);
  setText("todayBookings", todayBookings);
  setText("walkinToday", walkinToday);
  setText("guestsInside", guestsInside);
  setText("todayRevenue", `₱${formatMoney(todayRevenue)}`);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ============================================================
// SECTION 6: Filters
// ============================================================

function applyFilters() {
  const searchValue = String(document.getElementById("searchInput")?.value || "")
    .trim()
    .toLowerCase();

  const statusValue = String(document.getElementById("statusFilter")?.value || "")
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

  if (searchValue) {
    filtered = filtered.filter((booking) => {
      const searchableText = `
        ${booking.id || ""}
        ${booking.reservation_code || ""}
        ${getBookingDisplayName(booking) || ""}
        ${booking.phone || ""}
        ${booking.email || ""}
        ${booking.room_name || ""}
        ${booking.booking_source || ""}
        ${booking.payment_method || ""}
        ${booking.payment_status || ""}
        ${booking.status || ""}
        ${getPaymentReference(booking) || ""}
      `.toLowerCase();

      return searchableText.includes(searchValue);
    });
  }

  if (statusValue) {
    filtered = filtered.filter((booking) => {
      return String(booking.status || "").toLowerCase() === statusValue;
    });
  }

  if (paymentStatusValue) {
    filtered = filtered.filter((booking) => {
      return String(booking.payment_status || "").toLowerCase() === paymentStatusValue;
    });
  }

  if (paymentMethodValue) {
    filtered = filtered.filter((booking) => {
      return String(booking.payment_method || "").toLowerCase() === paymentMethodValue;
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
        No reservations found.
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
  const paymentStatus = String(booking.payment_status || "pending").toLowerCase();
  const paymentMethod = String(booking.payment_method || "cash").toLowerCase();
  const bookingSource = String(booking.booking_source || "online").toLowerCase();
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
            <div>Guests: ${Number(booking.guests || 0)}</div>
          </section>

          <section class="reservation-info-box">
            <div class="info-label">Payment</div>
            <div>Total: <strong>₱${formatMoney(booking.accommodation_total)}</strong></div>
            <div>Downpayment: <strong>₱${formatMoney(booking.required_downpayment)}</strong></div>
            <div>Paid: <strong>₱${formatMoney(booking.paid_amount)}</strong></div>
            <div>Remaining: <strong>₱${formatMoney(booking.remaining_balance)}</strong></div>
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

        ${renderVerifyButton(bookingId, bookingStatus, paymentStatus)}

        ${renderRejectButton(bookingId, bookingStatus, paymentStatus)}

        ${renderCompleteButton(bookingId, bookingStatus)}

        ${renderCancelButton(bookingId, bookingStatus)}
      </div>
    </article>
  `;
}

// ============================================================
// SECTION 8: Button renderers
// ============================================================

function renderVerifyButton(bookingId, bookingStatus, paymentStatus) {
  if (bookingStatus === "cancelled" || bookingStatus === "completed" || bookingStatus === "rejected") {
    return "";
  }

  if (paymentStatus === "paid" || paymentStatus === "partially_paid") {
    return `
      <button
        type="button"
        class="action-btn verify-payment-btn muted"
        disabled
      >
        Payment OK
      </button>
    `;
  }

  return `
    <button
      type="button"
      class="action-btn verify-payment-btn"
      onclick="verifyPayment(${bookingId}, this)"
    >
      Verify Payment
    </button>
  `;
}

function renderRejectButton(bookingId, bookingStatus, paymentStatus) {
  if (
    bookingStatus === "rejected" ||
    bookingStatus === "cancelled" ||
    bookingStatus === "completed" ||
    paymentStatus === "rejected"
  ) {
    return "";
  }

  return `
    <button
      type="button"
      class="action-btn reject-payment-btn"
      onclick="rejectPayment(${bookingId}, this)"
    >
      Reject Payment
    </button>
  `;
}

function renderCompleteButton(bookingId, bookingStatus) {
  if (bookingStatus === "completed" || bookingStatus === "cancelled" || bookingStatus === "rejected") {
    return "";
  }

  return `
    <button
      type="button"
      class="action-btn complete-booking-btn"
      onclick="completeReservation(${bookingId}, this)"
    >
      Complete
    </button>
  `;
}

function renderCancelButton(bookingId, bookingStatus) {
  if (bookingStatus === "cancelled" || bookingStatus === "completed" || bookingStatus === "rejected") {
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
  const confirmed = confirm("Mark this payment as verified / partially paid?");
  if (!confirmed) return;

  await runAdminAction(button, "Verifying...", async () => {
    await updateReservationStatusOnly(bookingId, "approved");
    await updatePaymentStatusOnly(bookingId, "partially_paid");
    showMessage("Payment verified successfully.", "success");
  });
}

async function rejectPayment(bookingId, button) {
  const confirmed = confirm("Reject this payment proof?");
  if (!confirmed) return;

  await runAdminAction(button, "Rejecting...", async () => {
    await updatePaymentStatusOnly(bookingId, "rejected");
    await updateReservationStatusOnly(bookingId, "rejected");
    showMessage("Payment proof rejected.", "success");
  });
}

async function completeReservation(bookingId, button) {
  const confirmed = confirm("Mark this reservation as completed and payment as paid?");
  if (!confirmed) return;

  await runAdminAction(button, "Completing...", async () => {
    await updateReservationStatusOnly(bookingId, "completed");
    await updatePaymentStatusOnly(bookingId, "paid");
    showMessage("Reservation completed successfully.", "success");
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
  const cleanReference = String(reference || "").replace(/\s+/g, "").trim();

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
          .map((group) => `<span class="reference-chip">${escapeHtml(group)}</span>`)
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

  return date.toLocaleDateString();
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
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString();
}

function formatPaymentMethod(method) {
  if (method === "gcash") return "GCash";
  if (method === "paymaya") return "PayMaya";
  if (method === "maya") return "Maya";
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