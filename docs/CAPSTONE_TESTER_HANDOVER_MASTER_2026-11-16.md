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
- QA-17 Front Desk Manual Reservation slots: **QA-17B page PASS, QA-17C Walk-in slots PASS, QA-17D local overlap PASS, QA-17E Facebook/Messenger future-date PASS**; persisted server-side booking-conflict test pending.
- QA-18 Customer Payment minimal layout: **QA-18A desktop PASS; QA-18B 390px PASS; QA-18C 440px PASS**; PayPal transaction/actual reservation checkout NOT TESTED.
- QA-19 Front Desk Manual Payment minimal layout: **QA-19A desktop/full payment PASS; QA-19B GCash 50% PASS; QA-19C Maya selector PASS; QA-19D 390px tester-reported PASS; QA-19E 440px tester-reported PASS**; actual payment/submission NOT TESTED.
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


### QA-18A — Customer Payment desktop visual retest (November 17, 2026)
- Tester submitted two localhost screenshots of `frontend/customerHTML/booking-payment.html` after two Big Shade 2 Day Tour booking draft items (Nov 19 and Nov 20, 2026, ₱1,500 each). Customer Payment desktop Coastal Minimal screen visibly renders Reservation Summary, Payment Breakdown, Pay with PayPal and six Resort Policy numbered rows with readable minimalist cards.
- Displayed amounts: accommodation total ₱3,000, 50% PayPal due now ₱1,500, accommodation remaining ₱1,500, estimated entrance onsite ₱2,750, total estimated onsite ₱4,250. **Arithmetic matches; UI amount-label check PASS.** Entrance fee basis not independently recalculated from guest-count details.
- PayPal SDK status displays `PayPal is ready. Click the PayPal button to continue.` and button is rendered; **SDK initial visual load PASS only.** No payment attempt, capture, confirmation, receipt, or booking write performed; **all actual transaction tests PENDING**.
- **QA-18A desktop visual/amounts PASS.** Next: QA-18B inspect responsive mobile at 390px (DevTools), with expected vertical order Summary → Breakdown → PayPal → Policies. No live payment.


### QA-18B — Customer Payment 390px mobile emulation (November 17, 2026)
- Tester enabled actual Chrome responsive device toolbar at **390 x 390** (previous desktop width with docked DevTools was not sufficient). Screenshot confirms Customer Payment mobile nav with hamburger, Back to Reservation Form, readable Review and pay heading, and first Reservation Summary card displayed in one column. No obvious horizontal overflow in the top visible portion.
- **QA-18B PARTIAL PASS** for mobile activation/top viewport. Entire page, required stacking order Summary → Breakdown → PayPal → Policies and absence of horizontal overflow at lower sections **PENDING** because 390px viewport height cuts off below Summary.
- Next tester action: keep width 390 and change responsive **height to 844**, then scroll down within phone screen and provide screenshot showing Payment Breakdown, PayPal and Resort Policies order. Never click PayPal or submit a payment.

### QA-18B — 390px mobile PayPal section follow-up (November 17, 2026)
- Tester screenshot with Chrome Responsive **390 × 390** viewport shows Customer Payment PayPal section rendered at 390px: amount due now ₱1,500.00, PayPal-ready message and button entirely visible, with no apparent horizontal overflow in that visible section. **PayPal mobile visible section PASS**; not an actual payment/SDK capture test.
- The device viewport height remains **390px** (tester has not changed height to 844); this does not invalidate width but makes full-page verification harder.
- Complete mobile section order and readability of Payment Breakdown/Resort Policies still **PENDING**. Next screenshot should keep width 390, optionally use height 844, and scroll to show policies plus the boundary with PayPal. The image alone cannot verify unseen sections.

### QA-18B — 390x844 policy section screenshot (November 17, 2026)
- Tester switched Chrome device emulation to **390 × 844** and scrolled to the boundary between Customer PayPal section and Resort Policy Reminder.
- Screenshot shows PayPal button and ₱1,500 due amount above policy card, policies **01–04** readable with clean spacing, no visible clipping/overlap or horizontal overflow in shown viewport.
- **QA-18B still PARTIAL PASS**: policies **05–06** are below current scroll and not yet verified. Next tester action: scroll down inside the mobile preview to fully reveal policies 05/06 and bottom of policy card; send screenshot. No payment interaction.


### QA-18B — 390x844 complete resort policy visual check (November 17, 2026)
- Latest tester screenshot confirms actual Chrome responsive **390 × 844** viewport; Customer Payment Resort Policy Reminder displays all **six policies 01–06**, readable text, and the policy-agreement reminder at bottom. No visible clipping/overlap/horizontal overflow in checked areas.
- Previous 390px screenshots separately verified mobile navbar, Summary section, PayPal amount ₱1,500 and rendered button, and PayPal → Policies vertical order. Desktop QA previously confirmed amounts and sections.
- **QA-18B 390px visual layout PASS**, limited to visible UI; PayPal payment/capture and final booking database writes have **NOT** been tested. Next stage QA-18C: responsive viewport **440 × 844**, verify Summary, Breakdown, PayPal, Policies order with readable amounts and no horizontal overflow, without clicking PayPal.


### QA-18C — Customer Payment 440px mobile visual test (November 17, 2026)
- Tester supplied 3 Chrome DevTools screenshots at **440 × 844** responsive viewport. The screenshots collectively show Reservation Summary → Payment Breakdown → PayPal → Resort Policies vertically, without apparent horizontal overflow or text clipping.
- Breakdown figures remain: accommodation ₱3,000.00, downpayment ₱1,500.00, remaining accommodation ₱1,500.00, entrance estimate ₱2,750.00, and estimated due onsite ₱4,250.00. PayPal amount due ₱1,500.00. Resort Policies **01–06** and agreement reminder are readable.
- **QA-18C 440px responsive visual PASS.** Prior QA-18A desktop and QA-18B 390px were also visually PASS. No real PayPal transaction, reservation creation, final checkout or cross-role integrations tested. Chrome warning "Tracking Prevention blocked access to storage" seen; browser privacy warning alone is not evidence of checkout failure; verify payment integration separately only in safe sandbox with authorization.
- **NEXT QA:** Stage Manual Booking-17 Front Desk early slot availability, starting with login and navigation only; ensure appropriate Front Desk test account and local test DB, and do not submit a reservation/payment yet. Then Manual Payment-19, Admin Reports-20, and deferred AI and full regression.


