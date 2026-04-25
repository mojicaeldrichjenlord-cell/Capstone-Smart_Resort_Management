const db = require("../config/db");

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeNullableText(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

async function getCategoryIdByName(categoryName) {
  const [rows] = await db.promise().query(
    `SELECT id FROM accommodation_categories WHERE name = ? LIMIT 1`,
    [categoryName]
  );
  return rows.length ? rows[0].id : null;
}

exports.getAccommodationCategories = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT id, name, description, created_at
      FROM accommodation_categories
      ORDER BY name ASC
    `);

    return res.status(200).json({
      success: true,
      categories: rows,
    });
  } catch (error) {
    console.error("getAccommodationCategories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch accommodation categories.",
      error: error.message,
    });
  }
};

exports.createAccommodationCategory = async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const description = normalizeNullableText(req.body.description);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id FROM accommodation_categories WHERE name = ? LIMIT 1`,
      [name]
    );

    if (existingRows.length) {
      return res.status(400).json({
        success: false,
        message: "Category already exists.",
      });
    }

    const [result] = await db.promise().query(
      `
      INSERT INTO accommodation_categories (name, description)
      VALUES (?, ?)
      `,
      [name, description]
    );

    return res.status(201).json({
      success: true,
      message: "Accommodation category added successfully.",
      categoryId: result.insertId,
    });
  } catch (error) {
    console.error("createAccommodationCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create accommodation category.",
      error: error.message,
    });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        a.id,
        a.category_id,
        c.name AS category_name,
        a.name,
        a.description,
        a.max_capacity,
        a.free_entrance_pax,
        a.image,
        a.map_label,
        a.status,
        a.day_price,
        a.overnight_price,
        a.extended_price,
        a.day_start_time,
        a.day_end_time,
        a.overnight_start_time,
        a.overnight_end_time,
        a.extended_start_time,
        a.extended_end_time,
        a.created_at,
        a.updated_at
      FROM accommodations a
      INNER JOIN accommodation_categories c ON a.category_id = c.id
      ORDER BY a.id DESC
    `);

    return res.status(200).json({
      success: true,
      rooms: rows,
    });
  } catch (error) {
    console.error("getAllRooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch accommodations.",
      error: error.message,
    });
  }
};

exports.getAvailableRooms = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        a.id,
        a.category_id,
        c.name AS category_name,
        a.name,
        a.description,
        a.max_capacity,
        a.free_entrance_pax,
        a.image,
        a.map_label,
        a.status,
        a.day_price,
        a.overnight_price,
        a.extended_price,
        a.day_start_time,
        a.day_end_time,
        a.overnight_start_time,
        a.overnight_end_time,
        a.extended_start_time,
        a.extended_end_time,
        a.created_at,
        a.updated_at
      FROM accommodations a
      INNER JOIN accommodation_categories c ON a.category_id = c.id
      WHERE a.status = 'available'
      ORDER BY a.id DESC
    `);

    return res.status(200).json({
      success: true,
      rooms: rows,
    });
  } catch (error) {
    console.error("getAvailableRooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available accommodations.",
      error: error.message,
    });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const accommodationId = req.params.id;

    const [rows] = await db.promise().query(
      `
      SELECT
        a.id,
        a.category_id,
        c.name AS category_name,
        a.name,
        a.description,
        a.max_capacity,
        a.free_entrance_pax,
        a.image,
        a.map_label,
        a.status,
        a.day_price,
        a.overnight_price,
        a.extended_price,
        a.day_start_time,
        a.day_end_time,
        a.overnight_start_time,
        a.overnight_end_time,
        a.extended_start_time,
        a.extended_end_time,
        a.created_at,
        a.updated_at
      FROM accommodations a
      INNER JOIN accommodation_categories c ON a.category_id = c.id
      WHERE a.id = ?
      LIMIT 1
      `,
      [accommodationId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found.",
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
      message: "Failed to fetch accommodation.",
      error: error.message,
    });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const category_id = toNumber(req.body.category_id, 0);
    const name = normalizeText(req.body.name);
    const description = normalizeNullableText(req.body.description);
    const max_capacity = toNumber(req.body.max_capacity, 0);
    const free_entrance_pax = toNumber(req.body.free_entrance_pax, 0);
    const image = normalizeNullableText(req.body.image);
    const map_label = normalizeNullableText(req.body.map_label);
    const status = normalizeText(req.body.status || "available");

    const day_price = toNumber(req.body.day_price, 0);
    const overnight_price = toNumber(req.body.overnight_price, 0);
    const extended_price = toNumber(req.body.extended_price, 0);

    const day_start_time = normalizeNullableText(req.body.day_start_time);
    const day_end_time = normalizeNullableText(req.body.day_end_time);
    const overnight_start_time = normalizeNullableText(req.body.overnight_start_time);
    const overnight_end_time = normalizeNullableText(req.body.overnight_end_time);
    const extended_start_time = normalizeNullableText(req.body.extended_start_time);
    const extended_end_time = normalizeNullableText(req.body.extended_end_time);

    if (!category_id || !name || !status) {
      return res.status(400).json({
        success: false,
        message: "Category, accommodation name, and status are required.",
      });
    }

    const [categoryRows] = await db.promise().query(
      `SELECT id FROM accommodation_categories WHERE id = ? LIMIT 1`,
      [category_id]
    );

    if (!categoryRows.length) {
      return res.status(400).json({
        success: false,
        message: "Selected category does not exist.",
      });
    }

    const [result] = await db.promise().query(
      `
      INSERT INTO accommodations (
        category_id,
        name,
        description,
        max_capacity,
        free_entrance_pax,
        image,
        map_label,
        status,
        day_price,
        overnight_price,
        extended_price,
        day_start_time,
        day_end_time,
        overnight_start_time,
        overnight_end_time,
        extended_start_time,
        extended_end_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        category_id,
        name,
        description,
        max_capacity,
        free_entrance_pax,
        image,
        map_label,
        status,
        day_price,
        overnight_price,
        extended_price,
        day_start_time,
        day_end_time,
        overnight_start_time,
        overnight_end_time,
        extended_start_time,
        extended_end_time,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Accommodation added successfully.",
      roomId: result.insertId,
    });
  } catch (error) {
    console.error("createRoom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add accommodation.",
      error: error.message,
    });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const accommodationId = req.params.id;

    const category_id = toNumber(req.body.category_id, 0);
    const name = normalizeText(req.body.name);
    const description = normalizeNullableText(req.body.description);
    const max_capacity = toNumber(req.body.max_capacity, 0);
    const free_entrance_pax = toNumber(req.body.free_entrance_pax, 0);
    const image = normalizeNullableText(req.body.image);
    const map_label = normalizeNullableText(req.body.map_label);
    const status = normalizeText(req.body.status || "available");

    const day_price = toNumber(req.body.day_price, 0);
    const overnight_price = toNumber(req.body.overnight_price, 0);
    const extended_price = toNumber(req.body.extended_price, 0);

    const day_start_time = normalizeNullableText(req.body.day_start_time);
    const day_end_time = normalizeNullableText(req.body.day_end_time);
    const overnight_start_time = normalizeNullableText(req.body.overnight_start_time);
    const overnight_end_time = normalizeNullableText(req.body.overnight_end_time);
    const extended_start_time = normalizeNullableText(req.body.extended_start_time);
    const extended_end_time = normalizeNullableText(req.body.extended_end_time);

    if (!category_id || !name || !status) {
      return res.status(400).json({
        success: false,
        message: "Category, accommodation name, and status are required.",
      });
    }

    const [existingRows] = await db.promise().query(
      `SELECT id FROM accommodations WHERE id = ? LIMIT 1`,
      [accommodationId]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found.",
      });
    }

    const [categoryRows] = await db.promise().query(
      `SELECT id FROM accommodation_categories WHERE id = ? LIMIT 1`,
      [category_id]
    );

    if (!categoryRows.length) {
      return res.status(400).json({
        success: false,
        message: "Selected category does not exist.",
      });
    }

    await db.promise().query(
      `
      UPDATE accommodations
      SET
        category_id = ?,
        name = ?,
        description = ?,
        max_capacity = ?,
        free_entrance_pax = ?,
        image = ?,
        map_label = ?,
        status = ?,
        day_price = ?,
        overnight_price = ?,
        extended_price = ?,
        day_start_time = ?,
        day_end_time = ?,
        overnight_start_time = ?,
        overnight_end_time = ?,
        extended_start_time = ?,
        extended_end_time = ?
      WHERE id = ?
      `,
      [
        category_id,
        name,
        description,
        max_capacity,
        free_entrance_pax,
        image,
        map_label,
        status,
        day_price,
        overnight_price,
        extended_price,
        day_start_time,
        day_end_time,
        overnight_start_time,
        overnight_end_time,
        extended_start_time,
        extended_end_time,
        accommodationId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Accommodation updated successfully.",
    });
  } catch (error) {
    console.error("updateRoom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update accommodation.",
      error: error.message,
    });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const accommodationId = req.params.id;

    const [existingRows] = await db.promise().query(
      `SELECT id FROM accommodations WHERE id = ? LIMIT 1`,
      [accommodationId]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Accommodation not found.",
      });
    }

    const [reservationItemRows] = await db.promise().query(
      `SELECT id FROM reservation_items WHERE accommodation_id = ? LIMIT 1`,
      [accommodationId]
    );

    if (reservationItemRows.length > 0) {
      await db.promise().query(
        `UPDATE accommodations SET status = 'unavailable' WHERE id = ?`,
        [accommodationId]
      );

      return res.status(200).json({
        success: true,
        message: "Accommodation has reservation history, so it was set to unavailable instead of deleting.",
      });
    }

    await db.promise().query(`DELETE FROM accommodations WHERE id = ?`, [accommodationId]);

    return res.status(200).json({
      success: true,
      message: "Accommodation deleted successfully.",
    });
  } catch (error) {
    console.error("deleteRoom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete accommodation.",
      error: error.message,
    });
  }
};

exports.seedDefaultAccommodations = async (req, res) => {
  try {
    const cottageId = await getCategoryIdByName("Cottage");
    const roomId = await getCategoryIdByName("Room");
    const functionAreaId = await getCategoryIdByName("Function Area");

    if (!cottageId || !roomId || !functionAreaId) {
      return res.status(400).json({
        success: false,
        message: "Default categories are missing. Please make sure the SQL inserts for categories were added.",
      });
    }

    const defaults = [
      {
        category_id: cottageId,
        name: "Small Nipa Hut",
        description: "Default cottage accommodation",
        max_capacity: 10,
        free_entrance_pax: 0,
        image: "",
        map_label: "Cottage Area A",
        status: "available",
        day_price: 2500,
        overnight_price: 3000,
        extended_price: 4000,
        day_start_time: "06:00:00",
        day_end_time: "17:00:00",
        overnight_start_time: "18:00:00",
        overnight_end_time: "05:00:00",
        extended_start_time: "06:00:00",
        extended_end_time: "05:00:00",
      },
      {
        category_id: roomId,
        name: "Standard Room",
        description: "Default room accommodation",
        max_capacity: 4,
        free_entrance_pax: 2,
        image: "",
        map_label: "Room Wing A",
        status: "available",
        day_price: 3500,
        overnight_price: 4500,
        extended_price: 5500,
        day_start_time: "07:00:00",
        day_end_time: "17:00:00",
        overnight_start_time: "19:00:00",
        overnight_end_time: "05:00:00",
        extended_start_time: "07:00:00",
        extended_end_time: "05:00:00",
      },
      {
        category_id: functionAreaId,
        name: "Pavillion A",
        description: "Default function area accommodation",
        max_capacity: 30,
        free_entrance_pax: 0,
        image: "",
        map_label: "Function Area Zone",
        status: "available",
        day_price: 5000,
        overnight_price: 6500,
        extended_price: 8000,
        day_start_time: "06:00:00",
        day_end_time: "17:00:00",
        overnight_start_time: "18:00:00",
        overnight_end_time: "05:00:00",
        extended_start_time: "06:00:00",
        extended_end_time: "05:00:00",
      },
    ];

    let insertedCount = 0;

    for (const item of defaults) {
      const [existingRows] = await db.promise().query(
        `SELECT id FROM accommodations WHERE name = ? LIMIT 1`,
        [item.name]
      );

      if (existingRows.length) continue;

      await db.promise().query(
        `
        INSERT INTO accommodations (
          category_id,
          name,
          description,
          max_capacity,
          free_entrance_pax,
          image,
          map_label,
          status,
          day_price,
          overnight_price,
          extended_price,
          day_start_time,
          day_end_time,
          overnight_start_time,
          overnight_end_time,
          extended_start_time,
          extended_end_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          item.category_id,
          item.name,
          item.description,
          item.max_capacity,
          item.free_entrance_pax,
          item.image,
          item.map_label,
          item.status,
          item.day_price,
          item.overnight_price,
          item.extended_price,
          item.day_start_time,
          item.day_end_time,
          item.overnight_start_time,
          item.overnight_end_time,
          item.extended_start_time,
          item.extended_end_time,
        ]
      );

      insertedCount++;
    }

    return res.status(200).json({
      success: true,
      message: insertedCount
        ? `Default accommodations seeded successfully. Added ${insertedCount} item(s).`
        : "Default accommodations already exist.",
    });
  } catch (error) {
    console.error("seedDefaultAccommodations error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to seed default accommodations.",
      error: error.message,
    });
  }
};