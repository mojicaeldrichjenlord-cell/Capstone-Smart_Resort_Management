// ============================================================
// SMARTRESORT ADMIN BOOKING RECEIPT SCRIPT
// Purpose:
// - Check admin access
// - Load reservation receipt data
// - Render A4 admin receipt
// - Render thermal receipt
// - Print A4 or thermal format
// - Works from frontend/adminHTML/admin-booking-receipt.html
// ============================================================


// ============================================================
// SECTION 1: Page startup
// Runs access check, print button setup, and receipt loading.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAccess();
  setupLogoutButton();
  setupPrintButtons();
  loadAdminReceipt();
});

// ============================================================
// SECTION 2: Admin access checker
// Redirects unauthenticated users or non-admin users.
// ============================================================

function checkAdminAccess() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  if (user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "../index.html";
  }
}

// ============================================================
// SECTION 3: Logout button
// Clears logged-in user and returns to login page.
// ============================================================

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

// ============================================================
// SECTION 4: Print buttons
// Adds print mode class before printing.
// ============================================================

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

// ============================================================
// SECTION 5: Load admin receipt
// Gets booking ID from URL and fetches receipt data.
// ============================================================

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

// ============================================================
// SECTION 6: Render A4 receipt
// Displays reservation, guest, items, and payment breakdown.
// ============================================================

function renderReceipt(booking) {
  const items = Array.isArray(booking.items) ? booking.items : [];
  const source = String(booking.booking_source || "online").toLowerCase();
  const status = String(booking.status || "pending").toLowerCase();
  const paymentStatus = String(booking.payment_status || "pending").toLowerCase();

  const totalGuests = Number(booking.guests || booking.guest_count || 0);
  const freeEntrancePax = Number(booking.free_entrance_pax || 0);

  const chargeableGuests = Number(
    booking.chargeable_entrance_guests ??
      Math.max(totalGuests - freeEntrancePax, 0)
  );

  const estimatedEntranceFee = Number(booking.estimated_entrance_fee || 0);
  const entranceRate =
    chargeableGuests > 0 ? estimatedEntranceFee / chargeableGuests : 0;

  document.getElementById("reservationCode").textContent =
    booking.reservation_code || `#${booking.id}`;

  document.getElementById("reservationInfo").innerHTML = `
    ${infoRow("Reservation ID", `#${escapeHtml(booking.id)}`)}
    ${infoRow(
      "Source",
      `<span class="badge ${source === "manual" ? "manual" : "online"}">
        ${source === "manual" ? "Manual" : "Online"}
      </span>`
    )}
    ${infoRow(
      "Status",
      `<span class="badge ${getStatusClass(status)}">${capitalize(status)}</span>`
    )}
    ${infoRow(
      "Payment Status",
      `<span class="badge ${getPaymentClass(paymentStatus)}">
        ${formatPaymentStatus(paymentStatus)}
      </span>`
    )}
    ${infoRow(
      "Payment Method",
      escapeHtml(formatPaymentMethod(booking.payment_method || "cash"))
    )}
    ${infoRow(
      "Reserved At",
      escapeHtml(formatDateTime(booking.reserved_at || booking.created_at))
    )}
    ${infoRow(
      "Reserved Date",
      escapeHtml(formatDate(booking.reserved_at || booking.created_at))
    )}
    ${infoRow(
      "Reserved Time",
      escapeHtml(formatTimeFromDateTime(booking.reserved_at || booking.created_at))
    )}
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
        <td colspan="7" style="text-align:center;color:#64748b;">
          No reserved items found.
        </td>
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
        Number(booking.remaining_balance || 0) +
          Number(booking.estimated_entrance_fee || 0)
      )}</strong>
    </div>
  `;

  document.getElementById("referenceInfo").innerHTML = `
    ${infoRow("Proof / Reference", renderProofOrReference(booking.proof_of_payment))}
    ${infoRow("Note", escapeHtml(booking.note || "-"))}
  `;
}

// ============================================================
// SECTION 7: Render proof/reference
// Converts upload path into a clickable backend file link.
// ============================================================

function renderProofOrReference(proofValue) {
  const value = String(proofValue || "").trim();

  if (!value) {
    return "-";
  }

  const proofUrl = buildProofUrl(value);

  if (!proofUrl) {
    return escapeHtml(value);
  }

  return `
    <a
      href="${escapeHtml(proofUrl)}"
      target="_blank"
      rel="noopener noreferrer"
      style="color:#0ea5e9;word-break:break-all;"
    >
      View Uploaded Proof
    </a>
  `;
}

// ============================================================
// SECTION 8: Build proof URL
// Turns /uploads path into backend static file URL.
// ============================================================

function buildProofUrl(value) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return `http://127.0.0.1:5000${value}`;
  }

  if (value.startsWith("uploads/")) {
    return `http://127.0.0.1:5000/${value}`;
  }

  return "";
}

