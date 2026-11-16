# CAPSTONE — Master Development & Tester Handover Checklist
**Project:** Arvic Seaside Beach Resort and Hotel — Smart Resort Booking System
**As of:** November 17, 2026 (Asia/Manila); update this document as each improvement lands
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
| Payment-18 Customer Coastal Minimal | Customer Payment checkout white/slate/teal styling; direct grid areas, date-independent summary, mobile order summary -> breakdown -> PayPal -> policies, more readable labels and six unchanged policy terms; PayPal SDK/amount logic untouched | frontend/customerHTML/booking-payment.html; frontend/customerCSS/booking-payment-minimal.css; backend/tests/customer-payment-minimal-ui.test.js; docs/CUSTOMER_PAYMENT_MINIMAL_QA_2026-11-17.md | Structural/static 6/6 PASS, 18 critical IDs preserved; browser/SDK untested | PENDING |
| Payment-19 Manual Payment Coastal Minimal | Front Desk Manual Payment page reworked into scoped white/slate/deep-teal cards; desktop summary/details left and breakdown right; mobile summary → breakdown → details; dynamic Amount to Pay Now styled; Cash/GCash/Maya, photo proof and role authorization untouched | frontend/adminHTML/admin-walkin-payment.html; frontend/adminCSS/admin-walkin-payment-minimal.css; backend/tests/manual-payment-minimal-ui.test.js; docs/MANUAL_PAYMENT_MINIMAL_QA_2026-11-17.md | Mapped 41 IDs preserved, 6/6 isolated static checks PASS | PENDING browser / real mode QA |

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
- Customer Payment minimalist redesign is **IMPLEMENTED ON TESTING / UNTESTED IN BROWSER** as Stage Payment-18: docs/CUSTOMER_PAYMENT_MINIMAL_QA_2026-11-17.md. Original design proposal: docs/CUSTOMER_PAYMENT_MINIMAL_UI_PROPOSAL_2026-11-16.md.

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
7. **Payment-18 Customer Payment minimalist UI:** verify scoped white/slate/teal style, summary/breakdown/PayPal/policies order on 390/440 mobile, unchanged six policies and all 50%/onsite amounts, PayPal SDK load/error/success only in safe sandbox, cancel transaction modal and focus; see docs/CUSTOMER_PAYMENT_MINIMAL_QA_2026-11-17.md. Never submit real money or create new Aiven bookings in production QA.
8. **Payment-19 Manual Payment Coastal Minimal:** on signed Front Desk safe test session, verify Cash/GCash/Maya and Walk-in vs Facebook payment modes, proof required / reference optional, dynamic amount due and onsite estimates, mobile and desktop layout, submission protection. **Check current role guard: Admin is redirected at this payment page; never change authorization solely for visuals.** See docs/MANUAL_PAYMENT_MINIMAL_QA_2026-11-17.md.
9. Smoke-test all five roles, including staff permissions, existing booking/payment/receipt/report functionality. Record screenshot and PASS/FAIL, fixes, retests, commits, and only then request approval for main/production.

## Test commands — run from project root once owner authorizes QA
```powershell
git switch testing
git pull origin testing
cd backend
node --test tests/customer-booking-early-slots.test.js
node --test tests/manual-booking-early-slots.test.js
node --test tests/customer-payment-minimal-ui.test.js
node --test tests/manual-payment-minimal-ui.test.js
node --test tests/ai-customer-chat-ui.test.js
node --test tests/ai-natural-recommendations.test.js
```
Additional checks/migrations require separate documented scope; do not run production writes as tests.

## Tester conversation handoff prompt
"Continue the Arvic Seaside Capstone **from docs/CAPSTONE_TESTER_HANDOVER_MASTER_2026-11-16.md on the latest testing branch**. I am the Software Tester; the Programmer has completed the improvement batch and authorized QA. First confirm current branch/environment and use read-only or safe test data, then guide me **one stage and one test at a time**, marking PASS/FAIL from screenshots. Do not modify main, deploy production, change Aiven records or perform real payments without approval."
