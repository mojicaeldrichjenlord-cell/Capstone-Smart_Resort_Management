const db = require("../config/db");

/* ======================================================
   BOOKING DISCOUNT / ENTRANCE ADJUSTMENT CONTROLLER
   File: backend/controllers/bookingDiscountController.js

   Purpose:
   - Handles Senior / PWD / Free Kid entrance adjustments
   - Supports multiple adjustment types per reservation
   - Computes all deduction amounts automatically
   - Keeps adjustments separate from booking_charges
====================================================== */

const SENIOR_PWD_DISCOUNT_RATE = 0.2;

const ADJUSTMENT_TYPES = {
  senior: {
    label: "Senior Citizen 20% Entrance Discount",
    rule: "20% entrance fee discount",
  },
  pwd: {
    label: "PWD 20% Entrance Discount",
    rule: "20% entrance fee discount",
  },
  kid_free: {
    label: "Free Kid Entrance",
    rule: "Free entrance based on height measure",
  },
};

/* ======================================================
   HELPER: Convert to safe number
====================================================== */

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/* ======================================================
   HELPER: Convert to whole number
====================================================== */

function toWholeNumber(value, fallback = 0) {
  const num = Math.floor(toNumber(value, fallback));
  return Number.isFinite(num) ? num : fallback;
}

/* ======================================================
   HELPER: Normalize text
====================================================== */

function normalizeText(value) {
  return String(value || "").trim();
}

/* ======================================================
   HELPER: Format money in notes
====================================================== */

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

/* ======================================================
   HELPER: Extract entrance type from reservation note
====================================================== */

function getEntranceTypeFromNote(note) {
  const text = String(note || "").toLowerCase();

  if (text.includes("entrance type: beach only")) {
    return "beach_only";
  }

  return "pool_beach";
}

/* ======================================================
   HELPER: Detect overnight-style stay
====================================================== */

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

/* ======================================================
   HELPER: Entrance rate
   Current resort entrance rates:
   - Pool & Beach: ₱250 day, ₱300 overnight
   - Beach Only: ₱150 day, ₱200 overnight
====================================================== */

function getEntranceRate(entranceType, hasOvernight) {
  const type = String(entranceType || "pool_beach").toLowerCase();

  if (type === "beach_only") {
    return hasOvernight ? 200 : 150;
  }

  return hasOvernight ? 300 : 250;
}

/* ======================================================
   HELPER: Calculate automatic deduction
====================================================== */

function calculateDeduction(discountType, entranceRate, qualifiedPax) {
  const pax = Math.max(0, toWholeNumber(qualifiedPax, 0));
  const rate = Number(entranceRate || 0);

  if (discountType === "senior" || discountType === "pwd") {
    return rate * SENIOR_PWD_DISCOUNT_RATE * pax;
  }

  if (discountType === "kid_free") {
    return rate * pax;
  }

  return 0;
}

/* ======================================================
   HELPER: Create system note
   Note:
   - Kept for future audit expansion.
   - Current implementation stores only the clean staff verification note
     so receipts and modal fields do not become too long.
====================================================== */

function buildSystemNote({
  discountType,
  qualifiedPax,
  entranceRate,
  userNote,
}) {
  const typeInfo = ADJUSTMENT_TYPES[discountType];
  const label = typeInfo?.label || "Entrance Adjustment";
  const rule = typeInfo?.rule || "Entrance adjustment";

  return (
    `${label}. ` +
    `Qualified pax: ${qualifiedPax}. ` +
    `Entrance rate per pax: ₱${formatMoney(entranceRate)}. ` +
    `Rule: ${rule}. ` +
    `Verification: ${userNote}`
  );
}

/* ======================================================
   HELPER: Load reservation context for automatic computation
====================================================== */

async function getEntranceAdjustmentContext(bookingId) {
  const [reservationRows] = await db.promise().query(
    `
    SELECT
      id,
      guest_count,
      actual_guest_count,
      estimated_entrance_fee,
      note,
      reservation_status,
      is_checked_in
    FROM reservations
    WHERE id = ?
    LIMIT 1
    `,
    [bookingId],
  );

  if (!reservationRows.length) {
    return null;
  }

  const reservation = reservationRows[0];

  const [itemRows] = await db.promise().query(
    `
    SELECT
      slot_type,
      slot_label
    FROM reservation_items
    WHERE reservation_id = ?
    ORDER BY id ASC
    `,
    [bookingId],
  );

  const entranceType = getEntranceTypeFromNote(reservation.note);
  const hasOvernight = hasOvernightStyleFromItems(itemRows);
  const entranceRate = getEntranceRate(entranceType, hasOvernight);
  const actualGuestCount = Number(
    reservation.actual_guest_count ??
      reservation.guest_count ??
      0,
  );

  return {
    reservation,
    items: itemRows,
    entrance_type: entranceType,
    has_overnight_style: hasOvernight,
    entrance_rate_per_pax: entranceRate,
    senior_pwd_discount_rate: SENIOR_PWD_DISCOUNT_RATE,
    actual_guest_count: actualGuestCount,
    estimated_entrance_fee: Number(reservation.estimated_entrance_fee || 0),
  };
}

/* ======================================================
   GET BOOKING / RESERVATION ENTRANCE ADJUSTMENTS
   Endpoint:
   GET /api/bookings/:id/discounts
====================================================== */

