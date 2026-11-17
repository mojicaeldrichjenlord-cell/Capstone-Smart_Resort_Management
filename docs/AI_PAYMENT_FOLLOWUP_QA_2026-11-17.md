# Stage AI-19 — Payment follow-ups must stay on selected room

## Reproduced screenshot / expectation
- Voice transcript was accurate: `Kung mag-a-book kami ng overnight sa Saturday, magkano po kaya ang babayaran namin at ano ang payment options?`
- Family Room B had recently been previewed at a listed overnight rate of PHP 8,000.
- Old behavior: the chatbot answered only generic 50% PayPal policy, failed to quote the selected accommodation, and appended unrelated Small Nipa Hut 2–4 cards.

## Root cause / targeted code change on testing
- In `aiConversationStyle.wantsAccommodationCards`, `options` accidentally treated **payment options** as accommodation recommendation options, bypassing the existing `magkano` exclusion.
- `geminiChatController.js` had no verified selected-room payment path, so a broad Gemini/candidate flow could lose focus, quote only generic policy or attach unrelated cheap cottage cards.
- `aiFocusedPaymentReply.js` now classifies payment inquiries, resolves the current room from **fresh** DB catalog rows by exact name or ID (with name consistency guard), and can recover the latest explicitly named room from prior USER turns. No price is taken from user-supplied chat history.
- For a single standard overnight request with a verified listed price, the direct answer states the room name, room rate, estimated 50% downpayment and estimated remaining accommodation balance; entrance/other charges are separate and date/slot/final quote remain unverified.
- Actual currently implemented online checkout policy: PayPal downpayment; remaining balance, entrance fees, applicable charges onsite. No booking/payment database writes or new Gemini call.
- `recommendation_cards: []` for this answer and payment questions cannot trigger generic recommendation cards.
- For multi-night, extended or unclear stay type, it does not invent a standard-slot total. Stale ID, unavailable listings and unknown rates do not produce a payable quotation.

## Test evidence
- `backend/tests/ai-payment-followup.test.js`: 12 cases created and 12/12 passed in a mocked V8 environment; **actual Node run, DB-backed localhost QA and live microphone QA pending**.
- JS syntax checked for changed files. Production `main` and domain not modified.

## QA protocol (programmer localhost)
1. From the project root check `git status --short` and branch `testing`; then `git pull --ff-only origin testing` if clean.
2. In `backend`, run `node --test tests/ai-payment-followup.test.js tests/ai-natural-recommendations.test.js tests/ai-verified-preview.test.js`.
3. Restart backend (`node server.js`) and hard refresh customer Home. New Chat > `may preview ka ng Family Room B?`.
4. In the SAME chat ask/say: `Kung mag-a-book kami ng overnight sa Saturday, magkano po kaya ang babayaran namin at ano ang payment options?`.
5. Expected at current sample rate: Family Room B, listed 1-slot overnight PHP 8,000, estimated downpayment PHP 4,000 and remaining room balance PHP 4,000; PayPal online downpayment, entrance/other charges separately onsite, no final date/slot guarantee; **zero Small Nipa Hut cards**.
6. Follow up `magkano kung day tour?`; expected Family Room B day price from DB, no unrelated cards.
7. Change explicit room: `Paano naman ang Family Room A overnight?`; expected room A fresh rate, not B, and no unrelated cards.
8. New Chat, ask `What are your payment options?`; expected general payment methods and a request to choose room before any peso quotation; no cottage cards.
9. Ask `show me room options` to confirm genuine accommodation discovery still produces cards.
10. Re-test editable dictation and hands-free Taglish; a failure in recognition is a separate Voice STT issue. Do not place real reservations or payment transactions during QA.

No database schema changes or production deployment. Merge only on owner approval after browser PASS.