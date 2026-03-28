const db = require("../config/db");

exports.getAllRooms = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        id,
        room_name,
        description,
        price,
        capacity,
        bed_count,
        bed_type,
        view_type,
        aircon_type,
        amenities,
        image,
        status
      FROM rooms
      ORDER BY id DESC
    `);

    return res.status(200).json({
      success: true,
      rooms: rows,
    });
  } catch (error) {
    console.error("getAllRooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rooms.",
      error: error.message,
    });
  }
};

exports.getAvailableRooms = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        id,
        room_name,
        description,
        price,
        capacity,
        bed_count,
        bed_type,
        view_type,
        aircon_type,
        amenities,
        image,
        status
      FROM rooms
      WHERE status = 'available'
      ORDER BY id DESC
    `);

    return res.status(200).json({
      success: true,
      rooms: rows,
    });
  } catch (error) {
    console.error("getAvailableRooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available rooms.",
      error: error.message,
    });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;

    const [rows] = await db.promise().query(
      `
      SELECT
        id,
        room_name,
        description,
        price,
        capacity,
        bed_count,
        bed_type,
        view_type,
        aircon_type,
        amenities,
        image,
        status
      FROM rooms
      WHERE id = ?
      LIMIT 1
      `,
      [roomId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    return res.status(200).json({
      success: true,
      room: rows[0],
    });
  } catch (error) {
    console.error("getRoomById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch room.",
      error: error.message,
    });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const {
      room_name,
      description,
      price,
      capacity,
      bed_count,
      bed_type,
      view_type,
      aircon_type,
      amenities,
      image,
      status,
    } = req.body;

    if (
      !room_name ||
      !description ||
      !price ||
      !capacity ||
      !bed_count ||
      !bed_type ||
      !view_type ||
      !aircon_type ||
      !amenities ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all room fields.",
      });
    }

    await db.promise().query(
      `
      INSERT INTO rooms
      (room_name, description, price, capacity, bed_count, bed_type, view_type, aircon_type, amenities, image, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        room_name,
        description,
        Number(price),
        Number(capacity),
        Number(bed_count),
        bed_type,
        view_type,
        aircon_type,
        amenities,
        image || "",
        status,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Room added successfully.",
    });
  } catch (error) {
    console.error("createRoom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add room.",
      error: error.message,
    });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const {
      room_name,
      description,
      price,
      capacity,
      bed_count,
      bed_type,
      view_type,
      aircon_type,
      amenities,
      image,
      status,
    } = req.body;

    if (
      !room_name ||
      !description ||
      !price ||
      !capacity ||
      !bed_count ||
      !bed_type ||
      !view_type ||
      !aircon_type ||
      !amenities ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all room fields.",
      });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id FROM rooms WHERE id = ?`,
      [roomId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    await db.promise().query(
      `
      UPDATE rooms
      SET
        room_name = ?,
        description = ?,
        price = ?,
        capacity = ?,
        bed_count = ?,
        bed_type = ?,
        view_type = ?,
        aircon_type = ?,
        amenities = ?,
        image = ?,
        status = ?
      WHERE id = ?
      `,
      [
        room_name,
        description,
        Number(price),
        Number(capacity),
        Number(bed_count),
        bed_type,
        view_type,
        aircon_type,
        amenities,
        image || "",
        status,
        roomId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Room updated successfully.",
    });
  } catch (error) {
    console.error("updateRoom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update room.",
      error: error.message,
    });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;

    const [existingRows] = await db.promise().query(
      `SELECT id FROM rooms WHERE id = ?`,
      [roomId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    const [bookingRows] = await db.promise().query(
      `SELECT id FROM bookings WHERE room_id = ? LIMIT 1`,
      [roomId]
    );

    if (bookingRows.length > 0) {
      await db.promise().query(
        `UPDATE rooms SET status = 'unavailable' WHERE id = ?`,
        [roomId]
      );

      return res.status(200).json({
        success: true,
        message: "Room has bookings, so it was set to unavailable instead of deleting.",
      });
    }

    await db.promise().query(`DELETE FROM rooms WHERE id = ?`, [roomId]);

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully.",
    });
  } catch (error) {
    console.error("deleteRoom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete room.",
      error: error.message,
    });
  }
};