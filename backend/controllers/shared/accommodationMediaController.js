// SMART RESORT BOOKING SYSTEM - Accommodation photo upload/storage
// Admin uploads images from a file picker; the bytes are stored in MySQL.
// Unlike an uploads/ folder, MySQL survives Render instance redeploys.
// Requires the one-time migration in backend/sql/accommodation_media.sql.

const db = require("../../config/db");

// Shared, dependency-free validation also powers the unit tests.
const {
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_PICK,
  detectImageMime,
  validMediaId
} = require("../../utils/accommodationMediaValidation");

// POST /api/rooms/media (signed administrator session required).
async function uploadAccommodationImage(req, res) {
  const file = req.file;
  if (!file || !file.buffer) {
    return res.status(400).json({ message: "Choose a JPEG, PNG, or WebP photo." });
  }
  if (file.size < 100 || file.size > MAX_IMAGE_BYTES) {
    return res.status(400).json({ message: "Photo must be between 100 bytes and 3 MB." });
  }
  const mime = detectImageMime(file.buffer);
  if (!mime) {
    return res.status(415).json({ message: "Only JPEG, PNG and WebP photos are supported." });
  }

  try {
    const [result] = await db.promise().query(
      "INSERT INTO accommodation_media (mime_type, image_data) VALUES (?, ?)",
      [mime, file.buffer]
    );
    // Store this relative URL in existing accommodations.image / room_gallery.image_url.
    // Customer/admin resolve it against the configured backend API_BASE.
    return res.status(201).json({
      success: true,
      path: "/api/rooms/media/" + result.insertId
    });
  } catch (error) {
    console.error("uploadAccommodationImage:", error.code || error.message);
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        message: "Photo storage is not initialized. Apply accommodation_media.sql first."
      });
    }
    return res.status(500).json({ message: "Could not save photo. Please retry." });
  }
}

// GET /api/rooms/media/:mediaId - public because accommodation photos are public.
// It returns only MIME type + image bytes, never raw DB metadata or credentials.
async function getAccommodationImage(req, res) {
  if (!validMediaId(req.params.mediaId)) {
    return res.status(400).send("Invalid photo ID");
  }
  try {
    const [rows] = await db.promise().query(
      "SELECT mime_type, image_data FROM accommodation_media WHERE id = ? LIMIT 1",
      [req.params.mediaId]
    );
    if (!rows.length) return res.status(404).send("Photo not found");
    res.set({
      "Content-Type": rows[0].mime_type,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=604800, immutable"
    });
    return res.send(rows[0].image_data);
  } catch (error) {
    console.error("getAccommodationImage:", error.code || error.message);
    return res.status(503).send("Photo unavailable");
  }
}

module.exports = {
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_PICK,
  detectImageMime,
  validMediaId,
  uploadAccommodationImage,
  getAccommodationImage
};
