// ============================================================
// CUSTOMER MY BOOKINGS SCRIPT
// File: frontend/customerJS/my-bookings.js
// Purpose:
// - Check customer access
// - Load customer bookings
// - View receipt
// - Cancel reservation at least 1 day before check-in
// - Customer can view receipt and cancel reservation when allowed
// - Works from frontend/customerHTML/my-bookings.html
// ============================================================


let currentUser = null;

// ============================================================
// SECTION 1: Page startup
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  currentUser = JSON.parse(localStorage.getItem("user"));

  if (!currentUser) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (currentUser.role === "admin" || currentUser.role === "staff") {
    window.location.href = "../adminHTML/admin.html";
    return;
  }

  setupLogout();
  loadMyBookings(currentUser.id);
});

// ============================================================
// SECTION 2: Logout
// ============================================================

function setupLogout() {
  const logoutBtns = [
    document.getElementById("logoutBtn"),
    document.getElementById("mobileLogoutBtn"),
  ].filter(Boolean);

  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem("user");

      if (typeof showToast === "function") {
        showToast("Logged out successfully.", "success");
      } else {
        alert("Logged out successfully.");
      }

      setTimeout(() => {
        window.location.href = "../authHTML/login.html";
      }, 700);
    });
  });
}

// ============================================================
// SECTION 3: Load bookings
// ============================================================

