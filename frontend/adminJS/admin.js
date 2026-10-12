// ============================================================
// SMARTRESORT ADMIN DASHBOARD SCRIPT
// File: frontend/adminJS/admin.js
//
// ADMIN SCOPE:
// - Admin-only role guard
// - Reservation monitoring
// - Search and filter all reservation records
// - View payment reference / payment proof
// - View receipt
// - Administrative reservation cancellation before check-in
//
// FRONT DESK SCOPE (REMOVED FROM THIS PAGE):
// - Manual reservation creation
// - Payment proof verification
// - Check-in / allow entry
// - Guest adjustment
// - Entrance fee adjustment / collection
// - Extra bed / additional charges
// - Checkout
// ============================================================

let allBookings = [];

// ============================================================
// PHILIPPINE DATE / TIME HELPERS
// Backend/MySQL DATETIME values are treated as UTC for display.
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

function getPhilippineDateKey(value) {
  const date = value ? parseBackendDateTimeAsUtc(value) : new Date();

  if (!date) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year =
    parts.find((part) => part.type === "year")?.value || "0000";

  const month =
    parts.find((part) => part.type === "month")?.value || "00";

  const day =
    parts.find((part) => part.type === "day")?.value || "00";

  return `${year}-${month}-${day}`;
}

// ============================================================
// STARTUP
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAdminAccess()) {
    return;
  }

  setupEvents();
  loadBookings();
});

// ============================================================
// SECTION 1: ADMIN ACCESS
// ============================================================

function checkAdminAccess() {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Admin user parse error:", error);
  }

  if (!user) {
    alert("Please login first.");
    window.location.href = "../authHTML/login.html";
    return false;
  }

  const role = String(user.role || "")
    .trim()
    .toLowerCase();

  if (role !== "admin") {
    const routes = {
      customer: "../customerHTML/index.html",
      frontdesk: "../frontdeskHTML/frontdeskDashboard.html",
      staff: "../frontdeskHTML/frontdeskDashboard.html",
      manager: "../managerHTML/managerDashboard.html",
      housekeeping: "../housekeepingHTML/housekeepingDashboard.html",
    };

    alert("Access denied. Administrator account required.");

    window.location.href =
      routes[role] || "../authHTML/login.html";

    return false;
  }

  return true;
}

// ============================================================
// SECTION 2: EVENTS
// ============================================================

function setupEvents() {
  const logoutBtn =
    document.getElementById("logoutBtn");

  const refreshBtn =
    document.getElementById("refreshBtn");

  const searchInput =
    document.getElementById("searchInput");

  const statusFilter =
    document.getElementById("statusFilter");

  const paymentStatusFilter =
    document.getElementById(
      "paymentStatusFilter",
    );

  const paymentMethodFilter =
    document.getElementById(
      "paymentMethodFilter",
    );

  logoutBtn?.addEventListener(
    "click",
    (event) => {
      event.preventDefault();

      localStorage.removeItem("user");

      showMessage(
        "Logged out successfully.",
        "success",
      );

      setTimeout(() => {
        window.location.href =
          "../authHTML/login.html";
      }, 600);
    },
  );

  refreshBtn?.addEventListener(
    "click",
    loadBookings,
  );

  searchInput?.addEventListener(
    "input",
    applyFilters,
  );

  statusFilter?.addEventListener(
    "change",
    applyFilters,
  );

  paymentStatusFilter?.addEventListener(
    "change",
    applyFilters,
  );

  paymentMethodFilter?.addEventListener(
    "change",
    applyFilters,
  );
}

// ============================================================
// SECTION 3: RESERVATION CONTAINER
// The HTML still contains the old table placeholder for backward
// compatibility. The dashboard replaces the table area with cards.
// ============================================================

function getReservationsContainer() {
  const oldTableBody =
    document.getElementById(
      "adminBookingsTableBody",
    );

  if (oldTableBody) {
    const tableWrap =
      oldTableBody.closest(
        ".admin-table-wrap",
      );

    if (tableWrap) {
      return tableWrap;
    }

    return oldTableBody;
  }

  return document.querySelector(
    ".admin-table-wrap",
  );
}

function setReservationsContent(html) {
  const container =
    getReservationsContainer();

  if (container) {
    container.innerHTML = html;
  }
}

// ============================================================
// SECTION 4: LOAD RESERVATIONS
// ============================================================

