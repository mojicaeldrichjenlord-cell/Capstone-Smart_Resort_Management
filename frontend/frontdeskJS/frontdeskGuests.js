// ============================================================
// SMARTRESORT FRONT DESK GUEST MANAGEMENT
// File: frontend/frontdeskJS/frontdeskGuests.js
//
// STEP 3F-A:
// - Front Desk role guard
// - Load active reservation records
// - Identify Ready Today / Inside / Needs Payment / Upcoming
// - Search/filter guest arrivals
// - Check In / Allow Entry
//
// STEP 3F-B1:
// - Guest Adjustment for checked-in guests
// - Preserve original booked guest count
// - Save verified actual onsite guest count
// - Preserve already-paid Extra Guest Charge history
// - Create/update only the additional unpaid difference
//
// STEP 3F-B2:
// - Entrance Fee Adjustment for checked-in guests
// - Senior Citizen 20% entrance discount
// - PWD 20% entrance discount
// - Qualified Kid free entrance
// - Multiple adjustment types in one reservation
// - Accommodation free entrance inclusions applied first
// - Uses verified actual guest count
// - Shows gross, deductions, final fee, remaining, and overpayment
//
// Existing backend used:
// GET /api/bookings?scope=all
// PUT /api/bookings/:id/check-in
// PUT /api/admin/bookings/:id/guest-adjustment
// GET /api/bookings/:id/charges
// GET /api/bookings/:id/discounts
// PUT /api/bookings/:id/discounts
// DELETE /api/bookings/:id/discounts
// ============================================================

let allGuestBookings = [];

// ============================================================
// STEP 3F-B1 STATE
// ============================================================

let selectedGuestAdjustmentBookingId = null;

let guestAdjustmentPaidExtraGuestTotal = 0;

// ============================================================
// STEP 3F-B2 STATE
// ============================================================

let selectedEntranceAdjustmentBookingId = null;

let currentEntranceAdjustmentMeta = {
  entrance_type: "pool_beach",
  has_overnight_style: false,
  entrance_rate_per_pax: 0,
  senior_pwd_discount_rate: 0.2,
  booked_guest_count: 0,
  actual_guest_count: 1,
  included_free_entrance_pax: 0,
  chargeable_entrance_guests: 0,
  gross_entrance_fee: 0,
  total_entrance_deduction: 0,
  final_entrance_fee: 0,
  entrance_fee_collected: 0,
  entrance_fee_remaining: 0,
  entrance_fee_overpaid: 0,
};

// ============================================================
// SECTION 1: STARTUP
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const user = getLoggedInUser();

  if (!user) {
    window.location.href = "../authHTML/login.html";
    return;
  }

  const role = normalizeRole(user.role);

  if (role !== "frontdesk") {
    redirectByRole(role);
    return;
  }

  setupGuestEvents();
  loadGuestBookings();
});

// ============================================================
// SECTION 2: ROLE HELPERS
// ============================================================

function getLoggedInUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
        "null",
    );
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (value === "staff") {
    return "frontdesk";
  }

  return value;
}

function redirectByRole(role) {
  const routes = {
    customer:
      "../customerHTML/index.html",
    admin:
      "../adminHTML/admin.html",
    manager:
      "../managerHTML/managerDashboard.html",
    housekeeping:
      "../housekeepingHTML/housekeepingDashboard.html",
  };

  window.location.href =
    routes[role] ||
    "../authHTML/login.html";
}

// ============================================================
// SECTION 3: EVENTS
// ============================================================

function setupGuestEvents() {
  document
    .getElementById("logoutBtn")
    ?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();

        localStorage.removeItem(
          "user",
        );

        showMessage(
          "Logged out successfully.",
          "success",
        );

        setTimeout(() => {
          window.location.href =
            "../authHTML/login.html";
        }, 500);
      },
    );

  document
    .getElementById("refreshBtn")
    ?.addEventListener(
      "click",
      loadGuestBookings,
    );

  document
    .getElementById("searchInput")
    ?.addEventListener(
      "input",
      applyGuestFilters,
    );

  document
    .getElementById("arrivalFilter")
    ?.addEventListener(
      "change",
      applyGuestFilters,
    );

  // ----------------------------------------------------------
  // STEP 3F-B1: Guest Adjustment modal events
  // ----------------------------------------------------------

  document
    .getElementById(
      "actualGuestCountInput",
    )
    ?.addEventListener(
      "input",
      updateGuestAdjustmentPreview,
    );

  document
    .getElementById(
      "extraGuestRateInput",
    )
    ?.addEventListener(
      "input",
      updateGuestAdjustmentPreview,
    );

  document
    .getElementById(
      "saveGuestAdjustmentBtn",
    )
    ?.addEventListener(
      "click",
      saveGuestAdjustment,
    );

  document
    .getElementById(
      "cancelGuestAdjustmentBtn",
    )
    ?.addEventListener(
      "click",
      closeGuestAdjustmentModal,
    );

  document
    .getElementById(
      "closeGuestAdjustmentBtn",
    )
    ?.addEventListener(
      "click",
      closeGuestAdjustmentModal,
    );

  document
    .getElementById(
      "guestAdjustmentModal",
    )
    ?.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          document.getElementById(
            "guestAdjustmentModal",
          )
        ) {
          closeGuestAdjustmentModal();
        }
      },
    );

  // ----------------------------------------------------------
  // STEP 3F-B2: Entrance Fee Adjustment modal events
  // ----------------------------------------------------------

  [
    "entranceSeniorPaxInput",
    "entrancePwdPaxInput",
    "entranceKidFreePaxInput",
  ].forEach((inputId) => {
    document
      .getElementById(inputId)
      ?.addEventListener(
        "input",
        updateEntranceAdjustmentPreview,
      );
  });

  document
    .getElementById(
      "saveEntranceAdjustmentBtn",
    )
    ?.addEventListener(
      "click",
      saveEntranceAdjustment,
    );

  document
    .getElementById(
      "removeEntranceAdjustmentBtn",
    )
    ?.addEventListener(
      "click",
      removeEntranceAdjustment,
    );

  document
    .getElementById(
      "cancelEntranceAdjustmentBtn",
    )
    ?.addEventListener(
      "click",
      closeEntranceAdjustmentModal,
    );

  document
    .getElementById(
      "closeEntranceAdjustmentBtn",
    )
    ?.addEventListener(
      "click",
      closeEntranceAdjustmentModal,
    );

  document
    .getElementById(
      "entranceAdjustmentModal",
    )
    ?.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          document.getElementById(
            "entranceAdjustmentModal",
          )
        ) {
          closeEntranceAdjustmentModal();
        }
      },
    );
}

// ============================================================
// SECTION 4: LOAD RESERVATIONS
// ============================================================

async function loadGuestBookings() {
  setGuestRecords(`
    <div class="guest-state-box">
      Loading guest records...
    </div>
  `);

  try {
    const response = await fetch(
      `${API_BASE}/bookings?scope=all`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to load guest records.",
      );
    }

    allGuestBookings =
      Array.isArray(data)
        ? data
        : Array.isArray(
              data.bookings,
            )
          ? data.bookings
          : [];

    updateGuestSummary();
    applyGuestFilters();
  } catch (error) {
    console.error(
      "frontdesk loadGuestBookings error:",
      error,
    );

    setGuestRecords(`
      <div class="guest-state-box error">
        Failed to load guest records.
      </div>
    `);

    showMessage(
      error.message ||
        "Failed to load guest records.",
      "error",
    );
  }
}

// ============================================================
// SECTION 5: GUEST STATE LOGIC
// ============================================================

