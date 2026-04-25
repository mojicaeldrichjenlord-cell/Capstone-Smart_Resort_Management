const API_BASE = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupPrintButtons();
  loadAdminReceipt();
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

function setupPrintButtons() {
  const printA4Btn = document.getElementById("printA4Btn");
  const printThermalBtn = document.getElementById("printThermalBtn");

  if (printA4Btn) {
    printA4Btn.addEventListener("click", () => {
      document.body.classList.remove("print-thermal");
      document.body.classList.add("print-a4");
      window.print();
      setTimeout(() => {
        document.body.classList.remove("print-a4");
      }, 500);
    });
  }

  if (printThermalBtn) {
    printThermalBtn.addEventListener("click", () => {
      document.body.classList.remove("print-a4");
      document.body.classList.add("print-thermal");
      window.print();
      setTimeout(() => {
        document.body.classList.remove("print-thermal");
      }, 500);
    });
  }
}

async function loadAdminReceipt() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("id");

  if (!bookingId) {
    alert("Booking ID is missing.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/bookings/${bookingId}/receipt`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load admin receipt.");
    }

    const booking = data.booking || data;
    renderReceipt(booking);
    renderThermalReceipt(booking);
  } catch (error) {
    console.error("loadAdminReceipt error:", error);
    alert(error.message || "Failed to load admin receipt.");
  }
}

