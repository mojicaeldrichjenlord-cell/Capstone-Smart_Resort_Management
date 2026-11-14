const express = require("express");
const router = express.Router();
const { requireCustomerAuth } = require("../middleware/customerAuth");
const { requireAdminAuth } = require("../middleware/adminAuth");
const { getGeminiUsageSnapshot } = require("../controllers/ai/geminiResilience");
// Stage 85-A: throttle all Gemini-funded chat/translation endpoints.
const { aiRateGuard } = require("../middleware/aiRateLimit");
const { voiceStatus, speakBlessica } =
  require("../controllers/ai/azureSpeechController");
const { transcribeVoice } = require("../controllers/ai/geminiSpeechController");

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
router.post("/chat", limitAiPayload("chat"), aiRateGuard.middleware, chatWithGemini);
// Browser-independent Filipina voice. Paid Azure synthesis requires a real,
// signed-in customer token, so anonymous requests cannot consume Azure credits.
router.get("/voice/status", voiceStatus);
router.post("/voice", requireCustomerAuth, speakBlessica);
// Signed, rate-limited, raw short WAV upload, not the unbounded JSON parser.
router.post("/transcribe", requireCustomerAuth, aiRateGuard.middleware,
  express.raw({ type: ["audio/wav", "audio/x-wav"], limit: "500kb" }),
  transcribeVoice);
// Legacy endpoint used an obsolete bookings table and trusted user_id from
// the request. Disable direct AI writes: customer reservations must use the
// signed /api/bookings flow with final price/slot/conflict validation.
router.post("/create-booking", (_req, res) =>
  res.status(410).json({
    success: false,
    message: "AI direct booking has been retired. Continue to the secure Customer reservation page to select a slot, review prices and confirm payment.",
  }),
);
router.post("/translate", limitAiPayload("translation"), aiRateGuard.middleware, translateReplyToTagalog);
router.post("/translate-english", limitAiPayload("translation"), aiRateGuard.middleware, translateReplyToEnglish);
router.post("/translate-taglish", limitAiPayload("translation"), aiRateGuard.middleware, translateReplyToTaglish);

// Admin-only runtime telemetry: no prompts, guest messages, API keys, or IPs.
// Process-local counters RESET on restart; Google billing remains authoritative.
router.get("/usage", requireAdminAuth, (_req, res) => {
  res.set("Cache-Control", "no-store");
  return res.status(200).json({
    success: true,
    gemini: getGeminiUsageSnapshot(),
    rateLimits: aiRateGuard.snapshot(),
    warning: "Estimated spend and quotas are process-local and reset on server restart; confirm real usage in Google AI Studio billing.",
  });
});

module.exports = router;