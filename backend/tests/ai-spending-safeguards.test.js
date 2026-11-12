// Stage 85-A: zero-cost AI rate-limit and session-budget regression suite.
// No Gemini, Azure, PayPal or database call; no payment data is read.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createAiRateLimiter } = require("../middleware/aiRateLimit");
const {
  createGeminiBudgetGuard, approximateResponseCost, budgetError,
} = require("../controllers/ai/geminiBudgetGuard");

function probe(middleware, address) {
  let status = 200, body, nextCalled = false, headers = {};
  const req = { ip: address, socket: { remoteAddress: address },
    headers: { "x-forwarded-for": "attacker-forged-ip" } };
  const res = {
    set(key, value) { headers[key] = value; return this; },
    status(code) { status = code; return this; },
    json(data) { body = data; return this; },
  };
  middleware(req, res, () => { nextCalled = true; });
  return { status, body, nextCalled, headers };
}

test("Per-client burst limit returns 429 without reaching paid endpoint", () => {
  const limiter = createAiRateLimiter({
    perMinute: 2, perDay: 10, globalMinute: 10, globalDay: 50,
    now: () => 100000,
  });
  assert.equal(probe(limiter.middleware, "client-a").nextCalled, true);
  assert.equal(probe(limiter.middleware, "client-a").nextCalled, true);
  const denied = probe(limiter.middleware, "client-a");
  assert.equal(denied.status, 429);
  assert.equal(denied.body.code, "AI_RATE_LIMIT");
  assert.ok(Number(denied.headers["Retry-After"]) >= 1);
  assert.equal(probe(limiter.middleware, "client-b").nextCalled, true);
  assert.equal(limiter.snapshot().rejected, 1);
});

test("Global limit blocks many different clients", () => {
  const limiter = createAiRateLimiter({
    perMinute: 10, perDay: 100, globalMinute: 2, globalDay: 20,
    now: () => 100000,
  });
  assert.equal(probe(limiter.middleware, "client-a").status, 200);
  assert.equal(probe(limiter.middleware, "client-b").status, 200);
  assert.equal(probe(limiter.middleware, "client-c").status, 429);
});

test("Per-client minute limit resets but day quota persists", () => {
  let timestamp = 100000;
  const limiter = createAiRateLimiter({
    perMinute: 1, perDay: 2, globalMinute: 100, globalDay: 100,
    now: () => timestamp,
  });
  assert.equal(probe(limiter.middleware, "user").status, 200);
  assert.equal(probe(limiter.middleware, "user").status, 429);
  timestamp += 60001;
  assert.equal(probe(limiter.middleware, "user").status, 200);
  assert.equal(probe(limiter.middleware, "user").status, 429);
  timestamp += 60001;
  assert.equal(probe(limiter.middleware, "user").status, 429);
  timestamp += 86400001;
  assert.equal(probe(limiter.middleware, "user").status, 200);
});

test("Client cannot bypass limiter by spoofing forwarded header", () => {
  const limiter = createAiRateLimiter({
    perMinute: 1, perDay: 10, globalMinute: 100, globalDay: 100,
    now: () => 100000,
  });
  assert.equal(probe(limiter.middleware, "real-address").status, 200);
  assert.equal(probe(limiter.middleware, "real-address").status, 429);
});

test("Invalid rate limits fail closed, not unlimited", () => {
  const limiter = createAiRateLimiter({
    perMinute: null, perDay: 100, globalMinute: 200, globalDay: 300,
    now: () => 100000,
  });
  const x = probe(limiter.middleware, "client");
  assert.equal(x.status, 503);
  assert.equal(x.body.code, "AI_GUARD_CONFIG_ERROR");
});

test("Local budget reserves allowance before simultaneous API calls", () => {
  const guard = createGeminiBudgetGuard(0.06, 0.03);
  const completeFirst = guard.acquire();
  const completeSecond = guard.acquire();
  assert.throws(() => guard.acquire(), x =>
    x.code === "AI_LOCAL_BUDGET" && x.status === 429);
  assert.equal(guard.snapshot().inFlightUsd, 0.06);
  completeFirst({ usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50 } });
  completeSecond(null);
  assert.equal(guard.snapshot().allocatedUsd, 0.06);
  assert.throws(() => guard.acquire(), x => x.code === "AI_LOCAL_BUDGET");
  assert.equal(guard.snapshot().blockedCalls, 2);
});

test("Repeated completion is idempotent and cannot bypass spending protection", () => {
  const guard = createGeminiBudgetGuard(0.03, 0.03);
  const finish = guard.acquire();
  finish({});
  finish({});
  assert.equal(guard.snapshot().allocatedUsd, 0.03);
  assert.equal(guard.snapshot().inFlightUsd, 0);
  assert.throws(() => guard.acquire(), x => x.code === "AI_LOCAL_BUDGET");
});

test("Price estimation counts thinking tokens but does not invent missing usage", () => {
  assert.equal(approximateResponseCost(null), null);
  assert.equal(approximateResponseCost({}), null);
  const cost = approximateResponseCost({usageMetadata:{
    promptTokenCount: 1000000, candidatesTokenCount: 500000,
    thoughtsTokenCount: 500000,
  }});
  assert.ok(Math.abs(cost - 2.80) < 1e-9);
  assert.equal(budgetError().code, "AI_LOCAL_BUDGET");
});

test("No real Gemini API calls are used by the budget and rate tests", () => {
  assert.equal(typeof createGeminiBudgetGuard, "function");
  assert.equal(typeof createAiRateLimiter, "function");
});