### QA-17B — Front Desk Manual Reservation page loaded (November 17, 2026)
- Tester localhost screenshot shows `frontend/adminHTML/admin-walkin.html` reached from Front Desk; navbar (Dashboard, Reservations, Payments, Guests, Manual Reservation, Logout) rendered, Walk-in Guest selected, guest information form fields visible, Reservation Items with Add Another Accommodation and first accommodation/date controls visible. **QA-17B initial page visual PASS**.
- No booking created, no payment action, and availability slots not yet inspected. **NEXT QA-17C:** stay in Walk-in mode, select one accommodation on current local-date reservation, inspect Time Slot options and availability status; send screenshot. Do not submit manual reservation.


### QA-17C — Front Desk Walk-in slot labels (November 17, 2026)
- Tester screenshot from localhost `frontend/adminHTML/admin-walkin.html`: Front Desk Walk-in mode, Big Shade 2 Cottage, 2026-11-17. Native Time Slot dropdown visibly lists all four choices with **Available** labels: Day Tour 6AM–5PM; Night 6PM–5AM; Day 23 Hours 6AM–5AM; Night 23 Hours 6PM–5PM. Selected Day Tour preview displays Big Shade 2, 2026-11-17, accommodation price ₱1,500 and green 'Selected schedule currently available. Final verification required.' status.
- **QA-17C PASS for four slot labels, selection preview and availability response.** Actual booked-slot disabling and backend occupied-reservation conflicts **PENDING** (local bookings table previously returned zero records).
- **Next QA-17D (UI read-only):** Keep Item 1 Big Shade 2, 2026-11-17, Day Tour; click Add Another Accommodation and select the same accommodation and same date for Item 2; expand Item 2 Time Slot options. Expected Day Tour and Day 23 Hours Unavailable/disabled due to overlap, Night and Night 23 Hours potentially Available depending on current local time/server results. Do not submit manual reservation.


### QA-17D — Front Desk same-accommodation overlap UI retest (November 17, 2026)
- Screenshot from tester on Front Desk Manual Reservation localhost: Item 1 Big Shade 2 Cottage, date 2026-11-17, Day Tour (6 AM–5 PM) selected; Item 2 same accommodation/date. Item 2 dropdown shows **Day Tour Unavailable**, **Day 23 Hours Unavailable**, **Night Available**, **Night 23 Hours Available**. Item 2 preview correctly states "Select a slot to continue" because none was chosen.
- **QA-17D UI overlap labels PASS.** Manual slot frontend logic in testing sets `option.disabled = state === "unavailable"` for conflict states; screenshot corroborates disabled-looking choices. Formal keyboard/forced-selection test was not separately performed. Server-side conflicts against persisted bookings not yet tested because local test bookings were empty when checked.
- **Next QA-17E:** Without submitting the current draft, change Reservation Type to Facebook/Messenger, choose a valid future date (e.g., 2026-11-19) with Big Shade 2 Cottage, and check that all four Time Slot choices have availability labels and that online-message reservation does not inherit the Walk-in today-only restriction. Front Desk must not create actual booking/payment yet.


### QA-17E — Facebook/Messenger future-date availability (November 17, 2026)
- Tester localhost screenshot on Manual Reservation for Big Shade 2 Cottage on **Nov 19, 2026** shows all four slot options labeled **Available** and selected Day Tour schedule preview with ₱1,500 price and green 'Selected schedule currently available' message.
- **QA-17E PARTIAL PASS** for future-date time-slot labels, preview and availability. **Reservation Type is not visible** in screenshot because the page is scrolled down; do not claim that Facebook/Messenger mode was definitely selected yet.
- Next step: scroll to Guest Information and capture the Reservation Type dropdown set to **Facebook/Messenger**. Do not submit a reservation or payment. If still Walk-in, select Facebook/Messenger, then return to Item 1 to check Nov 19 remains accepted.


### QA-17E — Facebook/Messenger mode verified (November 17, 2026)
- Tester screenshot confirms **Reservation Type = Facebook / Messenger Reservation** in Front Desk Manual Reservation, with Big Shade 2 (Cottage) and **November 19, 2026** visible. Previous screenshot of same test showed all four slot labels Available, Day Tour preview ₱1,500, and green selected schedule availability.
- **QA-17E PASS (UI future-date/mode + slot availability).** This is not a test of submitting Facebook/Messenger reservation, captured payment, or real occupied-slot server rejection.
- **NEXT QA-19A — Manual Payment Coastal Minimal:** With the safe localhost test draft and confirmed available Day Tour, click **Next to Payment**. Verified source function `goToPaymentScreen` rechecks schedules, saves the draft to `sessionStorage`, and navigates to `admin-walkin-payment.html`; it does **not** create reservation or charge money at this step. Inspect the manual payment page UI, totals, method fields/policy. **DO NOT click Confirm, Pay or create a reservation.** If Next to Payment is disabled, inspect slot selection/availability rather than bypassing validation. Do not share personal guest phone/name in QA screenshots if avoidable.


### QA-19A — Front Desk Manual Payment desktop visual and full-payment figures (November 17, 2026)
- Tester reached `frontend/adminHTML/admin-walkin-payment.html` from Front Desk Facebook/Messenger manual reservation. Screenshots show Coastal Minimal 'Review and collect payment' heading, Reservation Summary, Payment Breakdown and Payment Details, payment-method dropdown GCash, payment type Full Payment, optional transaction reference, required screenshot proof upload, staff notes and Submit Manual Reservation / Back buttons. This screenshot contained personally identifying example guest contact details; QA documentation omits those details and future screenshots should obscure personal contacts.
- Shown figures for one Big Shade 2 Cottage Day Tour Nov 19: accommodation total **₱1,500**, full payment selected **₱1,500** due now, remaining balance **₱0**, entrance fee estimate **₱250**, estimated additional collection at arrival **₱250**. Entrance fee is excluded from immediate accommodation payment.
- **QA-19A desktop layout and displayed full-payment figures PASS.** This is NOT a proof-upload PASS, backend checkout PASS, or actual payment-record creation PASS; no submission performed.
- Source check `admin-walkin-payment.js`: Facebook/Messenger method limited to GCash/Maya and payment type supports 50% Down Payment or Full Payment. `updatePaymentBreakdown` recomputes selected payment and remaining from accommodation total; does not modify database upon select changes.
- **Next QA-19B (read-only UI):** Change Payment Type from Full Payment to **50% Down Payment**, retaining GCash and no proof file. Expect **₱750 due now**, **₱750 remaining**, **₱250 entrance estimate**, **₱1,000 estimated to collect at arrival**. Screenshot the updated Payment Breakdown and selected Payment Type. Do not click Submit Manual Reservation or upload sensitive proof.


