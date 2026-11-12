# Stage 85-B — Verified AI Resort Policies & Hosted Defense QA

**Goal:** An AI assistant that gives accurate answers about fixed resort policy and uses live Gemini only when needed. This update does not purchase a domain, deploy code, connect production payments or spend Gemini credits.

## Source of truth

- Current implemented Customer cancellation handler: \`backend/controllers/shared/bookingController.js\` (\`cancelBooking\`).
- Current booking and downpayment requirements: Customer booking/payment forms and controller, plus resort-approved policies.
- Approved capstone paper scope: automated refund/dispute management is **excluded**. Requests are handled manually by resort management. The system must not promise a refund.
- Date-specific booking prices and accommodation availability **must come from current MySQL records**, not hardcoded policies.

## Verified fixed-policy answers

\`backend/controllers/ai/resortPolicyKnowledge.js\` provides narrow answers for:
- **Cancellation:** own pending/approved reservations through My Bookings, at least one day before check-in, not already checked in. Cancellations do not reverse payments.
- **Refunds:** no automatic system refund, and no claim about individual eligibility or amount. Management handles exceptions manually. This is not a refund feature.
- **Entrance fees:** separate from 50% online accommodation downpayment, booking estimate only, Front Desk finalizes actual onsite fees and applicable discounts.
- **Walk-ins:** Front Desk may create same-day manual reservations with onsite payment; actual availability must be confirmed.
- **AI booking limitations:** suggestions and preliminary slot checks do not create or confirm bookings; official Customer booking/payment flow is mandatory.

These answers are matched conservatively. Named accommodation inquiries, exact amounts, transaction codes and actual payment status still use the data-aware pipeline; these cannot be answered by generic policy templates.
Fixed-policy answers require **zero Gemini calls and zero SQL queries**. English, Tagalog, Taglish, Spanish and Mandarin variants are available; live voice language preference takes precedence.

Gemini prompt rules now incorporate the same verified facts, reducing contradictions on long or multi-turn inquiries.

## Mocked QA — no paid API calls

From \`backend/\`:

\`\`\`powershell
node --test tests/ai-booking-security.test.js tests/gemini-resilience.test.js tests/ai-voice-assistant.test.js tests/ai-spending-safeguards.test.js tests/ai-usage-authorization.test.js
\`\`\`

Manual spot checks once the local suite passes:
1. "What is the required downpayment for an online reservation?" → 50% final accommodation price, entrance fee excluded, PayPal; no confirmed booking.
2. "What is your refund policy?" → handled manually by management, **no automated refund**.
3. "How do I cancel my reservation?" → My Bookings, eligible pending/approved, at least one day before arrival, not checked in.
4. "Magkano ang entrance fee?" → estimate only, actual onsite, no invented peso amount.
5. "Do you accept walk-ins?" → Front Desk same-day, subject to availability.
6. "How much is Small Nipa Hut 2 for a day tour?" → current DB rate only, never a static quote.
7. "Is that room available next weekend?" → must check actual date/time and reservation overlap, not answer from status field.
8. "Can you refund reservation 1234?" → must not claim it can initiate a refund or see someone else's transaction.
9. Voice: Stop Conversation, permission denied, New Chat, and re-entry continue to work without stale speech.
10. Test normal chat once through the **live** backend to prove an actual Gemini reply; do not confuse a local policy answer with proof of upstream service.

## Important — hosted mock/final defense is NOT the same as localhost

The planned hosted setup is Vercel frontend, Render Node backend, Aiven MySQL, and a custom domain. Domain purchase and DNS/HTTPS setup are a separate verified step; the domain currently being considered must not be described as purchased or connected until verified.

Before the mock defense:
- Confirm the exact deployed frontend and backend URLs, HTTPS and CORS from that domain.
- Verify environment keys on Render rather than in frontend files; do not print secrets to browser Console.
- Verify Render service start, health and cold-start behavior, and its connection to the intended Aiven database **without mutating real reservations**.
- Check every role login and Customer booking pages on the custom domain and on mobile.
- Confirm that PayPal **demo/sandbox settings** and displayed payment values are clearly marked; \`PAYPAL_DEMO_MODE=true\` must NEVER be used with real customer payments or claimed as real revenue.
- Confirm Vercel plan suitability for any actual commercial operation beyond academic testing.
- Run defense scenario without destructive DB changes and use only disposable test bookings.
- Use Google AI Studio Billing as the authority for actual available credits, charges, tier, and rate limits.
- Keep Gemini Prepay Auto-reload OFF and make a real credit-balance check before each rehearsal.

### AI budget limitation still blocking public unattended exposure

Stage 85-A protection runs **in memory only**. Render restarts/redeployments reset it and multiple server instances do not share the budget. The USD 1.50 default guard is NOT a hard permanent Google billing limit; one expensive call can exceed its reserved allowance. Production-grade durability and abuse protection (shared database-backed quotas, measured bill reconciliation, correct reverse-proxy client identification) must be validated **before opening a public domain to untrusted traffic**. Do not treat the staged domain as a safe always-on paid public AI service yet.

The planned defense should use a controlled access/testing period, not an indefinite open endpoint. Reserve credits for mock/final defense and minimize live test calls. This document is a checkpoint, not a claim that all acceptance tests passed.