const getBookingDiscount = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    if (!bookingId) {
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
      ORDER BY FIELD(discount_type, 'senior', 'pwd', 'kid_free'), id ASC
      `,
      [bookingId],
    );

    const total = discountRows.reduce(
      (sum, item) => sum + Number(item.discount_amount || 0),
      0,
    );

    return res.json({
      discounts: discountRows,
      discount: discountRows[0] || null,
      total,
      meta: {
        entrance_type: context.entrance_type,
        has_overnight_style: context.has_overnight_style,
        entrance_rate_per_pax: context.entrance_rate_per_pax,
        senior_pwd_discount_rate: context.senior_pwd_discount_rate,
        actual_guest_count: context.actual_guest_count,
        estimated_entrance_fee: context.estimated_entrance_fee,
      },
    });
  } catch (error) {
    console.error("getBookingDiscount error:", error);

    return res.status(500).json({
      message: "Failed to load entrance adjustments.",
      error: error.message,
    });
  }
};

/* ======================================================
   UPSERT MULTIPLE BOOKING / RESERVATION ENTRANCE ADJUSTMENTS
   Endpoint:
   PUT /api/bookings/:id/discounts
====================================================== */

const upsertBookingDiscount = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    const bookingId = Number(req.params.id);
    const seniorPax = Math.max(0, toWholeNumber(req.body.senior_pax, 0));
    const pwdPax = Math.max(0, toWholeNumber(req.body.pwd_pax, 0));
    const kidFreePax = Math.max(0, toWholeNumber(req.body.kid_free_pax, 0));
    const discountNote = normalizeText(req.body.discount_note);

    if (!bookingId) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const totalQualifiedPax = seniorPax + pwdPax + kidFreePax;

    if (totalQualifiedPax <= 0) {
      return res.status(400).json({
        message:
          "Enter at least one Senior, PWD, or Free Kid pax before applying an entrance adjustment.",
      });
    }

    if (!discountNote) {
      return res.status(400).json({
        message: "Verification note is required.",
      });
    }

    const context = await getEntranceAdjustmentContext(bookingId);

    if (!context) {
      return res.status(404).json({
        message: "Reservation not found.",
      });
    }

    const reservation = context.reservation;
    const status = normalizeText(reservation.reservation_status).toLowerCase();

    if (["cancelled", "rejected", "completed"].includes(status)) {
      return res.status(400).json({
        message:
          "Entrance adjustment is not allowed for cancelled, rejected, or completed reservations.",
      });
    }

    if (Number(reservation.is_checked_in || 0) !== 1) {
      return res.status(400).json({
        message:
          "Entrance adjustment can only be applied after the guest is checked in.",
      });
    }

    const actualGuestCount = Math.max(
      1,
      Number(
        reservation.actual_guest_count ??
          reservation.guest_count ??
          1,
      ),
    );

    if (totalQualifiedPax > actualGuestCount) {
      return res.status(400).json({
        message:
          "Total qualified pax cannot be greater than the verified actual guest count.",
      });
    }

    const entranceRate = Number(context.entrance_rate_per_pax || 0);

    const adjustments = [
      {
        discount_type: "senior",
        qualified_pax: seniorPax,
        discount_amount: calculateDeduction("senior", entranceRate, seniorPax),
      },
      {
        discount_type: "pwd",
        qualified_pax: pwdPax,
        discount_amount: calculateDeduction("pwd", entranceRate, pwdPax),
      },
      {
        discount_type: "kid_free",
        qualified_pax: kidFreePax,
        discount_amount: calculateDeduction("kid_free", entranceRate, kidFreePax),
      },
    ];

    await connection.beginTransaction();

    for (const adjustment of adjustments) {
      if (adjustment.qualified_pax > 0 && adjustment.discount_amount > 0) {
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

    await connection.commit();

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
      ORDER BY FIELD(discount_type, 'senior', 'pwd', 'kid_free'), id ASC
      `,
      [bookingId],
    );

    const total = discountRows.reduce(
      (sum, item) => sum + Number(item.discount_amount || 0),
      0,
    );

    return res.status(200).json({
      message: "Entrance adjustments saved successfully.",
      discounts: discountRows,
      total,
      meta: {
        entrance_type: context.entrance_type,
        has_overnight_style: context.has_overnight_style,
        entrance_rate_per_pax: entranceRate,
        senior_pwd_discount_rate: SENIOR_PWD_DISCOUNT_RATE,
        actual_guest_count: actualGuestCount,
        estimated_entrance_fee: context.estimated_entrance_fee,
      },
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error("upsertBookingDiscount rollback error:", rollbackError);
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

/* ======================================================
   DELETE ALL ENTRANCE ADJUSTMENTS FOR ONE RESERVATION
   Endpoint:
   DELETE /api/bookings/:id/discounts
====================================================== */

const deleteBookingDiscount = (req, res) => {
  const bookingId = Number(req.params.id);

  if (!bookingId) {
    return res.status(400).json({
      message: "Invalid booking ID.",
    });
  }

  const sql = `
    DELETE FROM booking_discounts
    WHERE booking_id = ?
  `;

  db.query(sql, [bookingId], (err, result) => {
    if (err) {
      console.error("deleteBookingDiscount error:", err);

      return res.status(500).json({
        message: "Failed to remove entrance adjustments.",
      });
    }

    return res.json({
      message:
        result.affectedRows > 0
          ? "Entrance adjustments removed successfully."
          : "No entrance adjustments found for this reservation.",
      affectedRows: result.affectedRows,
    });
  });
};

module.exports = {
  getBookingDiscount,
  upsertBookingDiscount,
  deleteBookingDiscount,
};