### QA-19B — Manual 50% downpayment calculation (November 17, 2026)
- Tester screenshot: Front Desk manual Facebook/Messenger payment draft, Mode GCash, Payment Type `50% Down Payment`. Summary shows Accommodation Payment Selected **₱750.00**, Remaining Balance **₱750.00**, Estimated Entrance Fee **₱250.00**, Est. to Collect at Arrival **₱1,000.00**. These figures match a ₱1,500 accommodation total with 50% selected. Reminder text correctly separates entrance fee from immediate payment.
- **QA-19B calculation/select controls PASS** for the visible breakdown. Highlighted Amount to Pay Now card not visible in screenshot; do not claim its rendered amount independently verified. Proof screenshot remains `No file chosen` and transaction reference optional; no submission or payment performed.
- Next UI test: QA-19C switch payment method to `Maya / PayMaya` while keeping 50% Down Payment and no proof attached. Verify payment type retains selection, due amounts remain unchanged, and reference/upload helper text updates accordingly; do not click Submit Manual Reservation.


### QA-19C — Maya/PayMaya 50% downpayment selector (November 17, 2026)
- Tester screenshot on localhost `frontend/adminHTML/admin-walkin-payment.html` shows Mode of Payment changed to **Maya / PayMaya** while Payment Type remains **50% Down Payment**. Optional transaction reference input placeholder updated to **Optional Maya reference**. Proof Screenshot remains required, with no file chosen.
- Payment Breakdown values remain **Accommodation Payment Selected ₱750.00; Remaining Balance ₱750.00; Estimated Entrance Fee ₱250.00; Estimated to Collect at Arrival ₱1,000.00**. **QA-19C Maya UI selector and displayed calculations PASS.** No Maya transfer, proof upload, reservation submission, or DB write tested.
- Next visual regression QA: **QA-19D Manual Payment responsive 390 × 844** using browser DevTools, verify Reservation Summary, Payment Breakdown, Payment Details, Maya selector, required proof input and Submit button remain readable and do not horizontally overflow. Do not click Submit Manual Reservation or choose a real proof screenshot.


### QA-19D — Manual Payment 390px responsive tester result (November 17, 2026)
- Tester explicitly reported **PASS** for Stage QA-19D Manual Payment 390 × 844 responsive view. This is **tester-reported PASS**, with no screenshot supplied in this turn; exact mobile layout/field details have not been independently inspected here.
- QA-19D testing scope: Reservation Summary, Payment Breakdown, Payment Details, Maya selector, proof-upload control, Submit button and no horizontal overflow; no payment submission performed.
- Next Stage QA-19E: verify same Manual Payment screen at **440 × 844**, inspecting single-column layout, readable GCash/Maya controls, amounts, upload and Submit controls; do not submit reservation/payment.


### QA-19E — Manual Payment 440px responsive tester result (November 17, 2026)
- Tester explicitly reported **PASS** for Stage QA-19E on the Front Desk Manual Payment page with Chrome responsive **440 × 844**. Result is tester-reported; no screenshot provided on this turn. Expected scope: single-column cards, readable payment amounts/Maya controls, proof upload and Submit button, no horizontal overflow. No payment submission, proof processing or booking write was performed.
- **QA-19E tester-reported PASS.** Front Desk Manual Payment desktop, GCash 50%, Maya selector, 390px and 440px responsive visual stages now completed. Actual end-to-end manual payment / booking submission remains untested.
- **Next QA-20A:** Log out of Front Desk; log in with Admin test account; open **Reports** from Admin navigation on localhost. Confirm the Reports header, date range filters, and KPIs load. Initially view-only—do not create or delete database records. The local test database may have zero reservations, in which case one concise empty-state message should be displayed instead of nine oversized empty graphs. Send screenshot before advancing to chart/filter or A4 print testing.


### Stage AI-16 — New natural room overview before production release (November 17, 2026)
- **Owner paused release to finish AI improvements first.** GitHub PR #12 (`testing` → `main`) remains a **draft/unmerged**, and Aiven backup/migration preflight remains incomplete; no production deployment authorized by QA.
- New selected-room summary fast path in `backend/controllers/ai/aiAccommodationDetails.js` and `geminiChatController.js`; uses read-only local DB facts and zero Gemini calls for the simple `Tell me more about [selected room]` flow. Does not auto-confirm availability, booking, payment or refunds.
- New regression tests added. **13/13 AI behavior** + **4/4 chat UI static** checks PASS in an isolated mocked JS runner, but actual Node/local browser/Gemini PASS is **PENDING**.
- **Next tester Stage AI-16A:** Pull `testing`, restart backend; Customer → Accommodations → Single Room (Pool side) C → Ask AI About This → send prefilled detail question. Screenshot the whole chat (header, composer, room-specific answer). Verify fresh local DB facts, natural short reply, no check-in diversion. Do not share secrets or make bookings.
- Following stages AI-16B recommended room cards/context, AI-16C amenities & payment policy, AI-16D cross-page desktop/mobile widget, AI-16E live Gemini behavior/offline safety. Voice redesign intentionally deferred.
- The custom domain is still on `main`. Production Aiven `reservation_payment_proofs` and `reservation_no_show_audit` did not exist at preflight; required migrations and restorable full backup remain a separate release gate.


### AI-16A browser QA — selected Single Room (Pool side) C (November 17, 2026)
- User/tester supplied localhost Customer Accommodations screenshot with chat opened through **Ask AI About This**, sent **Tell me more about Single Room (Pool side) C.**
- AI responded: `Single Room (Pool side) C is listed for up to 4 guests. Listed details: Room accommodation for 2-4 pax. Listed rates: Day Tour ₱3,000; Night ₱3,000; please confirm the date and slot on the booking page.`
- **PASS (visible UI/behavior):** selected room identity, capacity 4, day/night listed ₱3,000, short room-focused response instead of check-in interrogation, no repetitive introduction, complete chat header and input/composer buttons. Voice panel is collapsed.
- **PARTIAL PASS overall:** reply does not enumerate Private CR / TV / Air Conditioned; it falls back to generic description `Room accommodation for 2-4 pax` even though production Aiven amenities for Poolside C had earlier been populated. **Do not assume local `smart_resort_test` has the same amenities**; the screenshot cannot prove backend SQL target. A generic description also duplicates capacity.
- **NEXT SAFE DIAGNOSIS:** In MySQL Workbench connected to the local backend test DB, perform read-only query for exactly `Single Room (Pool side) C` showing `id, name, amenities, description, max_capacity, day_price, overnight_price`; screenshot full text in amenities/description. Check backend DB target category (localhost versus Aiven) without exposing credentials. Do not change data until source verified. If amenities missing locally, choose safe test DB seed based on verified amenities; if nonempty, debug data path. Do not create bookings or pay.
- PR #12 draft; no `main` merge or live deployment during AI QA.


