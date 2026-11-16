# CAPSTONE — Master Development & Tester Handover Checklist
**Project:** Arvic Seaside Beach Resort and Hotel — Smart Resort Booking System
**As of:** November 17, 2026 (Asia/Manila); OWNER HAS AUTHORIZED LOCALHOST QA — update this document with each PASS/FAIL
**Branch:** testing only (do not merge to main or deploy without approval)
**Purpose:** Guide the classmate Software Tester through ordered localhost QA, one stage at a time. The Project Owner authorized starting localhost QA on November 17, 2026. Merge to main ONLY after integrated regression QA PASS and owner approval.

## Workflow and safety
- **CURRENT PHASE: LOCALHOST QA AUTHORIZED (2026-11-17).** Guide the classmate Software Tester through ONE test at a time with screenshots and PASS/FAIL. Start from Stage QA-00: safe git pull / environment verification. No merge or production deployment before completed tests and explicit owner approval.
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
| Reports-20 Compact Admin Reports & Print | Minimalist report header/filter/KPIs and muted compact Chart.js charts; zero-data state replaces empty graphs; A4 portrait prints KPI and chart-value tables instead of huge canvases, with estimate disclaimer | frontend/adminHTML/admin-reports.html; frontend/adminCSS/admin-reports-minimal.css; frontend/adminJS/admin-reports.js and admin-reports-presentation.js; backend/tests/admin-reports-minimal-ui.test.js; docs/ADMIN_REPORTS_MINIMAL_PRINT_QA_2026-11-17.md | 7/7 isolated static/dynamic checks PASS; print/browser not verified | PENDING |

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

## Active localhost tester sequence (authorized by owner)
0. **QA-00 Git pull and environment:** on tester PC, from repository root check `git status` and `git branch --show-current`; if no local changes, run `git switch testing`, `git pull --ff-only origin testing`, and `git log -1 --oneline`. Then confirm backend uses `node server.js` from the backend directory and localhost frontend calls port 5000. Inspect only DB host category (local/private test vs Aiven), without pasting secrets. Do NOT alter DB or make payments. If git reports a conflict or dirty tree, STOP and ask for guidance; do not run `reset --hard`, `clean -fd`, or force checkout.
1. Verify branch, environment, auth and available non-production fixtures. Review all stage docs; do not confuse server syntax PASS with browser PASS.
2. **Customer Booking 16:** dates (2-day policy), booked/free/ended/extended slots, multi-item overlap, stale requests, selected-slot reset, Next to Payment blocked appropriately; desktop/mobile.
3. **Manual Booking 17 + Finding 006:** Front Desk + Admin Manual Reservation, Walk-in today only vs Facebook today/future, slot availability, overlaps, expiration and pre-payment recheck.
4. **Payment/proof/cancellation/no-show findings:** 007, 008, 017, cancellation, permissions, receipts and unchanged reservation/payment flow; use safe test environment before any transactions.
5. **AI 14:** actual DB-backed accommodation cards and follow-up prices/amenities, switching room context, natural language, conversation reset, offline/rate-limit fallback, view/book/ask action checks and privacy/booking disclaimer.
6. **AI 15:** every Customer page, header/composer visibility, restore/maximize, voice panel and existing voice controls, 390px/440px plus 768/1280/1440, zoom and short viewport.
7. **Payment-18 Customer Payment minimalist UI:** verify scoped white/slate/teal style, summary/breakdown/PayPal/policies order on 390/440 mobile, unchanged six policies and all 50%/onsite amounts, PayPal SDK load/error/success only in safe sandbox, cancel transaction modal and focus; see docs/CUSTOMER_PAYMENT_MINIMAL_QA_2026-11-17.md. Never submit real money or create new Aiven bookings in production QA.
8. **Payment-19 Manual Payment Coastal Minimal:** on signed Front Desk safe test session, verify Cash/GCash/Maya and Walk-in vs Facebook payment modes, proof required / reference optional, dynamic amount due and onsite estimates, mobile and desktop layout, submission protection. **Check current role guard: Admin is redirected at this payment page; never change authorization solely for visuals.** See docs/MANUAL_PAYMENT_MINIMAL_QA_2026-11-17.md.
9. **Reports-20 Admin Reports compact UI & print:** verify 9 chart categories, muted compact cards, populated and zero-booking periods, date range updates, estimated financial KPIs, adjusted charge/refund disclaimer, A4 portrait printed table summary and mobile 390/440; see docs/ADMIN_REPORTS_MINIMAL_PRINT_QA_2026-11-17.md.
10. Smoke-test all five roles, including staff permissions, existing booking/payment/receipt/report functionality. Record screenshot and PASS/FAIL, fixes, retests, commits, and only then request approval for main/production.

