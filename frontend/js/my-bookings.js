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
    container.innerHTML = `
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

    const response = await fetch(`${API_BASE}/bookings/user/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load reservations.");
    }

    const bookings = Array.isArray(data) ? data : data.bookings || [];

    if (!bookings.length) {
      container.innerHTML = `
        <div style="
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(219,231,239,0.92);
          border-radius: 22px;
          padding: 28px;
          text-align: center;
          color: #475569;
          box-shadow: 0 12px 28px rgba(15,23,42,0.08);
        ">
          You do not have any reservations yet.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="
        display:grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      ">
        ${bookings
          .map((booking) => {
            const status = String(booking.status || "pending").toLowerCase();
            const paymentMethod = String(booking.payment_method || "gcash").toLowerCase();
            const paymentStatus = String(booking.payment_status || "pending").toLowerCase();
            const coverImage = escapeHtml(booking.image || "images/no-image.jpg");

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
                    onerror="this.src='images/no-image.jpg'"
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
                    <div style="${detailBoxStyle()}"><strong>Check In</strong><br>${formatDate(booking.check_in)}<br>${formatTime(booking.check_in_time)}</div>
                    <div style="${detailBoxStyle()}"><strong>Check Out</strong><br>${formatDate(booking.check_out)}<br>${formatTime(booking.check_out_time)}</div>
                    <div style="${detailBoxStyle()}"><strong>Guests</strong><br>${booking.guests || 0}</div>
                    <div style="${detailBoxStyle()}"><strong>Created</strong><br>${formatDateTime(booking.created_at)}</div>
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
                      style="flex:1;"
                    >
                      View Receipt
                    </a>

                    ${
                      status === "pending"
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
          })
          .join("")}
      </div>
    `;
  } catch (error) {
    console.error("loadMyBookings error:", error);
    container.innerHTML = `
      <div style="
        background: rgba(255,255,255,0.95);
        border: 1px solid #fecaca;
        border-radius: 22px;
        padding: 24px;
        text-align: center;
        color: #991b1b;
        box-shadow: 0 12px 28px rgba(15,23,42,0.08);
      ">
        Something went wrong while loading your reservations.
      </div>
    `;
  }
}

async function cancelBooking(bookingId) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
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

    loadMyBookings(user.id);
  } catch (error) {
    console.error("cancelBooking error:", error);

    if (typeof showToast === "function") {
      showToast(error.message || "Failed to cancel reservation.", "error");
    } else {
      alert(error.message || "Failed to cancel reservation.");
    }
  }
}

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
  return capitalize(method);
}

function formatPaymentStatus(status) {
  if (status === "pending") return "Pending admin review";
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}