### AI-16B — Aiven poolside C amenities are populated, API facts differ (Nov 17, 2026)
- Screenshot of Aiven Workbench `defaultdb.accommodations` confirms record **ID 93, Single Room (Pool side) C**, `amenities` **nonempty**, beginning with `1 Double Size Bed`, `Private CR`, `TV`, and `Air Conditioned`; description `Room accommodation for 2-4 pax.`, max capacity 4, Day and Night price ₱3,000.
- **Aiven row/amenity data PASS.** But localhost AI overview in earlier screenshot took generic description. Source code `focusedRoomOverview` prioritizes nonempty amenities over description, so **API source and Aiven row do not yet agree**. Do not assume the `backend/.env` hostname proves the exact database: check effective `DB_NAME` and row returned by the same backend mysql2 pool; also rule out a stale backend process. Local Workbench `smart_resort_test` database was an unrelated older testing schema and Aiven query against it returned error 1049.
- NEXT READ-ONLY DIAGNOSTIC: from `backend` terminal, using its installed dotenv and `./config/db`, print `DATABASE()`, `id`, `CHAR_LENGTH(amenities)`, and the beginning of amenities for accommodation 93. Avoid printing credentials. No SQL writes and no `main` merge.


### AI-16B — Confirmed localhost Aiven restored-test amenities mismatch (Nov 17, 2026)
- Programmer screenshot from local VS Code `backend` PowerShell: automated tests **17/17 PASS, 0 FAIL**; backend server running `127.0.0.1:5000` and connected. Read-only mysql2 diagnostic `SELECT DATABASE(), id, name, CHAR_LENGTH(amenities), LEFT(amenities,120)` for accommodation 93 returns selected DB **`arvic_restore_test_20261020...`** (database name truncated by table width), room `Single Room (Pool side) C`, `amenities_length=NULL`, `amenities_preview=NULL`.
- Previous screenshot of same ID 93 in **production Aiven `defaultdb`** returned nonempty amenities beginning with 1 Double Size Bed / Private CR / TV / Air Conditioned, capacity 4 and ₱3,000 Day/Night. **ROOT CAUSE confirmed: test DB content differs from production**; this is why AI fast path used generic description instead of amenity list. GitHub room overview code is not proven defective.
- Do **NOT** switch backend `DB_NAME` to production `defaultdb` for interactive localhost QA; customer test bookings or payments could write to production. Do not modify `defaultdb` or its verified backup.
- Before any QA data synchronization, read-only compare DB identifiers and amenity lengths via backend's actual mysql2 pool; verify ID **and exact room name** on both sides. If the restored test schema is intended to remain a pristine restore-verification copy, create/use a separate QA schema rather than modifying it. Once QA copy is confirmed and protected, copy only documented amenity fields for required QA rooms into test schema and rerun AI-16A; no production writes.


### AI-16C — Cross-schema room 93 comparison confirmed (November 17, 2026)
- Programmer ran read-only cross-schema query through the localhost backend mysql2 pool. Result: effective database `arvic_restore_test_20261020`, id 93, `Single Room (Pool side) C`; same id/name in production Aiven `defaultdb`. Test `CHAR_LENGTH(amenities)` is **NULL**, production amenity length is **112**.
- **AI-16C diagnosis PASS.** Room preview fallback to old generic description is conclusively due to missing amenities in restored test schema; the AI code prefers nonempty amenities. No evidence of a Gemini hallucination or wrong-name selection in this path.
- Proposed narrow remediation, **NOT YET RUN**: copy only `defaultdb.accommodations.amenities` into `arvic_restore_test_20261020.accommodations.amenities` for **id=93** and matching exact name, only where test amenities is empty; verify `ROW_COUNT()=1` and read back. Production `defaultdb` is read-only source. Warn if restored test schema is an immutable recovery copy; use dedicated QA clone instead in that case.
- After successful readback, repeat Customer Accommodations → Single Room (Pool side) C → Ask AI About This → `Tell me more about Single Room (Pool side) C.`; expected short answer includes actual listed amenities. No backend restart is needed for data-only changes (new request re-queries DB). Keep PR #12 draft and `main` unmodified.


### AI-16D — QA room 93 amenities test-data sync result (2026-11-17)
- Programmer supplied MySQL Workbench screenshots of carefully scoped UPDATE from production `defaultdb.accommodations` into **test** `arvic_restore_test_20261020.accommodations` for **id=93**, exact matching name `Single Room (Pool side) C`, only if target amenities empty. `SELECT ROW_COUNT()` returned **1**. Read-back row ID 93 now has nonempty amenities beginning with **1 Double Size Bed; Private CR; TV; Air Conditioned**. SQL Action Output shows success.
- **AI-16D test-data sync PASS** for one row only; `defaultdb` was source-only. Only database-level symptom is fixed; **browser AI behavior retest still PENDING**. The user has not yet confirmed whether restored schema is an immutable restore-verification backup. Do not sync additional rows without explicit QA need.
- **NEXT AI-16E:** Customer Accommodations localhost, same **Single Room (Pool side) C** → Ask AI About This → send `Tell me more about Single Room (Pool side) C.`. Expected concise specific room reply listing 1 Double Size Bed, Private CR, TV, with 4 capacity and listed ₱3,000 rates. No repeated self-intro or check-in questionnaire; no confirmed booking availability claim. If old chat history is present, use New Chat in widget then reopen selected-room button. DB-only change requires **no backend restart** because handler re-queries on each request. Screenshot whole chat and report.
- PR #12 remains draft/unmerged pending AI QA plus production DB migration/backup; no production merge/deploy.


### AI-16E — Browser retest after test-DB amenities sync (November 17, 2026)
- Programmer screenshot from localhost Customer Accommodations → **Single Room (Pool side) C** → Ask AI About This, sent `Tell me more about Single Room (Pool side) C.` AI replied with **up to 4 guests**, listed **1 Double Size Bed, Private CR, TV**, Day Tour and Night **₱3,000 each**, and a date/slot booking-page verification note.
- **AI-16E PASS** for specific selected-room answer, short non-repetitive English tone, no check-in interrogation, correct listed three amenities and rates, visible AI header, collapsed voice options, and usable input/send controls. Root cause of prior generic answer was empty `amenities` on Aiven restored-test copy; sync of test row id=93 was previously confirmed. The test doesn't verify all 7 amenities or every room; it intentionally shows first 3.
- **Next AI-16F:** without changing selected room, ask `May sarili bang CR ito?`, verify concise affirmative Taglish reply names Single Room (Pool side) C and uses fresh DB amenities. Follow-on negative/unknown fridge question, recommendation-card context, cross-page widget UI and actual Gemini still PENDING. No booking/payment or production DB writes.
- PR #12 remains DRAFT/UNMERGED and `main` unchanged pending remaining AI tests and production backup/migrations.


