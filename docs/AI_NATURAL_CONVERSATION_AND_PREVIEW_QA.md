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

## Deferred UI/UX stage — cross-page chatbot stability (2026-11-16)

### UI finding AI-UI-001 — Customer Accommodations page

**Observed at localhost** `/frontend/customerHTML/rooms.html` in desktop Chrome while opening **Ask AI About This** for a Single Room: the chat window visually overlaps a large portion of the accommodation cards, the chat header is not visible in the shown viewport, and the expanded voice toolbar uses considerable space above the conversation. This is a visual QA finding; a screenshot alone does not establish the root cause. **Status: OPEN / defer until dedicated chatbot UI/UX polish.**

### Required behavior for every customer page

- Chat widget must use one consistent, predictable overlay design and position on Home, Accommodations, Booking, Resort Map, My Bookings and Profile (where the widget is present); shared styling must not be overridden unexpectedly by page-specific CSS.
- On desktop, floating chat opens fully inside the viewport with header (name, New, Minimize, Close), message history, voice controls and composer accessible. It must not push, shrink or reflow the underlying accommodation layout when opened, closed or maximized.
- Respect top and bottom viewport boundaries, zoom, varying browser window heights, sticky headers and mobile safe areas. No clipped header, missing action buttons, unreachable input, double scroll traps or off-screen modal.
- Keep voice UI optional/collapsible in **text chat**: no oversized Start Conversation toolbar covering chat messages. Do **not** change speech recognition, voice behavior or device-specific interaction during the UI-only stage.
- Messages scroll independently within the chat, while the composer stays reachable; no unexpected jumps or scroll locking of the entire page. Minimize, maximize, close, reopen and new-chat controls must all work.
- Room preview cards (photo, View Details, Book This, Ask About This) must fit the widget on every page and preserve correct room context, rates and not-yet-verified availability disclaimers.
- Keep accessibility: keyboard navigation, visible focus, text scaling, adequate contrast and minimum tap targets; no horizontal overflow.
- Responsive browser checks required at **390px, 440px, 768px, 1280px and 1440px**, plus short-height desktop and browser zoom. Validate open/close/minimize/maximize, scrolling, messaging, voice controls, and accommodation card actions on each relevant page.
- CSS/layout fixes must preserve customer booking, payments, receipts, reservations and all five staff/customer roles. Prefer shared component styles plus scoped overrides; avoid broad global selectors and regressions.

### Separate behavior finding from the same screenshot

Following the catalog context fix, `Tell me more about Single Room (Pool side) C.` now refers to the selected room and listed ₱3,000 rate, but the answer focuses on check-in instead of summarizing verified amenities. Review natural, accommodation-specific detail responses separately from the UI redesign. **Behavior QA: PARTIAL PASS; content relevance improvement pending.**

### Stage boundary

**Documentation only.** Do not implement the redesigned chatbot, voice controls, database changes, production deployment or branch merge as part of this note. Complete text assistant QA, then implement cross-page UI polish in a focused `testing`-branch stage with screenshot-based PASS/FAIL.

### UI-15 implementation — Customer chatbot shared layout (testing only)

Implementation has been committed on `testing`; **browser QA is NOT yet passed** and nothing has been merged to `main` or deployed. The initial CSS/HTML cross-page checks (4 static assertions) passed. The following is the manual release gate:

1. On **Accommodations**, choose Single Room (Pool side) C, click **Ask AI About This**, then send the prepared message. Verify the selected room survives and the complete header remains inside the viewport. Do not treat any reply as confirmed date/slot availability.
2. Check the same chat overlay from **Home**, **Booking**, **Resort Map**, **My Bookings**, and **Profile**: no page reflow, broken controls, missing voice panel, or unrelated booking/payment side effects. The last four mount the shared widget only on the Customer page.
3. On each page open/close, **minimize**, maximize/restore, new chat (with confirmation), and navigate away/back. Existing conversation context should persist except after explicit New Chat.
4. Use **Voice options**: collapsed by default, expandable; language, Start/Stop Conversation and microphone remain functional. QA voice behavior separately; UI implementation does not alter `ai-voice.js`.
5. Send short and long multilingual messages, inspect compact Read Aloud/Translate controls, and check that the message list scrolls while the header and composer remain visible.
6. Inspect 390px / 440px / 768px / 1280px / 1440px widths, short desktop heights, and 125% browser zoom. On touch widths, chat is viewport-filling with reachable buttons and no horizontal overflow.
7. Check accommodation preview cards and View Details / Book This / Ask About This; booking dates, payments and reservations must not be changed by opening chat.
8. If the accommodation page still says **No amenities or inclusions listed** after a fresh reload, independently compare `/rooms/available` API data and the same Aiven accommodation row; this is **not presumed fixed** by UI CSS changes.

Commands for the Programmer (from repository root):

```powershell
cd backend
node --test tests/ai-customer-chat-ui.test.js
node --test tests/ai-natural-recommendations.test.js
```

Suggested first browser QA: **Accommodations page at 1280px desktop**, then mobile 390px and 440px. Report PASS/FAIL with screenshots, before proceeding to full cross-page sweep or `main` deployment.
