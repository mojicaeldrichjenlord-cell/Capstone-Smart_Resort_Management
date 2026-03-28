const db = require("../config/db");

exports.createBooking = async (req, res) => {
  try {
    const {
      user_id,
      room_id,
      check_in,
      check_out,
      guests,
      payment_method,
      payment_status,
    } = req.body;

    if (
      !user_id ||
      !room_id ||
      !check_in ||
      !check_out ||
      !guests ||
      !payment_method
    ) {
      return res.status(400).json({
        message: "Please fill in all required booking fields.",
      });
    }

    const startDate = new Date(check_in);
    const endDate = new Date(check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return res.status(400).json({
        message: "Check-in date cannot be in the past.",
      });
    }

    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (nights < 1) {
      return res.status(400).json({
        message: "Check-out must be at least one day after check-in.",
      });
    }

    const [roomRows] = await db.promise().query(
      "SELECT * FROM rooms WHERE id = ? LIMIT 1",
      [room_id]
    );

    if (roomRows.length === 0) {
      return res.status(404).json({
        message: "Selected room not found.",
      });
    }

    const room = roomRows[0];

    if (String(room.status).toLowerCase() !== "available") {
      return res.status(400).json({
        message: "This room is currently unavailable.",
      });
    }

    if (Number(guests) > Number(room.capacity)) {
      return res.status(400).json({
        message: `This room can only accommodate up to ${room.capacity} guests.`,
      });
    }

    const [conflictRows] = await db.promise().query(
      `
      SELECT id
      FROM bookings
      WHERE room_id = ?
        AND status NOT IN ('cancelled', 'rejected')
        AND (? < check_out AND ? > check_in)
      `,
      [room_id, check_in, check_out]
    );

    if (conflictRows.length > 0) {
      return res.status(400).json({
        message: "This room is already booked for the selected dates.",
      });
    }

    const finalPaymentStatus =
      payment_status || (payment_method === "paypal" ? "pending" : "unpaid");

    const [result] = await db.promise().query(
      `
      INSERT INTO bookings
      (user_id, room_id, check_in, check_out, guests, status, payment_method, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        room_id,
        check_in,
        check_out,
        guests,
        "pending",
        payment_method,
        finalPaymentStatus,
      ]
    );

    return res.status(201).json({
      message: "Booking created successfully.",
      bookingId: result.insertId,
    });
  } catch (error) {
    console.error("createBooking error:", error);
    return res.status(500).json({
      message: "Failed to create booking.",
      error: error.message,
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.promise().query(
      `
      SELECT
        b.id,
        b.user_id,
        b.room_id,
        b.check_in,
        b.check_out,
        b.guests,
        b.status,
        b.created_at,
        b.payment_method,
        b.payment_status,
        r.room_name,
        r.price,
        r.image
      FROM bookings b
      INNER JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      bookings: rows,
    });
  } catch (error) {
    console.error("getUserBookings error:", error);
    return res.status(500).json({
      message: "Failed to fetch user bookings.",
      error: error.message,
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.promise().query(
      "SELECT * FROM bookings WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    const booking = rows[0];

    if (String(booking.status).toLowerCase() !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be cancelled.",
      });
    }

    await db.promise().query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      message: "Booking cancelled successfully.",
    });
  } catch (error) {
    console.error("cancelBooking error:", error);
    return res.status(500).json({
      message: "Failed to cancel booking.",
      error: error.message,
    });
  }
};

exports.getBookingReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.promise().query(
      `
      SELECT
        b.id,
        b.user_id,
        b.room_id,
        b.check_in,
        b.check_out,
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
        r.image
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      INNER JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Booking receipt not found.",
      });
    }

    return res.status(200).json({
      booking: rows[0],
    });
  } catch (error) {
    console.error("getBookingReceipt error:", error);
    return res.status(500).json({
      message: "Failed to load booking receipt.",
      error: error.message,
    });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `
      SELECT
        b.id,
        b.user_id,
        b.room_id,
        b.check_in,
        b.check_out,
        b.guests,
        b.status,
        b.created_at,
        b.payment_method,
        b.payment_status,
        u.fullname,
        u.email,
        u.phone,
        r.room_name,
        r.price
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      INNER JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
      `
    );

    return res.status(200).json({
      bookings: rows,
    });
  } catch (error) {
    console.error("getAllBookings error:", error);
    return res.status(500).json({
      message: "Failed to fetch all bookings.",
      error: error.message,
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
      "cancelled",
      "completed",
    ];

    if (!allowedStatuses.includes(String(status).toLowerCase())) {
      return res.status(400).json({
        message: "Invalid booking status.",
      });
    }

    const [rows] = await db.promise().query(
      "SELECT * FROM bookings WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    await db.promise().query(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, id]
    );

    return res.status(200).json({
      message: "Booking status updated successfully.",
    });
  } catch (error) {
    console.error("updateBookingStatus error:", error);
    return res.status(500).json({
      message: "Failed to update booking status.",
      error: error.message,
    });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const allowedPaymentStatuses = [
      "unpaid",
      "pending",
      "paid",
      "refunded",
    ];

    if (!allowedPaymentStatuses.includes(String(payment_status).toLowerCase())) {
      return res.status(400).json({
        message: "Invalid payment status.",
      });
    }

    const [rows] = await db.promise().query(
      "SELECT * FROM bookings WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    await db.promise().query(
      "UPDATE bookings SET payment_status = ? WHERE id = ?",
      [payment_status, id]
    );

    return res.status(200).json({
      message: "Payment status updated successfully.",
    });
  } catch (error) {
    console.error("updatePaymentStatus error:", error);
    return res.status(500).json({
      message: "Failed to update payment status.",
      error: error.message,
    });
  }
};