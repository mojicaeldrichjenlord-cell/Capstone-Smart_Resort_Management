// SMART RESORT BOOKING SYSTEM - MICRO TESTS FOR BLESSICA
// Run from backend: node --test tests/ai-blessica.test.js
// No network, Azure credentials, or paid requests are required.

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  escapeXml, voiceStatus, speakBlessica
} = require("../controllers/ai/azureSpeechController");

function fakeResponse() {
  return {
    statusCode: 200,
    headers: {},
    data: null,
    set(key, value) { this.headers[key] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.data = value; return this; }
  };
}

function temporarilyUnsetKeys(run) {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  delete process.env.AZURE_SPEECH_KEY;
  delete process.env.AZURE_SPEECH_REGION;
  try { return run(); } finally {
    if (key !== undefined) process.env.AZURE_SPEECH_KEY = key;
    if (region !== undefined) process.env.AZURE_SPEECH_REGION = region;
  }
}

test("Blessica XML escapes markup and ampersands", () => {
  assert.equal(
    escapeXml('Hello <visitor> & "welcome"'),
    "Hello &lt;visitor&gt; &amp; &quot;welcome&quot;"
  );
});

test("Cloud voice is disabled without Azure environment variables", () => {
  temporarilyUnsetKeys(() => {
    const res = fakeResponse();
    voiceStatus({}, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.enabled, false);
    assert.equal(res.data.voice, "fil-PH-BlessicaNeural");
    assert.equal(res.headers["Cache-Control"], "no-store");
  });
});

test("No Azure configuration refuses speech before any network call", async () => {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  delete process.env.AZURE_SPEECH_KEY;
  delete process.env.AZURE_SPEECH_REGION;
  try {
    const res = fakeResponse();
    await speakBlessica({ body: { text: "Kumusta po?" } }, res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.data.code, "AZURE_VOICE_NOT_CONFIGURED");
  } finally {
    if (key !== undefined) process.env.AZURE_SPEECH_KEY = key;
    if (region !== undefined) process.env.AZURE_SPEECH_REGION = region;
  }
});

test("Invalid text is rejected without making an Azure request", async () => {
  const originalKey = process.env.AZURE_SPEECH_KEY;
  const originalRegion = process.env.AZURE_SPEECH_REGION;
  process.env.AZURE_SPEECH_KEY = "example-not-real";
  process.env.AZURE_SPEECH_REGION = "southeastasia";
  try {
    const res = fakeResponse();
    await speakBlessica({ body: { text: "x".repeat(2001) } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.data.code, "INVALID_SPEECH_TEXT");
  } finally {
    if (originalKey === undefined) delete process.env.AZURE_SPEECH_KEY;
    else process.env.AZURE_SPEECH_KEY = originalKey;
    if (originalRegion === undefined) delete process.env.AZURE_SPEECH_REGION;
    else process.env.AZURE_SPEECH_REGION = originalRegion;
  }
});
