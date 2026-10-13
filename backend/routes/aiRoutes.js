const express = require("express");
const router = express.Router();

const {
  chatWithGemini,
  translateReplyToTagalog,
  translateReplyToEnglish,
  translateReplyToTaglish,
} = require("../controllers/ai/geminiChatController");

// Bound user-controlled prompt size before it reaches Gemini. It protects
// free-tier usage and future paid bills without truncating booking details.
function limitAiPayload(kind) {
  return (req, res, next) => {
    const body = req.body || {};
    const input = kind === "chat" ? body.message : body.text;
    const allowedTextLength = kind === "chat" ? 2000 : 6000;
    // Include stored context because it is also sent into Gemini prompts.
    const serialized = JSON.stringify(body);
    if (String(input || "").length > allowedTextLength ||
        serialized.length > 12000) {
      return res.status(413).json({
        success: false,
        code: "AI_INPUT_TOO_LONG",
        message: kind === "chat"
          ? "Your message is too long. Please shorten it and try again."
          : "The text is too long to translate. Please shorten it.",
      });
    }
    return next();
  };
}
router.post("/chat", limitAiPayload("chat"), chatWithGemini);
// Legacy endpoint used an obsolete bookings table and trusted user_id from
// the request. Disable direct AI writes: customer reservations must use the
// signed /api/bookings flow with final price/slot/conflict validation.
router.post("/create-booking", (_req, res) =>
  res.status(410).json({
    success: false,
    message: "AI direct booking has been retired. Continue to the secure Customer reservation page to select a slot, review prices and confirm payment.",
  }),
);
router.post("/translate", limitAiPayload("translation"), translateReplyToTagalog);
router.post("/translate-english", limitAiPayload("translation"), translateReplyToEnglish);
router.post("/translate-taglish", limitAiPayload("translation"), translateReplyToTaglish);

module.exports = router;