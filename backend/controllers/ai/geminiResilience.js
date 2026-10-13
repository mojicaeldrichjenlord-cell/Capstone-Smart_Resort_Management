// Isolated Gemini high-demand handling. Do not change models, API keys,
// billing settings or request real database/payment operations here.
const GEMINI_MODEL = "gemini-2.5-flash";
const RETRY_DELAY_MS = 700;
const MAX_BUSY_RETRIES = 1;

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

async function generateGemini(ai, contents, sleep = ms => new Promise(
  resolve => setTimeout(resolve, ms),
)) {
  for (let attempt = 0; attempt <= MAX_BUSY_RETRIES; attempt++) {
    try {
      return await ai.models.generateContent({ model: GEMINI_MODEL, contents });
    } catch (error) {
      if (geminiErrorStatus(error) !== 503 || attempt === MAX_BUSY_RETRIES) {
        throw error;
      }
      // Only one short retry; avoids amplifying traffic during demand spikes.
      await sleep(RETRY_DELAY_MS);
    }
  }
}

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

module.exports = { generateGemini, geminiPublicError, geminiErrorStatus };
