const API_BASE = "http://127.0.0.1:5000/api";

let allBookings = [];

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupEvents();
  loadGuestsInside();
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
    refreshBtn.addEventListener("click", loadGuestsInside);
  }
}

async function loadGuestsInside() {
  const tbody = document.getElementById("guestsInsideTableBody");

  try {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="13" class="table-message">Loading guests inside...</td>
        </tr>
      `;
    }

    const response = await fetch(`${API_BASE}/bookings`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load guests inside.");
    }

    allBookings = Array.isArray(data) ? data : data.bookings || [];

    const activeToday = getActiveGuestsToday(allBookings);

    updateSummary(activeToday);
    renderGuestsInside(activeToday);
  } catch (error) {
    console.error("loadGuestsInside error:", error);

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="13" class="table-message">Failed to load guests inside.</td>
        </tr>
      `;
    }

    showMessage(error.message || "Failed to load guests inside.", "error");
  }
}

function getActiveGuestsToday(bookings) {
  const now = new Date();
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return bookings.filter((booking) => {
    const status = String(booking.status || "").toLowerCase();

    if (status !== "approved") {
      return false;
    }

    const checkInDate = normalizeDate(booking.check_in || booking.check_in_date);
    const checkOutDate = normalizeDate(booking.check_out || booking.check_out_date);

    if (!checkInDate || !checkOutDate) {
      return false;
    }

    const checkInOnly = new Date(
      checkInDate.getFullYear(),
      checkInDate.getMonth(),
      checkInDate.getDate()
    );

    const checkOutOnly = new Date(
      checkOutDate.getFullYear(),
      checkOutDate.getMonth(),
      checkOutDate.getDate()
    );

    return checkInOnly <= todayOnly && checkOutOnly >= todayOnly;
  });
}

function updateSummary(bookings) {
  let totalGuests = 0;
  let needsPaymentCount = 0;
  let attentionCount = 0;

  bookings.forEach((booking) => {
    totalGuests += Number(booking.guests || booking.guest_count || 0);

    const remainingBalance = Number(booking.remaining_balance || 0);
    const entranceFee = Number(booking.estimated_entrance_fee || 0);
    const timeInfo = getTimeStatus(booking);

    if (remainingBalance > 0 || entranceFee > 0) {
      needsPaymentCount++;
    }

    if (timeInfo.level === "warning" || timeInfo.level === "danger") {
      attentionCount++;
    }
  });

  setText("totalGuestsInside", totalGuests);
  setText("activeReservations", bookings.length);
  setText("needsPaymentCount", needsPaymentCount);
  setText("attentionCount", attentionCount);
}

