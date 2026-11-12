# Smart Resort Booking System — Current Capstone Context

> Updated: 2026-10-14 (Philippine local date)
> Client: Arvic Seaside Beach Resort and Hotel, Naic, Cavite
> **Active development branch:** dev/admin-frontdesk-cleanup-2026-10-10
> **Release status:** development and isolated tests progressing; NOT yet certified production-ready or approved for final merge.
> Historical decisions and September 2026 tests are preserved in CHANGELOG.md. Validate this snapshot against current code, screenshots, and the active environment before making further changes.

## 1. Purpose and scope

Smart Resort Booking System supports accommodation discovery, online and manual reservations, online and onsite payments, staff guest operations, reporting and receipts, AI guest assistance, and independent turnover cleaning tasks. The system has five authorized roles. Its client-facing workflows must agree with the actual resort policies and the project's Level 0 / Level 1 DFD.

## 2. Current architecture and operating environments

- Frontend: HTML, CSS and vanilla JavaScript; local browser testing via VS Code Live Server (port 5500); hosted frontend platform is Vercel.
- Backend: Node.js and Express; local service usually port 5000; hosted backend platform is Render.
- Database: MySQL, hosted on Aiven. MySQL Workbench is the management client, not the database host.
- Services: Brevo-based email/OTP workflow, Gemini AI assistant, PayPal REST Orders / capture, and GCash/Maya proof-upload flow.
- Current frontend, backend, migrations and tests must all be read from the **active development branch**, not an older September branch.
- The Aiven database connection and any live PayPal credentials are real external systems. Never use them for destructive tests, unreviewed migrations, or regression scripts.
- Local MySQL restore was tested independently using smartresort_restore_test; the live Aiven defaultdb is a separate environment. Do not confuse these schemas.
- A deployed Vercel/Render site exists from previous work, but **deployment of the latest branch and complete production-like retesting remain unverified**.

## 3. Official roles and authorization boundaries

### Customer / Guest
- OTP account registration, login/logout, profile/password updates; browse resort rooms, categories, images, rate information and view-only map.
- Check schedules and availability, create eligible online reservations, see booking history, download permitted receipts, request modifications or cancel eligible pending bookings.
- Use PayPal checkout for server-calculated online accommodation downpayment; manual GCash/Maya evidence flows remain supported where applicable.
- Use Gemini guest assistant with English, Tagalog/Taglish, Mandarin and voice interaction.
- Customer must never gain access to another Customer's reservation/receipt or to staff operations.

### Front Desk Staff
- Create walk-in and Facebook/Messenger manual reservations; review payments/proofs, check in, verify actual guests, apply Senior/PWD/kid entrance adjustments.
- Handle extra guests, extra beds, additional charges, unpaid-charge collections, remaining accommodation balance, extensions, new accommodation items, checkout validation and receipts.
- Manual walk-in is same-day; Messenger/Facebook manual bookings may be today or later according to the server's date guard.
- Requires verified active Front Desk authorization for operational writes; does not administer staff, inventory masters, resort map, or management-only analytics.

### Administrator
- Admin booking overview, authorized reservation status operations, staff-account administration and permitted operational overrides.
- Configuration of accommodations/categories/rates/gallery/inventory/map, access to operational receipts and administrative pages.
- Admin remains a superuser in the approved design, but **each operational route has its own middleware**. An Admin token is not automatically a Front Desk token. Any required overrides must be explicitly designed and tested; do not silently bypass financial checks.
- Legacy admin booking functions may still exist. Do not expose direct-completion helpers in place of validated Front Desk checkout.

### Resort Manager / Owner
- Signed Manager-only login, operational overview, filtered reservation review and pending-only approve/reject, limited accommodation rate/status controls, read-only reports, Housekeeping assignment/reassignment and final cleaning verification.
- Reports distinguish booked value, cumulative payment snapshots, and recorded payments; none should be mislabeled as audited net revenue.
- Cannot act as Customer/Front Desk, bypass financial checkout, or collect charges merely by having Manager access.

