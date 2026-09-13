const db = require("../../config/db");

// ============================================================
// STEP 3F-H: FRONT DESK — FINAL CHECKOUT VALIDATION
//
// Purpose:
// - Recalculate every checkout-critical balance on the backend.
// - Block checkout when anything still requires Front Desk action.
// - Complete the reservation only when all financial and guest
//   verification requirements are settled.
// - Do NOT auto-collect or auto-correct money during checkout.
//
// Checkout completion writes only:
//   reservation_status = 'completed'
//   is_checked_in      = 0
//
// Existing checked_in_at is preserved as history.
// The current reservations table has no checked_out_at column,
// so Step 3F-H intentionally requires no database migration.
// ============================================================

const MONEY_EPSILON = 0.005;

const ENTRANCE_RATES = {
  pool_beach: {
    day: { adult: 250 },
    overnight: { adult: 300 },
  },
  beach_only: {
    day: { adult: 150 },
    overnight: { adult: 200 },
  },
};

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toMoney(value) {
  return Math.max(toNumber(value, 0), 0);
}

function normalize(value) {
  return String(value || "").trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

function getEntranceTypeFromNote(note) {
  const text = normalizeLower(note);

  if (text.includes("entrance type: beach only")) {
    return "beach_only";
  }

  return "pool_beach";
}

function hasOvernightStyle(items) {
  return items.some((item) => {
    const text = normalizeLower(
      `${item.slot_type || ""} ${item.slot_label || ""}`,
    );

    return (
      text.includes("night") ||
      text.includes("overnight") ||
      text.includes("22") ||
      text.includes("23") ||
      text.includes("extended")
    );
  });
}

function getAdultEntranceRate(entranceType, overnightStyle) {
  const type =
    entranceType === "beach_only" ? "beach_only" : "pool_beach";
  const period = overnightStyle ? "overnight" : "day";

  return toMoney(ENTRANCE_RATES[type][period].adult);
}

function classifyCharge(chargeName) {
  const name = normalize(chargeName);
  const lower = name.toLowerCase();

  if (lower === "extra guest charge") {
    return { category: "extra_guest", category_label: "Extra Guest" };
  }

  if (lower === "extra bed charge") {
    return { category: "extra_bed", category_label: "Extra Bed" };
  }

  if (lower.startsWith("additional - ")) {
    return {
      category: "additional",
      category_label:
        name.slice("Additional - ".length).trim() || "Additional Charge",
    };
  }

  return {
    category: "other",
    category_label: name || "Other Charge",
  };
}

async function getReservation(connection, reservationId, lock = false) {
  const lockSql = lock ? "FOR UPDATE" : "";

  const [rows] = await connection.query(
    `
    SELECT
      id,
      reservation_code,
      reservation_status,
      payment_status,
      is_checked_in,
      checked_in_at,
      guest_count,
      actual_guest_count,
      accommodation_total,
      required_downpayment,
      paid_amount,
      remaining_balance,
      estimated_entrance_fee,
      entrance_fee_paid,
      entrance_fee_collected,
      extra_bed_count,
      extra_bed_fee,
      extra_bed_paid,
      extra_bed_paid_at,
      note
    FROM reservations
    WHERE id = ?
    LIMIT 1
    ${lockSql}
    `,
    [reservationId],
  );

  return rows[0] || null;
}

async function getReservationItems(connection, reservationId) {
  const [rows] = await connection.query(
    `
    SELECT
      ri.id,
      ri.accommodation_id,
      ri.slot_type,
      ri.slot_label,
      ri.check_in_date,
      ri.check_in_time,
      ri.check_out_date,
      ri.check_out_time,
      ri.item_price,
      COALESCE(a.free_entrance_pax, 0) AS free_entrance_pax
    FROM reservation_items ri
    INNER JOIN accommodations a
      ON ri.accommodation_id = a.id
    WHERE ri.reservation_id = ?
    ORDER BY ri.id ASC
    `,
    [reservationId],
  );

  return rows;
}

async function getDiscountRows(connection, reservationId, lock = false) {
  const lockSql = lock ? "FOR UPDATE" : "";

  const [rows] = await connection.query(
    `
    SELECT
      id,
      booking_id,
      discount_type,
      qualified_pax,
      discount_amount,
      discount_note
    FROM booking_discounts
    WHERE booking_id = ?
    ORDER BY id ASC
    ${lockSql}
    `,
    [reservationId],
  );

  return rows;
}

async function getChargeRows(connection, reservationId, lock = false) {
  const lockSql = lock ? "FOR UPDATE" : "";

  const [rows] = await connection.query(
    `
    SELECT
      id,
      booking_id,
      charge_name,
      charge_amount,
      charge_note,
      COALESCE(is_paid, 0) AS is_paid,
      paid_at,
      created_at
    FROM booking_charges
    WHERE booking_id = ?
    ORDER BY created_at ASC, id ASC
    ${lockSql}
    `,
    [reservationId],
  );

  return rows.map((row) => ({
    ...row,
    ...classifyCharge(row.charge_name),
  }));
}

function calculateAccommodationSummary(reservation) {
  const total = toMoney(reservation.accommodation_total);
  const paid = toMoney(reservation.paid_amount);
  const storedRemaining = toMoney(reservation.remaining_balance);
  const recalculatedRemaining = Math.max(total - paid, 0);
  const overpaid = Math.max(paid - total, 0);

  return {
    accommodation_total: total,
    accommodation_paid: paid,
    stored_remaining_balance: storedRemaining,
    accommodation_remaining: recalculatedRemaining,
    accommodation_overpaid: overpaid,
    balance_mismatch:
      Math.abs(storedRemaining - recalculatedRemaining) > MONEY_EPSILON,
    settled:
      recalculatedRemaining <= MONEY_EPSILON &&
      overpaid <= MONEY_EPSILON,
  };
}

function calculateEntranceSummary(reservation, items, discountRows) {
  const entranceType = getEntranceTypeFromNote(reservation.note);
  const overnightStyle = hasOvernightStyle(items);
  const adultRate = getAdultEntranceRate(entranceType, overnightStyle);

  const bookedGuestCount = Math.max(0, toNumber(reservation.guest_count, 0));
  const hasVerifiedActualGuestCount =
    reservation.actual_guest_count !== null &&
    reservation.actual_guest_count !== undefined;

  const actualGuestCount = Math.max(
    1,
    toNumber(
      reservation.actual_guest_count ?? reservation.guest_count ?? 1,
      1,
    ),
  );

  const rawFreeEntrance = items.reduce(
    (sum, item) => sum + toMoney(item.free_entrance_pax),
    0,
  );
  const includedFreeEntrancePax = Math.min(
    rawFreeEntrance,
    actualGuestCount,
  );
  const chargeableGuests = Math.max(
    actualGuestCount - includedFreeEntrancePax,
    0,
  );
  const grossEntranceFee = adultRate * chargeableGuests;
  const totalAdjustment = discountRows.reduce(
    (sum, row) => sum + toMoney(row.discount_amount),
    0,
  );
  const finalEntranceFee = Math.max(
    grossEntranceFee - totalAdjustment,
    0,
  );
  const collected = toMoney(reservation.entrance_fee_collected);
  const remaining = Math.max(finalEntranceFee - collected, 0);
  const overpaid = Math.max(collected - finalEntranceFee, 0);

  return {
    entrance_type: entranceType,
    has_overnight_style: overnightStyle,
    adult_entrance_rate_per_pax: adultRate,
    booked_guest_count: bookedGuestCount,
    actual_guest_count: actualGuestCount,
    has_verified_actual_guest_count: hasVerifiedActualGuestCount,
    included_free_entrance_pax: includedFreeEntrancePax,
    chargeable_entrance_guests: chargeableGuests,
    gross_entrance_fee: grossEntranceFee,
    total_entrance_adjustment: totalAdjustment,
    final_entrance_fee: finalEntranceFee,
    entrance_fee_collected: collected,
    entrance_fee_remaining: remaining,
    entrance_fee_overpaid: overpaid,
    stored_entrance_fee_paid: Number(reservation.entrance_fee_paid || 0),
    settled:
      remaining <= MONEY_EPSILON &&
      overpaid <= MONEY_EPSILON,
  };
}

function calculateBookingChargeSummary(chargeRows) {
  const total = chargeRows.reduce(
    (sum, row) => sum + toMoney(row.charge_amount),
    0,
  );
  const paid = chargeRows.reduce(
    (sum, row) =>
      Number(row.is_paid || 0) === 1
        ? sum + toMoney(row.charge_amount)
        : sum,
    0,
  );
  const unpaidRows = chargeRows.filter(
    (row) => Number(row.is_paid || 0) !== 1,
  );
  const unpaid = unpaidRows.reduce(
    (sum, row) => sum + toMoney(row.charge_amount),
    0,
  );

  const categoryTotals = {
    extra_guest: 0,
    extra_bed: 0,
    additional: 0,
    other: 0,
  };

  unpaidRows.forEach((row) => {
    const category = Object.prototype.hasOwnProperty.call(
      categoryTotals,
      row.category,
    )
      ? row.category
      : "other";

    categoryTotals[category] += toMoney(row.charge_amount);
  });

  const paidExtraBedCharges = chargeRows.reduce(
    (sum, row) =>
      row.category === "extra_bed" && Number(row.is_paid || 0) === 1
        ? sum + toMoney(row.charge_amount)
        : sum,
    0,
  );

  return {
    total_booking_charges: total,
    paid_booking_charges: paid,
    unpaid_booking_charges: unpaid,
    unpaid_charge_count: unpaidRows.length,
    unpaid_charges: unpaidRows,
    category_totals: categoryTotals,
    paid_extra_bed_charges: paidExtraBedCharges,
    settled:
      unpaid <= MONEY_EPSILON &&
      unpaidRows.length === 0,
  };
}

function calculateExtraBedSummary(reservation, chargeSummary) {
  const target = toMoney(reservation.extra_bed_fee);
  const paidFromCharges = toMoney(chargeSummary.paid_extra_bed_charges);
  const overpaid = Math.max(paidFromCharges - target, 0);
  const remaining = Math.max(target - paidFromCharges, 0);
  const hasExtraBed =
    Number(reservation.extra_bed_count || 0) > 0 ||
    target > MONEY_EPSILON;

  return {
    extra_bed_count: Math.max(0, Number(reservation.extra_bed_count || 0)),
    extra_bed_fee: target,
    paid_extra_bed_charges: paidFromCharges,
    extra_bed_remaining: remaining,
    extra_bed_overpaid: overpaid,
    stored_extra_bed_paid: Number(reservation.extra_bed_paid || 0),
    settled:
      !hasExtraBed ||
      (remaining <= MONEY_EPSILON &&
        overpaid <= MONEY_EPSILON &&
        Number(reservation.extra_bed_paid || 0) === 1),
  };
}

function buildBlockers({
  reservation,
  accommodation,
  entrance,
  bookingCharges,
  extraBed,
}) {
  const blockers = [];
  const status = normalizeLower(reservation.reservation_status);
  const paymentStatus = normalizeLower(reservation.payment_status);

  if (status === "completed") {
    return blockers;
  }

  if (status !== "approved") {
    blockers.push({
      code: "reservation_status",
      label: "Reservation Status",
      amount: 0,
      message: "Only approved checked-in reservations can be checked out.",
    });
  }

  if (Number(reservation.is_checked_in || 0) !== 1) {
    blockers.push({
      code: "not_checked_in",
      label: "Guest Status",
      amount: 0,
      message: "The guest is not currently marked as inside the resort.",
    });
  }

  if (!entrance.has_verified_actual_guest_count) {
    blockers.push({
      code: "guest_adjustment_required",
      label: "Guest Adjustment",
      amount: 0,
      message:
        "Verify the actual guest count in Guest Adjustment before checkout.",
    });
  }

  if (accommodation.accommodation_overpaid > MONEY_EPSILON) {
    blockers.push({
      code: "accommodation_overpayment",
      label: "Accommodation Overpayment",
      amount: accommodation.accommodation_overpaid,
      message:
        "Review the accommodation overpayment before completing checkout.",
    });
  } else if (accommodation.accommodation_remaining > MONEY_EPSILON) {
    blockers.push({
      code: "accommodation_balance",
      label: "Accommodation Balance",
      amount: accommodation.accommodation_remaining,
      message:
        "Collect the remaining accommodation balance before checkout.",
    });
  } else if (paymentStatus !== "paid") {
    blockers.push({
      code: "payment_status",
      label: "Accommodation Payment Status",
      amount: 0,
      message:
        "Accommodation balance is zero but payment status is not Paid. Review the reservation before checkout.",
    });
  }

  if (entrance.entrance_fee_overpaid > MONEY_EPSILON) {
    blockers.push({
      code: "entrance_overpayment",
      label: "Entrance Fee Overpayment",
      amount: entrance.entrance_fee_overpaid,
      message:
        "Review the entrance fee overpayment before completing checkout.",
    });
  } else if (entrance.entrance_fee_remaining > MONEY_EPSILON) {
    blockers.push({
      code: "entrance_balance",
      label: "Entrance Fee Balance",
      amount: entrance.entrance_fee_remaining,
      message:
        "Collect the final entrance fee before checkout.",
    });
  }

  if (!bookingCharges.settled) {
    blockers.push({
      code: "booking_charges",
      label: "Onsite Booking Charges",
      amount: bookingCharges.unpaid_booking_charges,
      message:
        `${bookingCharges.unpaid_charge_count} unpaid onsite booking charge(s) remain. Use Collect Unpaid first.`,
    });
  }

  if (extraBed.extra_bed_overpaid > MONEY_EPSILON) {
    blockers.push({
      code: "extra_bed_overpayment",
      label: "Extra Bed Overpayment",
      amount: extraBed.extra_bed_overpaid,
      message:
        "Review the Extra Bed overpayment/correction before checkout.",
    });
  } else if (
    !extraBed.settled &&
    toMoney(bookingCharges.category_totals.extra_bed) <= MONEY_EPSILON
  ) {
    blockers.push({
      code: "extra_bed_status",
      label: "Extra Bed",
      amount: extraBed.extra_bed_remaining,
      message:
        "Extra Bed payment is not fully reconciled. Review Extra Bed / Collect Unpaid before checkout.",
    });
  }

  return blockers;
}

async function buildCheckoutSummary(
  connection,
  reservationId,
  { lock = false } = {},
) {
  const reservation = await getReservation(
    connection,
    reservationId,
    lock,
  );

  if (!reservation) {
    return null;
  }

  const [items, discounts, charges] = await Promise.all([
    getReservationItems(connection, reservationId),
    getDiscountRows(connection, reservationId, lock),
    getChargeRows(connection, reservationId, lock),
  ]);

  const accommodation = calculateAccommodationSummary(reservation);
  const entrance = calculateEntranceSummary(
    reservation,
    items,
    discounts,
  );
  const bookingCharges = calculateBookingChargeSummary(charges);
  const extraBed = calculateExtraBedSummary(
    reservation,
    bookingCharges,
  );

  const blockers = buildBlockers({
    reservation,
    accommodation,
    entrance,
    bookingCharges,
    extraBed,
  });

  const outstandingBalance =
    accommodation.accommodation_remaining +
    entrance.entrance_fee_remaining +
    bookingCharges.unpaid_booking_charges;

  return {
    success: true,
    reservation_id: reservation.id,
    reservation_code: reservation.reservation_code,
    reservation_status: normalizeLower(reservation.reservation_status),
    payment_status: normalizeLower(reservation.payment_status),
    is_checked_in: Number(reservation.is_checked_in || 0),
    checked_in_at: reservation.checked_in_at,
    already_completed:
      normalizeLower(reservation.reservation_status) === "completed",
    checkout_allowed:
      normalizeLower(reservation.reservation_status) === "completed" ||
      blockers.length === 0,
    blocker_count: blockers.length,
    blockers,
    outstanding_balance: outstandingBalance,
    accommodation,
    entrance,
    booking_charges: bookingCharges,
    extra_bed: extraBed,
    completion_write_scope: {
      reservation_status_completed: true,
      clear_is_checked_in: true,
      auto_collect_money: false,
      payment_amount_from_browser: false,
      checked_out_at_column_available: false,
    },
  };
}

// ============================================================
// GET /api/admin/bookings/:id/checkout-summary
// ============================================================
const getCheckoutSummary = async (req, res) => {
  let connection;

  try {
    const reservationId = Number(req.params.id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    connection = await db.promise().getConnection();

    const summary = await buildCheckoutSummary(
      connection,
      reservationId,
    );

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    return res.status(200).json(summary);
  } catch (error) {
    console.error("getCheckoutSummary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load final checkout validation.",
      error: error.message,
    });
  } finally {
    connection?.release();
  }
};

// ============================================================
// PUT /api/admin/bookings/:id/checkout
// ============================================================
const completeCheckout = async (req, res) => {
  let connection;

  try {
    const reservationId = Number(req.params.id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const summary = await buildCheckoutSummary(
      connection,
      reservationId,
      { lock: true },
    );

    if (!summary) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    if (summary.already_completed) {
      await connection.commit();

      return res.status(200).json({
        ...summary,
        success: true,
        duplicate_checkout_prevented: true,
        message: "Reservation is already completed. No duplicate checkout was recorded.",
      });
    }

    if (!summary.checkout_allowed) {
      await connection.rollback();

      return res.status(409).json({
        ...summary,
        success: false,
        message:
          "Checkout is blocked because one or more final requirements are not settled.",
      });
    }

    await connection.query(
      `
      UPDATE reservations
      SET
        reservation_status = 'completed',
        is_checked_in = 0
      WHERE id = ?
      `,
      [reservationId],
    );

    await connection.commit();

    return res.status(200).json({
      ...summary,
      success: true,
      reservation_status: "completed",
      is_checked_in: 0,
      already_completed: false,
      duplicate_checkout_prevented: false,
      checkout_allowed: true,
      message:
        "Checkout completed successfully. The reservation is now marked completed.",
    });
  } catch (error) {
    try {
      await connection?.rollback();
    } catch (rollbackError) {
      console.error("completeCheckout rollback error:", rollbackError);
    }

    console.error("completeCheckout error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete checkout.",
      error: error.message,
    });
  } finally {
    connection?.release();
  }
};

module.exports = {
  getCheckoutSummary,
  completeCheckout,
};
