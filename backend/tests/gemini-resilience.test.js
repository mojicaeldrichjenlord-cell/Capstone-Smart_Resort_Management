// Gemini temporary high-demand handling. Does NOT contact Gemini or Aiven.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  generateGemini, geminiErrorStatus, geminiPublicError,
  getGeminiUsageSnapshot,
} = require("../controllers/ai/geminiResilience");

function pretendAI(responder) {
  let calls = 0;
  return {
    get calls() { return calls; },
    models: {
      async generateContent(request) {
        calls++;
        return responder(calls, request);
      },
    },
  };
}

test("Gemini success uses the existing 2.5 Flash model without retries", async () => {
  const ai = pretendAI((_n, request) => {
    assert.equal(request.model, "gemini-2.5-flash");
    assert.equal(request.contents, "safe guest question");
    return { text: "Hello!" };
  });
  const result = await generateGemini(ai, "safe guest question", () => {
    throw new Error("Successful call must not sleep");
  });
  assert.equal(result.text, "Hello!");
  assert.equal(ai.calls, 1);
});

test("One transient 503 is retried once and returns the successful response", async () => {
  const delays = [];
  const ai = pretendAI(n => {
    if (n === 1) throw Object.assign(new Error("upstream busy"), { status: 503 });
    return { text: "Ready" };
  });
  const response = await generateGemini(ai, "prompt", async delay => delays.push(delay));
  assert.equal(response.text, "Ready");
  assert.equal(ai.calls, 2);
  assert.equal(delays.length, 1);
  assert.ok(delays[0] >= 500 && delays[0] <= 2000);
});

test("Persistent 503 stops after at most two attempts (no retry storm)", async () => {
  const ai = pretendAI(() => { throw Object.assign(new Error("busy"), { status: 503 }); });
  await assert.rejects(() => generateGemini(ai, "prompt", async () => {}),
    error => geminiErrorStatus(error) === 503);
  assert.equal(ai.calls, 2);
});

test("Rate-limit 429 is not retried to protect the free tier", async () => {
  const ai = pretendAI(() => { throw Object.assign(new Error("quota"), { status: 429 }); });
  await assert.rejects(() => generateGemini(ai, "prompt", async () => {}),
    error => geminiErrorStatus(error) === 429);
  assert.equal(ai.calls, 1);
});

test("Unexpected error 500 is not retried", async () => {
  const ai = pretendAI(() => { throw Object.assign(new Error("unexpected"), { status: 500 }); });
  await assert.rejects(() => generateGemini(ai, "prompt", async () => {}));
  assert.equal(ai.calls, 1);
});

test("Gemini SDK JSON-shaped error with code 503 is recognized", () => {
  const error = new Error('{"error":{"code":503,"message":"This model is busy","status":"UNAVAILABLE"}}');
  assert.equal(geminiErrorStatus(error), 503);
});

test("Gemini 503 maps to a safe, retryable HTTP 503 response", () => {
  const error = Object.assign(new Error("Secret request body"), { status: 503 });
  const result = geminiPublicError(error);
  assert.equal(result.status, 503);
  assert.equal(result.body.code, "GEMINI_BUSY");
  assert.match(result.body.message, /try again/i);
  assert.doesNotMatch(JSON.stringify(result.body), /Secret request body/);
});

test("Gemini 429 maps to a free-tier-safe user-facing status", () => {
  const result = geminiPublicError(Object.assign(new Error("Quota hit"), { status: 429 }));
  assert.equal(result.status, 429);
  assert.equal(result.body.code, "GEMINI_RATE_LIMIT");
});

test("Unknown Gemini faults hide internal SDK and API details", () => {
  const result = geminiPublicError(new Error("API key private-secret"));
  assert.equal(result.status, 500);
  assert.equal(result.body.code, "AI_UNAVAILABLE");
  assert.doesNotMatch(JSON.stringify(result), /private-secret/);
});


test("Gemini usage tracking collects SDK token counts without exposing user data", async () => {
  const before = getGeminiUsageSnapshot();
  const ai = pretendAI(() => ({
    text: "Private reply",
    usageMetadata: {
      promptTokenCount: 120,
      candidatesTokenCount: 36,
      thoughtsTokenCount: 18,
      totalTokenCount: 174,
    },
  }));
  await generateGemini(ai, "Confidential guest conversation");
  const after = getGeminiUsageSnapshot();
  assert.equal(after.attempts - before.attempts, 1);
  assert.equal(after.successfulCalls - before.successfulCalls, 1);
  assert.equal(after.meteredResponses - before.meteredResponses, 1);
  assert.equal(after.inputTokens - before.inputTokens, 120);
  assert.equal(after.outputTokens - before.outputTokens, 36);
  assert.equal(after.thinkingTokens - before.thinkingTokens, 18);
  assert.equal(after.totalTokens - before.totalTokens, 174);
  assert.doesNotMatch(JSON.stringify(after), /Confidential|Private|API key/i);
});

test("Gemini SDK responses without usage metadata do not fabricate tokens", async () => {
  const before = getGeminiUsageSnapshot();
  const ai = pretendAI(() => ({ text: "No metadata here" }));
  await generateGemini(ai, "Small chat");
  const after = getGeminiUsageSnapshot();
  assert.equal(after.successfulCalls - before.successfulCalls, 1);
  assert.equal(after.meteredResponses - before.meteredResponses, 0);
  assert.equal(after.totalTokens - before.totalTokens, 0);
});

test("Gemini 429 increments rate-limit counter but never creates fake token usage", async () => {
  const before = getGeminiUsageSnapshot();
  const ai = pretendAI(() => {
    throw Object.assign(new Error("quota details may be sensitive"), { status: 429 });
  });
  await assert.rejects(() => generateGemini(ai, "Private prompt"));
  const after = getGeminiUsageSnapshot();
  assert.equal(after.attempts - before.attempts, 1);
  assert.equal(after.rateLimitedCalls - before.rateLimitedCalls, 1);
  assert.equal(after.failedCalls - before.failedCalls, 1);
  assert.equal(after.totalTokens - before.totalTokens, 0);
});

test("A retryable Gemini 503 records two attempts but only one successful response", async () => {
  const before = getGeminiUsageSnapshot();
  const ai = pretendAI(n => n === 1
    ? Promise.reject(Object.assign(new Error("busy"), { status: 503 }))
    : { text: "ok", usageMetadata: { promptTokenCount: 5, totalTokenCount: 8 } });
  const response = await generateGemini(ai, "prompt", async () => {});
  const after = getGeminiUsageSnapshot();
  assert.equal(response.text, "ok");
  assert.equal(after.attempts - before.attempts, 2);
  assert.equal(after.retries - before.retries, 1);
  assert.equal(after.busyCalls - before.busyCalls, 1);
  assert.equal(after.successfulCalls - before.successfulCalls, 1);
  assert.equal(after.meteredResponses - before.meteredResponses, 1);
  assert.equal(after.totalTokens - before.totalTokens, 8);
});