### Production verification — live AI room D and follow-up (November 17, 2026)
- Owner screenshot on live custom domain `arvicseasideresort.com/customerHTML/rooms.html` shows chatbot successfully opened from accommodations and selected **Single Room (Pool side) D**. AI returned up to **4 guests**, **1 Double Size Bed, Private CR, TV**, Day Tour **₱3,000**, Night **₱3,000**, and requested date/slot verification on the booking page.
- Follow-up **'May sarili bang CR ito?'** was answered correctly in concise Taglish, referring specifically to Single Room (Pool side) D. Header, composer, Send, voice options (collapsed), translation, and window controls visible. **LIVE AI selected-room details and follow-up PASS** for this specific case.
- Screenshot also shows an initial generic 'Hi po! Anong accommodation...' greeting before 'New chat started'; do not claim greeting behavior completely fixed. Screenshot is NOT evidence of complete multi-page UI, all Gemini behaviors, payment capture, or API health across roles.
- PR #12 was merged into `main` at commit `a439f4d20e5ed3c30cdae84ca61ef627c0a5b685`. Vercel production deployment for that commit was verified READY and aliased to custom domain. **Important outstanding:** Production Aiven `reservation_payment_proofs` and `reservation_no_show_audit` tables were previously confirmed absent; full production backup and migrations pending. Do not attempt live FB/Messenger e-wallet submission or Admin No-Show until migration verification. Keep live payment/booking demos non-transactional unless separately cleared.


### Hotfix QA — AI recommendation card photos on live domain (2026-11-17)
- Programmer screenshot of `arvicseasideresort.com/customerHTML/rooms.html`: 3 recommendation cards for Single Room Cottage 1/2/3 all displayed **Photo unavailable** while text and View Details/Book This/Ask About This controls worked. Previous selected-room and amenities live replies passed.
- Code diagnosis: AI cards consumed only `room.image` with narrow path handling, and backend's `verifiedAccommodationCards` truncates image field to 700 characters; full catalog GET `/api/rooms/:id` also provides original cover and `gallery_images`. This can cause blank images for legacy or gallery-only listings.
- **Fix on testing and released to main**: `frontend/js/ai-chat.js` `setAiRecommendationPhoto` uses existing candidate, then read-only public room details GET by numeric room ID on failure/absence. Checks same room ID+exact name; tries real cover then gallery; rejects SVG data and unsafe paths; neutral placeholder only if no photo works. Added two no-network regression cases in `backend/tests/ai-customer-chat-ui.test.js`.
- 5/5 isolated simulated runtime checks passed (gallery fallback, wrong room protection, no unnecessary fetch, legacy data URI, SVG rejection). **Browser API end-to-end photo display PENDING**; if same cottages still have placeholders, inspect their actual cover/gallery records without production writes.
- **Release PR #13 merged** to `main` commit `e97172a604f9bc51e6a238a4156b915fa9bb8d55`; Vercel production deployment `dpl_7vZfBMbU5WzFH52DiZCrwJWVLjH3` verified READY with custom domain alias. No Aiven migrations or Render redeployment performed.
- **Next tester step**: Open live Accommodations page, Ctrl+Shift+R, ask `anong room ang pwede para sa 2?`, take screenshot of 3 AI recommendation photos. If still placeholders, inspect `GET /api/rooms/:id` image/gallery metadata before altering code. Stay clear of actual booking/payment. Production durable payment proof / No-Show migrations still outstanding.


### AI photo hotfix — live browser follow-up STILL FAIL (November 17, 2026)
- Programmer screenshot from live custom domain `arvicseasideresort.com/customerHTML/index.html` AFTER PR #13/Vercel READY and refresh. AI correctly recommended **Single Room Cottage 1, 2, 3** for 2 guests, but **all 3 images still displayed `Photo unavailable`**. This is a **browser visual FAIL** for image rendering despite 5/5 isolated helper tests and correct recommendation text/buttons.
- **Do not claim photo issue resolved.** Frontend path fix was insufficient; possible actual cover/gallery missing on these listings, unsupported legacy image values, or broken underlying media URLs. Exact root cause requires comparing production `defaultdb.accommodations.image` and `defaultdb.room_gallery.image_url` values for IDs 86, 87, 88, and optionally checking image requests in Browser DevTools Network. Existing Customer catalog does display some other room photos; it does not demonstrate photos exist for these three particular cottages.
- **Next step (READ-ONLY):** Query `defaultdb.accommodations` IDs 86,87,88 for cover image type/length/path prefix and correlated count/sample of `defaultdb.room_gallery` per accommodation. Never upload someone else's room's photo or synthesize an unverified photo. No production UPDATE/INSERT/DELETE. Depending on diagnostics, fix path mapping or use Admin Accommodation Management to upload the actual room photos, with owner approval.
- Teacher evaluation workaround: use `View Details` to show the actual accommodations; no need to test live payments. Existing PR #13 remains merged and should not be described as end-to-end PASS.


### AI photo investigation — photos exist in git; static URL diagnosis pending (Nov 17, 2026)
- Latest owner Aiven MySQL Workbench screenshot: production `defaultdb.accommodations` IDs 86/87/88 (Single Room Cottage 1/2/3) all have `a.image` **FILE PATH**, `cover_length=67`, reference starting `images/accommodations/Single-Room-Cottage/...`, and **gallery_count=2** each. These ARE nonempty references; mere metadata does NOT guarantee the URL loads.
- Read-only GitHub main branch tree confirms `frontend/images/accommodations/Single-Room-Cottage/single-room-cottage-1.jpg`, `single-room-cottage-2.jpg`, `single-room-cottage-3.jpg` all exist, as do `single-room-1.jpg`, `single-room-2.jpg`, `single-room-cover.jpg`. E.g. `images/accommodations/Single-Room-Cottage/single-room-cottage-1.jpg` is exactly **67 characters**, same as DB cover lengths; naming strongly suggests DB covers match repo, but actual full path was truncated in screenshot and not yet verified character-for-character. Do not conclude missing images or rename paths until checked.
- Current `frontend/js/ai-chat.js` maps `images/...` to `../images/...` (from `/customerHTML/index.html` maps to `/images/...`); it also falls back to GET `/api/rooms/:id` for cover/gallery on image error. Vercel frontend config has only root rewrite `/ → /customerHTML/landing.html`. Cause of live placeholder remains **UNVERIFIED**, despite code fix being merged and Vercel READY. Web inspection of static URL could not be established from server tools, and Vercel Git deployment source files API is not available.
- **Next, SINGLE DIAGNOSTIC**: in owner browser, paste known main-branch image URL `https://arvicseasideresort.com/images/accommodations/Single-Room-Cottage/single-room-cottage-1.jpg`. If visible, inspect actual rendered `img.src` in DevTools for recommendation card and network errors; if 404/broken, check static deployment routes, exact DB path, and file/filename casing. No production DB writes or speculative hotfix.


