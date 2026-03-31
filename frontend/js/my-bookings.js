const API_BASE = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  setupLogout();
  loadMyBookings(user.id);
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

async function loadMyBookings(userId) {
  const container = document.getElementById("myBookingsContainer");

  if (!container) return;

  try {
    container.innerHTML = `<p>Loading your bookings...</p>`;

    const response = await fetch(`${API_BASE}/bookings/user/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load bookings.");
    }

    const bookings = Array.isArray(data) ? data : data.bookings || [];

    if (bookings.length === 0) {
      container.innerHTML = `<p>You do not have any bookings yet.</p>`;
      return;
    }

    container.innerHTML = bookings
      .map((booking) => {
        const status = String(booking.status || "pending").toLowerCase();
        const paymentMethod = String(booking.payment_method || "cash").toLowerCase();
        const paymentStatus = String(booking.payment_status || "unpaid").toLowerCase();

        return `
          <div class="admin-card" style="margin-bottom: 20px;">
            <h3>${escapeHtml(booking.room_name || "Room")}</h3>

            <p><strong>Booking ID:</strong> #${booking.id}</p>
            <p><strong>Check In Date:</strong> ${formatDate(booking.check_in)}</p>
            <p><strong>Check In Time:</strong> ${formatTime(booking.check_in_time)}</p>
            <p><strong>Check Out Date:</strong> ${formatDate(booking.check_out)}</p>
            <p><strong>Check Out Time:</strong> ${formatTime(booking.check_out_time)}</p>
            <p><strong>Guests:</strong> ${booking.guests || 0}</p>
            <p><strong>Status:</strong> ${capitalize(status)}</p>
            <p><strong>Payment Method:</strong> ${formatPaymentMethod(paymentMethod)}</p>
            <p><strong>Payment Status:</strong> ${formatPaymentStatus(paymentStatus)}</p>
            <p><strong>Created:</strong> ${formatDateTime(booking.created_at)}</p>

            <div class="admin-actions">
              <a href="booking-receipt.html?id=${booking.id}" class="btn-primary">
                View Receipt
              </a>

              ${
                status === "pending"
                  ? `<button class="btn-secondary" onclick="cancelBooking(${booking.id})">
                      Cancel Booking
                    </button>`
                  : ""
              }
            </div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("loadMyBookings error:", error);
    container.innerHTML = `<p>Something went wrong while loading your bookings.</p>`;
  }
}

async function cancelBooking(bookingId) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  const confirmed = confirm("Are you sure you want to cancel this booking?");
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
      throw new Error(data.message || "Failed to cancel booking.");
    }

    if (typeof showToast === "function") {
      showToast(data.message || "Booking cancelled successfully.", "success");
    } else {
      alert(data.message || "Booking cancelled successfully.");
    }

    loadMyBookings(user.id);
  } catch (error) {
    console.error("cancelBooking error:", error);

    if (typeof showToast === "function") {
      showToast(error.message || "Failed to cancel booking.", "error");
    } else {
      alert(error.message || "Failed to cancel booking.");
    }
  }
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
  if (status === "pending") return "Pending online payment";
  return capitalize(status);
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