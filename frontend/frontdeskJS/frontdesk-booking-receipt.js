// ============================================================
// SMARTRESORT FRONT DESK FINAL THERMAL RECEIPT SCRIPT
// File: frontend/frontdeskJS/frontdesk-booking-receipt.js
// Purpose:
// - Check Front Desk access
// - Load reservation receipt data
// - Render thermal-only front-desk receipt
// - Use actual recorded collections for final receipt totals
// - Prevent duplicate Extra Bed counting when booking_charges already stores it
// - Display Philippine time accurately
// ============================================================

const RESORT_INFO = {
  name: "Arvic Seaside Beach Resort and Hotel",
  shortName: "ARVIC SEASIDE",
  address: "17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite",
  contact: "0956-912-5625 / 0967-817-0662",
  email: "resortarvicseaside@gmail.com",
  facebook: "https://www.facebook.com/share/1E1kZLtrV4/?mibextid=wwXIfr",
  tiktok: "https://www.tiktok.com/@arvicseaside?_r=1&_t=ZS-9780VTxjMxB",
  operatingHours: "Open 24 hours, Monday to Sunday",
};

document.addEventListener("DOMContentLoaded", () => {
  checkFrontDeskAccess();
  setupLogoutButton();
  setupPrintButton();
  loadFrontDeskReceipt();
});