function getGuestState(booking) {
  const reservationStatus =
    getReservationStatus(booking);

  const paymentStatus =
    getPaymentStatus(booking);

  const checkedIn =
    isCheckedIn(booking);

  if (
    [
      "completed",
      "cancelled",
      "rejected",
    ].includes(
      reservationStatus,
    )
  ) {
    return "closed";
  }

  if (checkedIn) {
    return "inside";
  }

  const dateState =
    getCheckInDateState(booking);

  if (
    reservationStatus ===
      "approved" &&
    [
      "partially_paid",
      "paid",
    ].includes(paymentStatus)
  ) {
    if (dateState === "today") {
      return "ready";
    }

    if (dateState === "future") {
      return "upcoming";
    }

    if (dateState === "past") {
      return "passed";
    }
  }

  if (
    [
      "pending",
      "unpaid",
    ].includes(paymentStatus) ||
    reservationStatus ===
      "pending"
  ) {
    return "needs_payment";
  }

  return dateState === "future"
    ? "upcoming"
    : "other";
}

function canCheckIn(booking) {
  return (
    getGuestState(booking) ===
    "ready"
  );
}

function getCheckInDateState(
  booking,
) {
  const checkInDate =
    getCheckInDateOnly(
      booking,
    );

  if (!checkInDate) {
    return "missing";
  }

  const today =
    getPhilippineTodayDateKey();

  if (checkInDate === today) {
    return "today";
  }

  return checkInDate > today
    ? "future"
    : "past";
}

function getCheckInDateOnly(
  booking,
) {
  const value =
    booking.check_in ||
    booking.check_in_date ||
    booking.items?.[0]
      ?.check_in_date ||
    "";

  return normalizeDateKey(value);
}

function getPhilippineTodayDateKey() {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(
      new Date(),
    );

  const values = {};

  parts.forEach((part) => {
    values[part.type] =
      part.value;
  });

  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeDateKey(value) {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string"
  ) {
    const directMatch =
      value.match(
        /^(\d{4})-(\d{2})-(\d{2})/,
      );

    if (directMatch) {
      return `${directMatch[1]}-${directMatch[2]}-${directMatch[3]}`;
    }
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(date);
}

// ============================================================
// SECTION 6: SUMMARY
// ============================================================

function updateGuestSummary() {
  const active =
    allGuestBookings.filter(
      (booking) =>
        getGuestState(
          booking,
        ) !== "closed",
    );

  setText(
    "readyTodayCount",
    active.filter(
      (booking) =>
        getGuestState(
          booking,
        ) === "ready",
    ).length,
  );

  setText(
    "insideCount",
    active.filter(
      (booking) =>
        getGuestState(
          booking,
        ) === "inside",
    ).length,
  );

  setText(
    "needsPaymentCount",
    active.filter(
      (booking) =>
        getGuestState(
          booking,
        ) ===
        "needs_payment",
    ).length,
  );

  setText(
    "upcomingCount",
    active.filter(
      (booking) =>
        getGuestState(
          booking,
        ) ===
        "upcoming",
    ).length,
  );
}

function setText(id, value) {
  const element =
    document.getElementById(
      id,
    );

  if (element) {
    element.textContent =
      String(value);
  }
}

// ============================================================
// SECTION 7: FILTERS
// ============================================================

function applyGuestFilters() {
  const search = String(
    document.getElementById(
      "searchInput",
    )?.value || "",
  )
    .trim()
    .toLowerCase();

  const selectedView =
    String(
      document.getElementById(
        "arrivalFilter",
      )?.value || "ready",
    )
      .trim()
      .toLowerCase();

  let filtered =
    allGuestBookings.filter(
      (booking) =>
        getGuestState(
          booking,
        ) !== "closed",
    );

  if (
    selectedView !== "all"
  ) {
    filtered =
      filtered.filter(
        (booking) =>
          getGuestState(
            booking,
          ) ===
          selectedView,
      );
  }

  if (search) {
    filtered =
      filtered.filter(
        (booking) => {
          const searchableText =
            [
              booking.id,
              booking
                .reservation_code,
              getGuestName(
                booking,
              ),
              booking.phone,
              booking.contact_no,
              booking.email,
              booking.room_name,
              booking
                .accommodation_name,
              booking
                .accommodation_list,
              booking
                .booking_source,
              booking
                .payment_method,
              booking
                .payment_status,
              booking.status,
            ]
              .join(" ")
              .toLowerCase();

          return searchableText.includes(
            search,
          );
        },
      );
  }

  renderGuestRecords(
    filtered,
  );
}

// ============================================================
// SECTION 8: RENDER
// ============================================================

function renderGuestRecords(
  bookings,
) {
  const recordCount =
    document.getElementById(
      "recordCount",
    );

  if (recordCount) {
    recordCount.textContent =
      `${bookings.length} ${
        bookings.length === 1
          ? "record"
          : "records"
      }`;
  }

  if (!bookings.length) {
    setGuestRecords(`
      <div class="guest-state-box">
        No guest records found for the selected view.
      </div>
    `);

    return;
  }

  setGuestRecords(`
    <div class="guest-record-list">
      ${bookings
        .map(
          renderGuestCard,
        )
        .join("")}
    </div>
  `);
}

function renderGuestCard(
  booking,
) {
  const bookingId =
    Number(
      booking.id || 0,
    );

  const state =
    getGuestState(booking);

  const paymentStatus =
    getPaymentStatus(booking);

  const reservationStatus =
    getReservationStatus(
      booking,
    );

  const remainingBalance =
    toMoney(
      booking
        .remaining_balance,
    );

  const entranceFee =
    toMoney(
      booking
        .estimated_entrance_fee,
    );

  const entranceFeeCollected =
    toMoney(
      booking
        .entrance_fee_collected,
    );

  // ----------------------------------------------------------
  // Current card behavior:
  // The booking list endpoint still exposes the stored entrance
  // values. Step 3F-B2's detailed recalculation appears inside
  // the Entrance Adjustment modal where the backend returns:
  // - gross entrance fee from actual guests
  // - deductions
  // - final entrance fee
  // - remaining entrance fee
  //
  // We intentionally do not fake those values in the card.
  // ----------------------------------------------------------

  const accommodationCollectNow =
    remainingBalance;

  const collectionHeading =
    state === "inside"
      ? "Collection Summary"
      : "Check-In Collection";

  const entranceLabel =
    state === "inside"
      ? "Entrance Fee Collected"
      : "Estimated Entrance Fee";

  const entranceDisplayAmount =
    state === "inside"
      ? entranceFeeCollected
      : entranceFee;

  return `
    <article class="guest-record-card state-${escapeHtml(
      state,
    )}">
      <div class="guest-card-head">
        <div>
          <div class="reservation-code">
            ${escapeHtml(
              booking.reservation_code ||
                `Reservation #${
                  booking.id ||
                  "-"
                }`,
            )}
          </div>

          <div class="reservation-id">
            Reservation ID: #${escapeHtml(
              booking.id ||
                "-",
            )}
          </div>
        </div>

        <div class="guest-badges">
          <span class="guest-state-badge guest-state-${escapeHtml(
            state,
          )}">
            ${escapeHtml(
              formatGuestState(
                state,
              ),
            )}
          </span>

          <span class="reservation-badge reservation-${escapeHtml(
            reservationStatus,
          )}">
            ${escapeHtml(
              formatReservationStatus(
                reservationStatus,
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
        </div>
      </div>

      <div class="guest-info-grid">
        <section class="guest-info-box">
          <span class="info-label">Guest</span>

          <strong>
            ${escapeHtml(
              getGuestName(
                booking,
              ),
            )}
          </strong>

          <span>
            ${escapeHtml(
              booking.phone ||
                booking.contact_no ||
                "-",
            )}
          </span>

          ${
            booking.email
              ? `
                <span>
                  ${escapeHtml(
                    booking.email,
                  )}
                </span>
              `
              : ""
          }
        </section>

        <section class="guest-info-box">
          <span class="info-label">
            Accommodation / Schedule
          </span>

          <strong>
            ${escapeHtml(
              getAccommodationName(
                booking,
              ),
            )}
          </strong>

          <span>
            Check-in:
            ${escapeHtml(
              formatDate(
                getCheckInDateOnly(
                  booking,
                ),
              ),
            )}
            ${escapeHtml(
              formatTime(
                getCheckInTime(
                  booking,
                ),
              ),
            )}
          </span>

          <span>
            Check-out:
            ${escapeHtml(
              formatDate(
                getCheckOutDate(
                  booking,
                ),
              ),
            )}
            ${escapeHtml(
              formatTime(
                getCheckOutTime(
                  booking,
                ),
              ),
            )}
          </span>
        </section>

        <section class="guest-info-box">
          <span class="info-label">
            Guest Count
          </span>

          <strong>
            ${getActualGuestCount(
              booking,
            )} guest(s)
          </strong>

          <span>
            Booked:
            ${getBookedGuestCount(
              booking,
            )}
          </span>
        </section>

        <section class="guest-info-box payment-collection-box">
          <span class="info-label">
            ${escapeHtml(
              collectionHeading,
            )}
          </span>

          <span>
            Remaining Accommodation:
            <strong
              class="${
                remainingBalance >
                0
                  ? "amount-attention"
                  : ""
              }"
            >
              ₱${formatMoney(
                remainingBalance,
              )}
            </strong>
          </span>

          <span>
            ${escapeHtml(
              entranceLabel,
            )}:
            <strong>
              ₱${formatMoney(
                entranceDisplayAmount,
              )}
            </strong>
          </span>

          ${
            state === "inside"
              ? `
                <small class="collection-helper-text">
                  Open Entrance Adjustment for the recalculated
                  entrance balance based on verified actual guests.
                </small>
              `
              : `
                <span>
                  Accommodation to Collect at Check-In:
                  <strong
                    class="${
                      accommodationCollectNow > 0
                        ? "amount-total"
                        : ""
                    }"
                  >
                    ₱${formatMoney(
                      accommodationCollectNow,
                    )}
                  </strong>
                </span>

                <small class="collection-helper-text">
                  The entrance fee is not collected by the Check-In action.
                  It is finalized after Guest Adjustment and Entrance Adjustment.
                </small>
              `
          }
        </section>
      </div>

      <div class="guest-card-footer">
        <div class="guest-state-message">
          ${escapeHtml(
            getGuestStateMessage(
              booking,
            ),
          )}
        </div>

        <div class="guest-actions">
          ${renderGuestAction(
            booking,
            bookingId,
            accommodationCollectNow,
          )}
        </div>
      </div>
    </article>
  `;
}

