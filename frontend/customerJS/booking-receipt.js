// ============================================================
// CUSTOMER BOOKING RECEIPT SCRIPT
// File: frontend/customerJS/booking-receipt.js
// Purpose:
// - Check customer access
// - Load a minimalist customer receipt
// - Show final payment details conditionally after check-in/completion
// - Display Philippine time accurately
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (user.role === "admin" || user.role === "staff") {
    window.location.href = "../adminHTML/admin.html";
    return;
  }

  setupLogout();
  loadReceipt();
});

// ============================================================
// SECTION 1: Logout
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
// SECTION 2: Load receipt
// ============================================================

async function loadReceipt() {
  const receiptBox = document.getElementById("receiptBox");
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("id");

  if (!receiptBox) return;

  if (!bookingId) {
    receiptBox.innerHTML = renderReceiptError("Booking ID is missing.");
    return;
  }

  try {
    receiptBox.innerHTML = `<div class="receipt-loading-box">Loading your receipt...</div>`;

    const response = await fetch(`${API_BASE}/bookings/${bookingId}/receipt`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load receipt.");
    }

    const booking = data.booking || data;
    const items = Array.isArray(booking.items) ? booking.items : [];

    const status = String(booking.status || "pending").toLowerCase();
    const paymentStatus = String(booking.payment_status || "pending").toLowerCase();

    const guestName = booking.fullname || buildFullName(booking) || "N/A";
    const totalGuests = Number(booking.guests || booking.guest_count || 0);

    const accommodationTotal = Number(booking.accommodation_total || 0);
    const paidAmount = Number(booking.paid_amount || 0);
    const remainingBalance = Number(booking.remaining_balance || 0);
    const estimatedEntranceFee = Number(booking.estimated_entrance_fee || 0);

    const entranceFeeCollected = Number(booking.entrance_fee_collected || 0);
    const entranceFeePaid = isTruthy(booking.entrance_fee_paid) || entranceFeeCollected > 0;

    const extraBedCount = Number(booking.extra_bed_count || 0);
    const extraBedFee = Number(booking.extra_bed_fee || 0);
    const extraBedPaid = isTruthy(booking.extra_bed_paid);

    const isCheckedIn = isTruthy(booking.is_checked_in);
    const isCompleted = status === "completed";

    // Conditional final receipt:
    // - Before check-in/completion: keep receipt simple.
    // - After check-in/completion or when onsite charges exist: show final payment details.
    const shouldShowFinalDetails =
      isCompleted ||
      isCheckedIn ||
      entranceFeePaid ||
      extraBedCount > 0 ||
      extraBedFee > 0 ||
      paymentStatus === "paid";

    const entranceToCollect = entranceFeePaid ? 0 : estimatedEntranceFee;
    const extraBedToCollect = extraBedPaid ? 0 : extraBedFee;

    const simpleOnsiteReminder = remainingBalance + estimatedEntranceFee;

    const finalTotalCollected =
      paidAmount + entranceFeeCollected + (extraBedPaid ? extraBedFee : 0);

    const finalOnsiteReminder =
      remainingBalance + entranceToCollect + extraBedToCollect;

    receiptBox.innerHTML = `
      <article class="minimal-receipt">
        <header class="receipt-hero">
          <div class="receipt-title">
            <h2>${isCompleted ? "Final Receipt" : "Reservation Receipt"}</h2>
            <p>
              ${
                isCompleted
                  ? "Final customer copy after front-desk processing."
                  : "Customer copy for front-desk verification."
              }
            </p>
          </div>

          <div class="receipt-code-box">
            <div class="receipt-code-label">Reservation Code</div>
            <div class="receipt-code-value">
              ${escapeHtml(booking.reservation_code || `#${booking.id}`)}
            </div>
          </div>
        </header>

        <div class="receipt-content">
          <section class="receipt-section">
            <h3>Reservation Details</h3>

            <div class="info-list">
              ${infoRow("Guest Name", escapeHtml(guestName))}
              ${infoRow("Contact No.", escapeHtml(booking.phone || booking.contact_no || "N/A"))}
              ${infoRow("Guest Count", escapeHtml(totalGuests))}
              ${infoRow("Reserved At", escapeHtml(formatPhilippineDateTime(booking.reserved_at || booking.created_at)))}
              ${
                booking.checked_in_at
                  ? infoRow("Checked In", escapeHtml(formatPhilippineDateTime(booking.checked_in_at)))
                  : ""
              }
              ${infoRow(
                "Status",
                `<span class="status-pill status-${escapeAttribute(status)}">${escapeHtml(capitalize(status))}</span>`
              )}
              ${infoRow(
                "Payment",
                `<span class="status-pill status-${escapeAttribute(paymentStatus)}">${escapeHtml(formatPaymentStatus(paymentStatus))}</span>`
              )}
            </div>
          </section>

          <section class="receipt-section">
            <h3>Accommodation</h3>

            <div class="items-list">
              ${
                items.length
                  ? items.map(renderAccommodationItem).join("")
                  : `<div class="receipt-item">No accommodation items found.</div>`
              }
            </div>
          </section>

          ${
            shouldShowFinalDetails
              ? renderFinalPaymentSummary({
                  accommodationTotal,
                  paidAmount,
                  remainingBalance,
                  estimatedEntranceFee,
                  entranceFeePaid,
                  entranceFeeCollected,
                  extraBedCount,
                  extraBedFee,
                  extraBedPaid,
                  extraBedPaidAt: booking.extra_bed_paid_at,
                  finalTotalCollected,
                  finalOnsiteReminder,
                })
              : renderSimplePaymentSummary({
                  accommodationTotal,
                  paidAmount,
                  remainingBalance,
                  estimatedEntranceFee,
                  simpleOnsiteReminder,
                })
          }

          <section class="receipt-reminder">
            <strong>Reminder:</strong>
            ${
              shouldShowFinalDetails
                ? "This receipt reflects the latest recorded payment details. Please contact the front desk for any questions."
                : "Present this reservation code at the front desk. Remaining balance, entrance fee, and valid discounts are finalized onsite."
            }
          </section>
        </div>
      </article>
    `;
  } catch (error) {
    console.error("loadReceipt error:", error);
    receiptBox.innerHTML = renderReceiptError(
      escapeHtml(error.message || "Failed to load receipt.")
    );
  }
}

// ============================================================
// SECTION 3: Receipt sections
// ============================================================

function renderAccommodationItem(item) {
  return `
    <div class="receipt-item">
      <strong>${escapeHtml(item.accommodation_name || "Accommodation")}</strong>
      ${escapeHtml(item.category_name || "-")} • ${escapeHtml(item.slot_label || "-")}<br>
      Check-in: ${escapeHtml(formatDateOnly(item.check_in_date))} • ${escapeHtml(formatTime(item.check_in_time))}<br>
      Check-out: ${escapeHtml(formatDateOnly(item.check_out_date))} • ${escapeHtml(formatTime(item.check_out_time))}<br>
      Stay Duration: ${escapeHtml(formatItemStayDuration(item))}<br>
      Price: ₱${formatMoney(item.item_price)}
    </div>
  `;
}

function formatItemStayDuration(item) {
  const duration = Number(item.stay_duration || 1);
  const slotLabel = String(item.slot_label || "").toLowerCase();

  if (slotLabel.includes("22") || slotLabel.includes("23")) {
    return `${duration} ${duration === 1 ? "day" : "days"}`;
  }

  if (slotLabel.includes("overnight")) {
    return `${duration} ${duration === 1 ? "night" : "nights"}`;
  }

  return "1 day only";
}

function renderSimplePaymentSummary(data) {
  return `
    <section class="payment-summary">
      <h3>Payment Summary</h3>

      ${amountRow("Accommodation Total", data.accommodationTotal)}
      ${amountRow("Downpayment Paid", data.paidAmount)}
      ${amountRow("Remaining Balance", data.remainingBalance)}
      ${amountRow("Entrance Fee Estimate", data.estimatedEntranceFee)}
      ${amountRow("Estimated Onsite Payment", data.simpleOnsiteReminder)}
    </section>
  `;
}

function renderFinalPaymentSummary(data) {
  return `
    <section class="payment-summary">
      <h3>Final Payment Details</h3>

      ${amountRow("Accommodation Total", data.accommodationTotal)}
      ${amountRow("Accommodation Paid", data.paidAmount)}
      ${amountRow("Remaining Balance", data.remainingBalance)}
      ${amountRow("Entrance Fee Estimate", data.estimatedEntranceFee)}
      ${amountRow("Entrance Fee Collected", data.entranceFeeCollected)}
      ${textRow("Entrance Fee Status", data.entranceFeePaid ? "Collected" : "To collect onsite")}

      ${
        data.extraBedCount > 0 || data.extraBedFee > 0
          ? `
            ${textRow("Extra Bed", `${data.extraBedCount} bed(s)`)}
            ${amountRow("Extra Bed Fee", data.extraBedFee)}
            ${textRow("Extra Bed Status", data.extraBedPaid ? "Paid" : "To collect onsite")}
            ${
              data.extraBedPaid && data.extraBedPaidAt
                ? textRow("Extra Bed Paid At", formatPhilippineDateTime(data.extraBedPaidAt))
                : ""
            }
          `
          : ""
      }

      ${amountRow("Total Collected", data.finalTotalCollected)}
      ${amountRow("Remaining To Collect Onsite", data.finalOnsiteReminder)}
    </section>
  `;
}

// ============================================================
// SECTION 4: UI helpers
// ============================================================

function renderReceiptError(message) {
  return `<div class="receipt-error-box">${message}</div>`;
}

function infoRow(label, value) {
  return `
    <div class="info-row">
      <div class="info-label">${escapeHtml(label)}</div>
      <div>${value}</div>
    </div>
  `;
}

function amountRow(label, value) {
  return `
    <div class="amount-row">
      <span>${escapeHtml(label)}</span>
      <strong>₱${formatMoney(value)}</strong>
    </div>
  `;
}

function textRow(label, value) {
  return `
    <div class="amount-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function buildFullName(booking) {
  return [booking.first_name, booking.middle_name, booking.last_name]
    .filter(Boolean)
    .join(" ");
}

// ============================================================
// SECTION 5: Philippine time helpers
// ============================================================

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
  const date = parseBackendDateTimeAsUtc(value);
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

// ============================================================
// SECTION 6: Format helpers
// ============================================================

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

function isTruthy(value) {
  return (
    Number(value || 0) === 1 ||
    String(value || "").toLowerCase() === "true" ||
    String(value || "").toLowerCase() === "yes"
  );
}

function formatMoney(value) {
  const num = Number(value || 0);

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

function escapeAttribute(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toLowerCase();
}
