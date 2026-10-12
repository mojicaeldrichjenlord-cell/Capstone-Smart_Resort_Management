// ======================================================
// backend/routes/roomRoutes.js
// No changes needed for amenities.
// Existing POST /rooms and PUT /rooms/:id routes will work
// once roomController.js is updated to include req.body.amenities.
// ======================================================


const express = require("express");
const router = express.Router();
const { requireAdminAuth } = require("../middleware/adminAuth");

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
