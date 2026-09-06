const db = require("../config/db");

// ============================================================
// STEP 3F-B2: ENTRANCE FEE ADJUSTMENT CONTROLLER
//
// File:
// backend/controllers/bookingDiscountController.js
//
// Purpose:
// - Handle Senior Citizen, PWD, and Qualified Kid entrance
//   adjustments for checked-in reservations.
// - Use the verified ACTUAL guest count after Guest Adjustment.
// - Apply accommodation free-entrance inclusions FIRST.
// - Support multiple adjustment types for one reservation.
// - Keep Senior/PWD/Kid deductions separate from booking charges.
// - Prevent qualified adjustment pax from exceeding the
//   chargeable entrance guest count.
// ============================================================

const SENIOR_PWD_DISCOUNT_RATE = 0.2;

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
    const slotText = String(
      `${item.slot_type || ""} ${item.slot_label || ""}`,
    ).toLowerCase();

    return (
      slotText.includes("night") ||
      slotText.includes("overnight") ||
      slotText.includes("22") ||
      slotText.includes("23") ||
      slotText.includes("extended")
    );
  });
}

function getEntranceRate(entranceType, hasOvernight) {
  const type = String(entranceType || "pool_beach").toLowerCase();

  if (type === "beach_only") {
    return hasOvernight ? 200 : 150;
  }

  return hasOvernight ? 300 : 250;
}

function calculateDeduction(discountType, entranceRate, qualifiedPax) {
  const pax = Math.max(0, toWholeNumber(qualifiedPax, 0));
  const rate = Math.max(0, toNumber(entranceRate, 0));

  if (discountType === "senior" || discountType === "pwd") {
    return rate * SENIOR_PWD_DISCOUNT_RATE * pax;
  }

  if (discountType === "kid_free") {
    return rate * pax;
  }

  return 0;
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
      guest_count,
      actual_guest_count,
      estimated_entrance_fee,
      entrance_fee_paid,
      entrance_fee_collected,
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
  const entranceRate = getEntranceRate(entranceType, hasOvernight);

  const bookedGuestCount = Math.max(
    0,
    Number(reservation.guest_count || 0),
  );

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

  const grossEntranceFee =
    entranceRate * chargeableEntranceGuests;

  return {
    reservation,
    items: itemRows,
    entrance_type: entranceType,
    has_overnight_style: hasOvernight,
    entrance_rate_per_pax: entranceRate,
    senior_pwd_discount_rate: SENIOR_PWD_DISCOUNT_RATE,
    booked_guest_count: bookedGuestCount,
    actual_guest_count: actualGuestCount,
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

function buildMeta(context, totalDeduction = 0) {
  const deduction = Math.max(
    0,
    Number(totalDeduction || 0),
  );

  const finalEntranceFee = Math.max(
    Number(context.gross_entrance_fee || 0) - deduction,
    0,
  );

  const entranceFeeCollected = Math.max(
    0,
    Number(context.entrance_fee_collected || 0),
  );

  return {
    entrance_type: context.entrance_type,
    has_overnight_style: context.has_overnight_style,
    entrance_rate_per_pax: context.entrance_rate_per_pax,
    senior_pwd_discount_rate: context.senior_pwd_discount_rate,
    booked_guest_count: context.booked_guest_count,
    actual_guest_count: context.actual_guest_count,
    included_free_entrance_pax: context.included_free_entrance_pax,
    chargeable_entrance_guests: context.chargeable_entrance_guests,
    gross_entrance_fee: context.gross_entrance_fee,
    total_entrance_deduction: deduction,
    final_entrance_fee: finalEntranceFee,
    entrance_fee_collected: entranceFeeCollected,
    entrance_fee_remaining: Math.max(
      finalEntranceFee - entranceFeeCollected,
      0,
    ),
    entrance_fee_overpaid: Math.max(
      entranceFeeCollected - finalEntranceFee,
      0,
    ),
  };
}

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

    const [discountRows] = await db.promise().query(
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

    const total = discountRows.reduce(
      (sum, item) =>
        sum + Number(item.discount_amount || 0),
      0,
    );

    return res.status(200).json({
      discounts: discountRows,
      discount: discountRows[0] || null,
      total,
      meta: buildMeta(context, total),
    });
  } catch (error) {
    console.error("getBookingDiscount error:", error);

    return res.status(500).json({
      message: "Failed to load entrance adjustments.",
      error: error.message,
    });
  }
};

const upsertBookingDiscount = async (req, res) => {
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

    const kidFreePax = Math.max(
      0,
      toWholeNumber(req.body.kid_free_pax, 0),
    );

    const discountNote = normalizeText(req.body.discount_note);

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const totalQualifiedPax =
      seniorPax + pwdPax + kidFreePax;

    if (totalQualifiedPax <= 0) {
      return res.status(400).json({
        message:
          "Enter at least one Senior Citizen, PWD, or qualified kid before applying an entrance adjustment.",
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
          "Total qualified Senior/PWD/Kid pax cannot be greater than the chargeable entrance guest count after accommodation free-entrance inclusions.",
      });
    }

    const entranceRate = Number(
      context.entrance_rate_per_pax || 0,
    );

    const adjustments = [
      {
        discount_type: "senior",
        qualified_pax: seniorPax,
        discount_amount: calculateDeduction(
          "senior",
          entranceRate,
          seniorPax,
        ),
      },
      {
        discount_type: "pwd",
        qualified_pax: pwdPax,
        discount_amount: calculateDeduction(
          "pwd",
          entranceRate,
          pwdPax,
        ),
      },
      {
        discount_type: "kid_free",
        qualified_pax: kidFreePax,
        discount_amount: calculateDeduction(
          "kid_free",
          entranceRate,
          kidFreePax,
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

    const [discountRows] = await connection.query(
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

    const total = discountRows.reduce(
      (sum, item) =>
        sum + Number(item.discount_amount || 0),
      0,
    );

    await connection.commit();

    return res.status(200).json({
      message: "Entrance adjustments saved successfully.",
      discounts: discountRows,
      total,
      meta: buildMeta(context, total),
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

    await connection.commit();

    return res.status(200).json({
      message:
        result.affectedRows > 0
          ? "Entrance adjustments removed successfully."
          : "No entrance adjustments found for this reservation.",
      affectedRows: result.affectedRows,
      meta: buildMeta(context, 0),
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

module.exports = {
  getBookingDiscount,
  upsertBookingDiscount,
  deleteBookingDiscount,
};
