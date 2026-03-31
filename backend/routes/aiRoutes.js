const express = require("express");
const router = express.Router();

const {
  chatWithGemini,
  createBookingFromChat,
  translateReplyToTagalog,
  translateReplyToTaglish,
} = require("../controllers/geminiChatController");

router.post("/chat", chatWithGemini);
router.post("/create-booking", createBookingFromChat);
router.post("/translate", translateReplyToTagalog);
router.post("/translate-taglish", translateReplyToTaglish);

module.exports = router;