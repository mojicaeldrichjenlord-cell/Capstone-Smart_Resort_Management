# Capstone Changelog

> Verified implementation checkpoints and important project decisions.
> Current development branch: `dev/admin-frontdesk-cleanup-2026-10-10`; earlier entries below are historical.

## 2026-10-14 — Documentation sync and verified development checkpoint

**Documentation-only status reconciliation.** Previous September roadmap statements remain historical below; this section and IMPLEMENTATION_ROADMAP.md supersede them for current status.

- Active development branch is dev/admin-frontdesk-cleanup-2026-10-10; main remains unmerged. The branch was recently 305 commits ahead and 1 commit behind main at time of audit; recheck before merging.
- Working five-role design: Customer, Front Desk, Administrator, Resort Manager and Housekeeping. Manager is no longer accurately described as read-only: it can review pending reservations, edit approved accommodation fields and assign/verify cleaning tasks.
- Housekeeping Phase 1 schedule and Phase 2 separate task lifecycle are implemented. Aiven defaultdb.housekeeping_tasks was inspected with 5 foreign keys and one unique task-per-item constraint. User tested OCT-02-001 / Family Room A through needs_cleaning -> in_progress -> cleaned -> verified_ready. Booking completed/paid and room status available were unchanged.
- Local independent SQL restore was tested separately; do not conflate restored localhost schema and live Aiven.
- PayPal REST checkout/order/capture and signed authorizations exist. An earlier live PHP 1.00 smoke payment succeeded; current-branch deployed Sandbox full-cycle and webhook decision remain pending. Do not call these production-ready based on isolated tests.
- Front Desk additions include guest count reconciliation, entrance discounts, extra beds, separate operational charges, onsite balances, extra accommodation/extension, checkout blocks and receipts. Many isolated checks passed; full integrated financial journey is still pending.
- Gemini assistant includes multilingual intent, resort queries, resilience fallback and voice tests; final device and deployed checks pending.
- Full **isolated** automated Node.js regression run reported **523 passed, 0 failed, 0 skipped** on October 14. The local real MySQL concurrency integration suite is excluded.
- Static HTML audit covered 32 frontend pages; Admin/Customer action button accessibility fixes and Housekeeping mobile UX improvements were committed.
- Code comment audit inspected 196 source files: 13 missing file-level comments were updated. Four later documentation batches explained 133 additional important functions. A Manager/Housekeeping code study guide was also added.
- Level 0 and Level 1 DFD updated to include 8.0 Cleaning Task Management; groupmate preparing conceptual Housekeeping ERD. Final paper consistency/adviser sign-off pending.
- Release gates: five-role browser QA, complete reservation/payment/receipt end-to-end tests, actual local InnoDB concurrency, latest-branch staging, upload persistence, documentation, client acceptance and safe development-to-main merge.
- This checkpoint updates project documentation only; no application logic, migrations, payments or deployments should be changed by this documentation commit.

## 2026-10-13 — Manager and Housekeeping expansion (implementation history)

- Added dedicated Manager signed session, overview, reservation approve/reject for pending records, accommodation operations, reporting and associated role-security tests.
- Added Housekeeping signed session, privacy-limited daily schedule, task table migration and Manager-assigned turnover workflow.
- Verified task isolation from reservation, payment and room availability writes; strengthened version/role protections.
- Added migration for rejected reservation status after identifying historical enum compatibility requirements.
- Refined Gemini language classification, fallback behavior and request usage metrics.

## 2026-09-04

### Step 3F-B1 — Guest Adjustment paid-charge difference fix — VERIFIED

Implemented/verified:
- Original booked guest count remains unchanged
- Actual onsite guest count is stored separately
- Extra guest total recalculates from actual vs booked guests
- Duplicate unpaid Extra Guest Charge prevention is preserved
- Previously paid Extra Guest Charge records are not deleted or overwritten
- Only the remaining unpaid difference is created/updated