### AI preview image path — direct live Cottage 1 photo works (2026-11-17)
- Programmer visited `https://arvicseasideresort.com/images/accommodations/Single-Room-Cottage/single-room-cottage-1.jpg` in Chrome: screenshot displays the actual Cottage 1 photo successfully. Tab displays filename plus dimensions starting `(403...`; this is not sufficient evidence of HTTP 403. Static photo accessible in a top-level browser tab.
- Root cause is likely in **AI recommendation image path resolution**. The regular Customer Accommodations page resolves hosted `images/...` paths as absolute `/images/...`, while the AI widget used relative `../images/...`. Updated `frontend/js/ai-chat.js` resolver on `testing` to use an absolute `/images/...` on hosted pages and `/frontend/images/...` for locally mounted Live Server path `/frontend/customerHTML/...`. Existing fallback to verified gallery via public GET remains intact.
- Added exact path regression case to `backend/tests/ai-customer-chat-ui.test.js`; isolated JS UI/photo tests **7/7 PASS** with mock files/context, including earlier gallery fallback and wrong room safety. **Live card display still requires post-deploy screenshot**; don't call photo bug PASS before verifying.
- Original Aiven `defaultdb` records 86/87/88 and photo gallery data were inspected read-only; **no database changes**. The patch changes only Customer AI JS, its backend test file and QA log; no backend restart necessary.


### AI preview — direct image loads in live page, card still falls back (Nov 17, 2026)
- Live custom-domain mobile DevTools screenshot (440px) showed three `Single Room Cottage 1-3` recommendation card images with final DOM `src=data:image/svg+xml...` and `fallback=true`; all `naturalWidth=640` refer to placeholder dimensions, NOT real images. Saved AI recommendation room IDs were 86/87/88 and resolver produced `/images/accommodations/...` paths, confirming latest root-relative path handling active.
- Same live Console ran `new Image()` against `/images/accommodations/Single-Room-Cottage/single-room-cottage-1.jpg` and obtained `IMAGE LOAD PASS`. Live `GET /api/rooms/86` returned 200, matching Cottage 1 ID/name, expected cover path and 2 gallery images. Local VS Code Live Server screenshot shows actual photos in AI recommendation cards, while live domain still shows placeholders.
- Therefore: static photo exists and loads as a separate image from within live site; AI cards are **prematurely ending at fallback**. Code `setAiRecommendationPhoto` has `img.onerror=showNext` and permanent fallback when initial candidate/gallery candidates exhausted. Why the initial card `img` errors is still unproven. Possible load-state/race/URL error; **do not deploy a third speculative path-only hotfix**.
- NEXT: run simple read-only in-page `new Image()` probes for EXACT per-card `resolveAiRoomImage(room.image)` URLs and compare responses for IDs 86,87,88. If probes load but cards remain placeholders, instrument and repair `setAiRecommendationPhoto` (e.g., attach before assigning src, avoid lazy initial load/racy onerror, track candidate failure and retry verified static cover once). If probes fail, inspect Network status/referrer for exact URLs. Do not touch production DB or booking code.
- PR #14 root-relative image path fix deployed READY but **end-to-end live image QA still FAIL**.


### AI photo 404 root-cause confirmation and case-safe hotfix (2026-11-17)
- Programmer's latest Chrome DevTools Console screenshot on live custom domain (mobile 440px) ran per-card direct-image probes for **room IDs 86, 87, 88**. All three returned **FAIL** and HTTP **404 Not Found** for `/images/accommodations/Single-Room-Cottage/Single-Room-Cottage-1.jpg` (and -2.jpg/-3.jpg). Previously opening **lowercase** `/images/accommodations/Single-Room-Cottage/single-room-cottage-1.jpg` loaded successfully. GitHub main directory confirms files `single-room-cottage-1.jpg` through `single-room-cottage-5.jpg` are lowercase, with exact uppercase folder `Single-Room-Cottage`. **ROOT CAUSE: capitalization mismatch between stored database image filenames and case-sensitive Vercel file system**, not Gemini, not missing photos, not relative URL path, not photo API. Local Windows Live Server tolerates filename casing so test environment did not catch it.
- Implemented `testing` frontend-only correction in `frontend/js/ai-chat.js`: when a static accommodation path is exactly `images/accommodations/Single-Room-Cottage/Single-Room-Cottage-[1-5].jpg` (with optional `frontend/`), produce canonical file path `images/accommodations/Single-Room-Cottage/single-room-cottage-[1-5].jpg`. Keep folder capitalization and prefix for live `/images/` or local `/frontend/images/`. **All other accommodations' image paths unchanged**; normal read-only gallery fallback remains.
- Added regression test verifying exact 5 legacy filenames and hosted/local URLs as well as unrelated image case preservation. Isolated JS source checks **8/8 PASS** (NOT a live browser QA result). No Aiven updates, image renaming, backend changes, booking/payment change, or Gemini calls.
- After frontend production deployment, QA owner must hard refresh, New Chat, ask `Anong room ang pwede para sa 2?`, verify 3 actual photo thumbnails and optional in-browser network success for files, then mark final live image PASS. Do not claim photo PASS before screenshot.


### AI photo cards — final live verification PASS (2026-11-17)
- Programmer supplied **live domain** screenshot at `arvicseasideresort.com/customerHTML/index.html` after PR #15 deployment. In the AI response to `Anong room ang pwede para sa 2?`, all three recommendation cards (**Single Room Cottage 1, 2, 3**) visibly display their actual cover photos with names, capacity, Day/Night rates and working-looking View Details / Book This / Ask About This buttons.
- **AI recommendation preview image QA: PASS** for these three cottages on desktop browser. The earlier live 404 failures were caused by case-sensitive Vercel filenames (`Single-Room-Cottage-1.jpg` stored in database vs `single-room-cottage-1.jpg` deployed file). PR #15 canonicalized these verified legacy paths in the AI widget only; production deployment for merged commit `8f30940cac59399792296661296c5dbc0f89e6a3` was verified READY on the custom domain.
- This screenshot verifies image rendering only, **not** that every image, booking button, payment workflow, mobile layout, or Gemini fallback was independently tested. No Aiven data change, backend restart, or Render redeploy was required for this fix.
- **Next larger release gate remains pending**: production Aiven backup/migrations for `reservation_payment_proofs` and `reservation_no_show_audit`, plus final role-by-role production regression tests. Do not test payments on live site until cleared.