function checkFrontDeskAccess() {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return;
  }

  const role = String(user.role || "")
    .trim()
    .toLowerCase();

  const normalizedRole =
    role === "staff"
      ? "frontdesk"
      : role;

  if (normalizedRole !== "frontdesk") {
    alert("Access denied. Front Desk only.");
    window.location.href = "../authHTML/login.html";
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

async function loadFrontDeskReceipt() {
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
      throw new Error(data.message || "Failed to load final receipt.");
    }

    const booking = data.booking || data;
    renderThermalReceipt(booking);
  } catch (error) {
    console.error("loadFrontDeskReceipt error:", error);

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

function getEntranceAdjustments(booking) {
  if (Array.isArray(booking.entrance_adjustments)) {
    return booking.entrance_adjustments;
  }

  if (Array.isArray(booking.discounts)) {
    return booking.discounts;
  }

  if (booking.discount) {
    return [booking.discount];
  }

  return [];
}

function getEntranceAdjustmentTotal(booking, adjustments) {
  const backendTotal = Number(
    booking.entrance_adjustment_total ??
      booking.front_desk_discount_total ??
      booking.discount_total ??
      0,
  );

  if (backendTotal > 0) {
    return backendTotal;
  }

  return adjustments.reduce(
    (sum, adjustment) => sum + Number(adjustment.discount_amount || 0),
    0,
  );
}

function formatEntranceAdjustmentLabel(type) {
  const value = String(type || "").toLowerCase();

  if (value === "senior") return "Senior Disc.";
  if (value === "pwd") return "PWD Disc.";
  if (value === "kid_free") return "Kid Rate Adj.";

  return "Entrance Adj.";
}

function renderEntranceAdjustment(adjustment) {
  return `
    <div class="thermal-row">
      <span>${escapeHtml(formatEntranceAdjustmentLabel(adjustment.discount_type))}</span>
      <span>-&#8369;${formatMoney(adjustment.discount_amount)}</span>
    </div>
    <div class="thermal-small">
      ${Number(adjustment.qualified_pax || 0)} pax
    </div>
  `;
}

function isExtraBedBookingCharge(charge) {
  const name = String(charge?.charge_name || "")
    .trim()
    .toLowerCase();

  return name.includes("extra bed");
}

function getPaidBookingChargesTotal(booking, charges) {
  if (
    booking.paid_additional_charges_total !== undefined &&
    booking.paid_additional_charges_total !== null
  ) {
    return Number(booking.paid_additional_charges_total || 0);
  }

  return charges
    .filter((charge) => isTruthy(charge.is_paid))
    .reduce((sum, charge) => sum + Number(charge.charge_amount || 0), 0);
}

function getUnpaidBookingChargesTotal(booking, charges) {
  if (
    booking.unpaid_additional_charges_total !== undefined &&
    booking.unpaid_additional_charges_total !== null
  ) {
    return Number(booking.unpaid_additional_charges_total || 0);
  }

  return charges
    .filter((charge) => !isTruthy(charge.is_paid))
    .reduce((sum, charge) => sum + Number(charge.charge_amount || 0), 0);
}

function getEntranceReconciliations(booking) {
  return Array.isArray(booking.entrance_reconciliations)
    ? booking.entrance_reconciliations
    : [];
}

function formatEntranceReconciliationLabel(type) {
  const value = String(type || "")
    .trim()
    .toLowerCase();

  if (value === "refund") {
    return "Refunded to Guest";
  }

  if (value === "correction") {
    return "Payment Correction";
  }

  return "Entrance Reconciliation";
}

function renderEntranceReconciliation(row) {
  const label = formatEntranceReconciliationLabel(
    row.reconciliation_type,
  );

  return `
    <div class="thermal-row">
      <span>${escapeHtml(label)}</span>
      <span>-&#8369;${formatMoney(row.amount)}</span>
    </div>

    ${
      row.note
        ? `<div class="thermal-small">Note: ${escapeHtml(row.note)}</div>`
        : ""
    }

    ${
      row.created_at
        ? `<div class="thermal-small">Recorded: ${escapeHtml(
            formatPhilippineDateTime(row.created_at),
          )}</div>`
        : ""
    }
  `;
}

function renderThermalReceipt(booking) {
  const items = Array.isArray(booking.items)
    ? booking.items
    : [];

  const reservationStatus = String(
    booking.reservation_status ||
      booking.status ||
      "",
  ).toLowerCase();

  const isCompleted =
    reservationStatus === "completed";

  const totalGuests = Number(
    booking.guests ||
      booking.actual_guests ||
      booking.guest_count ||
      0,
  );

  const estimatedEntranceFee = Number(
    booking.estimated_entrance_fee || 0,
  );

  const entranceAdjustments =
    getEntranceAdjustments(booking);

  const entranceAdjustmentTotal =
    getEntranceAdjustmentTotal(
      booking,
      entranceAdjustments,
    );

  const adjustedEntranceFee = Math.max(
    estimatedEntranceFee -
      entranceAdjustmentTotal,
    0,
  );

  /*
    Reconciliation-aware entrance values.

    IMPORTANT:
    - Gross collected = original lifetime money received.
    - Reconciled out  = refund/correction audit rows.
    - Net collected   = gross minus reconciled out.
    - Final fee       = current backend recalculation using verified
                        actual guests, free inclusions, and adjustments.
  */
  const entranceReconciliations =
    getEntranceReconciliations(booking);

  const entranceFeeCollectedGross = Math.max(
    0,
    Number(
      booking.entrance_fee_collected_gross ??
        booking.entrance_fee_collected ??
        0,
    ),
  );

  const entranceReconciledOut = Math.max(
    0,
    Number(
      booking.entrance_fee_reconciled_out ??
        booking.entrance_reconciliation_total ??
        0,
    ),
  );

  const entranceFeeCollectedNet = Math.max(
    0,
    Number(
      booking.entrance_fee_collected_net ??
        entranceFeeCollectedGross -
          entranceReconciledOut,
    ),
  );

  const finalEntranceFee = Math.max(
    0,
    Number(
      booking.final_entrance_fee ??
        adjustedEntranceFee,
    ),
  );

  const entranceToCollect = Math.max(
    0,
    Number(
      booking.entrance_fee_remaining ??
        finalEntranceFee -
          entranceFeeCollectedNet,
    ),
  );

  const entranceOverpaid = Math.max(
    0,
    Number(
      booking.entrance_fee_overpaid ??
        entranceFeeCollectedNet -
          finalEntranceFee,
    ),
  );

  const entranceFeePaid =
    isTruthy(booking.entrance_fee_paid) ||
    (
      entranceToCollect <= 0.005 &&
      entranceOverpaid <= 0.005
    );

  const entranceRefundTotal = Math.max(
    0,
    Number(
      booking.entrance_refund_total ||
        entranceReconciliations
          .filter(
            (row) =>
              String(
                row.reconciliation_type ||
                  "",
              ).toLowerCase() ===
              "refund",
          )
          .reduce(
            (sum, row) =>
              sum +
              Number(row.amount || 0),
            0,
          ),
    ),
  );

  const entranceCorrectionTotal = Math.max(
    0,
    Number(
      booking.entrance_correction_total ||
        entranceReconciliations
          .filter(
            (row) =>
              String(
                row.reconciliation_type ||
                  "",
              ).toLowerCase() ===
              "correction",
          )
          .reduce(
            (sum, row) =>
              sum +
              Number(row.amount || 0),
            0,
          ),
    ),
  );

  const extraBedCount = Number(
    booking.extra_bed_count || 0,
  );
  const extraBedFee = Number(
    booking.extra_bed_fee || 0,
  );
  const extraBedPaid = isTruthy(
    booking.extra_bed_paid,
  );

  /*
    booking.additional_charges is backed by booking_charges.
    It can contain Extra Guest, Extra Bed, Damage, Missing Item,
    Service, Custom, and other onsite charges.
  */
  const additionalCharges = Array.isArray(
    booking.additional_charges,
  )
    ? booking.additional_charges
    : [];

  const additionalChargesTotal = Number(
    booking.additional_charges_total || 0,
  );

  const paidAdditionalChargesTotal =
    getPaidBookingChargesTotal(
      booking,
      additionalCharges,
    );

  const unpaidAdditionalChargesTotal =
    getUnpaidBookingChargesTotal(
      booking,
      additionalCharges,
    );

  const hasExtraBedBookingCharge =
    additionalCharges.some(
      isExtraBedBookingCharge,
    );

  /*
    Legacy fallback:
    Older records may only have reservations.extra_bed_fee /
    extra_bed_paid. Newer Front Desk flows also create a
    booking_charges row for Extra Bed. Never count both.
  */
  const legacyExtraBedPaidFallback =
    extraBedPaid &&
    !hasExtraBedBookingCharge
      ? extraBedFee
      : 0;

  const legacyExtraBedUnpaidFallback =
    !extraBedPaid &&
    extraBedFee > 0 &&
    !hasExtraBedBookingCharge
      ? extraBedFee
      : 0;

  const accommodationTotal = Number(
    booking.accommodation_total || 0,
  );
  const paidAmount = Number(
    booking.paid_amount || 0,
  );
  const remainingBalance = Number(
    booking.remaining_balance || 0,
  );

  /*
    Net Total Collected reflects money retained after recorded
    entrance refunds/corrections.
  */
  const totalCollected =
    paidAmount +
    entranceFeeCollectedNet +
    paidAdditionalChargesTotal +
    legacyExtraBedPaidFallback;

  const onsiteTotal = Math.max(
    remainingBalance +
      entranceToCollect +
      unpaidAdditionalChargesTotal +
      legacyExtraBedUnpaidFallback,
    0,
  );

  const paymentStatus =
    formatPaymentStatus(
      booking.payment_status ||
        "pending",
    );

  const guestName =
    booking.fullname ||
    buildFullName(booking) ||
    "-";

  const phone =
    booking.phone ||
    booking.contact_no ||
    "-";

  const reservedAt =
    formatPhilippineDateTime(
      booking.reserved_at ||
        booking.created_at,
    );

  const printedAt =
    formatPhilippineDateTime(
      new Date().toISOString(),
    );

  const thermal =
    document.getElementById(
      "thermalReceipt",
    );

  if (!thermal) return;

  const hasEntranceReconciliation =
    entranceReconciliations.length > 0 ||
    entranceReconciledOut > 0.005;

  thermal.innerHTML = `
    <div class="thermal-inner">
      <div class="thermal-center">
        <div class="thermal-title">${escapeHtml(RESORT_INFO.shortName)}</div>
        <div class="thermal-sub">BEACH RESORT &amp; HOTEL</div>
        <div class="thermal-small">${escapeHtml(RESORT_INFO.address)}</div>
        <div class="thermal-small">${escapeHtml(RESORT_INFO.contact)}</div>
        <div class="thermal-small">${escapeHtml(RESORT_INFO.email)}</div>
        <div class="thermal-small">${escapeHtml(RESORT_INFO.operatingHours)}</div>
        <div class="thermal-sub">${
          isCompleted
            ? "FINAL THERMAL RECEIPT"
            : "FRONT DESK THERMAL RECEIPT"
        }</div>
        <div class="thermal-code">${escapeHtml(
          booking.reservation_code ||
            `#${booking.id}`,
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
        <span>Reservation</span>
        <span>${escapeHtml(
          capitalize(
            reservationStatus || "-",
          ),
        )}</span>
      </div>

      <div class="thermal-row">
        <span>Payment</span>
        <span>${escapeHtml(paymentStatus)}</span>
      </div>

      <div class="thermal-row">
        <span>Method</span>
        <span>${escapeHtml(
          formatPaymentMethod(
            booking.payment_method ||
              "cash",
          ),
        )}</span>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-section-title">Accommodation</div>

      ${
        items.length
          ? items
              .map(renderThermalItem)
              .join("")
          : `<div>No reserved items found.</div>`
      }

      <div class="thermal-divider"></div>

      <div class="thermal-section-title">Payment Summary</div>

      <div class="thermal-row">
        <span>Accommodation</span>
        <span>&#8369;${formatMoney(accommodationTotal)}</span>
      </div>

      <div class="thermal-row">
        <span>Accommodation Paid</span>
        <span>&#8369;${formatMoney(paidAmount)}</span>
      </div>

      <div class="thermal-row">
        <span>Remaining Bal.</span>
        <span>&#8369;${formatMoney(remainingBalance)}</span>
      </div>

      <div class="thermal-row">
        <span>Final Entrance Fee</span>
        <span>&#8369;${formatMoney(finalEntranceFee)}</span>
      </div>

      ${
        hasEntranceReconciliation
          ? `
            <div class="thermal-row">
              <span>Entrance Collected (Gross)</span>
              <span>&#8369;${formatMoney(entranceFeeCollectedGross)}</span>
            </div>

            ${
              entranceRefundTotal > 0
                ? `
                  <div class="thermal-row">
                    <span>Entrance Refunded</span>
                    <span>-&#8369;${formatMoney(entranceRefundTotal)}</span>
                  </div>
                `
                : ""
            }

            ${
              entranceCorrectionTotal > 0
                ? `
                  <div class="thermal-row">
                    <span>Entrance Corrected</span>
                    <span>-&#8369;${formatMoney(entranceCorrectionTotal)}</span>
                  </div>
                `
                : ""
            }

            <div class="thermal-row thermal-bold">
              <span>Entrance Collected (Net)</span>
              <span>&#8369;${formatMoney(entranceFeeCollectedNet)}</span>
            </div>
          `
          : `
            <div class="thermal-row">
              <span>Entrance Collected</span>
              <span>&#8369;${formatMoney(entranceFeeCollectedNet)}</span>
            </div>
          `
      }

      <div class="thermal-row">
        <span>Entrance Settled</span>
        <span>${entranceFeePaid ? "Yes" : "No"}</span>
      </div>

      <div class="thermal-row">
        <span>Extra Bed</span>
        <span>${extraBedCount} bed(s)</span>
      </div>

      <div class="thermal-row">
        <span>Extra Bed Fee</span>
        <span>&#8369;${formatMoney(extraBedFee)}</span>
      </div>

      <div class="thermal-row">
        <span>Extra Bed Paid</span>
        <span>${extraBedPaid ? "Yes" : "No"}</span>
      </div>

      <div class="thermal-row">
        <span>Onsite Chg. Total</span>
        <span>&#8369;${formatMoney(additionalChargesTotal)}</span>
      </div>

      <div class="thermal-row">
        <span>Onsite Chg. Paid</span>
        <span>&#8369;${formatMoney(paidAdditionalChargesTotal)}</span>
      </div>

      <div class="thermal-row">
        <span>Onsite Chg. Unpaid</span>
        <span>&#8369;${formatMoney(unpaidAdditionalChargesTotal)}</span>
      </div>

      ${
        entranceAdjustments.length
          ? `
            <div class="thermal-divider"></div>
            <div class="thermal-section-title">Entrance Adjustments</div>

            ${entranceAdjustments
              .map(renderEntranceAdjustment)
              .join("")}

            <div class="thermal-row thermal-bold">
              <span>Total Adjustment</span>
              <span>-&#8369;${formatMoney(entranceAdjustmentTotal)}</span>
            </div>
          `
          : ""
      }

      ${
        entranceReconciliations.length
          ? `
            <div class="thermal-divider"></div>
            <div class="thermal-section-title">Entrance Reconciliation</div>

            ${entranceReconciliations
              .map(renderEntranceReconciliation)
              .join("")}

            <div class="thermal-row thermal-bold">
              <span>Total Reconciled</span>
              <span>-&#8369;${formatMoney(entranceReconciledOut)}</span>
            </div>
          `
          : ""
      }

      ${
        additionalCharges.length
          ? `
            <div class="thermal-divider"></div>
            <div class="thermal-section-title">Onsite Booking Charges</div>

            ${additionalCharges
              .map(renderAdditionalCharge)
              .join("")}
          `
          : ""
      }

      <div class="thermal-divider"></div>

      <div class="thermal-row thermal-bold">
        <span>${
          hasEntranceReconciliation
            ? "Net Total Collected"
            : "Total Collected"
        }</span>
        <span>&#8369;${formatMoney(totalCollected)}</span>
      </div>

      <div class="thermal-total-box">
        <div class="thermal-total-label">TO COLLECT ONSITE</div>
        <div class="thermal-total-amount">&#8369;${formatMoney(onsiteTotal)}</div>
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-note">
        ${
          isCompleted
            ? "Final receipt uses the current recalculated entrance fee and net recorded collections after any refund/correction reconciliation."
            : "Verify remaining accommodation, recalculated entrance fee, reconciliation records, and unpaid onsite charges before final checkout."
        }
      </div>

      <div class="thermal-divider"></div>

      <div class="thermal-center thermal-small">
        Facebook: Arvic Seaside Beach Resort and Hotel<br>
        TikTok: @arvicseaside<br>
        SmartResort System<br>
        ${
          isCompleted
            ? "Final transaction record"
            : "Keep for front-desk verification"
        }
      </div>
    </div>
  `;
}

function renderThermalItem(item) {
  return `
    <div class="thermal-item">
      <div class="thermal-bold">${escapeHtml(
        item.accommodation_name || "-",
      )}</div>
      <div class="thermal-small">${escapeHtml(
        item.category_name || "-",
      )} &bull; ${escapeHtml(item.slot_label || "-")}</div>
      <div class="thermal-small">
        IN: ${escapeHtml(formatDateOnly(item.check_in_date))} ${escapeHtml(
          formatTime(item.check_in_time),
        )}
      </div>
      <div class="thermal-small">
        OUT: ${escapeHtml(formatDateOnly(item.check_out_date))} ${escapeHtml(
          formatTime(item.check_out_time),
        )}
      </div>
      <div class="thermal-small">
        DURATION: ${escapeHtml(formatItemStayDuration(item))}
      </div>
      <div class="thermal-row">
        <span>Price</span>
        <span>&#8369;${formatMoney(item.item_price)}</span>
      </div>
    </div>
  `;
}

function renderAdditionalCharge(charge) {
  const paid = isTruthy(charge.is_paid);

  return `
    <div class="thermal-row">
      <span>${escapeHtml(
        `${charge.charge_name || "Additional Charge"} (${paid ? "Paid" : "Unpaid"})`,
      )}</span>
      <span>&#8369;${formatMoney(charge.charge_amount)}</span>
    </div>
    ${
      charge.charge_note
        ? `<div class="thermal-small">Note: ${escapeHtml(
            charge.charge_note,
          )}</div>`
        : ""
    }
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
  const date =
    value instanceof Date ? value : parseBackendDateTimeAsUtc(value);

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

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

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
  hours %= 12;

  if (hours === 0) {
    hours = 12;
  }

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
