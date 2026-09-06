const db = require("../config/db");

/* ======================================================
   FRONT DESK CHECK-IN CONTROLLER
   File: backend/controllers/frontdeskCheckInController.js

   STEP 3F-B2 FINANCIAL CORRECTION

   Purpose:
   - Keep Front Desk check-in separate from entrance-fee collection.
   - Collect/finalize the remaining ACCOMMODATION balance at check-in.
   - Do NOT automatically mark the entrance fee as paid.
   - Do NOT automatically copy the estimated entrance fee into
     entrance_fee_collected.
   - Allow Entrance Adjustment to happen after the guest is inside.

   Correct operational flow:

   Verified downpayment
        ↓
   Ready Today
        ↓
   Check In / collect remaining accommodation balance
        ↓
   Guest Adjustment
        ↓
   Entrance Adjustment
        ↓
   Final entrance/additional charge collection
        ↓
   Checkout

   Important:
   payment_status / paid_amount / remaining_balance currently represent
   the ACCOMMODATION payment lifecycle.

   Entrance payment is tracked separately using:
   - estimated_entrance_fee
   - entrance_fee_paid
   - entrance_fee_collected
====================================================== */

// ======================================================
// HELPERS
// ======================================================

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function toMoney(value) {
  const amount = Number(value || 0);

  return Number.isFinite(amount)
    ? amount
    : 0;
}

function getPhilippineTodayDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = {};

  parts.forEach((part) => {
    values[part.type] = part.value;
  });

  return `${values.year}-${values.month}-${values.day}`;
}

// ======================================================
// PUT /api/bookings/:id/check-in
// ======================================================

const checkInBooking = async (req, res) => {
  const connection = await db
    .promise()
    .getConnection();

  try {
    const bookingId = Number(
      req.params.id,
    );

    if (
      !bookingId ||
      Number.isNaN(bookingId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid reservation ID.",
      });
    }

    await connection.beginTransaction();

    // --------------------------------------------------
    // Lock the reservation row while checking eligibility.
    // This prevents two Front Desk requests from checking
    // in the same reservation at the same time.
    // --------------------------------------------------
    const [rows] = await connection.query(
      `
      SELECT
        id,
        reservation_code,
        reservation_status,
        payment_status,
        accommodation_total,
        required_downpayment,
        paid_amount,
        remaining_balance,
        estimated_entrance_fee,
        entrance_fee_paid,
        entrance_fee_collected,
        is_checked_in,
        checked_in_at
      FROM reservations
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [bookingId],
    );

    if (!rows.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Reservation not found.",
      });
    }

    const reservation = rows[0];

    const reservationStatus =
      normalizeText(
        reservation.reservation_status,
      );

    const paymentStatus =
      normalizeText(
        reservation.payment_status,
      );

    // --------------------------------------------------
    // Closed reservations cannot be checked in.
    // --------------------------------------------------
    if (
      [
        "cancelled",
        "rejected",
        "completed",
      ].includes(
        reservationStatus,
      )
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "This reservation can no longer be checked in.",
      });
    }

    // --------------------------------------------------
    // Reservation must already be approved.
    // --------------------------------------------------
    if (
      reservationStatus !==
      "approved"
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "This reservation must be approved after payment verification before check-in.",
      });
    }

    // --------------------------------------------------
    // Online/manual downpayment must already be verified.
    //
    // partially_paid:
    //   verified downpayment, remaining accommodation
    //   balance is collected at Front Desk check-in.
    //
    // paid:
    //   accommodation is already fully paid.
    // --------------------------------------------------
    if (
      ![
        "partially_paid",
        "paid",
      ].includes(
        paymentStatus,
      )
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Required payment must be verified before this reservation can be checked in.",
      });
    }

    // --------------------------------------------------
    // Duplicate check-in protection.
    // --------------------------------------------------
    if (
      Number(
        reservation.is_checked_in ||
          0,
      ) === 1
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "This reservation is already checked in.",
      });
    }

    // --------------------------------------------------
    // Server-side date validation.
    //
    // Frontend already hides the Check In button when the
    // date is not today. We still validate again here because
    // backend validation is the actual source of truth.
    // --------------------------------------------------
    const [dateRows] = await connection.query(
      `
      SELECT
        DATE_FORMAT(
          MIN(check_in_date),
          '%Y-%m-%d'
        ) AS check_in_date
      FROM reservation_items
      WHERE reservation_id = ?
      `,
      [bookingId],
    );

    const scheduledCheckInDate =
      String(
        dateRows?.[0]
          ?.check_in_date || "",
      ).trim();

    if (!scheduledCheckInDate) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "This reservation has no valid check-in schedule.",
      });
    }

    const today =
      getPhilippineTodayDateKey();

    if (
      scheduledCheckInDate !==
      today
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          scheduledCheckInDate >
          today
            ? "This reservation is not yet scheduled for check-in today."
            : "The scheduled check-in date has already passed. Review this reservation manually.",
      });
    }

    // --------------------------------------------------
    // ACCOMMODATION PAYMENT
    //
    // At this point the Front Desk confirms that the
    // remaining accommodation balance has been collected.
    //
    // IMPORTANT:
    // Entrance fee is intentionally NOT changed here.
    // --------------------------------------------------
    const accommodationTotal =
      Math.max(
        0,
        toMoney(
          reservation
            .accommodation_total,
        ),
      );

    const remainingAccommodationBalance =
      Math.max(
        0,
        toMoney(
          reservation
            .remaining_balance,
        ),
      );

    await connection.query(
      `
      UPDATE reservations
      SET
        reservation_status = 'approved',
        payment_status = 'paid',
        paid_amount = ?,
        remaining_balance = 0,
        is_checked_in = 1,
        checked_in_at = NOW()
      WHERE id = ?
      `,
      [
        accommodationTotal,
        bookingId,
      ],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,

      message:
        "Guest checked in successfully. Remaining accommodation balance was recorded as collected. Entrance fee remains separate for Front Desk adjustment and final collection.",

      reservation_id:
        bookingId,

      reservation_code:
        reservation
          .reservation_code,

      payment_status:
        "paid",

      accommodation_total:
        accommodationTotal,

      accommodation_collected_at_check_in:
        remainingAccommodationBalance,

      paid_amount:
        accommodationTotal,

      remaining_balance:
        0,

      // Entrance values are returned unchanged on purpose.
      estimated_entrance_fee:
        toMoney(
          reservation
            .estimated_entrance_fee,
        ),

      entrance_fee_paid:
        Number(
          reservation
            .entrance_fee_paid ||
            0,
        ),

      entrance_fee_collected:
        toMoney(
          reservation
            .entrance_fee_collected,
        ),

      is_checked_in:
        1,

      scheduled_check_in_date:
        scheduledCheckInDate,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "frontdesk check-in rollback error:",
        rollbackError,
      );
    }

    console.error(
      "frontdesk checkInBooking error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to check in reservation.",
      error:
        error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  checkInBooking,
};