## Test commands — run from project root after Stage QA-00 environment verification
```powershell
git switch testing
git pull origin testing
cd backend
node --test tests/customer-booking-early-slots.test.js
node --test tests/manual-booking-early-slots.test.js
node --test tests/customer-payment-minimal-ui.test.js
node --test tests/manual-payment-minimal-ui.test.js
node --test tests/admin-reports-minimal-ui.test.js
node --test tests/ai-customer-chat-ui.test.js
node --test tests/ai-natural-recommendations.test.js
```
Additional checks/migrations require separate documented scope; do not run production writes as tests.

## Tester conversation handoff prompt
"Continue the Arvic Seaside Capstone **from docs/CAPSTONE_TESTER_HANDOVER_MASTER_2026-11-16.md on the latest testing branch**. I am the Software Tester; the Programmer has completed the improvement batch and authorized QA. First confirm current branch/environment and use read-only or safe test data, then guide me **one stage and one test at a time**, marking PASS/FAIL from screenshots. Do not modify main, deploy production, change Aiven records or perform real payments without approval."

## QA progress log (tester fills this one stage at a time)
- QA-00 Git pull / branch / backend / database target: PENDING tester screenshot.
- QA-16 Customer Booking early slots: QA-16A/C PASS; QA-16E missing secondary Time Slot choices FAIL → repair committed → **RETEST PASS** for four restored options and client-side overlap; date-change/capacity and actual server-booking conflict tests PENDING.
- QA-17 Front Desk Manual Reservation slots: PENDING.
- QA-18 Customer Payment minimal layout: PENDING.
- QA-19 Front Desk Manual Payment minimal layout: PENDING.
- QA-20 Admin Reports compact screen and A4 print: PENDING.
- QA-14/15 AI accommodation data, chatbot and cross-page UI: PENDING.
- Other fixes and all five-role regression smoke test: PENDING.
- Main-merge approval: NOT AUTHORIZED until full PASS and explicit owner sign-off.

### QA-16E — Active defect and targeted fix (November 17, 2026)
- **Tester observed FAIL** on Customer Booking at localhost: Item 1 Big Shade 7, Nov 19, Day Tour selected; Item 2 showed Big Shade 7 accommodation label and date, but Time Slot had only `Select time slot`, Maximum Capacity remained `-`, and hint incorrectly showed `0 of 4 time slots currently show available`. Tester also reproduced with another accommodation. This is a UI-population failure, **not proof that all slots are booked**.
- Programmer committed a **targeted frontend-only fix on testing** in `frontend/customerJS/booking.js`: passes the selected card directly to slot/duration/preview refresh helpers instead of relying solely on global item-ID lookup, and restores the four slot options if the option list is missing when the status check renders. No backend, DB, payment logic or reservation records changed.
- Extended `backend/tests/customer-booking-early-slots.test.js` with two reproduction/repair tests. **8/8 isolated checks PASS.** Actual localhost retest **PENDING**. The root trigger of the intermittent missing options is not yet fully established; the guard is defensive.
- **Tester next step:** From project root, `git pull --ff-only origin testing` (first verify clean changes outside previously modified `backend/node_modules`), then `Ctrl+Shift+R` the Customer Booking page. Recreate two items with same room/date and Day Tour on Item 1. Verify Item 2 now contains four labeled options, capacity populates, and overlapping Day Tour/extended options are disabled. If it still fails, collect read-only browser Console and DOM selection details; DO NOT make a reservation/payment.

### QA-16E — Retest evidence (November 17, 2026)
- Tester pulled the latest testing branch successfully (fast-forward from ca27685 to 12f421d).
- Screenshot of Customer Booking localhost (Big Shade 2 Cottage, 2026-11-19, Item 2) confirms that all four slot choices are restored: Day Tour and Day 23 Hours = Unavailable/disabled; Night and Night 23 Hours = Available. Item 1 selected the same accommodation for Day Tour.
- **QA-16E missing Time Slot regression RETEST PASS; client-side multi-item overlapping-slot labeling PASS.** This does not establish that the underlying server rejects existing bookings, because local smart_resort_test.bookings had zero records when inspected.
- Max Capacity on Item 2 and status hint below the dropdown were not visible in the latest screenshot. **QA-16G date-switch and capacity validation PENDING.** Tester to change only Item 2 to 2026-11-20 and verify Day Tour/Day 23 Hours become Available (assuming no active reservations) and Capacity is populated, without submitting payment or reservation.


