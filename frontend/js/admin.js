const API_BASE = "http://127.0.0.1:5000/api";

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
  "refunded",
];

let allBookings = [];

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupEvents();
  loadBookings();
});

function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  if (user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "index.html";
    return;
  }
}

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
        window.location.href = "login.html";
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

async function loadBookings() {
  const tbody = document.getElementById("adminBookingsTableBody");

  try {
    tbody.innerHTML = `
      <tr>
        <td colspan="15" class="table-message">Loading bookings...</td>
      </tr>
    `;

    const response = await fetch(`${API_BASE}/admin/bookings`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch bookings.");
    }

    allBookings = Array.isArray(data) ? data : data.bookings || [];
    updateSummaryCards(allBookings);
    applyFilters();
  } catch (error) {
    console.error("loadBookings error:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="15" class="table-message">Failed to load bookings.</td>
      </tr>
    `;
    showMessage(error.message || "Failed to load bookings.", "error");
  }
}

function applyFilters() {
  const searchValue = document.getElementById("searchInput").value.trim().toLowerCase();
  const statusValue = document.getElementById("statusFilter").value.trim().toLowerCase();
  const paymentStatusValue = document.getElementById("paymentStatusFilter").value.trim().toLowerCase();
  const paymentMethodValue = document.getElementById("paymentMethodFilter").value.trim().toLowerCase();

  let filtered = [...allBookings];

  if (searchValue) {
    filtered = filtered.filter((booking) => {
      const text = `
        ${booking.id || ""}
        ${booking.fullname || ""}
        ${booking.phone || ""}
        ${booking.email || ""}
        ${booking.room_name || ""}
      `.toLowerCase();

      return text.includes(searchValue);
    });
  }

  if (statusValue) {
    filtered = filtered.filter(
      (booking) => String(booking.status || "").toLowerCase() === statusValue
    );
  }

  if (paymentStatusValue) {
    filtered = filtered.filter(
      (booking) =>
        String(booking.payment_status || "").toLowerCase() === paymentStatusValue
    );
  }

  if (paymentMethodValue) {
    filtered = filtered.filter(
      (booking) =>
        String(booking.payment_method || "").toLowerCase() === paymentMethodValue
    );
  }

  renderBookings(filtered);
}

function updateSummaryCards(bookings) {
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(
    (b) => String(b.status || "").toLowerCase() === "pending"
  ).length;
  const approvedCount = bookings.filter(
    (b) => String(b.status || "").toLowerCase() === "approved"
  ).length;
  const paidCount = bookings.filter(
    (b) => String(b.payment_status || "").toLowerCase() === "paid"
  ).length;

  document.getElementById("totalBookings").textContent = totalBookings;
  document.getElementById("pendingCount").textContent = pendingCount;
  document.getElementById("approvedCount").textContent = approvedCount;
  document.getElementById("paidCount").textContent = paidCount;
}

function renderBookings(bookings) {
  const tbody = document.getElementById("adminBookingsTableBody");

  if (!bookings.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="15" class="table-message">No bookings found.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bookings
    .map((booking) => {
      const bookingStatus = String(booking.status || "pending").toLowerCase();
      const paymentMethod = String(booking.payment_method || "cash").toLowerCase();
      const paymentStatus = String(booking.payment_status || "unpaid").toLowerCase();

      return `
        <tr>
          <td>#${booking.id}</td>
          <td>${escapeHtml(booking.fullname || "N/A")}</td>
          <td>${escapeHtml(booking.phone || "N/A")}</td>
          <td>${escapeHtml(booking.email || "N/A")}</td>
          <td>${escapeHtml(booking.room_name || "N/A")}</td>
          <td>${formatDate(booking.check_in)}</td>
          <td>${formatTime(booking.check_in_time)}</td>
          <td>${formatDate(booking.check_out)}</td>
          <td>${formatTime(booking.check_out_time)}</td>
          <td>${booking.guests || 0}</td>
          <td>
            <div class="status-badge status-${bookingStatus}">
              ${capitalize(bookingStatus)}
            </div>
            <div style="margin-top:6px;">
              <select id="bookingStatus-${booking.id}">
                ${BOOKING_STATUSES.map(
                  (status) => `
                    <option value="${status}" ${bookingStatus === status ? "selected" : ""}>
                      ${capitalize(status)}
                    </option>
                  `
                ).join("")}
              </select>
            </div>
          </td>
          <td>${formatPaymentMethod(paymentMethod)}</td>
          <td>
            <div class="payment-badge payment-${paymentStatus}">
              ${formatPaymentStatus(paymentStatus)}
            </div>
            <div style="margin-top:6px;">
              <select id="paymentStatus-${booking.id}">
                ${PAYMENT_STATUSES.map(
                  (status) => `
                    <option value="${status}" ${paymentStatus === status ? "selected" : ""}>
                      ${formatPaymentStatus(status)}
                    </option>
                  `
                ).join("")}
              </select>
            </div>
          </td>
          <td>${formatDateTime(booking.created_at)}</td>
          <td>
            <div class="action-buttons">
              <button class="action-btn save-booking-btn" onclick="saveAllStatus(${booking.id})">
                Save Status
              </button>
              <button class="action-btn receipt-btn" onclick="viewReceipt(${booking.id})">
                View Receipt
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function saveAllStatus(bookingId) {
  const bookingSelect = document.getElementById(`bookingStatus-${bookingId}`);
  const paymentSelect = document.getElementById(`paymentStatus-${bookingId}`);

  const newBookingStatus = bookingSelect.value;
  const newPaymentStatus = paymentSelect.value;

  const saveButton = document.querySelector(
    `button[onclick="saveAllStatus(${bookingId})"]`
  );

  const originalButtonText = saveButton ? saveButton.textContent : "Save Status";

  try {
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Saving...";
      saveButton.style.opacity = "0.7";
      saveButton.style.cursor = "not-allowed";
    }

    const bookingResponse = await fetch(`${API_BASE}/admin/bookings/${bookingId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newBookingStatus }),
    });

    const bookingData = await bookingResponse.json();

    if (!bookingResponse.ok) {
      throw new Error(bookingData.message || "Failed to update booking status.");
    }

    const paymentResponse = await fetch(`${API_BASE}/admin/payments/${bookingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payment_status: newPaymentStatus }),
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      throw new Error(paymentData.message || "Failed to update payment status.");
    }

    showMessage("Booking and payment status updated successfully.", "success");
    await loadBookings();
  } catch (error) {
    console.error("saveAllStatus error:", error);
    showMessage(error.message || "Failed to save status.", "error");
  } finally {
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = originalButtonText;
      saveButton.style.opacity = "1";
      saveButton.style.cursor = "pointer";
    }
  }
}

function viewReceipt(bookingId) {
  window.location.href = `booking-receipt.html?id=${bookingId}`;
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

function formatPaymentMethod(method) {
  if (method === "paypal") return "PayPal";
  if (method === "cash") return "Cash";
  return capitalize(method);
}

function formatPaymentStatus(status) {
  if (status === "pending") return "Pending";
  if (status === "unpaid") return "Unpaid";
  if (status === "paid") return "Paid";
  if (status === "refunded") return "Refunded";
  return capitalize(status);
}

function capitalize(text) {
  if (!text) return "";
  const value = String(text);
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}