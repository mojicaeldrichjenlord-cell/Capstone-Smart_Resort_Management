# Finding #017 — Admin-Reviewed No-Show: Release & QA Runbook

## Behavior
- **Manual Admin only**: Admin sees **Mark as No-Show** on Pending/Approved bookings only after the **last scheduled checkout** of *all* reservation items, when the reservation has **never** been checked in.
- The Admin must confirm the action; server re-verifies the same rules, locks the reservation row, and records the Admin ID, previous status, final checkout, and timestamp in `reservation_no_show_audit`.
- Updates **reservation_status only** to `no_show`. Does not refund, forfeit, collect, or change payment records, receipts or financial amounts.
- Closed `no_show` records remain visible in Admin, Front Desk, Manager, Customer and reports. No-Show is distinct from Cancelled.
- No automatic updates for historical pending/approved records, no cron job.
- Overlap checks exclude No-Show (and existing Cancelled/Rejected/Completed) bookings; date/time overlap validation still applies to active bookings.

## Deployment order
1. Keep work on the `testing` branch and test on isolated local MySQL. **Do not point a test backend to production Aiven.**
2. Back up the selected local database.
3. **Before migration:** `SHOW COLUMNS FROM reservations LIKE 'reservation_status';` and check the Enum. The migration is written for the existing sequence `pending, approved, cancelled, completed, rejected`; reconcile differences first.
4. Execute `database/migrations/2026-11-16_admin_reviewed_no_show.sql` **on local/test database only**.
5. Verify (read-only): `SHOW COLUMNS FROM reservations LIKE 'reservation_status';` and `SHOW TABLES LIKE 'reservation_no_show_audit';`.
6. Restart the testing backend and test via local UI.
7. Once approved by tester and project owner, back up Aiven and apply the reviewed migration **before deploying** the matching backend/frontend code. Do not merge or deploy prematurely.

## Isolated automated tests (from backend/)
```powershell
node --test tests/no-show-management.test.js
node --test tests/payment-proof-security.test.js tests/qa-payment-booking-release.test.js
```

## Manual QA scenarios
- A Pending reservation with final checkout already passed and never checked in: button present; Cancel confirmation leaves status unchanged.
- Confirm No-Show for a **dummy QA record only**: displays No-Show, removed from Active/Current, visible using No-Show and All Records filters.
- Verify readonly SQL before/after: `payment_status`, `paid_amount`, `remaining_balance` unchanged, no new payment_transactions or booking_charges created.
- Verify `reservation_no_show_audit` contains exactly one event with the correct `marked_by_admin_id` and `previous_status`.
- Future or currently active reservations: no button; direct API request returns HTTP 409.
- Multiple accommodation items: No-Show cannot be marked before **all** booked checkout times have passed.
- Checked-in or previously checked-in, Completed, Cancelled, Rejected, existing No-Show: no button and direct API returns 409.
- Front Desk / Manager / Customer tokens cannot call the Admin-only endpoint (401/403).
- After No-Show: Front Desk check-in blocked, manual cancellation blocked, payments preserved, availability not incorrectly blocked by No-Show record.
- Manager, Front Desk, Customer, and Admin reports show No-Show accurately. Charts count No-Show separately from Cancelled.
- Confirm the #006, #007, #008, and #012 retests still pass.

## Read-only audit query after a successful QA action
```sql
SELECT reservation_id, marked_by_admin_id, previous_status,
       scheduled_checkout_at, marked_at_utc
FROM reservation_no_show_audit
ORDER BY id DESC
LIMIT 10;
```

**Scope:** No destructive cleanup of legacy reservations, no automatic refund system, no API keys, no schema operations in production during QA.
