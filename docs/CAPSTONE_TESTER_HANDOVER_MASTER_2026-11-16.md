# CAPSTONE — Master Development & Tester Handover Checklist
**Project:** Arvic Seaside Beach Resort and Hotel — Smart Resort Booking System
**As of:** November 16, 2026 (Asia/Manila)
**Branch:** testing only (do not merge to main or deploy without approval)
**Purpose:** Maintain one cumulative record of all recent development so the classmate Software Tester can later conduct ordered, screenshot-based QA **after the Project Owner declares the implementation batch complete**.

## Workflow and safety
- **CURRENT PHASE: DEVELOPMENT, NOT TESTING.** Do not ask the owner or classmate to run browser QA yet. At the user's signal that all changes are implemented, inspect latest testing branch, then walk the classmate through each section below, ONE test at a time with PASS/FAIL and screenshots.
- The tester should report actual errors with browser Console and backend logs, without exposing tokens or payment credentials. Fix failures on testing; rerun impacted regressions.
- **Localhost != local DB.** The Project Owner has used a MySQL Workbench **Aiven** connection even during local development. Never assume localhost means an isolated DB. Verify the actual host/config before any test that writes booking/payment data. Prefer dedicated seeded test DB or read-only verification; do not mutate real production bookings/payments.
- No merges to main, no Aiven migrations/bulk changes or production live-domain deployment without explicit approval. Preserve all five roles: Customer, Admin, Front Desk, Manager, Housekeeping.
- All preliminary syntax/isolated mock PASS results are NOT browser/API integration PASS. Do not mark feature complete without real checks.

## Completed code changes on testing, waiting for integrated QA

| Stage | Change | Relevant files / docs | Preliminary verification | Tester acceptance |
| --- | --- | --- | --- | --- |
| AI Behavior / Cards (AI-14) | Natural replies, selected room memory, up to three actual accommodation preview cards; View Details / Book This / Ask About This | backend/controllers/ai/geminiChatController.js, aiConversationStyle.js, resortPolicyKnowledge.js; frontend/js/ai-chat.js; frontend/customerJS/rooms.js; frontend/sharedCSS/ai-recommendations.css; docs/AI_NATURAL_CONVERSATION_AND_PREVIEW_QA.md | Syntax / isolated checks passed, early screenshots preliminary PASS | PENDING full browser / real Gemini / offline QA |
| AI DB Amenities | Direct room-specific CR / aircon / ref answers from fresh database Description and Amenities; distinguish verified private, shared, generic, unknown; no date question when just asking about simple amenities | backend/controllers/ai/aiAccommodationAmenities.js; geminiChatController.js; backend/tests/ai-natural-recommendations.test.js | Isolated evidence/intent checks PASS; browser needs retest | PENDING |
| AI Catalog context | Preserve specific selected accommodation when clicking Ask AI About This instead of resetting to broad recommendations | frontend/js/ai-chat.js; frontend/customerJS/rooms.js | Syntax / context tests PASS; screenshot showed selected Single Room recognized | PENDING detailed multistep verification |
| AI-15 Cross-page UI | Shared viewport-safe floating chatbot, compact replies, collapsible voice options, minimize/maximize, mounted across Home, Rooms, Booking, Resort Map, My Bookings, Profile | frontend/sharedCSS/ai-chat-layout.css; frontend/js/ai-chat-widget.js, ai-chat-polish.js; six Customer HTML pages; backend/tests/ai-customer-chat-ui.test.js | Four static UI checks PASS; real visuals/voice PENDING | PENDING |
| Booking-16 Customer early slots | Date before time slot; check four time slots after selecting accommodation/date; label Available/Unavailable/Checking/Unable to verify; disable unavailable; check extended duration and overlapping draft items; final availability recheck before payment | frontend/customerJS/booking.js; customerCSS/booking.css; backend/tests/customer-booking-early-slots.test.js; docs/CUSTOMER_BOOKING_EARLY_SLOT_QA_2026-11-16.md | 6/6 isolated mocked cases PASS | PENDING |
| Booking-17 Manual early slots | Shared Admin/Front Desk Manual Reservation date-first selection, per-slot indicators, occupied/ended slots disabled, mode-aware date rules, final pre-payment server recheck | frontend/adminJS/admin-walkin.js; adminCSS/admin-walkin.css; adminHTML/admin-walkin.html; backend/tests/manual-booking-early-slots.test.js; docs/MANUAL_BOOKING_EARLY_SLOT_QA_2026-11-16.md | 7/7 isolated mocked cases PASS | PENDING |

