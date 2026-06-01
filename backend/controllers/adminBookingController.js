const db = require("../config/db");

const VALID_BOOKING_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "completed",
];

const EXTRA_BED_RATE = 200;

function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
}

function toInteger(value, fallback = 0) {
  const num = Number(value);
  return Number.isInteger(num) ? num : fallback;
}

// ============================================================
// GET ADMIN BOOKINGS
// Uses the current reservations/reservation_items/accommodations tables.
// This replaces the old query that still used the old bookings/rooms table.
// ============================================================
exports.getAllAdminBookings = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `
      SELECT
        r.id,
        r.reservation_code,
        r.user_id,
        r.booking_source,
        r.first_name,
        r.middle_name,
        r.last_name,
        r.contact_no,
        r.guest_count,
        r.estimated_entrance_fee,
        r.accommodation_total,
        r.required_downpayment,
        r.paid_amount,
        r.remaining_balance,
        r.note,
        r.payment_method,
        r.payment_status,
        r.reservation_status AS status,
        r.proof_of_payment,
        r.proof_image_data,
        r.reserved_at,
        r.created_at,

        COALESCE(r.extra_bed_count, 0) AS extra_bed_count,
        COALESCE(r.extra_bed_fee, 0) AS extra_bed_fee,
        COALESCE(r.extra_bed_paid, 0) AS extra_bed_paid,
        r.extra_bed_paid_at,
        COALESCE(r.is_checked_in, 0) AS is_checked_in,
        r.checked_in_at,
        COALESCE(r.entrance_fee_paid, 0) AS entrance_fee_paid,
        COALESCE(r.entrance_fee_collected, 0) AS entrance_fee_collected,

        u.email,

        first_item.slot_label,
        first_item.check_in_date,
        first_item.check_in_time,
        first_item.check_out_date,
        first_item.check_out_time,

        a.name AS room_name,
        a.image,

        item_counts.total_items,
        acc_list.accommodation_list
      FROM reservations r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN (
        SELECT reservation_id, MIN(id) AS first_item_id
        FROM reservation_items
        GROUP BY reservation_id
      ) first_ref ON r.id = first_ref.reservation_id
      LEFT JOIN reservation_items first_item ON first_ref.first_item_id = first_item.id
      LEFT JOIN accommodations a ON first_item.accommodation_id = a.id
      LEFT JOIN (
        SELECT reservation_id, COUNT(*) AS total_items
        FROM reservation_items
        GROUP BY reservation_id
      ) item_counts ON r.id = item_counts.reservation_id
      LEFT JOIN (
        SELECT
          ri.reservation_id,
          GROUP_CONCAT(a2.name ORDER BY ri.id ASC SEPARATOR ', ') AS accommodation_list
        FROM reservation_items ri
        INNER JOIN accommodations a2 ON ri.accommodation_id = a2.id
        GROUP BY ri.reservation_id
      ) acc_list ON r.id = acc_list.reservation_id
      ORDER BY r.created_at DESC
      `,
    );

    const bookings = rows.map((row) => ({
      ...row,
      fullname: [row.first_name, row.middle_name, row.last_name]
        .filter(Boolean)
        .join(" "),
      phone: row.contact_no || "-",
      check_in: row.check_in_date,
      check_out: row.check_out_date,
      check_in_time: row.check_in_time,
      check_out_time: row.check_out_time,
      guests: row.guest_count,
      room_name: row.accommodation_list || row.room_name || "N/A",
    }));

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("getAllAdminBookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin reservations.",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE RESERVATION STATUS
// Uses reservations.reservation_status.
// ============================================================
exports.updateAdminBookingStatus = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);
    const status = normalizeValue(req.body.status);

    if (!reservationId || Number.isNaN(reservationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    if (!VALID_BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid reservation status. Allowed values: pending, approved, rejected, cancelled, completed.",
      });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id, reservation_status FROM reservations WHERE id = ? LIMIT 1`,
      [reservationId],
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    if (status === "completed") {
      await db.promise().query(
        `
        UPDATE reservations
        SET
          reservation_status = 'completed',
          is_checked_in = 0
        WHERE id = ?
        `,
        [reservationId],
      );
    } else {
      await db.promise().query(
        `UPDATE reservations SET reservation_status = ? WHERE id = ?`,
        [status, reservationId],
      );
    }

    return res.status(200).json({
      success: true,
      message:
        status === "completed"
          ? "Guest checked out successfully."
          : "Reservation status updated successfully.",
    });
  } catch (error) {
    console.error("updateAdminBookingStatus error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update reservation status.",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE EXTRA BED
// Uses reservations.extra_bed_count and reservations.extra_bed_fee.
// This is the endpoint used by Guests Inside:
// PUT /api/admin/bookings/:id/extra-bed
// ============================================================
exports.updateExtraBed = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);
    const extraBedCount = toInteger(req.body.extra_bed_count, -1);

    if (!reservationId || Number.isNaN(reservationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    if (extraBedCount < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Extra bed count must be a whole number and cannot be negative.",
      });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id FROM reservations WHERE id = ? LIMIT 1`,
      [reservationId],
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const extraBedFee = extraBedCount * EXTRA_BED_RATE;

    await db.promise().query(
      `
      UPDATE reservations
      SET
        extra_bed_count = ?,
        extra_bed_fee = ?,
        extra_bed_paid = 0,
        extra_bed_paid_at = NULL
      WHERE id = ?
      `,
      [extraBedCount, extraBedFee, reservationId],
    );

    return res.status(200).json({
      success: true,
      message:
        extraBedFee > 0
          ? "Extra bed updated successfully. Please collect extra bed payment."
          : "Extra bed updated successfully.",
      extra_bed_count: extraBedCount,
      extra_bed_fee: extraBedFee,
      extra_bed_paid: 0,
      extra_bed_paid_at: null,
      extra_bed_rate: EXTRA_BED_RATE,
    });
  } catch (error) {
    console.error("updateExtraBed error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update extra bed.",
      error: error.message,
    });
  }
};


