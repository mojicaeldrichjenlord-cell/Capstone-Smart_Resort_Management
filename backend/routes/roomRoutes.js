const express = require("express");
const router = express.Router();
const {
  getAllRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");

router.get("/", getAllRooms);
router.post("/", addRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

module.exports = router;