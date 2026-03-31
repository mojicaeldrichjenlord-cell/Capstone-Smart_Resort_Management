const db = require("../config/db");

const VALID_BOOKING_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "completed",
];

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
      message: "Booking status updated successfully.",
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