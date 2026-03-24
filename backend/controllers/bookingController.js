const db = require("../config/db");

const createBooking = (req, res) => {
  const { user_id, room_id, check_in, check_out, guests } = req.body;

  if (!user_id || !room_id || !check_in || !check_out || !guests) {
    return res.status(400).json({ message: "All booking fields are required" });
  }

  const guestCount = Number(guests);

  if (Number.isNaN(guestCount) || guestCount < 1) {
    return res.status(400).json({ message: "Guest count must be at least 1." });
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
        AND status NOT IN ('rejected', 'cancelled')
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

      const insertSql = `
        INSERT INTO bookings (user_id, room_id, check_in, check_out, guests)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [user_id, room_id, check_in, check_out, guestCount],
        (insertErr) => {
          if (insertErr) {
            console.error(insertErr);
            return res.status(500).json({ message: "Booking failed" });
          }

          res.status(201).json({ message: "Booking submitted successfully" });
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
      bookings.check_in,
      bookings.check_out,
      bookings.guests,
      bookings.status,
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
  const statsSql = `
    SELECT
      (SELECT COUNT(*) FROM rooms) AS total_rooms,
      (SELECT COUNT(*) FROM bookings) AS total_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pending_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'approved') AS approved_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled') AS cancelled_bookings
  `;

  db.query(statsSql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch booking statistics" });
    }

    res.status(200).json(result[0]);
  });
};

const getUserBookings = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT 
      bookings.id,
      bookings.user_id,
      rooms.room_name,
      bookings.check_in,
      bookings.check_out,
      bookings.guests,
      bookings.status,
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

const updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const allowedStatuses = ["pending", "approved", "rejected", "cancelled"];

  if (!allowedStatuses.includes(String(status).toLowerCase())) {
    return res.status(400).json({ message: "Invalid booking status." });
  }

  const sql = "UPDATE bookings SET status = ? WHERE id = ?";

  db.query(sql, [String(status).toLowerCase(), id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to update booking status" });
    }

    res.status(200).json({ message: "Booking status updated successfully" });
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

    if (booking.status !== "pending") {
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
  getUserBookings,
  updateBookingStatus,
  cancelBookingByCustomer,
};