async function loadBookings() {
  try {
    setReservationsContent(`
      <div class="reservation-state-box">
        Loading reservation records...
      </div>
    `);

    const adminToken = sessionStorage.getItem("adminToken");
    if (!adminToken) throw new Error("Admin session expired. Please log in again.");
    const response = await fetch(
      `${API_BASE}/bookings?scope=all`,
      { headers: { Authorization: "Bearer " + adminToken } },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to fetch reservation records.",
      );
    }

    allBookings = Array.isArray(data)
      ? data
      : Array.isArray(data.bookings)
        ? data.bookings
        : [];

    updateSummaryCards(allBookings);
    applyFilters();
  } catch (error) {
    console.error(
      "loadBookings error:",
      error,
    );

    setReservationsContent(`
      <div class="reservation-state-box error">
        Failed to load reservation records.
      </div>
    `);

    showMessage(
      error.message ||
        "Failed to load reservation records.",
      "error",
    );
  }
}

// ============================================================
// SECTION 5: SUMMARY CARDS
// ============================================================

function updateSummaryCards(bookings) {
  const today =
    getPhilippineDateKey();

  const totalBookings =
    bookings.length;

  const partiallyPaidCount =
    bookings.filter(
      (booking) =>
        getPaymentStatus(booking) ===
        "partially_paid",
    ).length;

  const approvedCount =
    bookings.filter(
      (booking) =>
        getReservationStatus(booking) ===
        "approved",
    ).length;

  const paidCount =
    bookings.filter(
      (booking) =>
        getPaymentStatus(booking) ===
        "paid",
    ).length;

  const onlineToday =
    bookings.filter((booking) => {
      const createdDate =
        getPhilippineDateKey(
          booking.created_at,
        );

      const source =
        getBookingSource(booking);

      return (
        createdDate === today &&
        source !== "manual"
      );
    }).length;

  const walkinToday =
    bookings.filter((booking) => {
      const createdDate =
        getPhilippineDateKey(
          booking.created_at,
        );

      return (
        createdDate === today &&
        getBookingSource(booking) ===
          "manual"
      );
    }).length;

  // Count only active checked-in stays, not expired test stays.
  // Old checked-in records remain visible for Front Desk follow-up.
  const guestPresence = getGuestPresenceCounts(bookings);
  const guestsInside = guestPresence.activeGuests;

  const todayRevenue =
    bookings.reduce(
      (sum, booking) =>
        sum +
        calculateTodayCollectedRevenue(
          booking,
          today,
        ),
      0,
    );

  setText(
    "totalBookings",
    totalBookings,
  );

  setText(
    "partiallyPaidCount",
    partiallyPaidCount,
  );

  setText(
    "approvedCount",
    approvedCount,
  );

  setText(
    "paidCount",
    paidCount,
  );

  setText(
    "onlineToday",
    onlineToday,
  );

  setText(
    "walkinToday",
    walkinToday,
  );

  setText(
    "guestsInside",
    guestsInside,
  );

  const insideNote = document.getElementById("guestsInsideNote");
  if (insideNote) {
    const overdue = guestPresence.overdueBookings;
    insideNote.textContent = overdue
      ? `Within checkout schedule · ${overdue} overdue checked-in ${overdue === 1 ? "reservation" : "reservations"} for Front Desk review`
      : "Currently checked-in guests within checkout schedule";
  }

  setText(
    "todayRevenue",
    `₱${formatMoney(todayRevenue)}`,
  );
}

function setText(id, value) {
  const element =
    document.getElementById(id);

  if (element) {
    element.textContent =
      String(value);
  }
}

function isBookingCheckedIn(booking) {
  return (
    Number(
      booking.is_checked_in || 0,
    ) === 1 ||
    String(
      booking.is_checked_in || "",
    ).toLowerCase() === "true"
  );
}

// Returns the latest checkout across all accommodations in a reservation.
// Date and TIME database values are interpreted as resort-local Manila time.
function getScheduledLatestCheckoutMs(booking) {
  const entries =
    Array.isArray(booking.items) && booking.items.length
      ? booking.items
      : [booking];

  const checkoutTimes = entries
    .map((entry) => {
      const date = String(
        entry.check_out_date || entry.check_out || "",
      ).slice(0, 10);
      const time = String(entry.check_out_time || "").trim();

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time)
      ) {
        return NaN;
      }

      const localTime = time.length === 5 ? `${time}:00` : time;
      return Date.parse(`${date}T${localTime}+08:00`);
    })
    .filter(Number.isFinite);

  return checkoutTimes.length
    ? Math.max(...checkoutTimes)
    : null;
}

