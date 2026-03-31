const API_BASE = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  setupLogout();
  loadReceipt();
});

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
        window.location.href = "login.html";
      }, 700);
    });
  });
}

async function loadReceipt() {
  const receiptBox = document.getElementById("receiptBox");
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("id");

  if (!bookingId) {
    receiptBox.innerHTML = `<div class="receipt-error">Booking ID is missing.</div>`;
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/receipt`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load receipt.");
    }

    const booking = data.booking || data;
    const bookingStatus = String(booking.status || "pending").toLowerCase();
    const paymentStatus = String(booking.payment_status || "unpaid").toLowerCase();

    receiptBox.innerHTML = `
      <div class="print-header">
        <h1>SmartResort Booking Receipt</h1>
        <p>Please keep this receipt for your booking reference.</p>
      </div>

      <div class="receipt-top">
        <div>
          <div class="receipt-brand">SmartResort</div>
          <h2>Receipt #${booking.id}</h2>
        </div>

        <span class="receipt-status status-${escapeHtml(bookingStatus)}">
          ${capitalize(bookingStatus)}
        </span>
      </div>

      <div class="receipt-grid">
        <div class="receipt-item">
          <label>Guest Name</label>
          <div class="value">${escapeHtml(booking.fullname || "N/A")}</div>
        </div>

        <div class="receipt-item">
          <label>Email</label>
          <div class="value">${escapeHtml(booking.email || "N/A")}</div>
        </div>

        <div class="receipt-item">
          <label>Phone Number</label>
          <div class="value">${escapeHtml(booking.phone || "N/A")}</div>
        </div>

        <div class="receipt-item full-width">
          <label>Home Address</label>
          <div class="value">${escapeHtml(booking.address || "N/A")}</div>
        </div>

        <div class="receipt-item">
          <label>Room</label>
          <div class="value">${escapeHtml(booking.room_name || "N/A")}</div>
        </div>

        <div class="receipt-item">
          <label>Guests</label>
          <div class="value">${booking.guests || 0}</div>
        </div>

        <div class="receipt-item">
          <label>Check In Date</label>
          <div class="value">${formatDate(booking.check_in)}</div>
        </div>

        <div class="receipt-item">
          <label>Check In Time</label>
          <div class="value">${formatTime(booking.check_in_time)}</div>
        </div>

        <div class="receipt-item">
          <label>Check Out Date</label>
          <div class="value">${formatDate(booking.check_out)}</div>
        </div>

        <div class="receipt-item">
          <label>Check Out Time</label>
          <div class="value">${formatTime(booking.check_out_time)}</div>
        </div>

        <div class="receipt-item">
          <label>Payment Method</label>
          <div class="value">${formatPaymentMethod(booking.payment_method || "cash")}</div>
        </div>

        <div class="receipt-item">
          <label>Payment Status</label>
          <div class="value">
            <span class="payment-pill payment-${escapeHtml(paymentStatus)}">
              ${formatPaymentStatus(paymentStatus)}
            </span>
          </div>
        </div>

        <div class="receipt-item">
          <label>Room Price</label>
          <div class="value">₱${formatMoney(booking.price || 0)}</div>
        </div>

        <div class="receipt-item">
          <label>Created At</label>
          <div class="value">${formatDateTime(booking.created_at)}</div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("loadReceipt error:", error);
    receiptBox.innerHTML = `<div class="receipt-error">${escapeHtml(error.message || "Failed to load receipt.")}</div>`;
  }
}

function formatPaymentMethod(method) {
  const value = String(method || "").toLowerCase();

  if (value === "paypal") {
    return "PayPal";
  }

  if (value === "cash") {
    return "Cash";
  }

  return capitalize(value);
}

function formatPaymentStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "pending") {
    return "Pending online payment";
  }

  return capitalize(value);
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
  if (!timeText) return "N/A";

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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}