const db = require("../../config/db");

// ============================================================
// STEP 3F-B2 + B3 PRICING CORRECTION: ENTRANCE FEE ADJUSTMENT / COLLECTION
//
// File:
// backend/controllers/bookingDiscountController.js
//
// Purpose:
// - Handle Senior Citizen, PWD, and Kid SPECIAL entrance rates
//   for checked-in reservations.
// - Use the verified ACTUAL guest count after Guest Adjustment.
// - Apply accommodation free-entrance inclusions FIRST.
// - Support multiple adjustment types for one reservation.
// - Keep special-rate adjustments separate from booking charges.
// - Prevent special-rate pax from exceeding the chargeable
//   entrance guest count after room free-entrance inclusions.
// - OFFICIAL ENTRANCE PRICING SOURCE OF TRUTH:
//     Pool & Beach Adult: Day â‚±250 / Overnight â‚±300
//     Pool & Beach Kid/Senior/PWD: Day â‚±200 / Overnight â‚±250
//     Beach Only Adult: Day â‚±150 / Overnight â‚±200
//     Beach Only Kid/Senior/PWD: Day â‚±100 / Overnight â‚±150
// - The poster's â‚±100 subsequent-day fee is intentionally NOT
//   automated in this phase, per project decision.
// - Database discount_type='kid_free' is retained only as a
//   legacy internal key for compatibility; it now represents the
//   Kid SPECIAL RATE adjustment, not free entrance.
// - STEP 3F-B3: collect ONLY the server-calculated remaining
//   entrance fee after Guest Adjustment and saved discounts.
// - Protect against duplicate entrance collection.
// - Re-open entrance balance automatically when a later saved
//   adjustment increases the final fee.
// - Preserve original entrance collections and reconcile later
//   overpayments through entrance_fee_reconciliations.
//
// Important:
// payment_transactions is still shaped around the legacy
// payment integration and does not yet contain a payment-purpose
// column. For Step 3F-B3, onsite entrance collection remains in
// reservations.entrance_fee_collected / entrance_fee_paid.
// The payment ledger can be generalized during the later payment
// architecture cleanup without mixing onsite entrance payments
// into legacy gateway transactions.
// ============================================================

const MONEY_EPSILON = 0.005;

