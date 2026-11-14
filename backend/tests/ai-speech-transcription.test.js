// Offline tests: no audio, real accounts, Google API, or DB are accessed.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createTranscribeVoice } = require("../controllers/ai/geminiSpeechController");
function request(body, mime = "audio/wav") {
  return { body, get() { return mime; } };
}
function wav() { const b = Buffer.alloc(64); b.write("RIFF"); b.write("WAVE", 8); return b; }
function response() {
  return { statusCode: 200, data: null, set() { return this; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; } };
}
test("WAV audio is transcribed with Gemini but never stored", async () => {
  const key = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-only";
  try {
    let requestParts;
    const handler = createTranscribeVoice({ client: () => ({}),
      generate: async (_ai, parts) => {
        requestParts = parts; return { text: "Can I book a cottage?" };
      } });
    const res = response(); await handler(request(wav()), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.transcript, "Can I book a cottage?");
    assert.equal(requestParts[0].parts[1].inlineData.mimeType, "audio/wav");
  } finally {
    if (key === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = key;
  }
});
test("Invalid format and audio are rejected before invoking Gemini", async () => {
  const handler = createTranscribeVoice({ generate: async () => {
    throw Error("should never call AI");
  } });
  for (const [body, mime] of [[wav(), "application/json"], [Buffer.from("abc"), "audio/wav"], [Buffer.alloc(512001), "audio/wav"]]) {
    const res = response(); await handler(request(body, mime), res);
    assert.ok([400, 415].includes(res.statusCode));
  }
});
test("No speech from Gemini returns empty transcript", async () => {
  const key = process.env.GEMINI_API_KEY; process.env.GEMINI_API_KEY = "test-only";
  try {
    const handler = createTranscribeVoice({ client: () => ({}),
      generate: async () => ({ text: "NO_SPEECH" }) });
    const res = response(); await handler(request(wav()), res);
    assert.equal(res.data.transcript, "");
  } finally {
    if (key === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = key;
  }
});
