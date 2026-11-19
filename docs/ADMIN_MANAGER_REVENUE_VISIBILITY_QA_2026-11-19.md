# Stage 21-D — Admin / Manager role-specific revenue visibility

## Owner request
- Rename the Admin dashboard's **Online Today** and **Manual Today** cards to **Online Reservation Today** and **Manual Reservation Today**.
- Remove **Financial Snapshots** from Manager Reports and **Recorded Reservation Payments** from Manager Dashboard.
- Revenue and recorded monetary totals should be visible to **Admin**, not Manager. Operational metrics should remain available to Manager.

## Changes on `testing` (no live deployment)
- Admin HTML label text only. Existing element IDs `onlineToday` and `walkinToday` remain unchanged; Admin totals / revenue calculations untouched.
- Manager Dashboard HTML/JS no longer renders or accesses the recorded payment metric; remaining tiles and recent activity still function.
- Manager Reports HTML/JS no longer contains financial snapshot sections; reservation status counts, guest counts, online/manual counts, reservation trend and top accommodation demand are preserved.
- Manager Overview API removes the recorded payment SUM from SQL **and** the JSON summary/notes.
- Manager Reports API removes booked accommodation value, cumulative paid amounts, and paid-charge queries; output summary and definitions contain no money fields. Non-financial reports still require signed Manager token and date range validation.
- Admin revenue reports remain in Admin pages and routes; Front Desk payment collection workflows are unchanged. Listing accommodation *prices* and reservation *payment statuses* for legitimate operations are separate from revenue reporting.
- No database migration, writes, booking logic change or PayPal configuration change.

## Test evidence
- New `backend/tests/manager-admin-revenue-visibility.test.js`: 5/5 checks passed in synthetic in-memory source harness (not real Node).
- Direct in-memory mock SQL/controller checks: Manager overview + reports returned non-monetary JSON only, 6 SELECTs across both endpoints, no paid amount or charge query.
- Existing Manager reports, role and UI tests were updated to enforce no monetary fields. Real `node --test` run is **pending**.

## Programmer local QA before release
1. Confirm clean `testing` branch, `git pull --ff-only origin testing`.
2. From backend run:
   `node --test tests/manager-admin-revenue-visibility.test.js tests/manager-reports-boundaries.test.js tests/manager-role-boundaries.test.js tests/manager-ui-polish.test.js tests/admin-report-revenue-disclosure.test.js`
3. Restart backend, refresh Admin / Manager localhost. Confirm Admin labels say Online Reservation Today and Manual Reservation Today, and Admin Today Revenue remains shown.
4. Manager Dashboard: 6 operational tiles and Recent Reservation Activity, **no Recorded Reservation Payments**.
5. Manager Reports: only Reservation Summary, Reservation Trend and Top Accommodations; **no Financial Snapshots or peso amounts**.
6. With an authenticated Manager, inspect Network `/api/manager/overview` and `/api/manager/reports`: no `recorded_reservation_payments`, `active_booked_accommodation_value`, `recorded_accommodation_payments`, `recorded_paid_charges`, or `paid_charge_rows`. Signed Manager still cannot call Admin-only reporting endpoints.
7. With an authenticated Admin, verify Admin dashboard revenue and Admin Reports financial cards still load.
8. Screenshot discrepancy from Nov 19: Admin Total Reservations showed 0 while Manager Overview showed 24. Confirm both fetched successfully and match all-record scope after load; if mismatch persists, log as separate bug (not part of role visibility edit).

Do not deploy to production `main` until real Node tests and role-based visual/API QA pass and the project owner approves.