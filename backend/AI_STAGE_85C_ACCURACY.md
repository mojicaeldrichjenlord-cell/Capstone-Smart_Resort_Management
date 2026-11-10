# Stage 85-C — Accommodation Rates & Booking-Date Accuracy

## Scope
This is preliminary AI booking help. Actual online booking creation remains
the source of truth for availability and financial amounts. No real Gemini,
PayPal, production booking, or Aiven write was required by these changes.

### Changes in this stage
- Strict YYYY-MM-DD date validation (rejects invalid calendar days, including
  non-leap February 29 / February 30).
- Compares check-in dates against the **current date in Asia/Manila**, not the
  hosting machine's clock/timezone.
- Does **not** silently convert a past date to next year; customers must supply
  a valid future date. Gemini's extraction instruction still chooses a future
  year for ambiguous month/day questions.
- Rejects reversed or equal start/end time on the same date.
- Uses timezone-independent calendar day arithmetic for future alternative
  date suggestions.
- Complete invalid windows return \`mode: "invalid_window"\`, contain
  **no booking preview or availability query**, and do not trigger a final
  Gemini response call. Intent extraction may have already occurred.
- An accommodation with a missing, invalid, zero or negative database rate is
  marked **"Not listed — confirm on booking page"** in the model's source
  prompt, instead of suggesting it costs PHP 0.00. Valid rates still use fresh
  database rows.

### Source safety
The accommodation catalog and availability SQL remain read-only in the
existing AI controller. The actual booking API still validates prices, slot
overlap and user authorization before it writes any reservation. The AI must
not create a reservation or claim a confirmed slot.

### Zero-credit regression commands
Run from \`backend/\`:
\`\`\`powershell
node --test tests/ai-stay-window-validation.test.js tests/ai-booking-security.test.js tests/gemini-resilience.test.js tests/ai-voice-assistant.test.js tests/ai-spending-safeguards.test.js tests/ai-usage-authorization.test.js
\`\`\`
All tests use mocks or pure date functions; they do NOT call live Gemini,
the production database or PayPal.

### Hosted defense checks (pending)
- Render deployment must use the current backend commit and have the proper
  \`GEMINI_API_KEY\` and Aiven connection, without exposing them to frontend JS.
- Test one date-specific room question through the actual custom domain only
  after verifying backend data source and Google AI Studio balance.
- Confirm customer booking availability on the same dates independently.
- Verify custom-domain HTTPS/CORS, cold-start behavior, each user role, and
  PayPal demo-mode status. Do not treat one local test as deployment proof.
- Persistent distributed AI quota/budget enforcement is still a separate
  prerequisite before allowing unrestricted public traffic; the Stage 85-A
  process-local guard resets on Render restarts.

### Not changed
- No automatic refund feature added (excluded from approved paper).
- No custom domain purchased or connected in this commit.
- No actual pricing or resort refund policies changed.
- No changes to Gemini billing or Auto-reload.