function getGuestPresenceCounts(bookings, nowMs = Date.now()) {
  let activeGuests = 0;
  let overdueBookings = 0;

  for (const booking of bookings) {
    if (
      getReservationStatus(booking) !== "approved" ||
      !isBookingCheckedIn(booking)
    ) {
      continue;
    }

    const latestCheckoutMs = getScheduledLatestCheckoutMs(booking);

    // Keep an unscheduled checked-in record visible instead of silently
    // hiding it; only established expired schedules count as overdue.
    if (latestCheckoutMs !== null && latestCheckoutMs <= nowMs) {
      overdueBookings += 1;
      continue;
    }

    activeGuests += Math.max(
      0,
      Number(
        booking.actual_guest_count ??
          booking.guests ??
          booking.guest_count ??
          0,
      ) || 0,
    );
  }

  return { activeGuests, overdueBookings };
}

function isDateToday(value, today) {
  if (!value) return false;

  return (
    getPhilippineDateKey(value) ===
    today
  );
}

function isExtraBedPaid(booking) {
  return (
    Number(
      booking.extra_bed_paid || 0,
    ) === 1 ||
    String(
      booking.extra_bed_paid || "",
    ).toLowerCase() === "true"
  );
}

function calculateTodayCollectedRevenue(
  booking,
  today,
) {
  const createdToday =
    isDateToday(
      booking.created_at,
      today,
    );

  const checkedInToday =
    isDateToday(
      booking.checked_in_at,
      today,
    );

  const extraBedPaidToday =
    isDateToday(
      booking.extra_bed_paid_at,
      today,
    );

  let amount = 0;

  if (checkedInToday) {
    amount += Number(
      booking.accommodation_total ||
        booking.paid_amount ||
        0,
    );

    amount += Number(
      booking.entrance_fee_collected ||
        0,
    );
  } else if (createdToday) {
    amount += Number(
      booking.paid_amount ||
        booking.required_downpayment ||
        0,
    );
  }

  if (
    isExtraBedPaid(booking) &&
    extraBedPaidToday
  ) {
    amount += Number(
      booking.extra_bed_fee || 0,
    );
  }

  return amount;
}

// ============================================================
// SECTION 6: FILTERS
// ============================================================

function isClosedReservationStatus(
  status,
) {
  return [
    "completed",
    "cancelled",
    "rejected",
  ].includes(
    String(status || "")
      .toLowerCase(),
  );
}

function isActiveDashboardRecord(
  booking,
) {
  return !isClosedReservationStatus(
    getReservationStatus(booking),
  );
}

function shouldUseDefaultActiveView(
  searchValue,
  statusValue,
) {
  return (
    !searchValue &&
    (!statusValue ||
      statusValue === "active")
  );
}

function normalizePaymentMethod(method) {
  const value =
    String(method || "")
      .trim()
      .toLowerCase();

  if (value === "maya") {
    return "paymaya";
  }

  if (
    value === "walk_in" ||
    value === "walk-in"
  ) {
    return "cash";
  }

  return value;
}

function applyFilters() {
  const searchValue =
    String(
      document.getElementById(
        "searchInput",
      )?.value || "",
    )
      .trim()
      .toLowerCase();

  const statusValue =
    String(
      document.getElementById(
        "statusFilter",
      )?.value || "active",
    )
      .trim()
      .toLowerCase();

  const paymentStatusValue =
    String(
      document.getElementById(
        "paymentStatusFilter",
      )?.value || "",
    )
      .trim()
      .toLowerCase();

  const paymentMethodValue =
    normalizePaymentMethod(
      document.getElementById(
        "paymentMethodFilter",
      )?.value || "",
    );

  let filtered =
    [...allBookings];

  if (
    shouldUseDefaultActiveView(
      searchValue,
      statusValue,
    )
  ) {
    filtered =
      filtered.filter(
        isActiveDashboardRecord,
      );
  }

  if (searchValue) {
    filtered =
      filtered.filter((booking) => {
        const searchableText = [
          booking.id,
          booking.reservation_code,
          getBookingDisplayName(
            booking,
          ),
          booking.phone,
          booking.contact_no,
          booking.email,
          booking.room_name,
          booking.accommodation_name,
          booking.booking_source,
          booking.payment_method,
          booking.payment_status,
          booking.status,
          booking.reservation_status,
          getPaymentReference(
            booking,
          ),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          searchValue,
        );
      });
  }

  if (
    statusValue &&
    statusValue !== "active" &&
    statusValue !== "all"
  ) {
    filtered =
      filtered.filter(
        (booking) =>
          getReservationStatus(
            booking,
          ) === statusValue,
      );
  }

  if (paymentStatusValue) {
    filtered =
      filtered.filter(
        (booking) =>
          getPaymentStatus(
            booking,
          ) ===
          paymentStatusValue,
      );
  }

  if (paymentMethodValue) {
    filtered =
      filtered.filter(
        (booking) =>
          normalizePaymentMethod(
            booking.payment_method,
          ) ===
          paymentMethodValue,
      );
  }

  renderBookings(filtered);
}

