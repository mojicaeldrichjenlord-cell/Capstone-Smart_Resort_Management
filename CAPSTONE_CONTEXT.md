# Smart Resort Booking System — Capstone Context

> Canonical project context for implementation, testing, and defense preparation.
> Working branch: `revision-phase1-landing-policy`
> Client: Arvic Seaside Beach Resort and Hotel, Naic, Cavite
> Last context refresh: 2026-09-04

## 1. Purpose

The Smart Resort Booking System is a web-based resort management and reservation system with role-based operations, automated and manual payment flows, guest management, reports, and AI customer assistance with voice recognition.

This file is the source of truth for permanent project decisions. If chat history conflicts with this file, verify the latest code/roadmap/changelog before changing implementation.

## 2. Technology Stack

- Frontend: HTML, CSS, JavaScript
- Frontend hosting: Vercel
- Backend: Node.js + Express
- Backend hosting: Render
- Database: MySQL on Aiven, managed through MySQL Workbench
- Repository: GitHub
- Email/OTP: Brevo
- AI: Gemini
- Automated online payment target: PayPal Sandbox for final defense

## 3. Five Official Roles

### Customer / Guest
Primary purpose: self-service resort inquiry, reservation, payment, and booking management.

Core functions:
- Register and verify account through email OTP
- Login/logout and profile management
- Browse accommodations, rates, capacity, amenities, images, and schedules
- View resort information and view-only resort map
- Check availability and create online reservations
- View booking summary and price breakdown
- Pay required online downpayment using PayPal Sandbox once Phase 2 is implemented
- Existing GCash/Maya proof-upload flow remains part of the manual payment lifecycle until intentionally migrated/retained
- View reservation/payment status and receipts
- Cancel eligible pending reservations
- Use AI customer assistant with English, Filipino/Tagalog, Mandarin, speech-to-text, and text-to-speech

### Front Desk Staff
Primary purpose: daily reservation, payment, arrival, stay, and checkout operations.

Core functions:
- View and manage operational reservation records
- Create manual walk-in reservations
- Create Facebook/Messenger reservations
- Review manual GCash/Maya proof submissions where applicable
- Handle Ready Today and Check-In / Allow Entry
- Manage guests already inside
- Verify actual guest counts
- Apply entrance-fee adjustments
- Handle extra beds and additional charges
- Collect unpaid onsite charges
- Add accommodation / extend stay after availability validation
- Calculate final outstanding balance
- Validate checkout
- Complete reservation and issue final receipt

Restricted from:
- Staff account administration
- Accommodation master-data configuration
- Resort map editing
- Management-only analytics

### Administrator
Primary purpose: superuser, system administration, configuration, and override authority.

Core functions:
- Create/manage Front Desk, Housekeeping, and Manager accounts
- Activate/disable staff accounts
- Manage accommodations, categories, rates, capacity, amenities, gallery/images, and availability configuration
- Manage resort map
- Access and override Front Desk operations when necessary
- Maintain role permissions and system configuration
- Review administrative records

Important rule:
Admin remains a superuser/override role. Cleanup may remove unnecessary duplicated UI, but must not remove Admin's ability to manage Front Desk operations.

### Housekeeping Staff
Primary purpose: preparation and accommodation schedule visibility.

Core functions:
- Login with role guard
- View today's schedule
- View arrivals
- View currently occupied accommodations
- View expected departures
- View accommodation assignment/details
- View guest counts
- View checkout/departure status

Restricted from:
- Payments
- Reservation approval/financial changes
- Accommodation configuration
- Management analytics

### Resort Manager / Owner
Primary purpose: read-oriented business monitoring and reporting.

Core functions:
- Management dashboard
- Revenue overview
- Reservation statistics
- Payment reports
- Occupancy/utilization reports
- Guest statistics
- Daily/monthly summaries
- Operational overview
- Read-only reporting where appropriate

## 4. DFD-Aligned Core Processes

The implementation must remain aligned with the approved DFD:

1.0 Account and Role Management  
2.0 Accommodation and Availability  
3.0 Reservation Management  
4.0 Payment Management  
5.0 Guest Management  
6.0 AI Customer Assistance  
7.0 Reports and Receipts  
D1 System Database

Before adding a feature, identify:
1. Which DFD process owns it?
2. Which role is authorized?
3. Which database records are affected?
4. Which roadmap phase/substep contains it?

## 5. Reservation and Payment Rules

### Online reservation
Target automated online payment:
- PayPal Sandbox
- 50% accommodation downpayment
- Backend creates and captures PayPal order
- Backend/webhook verifies payment
- Successful verified payment updates transaction/payment status automatically
- Final defense target is deployed PayPal Sandbox, not production merchant credentials