const ENTRANCE_RATES = {
  pool_beach: {
    day: { adult: 250, special: 200 },
    overnight: { adult: 300, special: 250 },
  },
  beach_only: {
    day: { adult: 150, special: 100 },
    overnight: { adult: 200, special: 150 },
  },
};

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toWholeNumber(value, fallback = 0) {
  const num = Math.floor(toNumber(value, fallback));
  return Number.isFinite(num) ? num : fallback;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function getEntranceTypeFromNote(note) {
  const text = String(note || "").toLowerCase();

  if (text.includes("entrance type: beach only")) {
    return "beach_only";
  }

  return "pool_beach";
}

function hasOvernightStyleFromItems(items) {
  return items.some((item) => {
    const slotType = String(item.slot_type || "")
      .trim()
      .toLowerCase();

    const slotLabel = String(item.slot_label || "")
      .trim()
      .toLowerCase();

    // Entrance pricing follows the DAY/NIGHT schedule family.
    // IMPORTANT:
    // - day / day_extended = DAY entrance rate
    // - night / night_extended = OVERNIGHT entrance rate
    //
    // Do not classify a schedule as overnight just because its
    // label contains "22", "23", or "extended". A Day 22/23 Hours
    // stay can cross midnight while still using the DAY entrance rate.
    if (
      slotType === "night" ||
      slotType === "night_extended"
    ) {
      return true;
    }

    // Fallback only for legacy rows whose slot_type may be missing.
    // Explicit "night"/"overnight" wording is still treated as night,
    // but a label such as "Day 22 Hours" remains a DAY schedule.
    if (!slotType) {
      return (
        slotLabel.includes("overnight") ||
        slotLabel.includes("night")
      );
    }

    return false;
  });
}

function getEntranceRates(entranceType, hasOvernight) {
  const type =
    String(entranceType || "pool_beach").toLowerCase() ===
    "beach_only"
      ? "beach_only"
      : "pool_beach";

  const period = hasOvernight ? "overnight" : "day";
  const rates = ENTRANCE_RATES[type][period];

  return {
    adult: Number(rates.adult || 0),
    special: Number(rates.special || 0),
  };
}

function calculateSpecialRateAdjustment(
  adultRate,
  specialRate,
  qualifiedPax,
) {
  const pax = Math.max(0, toWholeNumber(qualifiedPax, 0));
  const adult = Math.max(0, toNumber(adultRate, 0));
  const special = Math.max(0, toNumber(specialRate, 0));
  const differencePerPax = Math.max(adult - special, 0);

  return differencePerPax * pax;
}

async function getEntranceAdjustmentContext(
  bookingId,
  queryable = db.promise(),
  lockReservation = false,
) {
  const lockSql = lockReservation ? "FOR UPDATE" : "";

  const [reservationRows] = await queryable.query(
    `
    SELECT
      id,
      reservation_code,
      guest_count,
      actual_guest_count,
      estimated_entrance_fee,
      entrance_fee_paid,
      entrance_fee_collected,
      payment_status,
      remaining_balance,
      note,
      reservation_status,
      is_checked_in
    FROM reservations
    WHERE id = ?
    LIMIT 1
    ${lockSql}
    `,
    [bookingId],
  );

  if (!reservationRows.length) {
    return null;
  }

  const reservation = reservationRows[0];

  const [itemRows] = await queryable.query(
    `
    SELECT
      ri.id,
      ri.slot_type,
      ri.slot_label,
      COALESCE(a.free_entrance_pax, 0) AS free_entrance_pax
    FROM reservation_items ri
    INNER JOIN accommodations a
      ON ri.accommodation_id = a.id
    WHERE ri.reservation_id = ?
    ORDER BY ri.id ASC
    `,
    [bookingId],
  );

  const entranceType = getEntranceTypeFromNote(reservation.note);
  const hasOvernight = hasOvernightStyleFromItems(itemRows);
  const entranceRates = getEntranceRates(
    entranceType,
    hasOvernight,
  );
  const adultEntranceRate = entranceRates.adult;
  const specialEntranceRate = entranceRates.special;
  const specialRateDifference = Math.max(
    adultEntranceRate - specialEntranceRate,
    0,
  );

  const bookedGuestCount = Math.max(
    0,
    Number(reservation.guest_count || 0),
  );

  const hasVerifiedActualGuestCount =
    reservation.actual_guest_count !== null &&
    reservation.actual_guest_count !== undefined;

  const actualGuestCount = Math.max(
    1,
    Number(
      reservation.actual_guest_count ??
        reservation.guest_count ??
        1,
    ),
  );

  const rawIncludedFreeEntrancePax = itemRows.reduce(
    (sum, item) =>
      sum + Math.max(0, Number(item.free_entrance_pax || 0)),
    0,
  );

  const includedFreeEntrancePax = Math.min(
    rawIncludedFreeEntrancePax,
    actualGuestCount,
  );

  const chargeableEntranceGuests = Math.max(
    actualGuestCount - includedFreeEntrancePax,
    0,
  );

  // Gross is expressed using the Adult entrance rate first.
  // Saved Senior/PWD/Kid rows then subtract only the official
  // Adult-vs-Special rate difference for qualified chargeable pax.
  const grossEntranceFee =
    adultEntranceRate * chargeableEntranceGuests;

  return {
    reservation,
    items: itemRows,
    entrance_type: entranceType,
    has_overnight_style: hasOvernight,
    // Backward-compatible alias used by the existing B2 frontend.
    entrance_rate_per_pax: adultEntranceRate,
    adult_entrance_rate_per_pax: adultEntranceRate,
    special_entrance_rate_per_pax: specialEntranceRate,
    special_rate_adjustment_per_pax: specialRateDifference,
    // Dynamic ratio kept only for the older live-preview helper.
    // The new companion frontend renders the official fixed rates.
    senior_pwd_discount_rate:
      adultEntranceRate > 0
        ? specialRateDifference / adultEntranceRate
        : 0,
    booked_guest_count: bookedGuestCount,
    actual_guest_count: actualGuestCount,
    has_verified_actual_guest_count: hasVerifiedActualGuestCount,
    included_free_entrance_pax: includedFreeEntrancePax,
    chargeable_entrance_guests: chargeableEntranceGuests,
    gross_entrance_fee: grossEntranceFee,
    stored_estimated_entrance_fee: Number(
      reservation.estimated_entrance_fee || 0,
    ),
    entrance_fee_paid: Number(
      reservation.entrance_fee_paid || 0,
    ),
    entrance_fee_collected: Number(
      reservation.entrance_fee_collected || 0,
    ),
  };
}

function buildMeta(
  context,
  totalDeduction = 0,
  totalQualifiedPax = 0,
  totalReconciledOut = 0,
) {
  const deduction = Math.max(
    0,
    Number(totalDeduction || 0),
  );

  const finalEntranceFee = Math.max(
    Number(context.gross_entrance_fee || 0) - deduction,
    0,
  );

  // Preserve the original lifetime amount physically collected
  // from the guest in reservations.entrance_fee_collected.
  const entranceFeeCollectedGross = Math.max(
    0,
    Number(context.entrance_fee_collected || 0),
  );

  // Refund/correction rows reduce the EFFECTIVE entrance money
  // without erasing the original collection history.
  const entranceFeeReconciledOut = Math.max(
    0,
    Number(totalReconciledOut || 0),
  );

  const entranceReconciliationExcess = Math.max(
    entranceFeeReconciledOut - entranceFeeCollectedGross,
    0,
  );

  const entranceFeeCollectedNet = Math.max(
    entranceFeeCollectedGross - entranceFeeReconciledOut,
    0,
  );

  const entranceFeeRemaining = Math.max(
    finalEntranceFee - entranceFeeCollectedNet,
    0,
  );

  const entranceFeeOverpaid = Math.max(
    entranceFeeCollectedNet - finalEntranceFee,
    0,
  );

  const savedQualifiedPax = Math.max(
    0,
    toWholeNumber(totalQualifiedPax, 0),
  );

  const chargeableGuests = Math.max(
    0,
    toWholeNumber(context.chargeable_entrance_guests, 0),
  );

  const specialRateAdjustmentInvalid =
    savedQualifiedPax > chargeableGuests;

  const excessSpecialRatePax = Math.max(
    savedQualifiedPax - chargeableGuests,
    0,
  );

  const entranceReconciliationRequired =
    specialRateAdjustmentInvalid ||
    entranceFeeOverpaid > MONEY_EPSILON ||
    entranceReconciliationExcess > MONEY_EPSILON;

  return {
    entrance_type: context.entrance_type,
    has_overnight_style: context.has_overnight_style,
    entrance_rate_per_pax: context.entrance_rate_per_pax,
    adult_entrance_rate_per_pax:
      context.adult_entrance_rate_per_pax,
    special_entrance_rate_per_pax:
      context.special_entrance_rate_per_pax,
    special_rate_adjustment_per_pax:
      context.special_rate_adjustment_per_pax,
    senior_pwd_discount_rate: context.senior_pwd_discount_rate,
    booked_guest_count: context.booked_guest_count,
    actual_guest_count: context.actual_guest_count,
    has_verified_actual_guest_count:
      context.has_verified_actual_guest_count,
    included_free_entrance_pax: context.included_free_entrance_pax,
    chargeable_entrance_guests: context.chargeable_entrance_guests,
    gross_entrance_fee: context.gross_entrance_fee,
    total_entrance_deduction: deduction,
    final_entrance_fee: finalEntranceFee,
    entrance_fee_paid: Number(context.entrance_fee_paid || 0),

    // Backward-compatible field used by the current Front Desk UI:
    // this now means NET entrance money after reconciliation.
    entrance_fee_collected: entranceFeeCollectedNet,

    entrance_fee_collected_gross: entranceFeeCollectedGross,
    entrance_fee_reconciled_out: entranceFeeReconciledOut,
    entrance_reconciliation_excess: entranceReconciliationExcess,
    entrance_fee_remaining: entranceFeeRemaining,
    entrance_fee_overpaid: entranceFeeOverpaid,
    total_saved_special_rate_pax: savedQualifiedPax,
    special_rate_adjustment_invalid: specialRateAdjustmentInvalid,
    excess_special_rate_pax: excessSpecialRatePax,
    entrance_reconciliation_required: entranceReconciliationRequired,
    entrance_fee_financially_covered:
      entranceFeeRemaining <= MONEY_EPSILON &&
      entranceFeeOverpaid <= MONEY_EPSILON &&
      entranceReconciliationExcess <= MONEY_EPSILON &&
      !specialRateAdjustmentInvalid,
  };
}

async function getDiscountRows(queryable, bookingId) {
  const [discountRows] = await queryable.query(
    `
    SELECT
      id,
      booking_id,
      discount_type,
      qualified_pax,
      discount_amount,
      discount_note,
      created_at,
      updated_at
    FROM booking_discounts
    WHERE booking_id = ?
    ORDER BY
      FIELD(discount_type, 'senior', 'pwd', 'kid_free'),
      id ASC
    `,
    [bookingId],
  );

  return discountRows;
}


async function getEntranceReconciliationRows(
  queryable,
  bookingId,
  lock = false,
) {
  const lockSql = lock ? "FOR UPDATE" : "";

  const [rows] = await queryable.query(
    `
    SELECT
      id,
      booking_id,
      reconciliation_type,
      amount,
      note,
      created_at
    FROM entrance_fee_reconciliations
    WHERE booking_id = ?
    ORDER BY created_at ASC, id ASC
    ${lockSql}
    `,
    [bookingId],
  );

  return rows;
}

function getEntranceReconciledOutTotal(rows) {
  return rows.reduce(
    (sum, row) =>
      sum + Math.max(0, Number(row.amount || 0)),
    0,
  );
}

function getDiscountTotal(discountRows) {
  return discountRows.reduce(
    (sum, item) =>
      sum + Number(item.discount_amount || 0),
    0,
  );
}

function getQualifiedPaxTotal(discountRows) {
  return discountRows.reduce(
    (sum, item) =>
      sum + Math.max(0, toWholeNumber(item.qualified_pax, 0)),
    0,
  );
}

async function syncEntrancePaidFlag(
  queryable,
  bookingId,
  meta,
) {
  const paidFlag =
    Number(meta.entrance_fee_remaining || 0) <= MONEY_EPSILON &&
    Number(meta.entrance_fee_overpaid || 0) <= MONEY_EPSILON &&
    Number(meta.entrance_reconciliation_excess || 0) <= MONEY_EPSILON &&
    !meta.special_rate_adjustment_invalid
      ? 1
      : 0;

  await queryable.query(
    `
    UPDATE reservations
    SET entrance_fee_paid = ?
    WHERE id = ?
    `,
    [paidFlag, bookingId],
  );

  meta.entrance_fee_paid = paidFlag;
  meta.entrance_fee_financially_covered = paidFlag === 1;
  meta.entrance_reconciliation_required =
    Boolean(meta.special_rate_adjustment_invalid) ||
    Number(meta.entrance_fee_overpaid || 0) > MONEY_EPSILON ||
    Number(meta.entrance_reconciliation_excess || 0) > MONEY_EPSILON;

  return paidFlag;
}

// ============================================================
// GET /api/bookings/:id/discounts
// ============================================================

const getBookingDiscount = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const context = await getEntranceAdjustmentContext(bookingId);

    if (!context) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    const [discountRows, reconciliationRows] = await Promise.all([
      getDiscountRows(
        db.promise(),
        bookingId,
      ),
      getEntranceReconciliationRows(
        db.promise(),
        bookingId,
      ),
    ]);

    const total = getDiscountTotal(discountRows);
    const totalQualifiedPax = getQualifiedPaxTotal(discountRows);
    const totalReconciledOut =
      getEntranceReconciledOutTotal(reconciliationRows);

    return res.status(200).json({
      discounts: discountRows,
      discount: discountRows[0] || null,
      total,
      reconciliations: reconciliationRows,
      meta: buildMeta(
        context,
        total,
        totalQualifiedPax,
        totalReconciledOut,
      ),
    });
  } catch (error) {
    console.error("getBookingDiscount error:", error);

    return res.status(500).json({
      message: "Failed to load entrance adjustments.",
      error: error.message,
    });
  }
};