// ============================================================
// SECTION 9: Render thermal receipt
// Builds POS-style receipt for thermal printing.
// ============================================================

function renderThermalReceipt(booking) {
  const items = Array.isArray(booking.items) ? booking.items : [];
  const totalGuests = Number(booking.guests || booking.guest_count || 0);
  const freeEntrancePax = Number(booking.free_entrance_pax || 0);

  const chargeableGuests = Number(
    booking.chargeable_entrance_guests ??
      Math.max(totalGuests - freeEntrancePax, 0)
  );

  const onsiteTotal =
    Number(booking.remaining_balance || 0) +
    Number(booking.estimated_entrance_fee || 0);

  const thermal = document.getElementById("thermalReceipt");
  if (!thermal) return;

  thermal.innerHTML = `
    <div class="thermal-inner">
      <div class="thermal-center">
        <div class="thermal-title">SMART RESORT</div>
        <div class="thermal-sub">ADMIN RECEIPT</div>
        <div class="thermal-code">${escapeHtml(
          booking.reservation_code || `#${booking.id}`
        )}</div>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-row">
        <span>Guest</span>
        <span>${escapeHtml(booking.fullname || "-")}</span>
      </div>

      <div class="thermal-row">
        <span>Guests</span>
        <span>${totalGuests}</span>
      </div>

      <div class="thermal-row">
        <span>Payment</span>
        <span>${formatPaymentStatus(booking.payment_status || "pending")}</span>
      </div>

      <div class="thermal-row">
        <span>Method</span>
        <span>${formatPaymentMethod(booking.payment_method || "cash")}</span>
      </div>

      <div class="thermal-row">
        <span>Date</span>
        <span>${formatDate(booking.reserved_at || booking.created_at)}</span>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-section-title">ITEMS</div>

      ${
        items.length
          ? items
              .map(
                (item) => `
                  <div class="thermal-item">
                    <div class="thermal-bold">${escapeHtml(
                      item.accommodation_name || "-"
                    )}</div>
                    <div class="thermal-small">${escapeHtml(item.slot_label || "-")}</div>
                    <div class="thermal-small">
                      ${formatDate(item.check_in_date)} ${formatTime(item.check_in_time)}
                    </div>

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

      <div class="thermal-divider"></div>

      <div class="thermal-section-title">ENTRANCE</div>

      <div class="thermal-row">
        <span>Free Pax</span>
        <span>${freeEntrancePax}</span>
      </div>

      <div class="thermal-row">
        <span>Chargeable</span>
        <span>${chargeableGuests}</span>
      </div>

      <div class="thermal-row">
        <span>Entrance Fee</span>
        <span>₱${formatMoney(booking.estimated_entrance_fee)}</span>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-section-title">PAYMENT</div>

      <div class="thermal-row">
        <span>Accommodation</span>
        <span>₱${formatMoney(booking.accommodation_total)}</span>
      </div>

      <div class="thermal-row">
        <span>Paid</span>
        <span>₱${formatMoney(booking.paid_amount)}</span>
      </div>

      <div class="thermal-row">
        <span>Remaining</span>
        <span>₱${formatMoney(booking.remaining_balance)}</span>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-total-box">
        <div class="thermal-total-label">ONSITE PAYMENT</div>
        <div class="thermal-total-amount">₱${formatMoney(onsiteTotal)}</div>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-note">
        ${escapeHtml(booking.note || "Present this receipt at the front desk.")}
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-center thermal-small">
        SmartResort System<br />
        Keep this receipt for verification
      </div>
    </div>
  `;
}

// ============================================================
// SECTION 10: HTML row helpers
// Creates reusable info rows and amount rows.
// ============================================================

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

// ============================================================
// SECTION 11: Badge class helpers
// Returns class names for status and payment labels.
// ============================================================

function getStatusClass(status) {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "completed") return "paid";
  if (status === "cancelled") return "rejected";
  return "pending";
}

function getPaymentClass(status) {
  if (status === "paid") return "paid";
  if (status === "partially_paid") return "partial";
  if (status === "rejected") return "rejected";
  if (status === "unpaid") return "rejected";
  return "pending";
}

// ============================================================
// SECTION 12: Format helpers
// Formats payment method, status, dates, time, money, and text.
// ============================================================

function formatPaymentMethod(method) {
  const value = String(method || "").toLowerCase();

  if (value === "gcash") return "GCash";
  if (value === "paymaya") return "PayMaya";
  if (value === "cash") return "Cash";
  if (value === "bank_transfer") return "Bank Transfer";
  if (value === "other") return "Other";

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

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
}

function formatTime(timeValue) {
  if (!timeValue) return "N/A";

  const text = String(timeValue).trim();
  const parts = text.split(":");

  if (parts.length < 2) {
    return text;
  }

  let hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) {
    return text;
  }

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

function formatTimeFromDateTime(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

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

// ============================================================
// SECTION 13: HTML escaping helper
// Prevents unsafe text from breaking the receipt layout.
// ============================================================

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")  
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}