### Housekeeping Staff
- Signed Housekeeping-only login; daily arrivals/departures/occupied/completed schedule (read-only) and assigned cleaning-task list.
- Assigned staff may move their own task: needs_cleaning -> in_progress -> cleaned. Manager alone verifies cleaned -> verified_ready.
- Housekeeping cannot change booking availability, reservation/payment status, prices, collect fees or access unrelated guest/payment records.

## 4. Current DFD alignment

The approved DFD is organized around these processes and D1 System Database:

1.0 Account and Role Management
2.0 Accommodation and Availability
3.0 Reservation Management
4.0 Payment Management
5.0 Guest Management
6.0 AI Guest Assistance
7.0 Reports and Receipts
8.0 Cleaning Task Management (added with the Housekeeping workflow)

The Level 0 and Level 1 diagrams were updated during the October Housekeeping work. A Housekeeping conceptual ERD was assigned to a groupmate; final ERD acceptance and complete paper cross-check are **not confirmed**. Keep data flows consistent with the actual role permissions and tables.

## 5. Reservation, pricing and guest rules

- Normal Customer reservations use advance-booking rules; historical requirement is 2 days ahead. Reconfirm the server's currently enforced earliest-date logic before final client sign-off.
- Manual walk-ins: same-day, cash/full onsite payment and staff check-in workflow. Messenger/Facebook manual entries have different allowed date rules.
- Online accommodation downpayment: 50% of official accommodation amount; remaining accommodation amount and applicable entrance fee are collected onsite.
- Entrance adjustments: Senior Citizen 20% and PWD 20% of **eligible entrance fees only**; qualified kids free according to the resort's actual rules. Multiple adjustment types can coexist; never discount accommodation price by accident.
- Extra bed: current configured resort rule is PHP 200 per bed, with quantity and paid/unpaid tracking.
- Guest adjustments: original booked guest count is immutable historical data. Save actual count separately. Recalculate extra-guest charge differences without deleting previously paid rows or adding duplicate unpaid charges.
- Additional booking charges: damage, missing-item, service/custom and applicable guest/bed difference charges have separate settlement histories.
- Add-accommodation/extend-stay operations must re-check date/time overlaps and update applicable balances without marking payments collected.
- Front Desk final checkout must block while required payments/charges or other eligibility checks remain unresolved.
- **Housekeeping Verified Ready is an inspection result, NOT automatic availability, a new booking, or proof of payment.**

Historical verification example retained from September 4: 6 original guests, 10 actual guests, PHP 1,000 required extra-guest fee, PHP 600 previously paid, new unpaid difference PHP 400; both paid and unpaid records were preserved. This is historical test evidence, not a live-customer transaction.

## 6. Data model and migrations

- Current reservation model includes accommodations / accommodation_categories, reservations, reservation_items, users, booking_discounts, booking_charges, payment_transactions, room_gallery, map_markers, and operational reconciliation data.
- The older rooms and bookings tables may still exist for compatibility. Do not remove them until code references and data migration are verified.
- Housekeeping tasks are stored independently in housekeeping_tasks (unique reservation_item_id, assignment/verification user foreign keys, status, optimistic version).
- The 2026-10-13 housekeeping SQL file is the reproducible schema definition, **not an instruction to rerun against Aiven**. In the October 14 MySQL Workbench test, the user verified that Aiven defaultdb.housekeeping_tasks existed with 5 foreign keys, 1 unique constraint, and initially 0 tasks.
- In a controlled follow-up test, completed reservation OCT-02-001 / Family Room A progressed needs_cleaning -> in_progress -> cleaned -> verified_ready. The reservation stayed completed/paid and the accommodation's listing status stayed available.
- A separate local backup restore and schema-count check was completed. Do not publish raw test records, passwords, or payment evidence in the repo.
- Additional SQL migrations (including the rejected reservation enum and entrance reconciliation) must be verified **per environment** before any new deployment. Never infer a production migration from a local test.