function renderGuestsInside(bookings) {
  const tbody = document.getElementById("guestsInsideTableBody");
  if (!tbody) return;

  if (!bookings.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="13" class="table-message">
          No active guests inside the resort today.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bookings
    .map((booking) => {
      const source = String(booking.booking_source || "online").toLowerCase();
      const paymentStatus = String(booking.payment_status || "pending").toLowerCase();

      const remainingBalance = Number(booking.remaining_balance || 0);
      const entranceFee = Number(booking.estimated_entrance_fee || 0);

      const timeInfo = getTimeStatus(booking);
      const paymentClass = getPaymentClass(paymentStatus);
      const frontDeskNote = getFrontDeskNote(remainingBalance, entranceFee, timeInfo);
      const accommodationHtml = formatAccommodationDisplay(
        booking.room_name || booking.accommodation_name || "-"
      );

      const markPaidButton =
        paymentStatus !== "paid"
          ? `
            <button class="action-btn save-payment-btn" onclick="markAsPaid(${Number(booking.id)})">
              Mark Paid
            </button>
          `
          : `
            <button class="action-btn save-payment-btn" disabled style="opacity:0.65;cursor:not-allowed;">
              Paid
            </button>
          `;

      return `
        <tr class="${getRowClass(timeInfo, remainingBalance, entranceFee)}">
          <td><strong>${escapeHtml(booking.reservation_code || `#${booking.id}`)}</strong></td>
          <td>${escapeHtml(booking.fullname || "-")}</td>
          <td>${source === "manual" ? "Walk-in / Manual" : "Online"}</td>
          <td>${accommodationHtml}</td>

          <td>
            ${formatDate(booking.check_in || booking.check_in_date)}
            <br>
            <small>${formatTime(booking.check_in_time)}</small>
          </td>

          <td>
            ${formatDate(booking.check_out || booking.check_out_date)}
            <br>
            <small>${formatTime(booking.check_out_time)}</small>
          </td>

          <td><strong>${Number(booking.guests || booking.guest_count || 0)}</strong></td>

          <td>
            <span class="badge ${timeInfo.level}">
              ${escapeHtml(timeInfo.label)}
            </span>
          </td>

          <td>
            <span class="badge ${paymentClass}">
              ${formatPaymentStatus(paymentStatus)}
            </span>
          </td>

          <td class="${remainingBalance > 0 ? "money-warning" : "money-ok"}">
            ₱${formatMoney(remainingBalance)}
          </td>

          <td class="${entranceFee > 0 ? "money-warning" : "money-ok"}">
            ₱${formatMoney(entranceFee)}
          </td>

          <td>
            <strong>${escapeHtml(frontDeskNote)}</strong>
          </td>

          <td>
            <div class="action-buttons">
              ${markPaidButton}

              <button class="action-btn save-booking-btn" onclick="markAsCheckedOut(${Number(booking.id)})">
                Check Out
              </button>

              <button class="action-btn receipt-btn" onclick="viewReceipt(${Number(booking.id)})">
                Receipt
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function markAsPaid(bookingId) {
  if (!confirm("Mark this booking as fully paid?")) return;

  try {
    const response = await fetch(`${API_BASE}/admin/payments/${bookingId}/mark-paid`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to mark as paid.");
    }

    allBookings = allBookings.map((booking) => {
      if (Number(booking.id) === Number(bookingId)) {
        return {
          ...booking,
          payment_status: "paid",
          remaining_balance: 0,
        };
      }

      return booking;
    });

    const activeToday = getActiveGuestsToday(allBookings);
    updateSummary(activeToday);
    renderGuestsInside(activeToday);

    showMessage("Booking marked as fully paid.", "success");
  } catch (error) {
    console.error("markAsPaid error:", error);
    showMessage(error.message || "Failed to mark as paid.", "error");
  }
}

async function markAsCheckedOut(bookingId) {
  if (!confirm("Mark this guest as checked out / completed?")) return;

  try {
    let response = await fetch(`${API_BASE}/admin/bookings/${bookingId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "completed" }),
    });

    let data = await response.json();

    if (!response.ok) {
      response = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      });

      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to mark as completed.");
    }

    allBookings = allBookings.map((booking) => {
      if (Number(booking.id) === Number(bookingId)) {
        return { ...booking, status: "completed" };
      }

      return booking;
    });

    const activeToday = getActiveGuestsToday(allBookings);
    updateSummary(activeToday);
    renderGuestsInside(activeToday);

    showMessage("Guest checked out successfully.", "success");
  } catch (error) {
    console.error("markAsCheckedOut error:", error);
    showMessage(error.message || "Failed to check out guest.", "error");
  }
}

function viewReceipt(bookingId) {
  window.location.href = `admin-booking-receipt.html?id=${bookingId}`;
}

function formatAccommodationDisplay(name) {
  const text = String(name || "-").trim();

  const match = text.match(/^(.*?)\s*\+(\d+)\s*more$/i);

  if (match) {
    const mainAccommodation = match[1].trim();
    const otherCount = Number(match[2]);

    return `
      <div style="font-weight:800;color:#0f172a;">
        ${escapeHtml(mainAccommodation)}
      </div>
      <div style="margin-top:4px;color:#64748b;font-size:0.82rem;font-weight:700;">
        + ${otherCount} other accommodation${otherCount > 1 ? "s" : ""}
      </div>
    `;
  }

  return `
    <div style="font-weight:800;color:#0f172a;">
      ${escapeHtml(text)}
    </div>
  `;
}

function getTimeStatus(booking) {
  const now = new Date();
  const checkOutDate = booking.check_out || booking.check_out_date;
  const checkOutTime = booking.check_out_time;
  const checkOutDateTime = combineDateAndTime(checkOutDate, checkOutTime);

  if (!checkOutDateTime) {
    return {
      label: "Active Today",
      level: "active",
    };
  }

  const diffMs = checkOutDateTime.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 0) {
    return {
      label: "Overdue",
      level: "danger",
    };
  }

  if (diffMinutes <= 60) {
    return {
      label: `${diffMinutes}m left`,
      level: "warning",
    };
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return {
    label: `${hours}h ${minutes}m left`,
    level: "active",
  };
}

function getFrontDeskNote(remainingBalance, entranceFee, timeInfo) {
  if (timeInfo.level === "danger") {
    return "OVERDUE - check guest now";
  }

  if (remainingBalance > 0 && entranceFee > 0) {
    return `Collect ₱${formatMoney(remainingBalance + entranceFee)} onsite`;
  }

  if (remainingBalance > 0) {
    return `Collect balance ₱${formatMoney(remainingBalance)}`;
  }

  if (entranceFee > 0) {
    return `Collect entrance ₱${formatMoney(entranceFee)}`;
  }

  if (timeInfo.level === "warning") {
    return "Near check-out time";
  }

  return "No urgent action";
}

function getRowClass(timeInfo, remainingBalance, entranceFee) {
  if (timeInfo.level === "danger") return "guest-row-danger";
  if (timeInfo.level === "warning") return "guest-row-warning";
  if (remainingBalance > 0 || entranceFee > 0) return "guest-row-payment";
  return "";
}

function combineDateAndTime(dateValue, timeValue) {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (!timeValue) {
    date.setHours(23, 59, 59, 999);
    return date;
  }

  const timeText = String(timeValue).trim();
  const parts = timeText.split(":");

  if (parts.length < 2) {
    return date;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return date;
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
}

function normalizeDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getPaymentClass(status) {
  if (status === "paid") return "paid";
  if (status === "partially_paid") return "partial";
  if (status === "unpaid") return "danger";
  return "pending";
}

function formatPaymentStatus(status) {
  if (status === "paid") return "Paid";
  if (status === "partially_paid") return "Partially Paid";
  if (status === "pending") return "Pending";
  if (status === "unpaid") return "Unpaid";
  if (status === "rejected") return "Rejected";
  return capitalize(status);
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
}

function formatTime(value) {
  if (!value) return "N/A";

  const text = String(value).trim();
  const parts = text.split(":");

  if (parts.length < 2) return text;

  let hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) return text;

  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;

  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${suffix}`;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function capitalize(text) {
  if (!text) return "";
  const value = String(text);
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function setText(id, value) {
  const el = document.getElementById(id);

  if (el) {
    el.textContent = value;
  }
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