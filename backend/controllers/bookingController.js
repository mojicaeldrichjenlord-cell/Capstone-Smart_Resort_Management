const db = require("../config/db");

const createBooking = (req, res) => {
  const { user_id, room_id, check_in, check_out, guests, payment_method } = req.body;

  if (!user_id || !room_id || !check_in || !check_out || !guests || !payment_method) {
    return res.status(400).json({ message: "All booking fields are required" });
  }

  const guestCount = Number(guests);
  const normalizedPaymentMethod = String(payment_method).trim().toLowerCase();
  const allowedPaymentMethods = ["cash", "paypal"];

  if (Number.isNaN(guestCount) || guestCount < 1) {
    return res.status(400).json({ message: "Guest count must be at least 1." });
  }

  if (!allowedPaymentMethods.includes(normalizedPaymentMethod)) {
    return res.status(400).json({ message: "Invalid payment method." });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return res.status(400).json({ message: "Invalid booking dates." });
  }

  checkInDate.setHours(0, 0, 0, 0);
  checkOutDate.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    return res.status(400).json({ message: "Check-in date cannot be in the past." });
  }

  if (checkOutDate <= checkInDate) {
    return res.status(400).json({
      message: "Check-out date must be at least one day after check-in.",
    });
  }

  const roomSql = "SELECT * FROM rooms WHERE id = ? LIMIT 1";

  db.query(roomSql, [room_id], (roomErr, roomResult) => {
    if (roomErr) {
      console.error(roomErr);
      return res.status(500).json({ message: "Failed to validate room." });
    }

    if (roomResult.length === 0) {
      return res.status(404).json({ message: "Selected room was not found." });
    }

    const room = roomResult[0];

    if (room.status !== "available") {
      return res.status(400).json({ message: "This room is not available for booking." });
    }

    if (guestCount > Number(room.capacity)) {
      return res.status(400).json({
        message: `This room can only accommodate up to ${room.capacity} guests.`,
      });
    }

    const conflictSql = `
      SELECT id
      FROM bookings
      WHERE room_id = ?
        AND LOWER(COALESCE(NULLIF(status, ''), 'pending')) NOT IN ('rejected', 'cancelled')
        AND check_in < ?
        AND check_out > ?
      LIMIT 1
    `;

    db.query(conflictSql, [room_id, check_out, check_in], (conflictErr, conflictResult) => {
      if (conflictErr) {
        console.error(conflictErr);
        return res.status(500).json({ message: "Failed to validate booking schedule." });
      }

      if (conflictResult.length > 0) {
        return res.status(400).json({
          message: "This room is already booked for the selected dates.",
        });
      }

      const paymentStatus =
        normalizedPaymentMethod === "paypal" ? "pending online payment" : "pending";

      const insertSql = `
        INSERT INTO bookings (
          user_id,
          room_id,
          check_in,
          check_out,
          guests,
          status,
          payment_method,
          payment_status
        )
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
      `;

      db.query(
        insertSql,
        [
          user_id,
          room_id,
          check_in,
          check_out,
          guestCount,
          normalizedPaymentMethod,
          paymentStatus,
        ],
        (insertErr, insertResult) => {
          if (insertErr) {
            console.error(insertErr);
            return res.status(500).json({ message: "Booking failed" });
          }

          res.status(201).json({
            message: "Booking submitted successfully",
            bookingId: insertResult.insertId,
          });
        }
      );
    });
  });
};

