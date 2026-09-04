# Capstone Changelog

> Verified implementation checkpoints and important project decisions.
> Working branch: `revision-phase1-landing-policy`

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
