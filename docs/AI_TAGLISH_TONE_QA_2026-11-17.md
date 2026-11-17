# Stage AI-20 — Natural everyday Taglish for AI chat and voice

## User-reported issue
On customer chat and Microsoft Edge Taglish voice, AI sometimes used formal/deep Filipino like `mapipili ninyong accommodation`, `maipapaliwanag`, and stiff sales phrasing. The intent is a warm conversational Front Desk style rather than formal translated Tagalog, without changing accuracy.

## Code changes — testing branch only
- `geminiChatController.js`: tighter Taglish voice/text system prompt. Everyday Filipino + familiar English for booking, rates, previews, payments, etc.; natural use of `po`, `kayo`, `yung`, `niyo`, 1–2 short sentences usually. Explicitly protect verified numbers, booking policies, prices and availability. Taglish translation prompt uses same tone guidance and doesn't add more Gemini calls.
- `aiVerifiedPreview.js`: casual Taglish preview/help text. Source room IDs, images and cards stay from DB.
- `aiFocusedPaymentReply.js`: casual Taglish rate, downpayment, remaining balance and onsite fees; verified exact amounts and no implied booking confirmation. No changes to actual checkout or payment processing.
- `aiAccommodationAmenities.js`, `aiNaturalRoomDetails.js`, `aiAccommodationDetails.js`: natural Taglish for missing details, room inclusion summaries and room overviews; unknown facts remain unknown. English and pure Tagalog paths remain separate.
- Fixed-policy fallback payment/help phrases in controller use plainer Taglish.
- Updated existing regression expectations for the wording changes.

## Test status
- 24/24 Taglish tone + focused payment regression cases PASS in synthetic JavaScript/V8 harness; 104 checks. This is NOT an actual Node execution or microphone/browser run.
- Targeted in-memory amenity/preview/room details checks 10/10 PASS.
- Changed JS source files parsed with no syntax errors.
- No DB writes, migrations, client bookings/payments, frontend layout change, new API call or live-domain deployment.

## Programmer localhost QA
1. Verify clean `testing` branch before pull. `git pull --ff-only origin testing`.
2. From backend directory run `node --test tests/ai-taglish-tone.test.js tests/ai-payment-followup.test.js tests/ai-verified-preview.test.js tests/ai-natural-recommendations.test.js tests/ai-natural-room-details.test.js tests/ai-accommodation-category-amenities.test.js tests/ai-free-entrance.test.js`.
3. Restart backend and hard refresh localhost Customer Home.
4. Select Voice options > Taglish/Filipino > Accurate (Gemini), New Chat. Ask a preview for Family Room B, a follow-up overnight cost/payment options, a private CR question, and an unknown amenity question.
5. Expect friendly short Taglish (`Ito po yung preview...`, `listed overnight rate`, `estimated downpayment`, `Yes po, may private CR...`) and no deep-formal Tagalog. Payment answer must not add unrelated Small Nipa Hut preview cards.
6. Ask for a recommendation with 100 pax and then a short preview follow-up; listed capacity and room images must remain accurate.
7. Switch to English mode and pure Tagalog mode; ensure tone/language separation and exact facts.
8. Verify no stale deployment confusion: `testing` localhost patch is not live at arvicseasideresort.com until owner-approved merge; existing screenshot may show old code.

Release gate: actual Node tests and local browser QA must PASS. Do not merge until owner explicitly approves. Tester dry-run remains report-only.