function renderGuestAction(
  booking,
  bookingId,
  accommodationCollectNow,
) {
  const state =
    getGuestState(booking);

  if (state === "ready") {
    return `
      <button
        type="button"
        class="btn-primary checkin-btn"
        onclick="checkInGuest(${bookingId}, ${accommodationCollectNow}, this)"
      >
        Check In / Allow Entry
      </button>
    `;
  }

  if (state === "inside") {
    return `
      <button
        type="button"
        class="guest-adjustment-action-btn"
        onclick="openGuestAdjustmentModal(${bookingId})"
      >
        Guest Adjustment
      </button>

      <button
        type="button"
        class="entrance-adjustment-action-btn"
        onclick="openEntranceAdjustmentModal(${bookingId})"
      >
        Entrance Adjustment
      </button>

      <span class="guest-action-disabled">
        Already Inside
      </span>
    `;
  }

  if (
    state ===
    "needs_payment"
  ) {
    return `
      <a
        href="frontdeskPayments.html"
        class="guest-action-link"
      >
        Open Payments
      </a>
    `;
  }

  if (
    state === "upcoming"
  ) {
    return `
      <button
        type="button"
        class="guest-action-disabled"
        disabled
      >
        Not Yet Check-in Date
      </button>
    `;
  }

  if (
    state === "passed"
  ) {
    return `
      <button
        type="button"
        class="guest-action-disabled warning"
        disabled
      >
        Check-in Date Passed
      </button>
    `;
  }

  return "";
}

// ============================================================
// SECTION 9: CHECK-IN
// ============================================================

async function checkInGuest(
  bookingId,
  accommodationCollectNow,
  button,
) {
  if (!bookingId) {
    showMessage(
      "Invalid reservation ID.",
      "error",
    );
    return;
  }

  const booking =
    allGuestBookings.find(
      (item) =>
        Number(item.id) ===
        Number(bookingId),
    );

  if (
    !booking ||
    !canCheckIn(booking)
  ) {
    showMessage(
      "This reservation is not currently eligible for check-in.",
      "error",
    );
    return;
  }

  const remainingBalance =
    toMoney(
      booking
        .remaining_balance,
    );

  const entranceFee =
    toMoney(
      booking
        .estimated_entrance_fee,
    );

  const confirmed = confirm(
    [
      "Check in this guest and allow entry?",
      "",
      `Remaining accommodation balance: ₱${formatMoney(
        remainingBalance,
      )}`,
      `Estimated entrance fee: ₱${formatMoney(
        entranceFee,
      )} (finalized after guest/entrance adjustment)`,
      `Accommodation to collect now: ₱${formatMoney(
        accommodationCollectNow,
      )}`,
      "",
      "The Check-In action records the remaining accommodation balance only.",
      "Entrance fee collection is handled separately after Guest Adjustment and Entrance Adjustment.",
      "",
      "Confirm only after the Front Desk has collected the remaining accommodation balance.",
    ].join("\n"),
  );

  if (!confirmed) {
    return;
  }

  const originalText =
    button?.textContent ||
    "Check In / Allow Entry";

  try {
    if (button) {
      button.disabled = true;
      button.textContent =
        "Checking In...";
    }

    const response =
      await fetch(
        `${API_BASE}/bookings/${bookingId}/check-in`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to check in guest.",
      );
    }

    showMessage(
      "Guest checked in successfully. The reservation is now inside the resort.",
      "success",
    );

    await loadGuestBookings();

    const filter =
      document.getElementById(
        "arrivalFilter",
      );

    if (filter) {
      filter.value =
        "inside";
      applyGuestFilters();
    }
  } catch (error) {
    console.error(
      "frontdesk checkInGuest error:",
      error,
    );

    showMessage(
      error.message ||
        "Failed to check in guest.",
      "error",
    );
  } finally {
    if (
      button &&
      document.body.contains(
        button,
      )
    ) {
      button.disabled =
        false;

      button.textContent =
        originalText;
    }
  }
}

// ============================================================
// STEP 3F-B1: GUEST ADJUSTMENT
// ============================================================

function getBookedGuestCount(
  booking,
) {
  return Math.max(
    0,
    Number(
      booking?.booked_guests ??
        booking?.guest_count ??
        0,
    ),
  );
}

function getActualGuestCount(
  booking,
) {
  const bookedCount =
    getBookedGuestCount(
      booking,
    );

  return Math.max(
    1,
    Number(
      booking
        ?.actual_guest_count ??
        booking
          ?.actual_guests ??
        booking?.guests ??
        bookedCount,
    ),
  );
}

