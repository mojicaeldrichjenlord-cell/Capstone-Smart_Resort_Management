const db = require("../config/db");

// ============================================================
// FRONT DESK GUEST ADJUSTMENT CONTROLLER
//
// File:
// backend/controllers/frontdeskGuestAdjustmentController.js
//
// Purpose:
// - Preserve original booked guest count.
// - Save verified actual onsite guest count.
// - Preserve all already-paid Extra Guest Charge history.
// - Create/update only the CURRENT unpaid difference.
// - Prevent duplicate unpaid structured Extra Guest Charge rows.
// ============================================================

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function toInteger(value, fallback = 0) {
  const num = Number(value);

  return Number.isInteger(num)
    ? num
    : fallback;
}

function toMoney(value) {
  const num = Number(value || 0);

  return Number.isFinite(num)
    ? Math.max(num, 0)
    : 0;
}

// ============================================================
// UPDATE GUEST ADJUSTMENT
//
// Endpoint:
// PUT /api/admin/bookings/:id/guest-adjustment
//
// Example:
// Booked guests = 6
//
// First adjustment:
// Actual = 8
// Rate = 300
// Target extra guest total = 600
// Paid before = 0
// Current unpaid due = 600
//
// After that ₱600 is marked PAID:
//
// Second adjustment:
// Actual = 10
// Rate = 250
// Target extra guest total = 1,000
// Previously paid = 600
// New additional amount due = 400
//
// The previous ₱600 paid row stays untouched.
// ============================================================