function renderReceipt(booking) {
  const items = Array.isArray(booking.items) ? booking.items : [];
  const source = String(booking.booking_source || "online").toLowerCase();
  const status = String(booking.status || "pending").toLowerCase();
  const paymentStatus = String(booking.payment_status || "pending").toLowerCase();

  const totalGuests = Number(booking.guests || booking.guest_count || 0);
  const freeEntrancePax = Number(booking.free_entrance_pax || 0);
  const chargeableGuests = Number(
    booking.chargeable_entrance_guests ?? Math.max(totalGuests - freeEntrancePax, 0)
  );
  const estimatedEntranceFee = Number(booking.estimated_entrance_fee || 0);
  const entranceRate = chargeableGuests > 0 ? estimatedEntranceFee / chargeableGuests : 0;

  document.getElementById("reservationCode").textContent =
    booking.reservation_code || `#${booking.id}`;

  document.getElementById("reservationInfo").innerHTML = `
    ${infoRow("Reservation ID", `#${escapeHtml(booking.id)}`)}
    ${infoRow("Source", `<span class="badge ${source === "manual" ? "manual" : "online"}">${source === "manual" ? "Manual" : "Online"}</span>`)}
    ${infoRow("Status", `<span class="badge ${getStatusClass(status)}">${capitalize(status)}</span>`)}
    ${infoRow("Payment Status", `<span class="badge ${getPaymentClass(paymentStatus)}">${formatPaymentStatus(paymentStatus)}</span>`)}
    ${infoRow("Payment Method", escapeHtml(formatPaymentMethod(booking.payment_method || "cash")))}
    ${infoRow("Reserved At", escapeHtml(formatDateTime(booking.reserved_at || booking.created_at)))}
    ${infoRow("Reserved Date", escapeHtml(formatDate(booking.reserved_at || booking.created_at)))}
    ${infoRow("Reserved Time", escapeHtml(formatTimeFromDateTime(booking.reserved_at || booking.created_at)))}
  `;

  document.getElementById("guestInfo").innerHTML = `
    ${infoRow("Guest Name", escapeHtml(booking.fullname || "-"))}
    ${infoRow("Phone", escapeHtml(booking.phone || booking.contact_no || "-"))}
    ${infoRow("Email", escapeHtml(booking.email || "-"))}
    ${infoRow("Guest Count", escapeHtml(totalGuests))}
    ${infoRow("Entrance Fee Estimate", `₱${formatMoney(estimatedEntranceFee)}`)}
  `;

  document.getElementById("itemsTableBody").innerHTML = items.length
    ? items
        .map(
          (item) => `
      <tr>
        <td>${escapeHtml(item.accommodation_name || "-")}</td>
        <td>${escapeHtml(item.category_name || "-")}</td>
        <td>${escapeHtml(item.slot_label || "-")}</td>
        <td>${formatDate(item.check_in_date)} ${formatTime(item.check_in_time)}</td>
        <td>${formatDate(item.check_out_date)} ${formatTime(item.check_out_time)}</td>
        <td>₱${formatMoney(item.item_price)}</td>
        <td>${escapeHtml(item.map_label || "-")}</td>
      </tr>
    `
        )
        .join("")
    : `
      <tr>
        <td colspan="7" style="text-align:center;color:#64748b;">No reserved items found.</td>
      </tr>
    `;

  document.getElementById("deductionInfo").innerHTML = `
    ${infoRow("Total Guests", escapeHtml(totalGuests))}
    ${infoRow("Free Entrance Included", `${escapeHtml(freeEntrancePax)} pax`)}
    ${infoRow("Chargeable Entrance Guests", `${escapeHtml(chargeableGuests)} pax`)}
    ${infoRow("Entrance Rate Used", `₱${formatMoney(entranceRate)}`)}
    ${infoRow("Estimated Entrance Fee", `₱${formatMoney(estimatedEntranceFee)}`)}
  `;

  document.getElementById("paymentBreakdown").innerHTML = `
    ${amountRow("Accommodation Total", booking.accommodation_total)}
    ${amountRow("Required Down Payment", booking.required_downpayment)}
    ${amountRow("Paid Amount", booking.paid_amount)}
    ${amountRow("Remaining Balance", booking.remaining_balance)}
    ${amountRow("Entrance Fee Estimate", booking.estimated_entrance_fee)}
    <div class="amount-total">
      <span>Total Onsite Reminder</span>
      <strong>₱${formatMoney(
        Number(booking.remaining_balance || 0) + Number(booking.estimated_entrance_fee || 0)
      )}</strong>
    </div>
  `;

  document.getElementById("referenceInfo").innerHTML = `
    ${infoRow(
      "Proof / Reference",
      booking.proof_of_payment
        ? `<a href="${escapeHtml(booking.proof_of_payment)}" target="_blank" rel="noopener noreferrer" style="color:#0ea5e9;word-break:break-all;">${escapeHtml(booking.proof_of_payment)}</a>`
        : "-"
    )}
    ${infoRow("Note", escapeHtml(booking.note || "-"))}
  `;
}

function renderThermalReceipt(booking) {
  const items = Array.isArray(booking.items) ? booking.items : [];
  const totalGuests = Number(booking.guests || booking.guest_count || 0);
  const freeEntrancePax = Number(booking.free_entrance_pax || 0);
  const chargeableGuests = Number(
    booking.chargeable_entrance_guests ?? Math.max(totalGuests - freeEntrancePax, 0)
  );

  const thermal = document.getElementById("thermalReceipt");
  if (!thermal) return;

  thermal.innerHTML = `
    <div class="thermal-inner">
      <div class="thermal-center">
        <div class="thermal-title">SMARTRESORT</div>
        <div class="thermal-bold">ADMIN RECEIPT</div>
        <div>${escapeHtml(booking.reservation_code || `#${booking.id}`)}</div>
      </div>

      <div class="thermal-divider"></div>

      <div><span class="thermal-bold">Guest:</span> ${escapeHtml(booking.fullname || "-")}</div>
      <div><span class="thermal-bold">Phone:</span> ${escapeHtml(booking.phone || booking.contact_no || "-")}</div>
      <div><span class="thermal-bold">Source:</span> ${escapeHtml(String(booking.booking_source || "online"))}</div>
      <div><span class="thermal-bold">Status:</span> ${escapeHtml(String(booking.status || "pending"))}</div>
      <div><span class="thermal-bold">Payment:</span> ${escapeHtml(formatPaymentStatus(booking.payment_status || "pending"))}</div>
      <div><span class="thermal-bold">Method:</span> ${escapeHtml(formatPaymentMethod(booking.payment_method || "cash"))}</div>
      <div><span class="thermal-bold">Reserved At:</span> ${escapeHtml(formatDateTime(booking.reserved_at || booking.created_at))}</div>

      <div class="thermal-divider"></div>

      <div class="thermal-bold">ITEMS</div>
      <div class="thermal-items">
        ${
          items.length
            ? items
                .map(
                  (item) => `
            <div class="thermal-item">
              <div class="thermal-bold">${escapeHtml(item.accommodation_name || "-")}</div>
              <div>${escapeHtml(item.slot_label || "-")}</div>
              <div>${formatDate(item.check_in_date)} ${formatTime(item.check_in_time)}</div>
              <div>${formatDate(item.check_out_date)} ${formatTime(item.check_out_time)}</div>
              <div class="thermal-row">
                <span>Price</span>
                <span>₱${formatMoney(item.item_price)}</span>
              </div>
            </div>
          `
                )
                .join("")
            : `<div>No items found.</div>`
        }
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-row">
        <span>Total Guests</span>
        <span>${escapeHtml(totalGuests)}</span>
      </div>
      <div class="thermal-row">
        <span>Free Entrance</span>
        <span>${escapeHtml(freeEntrancePax)} pax</span>
      </div>
      <div class="thermal-row">
        <span>Chargeable Guests</span>
        <span>${escapeHtml(chargeableGuests)} pax</span>
      </div>
      <div class="thermal-row">
        <span>Accommodation Total</span>
        <span>₱${formatMoney(booking.accommodation_total)}</span>
      </div>
      <div class="thermal-row">
        <span>Paid Amount</span>
        <span>₱${formatMoney(booking.paid_amount)}</span>
      </div>
      <div class="thermal-row">
        <span>Remaining Balance</span>
        <span>₱${formatMoney(booking.remaining_balance)}</span>
      </div>
      <div class="thermal-row">
        <span>Entrance Fee</span>
        <span>₱${formatMoney(booking.estimated_entrance_fee)}</span>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-row thermal-bold">
        <span>ONSITE TOTAL</span>
        <span>₱${formatMoney(
          Number(booking.remaining_balance || 0) + Number(booking.estimated_entrance_fee || 0)
        )}</span>
      </div>

      <div class="thermal-divider"></div>

      <div>${escapeHtml(booking.note || "-")}</div>

      <div class="thermal-divider"></div>

      <div class="thermal-center">
        <div>Keep this receipt for resort reference.</div>
      </div>
    </div>
  `;
}

function infoRow(label, value) {
  return `
    <div class="info-row">
      <strong>${label}</strong>
      <div>${value}</div>
    </div>
  `;
}

function amountRow(label, value) {
  return `
    <div class="amount-row">
      <span>${label}</span>
      <strong>₱${formatMoney(value)}</strong>
    </div>
  `;
}

function getStatusClass(status) {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "paid") return "paid";
  return "pending";
}

function getPaymentClass(status) {
  if (status === "paid") return "paid";
  if (status === "partially_paid") return "partial";
  if (status === "rejected") return "rejected";
  return "pending";
}

function formatPaymentMethod(method) {
  const value = String(method || "").toLowerCase();
  if (value === "gcash") return "GCash";
  if (value === "paymaya") return "PayMaya";
  if (value === "cash") return "Cash";
  if (value === "bank_transfer") return "Bank Transfer";
  return capitalize(value);
}

function formatPaymentStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value === "pending") return "Pending";
  if (value === "paid") return "Paid";
  if (value === "partially_paid") return "Partially Paid";
  if (value === "rejected") return "Rejected";
  if (value === "unpaid") return "Unpaid";
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

function formatDateTime(dateValue) {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
}

function formatTimeFromDateTime(dateValue) {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "N/A";

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}