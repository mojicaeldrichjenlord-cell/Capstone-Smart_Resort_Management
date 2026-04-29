const db = require("../config/db");

const VALID_PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "partially_paid",
  "rejected",
  "refunded",
];

const normalizeStatus = (value) => {
  if (!value) return "";
  return String(value).trim().toLowerCase();
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const paymentStatus = normalizeStatus(
      req.body.payment_status || req.body.paymentStatus
    );

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment status. Allowed values: unpaid, pending, paid, partially_paid, rejected, refunded.",
      });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id, payment_status FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    await db.promise().query(
      `UPDATE bookings SET payment_status = ? WHERE id = ?`,
      [paymentStatus, bookingId]
    );

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
    });
  } catch (error) {
    console.error("updatePaymentStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating payment status.",
      error: error.message,
    });
  }
};

exports.markPaymentAsPaid = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    if (!bookingId || Number.isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id, payment_status FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    await db.promise().query(
      `UPDATE bookings SET payment_status = 'paid' WHERE id = ?`,
      [bookingId]
    );

    return res.status(200).json({
      success: true,
      message: "Booking marked as fully paid.",
    });
  } catch (error) {
    console.error("markPaymentAsPaid error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while marking payment as paid.",
      error: error.message,
    });
  }
};