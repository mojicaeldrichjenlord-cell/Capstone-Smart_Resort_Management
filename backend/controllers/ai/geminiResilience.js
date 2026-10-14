// Isolated Gemini high-demand handling. Do not change models, API keys,
// billing settings or request real database/payment operations here.
const GEMINI_MODEL = "gemini-2.5-flash";
const RETRY_DELAY_MS = 700;
const MAX_BUSY_RETRIES = 1;

// Process-local aggregate counters. No user messages, replies, IP addresses,
// API keys, room records, or identifiers are collected here. The counters are
// reset on backend restart and are NOT a substitute for Google billing reports.
const geminiUsage = {
  attempts: 0, successfulCalls: 0, failedCalls: 0,
  rateLimitedCalls: 0, busyCalls: 0, retries: 0,
  meteredResponses: 0, inputTokens: 0, outputTokens: 0,
  thinkingTokens: 0, totalTokens: 0,
};

function usableTokenCount(value) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 0 ? n : 0;
}

function getGeminiUsageSnapshot() {
  return { ...geminiUsage };
}

// Accumulate optional token metadata returned by Gemini after successful responses.
// These are process-local counters, not guest conversation logs or official billing totals.
function recordGeminiResponseUsage(response) {
  const metadata = response?.usageMetadata;
  if (!metadata || typeof metadata !== "object") return;
  geminiUsage.meteredResponses++;
  geminiUsage.inputTokens += usableTokenCount(metadata.promptTokenCount);
  geminiUsage.outputTokens += usableTokenCount(metadata.candidatesTokenCount);
  geminiUsage.thinkingTokens += usableTokenCount(metadata.thoughtsTokenCount);
  geminiUsage.totalTokens += usableTokenCount(metadata.totalTokenCount);
  if (process.env.AI_USAGE_LOG === "1") {
    console.info("[Gemini usage] " + JSON.stringify({
      prompt_tokens: usableTokenCount(metadata.promptTokenCount),
      response_tokens: usableTokenCount(metadata.candidatesTokenCount),
      thinking_tokens: usableTokenCount(metadata.thoughtsTokenCount),
      total_tokens: usableTokenCount(metadata.totalTokenCount),
    }));
  }
}

// Extract an HTTP-style status from the SDK error so busy and rate-limited cases can be handled distinctly.
function geminiErrorStatus(error) {
  const direct = Number(error?.status ?? error?.code);
  if (Number.isInteger(direct) && direct >= 400 && direct <= 599) return direct;
  const message = String(error?.message || "");
  try {
    const parsed = JSON.parse(message.slice(message.indexOf("{")));
    const parsedStatus = Number(parsed?.error?.code);
    if (Number.isInteger(parsedStatus) && parsedStatus >= 400 && parsedStatus <= 599) {
      return parsedStatus;
    }
  } catch (_) { /* SDK errors aren't always JSON */ }
  const match = message.match(/\b(?:status|code)\s*[:=]\s*(429|503)\b/i);
  return match ? Number(match[1]) : 500;
}

// Call Gemini and record success/failure and token usage counters.
// Retry only a temporary 503 busy response once; do not retry every kind of failed request.
async function generateGemini(ai, contents, sleep = ms => new Promise(
  resolve => setTimeout(resolve, ms),
)) {
  for (let attempt = 0; attempt <= MAX_BUSY_RETRIES; attempt++) {
    geminiUsage.attempts++;
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL, contents,
      });
      geminiUsage.successfulCalls++;
      recordGeminiResponseUsage(response);
      return response;
    } catch (error) {
      geminiUsage.failedCalls++;
      const status = geminiErrorStatus(error);
      if (status === 429) geminiUsage.rateLimitedCalls++;
      if (status === 503) geminiUsage.busyCalls++;
      if (status !== 503 || attempt === MAX_BUSY_RETRIES) throw error;
      geminiUsage.retries++;
      // Only one short retry; avoids amplifying traffic during demand spikes.
      await sleep(RETRY_DELAY_MS);
    }
  }
}

// Convert internal Gemini failures into safe, understandable messages for the guest.
// Keep SDK error details and credentials out of the public API response.
function geminiPublicError(error) {
  const status = geminiErrorStatus(error);
  if (status === 503) {
    return {
      status: 503,
      body: {
        success: false,
        code: "GEMINI_BUSY",
        message: "The AI assistant is temporarily busy. Please try again shortly.",
      },
    };
  }
  if (status === 429) {
    return {
      status: 429,
      body: {
        success: false,
        code: "GEMINI_RATE_LIMIT",
        message: "AI usage is temporarily limited. Please try again later.",
      },
    };
  }
  return {
    status: 500,
    body: {
      success: false,
      code: "AI_UNAVAILABLE",
      message: "The AI assistant is currently unavailable. Please try again later.",
    },
  };
}

module.exports = { generateGemini, geminiPublicError, geminiErrorStatus, getGeminiUsageSnapshot };
