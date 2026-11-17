# Stage Guest-Rate-01 — Admin-set Extra Guest Charge (LOCALHOST QA ONLY)

## Scope
- Default extra-guest charge: **₱250 per extra guest**.
- Front Desk > Guests Inside > Guest Adjustment: **read-only** rate, loaded from signed `GET /api/guest-rate/frontdesk`.
- Admin > Profile > **Resort Pricing Settings**: can edit rate and save it securely via `PUT /api/guest-rate/admin` (Admin signed token only).
- The backend intentionally **ignores** `extra_guest_rate` supplied in a Front Desk PUT request, and calculates charges using MySQL `resort_settings` read inside the guest adjustment transaction.
- Preserve already-paid Extra Guest Charge history and continue calculating **only the additional unpaid difference**.
- Change only `testing` branch for localhost QA. **DO NOT MERGE TO MAIN before user approves QA.**

## Database Safety — do this first
The programmer's last localhost `backend/.env` was changed to `DB_NAME=defaultdb`. That is **LIVE PRODUCTION**, even if the browser URL is `127.0.0.1`! In local `backend/.env`, restore:

```dotenv
DB_NAME=arvic_restore_test_20261020
```

Keep the original valid Aiven host/port/user/password. Restart `node server.js`. Independently verify that the **backend's configured database** is `arvic_restore_test_20261020` before **any write**. No local test bookings, payment collection, charge adjustments, or Admin pricing updates are permitted while `defaultdb` is active.

The Admin-editable rate requires the new `resort_settings` MySQL table. It **has not been deployed to Aiven by GitHub**. To apply on **QA schema only**, in Workbench first double-click `arvic_restore_test_20261020` and execute `SELECT DATABASE();` to verify target. Then execute `database/migrations/2026-11-17_admin_extra_guest_rate.sql` against the QA schema, explicitly ensuring the chosen active schema is `arvic_restore_test_20261020`.

Do not run the migration against `defaultdb` until all localhost tests pass and a separate production change window / backup is approved.

If the `resort_settings` table is missing, Front Desk GET safely returns the default ₱250 rate, but Admin PUT returns **503** ("storage is not installed") instead of falsely claiming the update persisted.

## Source files
- `backend/services/extraGuestRate.js` — authoritative price, validation, settings table.
- `backend/controllers/admin/extraGuestRateController.js` — Admin read/write handlers and Front Desk safe read handler.
- `backend/routes/extraGuestRateRoutes.js`, `backend/server.js` — signed roles; mounted at `/api/guest-rate`.
- `backend/controllers/frontdesk/frontdeskGuestAdjustmentController.js` — uses server-only rate during transactional calculation; ignores browser-sent price.
- `frontend/frontdeskHTML/frontdeskGuests.html`, `frontend/frontdeskJS/frontdeskGuests.js` — displays admin-set rate in read-only modal; refresh on open and pre-submit.
- `frontend/adminHTML/admin-profile.html`, `frontend/adminJS/admin-profile.js`, `frontend/adminCSS/admin-profile.css` — admin-only rate editor.
- `backend/tests/extra-guest-rate-admin.test.js` — no-network regression tests.

## Localhost test steps — use test database ONLY
1. At repo root: `git switch testing` then `git pull --ff-only origin testing`.
2. In `backend/.env`, set `DB_NAME=arvic_restore_test_20261020`, **not** `defaultdb`; restart backend.
3. Run `cd backend` then `node --test tests/extra-guest-rate-admin.test.js`. All 5 tests should pass with no DB writes.
4. In MySQL Workbench selected **QA schema**, apply the above migration if missing and verify `SELECT * FROM arvic_restore_test_20261020.resort_settings;`.
5. Log in to **Admin > Profile > Resort Pricing Settings**: should show **₱250**. Change it to **₱300** in QA and save. Reload; ensure ₱300 persists.
6. Log in to **Front Desk > Guests Inside > Guest Adjustment** on a **TEST ONLY checked-in booking**: read-only field now ₱300 and should not accept input. Try 3 extra guests; preview total ₱900.
7. If previously paid ₱750 for those 3 extra guests in the test data, additional due should be ₱150 (historical paid charge remains unchanged). Do not perform this on real reservations.
8. In Admin, set back to **₱250**; Front Desk re-open modal, should show ₱250. Test 3 extra guests => ₱750, or ₱0 due if ₱750 already paid.
9. Optional security test: attempt forged request `extra_guest_rate:0` in **isolated QA** only; server must report `extra_guest_rate:250` and compute by 250. Never attempt this test against live production.
10. Share screenshots of Admin save/reload, Front Desk rate display and computed charges. Only after PASS should the programmer request a production migration/merge/deployment.

## Expected behavior and policy
- Rate is resort-wide, not editable by individual Front Desk staff.
- Admin changes apply to subsequent guest adjustment calculations. **Past paid transactions are not rewritten.**
- When admin rate changes for a booking that already has extra guests/paid amounts, the current target total is recomputed from the verified extra guest count and the current rate, subtracting already-paid Extra Guest Charge rows. If this policy needs grandfathering old rates, discuss and implement before production.
- Booked guest count remains unchanged; actual guest count and unpaid difference are handled by existing transaction logic.
- Production proof-storage and No-Show migrations remain separate pending issues.