// ============================================================
// SECTION 7: RENDER RESERVATION CARDS
// ============================================================

function renderBookings(bookings) {
  if (!bookings.length) {
    setReservationsContent(`
      <div class="reservation-state-box">
        No reservations found for the selected search/filter.
      </div>
    `);

    return;
  }

  setReservationsContent(`
    <div class="reservation-card-list">
      ${bookings
        .map(
          (booking) =>
            renderReservationCard(
              booking,
            ),
        )
        .join("")}
    </div>
  `);
}

function renderReservationCard(
  booking,
) {
  const bookingId =
    Number(booking.id);

  const bookingStatus =
    getReservationStatus(booking);

  const paymentStatus =
    getPaymentStatus(booking);

  const paymentMethod =
    normalizePaymentMethod(
      booking.payment_method,
    );

  const bookingSource =
    getBookingSource(booking);

  const proofSource =
    getProofSource(booking);

  const paymentReference =
    getPaymentReference(booking);

  return `
    <article class="reservation-card">
      <div class="reservation-card-main">
        <div class="reservation-topline">
          <div>
            <div class="reservation-code">
              ${escapeHtml(
                booking.reservation_code ||
                  `#${bookingId}`,
              )}
            </div>

            <div class="reservation-id">
              Reservation ID:
              #${escapeHtml(
                bookingId || "-",
              )}
            </div>
          </div>

          <div class="reservation-badges">
            <span class="source-badge source-${escapeHtml(
              bookingSource,
            )}">
              ${escapeHtml(
                formatBookingSource(
                  bookingSource,
                ),
              )}
            </span>

            <span class="status-badge status-${escapeHtml(
              bookingStatus,
            )}">
              ${escapeHtml(
                formatReservationStatus(
                  bookingStatus,
                ),
              )}
            </span>

            <span class="payment-badge payment-${escapeHtml(
              paymentStatus,
            )}">
              ${escapeHtml(
                formatPaymentStatus(
                  paymentStatus,
                ),
              )}
            </span>

            ${renderCheckInBadge(
              booking,
            )}
          </div>
        </div>

        <div class="reservation-info-grid">
          <section class="reservation-info-box">
            <div class="info-label">
              Customer
            </div>

            <div class="info-strong">
              ${escapeHtml(
                getBookingDisplayName(
                  booking,
                ),
              )}
            </div>

            <div>
              ${escapeHtml(
                booking.phone ||
                  booking.contact_no ||
                  "-",
              )}
            </div>

            <div>
              ${escapeHtml(
                booking.email || "-",
              )}
            </div>
          </section>

          <section class="reservation-info-box">
            <div class="info-label">
              Stay Details
            </div>

            <div class="info-strong">
              ${escapeHtml(
                booking.room_name ||
                  booking.accommodation_name ||
                  "N/A",
              )}
            </div>

            <div>
              Check-in:
              ${formatDate(
                booking.check_in ||
                  booking.check_in_date,
              )}
              •
              ${formatTime(
                booking.check_in_time,
              )}
            </div>

            <div>
              Check-out:
              ${formatDate(
                booking.check_out ||
                  booking.check_out_date,
              )}
              •
              ${formatTime(
                booking.check_out_time,
              )}
            </div>

            <div>
              Stay Duration:
              ${escapeHtml(
                formatStayDuration(
                  booking,
                ),
              )}
            </div>

            <div>
              Guests:
              ${Number(
                booking.guests ??
                  booking.actual_guest_count ??
                  booking.guest_count ??
                  0,
              )}
            </div>
          </section>

          <section class="reservation-info-box">
            <div class="info-label">
              Payment
            </div>

            <div>
              Total:
              <strong>
                ₱${formatMoney(
                  booking.accommodation_total,
                )}
              </strong>
            </div>

            <div>
              Downpayment:
              <strong class="${getPaymentAmountHighlightClass(
                booking,
                booking.required_downpayment,
              )}">
                ₱${formatMoney(
                  booking.required_downpayment,
                )}
              </strong>
            </div>

            <div>
              Paid:
              <strong>
                ₱${formatMoney(
                  booking.paid_amount,
                )}
              </strong>
            </div>

            <div>
              Remaining:
              <strong class="${getPaymentAmountHighlightClass(
                booking,
                booking.remaining_balance,
              )}">
                ₱${formatMoney(
                  booking.remaining_balance,
                )}
              </strong>
            </div>

            <div>
              Entrance Fee:
              <strong>
                ₱${formatMoney(
                  getDisplayedEntranceFee(
                    booking,
                  ),
                )}
              </strong>
            </div>

            <div>
              Entrance Paid:
              <strong>
                ${
                  isEntranceFeePaid(
                    booking,
                  )
                    ? "Yes"
                    : "No"
                }
              </strong>
            </div>

            <div>
              Method:
              ${escapeHtml(
                formatPaymentMethod(
                  paymentMethod,
                ),
              )}
            </div>
          </section>

          <section class="reservation-info-box">
            <div class="info-label">
              Reference
            </div>

            ${renderPaymentReference(
              paymentReference,
            )}
          </section>
        </div>

        <div class="reservation-footer">
          <div class="created-text">
            Created:
            ${formatDateTime(
              booking.created_at,
            )}
          </div>

          <div class="proof-area">
            ${renderProofButton(
              proofSource,
              booking.proof_of_payment,
            )}
          </div>
        </div>
      </div>

      <div class="reservation-actions">
        <button
          type="button"
          class="action-btn receipt-btn"
          onclick="viewReceipt(${bookingId})"
        >
          Receipt
        </button>

        ${renderCancelButton(
          booking,
          bookingId,
          bookingStatus,
        )}
      </div>
    </article>
  `;
}

// ============================================================
// SECTION 8: MONITORING HELPERS
// ============================================================

function renderCheckInBadge(booking) {
  if (!isBookingCheckedIn(booking)) {
    return "";
  }

  return `
    <span class="payment-badge payment-paid">
      Checked In
    </span>
  `;
}

function isEntranceFeePaid(booking) {
  return (
    Number(
      booking.entrance_fee_paid || 0,
    ) === 1 ||
    Number(
      booking.entrance_fee_collected ||
        0,
    ) > 0 ||
    String(
      booking.entrance_fee_paid || "",
    ).toLowerCase() === "true"
  );
}

function getDisplayedEntranceFee(
  booking,
) {
  if (isEntranceFeePaid(booking)) {
    return Number(
      booking.entrance_fee_collected ||
        0,
    );
  }

  return Number(
    booking.estimated_entrance_fee ||
      0,
  );
}

function renderCancelButton(
  booking,
  bookingId,
  bookingStatus,
) {
  if (
    !bookingId ||
    isBookingCheckedIn(booking) ||
    [
      "cancelled",
      "completed",
      "rejected",
    ].includes(bookingStatus)
  ) {
    return "";
  }

  return `
    <button
      type="button"
      class="action-btn cancel-booking-btn"
      onclick="cancelReservation(
        ${bookingId},
        this
      )"
      title="Administrative cancellation before guest check-in. Existing payment records are preserved."
    >
      Cancel Reservation
    </button>
  `;
}

// ============================================================
// SECTION 9: ADMINISTRATIVE CANCELLATION
//
// IMPORTANT:
// This only changes reservation_status to cancelled.
// It intentionally DOES NOT reset payment_status, paid_amount,
// remaining_balance, PayPal transactions, or other financial history.
// ============================================================

async function cancelReservation(
  bookingId,
  button,
) {
  if (!bookingId) {
    showMessage(
      "Invalid reservation ID.",
      "error",
    );
    return;
  }

  const confirmed = confirm(
    "Cancel this reservation? Existing payment and transaction history will be preserved for audit purposes.",
  );

  if (!confirmed) {
    return;
  }

  await runAdminAction(
    button,
    "Cancelling...",
    async () => {
      await updateReservationStatusOnly(
        bookingId,
        "cancelled",
      );

      showMessage(
        "Reservation cancelled. Existing payment history was preserved.",
        "success",
      );
    },
  );
}

async function runAdminAction(
  button,
  loadingText,
  actionCallback,
) {
  const originalButtonText =
    button?.textContent || "";

  try {
    if (button) {
      button.disabled = true;
      button.textContent =
        loadingText;
      button.style.opacity =
        "0.7";
      button.style.cursor =
        "not-allowed";
    }

    await actionCallback();
    await loadBookings();
  } catch (error) {
    console.error(
      "runAdminAction error:",
      error,
    );

    showMessage(
      error.message ||
        "Failed to process action.",
      "error",
    );
  } finally {
    if (
      button &&
      document.body.contains(button)
    ) {
      button.disabled = false;
      button.textContent =
        originalButtonText;
      button.style.opacity = "1";
      button.style.cursor = "pointer";
    }
  }
}

async function updateReservationStatusOnly(
  bookingId,
  status,
) {
  const adminToken = sessionStorage.getItem("adminToken");
  if (!adminToken) {
    throw new Error("Administrator session expired. Please log in again.");
  }

  const response = await fetch(
    `${API_BASE}/bookings/${bookingId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status,
      }),
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update reservation status.",
    );
  }

  return data;
}

