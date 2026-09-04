# Official Implementation Roadmap

> This is the canonical implementation sequence for the Smart Resort Booking System.
> Status refreshed: 2026-09-04
> Working branch: `revision-phase1-landing-policy`

Legend:
- ✅ Complete / verified
- 🔧 Current
- ⬜ Pending

## PHASE 1 — Finish Front Desk Operations

- ✅ Manual reservation — Walk-in
- ✅ Manual reservation — Facebook/Messenger
- ✅ GCash/Maya proof upload
- ✅ Payment submit + redirect
- ✅ Ready Today / Check-In
- ✅ Already Inside collection UI
- ✅ Guest Adjustment finalization
  - ✅ Original booked guests preserved
  - ✅ Actual guest count
  - ✅ Extra guest charge
  - ✅ Duplicate prevention
  - ✅ Paid-charge difference handling
- 🔧 Entrance Fee Adjustments — CURRENT / NEXT
  - ⬜ Senior Citizen 20%
  - ⬜ PWD 20%
  - ⬜ Qualified kids free
  - ⬜ Multiple adjustment types
  - ⬜ Correct final entrance-fee calculation
- ⬜ Extra Bed
  - ⬜ Quantity
  - ⬜ ₱200/bed current rule
  - ⬜ Unpaid/paid status
- ⬜ Additional Charges
  - ⬜ Damage
  - ⬜ Missing items
  - ⬜ Service/custom charges
  - ⬜ Extra guest difference charges
- ⬜ Collect Unpaid Charges
  - ⬜ Show all unpaid onsite charges
  - ⬜ Mark payment collected
  - ⬜ Prevent duplicate collection
- ⬜ Add Accommodation / Extend Stay
  - ⬜ Availability check
  - ⬜ Additional price
  - ⬜ Updated checkout schedule
- ⬜ Final Balance Calculation
  - ⬜ Accommodation
  - ⬜ Entrance
  - ⬜ Discounts
  - ⬜ Extra guests
  - ⬜ Extra beds
  - ⬜ Additional charges
  - ⬜ Payments already collected
- ⬜ Checkout validation
- ⬜ Checkout / Complete Reservation
- ⬜ Final receipt

## PHASE 2 — PayPal Sandbox Automated Online Payment

- ⬜ Remove/migrate old PayMongo-specific implementation carefully
- ⬜ PayPal Sandbox configuration
- ⬜ Customer checkout button
- ⬜ Backend Create Order
- ⬜ 50% accommodation downpayment calculation
- ⬜ Backend Capture Order
- ⬜ `payment_transactions`
- ⬜ Automatic `Partially Paid`
- ⬜ Automatic `Confirmed`
- ⬜ Webhook
- ⬜ Webhook verification
- ⬜ Idempotency
- ⬜ Duplicate-payment protection
- ⬜ Cancelled payment test
- ⬜ Failed payment test
- ⬜ Successful payment test
- ⬜ Deployed Sandbox test on Vercel + Render

**Defense target:** live deployed system + PayPal Sandbox. PayPal production/live merchant credentials are not required for final defense and can be post-defense rollout work.

## PHASE 3 — Housekeeping Role

- ⬜ Role access/guard
- ⬜ Today's schedule
- ⬜ Arrivals
- ⬜ Currently occupied
- ⬜ Expected departures
- ⬜ Accommodation assignment/details
- ⬜ Guest counts
- ⬜ Checkout/departure visibility
- ⬜ No access to payments or management functions

## PHASE 4 — Resort Manager

- ⬜ Manager dashboard
- ⬜ Revenue overview
- ⬜ Reservation statistics
- ⬜ Payment reports
- ⬜ Occupancy/utilization
- ⬜ Guest statistics
- ⬜ Daily/monthly summaries
- ⬜ Operational overview
- ⬜ Read-only management reporting where appropriate

## PHASE 5 — Administrator Finalization

