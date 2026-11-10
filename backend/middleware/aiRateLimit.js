// STAGE 85-A: process-local rate limits for Gemini chat + translation endpoints.
// No external dependencies, cookies, guest message logs, or database writes.
// NOTE: On Render multiple instances may share a proxy address; persistent
// shared rate limits are a separate production-hardening task.
const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function envInt(key, fallback) {
  if (process.env[key] === undefined) return fallback;
  const raw = String(process.env[key]).trim();
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n >= 1 && n <= 100000 ? n : null;
}

function makeBucket(now) {
  return { minuteAt: now, minuteCount: 0, dayAt: now, dayCount: 0 };
}

function refresh(bucket, now) {
  if (now - bucket.minuteAt >= MINUTE_MS || now < bucket.minuteAt) {
    bucket.minuteAt = now;
    bucket.minuteCount = 0;
  }
  if (now - bucket.dayAt >= DAY_MS || now < bucket.dayAt) {
    bucket.dayAt = now;
    bucket.dayCount = 0;
  }
}

function createAiRateLimiter(options = {}) {
  const perMinute = options.perMinute ?? 12;
  const perDay = options.perDay ?? 100;
  const globalMinute = options.globalMinute ?? 45;
  const globalDay = options.globalDay ?? 300;
  const nowFn = options.now || Date.now;
  const valid = [perMinute, perDay, globalMinute, globalDay]
    .every(v => Number.isSafeInteger(v) && v >= 1);
  const buckets = new Map();
  let global = makeBucket(nowFn());
  let rejected = 0;

  function middleware(req, res, next) {
    res.set("Cache-Control", "no-store");
    if (!valid) {
      return res.status(503).json({
        success: false, code: "AI_GUARD_CONFIG_ERROR",
        message: "AI request limits are temporarily unavailable.",
      });
    }
    const now = nowFn();
    refresh(global, now);
    // Deliberately do not trust spoofable X-Forwarded-For headers.
    // Express trust proxy defaults to false.
    const client = String(req.ip || req.socket?.remoteAddress || "unknown");
    let own = buckets.get(client);
    if (!own) {
      // Prevent unbounded memory growth during hostile/randomized traffic.
      if (buckets.size >= 3000) {
        for (const [key, item] of buckets) {
          if (now - item.dayAt >= DAY_MS) buckets.delete(key);
        }
        if (buckets.size >= 3000) {
          rejected++;
          return res.status(429).json({
            success: false, code: "AI_RATE_LIMIT",
            message: "AI request traffic is high. Please try again later.",
          });
        }
      }
      own = makeBucket(now);
    } else {
      refresh(own, now);
    }
    const minuteExceeded = own.minuteCount >= perMinute ||
      global.minuteCount >= globalMinute;
    const dayExceeded = own.dayCount >= perDay ||
      global.dayCount >= globalDay;
    if (minuteExceeded || dayExceeded) {
      rejected++;
      const remaining = minuteExceeded
        ? Math.max(MINUTE_MS - Math.max(now - own.minuteAt, now - global.minuteAt), 1000)
        : Math.max(DAY_MS - Math.max(now - own.dayAt, now - global.dayAt), 1000);
      res.set("Retry-After", String(Math.ceil(remaining / 1000)));
      return res.status(429).json({
        success: false, code: "AI_RATE_LIMIT",
        message: "Too many AI requests. Please try again later.",
      });
    }
    own.minuteCount++;
    own.dayCount++;
    global.minuteCount++;
    global.dayCount++;
    buckets.set(client, own);
    return next();
  }
  function snapshot() {
    return {
      activeClientBuckets: buckets.size, rejected,
      currentMinuteRequests: global.minuteCount,
      currentDayRequests: global.dayCount,
      perMinute, perDay, globalMinute, globalDay,
      resetsOnRestart: true, distributed: false,
    };
  }
  return { middleware, snapshot };
}

const aiRateGuard = createAiRateLimiter({
  perMinute: envInt("AI_RATE_PER_MINUTE", 12),
  perDay: envInt("AI_RATE_PER_DAY", 100),
  globalMinute: envInt("AI_RATE_GLOBAL_PER_MINUTE", 45),
  globalDay: envInt("AI_RATE_GLOBAL_PER_DAY", 300),
});

module.exports = { createAiRateLimiter, aiRateGuard };