### Manual GCash/Maya flow
Current manual flow includes:
- GCash/Maya proof upload
- Payment submission and redirect
- Staff review/verification where applicable
- This remains part of the manual payment lifecycle unless intentionally migrated during Phase 2

### Walk-in
- Manual reservation
- Same-day allowed
- Cash
- Full payment
- Can proceed through Front Desk guest operations/check-in

### Onsite balances
Possible onsite amounts:
- Remaining accommodation balance
- Entrance fee
- Extra guest charge
- Extra bed
- Additional/custom approved charges
- Discounts/adjustments applied according to resort rules

## 6. Financial / Guest Rules

### Online accommodation downpayment
- 50% of accommodation amount for automated online PayPal flow

### Senior Citizen
- 20% discount on applicable entrance fee only

### PWD
- 20% discount on applicable entrance fee only

### Qualified kids
- Free according to resort height/qualification rule

### Extra Bed
- Current rule: ₱200 per bed
- Quantity tracked
- Paid/unpaid state tracked

### Guest Adjustment
Original booked guest count must be preserved.

Current verified behavior:
- Save actual onsite guest count separately
- Calculate extra guests against original booked guests
- Maintain structured Extra Guest Charge records
- Prevent duplicate unpaid charge rows
- Preserve already-paid Extra Guest Charge history
- If recalculated required total exceeds previously paid amount, create/update only the unpaid difference

Verified test on 2026-09-04:
- Booking ID: 48
- Booked guests: 6
- Actual guests: 10
- Extra guest rate: ₱250
- Required extra guest total: ₱1,000
- Previously paid Extra Guest Charge: ₱600
- New unpaid difference: ₱400
- Database verification: paid ₱600 row preserved + unpaid ₱400 row created

## 7. Guest Management Completion Target

Guests Inside should ultimately support:
- Booked guests vs actual guests
- Guest Adjustment
- Entrance Fee Adjustments
- Extra Bed
- Additional Charges
- Collect Unpaid Charges
- Add Accommodation / Extend Stay
- Final Balance Calculation
- Checkout Validation
- Checkout / Complete Reservation
- Final Receipt

Checkout must not complete while required outstanding charges remain unpaid.

## 8. PayPal Integration Principles

Phase 2 must include:
- Remove/migrate old PayMongo-specific implementation carefully
- PayPal Sandbox configuration
- Customer checkout button
- Backend Create Order
- Server-side 50% amount calculation
- Backend Capture Order
- payment_transactions persistence
- Automatic Partially Paid
- Automatic Confirmed
- Webhook + verification
- Idempotency
- Duplicate-payment protection
- Cancel/fail/success testing
- Deployed Vercel + Render Sandbox test

Critical rule:
Never trust the browser alone to mark a PayPal payment as successful. Backend verification and transaction persistence are required.

## 9. AI Assistant Boundaries

AI assistant should use real resort data where possible:
- Accommodations
- Availability/reservation policies
- Rates/rules
- Payment policies

Languages:
- English
- Filipino/Tagalog
- Mandarin

Voice:
- Speech-to-text
- Text-to-speech

Safety boundary:
AI cannot approve reservations, modify payments, apply discounts, or directly change booking records.

## 10. Development Workflow

Use this workflow for every implementation substep:

1. Confirm DFD process and authorized role
2. Check `IMPLEMENTATION_ROADMAP.md`
3. Check latest GitHub branch code
4. If local unpushed changes exist, upload the latest ZIP or push first
5. Implement one small substep
6. Restart backend when backend code changes
7. Run UI behavior test
8. Verify database records when persistence/financial logic changes
9. Test duplicate/error scenarios
10. Commit and push only after the step is verified
11. Update `CHANGELOG.md`
12. Update roadmap status
13. Move to next substep

## 11. Git / Branch Policy

Working development branch:
`revision-phase1-landing-policy`

Policy:
- Do active revisions on the working branch
- Do not merge unfinished work into `main`
- After a verified step, commit and push a clear checkpoint
- Final review happens before merge to `main`
- Uncommitted local VS Code changes are not visible through GitHub; upload a ZIP or push them when code review is needed

Suggested commit style:
`Step <phase/substep>: <short implementation summary>`

Example:
`Step 3F-B1: finalize paid extra guest charge difference handling`

## 12. Current Position

Current phase:
**PHASE 1 — Finish Front Desk Operations**

Completed:
- Manual reservation — Walk-in
- Manual reservation — Facebook/Messenger
- GCash/Maya proof upload
- Payment submit + redirect
- Ready Today / Check-In
- Already Inside collection UI
- Guest Adjustment finalization, including paid-charge difference handling

Next official task:
**Entrance Fee Adjustments**
- Senior Citizen 20%
- PWD 20%
- Qualified kids free
- Multiple adjustment types
- Correct final entrance-fee calculation

See `IMPLEMENTATION_ROADMAP.md` for the full official sequence.
