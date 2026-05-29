const API_BASE = "http://127.0.0.1:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  setupLogout();
  setupDownloadButton();
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

function setupDownloadButton() {
  const downloadBtn = document.getElementById("downloadReceiptBtn");
  if (!downloadBtn) return;

  downloadBtn.addEventListener("click", async () => {
    const receiptBox = document.getElementById("receiptBox");
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("id") || "receipt";

    if (!receiptBox) {
      showMessage("Receipt content not found.", "error");
      return;
    }

    try {
      downloadBtn.disabled = true;
      downloadBtn.textContent = "Preparing Image...";

      const canvas = await html2canvas(receiptBox, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imageUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `SmartResort-Receipt-${bookingId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showMessage("Receipt image downloaded successfully.", "success");
    } catch (error) {
      console.error("downloadReceipt error:", error);
      showMessage("Failed to download receipt image.", "error");
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = "Download Receipt (Image)";
    }
  });
}

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
    receiptBox.innerHTML = `
      <div style="
        max-width: 1100px;
        margin: 0 auto;
        background: rgba(255,255,255,0.96);
        border-radius: 28px;
        padding: 26px;
        box-shadow: 0 18px 40px rgba(15,23,42,0.08);
        border: 1px solid rgba(219,231,239,0.92);
        text-align: center;
        color: #475569;
      ">
        Loading your receipt...
      </div>
    `;

    const response = await fetch(`${API_BASE}/bookings/${bookingId}/receipt`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load receipt.");
    }

    const booking = data.booking || data;
    const status = String(booking.status || "pending").toLowerCase();
    const paymentStatus = String(booking.payment_status || "pending").toLowerCase();
    const bookingSource = String(booking.booking_source || "online").toLowerCase();
    const isManual = bookingSource === "manual" || bookingSource === "walk-in";
    const coverImage = escapeHtml(booking.image || "images/no-image.jpg");

    const items = Array.isArray(booking.items) ? booking.items : [];
    const totalGuests = Number(booking.guests || booking.guest_count || 0);
    const freeEntrancePax = Number(booking.free_entrance_pax || 0);
    const chargeableEntranceGuests = Number(
      booking.chargeable_entrance_guests ?? Math.max(totalGuests - freeEntrancePax, 0)
    );
    const estimatedEntranceFee = Number(booking.estimated_entrance_fee || 0);
    const entranceRateUsed =
      chargeableEntranceGuests > 0
        ? estimatedEntranceFee / chargeableEntranceGuests
        : 0;

    receiptBox.innerHTML = `
      <div style="
        max-width: 1100px;
        margin: 0 auto;
        background: rgba(255,255,255,0.97);
        border-radius: 30px;
        overflow: hidden;
        box-shadow: 0 22px 46px rgba(15,23,42,0.1);
        border: 1px solid rgba(219,231,239,0.92);
      ">
        <div style="
          background: linear-gradient(135deg, #0f172a 0%, #16233b 55%, #14b8a6 100%);
          color: white;
          padding: 22px 24px;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          flex-wrap: wrap;
        ">
          <div>
            <h1 style="margin:0 0 8px;font-size:2rem;line-height:1.1;">Reservation Receipt</h1>
            <p style="margin:0;opacity:0.95;line-height:1.6;">
              Customer copy for reservation reference, payment verification, and front-desk presentation.
            </p>
          </div>

          <div style="
            min-width: 180px;
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.14);
            border-radius: 18px;
            padding: 12px 16px;
            text-align: center;
            backdrop-filter: blur(10px);
          ">
            <div style="font-size:0.8rem;opacity:0.9;font-weight:700;">Reservation Code</div>
            <div style="font-size:1.45rem;font-weight:900;letter-spacing:0.4px;">
              ${escapeHtml(booking.reservation_code || `#${booking.id}`)}
            </div>
          </div>
        </div>

        <div style="padding: 20px;">
          <div style="
            display:grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
            margin-bottom: 18px;
          " class="receipt-top-grid">
            <div style="${sectionCardStyle()}">
              <h2 style="${sectionTitleStyle()}">Reservation Information</h2>
              ${infoRow("Reservation ID", `#${escapeHtml(booking.id)}`)}
              ${infoRow("Source", `<span style="${getSourceBadgeStyles(bookingSource)}">${isManual ? "Manual" : "Online"}</span>`)}
              ${infoRow("Status", `<span style="${getStatusBadgeStyles(status)}">${capitalize(status)}</span>`)}
              ${infoRow("Payment Status", `<span style="${getPaymentBadgeStyles(paymentStatus)}">${formatPaymentStatus(paymentStatus)}</span>`)}
              ${infoRow("Payment Method", escapeHtml(formatPaymentMethod(booking.payment_method || "cash")))}
              ${infoRow("Reserved At", escapeHtml(formatDateTime(booking.reserved_at || booking.created_at)))}
              ${infoRow("Reserved Date", escapeHtml(formatDate(booking.reserved_at || booking.created_at)))}
              ${infoRow("Reserved Time", escapeHtml(formatTimeFromDateTime(booking.reserved_at || booking.created_at)))}
            </div>

            <div style="${sectionCardStyle()}">
              <h2 style="${sectionTitleStyle()}">Guest Information</h2>
              ${infoRow("Guest Name", escapeHtml(booking.fullname || "N/A"))}
              ${infoRow("Phone", escapeHtml(booking.phone || booking.contact_no || "N/A"))}
              ${infoRow("Email", escapeHtml(booking.email || "-"))}
              ${infoRow("Guest Count", escapeHtml(totalGuests))}
              ${infoRow("Entrance Fee Estimate", `₱${formatMoney(estimatedEntranceFee)}`)}
            </div>
          </div>

          <div style="${tableShellStyle()}">
            <div style="${tableHeaderStyle()}">Reserved Accommodation Items</div>
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;min-width:760px;">
                <thead>
                  <tr style="background:#f8fafc;color:#0f172a;">
                    <th style="${thStyle()}">Accommodation</th>
                    <th style="${thStyle()}">Category</th>
                    <th style="${thStyle()}">Slot</th>
                    <th style="${thStyle()}">Check In</th>
                    <th style="${thStyle()}">Check Out</th>
                    <th style="${thStyle()}">Price</th>
                    <th style="${thStyle()}">Map Label</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    items.length
                      ? items
                          .map(
                            (item) => `
                      <tr>
                        <td style="${tdStyle()}">${escapeHtml(item.accommodation_name || "-")}</td>
                        <td style="${tdStyle()}">${escapeHtml(item.category_name || "-")}</td>
                        <td style="${tdStyle()}">${escapeHtml(item.slot_label || "-")}</td>
                        <td style="${tdStyle()}">${formatDate(item.check_in_date)} ${formatTime(item.check_in_time)}</td>
                        <td style="${tdStyle()}">${formatDate(item.check_out_date)} ${formatTime(item.check_out_time)}</td>
                        <td style="${tdStyle()}">₱${formatMoney(item.item_price)}</td>
                        <td style="${tdStyle()}">${escapeHtml(item.map_label || "-")}</td>
                      </tr>
                    `
                          )
                          .join("")
                      : `
                        <tr>
                          <td colspan="7" style="${tdStyle()}text-align:center;color:#64748b;">
                            No reserved items found.
                          </td>
                        </tr>
                      `
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div style="
            display:grid;
            grid-template-columns: 1fr 0.95fr;
            gap: 18px;
            margin-top: 18px;
          " class="receipt-bottom-grid">
            <div style="${sectionCardStyle()}">
              <h2 style="${sectionTitleStyle()}">Entrance Fee Deduction Details</h2>
              ${infoRow("Total Guests", escapeHtml(totalGuests))}
              ${infoRow("Free Entrance Included", `${escapeHtml(freeEntrancePax)} pax`)}
              ${infoRow("Chargeable Entrance Guests", `${escapeHtml(chargeableEntranceGuests)} pax`)}
              ${infoRow("Entrance Rate Used", `₱${formatMoney(entranceRateUsed)}`)}
              ${infoRow("Estimated Entrance Fee", `₱${formatMoney(estimatedEntranceFee)}`)}

              <div style="
                margin-top:14px;
                background:#fff7ed;
                border:1px solid #fdba74;
                border-radius:14px;
                padding:12px 14px;
                color:#9a3412;
                line-height:1.7;
                font-size:0.93rem;
              ">
                This deduction is based on the free entrance included in your selected accommodation.
                Senior, PWD, and kids discounts will still be verified onsite.
              </div>
            </div>

            <div style="
              background: linear-gradient(180deg, #0f172a 0%, #16233b 100%);
              color: white;
              border-radius: 22px;
              padding: 20px;
            ">
              <h2 style="margin:0 0 14px;font-size:1.18rem;">Payment Breakdown</h2>
              ${summaryAmountRow("Accommodation Total", booking.accommodation_total)}
              ${summaryAmountRow("Required Down Payment", booking.required_downpayment)}
              ${summaryAmountRow("Paid Amount", booking.paid_amount)}
              ${summaryAmountRow("Remaining Balance", booking.remaining_balance)}
              ${summaryAmountRow("Entrance Fee Estimate", booking.estimated_entrance_fee)}
              <div style="
                display:flex;
                justify-content:space-between;
                gap:12px;
                margin-top:12px;
                padding-top:12px;
                border-top:1px solid rgba(255,255,255,0.15);
                font-weight:900;
                font-size:1.08rem;
              ">
                <span>Total Onsite Reminder</span>
                <strong>₱${formatMoney(
                  Number(booking.remaining_balance || 0) +
                    Number(booking.estimated_entrance_fee || 0)
                )}</strong>
              </div>
            </div>
          </div>

          <div style="
            display:grid;
            grid-template-columns: 1fr 1fr;
            gap:18px;
            margin-top:18px;
          " class="receipt-last-grid">
            <div style="${sectionCardStyle()}">
              <h2 style="${sectionTitleStyle()}">Payment Reference / Note</h2>
              ${infoRow(
                "Proof / Reference",
                booking.proof_of_payment
                  ? `<a href="${escapeHtml(booking.proof_of_payment)}" target="_blank" rel="noopener noreferrer" style="color:#0ea5e9;word-break:break-all;">${escapeHtml(booking.proof_of_payment)}</a>`
                  : "-"
              )}
              ${infoRow("Note", escapeHtml(booking.note || "-"))}
            </div>

            <div style="${sectionCardStyle()}">
              <h2 style="${sectionTitleStyle()}">Reminder</h2>
              <div style="color:#334155;line-height:1.8;font-size:0.95rem;">
                Please keep this receipt for your reservation record.<br>
                Present your reservation code at the front desk.<br>
                The remaining balance and final entrance-related charges will be settled onsite.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        @media (max-width: 900px) {
          .receipt-top-grid,
          .receipt-bottom-grid,
          .receipt-last-grid {
            grid-template-columns: 1fr !important;
          }
        }
      </style>
    `;
  } catch (error) {
    console.error("loadReceipt error:", error);
    receiptBox.innerHTML = renderReceiptError(
      escapeHtml(error.message || "Failed to load receipt.")
    );
  }
}

function renderReceiptError(message) {
  return `
    <div style="
      max-width: 920px;
      margin: 0 auto;
      background: rgba(255,255,255,0.95);
      border: 1px solid #fecaca;
      border-radius: 24px;
      padding: 24px;
      color: #991b1b;
      text-align: center;
      box-shadow: 0 12px 28px rgba(15,23,42,0.08);
    ">
      ${message}
    </div>
  `;
}

function sectionCardStyle() {
  return `
    background: linear-gradient(180deg, #fcfeff 0%, #f4fbfc 100%);
    border: 1px solid #dbe7ef;
    border-radius: 22px;
    padding: 18px;
  `;
}

function sectionTitleStyle() {
  return `
    margin:0 0 12px;
    color:#0f172a;
    font-size:1.12rem;
    font-weight:800;
  `;
}

function infoRow(label, value) {
  return `
    <div style="
      display:grid;
      grid-template-columns: 1fr 1.1fr;
      gap:12px;
      padding:10px 0;
      border-bottom:1px solid #dbe7ef;
      align-items:start;
      color:#334155;
      font-size:0.95rem;
      line-height:1.5;
    ">
      <div style="font-weight:700;color:#0f172a;">${label}</div>
      <div>${value}</div>
    </div>
  `;
}

function tableShellStyle() {
  return `
    background:#ffffff;
    border:1px solid #dbe7ef;
    border-radius:20px;
    overflow:hidden;
  `;
}

function tableHeaderStyle() {
  return `
    background: linear-gradient(180deg, #0f172a 0%, #111c34 100%);
    color: white;
    padding: 14px 16px;
    font-size: 1.02rem;
    font-weight: 800;
  `;
}

function thStyle() {
  return `
    padding:12px 10px;
    border-bottom:1px solid #dbe7ef;
    text-align:left;
    font-size:0.9rem;
    white-space:nowrap;
  `;
}

function tdStyle() {
  return `
    padding:12px 10px;
    border-bottom:1px solid #e5e7eb;
    color:#334155;
    font-size:0.9rem;
    vertical-align:top;
  `;
}

function summaryAmountRow(label, value) {
  return `
    <div style="
      display:flex;
      justify-content:space-between;
      gap:12px;
      margin-bottom:10px;
      font-size:0.96rem;
    ">
      <span>${label}</span>
      <strong>₱${formatMoney(value)}</strong>
    </div>
  `;
}

function getSourceBadgeStyles(source) {
  const value = String(source || "").toLowerCase();
  if (value === "manual" || value === "walk-in") {
    return `
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:7px 12px;
      border-radius:999px;
      background:#dcfce7;
      color:#166534;
      border:1px solid #bbf7d0;
      font-size:0.82rem;
      font-weight:800;
    `;
  }

  return `
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:7px 12px;
    border-radius:999px;
    background:#dbeafe;
    color:#1d4ed8;
    border:1px solid #bfdbfe;
    font-size:0.82rem;
    font-weight:800;
  `;
}

function getStatusBadgeStyles(status) {
  if (status === "approved") {
    return `
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:7px 12px;
      border-radius:999px;
      background:#dcfce7;
      color:#166534;
      border:1px solid #bbf7d0;
      font-size:0.82rem;
      font-weight:800;
    `;
  }
  if (status === "rejected") {
    return `
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:7px 12px;
      border-radius:999px;
      background:#fee2e2;
      color:#991b1b;
      border:1px solid #fecaca;
      font-size:0.82rem;
      font-weight:800;
    `;
  }
  if (status === "cancelled") {
    return `
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:7px 12px;
      border-radius:999px;
      background:#e5e7eb;
      color:#374151;
      border:1px solid #d1d5db;
      font-size:0.82rem;
      font-weight:800;
    `;
  }
  if (status === "completed") {
    return `
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:7px 12px;
      border-radius:999px;
      background:#dbeafe;
      color:#1d4ed8;
      border:1px solid #bfdbfe;
      font-size:0.82rem;
      font-weight:800;
    `;
  }
  return `
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:7px 12px;
    border-radius:999px;
    background:#fef3c7;
    color:#92400e;
    border:1px solid #fde68a;
    font-size:0.82rem;
    font-weight:800;
  `;
}

function getPaymentBadgeStyles(status) {
  if (status === "paid") {
    return `
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:7px 12px;
      border-radius:999px;
      background:#dcfce7;
      color:#166534;
      border:1px solid #bbf7d0;
      font-size:0.82rem;
      font-weight:800;
    `;
  }

  if (status === "pending") {
    return `
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:7px 12px;
      border-radius:999px;
      background:#fef3c7;
      color:#92400e;
      border:1px solid #fde68a;
      font-size:0.82rem;
      font-weight:800;
    `;
  }

  if (status === "partially_paid") {
    return `
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:7px 12px;
      border-radius:999px;
      background:#dbeafe;
      color:#1d4ed8;
      border:1px solid #bfdbfe;
      font-size:0.82rem;
      font-weight:800;
    `;
  }

  if (status === "rejected") {
    return `
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:7px 12px;
      border-radius:999px;
      background:#fee2e2;
      color:#991b1b;
      border:1px solid #fecaca;
      font-size:0.82rem;
      font-weight:800;
    `;
  }

  return `
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:7px 12px;
    border-radius:999px;
    background:#e5e7eb;
    color:#374151;
    border:1px solid #d1d5db;
    font-size:0.82rem;
    font-weight:800;
  `;
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