## 7. PayPal, uploads and AI boundaries

### PayPal
- Existing backend routes provide client configuration, authorized server-side order creation and server-side capture.
- Server computes the official 50% downpayment, checks order/capture amount and currency, and updates stored payment transactions only after verified capture. Tests cover authorization, double-payment and financial invariants.
- Default PayPal API endpoint in the service is Sandbox; a previous October 3-4 live test for PHP 1.00 succeeded and was visible in the merchant account. **That historical result does not certify the current branch's full deployment/payment behavior.**
- No PayPal webhook route is evident in the current Express route inventory; determine the project's webhook requirement and implementation/verification before release. Do not claim webhooks are complete.
- Test cancel, error, retry, reused order, capture reconciliation, customer refresh/back navigation, refund/correction and actual deployed Sandbox checkout before defense.

### Payment proof uploads
- GCash/Maya images are accepted by guarded upload endpoints. The backend currently uses local filesystem upload paths; file persistence, access control and retention on Render require a final deployment review.

### Gemini
- Reads resort data and can help explain accommodation/policy/availability, detect English/Tagalog/Taglish/Mandarin and use voice interactions.
- Safe behavior: no direct booking creation/approval, payment modification or arbitrary SQL changes from AI text.
- Gemini quota fallback, request handling and privacy tests exist, but deployed AI and microphone tests still require final browser QA.

## 8. Evidence and test interpretation (as of October 14)

- Latest user-run full **isolated** Node.js suite: 523 tests passed; 0 failed; 0 skipped. It excludes real MySQL concurrency integration.
- Housekeeping Manager-to-Staff workflow was exercised in the browser, with database screenshots showing verified_ready and unchanged reservation/payment/accommodation statuses.
- Housekeeping and Manager mobile layout were checked at a 440px responsive viewport; initial system-wide static HTML audit reviewed 32 pages.
- These results support isolated logic, role boundaries, and selected manual paths. They do **not** prove the complete live system is bug-free, all role paths are browser-tested, or PayPal live/Sandbox deployments are fully validated.
- The gated real InnoDB concurrency test requires a **disposable localhost MariaDB** instance with a restricted dedicated test user. Never point it to Aiven/defaultdb.

## 9. Known release gates and next priorities

1. Final desktop/mobile UI walkthroughs for Admin, Front Desk, Manager, Customer (Housekeeping largely smoke-tested).
2. Complete end-to-end booking/approval/check-in/financial reconciliation/checkout/receipt/Housekeeping flow, including failure/duplicate scenarios.
3. Real isolated local MySQL concurrency test; final role/privacy/security audit and migration consistency checks.
4. Confirm PayPal Sandbox deployed behavior, upload persistence, Brevo OTP and Gemini voice/quotas, environment variables and backend/frontend URL configuration.
5. Update screenshots, final DFD/ERD, use cases, manual, test evidence and client acceptance.
6. Review divergent main and development branches; **do not force push or merge without review and tests**.

See IMPLEMENTATION_ROADMAP.md for statuses and CHANGELOG.md for dated verification history.

## 10. Safe developer workflow

1. Inspect actual GitHub branch source, route guard, existing DB tables and DFD before edits.
2. Work in small, commented changes on dev/admin-frontdesk-cleanup-2026-10-10; preserve main.
3. Compare and document code changes; run syntax and isolated tests; restart backend only for backend/runtime changes.
4. Before any real DB write/migration: independently verify destination, obtain an approved backup and explicit authorization; test in disposable local DB when possible.
5. Check business process UI and MySQL/PayPal evidence only in authorized test environments.
6. Record PASS/FAIL with actual proof in CHANGELOG and update roadmap after every substantial milestone.
7. Keep secrets and personal guest information out of commits and screenshots.
8. Deploy only after full review and client sign-off.