### AI-17 — Answer only the amenity asked, localhost-first (2026-11-17)
- Programmer supplied live chat screenshot: after selected **Single Room Cottage 1** overview, user asked **`may aircon?`**. Reply added **private CR**, **dining table**, and an unsolicited **availability/date** question. Room content itself was plausible but response was too long/off-topic for the requested natural receptionist behavior. **Behavior QA FAIL** for simple single-feature follow-up.
- User explicitly requested **implement on localhost/testing first**, NOT production. Code only on GitHub `testing`: `backend/controllers/ai/aiAccommodationAmenities.js` positive reply is now exact one-sentence `Yes po, may aircon ang Single Room Cottage 1.` (or short English equivalent). Unverified/negative or conflicting DB evidence still treated safely as before; no fabricated amenity facts.
- `backend/controllers/ai/geminiChatController.js` amenity route already reads selected room's fresh Admin-managed DB details by numeric room ID. Strengthened it to handle the specific older-client case where context retains the **exact room name but no ID**, via **parameterized SELECT by name LIMIT 2**, only when one unambiguous record exists. Rejects mismatched ID/name. This path reads DB only, returns before Gemini, and never changes bookings/payments; generic or ambiguous questions still use normal flow. Updated Gemini instructions so a one-amenity question does not list unrelated inclusions or append sales/availability questions.
- Added two regression cases in `backend/tests/ai-natural-recommendations.test.js` for user screenshot phrase, one-feature-only reply, no unrelated CR/dining table/date, English reply, private CR follow-up, unknown evidence and exact-name SQL safety. **15/15 isolated mocked AI unit/source checks PASS**; actual local Node/test DB/browser QA **PENDING**.
- **Localhost tester QA steps**: `git switch testing`, `git pull --ff-only origin testing`; run `cd backend`, `node --test tests/ai-natural-recommendations.test.js` and restart `node server.js` from `backend` only in development. Customer → Accommodations → choose a room → Ask AI About This → send room overview then `may aircon?`; expected ONE short sentence and no extra amenities/date/availability. Repeat `May sarili bang CR ito?`; expected only the listed private CR fact. Check negative or unknown ref separately.
- **QA dataset caveat:** Previous localhost backend pointed to Aiven schema `arvic_restore_test_20261020` which had **NULL amenities for room ID 93** until manual test-only sync from `defaultdb`. Data for Cottage 1 (ID 86) has NOT been verified in the restored test schema. Before testing Cottage 1, use SELECT-only `DATABASE(), amenities` for ID 86 through the backend-configured DB. Do not alter production Aiven `defaultdb`. A `No amenities listed` reply with NULL test data is not evidence the code change failed. Can instead first verify against populated local test room 93 (Poolside C) for QA.
- No code pushed or merged to `main`; no Vercel/Render deployment or production DB updates. An exact backend route mismatch on the live screenshot may be due to a stale deployed backend or lost client focus: **not independently proven**, so re-evaluate against localhost before any future live release.


### AI-17 owner request — shared database (November 17, 2026)
- Owner requested localhost backend and live domain to use the **same Aiven database** after seeing room ID 86 had NULL amenities in QA restore schema.
- Code verified: backend/server.js loads dotenv from local .env; backend/config/db.js uses process.env.DB_NAME. Owner may set local backend/.env DB_NAME=defaultdb and restart Node to connect directly to production. This is a **user-side configuration instruction**, not something the GitHub changes can apply to their gitignored .env.
- Major safety caveat: local booking, registration, payments, cancellation, admin edits and destructive tests would then **write to the live production database**. Use this shared setup only for temporary read-only AI queries; revert to DB_NAME=arvic_restore_test_20261020 before end-to-end tester QA. Future safer option is one-way copy of verified accommodation data to isolated QA DB.
- Await read-only backend verification SELECT DATABASE(), id, name, CHAR_LENGTH(amenities) for ID 86; no credential disclosure, no test bookings/payments. AI-17 concise amenity code still on testing only and is not yet proven on production Render.


### Stage FD-GuestRate-01 — Admin-controlled Extra Guest Rate ₱250 (Nov 17, 2026)
- Owner requested Front Desk **Guest Adjustment** field `Extra Guest Rate Per Pax` fixed at **₱250 per extra guest**, and rate editable by **Admin account only** if resort changes pricing. Screenshot had booked guests 5, actual guests 8, extra 3, previously paid ₱750, adjustable rate incorrectly entered 0. At rate ₱250 this results in **₱750 target**, **₱750 already paid**, **₱0 additional**.
- Implemented on GitHub **`testing` branch only** (do NOT merge or deploy before localhost QA): `backend/services/extraGuestRate.js` default 250, read DB `resort_settings`, Admin-only signed PUT `/api/guest-rate/admin`, Admin-only GET, FrontDesk-only GET `/api/guest-rate/frontdesk`; mounted in `backend/server.js`. `frontdeskGuestAdjustmentController` reads current rate via same booking transaction and **ignores browser-supplied `extra_guest_rate`** to prevent fee forgery. Existing already-paid charge preservation and additional unpaid difference calculation retained.
- Front Desk Guest Adjustment modal now shows a **read-only Admin-set rate**, refreshes on opening and before saving, and disables saves if it cannot verify the rate. Admin Profile page includes **Resort Pricing Settings**, with signed Admin rate GET/PUT, persistent MySQL setting update and client validation; CSS mobile/responsive.
- Added `database/migrations/2026-11-17_admin_extra_guest_rate.sql`. **Not applied to any DB**. Table-less read fallback 250 works for default Front Desk rate, but Admin PUT responds 503 until migration applied. SQL migration only to **isolated QA `arvic_restore_test_20261020`** first. Production backup/migration/approval remain pending.
- Regression `backend/tests/extra-guest-rate-admin.test.js` **5/5 isolated simulated checks PASS**, including forging Front Desk rate 0 and preserving backend ₱250 computation, Admin setting persistence, decimal validation and signed-route guards. **Actual `node --test` on tester PC and browser QA pending.**
- **CRITICAL**: Last local backend used `DB_NAME=defaultdb` (real production). Before any local Admin/FrontDesk charge test, restore `backend/.env` `DB_NAME=arvic_restore_test_20261020` and restart server. Verify active schema by backend SELECT DATABASE() and test reservation presence. Do NOT do pricing, booking, refund, charges, or migrations on production `defaultdb` during localhost QA.
- Full QA instructions in `docs/ADMIN_EXTRA_GUEST_RATE_LOCAL_QA_2026-11-17.md`. Current `testing` branch may be behind main merges; sync branches intentionally before later release. No production changes made by this stage.