async function loadMyBookings(userId) {
  const container = document.getElementById("myBookingsContainer");
  if (!container) return;

  try {
    container.innerHTML = getLoadingBox();

    const response = await fetch(`${API_BASE}/bookings/user/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load reservations.");
    }

    const bookings = Array.isArray(data) ? data : data.bookings || [];

    if (!bookings.length) {
      container.innerHTML = getEmptyBox("You do not have any reservations yet.");
      return;
    }

    container.innerHTML = `
      <div style="
        display:grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      ">
        ${bookings.map((booking) => renderBookingCard(booking)).join("")}
      </div>
    `;
  } catch (error) {
    console.error("loadMyBookings error:", error);
    container.innerHTML = getErrorBox(
      "Something went wrong while loading your reservations."
    );
  }
}

// ============================================================
// SECTION 4: Render booking card
// ============================================================

function renderBookingCard(booking) {
  const status = String(booking.status || "pending").toLowerCase();
  const paymentMethod = String(booking.payment_method || "gcash").toLowerCase();
  const paymentStatus = String(booking.payment_status || "pending").toLowerCase();

  const coverImage = escapeHtml(
    resolveImagePath(booking.image || "images/no-image.jpg")
  );

  const canCancelReservation = isCancellationAllowed(booking);

  return `
    <div style="
      background: rgba(255,255,255,0.96);
      border-radius: 26px;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(15,23,42,0.08);
      border: 1px solid rgba(219,231,239,0.92);
    ">
      <div style="position:relative;">
        <img
          src="${coverImage}"
          alt="${escapeHtml(booking.room_name || "Accommodation")}"
          style="width:100%;height:200px;object-fit:cover;background:#f1f5f9;"
          onerror="this.src='../images/no-image.jpg'"
        />

        <div style="
          position:absolute;
          top:14px;
          left:14px;
          background: rgba(15, 23, 42, 0.82);
          color:white;
          padding:8px 12px;
          border-radius:999px;
          font-size:0.82rem;
          font-weight:700;
          backdrop-filter: blur(8px);
        ">
          ${escapeHtml(booking.reservation_code || `#${booking.id}`)}
        </div>
      </div>

      <div style="padding:20px;">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px;">
          <h3 style="margin:0;color:#0f172a;font-size:1.22rem;">
            ${escapeHtml(booking.room_name || "Accommodation")}
          </h3>

          <span style="
            white-space:nowrap;
            padding:8px 12px;
            border-radius:999px;
            font-size:0.82rem;
            font-weight:800;
            ${getStatusBadgeStyles(status)}
          ">
            ${capitalize(status)}
          </span>
        </div>

        <div style="
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:10px;
          margin:14px 0;
        ">
          <div style="${detailBoxStyle()}">
            <strong>Check In</strong><br>
            ${formatDate(booking.check_in)}<br>
            ${formatTime(booking.check_in_time)}
          </div>

          <div style="${detailBoxStyle()}">
            <strong>Check Out</strong><br>
            ${formatDate(booking.check_out)}<br>
            ${formatTime(booking.check_out_time)}
          </div>

          <div style="${detailBoxStyle()}">
            <strong>Guests</strong><br>
            ${booking.guests || 0}
          </div>

          <div style="${detailBoxStyle()}">
            <strong>Created</strong><br>
            ${formatDateTime(booking.created_at)}
          </div>
        </div>

        <div style="
          background: linear-gradient(180deg, #fcfeff 0%, #f4fbfc 100%);
          border: 1px solid #dbe7ef;
          border-radius: 16px;
          padding: 14px 16px;
          margin-bottom: 14px;
          color: #334155;
          line-height: 1.6;
          font-size: 0.93rem;
        ">
          <div><strong>Payment Method:</strong> ${formatPaymentMethod(paymentMethod)}</div>
          <div><strong>Payment Status:</strong> ${formatPaymentStatus(paymentStatus)}</div>
          <div><strong>Accommodation Total:</strong> ₱${formatMoney(booking.accommodation_total)}</div>
          <div><strong>Required Down Payment:</strong> ₱${formatMoney(booking.required_downpayment)}</div>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <a
            href="booking-receipt.html?id=${booking.id}"
            class="btn-primary"
            style="flex:1;text-align:center;"
          >
            View Receipt
          </a>

          ${
            canCancelReservation
              ? `
                <button
                  class="btn-secondary"
                  style="flex:1;"
                  onclick="cancelBooking(${booking.id})"
                >
                  Cancel Reservation
                </button>
              `
              : ""
          }
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// SECTION 7: Cancel booking
// ============================================================

async function cancelBooking(bookingId) {
  if (!currentUser) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  const confirmed = confirm("Are you sure you want to cancel this reservation?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to cancel reservation.");
    }

    if (typeof showToast === "function") {
      showToast(data.message || "Reservation cancelled successfully.", "success");
    } else {
      alert(data.message || "Reservation cancelled successfully.");
    }

    loadMyBookings(currentUser.id);
  } catch (error) {
    console.error("cancelBooking error:", error);

    if (typeof showToast === "function") {
      showToast(error.message || "Failed to cancel reservation.", "error");
    } else {
      alert(error.message || "Failed to cancel reservation.");
    }
  }
}

// ============================================================
// SECTION 8: Booking rules
// ============================================================

function isCancellationAllowed(booking) {
  const status = String(booking.status || "").toLowerCase();

  if (["cancelled", "rejected", "completed"].includes(status)) {
    return false;
  }

  const checkIn = new Date(booking.check_in);
  const today = new Date();

  if (Number.isNaN(checkIn.getTime())) {
    return false;
  }

  checkIn.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysBeforeCheckIn = Math.floor(
    (checkIn.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );

  return daysBeforeCheckIn >= 1;
}

// ============================================================
// SECTION 9: Style helpers for dynamic cards
// ============================================================

function detailBoxStyle() {
  return `
    background: linear-gradient(180deg, #fcfeff 0%, #f4fbfc 100%);
    border: 1px solid #dbe7ef;
    border-radius: 14px;
    padding: 12px 14px;
    color: #334155;
    line-height: 1.55;
    font-size: 0.9rem;
  `;
}

function modalLabelStyle() {
  return `
    display:block;
    margin-bottom:7px;
    color:#0f172a;
    font-weight:800;
    font-size:0.9rem;
  `;
}

function modalInputStyle() {
  return `
    width:100%;
    border:1px solid #cbd5e1;
    border-radius:14px;
    padding:12px 13px;
    outline:none;
    font-size:0.95rem;
  `;
}

function getStatusBadgeStyles(status) {
  if (status === "approved") {
    return "background:#dcfce7;color:#166534;border:1px solid #bbf7d0;";
  }

  if (status === "rejected") {
    return "background:#fee2e2;color:#991b1b;border:1px solid #fecaca;";
  }

  if (status === "cancelled") {
    return "background:#e5e7eb;color:#374151;border:1px solid #d1d5db;";
  }

  if (status === "completed") {
    return "background:#dbeafe;color:#1d4ed8;border:1px solid #bfdbfe;";
  }

  return "background:#fef3c7;color:#92400e;border:1px solid #fde68a;";
}

// ============================================================
// SECTION 10: Message box helpers
// ============================================================

function getLoadingBox() {
  return `
    <div style="
      background: rgba(255,255,255,0.95);
      border: 1px solid rgba(219,231,239,0.92);
      border-radius: 22px;
      padding: 24px;
      text-align: center;
      color: #475569;
      box-shadow: 0 12px 28px rgba(15,23,42,0.08);
    ">
      Loading your reservations...
    </div>
  `;
}

function getEmptyBox(message) {
  return `
    <div style="
      background: rgba(255,255,255,0.95);
      border: 1px solid rgba(219,231,239,0.92);
      border-radius: 22px;
      padding: 28px;
      text-align: center;
      color: #475569;
      box-shadow: 0 12px 28px rgba(15,23,42,0.08);
    ">
      ${escapeHtml(message)}
    </div>
  `;
}

function getErrorBox(message) {
  return `
    <div style="
      background: rgba(255,255,255,0.95);
      border: 1px solid #fecaca;
      border-radius: 22px;
      padding: 24px;
      text-align: center;
      color: #991b1b;
      box-shadow: 0 12px 28px rgba(15,23,42,0.08);
    ">
      ${escapeHtml(message)}
    </div>
  `;
}

// ============================================================
// SECTION 11: Image path resolver
// Fixes image paths because my-bookings.html is now inside customerHTML.
// ============================================================

function resolveImagePath(value) {
  const imagePath = String(value || "").trim();

  if (!imagePath) {
    return "../images/no-image.jpg";
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  if (imagePath.startsWith("../")) {
    return imagePath;
  }

  if (imagePath.startsWith("/uploads/")) {
    return `http://127.0.0.1:5000${imagePath}`;
  }

  if (imagePath.startsWith("uploads/")) {
    return `http://127.0.0.1:5000/${imagePath}`;
  }

  return `../${imagePath}`;
}

// ============================================================
// SECTION 12: Format helpers
// ============================================================

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
  if (!timeText) return "N/A";

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

function formatDateTime(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
}

function formatPaymentMethod(method) {
  const value = String(method || "").toLowerCase();

  if (value === "gcash") return "GCash";
  if (value === "paymaya") return "Maya / PayMaya";
  if (value === "cash") return "Cash";

  return capitalize(value.replaceAll("_", " "));
}

function formatPaymentStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "pending") return "Pending admin review";
  if (value === "unpaid") return "Unpaid";
  if (value === "paid") return "Paid";
  if (value === "partially_paid") return "Partially Paid";
  if (value === "rejected") return "Rejected";

  return capitalize(value.replaceAll("_", " "));
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

  return String(text)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}