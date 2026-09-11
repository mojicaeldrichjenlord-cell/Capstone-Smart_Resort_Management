const db = require("../../config/db");

// ============================================================
// STEP 3F-C: FRONT DESK EXTRA BED CONTROLLER
//
// Official resort rule:
// - Extra Bed = ₱200 per bed
//
// Purpose:
// - Keep reservations.extra_bed_* as the current summary.
// - Preserve already-paid Extra Bed Charge history.
// - Create/update only the CURRENT unpaid difference.
// - Prevent duplicate collection when quantity changes later.
// - Never trust a payment amount sent by the browser.
// ============================================================

const EXTRA_BED_RATE = 200;
const STRUCTURED_CHARGE_NAME = "Extra Bed Charge";
const MONEY_EPSILON = 0.005;

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function toWholeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isInteger(number)
    ? number
    : fallback;
}

function toMoney(value) {
  const number = Number(value || 0);

  return Number.isFinite(number)
    ? Math.max(number, 0)
    : 0;
}

async function getReservation(
  connection,
  reservationId,
  lock = false,
) {
  const lockSql = lock ? "FOR UPDATE" : "";

  const [rows] = await connection.query(
    `
    SELECT
      id,
      reservation_code,
      reservation_status,
      COALESCE(is_checked_in, 0) AS is_checked_in,
      COALESCE(extra_bed_count, 0) AS extra_bed_count,
      COALESCE(extra_bed_fee, 0) AS extra_bed_fee,
      COALESCE(extra_bed_paid, 0) AS extra_bed_paid,
      extra_bed_paid_at
    FROM reservations
    WHERE id = ?
    LIMIT 1
    ${lockSql}
    `,
    [reservationId],
  );

  return rows[0] || null;
}