function findGuestBookingById(
  bookingId,
) {
  return (
    allGuestBookings.find(
      (booking) =>
        Number(
          booking.id,
        ) ===
        Number(
          bookingId,
        ),
    ) || null
  );
}

async function openGuestAdjustmentModal(
  bookingId,
) {
  const booking =
    findGuestBookingById(
      bookingId,
    );

  const modal =
    document.getElementById(
      "guestAdjustmentModal",
    );

  const guestText =
    document.getElementById(
      "guestAdjustmentGuestText",
    );

  const actualInput =
    document.getElementById(
      "actualGuestCountInput",
    );

  const rateInput =
    document.getElementById(
      "extraGuestRateInput",
    );

  if (
    !booking ||
    !modal ||
    !actualInput ||
    !rateInput
  ) {
    showMessage(
      "Reservation not found.",
      "error",
    );
    return;
  }

  if (
    getGuestState(
      booking,
    ) !== "inside"
  ) {
    showMessage(
      "Guest Adjustment is only available for checked-in guests.",
      "error",
    );
    return;
  }

  selectedGuestAdjustmentBookingId =
    Number(bookingId);

  actualInput.value =
    getActualGuestCount(
      booking,
    );

  rateInput.value = "0";

  guestAdjustmentPaidExtraGuestTotal =
    0;

  if (guestText) {
    guestText.textContent =
      `Verify actual guests for ${getGuestName(
        booking,
      )} under reservation ${
        booking.reservation_code ||
        `#${booking.id}`
      }.`;
  }

  modal.classList.add(
    "show",
  );

  document.body.classList.add(
    "guest-modal-open",
  );

  updateGuestAdjustmentPreview();

  await loadGuestAdjustmentChargeSummary(
    bookingId,
  );

  updateGuestAdjustmentPreview();
}

function closeGuestAdjustmentModal() {
  selectedGuestAdjustmentBookingId =
    null;

  guestAdjustmentPaidExtraGuestTotal =
    0;

  document
    .getElementById(
      "guestAdjustmentModal",
    )
    ?.classList.remove(
      "show",
    );

  document.body.classList.remove(
    "guest-modal-open",
  );
}

async function loadGuestAdjustmentChargeSummary(
  bookingId,
) {
  const paidText =
    document.getElementById(
      "paidExtraGuestChargeText",
    );

  guestAdjustmentPaidExtraGuestTotal =
    0;

  if (paidText) {
    paidText.textContent =
      "Loading...";
  }

  try {
    const response =
      await fetch(
        `${API_BASE}/bookings/${Number(
          bookingId,
        )}/charges`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
          cache: "no-store",
        },
      );

    if (!response.ok) {
      throw new Error(
        "Failed to load existing Extra Guest Charges.",
      );
    }

    const data =
      await response.json();

    const charges =
      Array.isArray(
        data?.charges,
      )
        ? data.charges
        : [];

    guestAdjustmentPaidExtraGuestTotal =
      charges
        .filter(
          (charge) => {
            const name =
              String(
                charge
                  ?.charge_name ||
                  "",
              )
                .trim()
                .toLowerCase();

            return (
              name ===
                "extra guest charge" &&
              Number(
                charge
                  ?.is_paid ||
                  0,
              ) === 1
            );
          },
        )
        .reduce(
          (
            sum,
            charge,
          ) =>
            sum +
            Math.max(
              Number(
                charge
                  ?.charge_amount ||
                  0,
              ),
              0,
            ),
          0,
        );
  } catch (error) {
    console.error(
      "loadGuestAdjustmentChargeSummary error:",
      error,
    );

    guestAdjustmentPaidExtraGuestTotal =
      0;

    showMessage(
      "Could not load previous Extra Guest Charge payments. Review charges before collecting a new amount.",
      "error",
    );
  } finally {
    if (paidText) {
      paidText.textContent =
        `₱${formatMoney(
          guestAdjustmentPaidExtraGuestTotal,
        )}`;
    }
  }
}

function updateGuestAdjustmentPreview() {
  const booking =
    findGuestBookingById(
      selectedGuestAdjustmentBookingId,
    );

  const actualInput =
    document.getElementById(
      "actualGuestCountInput",
    );

  const rateInput =
    document.getElementById(
      "extraGuestRateInput",
    );

  const bookedText =
    document.getElementById(
      "bookedGuestCountText",
    );

  const extraText =
    document.getElementById(
      "extraGuestCountText",
    );

  const chargePreview =
    document.getElementById(
      "extraGuestChargePreview",
    );

  const paidText =
    document.getElementById(
      "paidExtraGuestChargeText",
    );

  const dueText =
    document.getElementById(
      "additionalExtraGuestDueText",
    );

  const bookedGuests =
    getBookedGuestCount(
      booking,
    );

  const actualGuests =
    Math.max(
      1,
      Number(
        actualInput?.value ||
          1,
      ),
    );

  const extraGuestRate =
    Math.max(
      0,
      Number(
        rateInput?.value ||
          0,
      ),
    );

  const extraGuests =
    Math.max(
      actualGuests -
        bookedGuests,
      0,
    );

  const extraGuestCharge =
    extraGuests *
    extraGuestRate;

  const additionalAmountDue =
    Math.max(
      extraGuestCharge -
        guestAdjustmentPaidExtraGuestTotal,
      0,
    );

  if (bookedText) {
    bookedText.textContent =
      String(
        bookedGuests,
      );
  }

  if (extraText) {
    extraText.textContent =
      String(
        extraGuests,
      );
  }

  if (chargePreview) {
    chargePreview.textContent =
      `₱${formatMoney(
        extraGuestCharge,
      )}`;
  }

  if (paidText) {
    paidText.textContent =
      `₱${formatMoney(
        guestAdjustmentPaidExtraGuestTotal,
      )}`;
  }

  if (dueText) {
    dueText.textContent =
      `₱${formatMoney(
        additionalAmountDue,
      )}`;
  }
}

async function readJsonResponseSafely(
  response,
) {
  const rawText =
    await response.text();

  if (!rawText) {
    return {};
  }

  try {
    return JSON.parse(
      rawText,
    );
  } catch (error) {
    console.warn(
      "API response was not valid JSON:",
      rawText,
    );

    return {
      message: rawText,
    };
  }
}

async function confirmGuestAdjustmentWasSaved(
  bookingId,
  expectedActualGuestCount,
) {
  try {
    const response =
      await fetch(
        `${API_BASE}/bookings?scope=all`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
          cache: "no-store",
        },
      );

    if (!response.ok) {
      return false;
    }

    const data =
      await response.json();

    const bookings =
      Array.isArray(data)
        ? data
        : Array.isArray(
              data?.bookings,
            )
          ? data.bookings
          : [];

    const booking =
      bookings.find(
        (item) =>
          Number(
            item?.id,
          ) ===
          Number(
            bookingId,
          ),
      );

    if (!booking) {
      return false;
    }

    const actualGuestCount =
      Number(
        booking
          .actual_guest_count ??
          booking
            .actual_guests ??
          booking.guests ??
          0,
      );

    return (
      actualGuestCount ===
      Number(
        expectedActualGuestCount,
      )
    );
  } catch (error) {
    console.warn(
      "Guest Adjustment verification failed:",
      error,
    );

    return false;
  }
}

async function finishGuestAdjustmentSuccess(
  successMessage,
) {
  closeGuestAdjustmentModal();

  showMessage(
    successMessage ||
      "Guest adjustment applied successfully.",
    "success",
  );

  try {
    await loadGuestBookings();

    const filter =
      document.getElementById(
        "arrivalFilter",
      );

    if (filter) {
      filter.value =
        "inside";
      applyGuestFilters();
    }
  } catch (error) {
    console.error(
      "Guest Adjustment saved but list refresh failed:",
      error,
    );

    showMessage(
      "Guest Adjustment was saved, but the guest list could not refresh automatically. Please click Refresh.",
      "error",
    );
  }
}

async function saveGuestAdjustment() {
  const booking =
    findGuestBookingById(
      selectedGuestAdjustmentBookingId,
    );

  const actualInput =
    document.getElementById(
      "actualGuestCountInput",
    );

  const rateInput =
    document.getElementById(
      "extraGuestRateInput",
    );

  const saveBtn =
    document.getElementById(
      "saveGuestAdjustmentBtn",
    );

  if (
    !booking ||
    !selectedGuestAdjustmentBookingId
  ) {
    showMessage(
      "No selected reservation.",
      "error",
    );
    return;
  }

  const reservationId =
    Number(
      selectedGuestAdjustmentBookingId,
    );

  const actualGuestCount =
    Number(
      actualInput?.value ||
        0,
    );

  const extraGuestRate =
    Number(
      rateInput?.value ||
        0,
    );

  if (
    !Number.isInteger(
      actualGuestCount,
    ) ||
    actualGuestCount < 1
  ) {
    showMessage(
      "Actual guest count must be a whole number and at least 1.",
      "error",
    );
    return;
  }

  if (
    !Number.isFinite(
      extraGuestRate,
    ) ||
    extraGuestRate < 0
  ) {
    showMessage(
      "Extra guest rate cannot be negative.",
      "error",
    );
    return;
  }

  const bookedGuests =
    getBookedGuestCount(
      booking,
    );

  const extraGuests =
    Math.max(
      actualGuestCount -
        bookedGuests,
      0,
    );

  if (
    extraGuests > 0 &&
    extraGuestRate <= 0
  ) {
    showMessage(
      "Enter the extra guest rate before applying this adjustment.",
      "error",
    );

    rateInput?.focus();
    return;
  }

  const originalText =
    saveBtn?.textContent ||
    "Apply Guest Adjustment";

  try {
    if (saveBtn) {
      saveBtn.disabled =
        true;

      saveBtn.textContent =
        "Applying...";
    }

    const response =
      await fetch(
        `${API_BASE}/admin/bookings/${reservationId}/guest-adjustment`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify({
              actual_guest_count:
                actualGuestCount,
              extra_guest_rate:
                extraGuestRate,
            }),
        },
      );

    const data =
      await readJsonResponseSafely(
        response,
      );

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to apply guest adjustment.",
      );
    }

    await finishGuestAdjustmentSuccess(
      data.message ||
        "Guest adjustment applied successfully.",
    );

    return;
  } catch (error) {
    console.error(
      "frontdesk saveGuestAdjustment error:",
      error,
    );

    const wasSaved =
      await confirmGuestAdjustmentWasSaved(
        reservationId,
        actualGuestCount,
      );

    if (wasSaved) {
      await finishGuestAdjustmentSuccess(
        "Guest adjustment saved successfully.",
      );

      return;
    }

    showMessage(
      error.message ||
        "Failed to apply guest adjustment.",
      "error",
    );
  } finally {
    if (saveBtn) {
      saveBtn.disabled =
        false;

      saveBtn.textContent =
        originalText;
    }
  }
}

// ============================================================
// STEP 3F-B2: ENTRANCE FEE ADJUSTMENT
// ============================================================

// ------------------------------------------------------------
// Reset modal data before loading the selected reservation.
// ------------------------------------------------------------

function resetEntranceAdjustmentForm() {
  const seniorInput =
    document.getElementById(
      "entranceSeniorPaxInput",
    );

  const pwdInput =
    document.getElementById(
      "entrancePwdPaxInput",
    );

  const kidInput =
    document.getElementById(
      "entranceKidFreePaxInput",
    );

  const noteInput =
    document.getElementById(
      "entranceAdjustmentNoteInput",
    );

  const currentBox =
    document.getElementById(
      "currentEntranceAdjustmentBox",
    );

  if (seniorInput) {
    seniorInput.value = "0";
  }

  if (pwdInput) {
    pwdInput.value = "0";
  }

  if (kidInput) {
    kidInput.value = "0";
  }

  if (noteInput) {
    noteInput.value = "";
  }

  currentEntranceAdjustmentMeta = {
    entrance_type:
      "pool_beach",
    has_overnight_style:
      false,
    entrance_rate_per_pax:
      0,
    senior_pwd_discount_rate:
      0.2,
    booked_guest_count:
      0,
    actual_guest_count:
      1,
    included_free_entrance_pax:
      0,
    chargeable_entrance_guests:
      0,
    gross_entrance_fee:
      0,
    total_entrance_deduction:
      0,
    final_entrance_fee:
      0,
    entrance_fee_collected:
      0,
    entrance_fee_remaining:
      0,
    entrance_fee_overpaid:
      0,
  };

  if (currentBox) {
    currentBox.classList.add(
      "empty",
    );

    currentBox.innerHTML =
      "No entrance adjustment has been applied yet.";
  }

  updateEntranceAdjustmentPreview();
}

// ------------------------------------------------------------
// Read and validate three quantity fields as whole numbers.
// ------------------------------------------------------------

function getEntranceAdjustmentPaxValues() {
  const readInput = (
    id,
  ) => {
    const raw =
      Number(
        document.getElementById(
          id,
        )?.value || 0,
      );

    if (
      !Number.isFinite(raw)
    ) {
      return 0;
    }

    return raw;
  };

  return {
    seniorPax:
      readInput(
        "entranceSeniorPaxInput",
      ),

    pwdPax:
      readInput(
        "entrancePwdPaxInput",
      ),

    kidFreePax:
      readInput(
        "entranceKidFreePaxInput",
      ),
  };
}

function formatEntranceAdjustmentType(
  type,
) {
  const value =
    String(type || "")
      .trim()
      .toLowerCase();

  if (value === "senior") {
    return "Senior Citizen 20%";
  }

  if (value === "pwd") {
    return "PWD 20%";
  }

  if (
    value === "kid_free"
  ) {
    return "Qualified Kid Free";
  }

  return "Entrance Adjustment";
}

// ------------------------------------------------------------
// Open modal only for checked-in / Inside Resort reservations.
// ------------------------------------------------------------

async function openEntranceAdjustmentModal(
  bookingId,
) {
  const booking =
    findGuestBookingById(
      bookingId,
    );

  const modal =
    document.getElementById(
      "entranceAdjustmentModal",
    );

  const guestText =
    document.getElementById(
      "entranceAdjustmentGuestText",
    );

  if (
    !booking ||
    !modal
  ) {
    showMessage(
      "Reservation not found.",
      "error",
    );
    return;
  }

  if (
    getGuestState(
      booking,
    ) !== "inside"
  ) {
    showMessage(
      "Entrance Adjustment is only available for checked-in guests.",
      "error",
    );
    return;
  }

  selectedEntranceAdjustmentBookingId =
    Number(bookingId);

  resetEntranceAdjustmentForm();

  if (guestText) {
    guestText.textContent =
      `Verify entrance adjustments for ${getGuestName(
        booking,
      )} under reservation ${
        booking.reservation_code ||
        `#${booking.id}`
      }.`;
  }

  modal.classList.add(
    "show",
  );

  document.body.classList.add(
    "guest-modal-open",
  );

  await loadEntranceAdjustment();
}

function closeEntranceAdjustmentModal() {
  selectedEntranceAdjustmentBookingId =
    null;

  document
    .getElementById(
      "entranceAdjustmentModal",
    )
    ?.classList.remove(
      "show",
    );

  document.body.classList.remove(
    "guest-modal-open",
  );
}

// ------------------------------------------------------------
// Load saved rows + backend computation metadata.
// ------------------------------------------------------------

async function loadEntranceAdjustment() {
  if (
    !selectedEntranceAdjustmentBookingId
  ) {
    return;
  }

  const currentBox =
    document.getElementById(
      "currentEntranceAdjustmentBox",
    );

  const seniorInput =
    document.getElementById(
      "entranceSeniorPaxInput",
    );

  const pwdInput =
    document.getElementById(
      "entrancePwdPaxInput",
    );

  const kidInput =
    document.getElementById(
      "entranceKidFreePaxInput",
    );

  const noteInput =
    document.getElementById(
      "entranceAdjustmentNoteInput",
    );

  if (currentBox) {
    currentBox.classList.add(
      "empty",
    );

    currentBox.textContent =
      "Loading entrance adjustment...";
  }

  try {
    const response =
      await fetch(
        `${API_BASE}/bookings/${Number(
          selectedEntranceAdjustmentBookingId,
        )}/discounts`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
          cache: "no-store",
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to load entrance adjustment.",
      );
    }

    const meta =
      data.meta || {};

    currentEntranceAdjustmentMeta = {
      ...currentEntranceAdjustmentMeta,

      entrance_type:
        String(
          meta.entrance_type ||
            "pool_beach",
        ),

      has_overnight_style:
        Boolean(
          meta.has_overnight_style,
        ),

      entrance_rate_per_pax:
        Number(
          meta
            .entrance_rate_per_pax ||
            0,
        ),

      senior_pwd_discount_rate:
        Number(
          meta
            .senior_pwd_discount_rate ||
            0.2,
        ),

      booked_guest_count:
        Number(
          meta
            .booked_guest_count ||
            0,
        ),

      actual_guest_count:
        Number(
          meta
            .actual_guest_count ||
            1,
        ),

      included_free_entrance_pax:
        Number(
          meta
            .included_free_entrance_pax ||
            0,
        ),

      chargeable_entrance_guests:
        Number(
          meta
            .chargeable_entrance_guests ||
            0,
        ),

      gross_entrance_fee:
        Number(
          meta
            .gross_entrance_fee ||
            0,
        ),

      total_entrance_deduction:
        Number(
          meta
            .total_entrance_deduction ||
            0,
        ),

      final_entrance_fee:
        Number(
          meta
            .final_entrance_fee ||
            0,
        ),

      entrance_fee_collected:
        Number(
          meta
            .entrance_fee_collected ||
            0,
        ),

      entrance_fee_remaining:
        Number(
          meta
            .entrance_fee_remaining ||
            0,
        ),

      entrance_fee_overpaid:
        Number(
          meta
            .entrance_fee_overpaid ||
            0,
        ),
    };

    const discounts =
      Array.isArray(
        data.discounts,
      )
        ? data.discounts
        : data.discount
          ? [
              data.discount,
            ]
          : [];

    if (seniorInput) {
      seniorInput.value =
        "0";
    }

    if (pwdInput) {
      pwdInput.value =
        "0";
    }

    if (kidInput) {
      kidInput.value =
        "0";
    }

    let latestNote = "";

    discounts.forEach(
      (discount) => {
        const type =
          String(
            discount
              .discount_type ||
              "",
          )
            .trim()
            .toLowerCase();

        const qualifiedPax =
          Number(
            discount
              .qualified_pax ||
              0,
          );

        if (
          type ===
            "senior" &&
          seniorInput
        ) {
          seniorInput.value =
            qualifiedPax;
        }

        if (
          type === "pwd" &&
          pwdInput
        ) {
          pwdInput.value =
            qualifiedPax;
        }

        if (
          type ===
            "kid_free" &&
          kidInput
        ) {
          kidInput.value =
            qualifiedPax;
        }

        if (
          discount
            .discount_note
        ) {
          latestNote =
            String(
              discount
                .discount_note,
            ).trim();
        }
      },
    );

    if (noteInput) {
      noteInput.value =
        latestNote;
    }

    renderCurrentEntranceAdjustment(
      discounts,
    );

    updateEntranceAdjustmentPreview();
  } catch (error) {
    console.error(
      "loadEntranceAdjustment error:",
      error,
    );

    if (currentBox) {
      currentBox.classList.add(
        "empty",
      );

      currentBox.textContent =
        "Failed to load entrance adjustment.";
    }

    showMessage(
      error.message ||
        "Failed to load entrance adjustment.",
      "error",
    );
  }
}

// ------------------------------------------------------------
// Render saved rows returned by the backend.
// ------------------------------------------------------------

function renderCurrentEntranceAdjustment(
  discounts,
) {
  const currentBox =
    document.getElementById(
      "currentEntranceAdjustmentBox",
    );

  if (!currentBox) {
    return;
  }

  if (
    !Array.isArray(
      discounts,
    ) ||
    !discounts.length
  ) {
    currentBox.classList.add(
      "empty",
    );

    currentBox.innerHTML =
      "No entrance adjustment has been applied yet.";

    return;
  }

  const rowsHtml =
    discounts
      .map(
        (discount) => {
          return `
            <div class="current-entrance-adjustment-line">
              <span>
                ${escapeHtml(
                  formatEntranceAdjustmentType(
                    discount
                      .discount_type,
                  ),
                )}
                — ${Number(
                  discount
                    .qualified_pax ||
                    0,
                )} pax
              </span>

              <strong>
                -₱${formatMoney(
                  discount
                    .discount_amount,
                )}
              </strong>
            </div>
          `;
        },
      )
      .join("");

  currentBox.classList.remove(
    "empty",
  );

  currentBox.innerHTML = `
    <strong class="current-entrance-adjustment-title">
      Current Saved Entrance Adjustments
    </strong>

    ${rowsHtml}

    <div class="current-entrance-adjustment-line total">
      <span>
        Total Saved Deduction
      </span>

      <strong>
        -₱${formatMoney(
          currentEntranceAdjustmentMeta
            .total_entrance_deduction,
        )}
      </strong>
    </div>
  `;
}

// ------------------------------------------------------------
// Client-side live preview.
//
// Backend remains source of truth. This preview only helps Front
// Desk understand the amount before clicking Apply.
// ------------------------------------------------------------

function calculateEntranceAdjustmentPreview() {
  const {
    seniorPax,
    pwdPax,
    kidFreePax,
  } =
    getEntranceAdjustmentPaxValues();

  const entranceRate =
    Number(
      currentEntranceAdjustmentMeta
        .entrance_rate_per_pax ||
        0,
    );

  const discountRate =
    Number(
      currentEntranceAdjustmentMeta
        .senior_pwd_discount_rate ||
        0.2,
    );

  const grossEntranceFee =
    Number(
      currentEntranceAdjustmentMeta
        .gross_entrance_fee ||
        0,
    );

  const collected =
    Number(
      currentEntranceAdjustmentMeta
        .entrance_fee_collected ||
        0,
    );

  const seniorDiscount =
    Math.max(
      0,
      entranceRate *
        discountRate *
        seniorPax,
    );

  const pwdDiscount =
    Math.max(
      0,
      entranceRate *
        discountRate *
        pwdPax,
    );

  const kidDiscount =
    Math.max(
      0,
      entranceRate *
        kidFreePax,
    );

  const totalDeduction =
    seniorDiscount +
    pwdDiscount +
    kidDiscount;

  const finalEntranceFee =
    Math.max(
      grossEntranceFee -
        totalDeduction,
      0,
    );

  const remainingEntranceFee =
    Math.max(
      finalEntranceFee -
        collected,
      0,
    );

  const overpaidEntranceFee =
    Math.max(
      collected -
        finalEntranceFee,
      0,
    );

  return {
    seniorPax,
    pwdPax,
    kidFreePax,
    seniorDiscount,
    pwdDiscount,
    kidDiscount,
    totalDeduction,
    finalEntranceFee,
    remainingEntranceFee,
    overpaidEntranceFee,
  };
}

function updateEntranceAdjustmentPreview() {
  const preview =
    calculateEntranceAdjustmentPreview();

  setText(
    "entranceBookedGuestsText",
    Number(
      currentEntranceAdjustmentMeta
        .booked_guest_count ||
        0,
    ),
  );

  setText(
    "entranceActualGuestsText",
    Number(
      currentEntranceAdjustmentMeta
        .actual_guest_count ||
        0,
    ),
  );

  setText(
    "entranceIncludedFreeText",
    `${Number(
      currentEntranceAdjustmentMeta
        .included_free_entrance_pax ||
        0,
    )} pax`,
  );

  setText(
    "entranceChargeableGuestsText",
    Number(
      currentEntranceAdjustmentMeta
        .chargeable_entrance_guests ||
        0,
    ),
  );

  setText(
    "entranceRateText",
    `₱${formatMoney(
      currentEntranceAdjustmentMeta
        .entrance_rate_per_pax,
    )}`,
  );

  setText(
    "entranceCollectedText",
    `₱${formatMoney(
      currentEntranceAdjustmentMeta
        .entrance_fee_collected,
    )}`,
  );

  setText(
    "grossEntranceFeeText",
    `₱${formatMoney(
      currentEntranceAdjustmentMeta
        .gross_entrance_fee,
    )}`,
  );

  setText(
    "entranceSeniorDiscountText",
    `-₱${formatMoney(
      preview.seniorDiscount,
    )}`,
  );

  setText(
    "entrancePwdDiscountText",
    `-₱${formatMoney(
      preview.pwdDiscount,
    )}`,
  );

  setText(
    "entranceKidDiscountText",
    `-₱${formatMoney(
      preview.kidDiscount,
    )}`,
  );

  setText(
    "entranceTotalDeductionText",
    `-₱${formatMoney(
      preview.totalDeduction,
    )}`,
  );

  setText(
    "finalEntranceFeeText",
    `₱${formatMoney(
      preview.finalEntranceFee,
    )}`,
  );

  setText(
    "remainingEntranceFeeText",
    `₱${formatMoney(
      preview.remainingEntranceFee,
    )}`,
  );

  setText(
    "entranceOverpaidText",
    `₱${formatMoney(
      preview.overpaidEntranceFee,
    )}`,
  );

  const overpaidRow =
    document.getElementById(
      "entranceOverpaidRow",
    );

  if (overpaidRow) {
    overpaidRow.classList.toggle(
      "show",
      preview.overpaidEntranceFee >
        0,
    );
  }

  const policyNote =
    document.getElementById(
      "entranceAdjustmentPolicyNote",
    );

  if (policyNote) {
    const chargeableGuests =
      Number(
        currentEntranceAdjustmentMeta
          .chargeable_entrance_guests ||
          0,
      );

    const totalQualified =
      preview.seniorPax +
      preview.pwdPax +
      preview.kidFreePax;

    const baseMessage =
      `Qualified adjustment pax: ${totalQualified} / ${chargeableGuests} chargeable entrance guests. ` +
      "Senior/PWD receive 20% off entrance fee only. Qualified kids receive free entrance.";

    if (
      totalQualified >
      chargeableGuests
    ) {
      policyNote.classList.add(
        "invalid",
      );

      policyNote.textContent =
        `${baseMessage} The current quantities exceed the allowed chargeable guest count.`;
    } else {
      policyNote.classList.remove(
        "invalid",
      );

      policyNote.textContent =
        baseMessage;
    }
  }
}

// ------------------------------------------------------------
// Validate UI values before calling the backend.
// Backend validates again for security and consistency.
// ------------------------------------------------------------

function validateEntranceAdjustmentInput() {
  const values =
    getEntranceAdjustmentPaxValues();

  const inputs = [
    {
      label:
        "Senior Citizen pax",
      value:
        values.seniorPax,
    },
    {
      label:
        "PWD pax",
      value:
        values.pwdPax,
    },
    {
      label:
        "Qualified Kid pax",
      value:
        values.kidFreePax,
    },
  ];

  for (
    const input
    of inputs
  ) {
    if (
      !Number.isInteger(
        input.value,
      ) ||
      input.value < 0
    ) {
      return {
        valid: false,
        message:
          `${input.label} must be a whole number and cannot be negative.`,
      };
    }
  }

  const totalQualified =
    values.seniorPax +
    values.pwdPax +
    values.kidFreePax;

  if (
    totalQualified <= 0
  ) {
    return {
      valid: false,
      message:
        "Enter at least one Senior Citizen, PWD, or qualified kid before applying an entrance adjustment.",
    };
  }

  const chargeableGuests =
    Number(
      currentEntranceAdjustmentMeta
        .chargeable_entrance_guests ||
        0,
    );

  if (
    totalQualified >
    chargeableGuests
  ) {
    return {
      valid: false,
      message:
        "Total qualified Senior/PWD/Kid pax cannot be greater than the chargeable entrance guest count.",
    };
  }

  const note =
    String(
      document.getElementById(
        "entranceAdjustmentNoteInput",
      )?.value || "",
    ).trim();

  if (!note) {
    return {
      valid: false,
      message:
        "Please add a verification note for the entrance adjustment.",
    };
  }

  return {
    valid: true,
    values,
    note,
  };
}

// ------------------------------------------------------------
// Save Senior / PWD / Kid adjustments.
// ------------------------------------------------------------

async function saveEntranceAdjustment() {
  if (
    !selectedEntranceAdjustmentBookingId
  ) {
    showMessage(
      "No selected reservation.",
      "error",
    );
    return;
  }

  const validation =
    validateEntranceAdjustmentInput();

  if (!validation.valid) {
    showMessage(
      validation.message,
      "error",
    );
    return;
  }

  const saveBtn =
    document.getElementById(
      "saveEntranceAdjustmentBtn",
    );

  const originalText =
    saveBtn?.textContent ||
    "Apply Entrance Adjustment";

  try {
    if (saveBtn) {
      saveBtn.disabled =
        true;

      saveBtn.textContent =
        "Applying...";
    }

    const response =
      await fetch(
        `${API_BASE}/bookings/${Number(
          selectedEntranceAdjustmentBookingId,
        )}/discounts`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify({
              senior_pax:
                validation.values
                  .seniorPax,

              pwd_pax:
                validation.values
                  .pwdPax,

              kid_free_pax:
                validation.values
                  .kidFreePax,

              discount_note:
                validation.note,
            }),
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to save entrance adjustment.",
      );
    }

    showMessage(
      data.message ||
        "Entrance adjustments saved successfully.",
      "success",
    );

    closeEntranceAdjustmentModal();

    await loadGuestBookings();

    const filter =
      document.getElementById(
        "arrivalFilter",
      );

    if (filter) {
      filter.value =
        "inside";

      applyGuestFilters();
    }
  } catch (error) {
    console.error(
      "saveEntranceAdjustment error:",
      error,
    );

    showMessage(
      error.message ||
        "Failed to save entrance adjustment.",
      "error",
    );
  } finally {
    if (saveBtn) {
      saveBtn.disabled =
        false;

      saveBtn.textContent =
        originalText;
    }
  }
}

// ------------------------------------------------------------
// Remove all Senior/PWD/Kid rows for this reservation.
// ------------------------------------------------------------

async function removeEntranceAdjustment() {
  if (
    !selectedEntranceAdjustmentBookingId
  ) {
    showMessage(
      "No selected reservation.",
      "error",
    );
    return;
  }

  const confirmed =
    confirm(
      "Remove all Senior Citizen, PWD, and qualified kid entrance adjustments for this reservation?",
    );

  if (!confirmed) {
    return;
  }

  const removeBtn =
    document.getElementById(
      "removeEntranceAdjustmentBtn",
    );

  const originalText =
    removeBtn?.textContent ||
    "Remove Adjustment";

  try {
    if (removeBtn) {
      removeBtn.disabled =
        true;

      removeBtn.textContent =
        "Removing...";
    }

    const response =
      await fetch(
        `${API_BASE}/bookings/${Number(
          selectedEntranceAdjustmentBookingId,
        )}/discounts`,
        {
          method:
            "DELETE",
          headers: {
            Accept:
              "application/json",
          },
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to remove entrance adjustment.",
      );
    }

    showMessage(
      data.message ||
        "Entrance adjustments removed successfully.",
      "success",
    );

    closeEntranceAdjustmentModal();

    await loadGuestBookings();

    const filter =
      document.getElementById(
        "arrivalFilter",
      );

    if (filter) {
      filter.value =
        "inside";

      applyGuestFilters();
    }
  } catch (error) {
    console.error(
      "removeEntranceAdjustment error:",
      error,
    );

    showMessage(
      error.message ||
        "Failed to remove entrance adjustment.",
      "error",
    );
  } finally {
    if (removeBtn) {
      removeBtn.disabled =
        false;

      removeBtn.textContent =
        originalText;
    }
  }
}

// ============================================================
// SECTION 10: RECORD STATE TEXT
// ============================================================

function getGuestStateMessage(
  booking,
) {
  const state =
    getGuestState(booking);

  if (state === "ready") {
    return "Confirmed reservation is ready for today's check-in.";
  }

  if (state === "inside") {
    return "Guest is already checked in and currently inside the resort.";
  }

  if (
    state ===
    "needs_payment"
  ) {
    return "Required payment must be verified before check-in.";
  }

  if (
    state === "upcoming"
  ) {
    return `Scheduled check-in: ${formatDate(
      getCheckInDateOnly(
        booking,
      ),
    )}.`;
  }

  if (state === "passed") {
    return "Scheduled check-in date has already passed. Review this reservation manually.";
  }

  return "Review this reservation before processing guest entry.";
}

// ============================================================
// SECTION 11: BOOKING HELPERS
// ============================================================

function getReservationStatus(
  booking,
) {
  return String(
    booking.status ||
      booking
        .reservation_status ||
      "pending",
  ).toLowerCase();
}

function getPaymentStatus(
  booking,
) {
  return String(
    booking.payment_status ||
      "pending",
  ).toLowerCase();
}

function isCheckedIn(booking) {
  const raw =
    booking.is_checked_in;

  return (
    raw === true ||
    Number(raw || 0) === 1 ||
    String(raw || "")
      .toLowerCase() ===
      "true"
  );
}

function getGuestName(booking) {
  const direct =
    booking.customer_name ||
    booking.fullname ||
    booking.guest_name ||
    booking.name;

  if (direct) {
    return String(
      direct,
    ).trim();
  }

  return (
    [
      booking.first_name,
      booking.middle_name,
      booking.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    "Guest"
  );
}

function getAccommodationName(
  booking,
) {
  return (
    booking
      .accommodation_list ||
    booking.room_name ||
    booking
      .accommodation_name ||
    booking.items
      ?.map(
        (item) =>
          item
            .accommodation_name,
      )
      .filter(Boolean)
      .join(", ") ||
    "N/A"
  );
}

function getCheckInTime(
  booking,
) {
  return (
    booking.check_in_time ||
    booking.items?.[0]
      ?.check_in_time ||
    ""
  );
}

function getCheckOutDate(
  booking,
) {
  return normalizeDateKey(
    booking.check_out ||
      booking
        .check_out_date ||
      booking.items?.[0]
        ?.check_out_date ||
      "",
  );
}

function getCheckOutTime(
  booking,
) {
  return (
    booking.check_out_time ||
    booking.items?.[0]
      ?.check_out_time ||
    ""
  );
}

// ============================================================
// SECTION 12: FORMATTING
// ============================================================

function formatGuestState(
  state,
) {
  const labels = {
    ready:
      "Ready Today",
    inside:
      "Inside Resort",
    needs_payment:
      "Needs Payment",
    upcoming:
      "Upcoming",
    passed:
      "Date Passed",
    other:
      "Review",
  };

  return (
    labels[state] ||
    titleCase(state)
  );
}

function formatReservationStatus(
  status,
) {
  const labels = {
    pending:
      "Pending",
    approved:
      "Reservation Confirmed",
    completed:
      "Completed",
    cancelled:
      "Cancelled",
    rejected:
      "Rejected",
  };

  return (
    labels[status] ||
    titleCase(status)
  );
}

function formatPaymentStatus(
  status,
) {
  const labels = {
    pending:
      "Pending",
    unpaid:
      "Unpaid",
    partially_paid:
      "Partially Paid",
    paid:
      "Paid",
    rejected:
      "Rejected",
  };

  return (
    labels[status] ||
    titleCase(status)
  );
}

function titleCase(value) {
  return String(
    value || "",
  )
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (
        character,
      ) =>
        character.toUpperCase(),
    );
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(
      `${value}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-PH",
    {
      year:
        "numeric",
      month:
        "short",
      day:
        "numeric",
    },
  );
}

