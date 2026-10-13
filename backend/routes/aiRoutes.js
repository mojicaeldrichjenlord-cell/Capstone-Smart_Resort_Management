const express = require("express");
const router = express.Router();

const {
  chatWithGemini,
  translateReplyToTagalog,
  translateReplyToTaglish,
} = require("../controllers/ai/geminiChatController");

router.post("/chat", chatWithGemini);
// Legacy endpoint used an obsolete bookings table and trusted user_id from
// the request. Disable direct AI writes: customer reservations must use the
// signed /api/bookings flow with final price/slot/conflict validation.
router.post("/create-booking", (_req, res) =>
  res.status(410).json({
    success: false,
    message: "AI direct booking has been retired. Continue to the secure Customer reservation page to select a slot, review prices and confirm payment.",
  }),
);
router.post("/translate", translateReplyToTagalog);
router.post("/translate-taglish", translateReplyToTaglish);

module.exports = router;