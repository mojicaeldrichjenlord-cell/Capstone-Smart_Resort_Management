const db = require("../../config/db");

// ============================================================
// STEP 3F-E: FRONT DESK — COLLECT UNPAID CHARGES
//
// Scope of this controller:
// - Consolidate all UNPAID rows from booking_charges.
// - This includes:
//   * Extra Guest Charge
//   * Extra Bed Charge
//   * Additional - Damage
//   * Additional - Missing Item
//   * Additional - Service
//   * Additional - Custom: ...
//   * Any other valid onsite booking_charge row
// - Preserve all previously paid financial-history rows.
// - Collect the server-calculated total only.
// - Prevent duplicate collection with transaction + row locks.
//
// IMPORTANT:
// Entrance Fee is intentionally NOT collected here.
// Entrance Fee has its own server-side recalculation and collection
// workflow under Entrance Adjustment because it depends on:
// actual guests, room free-entrance inclusions, and special rates.
//
// Accommodation balances are also NOT collected here.
// They remain part of the accommodation/final-balance workflow.
// ============================================================

const MONEY_EPSILON = 0.005;
const EXTRA_BED_CHARGE_NAME = "Extra Bed Charge";

function normalize(value) {
  return String(value || "").trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

function toMoney(value) {
  const number = Number(value || 0);

  return Number.isFinite(number)
    ? Math.max(number, 0)
    : 0;
}

function classifyCharge(chargeName) {
  const name = normalize(chargeName);
  const lower = name.toLowerCase();

  if (lower === "extra guest charge") {
    return {
      category: "extra_guest",
      category_label: "Extra Guest",
    };
  }

  if (lower === "extra bed charge") {
    return {
      category: "extra_bed",
      category_label: "Extra Bed",
    };
  }

  if (lower.startsWith("additional - ")) {
    const label =
      name.slice("Additional - ".length).trim() ||
      "Additional Charge";

    return {
      category: "additional",
      category_label: label,
    };
  }

  return {
    category: "other",
    category_label: name || "Other Charge",
  };
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

function validateOperationalReservation(reservation) {
  const status = normalizeLower(
    reservation.reservation_status,
  );

  if (
    ["cancelled", "rejected", "completed"].includes(
      status,
    )
  ) {
    return (
      "Unpaid onsite charges cannot be collected for " +
      "cancelled, rejected, or completed reservations."
    );
  }

  if (
    Number(reservation.is_checked_in || 0) !== 1
  ) {
    return (
      "Unpaid onsite charges can only be collected " +
      "after the guest is checked in."
    );
  }

  return null;
}

async function getChargeRows(
  connection,
  reservationId,
  {
    onlyUnpaid = false,
    lock = false,
  } = {},
) {
  const unpaidSql = onlyUnpaid
    ? "AND COALESCE(is_paid, 0) = 0"
    : "";

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
      ${unpaidSql}
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

function summarizeCharges(rows) {
  const allTotal = rows.reduce(
    (sum, row) =>
      sum + toMoney(row.charge_amount),
    0,
  );

  const paidTotal = rows.reduce(
    (sum, row) =>
      Number(row.is_paid || 0) === 1
        ? sum + toMoney(row.charge_amount)
        : sum,
    0,
  );

  const unpaidRows = rows.filter(
    (row) => Number(row.is_paid || 0) !== 1,
  );

  const unpaidTotal = unpaidRows.reduce(
    (sum, row) =>
      sum + toMoney(row.charge_amount),
    0,
  );

  const categoryTotals = {
    extra_guest: 0,
    extra_bed: 0,
    additional: 0,
    other: 0,
  };

  for (const row of unpaidRows) {
    const category =
      Object.prototype.hasOwnProperty.call(
        categoryTotals,
        row.category,
      )
        ? row.category
        : "other";

    categoryTotals[category] += toMoney(
      row.charge_amount,
    );
  }

  return {
    total_booking_charges: allTotal,
    paid_booking_charges: paidTotal,
    unpaid_booking_charges: unpaidTotal,
    total_charge_count: rows.length,
    unpaid_charge_count: unpaidRows.length,
    category_totals: categoryTotals,
    settled:
      unpaidTotal <= MONEY_EPSILON &&
      unpaidRows.length === 0,
  };
}

async function syncExtraBedPaidSummary(
  connection,
  reservation,
) {
  const targetTotal = toMoney(
    reservation.extra_bed_fee,
  );

  const [rows] = await connection.query(
    `
    SELECT
      COALESCE(SUM(charge_amount), 0) AS paid_total,
      MAX(paid_at) AS latest_paid_at
    FROM booking_charges
    WHERE booking_id = ?
      AND LOWER(TRIM(charge_name)) =
          LOWER(TRIM(?))
      AND COALESCE(is_paid, 0) = 1
    `,
    [
      reservation.id,
      EXTRA_BED_CHARGE_NAME,
    ],
  );

  const paidTotal = toMoney(
    rows[0]?.paid_total,
  );

  const isSettled =
    targetTotal > MONEY_EPSILON &&
    paidTotal + MONEY_EPSILON >=
      targetTotal;

  await connection.query(
    `
    UPDATE reservations
    SET
      extra_bed_paid = ?,
      extra_bed_paid_at =
        CASE
          WHEN ? = 1
            THEN COALESCE(
              extra_bed_paid_at,
              ?,
              NOW()
            )
          ELSE NULL
        END
    WHERE id = ?
    `,
    [
      isSettled ? 1 : 0,
      isSettled ? 1 : 0,
      rows[0]?.latest_paid_at || null,
      reservation.id,
    ],
  );

  return {
    target_extra_bed_total: targetTotal,
    paid_extra_bed_total: paidTotal,
    extra_bed_paid: isSettled ? 1 : 0,
  };
}

// ============================================================
// GET /api/admin/bookings/:id/unpaid-charges
//
// Returns a single Front Desk collection summary.
// No financial write is performed.
// ============================================================

const getUnpaidChargesSummary = async (
  req,
  res,
) => {
  try {
    const reservationId = Number(
      req.params.id,
    );

    if (
      !Number.isInteger(reservationId) ||
      reservationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    const connection = db.promise();

    const reservation =
      await getReservation(
        connection,
        reservationId,
        false,
      );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const validationMessage =
      validateOperationalReservation(
        reservation,
      );

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const rows = await getChargeRows(
      connection,
      reservationId,
      {
        onlyUnpaid: false,
        lock: false,
      },
    );

    const summary =
      summarizeCharges(rows);

    const unpaidCharges = rows.filter(
      (row) =>
        Number(row.is_paid || 0) !== 1,
    );

    return res.status(200).json({
      success: true,
      reservation_id: reservationId,
      reservation_code:
        reservation.reservation_code,
      unpaid_charges: unpaidCharges,
      ...summary,
      collection_scope: {
        booking_charges_only: true,
        entrance_fee_included: false,
        accommodation_balance_included: false,
      },
      note:
        "Entrance Fee remains in Entrance Adjustment. " +
        "Accommodation balances remain in the accommodation/final-balance workflow.",
    });
  } catch (error) {
    console.error(
      "getUnpaidChargesSummary error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load unpaid onsite charges.",
      error: error.message,
    });
  }
};

// ============================================================
// PUT /api/admin/bookings/:id/unpaid-charges/collect
//
// Body: none required.
//
// Safe behavior:
// - Browser does NOT send a payment amount.
// - Reservation is locked.
// - Current unpaid charge rows are locked.
// - Backend calculates the exact current total.
// - Only rows still unpaid inside this transaction are marked paid.
// - Repeating the request cannot collect the same rows twice.
// - Extra Bed reservation summary is synchronized afterward.
// ============================================================

const collectUnpaidCharges = async (
  req,
  res,
) => {
  const connection =
    await db
      .promise()
      .getConnection();

  try {
    const reservationId = Number(
      req.params.id,
    );

    if (
      !Number.isInteger(reservationId) ||
      reservationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
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
        message: "Reservation not found.",
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
        message: validationMessage,
      });
    }

    const unpaidRows =
      await getChargeRows(
        connection,
        reservationId,
        {
          onlyUnpaid: true,
          lock: true,
        },
      );

    const amountToCollect =
      unpaidRows.reduce(
        (sum, row) =>
          sum +
          toMoney(
            row.charge_amount,
          ),
        0,
      );

    if (
      unpaidRows.length === 0 ||
      amountToCollect <=
        MONEY_EPSILON
    ) {
      await connection.commit();

      return res.status(200).json({
        success: true,
        message:
          "No unpaid onsite booking charges remain.",
        reservation_id:
          reservationId,
        reservation_code:
          reservation.reservation_code,
        collected_count: 0,
        collected_amount: 0,
        collected_charges: [],
        settled: true,
      });
    }

    const chargeIds = unpaidRows.map(
      (row) => Number(row.id),
    );

    const [updateResult] =
      await connection.query(
        `
        UPDATE booking_charges
        SET
          is_paid = 1,
          paid_at = NOW()
        WHERE booking_id = ?
          AND COALESCE(is_paid, 0) = 0
        `,
        [reservationId],
      );

    // Because the rows were locked above, affectedRows must match
    // the exact unpaid rows that Front Desk just confirmed.
    if (
      Number(updateResult.affectedRows) !==
      unpaidRows.length
    ) {
      throw new Error(
        "Unpaid charge rows changed during collection. The transaction was cancelled to prevent an inconsistent payment record.",
      );
    }

    const extraBedSummary =
      await syncExtraBedPaidSummary(
        connection,
        reservation,
      );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message:
        `Collected ₱${amountToCollect.toFixed(
          2,
        )} for ${unpaidRows.length} unpaid onsite charge(s).`,
      reservation_id:
        reservationId,
      reservation_code:
        reservation.reservation_code,
      collected_count:
        unpaidRows.length,
      collected_amount:
        amountToCollect,
      collected_charge_ids:
        chargeIds,
      collected_charges:
        unpaidRows.map((row) => ({
          id: row.id,
          charge_name:
            row.charge_name,
          charge_amount:
            toMoney(
              row.charge_amount,
            ),
          charge_note:
            row.charge_note,
          category:
            row.category,
          category_label:
            row.category_label,
        })),
      extra_bed_summary:
        extraBedSummary,
      settled: true,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "collectUnpaidCharges rollback error:",
        rollbackError,
      );
    }

    console.error(
      "collectUnpaidCharges error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to collect unpaid onsite charges.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getUnpaidChargesSummary,
  collectUnpaidCharges,
};
