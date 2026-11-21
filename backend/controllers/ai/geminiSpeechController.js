// Cross-browser Customer voice transcription. Signed auth and AI rate guards
// are attached at the route. No audio recording is persisted or logged.
const { GoogleGenAI } = require("@google/genai");
const { generateGemini, geminiPublicError } = require("./geminiResilience");
const MAX_BYTES = 500 * 1024;

function createTranscribeVoice({
  generate = generateGemini,
  client = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }),
} = {}) {
  return async (req, res) => {
    res.set("Cache-Control", "no-store");
    const mime = String(req.get("content-type") || "").split(";")[0].toLowerCase();
    if (!["audio/wav", "audio/x-wav"].includes(mime)) {
      return res.status(415).json({ success: false, code: "VOICE_UNSUPPORTED_FORMAT",
        message: "Use the website microphone to record voice." });
    }
    const audio = req.body;
    if (!Buffer.isBuffer(audio) || audio.length < 44 || audio.length > MAX_BYTES ||
        audio.toString("ascii", 0, 4) !== "RIFF" ||
        audio.toString("ascii", 8, 12) !== "WAVE") {
      return res.status(400).json({ success: false, code: "VOICE_INVALID_AUDIO",
        message: "Invalid voice recording. Please try again." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ success: false, code: "VOICE_UNAVAILABLE",
        message: "Voice transcription is temporarily unavailable. Please type your message." });
    }
    try {
      // AI-44: The user no longer selects a voice language. Ask Gemini
      // to recognize the spoken language automatically, every turn.
      // No transcript translation and no preferred-language override.
      const prompt =
        "Detect the spoken language automatically and transcribe faithfully " +
        "in that same language and its natural writing system. " +
        "This may be English, Filipino, Taglish, Mandarin, Spanish or another language. " +
        "Never translate into English; preserve original words and meaningful code-switching. " +
        "The conversation is about Arvic Seaside Resort accommodations. " +
        "Relevant proper names include Pool Shade, Big Shade, Small Shade, " +
        "Nipa Hut, Pool Pavilion, Beach Pavilion, Family Room, Double Room, " +
        "Single Room Poolside, and the feature called an accommodation preview. " +
        "Do not change genuinely spoken words to fit these examples. " +
        "Output only the exact spoken words, not a reply, commentary or translation. " +
        "If there is no intelligible human speech, output exactly NO_SPEECH.";
      const answer = await generate(client(), [{ role: "user", parts: [
        { text: prompt },
        { inlineData: { mimeType: "audio/wav", data: audio.toString("base64") } },
      ] }]);
      const raw = String(answer?.text || "").trim();
      const transcript = /^(NO_SPEECH|NONE|\[silence\])\.?$/i.test(raw) ? "" : raw.slice(0, 1800);
      return res.status(200).json({ success: true, transcript });
    } catch (error) {
      const failure = geminiPublicError(error);
      console.warn("Voice transcription failed; status:", failure.status);
      return res.status(failure.status).json(failure.body);
    }
  };
}
module.exports = { createTranscribeVoice, transcribeVoice: createTranscribeVoice() };