async function getExtraBedChargeRows(
  connection,
  reservationId,
  lock = false,
) {
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
      AND LOWER(TRIM(charge_name)) = LOWER(?)
    ORDER BY id ASC
    ${lockSql}
    `,
    [
      reservationId,
      STRUCTURED_CHARGE_NAME,
    ],
  );

  return rows;
}

function summarizeChargeRows(
  reservation,
  chargeRows,
) {
  const targetCount = Math.max(
    0,
    toWholeNumber(
      reservation.extra_bed_count,
      0,
    ),
  );

  const targetTotal =
    targetCount * EXTRA_BED_RATE;

  const paidRows = chargeRows.filter(
    (row) =>
      Number(row.is_paid || 0) === 1,
  );

  const unpaidRows = chargeRows.filter(
    (row) =>
      Number(row.is_paid || 0) !== 1,
  );

  let paidTotal = paidRows.reduce(
    (sum, row) =>
      sum + toMoney(row.charge_amount),
    0,
  );

  // Backward compatibility:
  // Old versions only stored extra_bed_paid = 1 on reservations.
  // Until a write operation migrates it into booking_charges,
  // count the old paid summary as historical money already paid.
  const hasStructuredPaidHistory =
    paidRows.length > 0;

  const legacyPaidAmount =
    !hasStructuredPaidHistory &&
    Number(reservation.extra_bed_paid || 0) === 1
      ? toMoney(
          reservation.extra_bed_fee,
        )
      : 0;

  paidTotal += legacyPaidAmount;

  const remaining = Math.max(
    targetTotal - paidTotal,
    0,
  );

  const overpaid = Math.max(
    paidTotal - targetTotal,
    0,
  );

  return {
    extra_bed_rate: EXTRA_BED_RATE,
    extra_bed_count: targetCount,
    target_extra_bed_total: targetTotal,
    paid_extra_bed_total: paidTotal,
    remaining_extra_bed_due: remaining,
    extra_bed_overpaid: overpaid,
    extra_bed_paid:
      targetTotal > 0 &&
      remaining <= MONEY_EPSILON
        ? 1
        : 0,
    extra_bed_paid_at:
      reservation.extra_bed_paid_at ||
      paidRows
        .map((row) => row.paid_at)
        .filter(Boolean)
        .at(-1) ||
      null,
    paid_history_rows:
      paidRows.length,
    unpaid_rows:
      unpaidRows.length,
    legacy_paid_amount:
      legacyPaidAmount,
  };
}

async function migrateLegacyPaidSummary(
  connection,
  reservation,
  chargeRows,
) {
  const alreadyHasPaidRow =
    chargeRows.some(
      (row) =>
        Number(row.is_paid || 0) === 1,
    );

  const legacyPaid =
    Number(
      reservation.extra_bed_paid || 0,
    ) === 1;

  const legacyAmount =
    toMoney(
      reservation.extra_bed_fee,
    );

  if (
    alreadyHasPaidRow ||
    !legacyPaid ||
    legacyAmount <= MONEY_EPSILON
  ) {
    return chargeRows;
  }

  const legacyCount = Math.max(
    0,
    toWholeNumber(
      reservation.extra_bed_count,
      0,
    ),
  );

  const note =
    `Migrated from the legacy Extra Bed paid summary. ` +
    `${legacyCount} bed(s), historical paid amount ₱${legacyAmount.toFixed(
      2,
    )}.`;

  await connection.query(
    `
    INSERT INTO booking_charges (
      booking_id,
      charge_name,
      charge_amount,
      charge_note,
      is_paid,
      paid_at
    )
    VALUES (?, ?, ?, ?, 1, COALESCE(?, NOW()))
    `,
    [
      reservation.id,
      STRUCTURED_CHARGE_NAME,
      legacyAmount,
      note,
      reservation.extra_bed_paid_at,
    ],
  );

  return getExtraBedChargeRows(
    connection,
    reservation.id,
    true,
  );
}

async function syncCurrentUnpaidCharge(
  connection,
  reservationId,
  targetCount,
  paidTotal,
  chargeRows,
) {
  const targetTotal =
    targetCount * EXTRA_BED_RATE;

  const amountDue = Math.max(
    targetTotal - paidTotal,
    0,
  );

  const unpaidRows = chargeRows.filter(
    (row) =>
      Number(row.is_paid || 0) !== 1,
  );

  const primaryUnpaid =
    unpaidRows[0] || null;

  const duplicateUnpaid =
    unpaidRows.slice(1);

  if (amountDue > MONEY_EPSILON) {
    const note =
      `${targetCount} total extra bed(s) at ₱${EXTRA_BED_RATE.toFixed(
        2,
      )} each. ` +
      `Target Extra Bed total: ₱${targetTotal.toFixed(
        2,
      )}. ` +
      `Previously paid Extra Bed Charges: ₱${paidTotal.toFixed(
        2,
      )}. ` +
      `Amount due now: ₱${amountDue.toFixed(
        2,
      )}.`;

    if (primaryUnpaid) {
      await connection.query(
        `
        UPDATE booking_charges
        SET
          charge_amount = ?,
          charge_note = ?,
          is_paid = 0,
          paid_at = NULL
        WHERE id = ?
        `,
        [
          amountDue,
          note,
          Number(primaryUnpaid.id),
        ],
      );
    } else {
      await connection.query(
        `
        INSERT INTO booking_charges (
          booking_id,
          charge_name,
          charge_amount,
          charge_note,
          is_paid,
          paid_at
        )
        VALUES (?, ?, ?, ?, 0, NULL)
        `,
        [
          reservationId,
          STRUCTURED_CHARGE_NAME,
          amountDue,
          note,
        ],
      );
    }
  } else {
    for (const row of unpaidRows) {
      await connection.query(
        `
        DELETE FROM booking_charges
        WHERE id = ?
          AND COALESCE(is_paid, 0) = 0
        `,
        [Number(row.id)],
      );
    }
  }

  for (const duplicate of duplicateUnpaid) {
    await connection.query(
      `
      DELETE FROM booking_charges
      WHERE id = ?
        AND COALESCE(is_paid, 0) = 0
      `,
      [Number(duplicate.id)],
    );
  }
}

function validateOperationalReservation(
  reservation,
) {
  const status =
    normalizeValue(
      reservation.reservation_status,
    );

  if (
    [
      "cancelled",
      "rejected",
      "completed",
    ].includes(status)
  ) {
    return (
      "Extra Bed changes are not allowed for cancelled, rejected, or completed reservations."
    );
  }

  if (
    Number(
      reservation.is_checked_in || 0,
    ) !== 1
  ) {
    return (
      "Extra Bed is only available after the guest is checked in."
    );
  }

  return null;
}

// ============================================================
// GET /api/admin/bookings/:id/extra-bed
// ============================================================

const getExtraBedSummary = async (
  req,
  res,
) => {
  try {
    const reservationId =
      Number(req.params.id);

    if (
      !reservationId ||
      Number.isNaN(reservationId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid reservation ID.",
      });
    }

    const connection =
      db.promise();

    const reservation =
      await getReservation(
        connection,
        reservationId,
        false,
      );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message:
          "Reservation not found.",
      });
    }

    const chargeRows =
      await getExtraBedChargeRows(
        connection,
        reservationId,
        false,
      );

    return res.status(200).json({
      success: true,
      reservation_id:
        reservationId,
      reservation_code:
        reservation.reservation_code,
      ...summarizeChargeRows(
        reservation,
        chargeRows,
      ),
    });
  } catch (error) {
    console.error(
      "getExtraBedSummary error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load Extra Bed summary.",
      error:
        error.message,
    });
  }
};

// ============================================================
// PUT /api/admin/bookings/:id/extra-bed
//
// Body:
// { "extra_bed_count": 2 }
//
// Safe behavior:
// - Target = quantity × ₱200.
// - Historical paid rows stay untouched.
// - Only the unpaid difference is created/updated.
// ============================================================

const updateExtraBed = async (
  req,
  res,
) => {
  const connection =
    await db
      .promise()
      .getConnection();

  try {
    const reservationId =
      Number(req.params.id);

    const extraBedCount =
      toWholeNumber(
        req.body.extra_bed_count,
        -1,
      );

    if (
      !reservationId ||
      Number.isNaN(reservationId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid reservation ID.",
      });
    }

    if (extraBedCount < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Extra Bed quantity must be a whole number and cannot be negative.",
      });
    }

    await connection.beginTransaction();

    const reservation =
      await getReservation(
        connection,
        reservationId,
        true,
      );

    if (!reservation) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Reservation not found.",
      });
    }

    const validationMessage =
      validateOperationalReservation(
        reservation,
      );

    if (validationMessage) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          validationMessage,
      });
    }

    let chargeRows =
      await getExtraBedChargeRows(
        connection,
        reservationId,
        true,
      );

    chargeRows =
      await migrateLegacyPaidSummary(
        connection,
        reservation,
        chargeRows,
      );

    const structuredPaidTotal =
      chargeRows
        .filter(
          (row) =>
            Number(
              row.is_paid || 0,
            ) === 1,
        )
        .reduce(
          (sum, row) =>
            sum +
            toMoney(
              row.charge_amount,
            ),
          0,
        );

    await syncCurrentUnpaidCharge(
      connection,
      reservationId,
      extraBedCount,
      structuredPaidTotal,
      chargeRows,
    );

    const targetTotal =
      extraBedCount *
      EXTRA_BED_RATE;

    const remaining =
      Math.max(
        targetTotal -
          structuredPaidTotal,
        0,
      );

    const isSettled =
      targetTotal > 0 &&
      remaining <=
        MONEY_EPSILON;

    const overpaid =
      Math.max(
        structuredPaidTotal -
          targetTotal,
        0,
      );

    await connection.query(
      `
      UPDATE reservations
      SET
        extra_bed_count = ?,
        extra_bed_fee = ?,
        extra_bed_paid = ?,
        extra_bed_paid_at =
          CASE
            WHEN ? = 1
              THEN COALESCE(extra_bed_paid_at, NOW())
            ELSE NULL
          END
      WHERE id = ?
      `,
      [
        extraBedCount,
        targetTotal,
        isSettled ? 1 : 0,
        isSettled ? 1 : 0,
        reservationId,
      ],
    );

    await connection.commit();

    let message =
      "Extra Bed quantity updated successfully.";

    if (
      remaining >
      MONEY_EPSILON
    ) {
      message =
        `Extra Bed quantity updated. ` +
        `Amount to collect: ₱${remaining.toFixed(
          2,
        )}.`;
    } else if (
      overpaid >
      MONEY_EPSILON
    ) {
      message =
        `Extra Bed quantity updated. No new amount is due. ` +
        `Previously paid Extra Bed Charges exceed the current target by ₱${overpaid.toFixed(
          2,
        )}; review any refund or correction manually.`;
    } else if (
      targetTotal >
      MONEY_EPSILON
    ) {
      message =
        "Extra Bed quantity updated. The current Extra Bed total is already fully covered by previous payments.";
    }

    return res.status(200).json({
      success: true,
      message,
      extra_bed_rate:
        EXTRA_BED_RATE,
      extra_bed_count:
        extraBedCount,
      target_extra_bed_total:
        targetTotal,
      paid_extra_bed_total:
        structuredPaidTotal,
      remaining_extra_bed_due:
        remaining,
      extra_bed_overpaid:
        overpaid,
      extra_bed_paid:
        isSettled ? 1 : 0,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "updateExtraBed rollback error:",
        rollbackError,
      );
    }

    console.error(
      "updateExtraBed error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update Extra Bed quantity.",
      error:
        error.message,
    });
  } finally {
    connection.release();
  }
};

// ============================================================
// PUT /api/admin/bookings/:id/extra-bed-paid
//
// The browser sends NO amount.
// The backend calculates the exact remaining amount again.
// ============================================================

const collectExtraBedFee = async (
  req,
  res,
) => {
  const connection =
    await db
      .promise()
      .getConnection();

  try {
    const reservationId =
      Number(req.params.id);

    if (
      !reservationId ||
      Number.isNaN(reservationId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid reservation ID.",
      });
    }

    await connection.beginTransaction();

    const reservation =
      await getReservation(
        connection,
        reservationId,
        true,
      );

    if (!reservation) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Reservation not found.",
      });
    }

    const validationMessage =
      validateOperationalReservation(
        reservation,
      );

    if (validationMessage) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          validationMessage,
      });
    }

    const extraBedCount =
      Math.max(
        0,
        toWholeNumber(
          reservation.extra_bed_count,
          0,
        ),
      );

    const targetTotal =
      extraBedCount *
      EXTRA_BED_RATE;

    if (
      targetTotal <=
      MONEY_EPSILON
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "There is no Extra Bed fee to collect.",
      });
    }

    let chargeRows =
      await getExtraBedChargeRows(
        connection,
        reservationId,
        true,
      );

    chargeRows =
      await migrateLegacyPaidSummary(
        connection,
        reservation,
        chargeRows,
      );

    let paidTotal =
      chargeRows
        .filter(
          (row) =>
            Number(
              row.is_paid || 0,
            ) === 1,
        )
        .reduce(
          (sum, row) =>
            sum +
            toMoney(
              row.charge_amount,
            ),
          0,
        );

    await syncCurrentUnpaidCharge(
      connection,
      reservationId,
      extraBedCount,
      paidTotal,
      chargeRows,
    );

    const remaining =
      Math.max(
        targetTotal -
          paidTotal,
        0,
      );

    if (
      remaining <=
      MONEY_EPSILON
    ) {
      await connection.query(
        `
        UPDATE reservations
        SET
          extra_bed_fee = ?,
          extra_bed_paid = 1,
          extra_bed_paid_at =
            COALESCE(extra_bed_paid_at, NOW())
        WHERE id = ?
        `,
        [
          targetTotal,
          reservationId,
        ],
      );

      await connection.commit();

      return res.status(200).json({
        success: true,
        message:
          "Extra Bed fee is already fully settled. No duplicate collection was recorded.",
        collected_now: 0,
        extra_bed_rate:
          EXTRA_BED_RATE,
        extra_bed_count:
          extraBedCount,
        target_extra_bed_total:
          targetTotal,
        paid_extra_bed_total:
          paidTotal,
        remaining_extra_bed_due:
          0,
        extra_bed_paid:
          1,
      });
    }

    const [result] =
      await connection.query(
        `
        UPDATE booking_charges
        SET
          is_paid = 1,
          paid_at = NOW()
        WHERE booking_id = ?
          AND LOWER(TRIM(charge_name)) = LOWER(?)
          AND COALESCE(is_paid, 0) = 0
        `,
        [
          reservationId,
          STRUCTURED_CHARGE_NAME,
        ],
      );

    if (
      Number(
        result.affectedRows || 0,
      ) <= 0
    ) {
      throw new Error(
        "Unable to find the current unpaid Extra Bed Charge after recalculation.",
      );
    }

    paidTotal += remaining;

    await connection.query(
      `
      UPDATE reservations
      SET
        extra_bed_fee = ?,
        extra_bed_paid = 1,
        extra_bed_paid_at = NOW()
      WHERE id = ?
      `,
      [
        targetTotal,
        reservationId,
      ],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message:
        `Extra Bed payment recorded successfully. Collected ₱${remaining.toFixed(
          2,
        )}.`,
      collected_now:
        remaining,
      extra_bed_rate:
        EXTRA_BED_RATE,
      extra_bed_count:
        extraBedCount,
      target_extra_bed_total:
        targetTotal,
      paid_extra_bed_total:
        paidTotal,
      remaining_extra_bed_due:
        0,
      extra_bed_paid:
        1,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "collectExtraBedFee rollback error:",
        rollbackError,
      );
    }

    console.error(
      "collectExtraBedFee error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to record Extra Bed payment.",
      error:
        error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getExtraBedSummary,
  updateExtraBed,
  collectExtraBedFee,
};