Verification case:
- Booking ID: 48
- Booked guests: 6
- Actual guests: 10
- Extra guest rate: ₱250
- Required total Extra Guest Charge: ₱1,000
- Previously paid: ₱600
- Additional amount to collect: ₱400

Database verification:
- Existing ₱600 Extra Guest Charge remained paid
- New ₱400 Extra Guest Charge remained unpaid
- Paid history was preserved correctly

Result:
**Step 3F-B1 is functionally complete.**

Next implementation:
**Entrance Fee Adjustments**

### Official roadmap confirmed

The project will follow nine phases:
1. Finish Front Desk Operations
2. PayPal Sandbox Automated Online Payment
3. Housekeeping Role
4. Resort Manager
5. Administrator Finalization
6. AI Customer Assistant
7. Full System QA
8. Final Deployment
9. Documentation & Defense Preparation

### Payment direction confirmed

- PayPal Sandbox is the target automated online payment integration
- Online PayPal flow targets a 50% accommodation downpayment
- GCash/Maya proof upload remains part of the manual payment lifecycle
- Old PayMongo-specific implementation will be removed/migrated carefully during Phase 2
- Final defense does not require PayPal production/live merchant credentials

### Role architecture confirmed

Five roles:
- Customer / Guest
- Front Desk Staff
- Administrator
- Housekeeping Staff
- Resort Manager / Owner

Admin remains a superuser/override role. Housekeeping remains restricted from financial/management functions. Manager focuses on monitoring/reporting. Front Desk owns daily guest operations.

## Workflow Rule Going Forward

After each verified implementation substep:
1. Test UI behavior
2. Verify DB when relevant
3. Test duplicate/error behavior
4. Restart backend if backend code changed
5. Commit and push
6. Update this changelog
7. Update `IMPLEMENTATION_ROADMAP.md`


### GitHub source-of-truth setup applied

Created and committed:
- `CAPSTONE_CONTEXT.md` — canonical project decisions, five roles, DFD alignment, payment rules, and development workflow
- `IMPLEMENTATION_ROADMAP.md` — official nine-phase roadmap with current status
- `CHANGELOG.md` — verified implementation checkpoints

Step 3F-B1 tested implementation was also synchronized to the working branch:
- `backend/controllers/frontdeskGuestAdjustmentController.js`
- `backend/routes/adminBookingRoutes.js`
- `frontend/frontdeskHTML/frontdeskGuests.html`
- `frontend/frontdeskJS/frontdeskGuests.js`
- `frontend/frontdeskCSS/frontdeskGuests.css`

Current source-of-truth status:
- Step 3F-B1: ✅ complete and DB verified
- Next task: 🔧 Entrance Fee Adjustments
- Active working branch: `revision-phase1-landing-policy`


### Step 3F-B2 — Entrance Fee Adjustments — IMPLEMENTED / TEST PENDING

Code added on the working branch:
- Front Desk Entrance Adjustment action for checked-in guests
- Senior Citizen 20% entrance discount
- PWD 20% entrance discount
- Qualified Kid free entrance
- Multiple adjustment types in one reservation
- Backend recalculation based on verified actual guest count
- Accommodation included free-entrance pax applied before Senior/PWD/Kid adjustments
- Gross entrance fee, total deduction, and final entrance fee returned by the API
- Front Desk modal shows actual guests, included free pax, chargeable guests, entrance rate, gross fee, deductions, and final fee
- Receipt endpoint now returns all entrance adjustment rows rather than only one
- Guest list API now exposes entrance adjustment totals and adjusted entrance fee values

Verification still required before marking complete:
- Restart backend
- Pull latest working branch locally
- UI test with Senior only
- UI test with PWD only
- UI test with qualified kid only
- UI test with Senior + PWD + Kid together
- Database verification of booking_discounts rows
- Confirm booking_discounts has a composite unique key for (booking_id, discount_type)
- Verify reservations.estimated_entrance_fee / entrance_fee_collected / entrance_fee_paid behavior

Current roadmap status:
**Step 3F-B2 remains 🔧 until UI + DB verification passes.**