// ============================================================
// SECTION 10: RECEIPT
// ============================================================

function viewReceipt(bookingId) {
  window.location.href =
    `admin-booking-receipt.html?id=${bookingId}`;
}

// ============================================================
// SECTION 11: PAYMENT REFERENCE
// ============================================================

function getPaymentReference(booking) {
  const directReference =
    booking.proof_reference ||
    booking.payment_reference ||
    booking.reference_number ||
    booking.transaction_reference;

  if (directReference) {
    return String(
      directReference,
    ).trim();
  }

  const note =
    String(booking.note || "");

  const match =
    note.match(
      /Reference Number:\s*([^|]+)/i,
    );

  if (match?.[1]) {
    return match[1].trim();
  }

  const rawProof =
    String(
      booking.proof_of_payment ||
        "",
    ).trim();

  if (
    rawProof &&
    !rawProof.includes("/") &&
    /^\d+$/.test(rawProof)
  ) {
    return rawProof;
  }

  return "";
}

function groupReferenceNumber(
  reference,
) {
  const cleanReference =
    String(reference || "")
      .replace(/\s+/g, "")
      .trim();

  if (!cleanReference) {
    return [];
  }

  return (
    cleanReference.match(
      /.{1,4}/g,
    ) || [cleanReference]
  );
}