// ============================================================
// STEP 3F-B3: COLLECT FINAL / REMAINING ENTRANCE FEE
//
// Uses the same existing PUT /:id/discounts route with body:
// { "action": "collect_entrance_fee" }
//
// No amount is trusted from the frontend. The backend locks the
// reservation, recalculates gross entrance, reloads saved
// deductions, subtracts money already collected, and records only
// the full remaining balance confirmed by Front Desk.
// ============================================================

async function collectEntranceFee(req, res) {
  const connection = await db.promise().getConnection();

  try {
    const bookingId = Number(req.params.id);

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    await connection.beginTransaction();

    const context = await getEntranceAdjustmentContext(
      bookingId,
      connection,
      true,
    );

    if (!context) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const reservation = context.reservation;
    const reservationStatus = normalizeText(
      reservation.reservation_status,
    ).toLowerCase();

    if (
      ["cancelled", "rejected", "completed"].includes(
        reservationStatus,
      )
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Entrance fee collection is not allowed for cancelled, rejected, or completed reservations.",
      });
    }

    if (Number(reservation.is_checked_in || 0) !== 1) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Entrance fee can only be collected after the guest is checked in.",
      });
    }

    if (!context.has_verified_actual_guest_count) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Complete Guest Adjustment first so the actual onsite guest count is verified before collecting the entrance fee.",
      });
    }

    const paymentStatus = normalizeText(
      reservation.payment_status,
    ).toLowerCase();

    const remainingAccommodationBalance = Math.max(
      0,
      Number(reservation.remaining_balance || 0),
    );

    if (
      paymentStatus !== "paid" ||
      remainingAccommodationBalance > MONEY_EPSILON
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "The accommodation balance must be fully settled before collecting the final entrance fee.",
      });
    }

    const [discountRows, reconciliationRows] = await Promise.all([
      getDiscountRows(
        connection,
        bookingId,
      ),
      getEntranceReconciliationRows(
        connection,
        bookingId,
        true,
      ),
    ]);

    const total = getDiscountTotal(discountRows);
    const totalQualifiedPax = getQualifiedPaxTotal(discountRows);
    const totalReconciledOut =
      getEntranceReconciledOutTotal(reconciliationRows);

    const meta = buildMeta(
      context,
      total,
      totalQualifiedPax,
      totalReconciledOut,
    );

    if (meta.special_rate_adjustment_invalid) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Saved Senior/PWD/Kid special-rate pax (${meta.total_saved_special_rate_pax}) exceed the current chargeable entrance guest count (${meta.chargeable_entrance_guests}). Correct the Entrance Adjustment before collecting or checking out.`,
        discounts: discountRows,
        total,
        meta,
      });
    }

    const finalEntranceFee = Number(
      meta.final_entrance_fee || 0,
    );

    const alreadyCollected = Number(
      meta.entrance_fee_collected || 0,
    );

    const overpaid = Number(
      meta.entrance_fee_overpaid || 0,
    );

    if (overpaid > MONEY_EPSILON) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Entrance collection is already â‚±${overpaid.toFixed(2)} above the current recalculated final entrance fee. Review the guest/discount adjustment and handle the overpayment before collecting again.`,
        discounts: discountRows,
        total,
        meta,
      });
    }

    const amountToCollect = Math.max(
      finalEntranceFee - alreadyCollected,
      0,
    );

    // --------------------------------------------------------
    // Duplicate / zero-balance protection.
    // If no money remains, simply synchronize the settled flag.
    // This also handles legitimate â‚±0 final entrance cases.
    // --------------------------------------------------------
    if (amountToCollect <= MONEY_EPSILON) {
      await connection.query(
        `
        UPDATE reservations
        SET entrance_fee_paid = 1
        WHERE id = ?
        `,
        [bookingId],
      );

      await connection.commit();

      meta.entrance_fee_paid = 1;
      meta.entrance_fee_financially_covered = true;

      return res.status(200).json({
        success: true,
        already_settled: true,
        amount_collected_now: 0,
        message:
          finalEntranceFee <= MONEY_EPSILON
            ? "No entrance fee remains due. The entrance fee is now marked settled."
            : "Entrance fee is already fully collected. No duplicate collection was recorded.",
        discounts: discountRows,
        total,
        meta,
      });
    }

    // --------------------------------------------------------
    // Front Desk confirms full remaining entrance collection.
    // Set collected amount to the backend final fee, rather than
    // adding a client-supplied amount. The reservation row is
    // locked, so concurrent collection cannot duplicate payment.
    // --------------------------------------------------------
    const newGrossCollected =
      Number(meta.entrance_fee_collected_gross || 0) +
      amountToCollect;

    await connection.query(
      `
      UPDATE reservations
      SET
        entrance_fee_collected = ?,
        entrance_fee_paid = 1
      WHERE id = ?
      `,
      [newGrossCollected, bookingId],
    );

    await connection.commit();

    meta.entrance_fee_collected_gross = newGrossCollected;
    meta.entrance_fee_collected =
      Number(meta.entrance_fee_collected || 0) +
      amountToCollect;
    meta.entrance_fee_remaining = 0;
    meta.entrance_fee_overpaid = 0;
    meta.entrance_fee_paid = 1;
    meta.entrance_fee_financially_covered = true;

    return res.status(200).json({
      success: true,
      already_settled: false,
      amount_collected_now: amountToCollect,
      message:
        `Entrance fee collection recorded successfully. Collected now: â‚±${amountToCollect.toFixed(2)}.`,
      discounts: discountRows,
      total,
      meta,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "collectEntranceFee rollback error:",
        rollbackError,
      );
    }

    console.error("collectEntranceFee error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to collect entrance fee.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
}