// ============================================================
// MARK EXTRA BED AS PAID
// Used by Guests Inside after front desk collects extra bed fee.
// Endpoint: PUT /api/admin/bookings/:id/extra-bed-paid
// ============================================================
exports.markExtraBedPaid = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);

    if (!reservationId || Number.isNaN(reservationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    const [existingRows] = await db.promise().query(
      `
      SELECT
        id,
        COALESCE(extra_bed_count, 0) AS extra_bed_count,
        COALESCE(extra_bed_fee, 0) AS extra_bed_fee,
        COALESCE(extra_bed_paid, 0) AS extra_bed_paid
      FROM reservations
      WHERE id = ?
      LIMIT 1
      `,
      [reservationId],
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    const booking = existingRows[0];
    const extraBedFee = Number(booking.extra_bed_fee || 0);

    if (extraBedFee <= 0) {
      return res.status(400).json({
        success: false,
        message: "There is no extra bed fee to mark as paid.",
      });
    }

    await db.promise().query(
      `
      UPDATE reservations
      SET
        extra_bed_paid = 1,
        extra_bed_paid_at = NOW()
      WHERE id = ?
      `,
      [reservationId],
    );

    return res.status(200).json({
      success: true,
      message: "Extra bed fee marked as paid.",
      extra_bed_count: Number(booking.extra_bed_count || 0),
      extra_bed_fee: extraBedFee,
      extra_bed_paid: 1,
      extra_bed_paid_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("markExtraBedPaid error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark extra bed as paid.",
      error: error.message,
    });
  }
};

// ============================================================
// MARK BOOKING AS COMPLETED
// Kept for backward compatibility if another route still calls it.
// ============================================================
exports.markBookingAsCompleted = async (req, res) => {
  try {
    const reservationId = Number(req.params.id || req.params.booking_id);

    if (!reservationId || Number.isNaN(reservationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation ID.",
      });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id FROM reservations WHERE id = ? LIMIT 1`,
      [reservationId],
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    await db.promise().query(
      `
      UPDATE reservations
      SET
        reservation_status = 'completed',
        is_checked_in = 0
      WHERE id = ?
      `,
      [reservationId],
    );

    return res.status(200).json({
      success: true,
      message: "Guest checked out successfully.",
    });
  } catch (error) {
    console.error("markBookingAsCompleted error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check out guest.",
      error: error.message,
    });
  }
};