const updateGuestAdjustment = async (req, res) => {
  const connection =
    await db.promise().getConnection();

  try {
    const reservationId =
      Number(req.params.id);

    const actualGuestCount =
      toInteger(
        req.body.actual_guest_count,
        -1,
      );

    const extraGuestRate =
      Number(
        req.body.extra_guest_rate || 0,
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

    if (actualGuestCount < 1) {
      return res.status(400).json({
        success: false,
        message:
          "Actual guest count must be at least 1.",
      });
    }

    if (
      !Number.isFinite(extraGuestRate) ||
      extraGuestRate < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Extra guest rate cannot be negative.",
      });
    }

    await connection.beginTransaction();

    // --------------------------------------------------------
    // Lock reservation while the whole adjustment is processed.
    // --------------------------------------------------------
    const [reservationRows] =
      await connection.query(
        `
        SELECT
          id,
          guest_count,
          actual_guest_count,
          reservation_status,
          is_checked_in
        FROM reservations
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [reservationId],
      );

    if (!reservationRows.length) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Reservation not found.",
      });
    }

    const reservation =
      reservationRows[0];

    const reservationStatus =
      normalizeValue(
        reservation.reservation_status,
      );

    if (
      [
        "cancelled",
        "rejected",
        "completed",
      ].includes(reservationStatus)
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Guest adjustment is not allowed for cancelled, rejected, or completed reservations.",
      });
    }

    if (
      Number(
        reservation.is_checked_in || 0,
      ) !== 1
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Guest adjustment is only available after the guest is checked in.",
      });
    }

    const bookedGuestCount =
      Number(
        reservation.guest_count || 0,
      );

    const extraGuestCount =
      Math.max(
        actualGuestCount -
          bookedGuestCount,
        0,
      );

    const targetExtraGuestTotal =
      extraGuestCount *
      extraGuestRate;

    // --------------------------------------------------------
    // Load ALL structured Extra Guest Charge rows.
    //
    // Paid rows represent historical money already collected.
    // They must never be rewritten.
    // --------------------------------------------------------
    const [chargeRows] =
      await connection.query(
        `
        SELECT
          id,
          charge_amount,
          charge_note,
          COALESCE(is_paid, 0) AS is_paid,
          paid_at
        FROM booking_charges
        WHERE booking_id = ?
          AND LOWER(TRIM(charge_name)) =
              'extra guest charge'
        ORDER BY id ASC
        FOR UPDATE
        `,
        [reservationId],
      );

    const paidChargeRows =
      chargeRows.filter(
        (charge) =>
          Number(charge.is_paid || 0) ===
          1,
      );

    const unpaidChargeRows =
      chargeRows.filter(
        (charge) =>
          Number(charge.is_paid || 0) !==
          1,
      );

    const paidExtraGuestTotal =
      paidChargeRows.reduce(
        (sum, charge) =>
          sum +
          toMoney(
            charge.charge_amount,
          ),
        0,
      );

    // --------------------------------------------------------
    // Current unpaid difference only.
    //
    // Never ask staff to collect historical paid money again.
    // --------------------------------------------------------
    const additionalAmountDue =
      Math.max(
        targetExtraGuestTotal -
          paidExtraGuestTotal,
        0,
      );

    const overpaidAmount =
      Math.max(
        paidExtraGuestTotal -
          targetExtraGuestTotal,
        0,
      );

    // --------------------------------------------------------
    // Always save the verified actual guest count.
    // Original guest_count remains unchanged.
    // --------------------------------------------------------
    await connection.query(
      `
      UPDATE reservations
      SET actual_guest_count = ?
      WHERE id = ?
      `,
      [
        actualGuestCount,
        reservationId,
      ],
    );

    const primaryUnpaidCharge =
      unpaidChargeRows[0] || null;

    const duplicateUnpaidCharges =
      unpaidChargeRows.slice(1);

    // --------------------------------------------------------
    // Keep at most ONE current unpaid structured charge.
    // --------------------------------------------------------
    if (additionalAmountDue > 0) {
      const chargeNote =
        `${extraGuestCount} total additional guest${
          extraGuestCount === 1
            ? ""
            : "s"
        } above the booked guest count of ${bookedGuestCount}. ` +
        `Current rate: ₱${extraGuestRate.toFixed(
          2,
        )} per extra guest. ` +
        `Calculated extra guest total: ₱${targetExtraGuestTotal.toFixed(
          2,
        )}. ` +
        `Previously paid Extra Guest Charges: ₱${paidExtraGuestTotal.toFixed(
          2,
        )}. ` +
        `Additional amount due now: ₱${additionalAmountDue.toFixed(
          2,
        )}.`;

      if (primaryUnpaidCharge) {
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
            additionalAmountDue,
            chargeNote,
            Number(
              primaryUnpaidCharge.id,
            ),
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
          VALUES (
            ?,
            'Extra Guest Charge',
            ?,
            ?,
            0,
            NULL
          )
          `,
          [
            reservationId,
            additionalAmountDue,
            chargeNote,
          ],
        );
      }

      // Remove only duplicate UNPAID structured rows.
      // Paid historical rows are preserved.
      for (
        const duplicateCharge
        of duplicateUnpaidCharges
      ) {
        await connection.query(
          `
          DELETE FROM booking_charges
          WHERE id = ?
            AND COALESCE(is_paid, 0) = 0
          `,
          [
            Number(
              duplicateCharge.id,
            ),
          ],
        );
      }
    } else {
      // No current amount is due.
      // Remove any stale unpaid structured Extra Guest Charge rows.
      for (
        const unpaidCharge
        of unpaidChargeRows
      ) {
        await connection.query(
          `
          DELETE FROM booking_charges
          WHERE id = ?
            AND COALESCE(is_paid, 0) = 0
          `,
          [
            Number(
              unpaidCharge.id,
            ),
          ],
        );
      }
    }

    await connection.commit();

    let message =
      "Guest adjustment saved successfully.";

    if (
      additionalAmountDue > 0 &&
      paidExtraGuestTotal > 0
    ) {
      message =
        `Guest adjustment saved. Previous paid Extra Guest Charges were preserved. ` +
        `Additional amount to collect: ₱${additionalAmountDue.toFixed(
          2,
        )}.`;
    } else if (
      additionalAmountDue > 0
    ) {
      message =
        `Guest adjustment saved. Extra Guest Charge to collect: ₱${additionalAmountDue.toFixed(
          2,
        )}.`;
    } else if (overpaidAmount > 0) {
      message =
        `Guest adjustment saved. No new Extra Guest Charge was created. ` +
        `Previously paid Extra Guest Charges exceed the current recalculated total by ₱${overpaidAmount.toFixed(
          2,
        )}; handle any refund or correction manually if needed.`;
    } else {
      message =
        "Guest adjustment saved. No additional Extra Guest Charge is required.";
    }

    return res.status(200).json({
      success: true,
      message,

      booked_guest_count:
        bookedGuestCount,

      actual_guest_count:
        actualGuestCount,

      extra_guest_count:
        extraGuestCount,

      extra_guest_rate:
        extraGuestRate,

      target_extra_guest_total:
        targetExtraGuestTotal,

      paid_extra_guest_total:
        paidExtraGuestTotal,

      additional_extra_guest_due:
        additionalAmountDue,

      overpaid_extra_guest_amount:
        overpaidAmount,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "frontdesk guest adjustment rollback error:",
        rollbackError,
      );
    }

    console.error(
      "frontdesk updateGuestAdjustment error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update guest adjustment.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  updateGuestAdjustment,
};
