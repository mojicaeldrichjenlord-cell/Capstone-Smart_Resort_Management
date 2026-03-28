const express = require("express");
const router = express.Router();

const {
  getAvailableRooms,
  recommendRooms,
  getRoomAlternativeDates,
} = require("../controllers/aiController");

const {
  chatWithGemini,
  createBookingFromChat,
} = require("../controllers/geminiChatController");

router.get("/available-rooms", getAvailableRooms);
router.post("/recommend-rooms", recommendRooms);
router.get("/room-alternative-dates/:roomId", getRoomAlternativeDates);
router.post("/chat", chatWithGemini);
router.post("/create-booking", createBookingFromChat);

module.exports = router;