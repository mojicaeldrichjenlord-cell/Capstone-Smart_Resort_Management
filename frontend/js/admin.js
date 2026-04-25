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
  "partially_paid",
  "rejected",
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
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="19" class="table-message">Loading reservations...</td>
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
          <td colspan="19" class="table-message">Failed to load reservations.</td>
        </tr>
      `;
    }

    showMessage(error.message || "Failed to load reservations.", "error");
  }
}

function updateSummaryCards(bookings) {
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(
    (booking) => String(booking.status || "").toLowerCase() === "pending"
  ).length;
  const approvedCount = bookings.filter(
    (booking) => String(booking.status || "").toLowerCase() === "approved"
  ).length;
  const paidCount = bookings.filter(
    (booking) => String(booking.payment_status || "").toLowerCase() === "paid"
  ).length;

  const totalBookingsEl = document.getElementById("totalBookings");
  const pendingCountEl = document.getElementById("pendingCount");
  const approvedCountEl = document.getElementById("approvedCount");
  const paidCountEl = document.getElementById("paidCount");

  if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
  if (pendingCountEl) pendingCountEl.textContent = pendingCount;
  if (approvedCountEl) approvedCountEl.textContent = approvedCount;
  if (paidCountEl) paidCountEl.textContent = paidCount;
}

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

function renderBookings(bookings) {
  const tbody = document.getElementById("adminBookingsTableBody");
  if (!tbody) return;

  if (!bookings.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="19" class="table-message">No reservations found.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bookings
    .map((booking) => {
      const bookingStatus = String(booking.status || "pending").toLowerCase();
      const paymentMethod = String(booking.payment_method || "cash").toLowerCase();
      const paymentStatus = String(booking.payment_status || "pending").toLowerCase();
      const bookingSource = String(booking.booking_source || "online").toLowerCase();

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
            <select id="bookingStatus-${booking.id}">
              ${BOOKING_STATUSES.map(
                (status) => `
                  <option value="${status}" ${
                    bookingStatus === status ? "selected" : ""
                  }>
                    ${capitalize(status)}
                  </option>
                `
              ).join("")}
            </select>
          </td>
          <td>${formatPaymentMethod(paymentMethod)}</td>
          <td>
            <div class="payment-badge payment-${paymentStatus}">
              ${formatPaymentStatus(paymentStatus)}
            </div>
            <select id="paymentStatus-${booking.id}">
              ${PAYMENT_STATUSES.map(
                (status) => `
                  <option value="${status}" ${
                    paymentStatus === status ? "selected" : ""
                  }>
                    ${formatPaymentStatus(status)}
                  </option>
                `
              ).join("")}
            </select>
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

  if (!bookingSelect || !paymentSelect) {
    showMessage("Status controls not found.", "error");
    return;
  }

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

    const bookingResponse = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newBookingStatus }),
    });

    const bookingData = await bookingResponse.json();

    if (!bookingResponse.ok) {
      throw new Error(bookingData.message || "Failed to update reservation status.");
    }

    const paymentResponse = await fetch(
      `${API_BASE}/bookings/${bookingId}/payment-status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment_status: newPaymentStatus }),
      }
    );

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      throw new Error(paymentData.message || "Failed to update payment status.");
    }

    showMessage("Reservation and payment status updated successfully.", "success");
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
  window.location.href = `admin-booking-receipt.html?id=${bookingId}`;
}

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
  if (method === "gcash") return "GCash";
  if (method === "paymaya") return "PayMaya";
  if (method === "cash") return "Cash";
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

function showMessage(message, type = "success") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
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