### Prior unresolved findings — keep separate from the latest UI work
- Finding #006 Front Desk expired manual booking schedule validation — programmer fix reported; tester retest PENDING.
- Finding #007 Manual reservation payment proof submission failure — programmer fix reported; tester verification PENDING.
- Finding #008 Front Desk payment proof image missing / unavailable — private proof storage introduced; migration/functional QA PENDING.
- Finding #012 Customer online bookings require **two calendar days ahead** — code enforcement reported, backend + UI QA PENDING.
- Finding #017 Admin-reviewed No-Show management — local migration and functional QA PENDING.
- Admin Cancellation — remove late cancellation UI; backend must reject cancellation after check-in time; PENDING verification.
- Booking Availability UX — Booking-16 and Booking-17 improvements now implemented on testing; do not claim complete until QA.
- Time Slot label consistency — review all Customer/Admin/Front Desk views for leftover "Slot Type" labels.
- Voice Assistant device-specific redesign (desktop hands-free turn-taking, mobile hold-to-talk) is a separate FUTURE stage; **not implemented**. Only chatbot voice *panel presentation* was changed in AI-15. Test existing voice functionality for regressions.
- Customer Payment minimalist redesign is **PROPOSAL ONLY**: docs/CUSTOMER_PAYMENT_MINIMAL_UI_PROPOSAL_2026-11-16.md; not implemented yet.

## Accommodation amenities — user-performed database operations
- Single Rooms 86–96 (Single Room Cottage 1–5, Poolside A–F) share: 1 Double Size Bed; **Private CR**; TV; Air Conditioned; Dining Table; Free Pool and Beach Entrance for 2 Pax. Single Rooms do **not** include a refrigerator.
- **Pool Balcony applies to Poolside A–F only; not Cottage 1–5.**
- User exported accommodations backup from Aiven and shared MySQL screenshots of the 11-row Single Room amenities update; targeted Cottage 1–5 balcony-removal SQL was prepared, but **successful execution of the balcony correction was not yet confirmed**.
- Relevant docs: docs/SINGLE_ROOM_AMENITIES_REVIEW_2026-11-16.sql and docs/SINGLE_ROOM_COTTAGE_REMOVE_POOL_BALCONY_2026-11-16.sql.
- The prior all-rooms bulk update script was withdrawn/deprecated. Do not apply it. Double/Family Room amenities require separate fact verification; no blanket overwrite.
- Treat Aiven as production data: verify permissions, backup and target rows before any future database changes.

## Final tester sequence (only AFTER owner says "development complete")
1. Verify branch, environment, auth and available non-production fixtures. Review all stage docs; do not confuse server syntax PASS with browser PASS.
2. **Customer Booking 16:** dates (2-day policy), booked/free/ended/extended slots, multi-item overlap, stale requests, selected-slot reset, Next to Payment blocked appropriately; desktop/mobile.
3. **Manual Booking 17 + Finding 006:** Front Desk + Admin Manual Reservation, Walk-in today only vs Facebook today/future, slot availability, overlaps, expiration and pre-payment recheck.
4. **Payment/proof/cancellation/no-show findings:** 007, 008, 017, cancellation, permissions, receipts and unchanged reservation/payment flow; use safe test environment before any transactions.
5. **AI 14:** actual DB-backed accommodation cards and follow-up prices/amenities, switching room context, natural language, conversation reset, offline/rate-limit fallback, view/book/ask action checks and privacy/booking disclaimer.
6. **AI 15:** every Customer page, header/composer visibility, restore/maximize, voice panel and existing voice controls, 390px/440px plus 768/1280/1440, zoom and short viewport.
7. **Payment UI/UX stage (when implemented):** pricing identities and values unchanged; PayPal workflow and policy wording unchanged; visual accessibility, mobile stacking, cancel transaction modal; never submit real money in production QA.
8. Smoke-test all five roles, including staff permissions, existing booking/payment/receipt/report functionality. Record screenshot and PASS/FAIL, fixes, retests, commits, and only then request approval for main/production.

## Test commands — run from project root once owner authorizes QA
\`\`\`powershell
git switch testing
git pull origin testing
cd backend
node --test tests/customer-booking-early-slots.test.js
node --test tests/manual-booking-early-slots.test.js
node --test tests/ai-customer-chat-ui.test.js
node --test tests/ai-natural-recommendations.test.js
\`\`\`
Additional checks/migrations require separate documented scope; do not run production writes as tests.

## Tester conversation handoff prompt
"Continue the Arvic Seaside Capstone **from docs/CAPSTONE_TESTER_HANDOVER_MASTER_2026-11-16.md on the latest testing branch**. I am the Software Tester; the Programmer has completed the improvement batch and authorized QA. First confirm current branch/environment and use read-only or safe test data, then guide me **one stage and one test at a time**, marking PASS/FAIL from screenshots. Do not modify main, deploy production, change Aiven records or perform real payments without approval."
