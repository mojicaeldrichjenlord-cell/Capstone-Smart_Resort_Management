const db = require("../../config/db");

// ============================================================
// STEP 3F-G: FRONT DESK — ACCOMMODATION BALANCE COLLECTION
//
// Purpose:
// - Show the reservation's current accommodation balance.
// - Collect the FULL remaining accommodation balance explicitly.
// - Browser sends NO payment amount.
// - Backend recalculates the amount from accommodation_total - paid_amount.
// - required_downpayment is historical and is never recalculated here.
// - Entrance Fee and booking_charges remain separate workflows.
// - Collection is transaction-safe and duplicate-safe.
// ============================================================

const MONEY_EPSILON = 0.005;

function normalize(value) {
  return String(value || "").trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

function toMoney(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? Math.max(amount, 0) : 0;
}

function roundMoney(value) {
  return Math.round((toMoney(value) + Number.EPSILON) * 100) / 100;
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
      COALESCE(is_checked_in, 0) AS is_checked_in,
      COALESCE(accommodation_total, 0) AS accommodation_total,
      COALESCE(required_downpayment, 0) AS required_downpayment,
      COALESCE(paid_amount, 0) AS paid_amount,
      COALESCE(remaining_balance, 0) AS remaining_balance
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
  const status = normalizeLower(reservation.reservation_status);

  if (["cancelled", "rejected", "completed"].includes(status)) {
    return "Accommodation balance cannot be collected for cancelled, rejected, or completed reservations.";
  }

  if (status !== "approved") {
    return "Only approved reservations can receive onsite accommodation balance collection.";
  }

  if (Number(reservation.is_checked_in || 0) !== 1) {
    return "Accommodation balance can only be collected after the guest is checked in.";
  }

  return null;
}

function buildBalanceSummary(reservation) {
  const accommodationTotal = roundMoney(reservation.accommodation_total);
  const paidAmount = roundMoney(reservation.paid_amount);
  const storedRemainingBalance = roundMoney(reservation.remaining_balance);

  const calculatedRemainingBalance = roundMoney(
    Math.max(accommodationTotal - paidAmount, 0),
  );

  const overpaidAmount = roundMoney(
    Math.max(paidAmount - accommodationTotal, 0),
  );

  const balanceMismatch =
    Math.abs(storedRemainingBalance - calculatedRemainingBalance) >
    MONEY_EPSILON;

  return {
    reservation_id: Number(reservation.id),
    reservation_code: reservation.reservation_code,
    reservation_status: reservation.reservation_status,
    payment_status: reservation.payment_status,
    is_checked_in: Number(reservation.is_checked_in || 0),
    accommodation_total: accommodationTotal,
    required_downpayment: roundMoney(reservation.required_downpayment),
    paid_amount: paidAmount,
    stored_remaining_balance: storedRemainingBalance,
    remaining_balance: calculatedRemainingBalance,
    overpaid_amount: overpaidAmount,
    balance_mismatch: balanceMismatch,
    settled:
      calculatedRemainingBalance <= MONEY_EPSILON &&
      overpaidAmount <= MONEY_EPSILON,
    collection_scope: {
      accommodation_balance_only: true,
      entrance_fee_included: false,
      booking_charges_included: false,
    },
    note:
      "This workflow collects accommodation balance only. Entrance Fee and onsite booking charges remain separate.",
  };
}

// ============================================================
// GET /api/admin/bookings/:id/accommodation-balance
// ============================================================
exports.getAccommodationBalanceSummary = async (req, res) => {
  const reservationId = Number(req.params.id);

  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid reservation ID is required.",
    });
  }

  const connection = await db.promise().getConnection();

  try {
    const reservation = await getReservation(
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

    const operationalError = validateOperationalReservation(reservation);

    if (operationalError) {
      return res.status(400).json({
        success: false,
        message: operationalError,
      });
    }

    return res.status(200).json({
      success: true,
      ...buildBalanceSummary(reservation),
    });
  } catch (error) {
    console.error("getAccommodationBalanceSummary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load accommodation balance.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ============================================================
// PUT /api/admin/bookings/:id/accommodation-balance/collect
// ============================================================
exports.collectAccommodationBalance = async (req, res) => {
  const reservationId = Number(req.params.id);

  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid reservation ID is required.",
    });
  }

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    const reservation = await getReservation(
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

    const operationalError = validateOperationalReservation(reservation);

    if (operationalError) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: operationalError,
      });
    }

    const before = buildBalanceSummary(reservation);

    if (before.overpaid_amount > MONEY_EPSILON) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Paid accommodation amount is already above the accommodation total. Review the reservation before collecting more.",
        ...before,
      });
    }

    // Duplicate-safe: if nothing is due, normalize any stale balance/status
    // without recording another payment.
    if (before.remaining_balance <= MONEY_EPSILON) {
      await connection.query(
        `
        UPDATE reservations
        SET
          paid_amount = accommodation_total,
          remaining_balance = 0,
          payment_status = 'paid'
        WHERE id = ?
        `,
        [reservationId],
      );

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Accommodation balance is already fully settled.",
        collected_amount: 0,
        duplicate_collection_prevented: true,
        ...before,
        paid_amount: before.accommodation_total,
        remaining_balance: 0,
        payment_status: "paid",
        settled: true,
      });
    }

    const collectedAmount = before.remaining_balance;
    const newPaidAmount = before.accommodation_total;

    await connection.query(
      `
      UPDATE reservations
      SET
        paid_amount = ?,
        remaining_balance = 0,
        payment_status = 'paid'
      WHERE id = ?
      `,
      [newPaidAmount, reservationId],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Collected ₱${collectedAmount.toFixed(2)} accommodation balance successfully.`,
      reservation_id: reservationId,
      reservation_code: reservation.reservation_code,
      collected_amount: collectedAmount,
      accommodation_total: before.accommodation_total,
      required_downpayment: before.required_downpayment,
      previous_paid_amount: before.paid_amount,
      paid_amount: newPaidAmount,
      remaining_balance: 0,
      payment_status: "paid",
      duplicate_collection_prevented: false,
      settled: true,
      collection_scope: before.collection_scope,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    console.error("collectAccommodationBalance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to collect accommodation balance.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};