function renderPaymentReference(
  reference,
) {
  if (!reference) {
    return `
      <span class="no-proof-text">
        No reference
      </span>
    `;
  }

  const groups =
    groupReferenceNumber(
      reference,
    );

  return `
    <div class="reference-box">
      <div class="reference-chip-row">
        ${groups
          .map(
            (group) => `
              <span class="reference-chip">
                ${escapeHtml(group)}
              </span>
            `,
          )
          .join("")}
      </div>

      <div class="reference-full">
        ${escapeHtml(reference)}
      </div>

      <button
        type="button"
        class="copy-ref-btn"
        onclick="copyReferenceNumber(
          '${escapeForInline(reference)}'
        )"
      >
        Copy Reference
      </button>
    </div>
  `;
}

async function copyReferenceNumber(
  reference,
) {
  try {
    await navigator.clipboard.writeText(
      reference,
    );

    showMessage(
      "Reference number copied.",
      "success",
    );
  } catch (error) {
    console.error(
      "copyReferenceNumber error:",
      error,
    );

    const tempInput =
      document.createElement("input");

    tempInput.value =
      reference;

    document.body.appendChild(
      tempInput,
    );

    tempInput.select();

    document.execCommand(
      "copy",
    );

    tempInput.remove();

    showMessage(
      "Reference number copied.",
      "success",
    );
  }
}

// ============================================================
// SECTION 12: PAYMENT PROOF
// ============================================================

function getProofSource(booking) {
  const proofImageData =
    String(
      booking?.proof_image_data ||
        "",
    ).trim();

  if (
    proofImageData.startsWith(
      "data:image/",
    )
  ) {
    return proofImageData;
  }

  return getProofUrl(
    booking?.proof_of_payment,
  );
}

function getProofUrl(proofPath) {
  const value =
    String(proofPath || "")
      .trim();

  if (!value) {
    return "";
  }

  if (
    value.startsWith(
      "http://",
    ) ||
    value.startsWith(
      "https://",
    )
  ) {
    return value;
  }

  let backendBase =
    "http://127.0.0.1:5000";

  if (
    typeof API_BASE !==
      "undefined" &&
    API_BASE
  ) {
    backendBase =
      String(API_BASE).replace(
        /\/api\/?$/,
        "",
      );
  }

  if (
    value.startsWith(
      "/uploads/",
    )
  ) {
    return `${backendBase}${value}`;
  }

  if (
    value.startsWith(
      "uploads/",
    )
  ) {
    return `${backendBase}/${value}`;
  }

  return "";
}