- ⬜ Staff Account Management
  - ⬜ Admin creates Front Desk accounts
  - ⬜ Admin creates Housekeeping accounts
  - ⬜ Admin creates Manager accounts
  - ⬜ Activate/disable accounts
- ⬜ Accommodation Management cleanup
- ⬜ Category/accommodation configuration
- ⬜ Gallery/images
- ⬜ Map Management
- ⬜ Role permissions
- ⬜ Admin navigation cleanup
- ⬜ Preserve Admin as superuser/override role
- ⬜ Remove only unnecessary duplicated UI, not Admin's ability to manage Front Desk operations
- ⬜ Remove/deprecate legacy `rooms` / `bookings` dependencies if confirmed unused

## PHASE 6 — AI Customer Assistant

- ⬜ Migrate AI away from legacy `rooms/bookings`
- ⬜ Real `accommodations`
- ⬜ Real availability/reservation policies
- ⬜ Current resort rates/rules
- ⬜ Payment policies
- ⬜ English
- ⬜ Filipino/Tagalog
- ⬜ Mandarin
- ⬜ Speech-to-text
- ⬜ Text-to-speech
- ⬜ Safe boundaries: AI cannot approve reservations, modify payments, discounts, or directly change booking records
- ⬜ Final AI test on deployed site

## PHASE 7 — Full System QA

- ⬜ Customer permissions
- ⬜ Admin permissions
- ⬜ Front Desk permissions
- ⬜ Housekeeping permissions
- ⬜ Manager permissions
- ⬜ Online reservation lifecycle
- ⬜ Manual reservation lifecycle
- ⬜ Walk-in lifecycle
- ⬜ Facebook/Messenger lifecycle
- ⬜ PayPal payment lifecycle
- ⬜ GCash/Maya manual lifecycle
- ⬜ Double-booking tests
- ⬜ Overlapping date/time tests
- ⬜ Financial calculation tests
- ⬜ Senior/PWD/kid calculations
- ⬜ Extra guest tests
- ⬜ Extra bed tests
- ⬜ Charges tests
- ⬜ Extension/add accommodation tests
- ⬜ Checkout tests
- ⬜ Receipt validation
- ⬜ Customer mobile UI
- ⬜ Error handling
- ⬜ Basic security validation
- ⬜ Clean test data before defense

## PHASE 8 — Final Deployment

- ⬜ Aiven MySQL final schema/data
- ⬜ Render backend
- ⬜ Vercel frontend
- ⬜ Environment variables
- ⬜ CORS/API URLs
- ⬜ Brevo
- ⬜ Gemini
- ⬜ PayPal Sandbox credentials
- ⬜ Upload/storage behavior
- ⬜ Deployed 5-role testing
- ⬜ Full production-like end-to-end test
- ⬜ GitHub revision branch → final review → merge to `main`

## PHASE 9 — Documentation & Defense Preparation

- ⬜ DFD matches actual final implementation
- ⬜ Chen-style conceptual ERD
- ⬜ Database/schema documentation
- ⬜ Use cases
- ⬜ Role descriptions
- ⬜ Screenshots
- ⬜ Test cases/results
- ⬜ User manual
- ⬜ Technical documentation
- ⬜ Chapter revisions
- ⬜ Technologies/resources correction
- ⬜ Final defense demo accounts
- ⬜ Sample clean reservations
- ⬜ PayPal Sandbox demo
- ⬜ AI demo
- ⬜ Final defense flow/script

## Definition of Done

A feature is not considered complete just because a page exists.

A substep is complete only when applicable items are verified:
- UI works
- Backend works
- Database persistence/calculation is correct
- Role permission is correct
- Error/duplicate scenarios are handled
- Manual test passes
- Backend restart is performed when required
- Code is committed/pushed to GitHub
- Changelog and roadmap are updated

## Current Next Action

**PHASE 1 → Entrance Fee Adjustments**

Start with the existing guest/entrance-fee logic and finalize:
1. Senior Citizen 20%
2. PWD 20%
3. Qualified kids free
4. Multiple adjustment types
5. Correct final entrance-fee calculation