// ============================================================
// PUT /api/bookings/:id/discounts
// - normal body = save Senior/PWD/Kid adjustment
// - action=collect_entrance_fee = Step 3F-B3 collection
// ============================================================

const upsertBookingDiscount = async (req, res) => {
  const action = normalizeText(req.body?.action).toLowerCase();

  if (action === "collect_entrance_fee") {
    return collectEntranceFee(req, res);
  }

  const connection = await db.promise().getConnection();

  try {
    const bookingId = Number(req.params.id);

    const seniorPax = Math.max(
      0,
      toWholeNumber(req.body.senior_pax, 0),
    );

    const pwdPax = Math.max(
      0,
      toWholeNumber(req.body.pwd_pax, 0),
    );

    // The old request field name is kept for compatibility with
    // frontdeskGuests.js. It now means Kid SPECIAL-RATE pax.
    const kidSpecialPax = Math.max(
      0,
      toWholeNumber(
        req.body.kid_pax ?? req.body.kid_free_pax,
        0,
      ),
    );

    const discountNote = normalizeText(req.body.discount_note);

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const totalQualifiedPax =
      seniorPax + pwdPax + kidSpecialPax;

    if (totalQualifiedPax <= 0) {
      return res.status(400).json({
        message:
          "Enter at least one Senior Citizen, PWD, or Kid special-rate guest before applying an entrance adjustment.",
      });
    }

    if (!discountNote) {
      return res.status(400).json({
        message: "Verification note is required.",
      });
    }

    await connection.beginTransaction();

    const context = await getEntranceAdjustmentContext(
      bookingId,
      connection,
      true,
    );

    if (!context) {
      await connection.rollback();

      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    const reservation = context.reservation;

    const reservationStatus = normalizeText(
      reservation.reservation_status,
    ).toLowerCase();

    if (
      ["cancelled", "rejected", "completed"].includes(
        reservationStatus,
      )
    ) {
      await connection.rollback();

      return res.status(400).json({
        message:
          "Entrance adjustment is not allowed for cancelled, rejected, or completed reservations.",
      });
    }

    if (Number(reservation.is_checked_in || 0) !== 1) {
      await connection.rollback();

      return res.status(400).json({
        message:
          "Entrance adjustment can only be applied after the guest is checked in.",
      });
    }

    if (
      totalQualifiedPax >
      Number(context.chargeable_entrance_guests || 0)
    ) {
      await connection.rollback();

      return res.status(400).json({
        message:
          "Total Senior/PWD/Kid special-rate pax cannot be greater than the chargeable entrance guest count after accommodation free-entrance inclusions.",
      });
    }

    const adultEntranceRate = Number(
      context.adult_entrance_rate_per_pax || 0,
    );

    const specialEntranceRate = Number(
      context.special_entrance_rate_per_pax || 0,
    );

    const adjustments = [
      {
        discount_type: "senior",
        qualified_pax: seniorPax,
        discount_amount: calculateSpecialRateAdjustment(
          adultEntranceRate,
          specialEntranceRate,
          seniorPax,
        ),
      },
      {
        discount_type: "pwd",
        qualified_pax: pwdPax,
        discount_amount: calculateSpecialRateAdjustment(
          adultEntranceRate,
          specialEntranceRate,
          pwdPax,
        ),
      },
      {
        // Legacy internal enum key; semantics are now Kid Special Rate.
        discount_type: "kid_free",
        qualified_pax: kidSpecialPax,
        discount_amount: calculateSpecialRateAdjustment(
          adultEntranceRate,
          specialEntranceRate,
          kidSpecialPax,
        ),
      },
    ];

    for (const adjustment of adjustments) {
      if (
        adjustment.qualified_pax > 0 &&
        adjustment.discount_amount > 0
      ) {
        await connection.query(
          `
          INSERT INTO booking_discounts (
            booking_id,
            discount_type,
            qualified_pax,
            discount_amount,
            discount_note
          )
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            qualified_pax = VALUES(qualified_pax),
            discount_amount = VALUES(discount_amount),
            discount_note = VALUES(discount_note),
            updated_at = CURRENT_TIMESTAMP
          `,
          [
            bookingId,
            adjustment.discount_type,
            adjustment.qualified_pax,
            adjustment.discount_amount,
            discountNote,
          ],
        );
      } else {
        await connection.query(
          `
          DELETE FROM booking_discounts
          WHERE booking_id = ?
            AND discount_type = ?
          `,
          [bookingId, adjustment.discount_type],
        );
      }
    }

    const [discountRows, reconciliationRows] = await Promise.all([
      getDiscountRows(
        connection,
        bookingId,
      ),
      getEntranceReconciliationRows(
        connection,
        bookingId,
        true,
      ),
    ]);

    const total = getDiscountTotal(discountRows);
    const savedQualifiedPax = getQualifiedPaxTotal(discountRows);
    const totalReconciledOut =
      getEntranceReconciledOutTotal(reconciliationRows);

    const meta = buildMeta(
      context,
      total,
      savedQualifiedPax,
      totalReconciledOut,
    );

    // A later adjustment may increase or decrease the final fee.
    // Keep entrance_fee_paid synchronized with the recalculated
    // remaining amount while preserving money already collected.
    await syncEntrancePaidFlag(
      connection,
      bookingId,
      meta,
    );

    await connection.commit();

    return res.status(200).json({
      message: "Entrance special-rate adjustments saved successfully.",
      discounts: discountRows,
      total,
      meta,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "upsertBookingDiscount rollback error:",
        rollbackError,
      );
    }

    console.error("upsertBookingDiscount error:", error);

    return res.status(500).json({
      message: "Failed to save entrance adjustments.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ============================================================
// DELETE /api/bookings/:id/discounts
// ============================================================

const deleteBookingDiscount = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    const bookingId = Number(req.params.id);

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    await connection.beginTransaction();

    const context = await getEntranceAdjustmentContext(
      bookingId,
      connection,
      true,
    );

    if (!context) {
      await connection.rollback();

      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    const reservationStatus = normalizeText(
      context.reservation.reservation_status,
    ).toLowerCase();

    if (
      ["cancelled", "rejected", "completed"].includes(
        reservationStatus,
      )
    ) {
      await connection.rollback();

      return res.status(400).json({
        message:
          "Entrance adjustments cannot be removed from cancelled, rejected, or completed reservations.",
      });
    }

    const [result] = await connection.query(
      `
      DELETE FROM booking_discounts
      WHERE booking_id = ?
      `,
      [bookingId],
    );

    const reconciliationRows =
      await getEntranceReconciliationRows(
        connection,
        bookingId,
        true,
      );

    const totalReconciledOut =
      getEntranceReconciledOutTotal(reconciliationRows);

    const meta = buildMeta(
      context,
      0,
      0,
      totalReconciledOut,
    );

    // Removing a discount may increase the amount due again.
    // Preserve previously collected money and reopen the paid flag
    // whenever the recalculated final fee is now higher.
    await syncEntrancePaidFlag(
      connection,
      bookingId,
      meta,
    );

    await connection.commit();

    return res.status(200).json({
      message:
        result.affectedRows > 0
          ? "Entrance adjustments removed successfully."
          : "No entrance adjustments found for this reservation.",
      affectedRows: result.affectedRows,
      meta,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "deleteBookingDiscount rollback error:",
        rollbackError,
      );
    }

    console.error("deleteBookingDiscount error:", error);

    return res.status(500).json({
      message: "Failed to remove entrance adjustments.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};


// ============================================================
// POST /api/bookings/:id/entrance-reconciliation
//
// Front Desk confirms the CURRENT server-calculated entrance
// overpayment as either:
// - refund     = cash/value returned to the guest
// - correction = invalid/erroneous collection corrected/voided
//
// The browser does NOT send a trusted money amount.
// The backend locks the reservation, recalculates the current
// overpayment, and records exactly that amount for audit history.
// ============================================================

const reconcileEntranceOverpayment = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    const bookingId = Number(req.params.id);
    const reconciliationType = normalizeText(
      req.body?.reconciliation_type,
    ).toLowerCase();
    const note = normalizeText(req.body?.note);

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!["refund", "correction"].includes(reconciliationType)) {
      return res.status(400).json({
        success: false,
        message:
          "Choose either Refunded to Guest or Payment Correction.",
      });
    }

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Reconciliation note is required.",
      });
    }

    await connection.beginTransaction();

    const context = await getEntranceAdjustmentContext(
      bookingId,
      connection,
      true,
    );

    if (!context) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const reservation = context.reservation;
    const reservationStatus = normalizeText(
      reservation.reservation_status,
    ).toLowerCase();

    if (
      ["cancelled", "rejected", "completed"].includes(
        reservationStatus,
      )
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Entrance overpayment reconciliation is only available for active checked-in reservations.",
      });
    }

    if (Number(reservation.is_checked_in || 0) !== 1) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Entrance overpayment reconciliation requires a checked-in guest.",
      });
    }

    const [discountRows, reconciliationRows] = await Promise.all([
      getDiscountRows(
        connection,
        bookingId,
      ),
      getEntranceReconciliationRows(
        connection,
        bookingId,
        true,
      ),
    ]);

    const totalDeduction = getDiscountTotal(discountRows);
    const totalQualifiedPax = getQualifiedPaxTotal(discountRows);
    const totalReconciledOut =
      getEntranceReconciledOutTotal(reconciliationRows);

    const metaBefore = buildMeta(
      context,
      totalDeduction,
      totalQualifiedPax,
      totalReconciledOut,
    );

    if (metaBefore.special_rate_adjustment_invalid) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Correct the saved Senior/PWD/Kid special-rate quantities before reconciling an entrance overpayment.",
        meta: metaBefore,
      });
    }

    if (
      Number(metaBefore.entrance_reconciliation_excess || 0) >
      MONEY_EPSILON
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Existing entrance reconciliation records exceed the original collected amount. Review the reconciliation history before continuing.",
        meta: metaBefore,
      });
    }

    const amountToReconcile = Number(
      Number(metaBefore.entrance_fee_overpaid || 0).toFixed(2),
    );

    if (amountToReconcile <= MONEY_EPSILON) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "No entrance overpayment currently requires reconciliation.",
        meta: metaBefore,
      });
    }

    await connection.query(
      `
      INSERT INTO entrance_fee_reconciliations (
        booking_id,
        reconciliation_type,
        amount,
        note
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        bookingId,
        reconciliationType,
        amountToReconcile,
        note,
      ],
    );

    const updatedRows =
      await getEntranceReconciliationRows(
        connection,
        bookingId,
        true,
      );

    const updatedReconciledOut =
      getEntranceReconciledOutTotal(updatedRows);

    const metaAfter = buildMeta(
      context,
      totalDeduction,
      totalQualifiedPax,
      updatedReconciledOut,
    );

    await syncEntrancePaidFlag(
      connection,
      bookingId,
      metaAfter,
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      reconciliation_type: reconciliationType,
      amount_reconciled_now: amountToReconcile,
      message:
        reconciliationType === "refund"
          ? `Entrance overpayment of ₱${amountToReconcile.toFixed(2)} recorded as refunded to the guest.`
          : `Entrance overpayment of ₱${amountToReconcile.toFixed(2)} recorded as a payment correction.`,
      reconciliations: updatedRows,
      meta: metaAfter,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "reconcileEntranceOverpayment rollback error:",
        rollbackError,
      );
    }

    console.error("reconcileEntranceOverpayment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reconcile entrance overpayment.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getBookingDiscount,
  upsertBookingDiscount,
  deleteBookingDiscount,
  reconcileEntranceOverpayment,
};



