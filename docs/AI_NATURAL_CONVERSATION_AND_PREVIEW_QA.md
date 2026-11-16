# AI Behavior Stage — Natural Chat + Accommodation Previews

## Scope
- Only `testing` branch; no voice-mode control changes, production deploy, migrations or booking/payment writes.
- Conversational Gemini prompt: short 1–2 sentence replies, one useful question at a time, no repetitive identity greetings, natural language matching.
- Send only six bounded previous customer/assistant chat turns plus existing structured booking context; keep full chat history in the client's existing local storage only.
- Fixed-policy FAQ and offline fallback short answers; preserve verified resort rules.
- From **real DB accommodation rows only**, return at most 3 `recommendation_cards`. The model never supplies image URLs, IDs, or prices.
- Cards show photo, name, category, listed max capacity, listed day/night rates, and honest availability disclaimer.
- **View Details** opens `rooms.html?room_id=<id>` and highlights real accommodation card.
- **Book This** opens `booking.html?room_id=<id>` to run all existing secure schedule/date/payment validation.
- **Ask About This** sets `room_id` and `room_name` in existing chat context (does NOT automatically send to Gemini) so follow-ups like "Magkano yan?" use that accommodation's DB record.
- 7 pax after a recommendation inquiry re-evaluates suggestions for updated capacity without a repeat recommendation command.

## Safeguards
- A listing with `status=available` is *not* a confirmed date/time slot.
- A preliminary DB date match is *not* an authoritative booking promise; secure booking page rechecks slot/price.
- Unknown prices display **Rate not listed**, not zero/free.
- Unknown amenities (e.g. own CR/aircon) must not be invented. Customer may inspect the room details or ask Front Desk.
- Room image URL is restricted to supported HTTP(S), known media or uploaded image paths. Cards use DOM textContent, not AI HTML.
- No spontaneous bookings, payments or refunds, no voice UX changes, no new AI API calls for visuals.

## Programmer automated checks (backend/)
```powershell
node --test tests/ai-natural-recommendations.test.js
node --test tests/ai-natural-recommendations.test.js tests/ai-policy-knowledge.test.js
```
Second command is optional if that additional policy test exists locally.

## Tester manual QA (localhost, isolated local DB)
1. Fresh chat: greeting appears once. Ask "May family room kayo?" — natural reply, at most three visual cards from DB.
2. Ask "7 kami" after a recommendation request — no repeated greeting; options reflect guest count, if any match.
3. Tap **View Details** on a card — opens `rooms.html`, scrolls/highlights that exact accommodation.
4. Return to chat and tap **Ask About This** — selected room name appears in chat input, ready to edit/send.
5. Ask "Magkano yan?", "May sarili bang CR yan?", and "Puwede bang overnight?" — only DB-backed facts; if not listed say it is unverified.
6. Tap **Book This** — opens customer booking form with the room preselected; final availability still must be checked there.
7. Ask "Magkano downpayment?" — concise, accurate **50% of accommodation only**, entrance separate.
8. Ask booking schedule — fixed Day/Night slot; one short follow-up question.
9. Cause a simulated AI outage *only in a local test session* (do not rotate/delete cloud keys): text fallback remains short, offline notice doesn't repeat every turn.
10. Verify mobile width around 390px and 440px: cards fit, no overflow, buttons work.
11. Different language: English question gets English; Taglish gets polite natural Taglish.
12. Regression: online booking two-day advance, role protection, payments and existing voice feature unaffected.

Report PASS / FAIL and screenshot for each. Do not deploy to production until tester approval.
