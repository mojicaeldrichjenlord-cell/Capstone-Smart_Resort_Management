// ============================================================
// SMARTRESORT ADMIN THERMAL RECEIPT SCRIPT
// File: frontend/adminJS/admin-booking-receipt.js
// Purpose:
// - Check admin/staff access
// - Load reservation receipt data
// - Render thermal-only front-desk receipt
// - Display Philippine time accurately
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupLogoutButton();
  setupPrintButton();
  loadAdminReceipt();
});

function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (user.role !== "admin" && user.role !== "staff") {
    alert("Access denied. Admin only.");
    window.location.href = "../index.html";
  }
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("user");

    if (typeof showToast === "function") {
      showToast("Logged out successfully.", "success");
    }

    setTimeout(() => {
      window.location.href = "../authHTML/login.html";
    }, 700);
  });
}

function setupPrintButton() {
  const printThermalBtn = document.getElementById("printThermalBtn");

  if (!printThermalBtn) return;

  printThermalBtn.addEventListener("click", () => {
    window.print();
  });
}

async function loadAdminReceipt() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("id");
  const thermal = document.getElementById("thermalReceipt");

  if (!bookingId) {
    if (thermal) {
      thermal.innerHTML = `<div class="thermal-inner">Booking ID is missing.</div>`;
    }
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/receipt`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load admin receipt.");
    }

    const booking = data.booking || data;
    renderThermalReceipt(booking);
  } catch (error) {
    console.error("loadAdminReceipt error:", error);

    if (thermal) {
      thermal.innerHTML = `
        <div class="thermal-inner">
          Failed to load receipt.<br>
          ${escapeHtml(error.message || "")}
        </div>
      `;
    }
  }
}

function renderThermalReceipt(booking) {
  const items = Array.isArray(booking.items) ? booking.items : [];

  const totalGuests = Number(booking.guests || booking.guest_count || 0);
  const estimatedEntranceFee = Number(booking.estimated_entrance_fee || 0);
  const entranceFeeCollected = Number(booking.entrance_fee_collected || 0);
  const entranceFeePaid =
    isTruthy(booking.entrance_fee_paid) || entranceFeeCollected > 0;

  const extraBedCount = Number(booking.extra_bed_count || 0);
  const extraBedFee = Number(booking.extra_bed_fee || 0);
  const extraBedPaid = isTruthy(booking.extra_bed_paid);

  const accommodationTotal = Number(booking.accommodation_total || 0);
  const paidAmount = Number(booking.paid_amount || 0);
  const remainingBalance = Number(booking.remaining_balance || 0);

  const entranceToCollect = entranceFeePaid ? 0 : estimatedEntranceFee;
  const extraBedToCollect = extraBedPaid ? 0 : extraBedFee;

  const totalCollected =
    paidAmount + entranceFeeCollected + (extraBedPaid ? extraBedFee : 0);

  const onsiteTotal = remainingBalance + entranceToCollect + extraBedToCollect;

  const status = formatPaymentStatus(booking.payment_status || "pending");
  const guestName = booking.fullname || buildFullName(booking) || "-";
  const phone = booking.phone || booking.contact_no || "-";
  const reservedAt = formatPhilippineDateTime(booking.reserved_at || booking.created_at);
  const printedAt = formatPhilippineDateTime(new Date().toISOString());

  const thermal = document.getElementById("thermalReceipt");
  if (!thermal) return;

  thermal.innerHTML = `
    <div class="thermal-inner">
      <div class="thermal-center">
        <div class="thermal-title">ARVIC SEASIDE</div>
        <div class="thermal-sub">BEACH RESORT & HOTEL</div>
        <div class="thermal-sub">ADMIN THERMAL RECEIPT</div>
        <div class="thermal-code">${escapeHtml(
          booking.reservation_code || `#${booking.id}`
        )}</div>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-row">
        <span>Reservation ID</span>
        <span>#${escapeHtml(booking.id)}</span>
      </div>

      <div class="thermal-row">
        <span>Reserved</span>
        <span>${escapeHtml(reservedAt)}</span>
      </div>

      <div class="thermal-row">
        <span>Printed</span>
        <span>${escapeHtml(printedAt)}</span>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-section-title">Guest</div>

      <div class="thermal-row">
        <span>Name</span>
        <span>${escapeHtml(guestName)}</span>
      </div>

      <div class="thermal-row">
        <span>Contact</span>
        <span>${escapeHtml(phone)}</span>
      </div>

      <div class="thermal-row">
        <span>Guests</span>
        <span>${totalGuests}</span>
      </div>

      <div class="thermal-row">
        <span>Payment</span>
        <span>${escapeHtml(status)}</span>
      </div>

      <div class="thermal-row">
        <span>Method</span>
        <span>${escapeHtml(formatPaymentMethod(booking.payment_method || "cash"))}</span>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-section-title">Accommodation</div>

      ${
        items.length
          ? items.map(renderThermalItem).join("")
          : `<div>No reserved items found.</div>`
      }

      <div class="thermal-divider"></div>

      <div class="thermal-section-title">Payment Summary</div>

      <div class="thermal-row">
        <span>Accommodation</span>
        <span>₱${formatMoney(accommodationTotal)}</span>
      </div>

      <div class="thermal-row">
        <span>Downpayment Paid</span>
        <span>₱${formatMoney(paidAmount)}</span>
      </div>

      <div class="thermal-row">
        <span>Remaining Bal.</span>
        <span>₱${formatMoney(remainingBalance)}</span>
      </div>

      <div class="thermal-row">
        <span>Entrance Fee</span>
        <span>₱${formatMoney(estimatedEntranceFee)}</span>
      </div>

      <div class="thermal-row">
        <span>Entrance Paid</span>
        <span>${entranceFeePaid ? "Yes" : "No"}</span>
      </div>

      <div class="thermal-row">
        <span>Extra Bed</span>
        <span>${extraBedCount} bed(s)</span>
      </div>

      <div class="thermal-row">
        <span>Extra Bed Fee</span>
        <span>₱${formatMoney(extraBedFee)}</span>
      </div>

      <div class="thermal-row">
        <span>Extra Bed Paid</span>
        <span>${extraBedPaid ? "Yes" : "No"}</span>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-row thermal-bold">
        <span>Total Collected</span>
        <span>₱${formatMoney(totalCollected)}</span>
      </div>

      <div class="thermal-total-box">
        <div class="thermal-total-label">TO COLLECT ONSITE</div>
        <div class="thermal-total-amount">₱${formatMoney(onsiteTotal)}</div>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-note">
        Verify remaining balance, entrance fee, discounts, and extra bed charges at the front desk.
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-center thermal-small">
        SmartResort System<br>
        Keep for front-desk verification
      </div>
    </div>
  `;
}

function renderThermalItem(item) {
  return `
    <div class="thermal-item">
      <div class="thermal-bold">${escapeHtml(item.accommodation_name || "-")}</div>
      <div class="thermal-small">${escapeHtml(item.category_name || "-")} • ${escapeHtml(item.slot_label || "-")}</div>
      <div class="thermal-small">
        IN: ${escapeHtml(formatDateOnly(item.check_in_date))} ${escapeHtml(formatTime(item.check_in_time))}
      </div>
      <div class="thermal-small">
        OUT: ${escapeHtml(formatDateOnly(item.check_out_date))} ${escapeHtml(formatTime(item.check_out_time))}
      </div>
      <div class="thermal-row">
        <span>Price</span>
        <span>₱${formatMoney(item.item_price)}</span>
      </div>
    </div>
  `;
}

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
  const date = value instanceof Date ? value : parseBackendDateTimeAsUtc(value);
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

function formatDateOnly(dateValue) {
  if (!dateValue) return "N/A";

  const raw = String(dateValue).slice(0, 10);
  const parts = raw.split("-");

  if (parts.length === 3) {
    return `${Number(parts[1])}/${Number(parts[2])}/${parts[0]}`;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString("en-PH");
}

function formatTime(timeValue) {
  if (!timeValue) return "N/A";

  const text = String(timeValue).trim();
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

function buildFullName(booking) {
  return [booking.first_name, booking.middle_name, booking.last_name]
    .filter(Boolean)
    .join(" ");
}

function isTruthy(value) {
  return (
    Number(value || 0) === 1 ||
    String(value || "").toLowerCase() === "true" ||
    String(value || "").toLowerCase() === "yes"
  );
}

function formatPaymentMethod(method) {
  const value = String(method || "").toLowerCase();

  if (value === "gcash") return "GCash";
  if (value === "paymaya") return "PayMaya";
  if (value === "cash") return "Cash";

  return capitalize(value.replaceAll("_", " "));
}

function formatPaymentStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "pending") return "Pending";
  if (value === "paid") return "Paid";
  if (value === "partially_paid") return "Partially Paid";
  if (value === "rejected") return "Rejected";
  if (value === "unpaid") return "Unpaid";

  return capitalize(value.replaceAll("_", " "));
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
