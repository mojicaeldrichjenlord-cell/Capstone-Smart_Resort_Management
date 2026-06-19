// ======================================================
// backend/routes/roomRoutes.js
// No changes needed for amenities.
// Existing POST /rooms and PUT /rooms/:id routes will work
// once roomController.js is updated to include req.body.amenities.
// ======================================================


const express = require("express");
const router = express.Router();

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
} = require("../controllers/roomController");

router.get("/categories", getAccommodationCategories);
router.post("/categories", createAccommodationCategory);
router.post("/seed-defaults", seedDefaultAccommodations);

router.get("/", getAllRooms);
router.get("/available", getAvailableRooms);
router.get("/:id", getRoomById);
router.post("/", createRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

module.exports = router;