function renderProofButton(
  proofUrl,
  rawProofPath = "",
) {
  if (!proofUrl) {
    const rawValue =
      String(
        rawProofPath || "",
      ).trim();

    if (rawValue) {
      return `
        <span class="no-proof-text">
          No image proof
        </span>
      `;
    }

    return `
      <span class="no-proof-text">
        No proof
      </span>
    `;
  }

  return `
    <button
      type="button"
      class="proof-link-btn"
      onclick="openProofModal(
        '${escapeForInline(proofUrl)}'
      )"
    >
      View Proof
    </button>
  `;
}

function openProofModal(imageUrl) {
  let modal =
    document.getElementById(
      "proofImageModal",
    );

  if (!modal) {
    modal =
      document.createElement(
        "div",
      );

    modal.id =
      "proofImageModal";

    modal.innerHTML = `
      <div
        class="proof-modal-backdrop"
        onclick="closeProofModal()"
      ></div>

      <div class="proof-modal-content">
        <button
          type="button"
          class="proof-modal-close"
          onclick="closeProofModal()"
          aria-label="Close proof modal"
        >
          ×
        </button>

        <div class="proof-modal-header">
          <h3>Proof of Payment</h3>

          <p>
            Read-only Admin review.
            Payment verification is handled by Front Desk.
          </p>
        </div>

        <img
          id="proofModalImage"
          src=""
          alt="Proof of payment screenshot"
        />

        <p
          id="proofModalError"
          class="proof-modal-error"
          style="display:none;"
        >
          Screenshot cannot be loaded.
          Please check the stored proof file.
        </p>
      </div>
    `;

    document.body.appendChild(
      modal,
    );

    if (
      !document.getElementById(
        "proofModalStyle",
      )
    ) {
      const style =
        document.createElement(
          "style",
        );

      style.id =
        "proofModalStyle";

      style.textContent = `
        #proofImageModal {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        #proofImageModal.show {
          display: flex;
        }

        .proof-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(6px);
        }

        .proof-modal-content {
          position: relative;
          z-index: 1;
          width: min(92vw, 760px);
          max-height: 92vh;
          background: #ffffff;
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.35);
          border: 1px solid rgba(226, 232, 240, 0.95);
          overflow: auto;
        }

        .proof-modal-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 999px;
          background: #ef4444;
          color: white;
          font-size: 1.4rem;
          font-weight: 900;
          cursor: pointer;
          line-height: 1;
        }

        .proof-modal-header {
          padding-right: 46px;
          margin-bottom: 14px;
        }

        .proof-modal-header h3 {
          margin: 0 0 4px;
          color: #0f172a;
          font-size: 1.25rem;
        }

        .proof-modal-header p {
          margin: 0;
          color: #64748b;
          font-size: 0.92rem;
          line-height: 1.5;
        }

        #proofModalImage {
          width: 100%;
          max-height: 68vh;
          object-fit: contain;
          display: block;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .proof-modal-error {
          margin: 14px 0 0;
          padding: 14px 16px;
          border-radius: 14px;
          background: #fee2e2;
          color: #991b1b;
          font-weight: 800;
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .proof-modal-content {
            width: 96vw;
            padding: 16px;
            border-radius: 20px;
          }

          #proofModalImage {
            max-height: 62vh;
          }
        }
      `;

      document.head.appendChild(
        style,
      );
    }
  }

  const image =
    document.getElementById(
      "proofModalImage",
    );

  const errorText =
    document.getElementById(
      "proofModalError",
    );

  if (errorText) {
    errorText.style.display =
      "none";
  }

  if (image) {
    image.style.display =
      "block";

    image.src = "";

    image.onerror = () => {
      image.style.display =
        "none";

      if (errorText) {
        errorText.style.display =
          "block";
      }
    };

    image.onload = () => {
      if (errorText) {
        errorText.style.display =
          "none";
      }

      image.style.display =
        "block";
    };

    image.src = imageUrl;
  }

  modal.classList.add("show");
  document.body.style.overflow =
    "hidden";
}

function closeProofModal() {
  const modal =
    document.getElementById(
      "proofImageModal",
    );

  if (modal) {
    modal.classList.remove(
      "show",
    );
  }

  document.body.style.overflow =
    "";
}

