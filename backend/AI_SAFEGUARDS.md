# Stage 98 — AI Security, Monitoring & Optional Budget Cap

**Scope:** Gemini 3.5 Flash-Lite chat/translation (default; `GEMINI_MODEL` server override supported), using the existing customer AI Assistant. Legacy Gemini 2.5 generation access may return HTTP 404 for newer projects.
**Status:** Development implementation; local integration and live acceptance QA pending.
**Safety:** No payment settings changed, no credentials committed, no database migration, and no real Gemini test calls were made for this change.

## Implemented

- Bounded payloads remain in `routes/aiRoutes.js` (2,000 characters per chat message; 6,000 per translation; 12,000 JSON payload characters).
- Shared **per-client** chat/translation rate limit: **12 requests/minute, 100/day** per process.
- Shared **global** chat/translation rate limit: **45 requests/minute, 300/day** per process.
- Rate denial returns HTTP 429 with `AI_RATE_LIMIT`, and does not reach Gemini.
- All calls to `generateGemini` (including intent extraction, final replies, and translations) retain **process-local estimated usage monitoring**.
- **Default: monitor-only; there is no $1.50 spending cutoff in the backend.** This applies even if an old `AI_GEMINI_SESSION_CAP_USD=1.50` environment variable remains on Render.
- USD 0.03 per attempt is only a conservative accounting reserve for diagnostics, **not an actual Google charge or a cap**.
- To explicitly restore the old cutoff, set `AI_GEMINI_LOCAL_BUDGET_MODE=enforce` and choose a positive cap in `AI_GEMINI_SESSION_CAP_USD`.
- Gemini's own quota, project spend caps, prepaid credit balance, billing status, or temporary errors can still prevent AI responses.
- Runtime token and **estimated** cost counters can be accessed through signed **Admin-only** `GET /api/ai/usage` (does not include user messages, card details, IPs, or API keys).

## Optional .env values

The default mode is **monitor**, and a legacy configured cap is ignored until the mode is explicitly changed to `enforce`.

```dotenv
AI_GEMINI_LOCAL_BUDGET_MODE=monitor
AI_GEMINI_SESSION_CAP_USD=1.50
AI_GEMINI_RESERVE_USD=0.03
AI_RATE_PER_MINUTE=12
AI_RATE_PER_DAY=100
AI_RATE_GLOBAL_PER_MINUTE=45
AI_RATE_GLOBAL_PER_DAY=300
```

Keep the website's anti-abuse rate limits. Invalid monitoring-mode values fail closed. Never expose GEMINI_API_KEY to browser clients or commit it to GitHub.

## Budget limitations (read before production)

**Backend monitoring is NOT a Google Cloud billing limit; monitoring mode does not stop API spending.**

1. Backend usage counters and website rate limits **reset on backend restart** or redeploy.
2. Multiple Node.js/Render instances do **not** share these counters.
3. Billed usage can differ from estimates; each attempt reserves USD 0.03, and the guard uses SDK token metadata when available.
4. One real Gemini call might exceed its estimated per-attempt reserve; the reserve does not stop calls in monitor mode.
5. The already purchased USD 5 Gemini prepaid balance may have usage outside this backend.
6. For a public production launch, monitor AI Studio credits and configure optional project spend caps or billing notifications. If abuse increases, implement shared/durable rate enforcement.
7. Keep Auto-reload **OFF**, verify the actual prepaid balance in AI Studio, and avoid repetitive live tests.

Rates used for **approximate** model cost at the time of implementation:
Gemini 3.5 Flash-Lite Standard, USD 0.30 per million text input tokens and
USD 2.50 per million output tokens (including thinking).
Source: https://ai.google.dev/gemini-api/docs/pricing
Rates may change; the billing provider is authoritative.

## Admin inspection

Log into the **Admin** account and run this in the browser Console on the local Admin page:

```js
fetch(`${API_BASE}/ai/usage`, {
  headers: { Authorization: "Bearer " + sessionStorage.getItem("adminToken") },
  cache: "no-store",
})
  .then(async response => ({ status: response.status, body: await response.json() }))
  .then(result => console.log(result));
```

Check `body.gemini.sessionBudget` for monitor mode and estimated cost,
`body.gemini` for API token counts, and `body.rateLimits` for request throttling.
Do not share Authorization tokens or API keys in screenshots.

## Local test commands

Run from the backend directory:

```powershell
node --test tests/ai-spending-safeguards.test.js tests/ai-usage-authorization.test.js
node --test tests/ai-booking-security.test.js tests/gemini-resilience.test.js tests/ai-voice-assistant.test.js
```

These tests are mocked and do **not** consume Gemini credits.
After passing, restart the backend with `node server.js`.

**Next stage:** Verify live-model responses, AI Studio spend monitoring, and usage under multiple concurrent respondents.
