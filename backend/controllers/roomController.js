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

  const sql = "DELETE FROM rooms WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to delete room." });
    }

    res.status(200).json({ message: "Room deleted successfully." });
  });
};

module.exports = {
  getAllRooms,
  addRoom,
  updateRoom,
  deleteRoom,
};