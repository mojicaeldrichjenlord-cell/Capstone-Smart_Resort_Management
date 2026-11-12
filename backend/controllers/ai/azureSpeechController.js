// SMART RESORT BOOKING SYSTEM - AZURE BLESSICA TEXT TO SPEECH
// Runs on the backend so Azure credentials are NEVER exposed in Chrome or Edge.
// This optional, billable Azure service is disabled until both environment
// variables are configured. No payment or reservation data is sent to Azure.

const MAX_TEXT_LENGTH = 2000;
const MAX_REQUESTS_PER_MINUTE = 10;
const MAX_REQUESTS_PER_DAY = 100;
const buckets = new Map();

function isConfigured() {
  return Boolean(
    String(process.env.AZURE_SPEECH_KEY || "").trim() &&
    /^[a-z0-9-]{2,32}$/i.test(String(process.env.AZURE_SPEECH_REGION || ""))
  );
}

// XML-escape AI text before inserting it into Azure's SSML markup.
function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&apos;"
  })[char]);
}

function checkVoiceAllowance(accountId) {
  // In-memory per-account limits reduce accidental or abusive Azure spending.
  // Restarting the server resets these limits; use a shared quota system if
  // the service grows to multiple instances or public production traffic.
  const now = Date.now();
  if (buckets.size > 2000) {
    for (const [id, entry] of buckets) {
      if (now - entry.dayStart > 86400000) buckets.delete(id);
    }
  }
  const key = String(accountId);
  const entry = buckets.get(key) || {
    minuteStart: now, minuteCount: 0, dayStart: now, dayCount: 0
  };
  if (now - entry.minuteStart >= 60000) {
    entry.minuteStart = now;
    entry.minuteCount = 0;
  }
  if (now - entry.dayStart >= 86400000) {
    entry.dayStart = now;
    entry.dayCount = 0;
  }
  if (entry.minuteCount >= MAX_REQUESTS_PER_MINUTE ||
      entry.dayCount >= MAX_REQUESTS_PER_DAY) return false;
  entry.minuteCount++;
  entry.dayCount++;
  buckets.set(key, entry);
  return true;
}

function voiceStatus(_req, res) {
  // Safe to expose: only indicates availability, never the subscription key.
  res.set("Cache-Control", "no-store");
  return res.json({
    enabled: isConfigured(),
    voice: "fil-PH-BlessicaNeural",
    provider: "azure-speech"
  });
}

async function speakBlessica(req, res) {
  res.set("Cache-Control", "no-store");
  if (!isConfigured()) {
    return res.status(503).json({
      code: "AZURE_VOICE_NOT_CONFIGURED",
      message: "Blessica cloud voice is not configured."
    });
  }
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text || text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({
      code: "INVALID_SPEECH_TEXT",
      message: "Speech text must be between 1 and 2000 characters."
    });
  }
  if (!checkVoiceAllowance(req.customerUser?.id)) {
    return res.status(429).json({
      code: "VOICE_RATE_LIMIT",
      message: "Voice request limit reached. Try again later."
    });
  }
  // This particular endpoint always uses the selected approved Filipina voice.
  // Browser locale, user text, or request JSON cannot change the Azure voice.
  const ssml =
    '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fil-PH">' +
    '<voice name="fil-PH-BlessicaNeural">' + escapeXml(text) +
    '</voice></speak>';
  const region = String(process.env.AZURE_SPEECH_REGION).toLowerCase();
  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
        "Content-Type": "application/ssml+xml; charset=utf-8",
        "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
        "User-Agent": "ArvicSeaside-SmartResort"
      },
      body: ssml,
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) {
      // Do not include upstream response bodies: they may reveal Azure metadata.
      console.warn("Azure Speech request failed, status:", response.status);
      return res.status(502).json({
        code: "AZURE_VOICE_UNAVAILABLE",
        message: "Blessica voice is temporarily unavailable."
      });
    }
    const audio = Buffer.from(await response.arrayBuffer());
    if (audio.length < 100 || audio.length > 5_000_000) {
      return res.status(502).json({
        code: "AZURE_VOICE_INVALID_AUDIO",
        message: "Voice audio could not be generated."
      });
    }
    res.type("audio/mpeg");
    return res.send(audio);
  } catch (error) {
    console.warn("Azure Speech connection failed:", error.name);
    return res.status(502).json({
      code: "AZURE_VOICE_UNAVAILABLE",
      message: "Blessica voice could not be reached."
    });
  }
}

module.exports = { voiceStatus, speakBlessica, escapeXml };