### QA-16F — Date refresh (tester screenshot, November 17, 2026)
- Customer Booking localhost: Item 1 Big Shade 2 Nov 19 Day Tour, Item 2 Big Shade 2 date changed to Nov 20. All four Item 2 slot options showed Available (Day Tour, Night, Day 23 Hours, Night 23 Hours). **Date-change availability labels: PASS.** This is a UI precheck, not a server-side reservation conflict PASS.
- **Capacity-field verification: PENDING** because native Time Slot dropdown covered the field in tester screenshot. Next test is to close the dropdown and inspect Maximum Capacity and accommodation preview. Do not create or pay for a reservation.

### QA-16G — Maximum Capacity UI retest (November 17, 2026)
- Tester screenshot: Customer Booking, Big Shade 2 (Cottage), both accommodation Item 1 and Item 2 show **Maximum Capacity 25** (no longer `-`). Item 2 has November 20, 2026, message `4 of 4 time slots currently show available`; not yet a selected slot, so the placeholder schedule/price preview is expected.
- **QA-16G PASS** for capacity display and expected empty preview. Next QA-16H: select Day Tour for Item 2 and verify preview, selected-slot availability and two-item totals without proceeding to payment.

### QA-16H — Payment totals and per-item schedule preview (November 17, 2026)
- Tester localhost screenshot: Big Shade 2 Cottage, two separate Day Tour dates, booking totals **2 items**, accommodation **₱3,000.00**, required 50% downpayment **₱1,500.00**, remaining onsite **₱1,500.00**, estimated entrance **₱2,750.00**. Both selected schedules display green available status. **Totals and selected-item availability PASS**. Entrance estimate was displayed, but not independently reconciled against actual guest count/details in this screenshot.
- **UI defect QA-16H:** Despite a selected Day Tour, accommodation-card schedule/price preview still showed its initial placeholder 'Select an accommodation and slot to preview its schedule and price.' **Preview FAIL**, so QA-16H overall **PARTIAL PASS**.
- Targeted `testing` frontend fix in `frontend/customerJS/booking.js`: preview targets its own card's `.slot-preview` instead of a global ID; slot/date/duration listeners pass the actual booking card. This avoids mismatches after card additions/removals or renumbering. Existing booking/payment computations, API and role authorization unchanged.
- `backend/tests/customer-booking-early-slots.test.js` now has **10/10 isolated/mock PASS** including a selected Item 2 Day Tour preview case. **Actual localhost browser retest PENDING.**
- Tester next: `git pull --ff-only origin testing` from repo root (check status before pull if new local changes), hard refresh Customer Booking, use two Big Shade 2 cards for Nov 19/20 with Day Tour, and confirm each card's schedule/price preview has date and ₱1,500.00, with the two-item totals intact. Do not submit a reservation/payment.


### QA-16I — Schedule/price preview localhost retest (November 17, 2026)
- Tester pulled the `testing` changes successfully (latest pulled short SHA `bf6935a` from screenshot; this QA documentation update will be a later commit).
- Screenshot confirms Customer Booking Big Shade 2 Item 2 date 2026-11-20, Day Tour 6 AM–5 PM, check-out 2026-11-20, and **₱1,500.00** item price in the formerly broken schedule preview. Availability confirmation remains green.
- Reservation Preview shows 2 accommodation items, **₱3,000.00** accommodation total, **₱1,500.00** 50% downpayment now, **₱1,500.00** remaining onsite, and **₱2,750.00** estimated entrance fee. These shown totals match the two ₱1,500 day-tour accommodation prices; entrance fee estimate not separately audited against guest inputs.
- **QA-16I preview retest PASS**, including price totals. Confirmed no need for another code change to this UI symptom. **Server-side occupied-booking conflict test remains PENDING** because the tester's `smart_resort_test.bookings` was empty at the time of read-only inspection; do not mark that distinct test PASS.
- Next QA: verify Customer Payment minimal UI with the existing safe booking draft by clicking Next to Payment (this only saves a draft and navigates; do not click any actual PayPal or payment/confirm controls).