// ============================================================
// SECTION 13: DATA / FORMATTING HELPERS
// ============================================================

function getBookingSource(booking) {
  return String(
    booking.booking_source ||
      "online",
  )
    .trim()
    .toLowerCase();
}

function getReservationStatus(
  booking,
) {
  return String(
    booking.status ||
      booking.reservation_status ||
      "pending",
  )
    .trim()
    .toLowerCase();
}

function getPaymentStatus(booking) {
  return String(
    booking.payment_status ||
      "pending",
  )
    .trim()
    .toLowerCase();
}

function getBookingDisplayName(
  booking,
) {
  return (
    booking.fullname ||
    booking.customer_name ||
    [
      booking.first_name,
      booking.middle_name,
      booking.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    "N/A"
  );
}

function formatBookingSource(
  source,
) {
  if (source === "manual") {
    return "Manual";
  }

  return "Online";
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "N/A";
  }

  const raw =
    String(dateValue).slice(
      0,
      10,
    );

  const parts =
    raw.split("-");

  if (parts.length !== 3) {
    return raw;
  }

  const date =
    new Date(
      `${raw}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return raw;
  }

  return date.toLocaleDateString(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

function formatTime(timeValue) {
  if (!timeValue) {
    return "N/A";
  }

  const timeText =
    String(timeValue).trim();

  const parts =
    timeText.split(":");

  if (parts.length < 2) {
    return timeText;
  }

  let hours =
    Number(parts[0]);

  const minutes =
    parts[1];

  if (
    Number.isNaN(hours)
  ) {
    return timeText;
  }

  const suffix =
    hours >= 12
      ? "PM"
      : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${suffix}`;
}

function formatDateTime(dateValue) {
  return formatPhilippineDateTime(
    dateValue,
  );
}

function formatStayDuration(
  booking,
) {
  const duration =
    Number(
      booking.stay_duration ||
        1,
    );

  const slotLabel =
    String(
      booking.slot_label || "",
    ).toLowerCase();

  if (
    slotLabel.includes("22") ||
    slotLabel.includes("23")
  ) {
    return `${duration} ${
      duration === 1
        ? "day"
        : "days"
    }`;
  }

  if (
    slotLabel.includes(
      "overnight",
    )
  ) {
    return `${duration} ${
      duration === 1
        ? "night"
        : "nights"
    }`;
  }

  return "1 day only";
}

function formatPaymentMethod(
  method,
) {
  const value =
    normalizePaymentMethod(
      method,
    );

  const labels = {
    gcash: "GCash",
    paymaya: "Maya",
    cash: "Cash",
    paypal: "PayPal",
    other: "Other",
  };

  return (
    labels[value] ||
    capitalize(value || "-")
  );
}

function getPaymentAmountHighlightClass(
  booking,
  amountValue,
) {
  const amount =
    Number(amountValue || 0);

  const paymentStatus =
    getPaymentStatus(booking);

  if (
    amount <= 0 ||
    paymentStatus === "paid"
  ) {
    return "payment-amount-green";
  }

  if (
    paymentStatus ===
    "partially_paid"
  ) {
    return "payment-amount-yellow";
  }

  return "payment-amount-red";
}

function formatReservationStatus(
  status,
) {
  const value =
    String(status || "")
      .toLowerCase();

  const labels = {
    approved:
      "Reservation Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
    completed: "Completed",
    rejected: "Rejected",
  };

  return (
    labels[value] ||
    capitalize(value)
  );
}

function formatPaymentStatus(
  status,
) {
  const value =
    String(status || "")
      .toLowerCase();

  const labels = {
    pending: "Pending",
    unpaid: "Unpaid",
    paid: "Paid",
    partially_paid:
      "Partially Paid",
    rejected: "Rejected",
    refunded: "Refunded",
  };

  return (
    labels[value] ||
    capitalize(value)
  );
}

function formatMoney(value) {
  const number =
    Number(value || 0);

  return number.toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

function capitalize(text) {
  if (!text) return "";

  const value =
    String(text);

  return (
    value
      .charAt(0)
      .toUpperCase() +
    value
      .slice(1)
      .replace(/_/g, " ")
  );
}

function showMessage(
  message,
  type = "success",
) {
  if (
    typeof showToast ===
    "function"
  ) {
    showToast(
      message,
      type,
    );
  } else {
    alert(message);
  }
}

function escapeForInline(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, "&quot;")
    .replace(/\r/g, "")
    .replace(/\n/g, " ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