### Stage FD-GuestRate-01B — Front Desk rate must not be clickable (2026-11-17)
- Programmer screenshot: Guest Adjustment showed correct Admin-set `250.00`, 2 booked / 5 actual / 3 extra, ₱750 calculated, ₱750 previously paid and ₱0 due, but the read-only number input remained clickable/focusable and showed the text caret.
- Follow-up implementation on `testing` branch only: added native `disabled` to Front Desk `#extraGuestRateInput` while retaining `readonly` for clarity, set `rateInput.disabled = true` when opening modal, applied disabled CSS with `pointer-events:none` and consistent normal text color, kept programmatic rate display/update and calculations intact. Only Admin Profile remains editable.
- Regression tests extended to assert disabled/readonly HTML, disabled JS, disabled CSS and Admin-signed endpoint controls. Isolated no-network suite **5/5 PASS**, not yet verified in tester's actual browser. No DB writes, no main/Vercel/Render deploy.
- Tester: from repo's current `backend` directory, run `git switch testing`, `git pull --ff-only origin testing`, `node --test tests/extra-guest-rate-admin.test.js`. Hard refresh local Guest Adjustment. Try clicking/tabbing the rate; expected no focus, no caret, no edits. Only test opening/reading on live production `defaultdb`; **do not click Save/Apply** or edit charges unless backend config has been switched to isolated test schema. Frontend file changes need only browser hard refresh, no server restart.


### Stage FD-UX-TABS-01 — Fixed Front Desk Operation Tabs (2026-11-17)
- Programmer requested **no long scrollable Front Desk action modal; one fixed card with clickable tabs instead**, citing screenshots of Guest Adjustment, Entrance Fee Adjustment, Add Accommodation. User also confirmed prior Admin-set ₱250 rate is nonclickable and Guest Adjustment amount ₱750 paid ₱750 due ₱0.
- Implemented on `testing` branch only reusable tab UI for **6** Front Desk Guest Management modal operations: Guest Adjustment (Guest Count / Charges & Review); Entrance Fee Adjustment (Guest Summary / Special Rates / Charges & Review); Add Accommodation (Choose Schedule / Review & Add); Extend Stay (Extend Stay / Review Extension); Extra Bed (Bed Quantity / Charges & Review); Additional Charges (Saved Charges / Add New Charge). Original DOM input IDs/buttons/event handlers preserved via node movement; no original logic rewritten. Tab bar supports click and arrow/Home/End keyboard; reopen resets to first tab; all original operation buttons in persistent footer. Fixed-height modal, responsive mobile compact CSS, optional scrolling **inside active tab only when physically unavoidable** (tiny phones or long charge history).
- New `frontend/frontdeskJS/frontdeskOperationTabs.js`, `frontend/frontdeskCSS/frontdeskOperationTabs.css`; only `frontend/frontdeskHTML/frontdeskGuests.html` gets extra script/link. Separate dynamically injected **Accommodation Balance, Collect Unpaid Charges, Final Checkout** financial modals purposely untouched until six-modal QA passes.
- New regression `backend/tests/frontdesk-operation-tabs.test.js` uses actual Guest Management HTML and mocked DOM. Mocked/isolated checks **4/4 PASS**; verified all 6 enhanced, tab switching + keyboard + reopen, all original IDs and action buttons preserved, reconciliation panel remains in Review, no new fetch/payment logic. **Real browser visual QA pending**.
- QA guide: `docs/FRONT_DESK_FIXED_OPERATION_TABS_QA_2026-11-17.md`. Tester should `git pull --ff-only origin testing` and run `cd backend; node --test tests/frontdesk-operation-tabs.test.js`, reload browser then check desktop and 390/440 mobile. On mobile, active tab content may scroll internally on short screens, but the modal shell and footer stay fixed.
- **Critical data safety**: local backend was previously linked to live Aiven `defaultdb`; do **NOT** click Apply, Collect, Remove, Save, Complete on localhost until `DB_NAME` verified as isolated test database. Tab viewing only is safe. No production merge or Vercel/Render/Aiven changes from this stage.


### Stage FD-UX-SLOTS-02 — Customer-style Front Desk time-slot availability (2026-11-17)
- User confirmed fixed tabbed **Add Accommodation** UI shown in screenshots, but wanted customer-style **Time Slot option statuses** directly in dropdown instead of only the availability message on the Review & Add tab.
- Implemented on GitHub **`testing`** only (no main/domain): `frontend/frontdeskJS/frontdeskAddSlotAvailability.js` checks all four slots with existing read-only `POST /api/bookings/check-item-availability` for currently selected accommodation/date and per-slot duration. `frontend/frontdeskHTML/frontdeskGuests.html` adds `Select time slot` placeholder + `addAccommodationSlotStatus` aria-live note. `frontend/frontdeskJS/frontdeskStay.js` resets selection on accommodation change/open, triggers preview, protects against stale async selected-slot checks, and preserves backend pre-save check. CSS in `frontend/frontdeskCSS/frontdeskOperationTabs.css` colors the status help block. Conflict/ended options are disabled; error displays **Unable to verify**, not falsely unavailable. Four-slot request cache 20 sec per room/date/duration with abort on changes.
- New `backend/tests/frontdesk-add-accommodation-slots.test.js` 5 isolated simulations **PASS 5/5**, including 4 slot statuses, disabled conflict, 3-day extended duration only for extended, network errors, stale response ignored, original selected-slot/backend save gates retained. Browser/Node on tester PC pending.
- QA guide: `docs/FRONT_DESK_ADD_ACCOMMODATION_SLOT_AVAILABILITY_QA_2026-11-17.md`. Next tester step: `git switch testing`, `git pull --ff-only origin testing`, `node --test tests/frontdesk-add-accommodation-slots.test.js` within backend, Ctrl+Shift+R localhost Guest Management, open Add Accommodation Choose Schedule, select room and date, inspect dropdown and screenshots. Backend connected to live `defaultdb` is **not safe to click Add/save**; preview-only until QA schema verified.
