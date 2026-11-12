// ======================================================
// backend/routes/roomRoutes.js
// No changes needed for amenities.
// Existing POST /rooms and PUT /rooms/:id routes will work
// once roomController.js is updated to include req.body.amenities.
// ======================================================


const express = require("express");
const router = express.Router();
const { requireAdminAuth } = require("../middleware/adminAuth");
const multer = require("multer");
const {
  MAX_IMAGE_BYTES, uploadAccommodationImage, getAccommodationImage
} = require("../controllers/shared/accommodationMediaController");

// Store photo bytes only in memory until the controller writes them to MySQL.
// Never rely on Render's ephemeral disk for permanent customer-facing photos.
const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 0 }
}).single("image");

function receivePhoto(req, res, next) {
  uploadPhoto(req, res, error => {
    if (error) {
      return res.status(400).json({
        message: error.code === "LIMIT_FILE_SIZE"
          ? "Photo is too large (maximum 3 MB)."
          : "Invalid photo upload. Select one JPEG, PNG or WebP photo."
      });
    }
    next();
  });
}

const {
  getAccommodationCategories,
  createAccommodationCategory,
  getAllRooms,
  getAvailableRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  seedDefaultAccommodations,
} = require("../controllers/shared/roomController");

// Place static media routes before /:id room routes.
router.post("/media", requireAdminAuth, receivePhoto, uploadAccommodationImage);
router.get("/media/:mediaId", getAccommodationImage);

router.get("/categories", getAccommodationCategories);
router.post("/categories", requireAdminAuth, createAccommodationCategory);
router.post("/seed-defaults", requireAdminAuth, seedDefaultAccommodations);

router.get("/", getAllRooms);
router.get("/available", getAvailableRooms);
router.get("/:id", getRoomById);
router.post("/", requireAdminAuth, createRoom);
router.put("/:id", requireAdminAuth, updateRoom);
router.delete("/:id", requireAdminAuth, deleteRoom);

module.exports = router;