function formatTime(value) {
  if (!value) {
    return "-";
  }

  const match =
    String(
      value,
    ).match(
      /^(\d{1,2}):(\d{2})/,
    );

  if (!match) {
    return value;
  }

  const date =
    new Date();

  date.setHours(
    Number(match[1]),
    Number(match[2]),
    0,
    0,
  );

  return date.toLocaleTimeString(
    "en-PH",
    {
      hour:
        "numeric",
      minute:
        "2-digit",
    },
  );
}

function toMoney(value) {
  const amount =
    Number(
      value || 0,
    );

  return Number.isFinite(
    amount,
  )
    ? amount
    : 0;
}

function formatMoney(value) {
  return Number(
    value || 0,
  ).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits:
        2,
      maximumFractionDigits:
        2,
    },
  );
}

// ============================================================
// SECTION 13: DOM / MESSAGE HELPERS
// ============================================================

function setGuestRecords(html) {
  const container =
    document.getElementById(
      "guestRecords",
    );

  if (container) {
    container.innerHTML =
      html;
  }
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
    return;
  }

  alert(message);
}

function escapeHtml(value) {
  return String(
    value ?? "",
  )
    .replace(
      /&/g,
      "&amp;",
    )
    .replace(
      /</g,
      "&lt;",
    )
    .replace(
      />/g,
      "&gt;",
    )
    .replace(
      /"/g,
      "&quot;",
    )
    .replace(
      /'/g,
      "&#039;",
    );
}
