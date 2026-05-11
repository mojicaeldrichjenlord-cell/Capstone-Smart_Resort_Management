const db = require("../config/db");

const VALID_BOOKING_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "completed",
];

const EXTRA_BED_RATE = 200;

const normalizeValue = (value) => {
  if (!value) return "";
  return String(value).trim().toLowerCase();
};

exports.getAllAdminBookings = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        b.id,
        b.user_id,
        b.room_id,
        b.check_in,
        b.check_in_time,
        b.check_out,
        b.check_out_time,
        b.guests,
        b.status,
        b.created_at,
        b.payment_method,
        b.payment_status,
        b.extra_bed_count,
        b.extra_bed_fee,
        u.fullname,
        u.email,
        u.phone,
        u.address,
        r.room_name,
        r.price,
        r.capacity,
        r.image
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      INNER JOIN rooms r ON b.room_id = r.id
      ORDER BY b.id DESC
    `);

    return res.status(200).json({
      success: true,
      bookings: rows,
    });
  } catch (error) {
    console.error("getAllAdminBookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin bookings.",
      error: error.message,
    });
  }
};

exports.updateAdminBookingStatus = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const status = normalizeValue(req.body.status);

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!VALID_BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking status. Allowed values: pending, approved, rejected, cancelled, completed.",
      });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id, status FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    await db.promise().query(
      `UPDATE bookings SET status = ? WHERE id = ?`,
      [status, bookingId]
    );

    return res.status(200).json({
      success: true,
      message:
        status === "completed"
          ? "Guest checked out successfully."
          : "Booking status updated successfully.",
    });
  } catch (error) {
    console.error("updateAdminBookingStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
      error: error.message,
    });
  }
};

exports.updateExtraBed = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const extraBedCount = Number(req.body.extra_bed_count || 0);

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (
      Number.isNaN(extraBedCount) ||
      extraBedCount < 0 ||
      !Number.isInteger(extraBedCount)
    ) {
      return res.status(400).json({
        success: false,
        message: "Extra bed count must be a whole number and cannot be negative.",
      });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const extraBedFee = extraBedCount * EXTRA_BED_RATE;

    await db.promise().query(
      `
        UPDATE bookings
        SET extra_bed_count = ?, extra_bed_fee = ?
        WHERE id = ?
      `,
      [extraBedCount, extraBedFee, bookingId]
    );

    return res.status(200).json({
      success: true,
      message: "Extra bed updated successfully.",
      extra_bed_count: extraBedCount,
      extra_bed_fee: extraBedFee,
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

exports.markBookingAsCompleted = async (req, res) => {
  try {
    const bookingId = Number(req.params.id || req.params.booking_id);

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id, status FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    await db.promise().query(
      `UPDATE bookings SET status = 'completed' WHERE id = ?`,
      [bookingId]
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