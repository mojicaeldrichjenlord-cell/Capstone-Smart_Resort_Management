const db = require("../config/db");

const getAllRooms = (req, res) => {
  const sql = "SELECT * FROM rooms ORDER BY id ASC";

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch rooms" });
    }

    res.status(200).json(result);
  });
};

const addRoom = (req, res) => {
  const { room_name, description, price, capacity, image, status } = req.body;

  if (!room_name || !price || !capacity || !image || !status) {
    return res.status(400).json({ message: "Please fill in all required room fields." });
  }

  const sql = `
    INSERT INTO rooms (room_name, description, price, capacity, image, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [room_name, description || "", price, capacity, image, status],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to add room." });
      }

      res.status(201).json({ message: "Room added successfully." });
    }
  );
};

const updateRoom = (req, res) => {
  const { id } = req.params;
  const { room_name, description, price, capacity, image, status } = req.body;

  if (!room_name || !price || !capacity || !image || !status) {
    return res.status(400).json({ message: "Please fill in all required room fields." });
  }

  const sql = `
    UPDATE rooms
    SET room_name = ?, description = ?, price = ?, capacity = ?, image = ?, status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [room_name, description || "", price, capacity, image, status, id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update room." });
      }

      res.status(200).json({ message: "Room updated successfully." });
    }
  );
};

const deleteRoom = (req, res) => {
  const { id } = req.params;

  const checkBookingsSql = "SELECT COUNT(*) AS booking_count FROM bookings WHERE room_id = ?";

  db.query(checkBookingsSql, [id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({ message: "Failed to validate room bookings." });
    }

    const bookingCount = checkResult[0]?.booking_count || 0;

    if (bookingCount > 0) {
      const updateStatusSql = "UPDATE rooms SET status = 'unavailable' WHERE id = ?";

      db.query(updateStatusSql, [id], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json({
            message: "Room has bookings and could not be set to unavailable.",
          });
        }

        return res.status(200).json({
          message:
            "Room has existing bookings, so it was not deleted. Status was set to unavailable instead.",
        });
      });

      return;
    }

    const deleteSql = "DELETE FROM rooms WHERE id = ?";

    db.query(deleteSql, [id], (deleteErr) => {
      if (deleteErr) {
        console.error(deleteErr);
        return res.status(500).json({ message: "Failed to delete room." });
      }

      res.status(200).json({ message: "Room deleted successfully." });
    });
  });
};

module.exports = {
  getAllRooms,
  addRoom,
  updateRoom,
  deleteRoom,
};