const getAllBookings = (req, res) => {
  const sql = `
    SELECT 
      bookings.id,
      bookings.user_id,
      users.fullname,
      users.email,
      rooms.room_name,
      rooms.price,
      bookings.check_in,
      bookings.check_out,
      bookings.guests,
      LOWER(COALESCE(NULLIF(bookings.status, ''), 'pending')) AS status,
      LOWER(COALESCE(NULLIF(bookings.payment_method, ''), 'cash')) AS payment_method,
      COALESCE(NULLIF(bookings.payment_status, ''), 'pending') AS payment_status,
      bookings.created_at
    FROM bookings
    INNER JOIN users ON bookings.user_id = users.id
    INNER JOIN rooms ON bookings.room_id = rooms.id
    ORDER BY bookings.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch bookings" });
    }

    res.status(200).json(result);
  });
};

const getBookingStats = (req, res) => {
  const { startDate, endDate } = req.query;

  let dateFilter = "";
  const params = [];

  if (startDate && endDate) {
    dateFilter = " WHERE DATE(created_at) BETWEEN ? AND ? ";
    params.push(startDate, endDate);
  } else if (startDate) {
    dateFilter = " WHERE DATE(created_at) >= ? ";
    params.push(startDate);
  } else if (endDate) {
    dateFilter = " WHERE DATE(created_at) <= ? ";
    params.push(endDate);
  }

  const statsSql = `
    SELECT
      (SELECT COUNT(*) FROM rooms) AS total_rooms,
      (SELECT COUNT(*) FROM bookings ${dateFilter}) AS total_bookings,
      (SELECT COUNT(*) FROM bookings ${dateFilter}${dateFilter ? " AND " : " WHERE "}LOWER(COALESCE(NULLIF(status, ''), 'pending')) = 'pending') AS pending_bookings,
      (SELECT COUNT(*) FROM bookings ${dateFilter}${dateFilter ? " AND " : " WHERE "}LOWER(COALESCE(NULLIF(status, ''), 'pending')) = 'approved') AS approved_bookings,
      (SELECT COUNT(*) FROM bookings ${dateFilter}${dateFilter ? " AND " : " WHERE "}LOWER(COALESCE(NULLIF(status, ''), 'pending')) = 'cancelled') AS cancelled_bookings,
      (SELECT COUNT(*) FROM bookings ${dateFilter}${dateFilter ? " AND " : " WHERE "}LOWER(COALESCE(NULLIF(status, ''), 'pending')) = 'completed') AS completed_bookings
  `;

  const statsParams = [...params, ...params, ...params, ...params, ...params];

  db.query(statsSql, statsParams, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch booking statistics" });
    }

    res.status(200).json(result[0]);
  });
};

const getBookingAnalytics = (req, res) => {
  const { startDate, endDate } = req.query;

  let whereClause = "";
  const params = [];

  if (startDate && endDate) {
    whereClause = " WHERE DATE(bookings.created_at) BETWEEN ? AND ? ";
    params.push(startDate, endDate);
  } else if (startDate) {
    whereClause = " WHERE DATE(bookings.created_at) >= ? ";
    params.push(startDate);
  } else if (endDate) {
    whereClause = " WHERE DATE(bookings.created_at) <= ? ";
    params.push(endDate);
  }

  const statusSql = `
    SELECT
      LOWER(COALESCE(NULLIF(status, ''), 'pending')) AS status,
      COUNT(*) AS count
    FROM bookings
    ${whereClause}
    GROUP BY LOWER(COALESCE(NULLIF(status, ''), 'pending'))
    ORDER BY count DESC
  `;

  const roomSql = `
    SELECT
      rooms.room_name,
      COUNT(bookings.id) AS booking_count,
      COALESCE(SUM(bookings.guests), 0) AS total_guests
    FROM rooms
    LEFT JOIN bookings 
      ON rooms.id = bookings.room_id
      ${startDate && endDate ? "AND DATE(bookings.created_at) BETWEEN ? AND ?" : ""}
      ${startDate && !endDate ? "AND DATE(bookings.created_at) >= ?" : ""}
      ${!startDate && endDate ? "AND DATE(bookings.created_at) <= ?" : ""}
    GROUP BY rooms.id, rooms.room_name
    ORDER BY booking_count DESC, rooms.room_name ASC
  `;

  db.query(statusSql, params, (statusErr, statusResult) => {
    if (statusErr) {
      console.error(statusErr);
      return res.status(500).json({ message: "Failed to fetch booking status analytics." });
    }

    db.query(roomSql, params, (roomErr, roomResult) => {
      if (roomErr) {
        console.error(roomErr);
        return res.status(500).json({ message: "Failed to fetch room analytics." });
      }

      res.status(200).json({
        bookingStatusData: statusResult,
        roomBookingData: roomResult,
      });
    });
  });
};

const getUserBookings = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT 
      bookings.id,
      bookings.user_id,
      rooms.room_name,
      rooms.price,
      bookings.check_in,
      bookings.check_out,
      bookings.guests,
      LOWER(COALESCE(NULLIF(bookings.status, ''), 'pending')) AS status,
      LOWER(COALESCE(NULLIF(bookings.payment_method, ''), 'cash')) AS payment_method,
      COALESCE(NULLIF(bookings.payment_status, ''), 'pending') AS payment_status,
      bookings.created_at
    FROM bookings
    INNER JOIN rooms ON bookings.room_id = rooms.id
    WHERE bookings.user_id = ?
    ORDER BY bookings.id DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch user bookings" });
    }

    res.status(200).json(result);
  });
};

const getBookingById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      bookings.id,
      bookings.user_id,
      users.fullname,
      users.email,
      rooms.room_name,
      rooms.price,
      bookings.check_in,
      bookings.check_out,
      bookings.guests,
      LOWER(COALESCE(NULLIF(bookings.status, ''), 'pending')) AS status,
      LOWER(COALESCE(NULLIF(bookings.payment_method, ''), 'cash')) AS payment_method,
      COALESCE(NULLIF(bookings.payment_status, ''), 'pending') AS payment_status,
      bookings.created_at
    FROM bookings
    INNER JOIN users ON bookings.user_id = users.id
    INNER JOIN rooms ON bookings.room_id = rooms.id
    WHERE bookings.id = ?
    LIMIT 1
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch booking details." });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json(result[0]);
  });
};

const updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const normalizedStatus = String(status).trim().toLowerCase();
  const allowedStatuses = ["pending", "approved", "rejected", "cancelled", "completed"];

  if (!allowedStatuses.includes(normalizedStatus)) {
    return res.status(400).json({ message: "Invalid booking status." });
  }

  const sql = "UPDATE bookings SET status = ? WHERE id = ?";

  db.query(sql, [normalizedStatus, id], (err, result) => {
    if (err) {
      console.error("Update status error:", err);
      return res.status(500).json({ message: "Failed to update booking status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json({
      message: "Booking status updated successfully",
      updatedStatus: normalizedStatus,
    });
  });
};

const cancelBookingByCustomer = (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  const findSql = "SELECT * FROM bookings WHERE id = ? AND user_id = ? LIMIT 1";

  db.query(findSql, [id, user_id], (findErr, findResult) => {
    if (findErr) {
      console.error(findErr);
      return res.status(500).json({ message: "Failed to validate booking." });
    }

    if (findResult.length === 0) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const booking = findResult[0];
    const currentStatus = String(booking.status || "pending").toLowerCase();

    if (currentStatus !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be cancelled.",
      });
    }

    const updateSql = "UPDATE bookings SET status = 'cancelled' WHERE id = ? AND user_id = ?";

    db.query(updateSql, [id, user_id], (updateErr) => {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).json({ message: "Failed to cancel booking." });
      }

      res.status(200).json({ message: "Booking cancelled successfully." });
    });
  });
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingStats,
  getBookingAnalytics,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBookingByCustomer,
};