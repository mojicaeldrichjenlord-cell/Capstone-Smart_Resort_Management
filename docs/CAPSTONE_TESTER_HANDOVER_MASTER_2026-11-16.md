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
- QA-19 Front Desk Manual Payment minimal layout: **QA-19A desktop/full payment PASS; QA-19B GCash 50% PASS; QA-19C Maya selector PASS; QA-19D 390px tester-reported PASS**; 440px and actual payment/submission NOT TESTED.
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
