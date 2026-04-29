const db = require("../config/db");

// GET ALL MARKERS
exports.getMarkers = (req, res) => {
  db.query("SELECT * FROM map_markers", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch markers" });
    }
    res.json(results);
  });
};

// CREATE MARKER
exports.createMarker = (req, res) => {
  const { name, type, color, info, x, y, room_id } = req.body;

  const sql = `
    INSERT INTO map_markers (name, type, color, info, x, y, room_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, type, color, info, x, y, room_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to create marker" });
    }

    res.json({ id: result.insertId });
  });
};

// UPDATE MARKER
exports.updateMarker = (req, res) => {
  const { id } = req.params;
  const { name, type, color, info, x, y, room_id } = req.body;

  const sql = `
    UPDATE map_markers
    SET name=?, type=?, color=?, info=?, x=?, y=?, room_id=?
    WHERE id=?
  `;

  db.query(
    sql,
    [name, type, color, info, x, y, room_id, id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update marker" });
      }

      res.json({ message: "Marker updated" });
    }
  );
};

// DELETE MARKER
exports.deleteMarker = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM map_markers WHERE id=?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to delete marker" });
    }

    res.json({ message: "Marker deleted" });
  });
};