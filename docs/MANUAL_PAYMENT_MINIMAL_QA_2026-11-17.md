# Stage Payment-19 — Manual Reservation Payment Coastal Minimal UI/UX
**Date:** November 17, 2026 (Asia/Manila)
**Branch:** testing only
**Status:** Implemented HTML/CSS; 6/6 isolated static checks PASS; actual browser/API/payment QA DEFERRED at the Project Owner's request.
**Safety:** Do not create reservations, upload sensitive payment proofs or charge real money during UI testing. Check database connection before any later write: localhost may still connect to Aiven production.

## Purpose and files
Match the approved Customer Payment Coastal Minimal visual system without modifying any payment behavior.

- Updated frontend/adminHTML/admin-walkin-payment.html: page-only manual-payment-page body class, scoped CSS loaded last, simplified "Review and collect payment" headline and explanatory copy.
- Three existing sections are now direct grid children: Reservation Summary, Payment Details, Payment Breakdown. All 41 mapped critical IDs and current notes are preserved (summary, amount rows, form inputs, proof controls, method selectors, submit button and role navbar).
- New frontend/adminCSS/admin-walkin-payment-minimal.css: neutral white cards, very light slate background, muted text, subtle borders and deep teal accent #0f766e. No orange-looking ordinary rules or dark navy breakdown. Existing injected "Amount to Collect Now" card is restyled using higher-specificity scoped CSS, without touching its JavaScript or computed values.
- Desktop: summary/details left and breakdown/right; at 960px and below order is summary → breakdown → details; at 560px and below inputs/actions stack and remain touch friendly.
- New backend/tests/manual-payment-minimal-ui.test.js: six read-only static regression checks.

## Payment functionality deliberately preserved
- Walk-in: today/onsite date policy, Cash/GCash/Maya allowed, full accommodation payment, entrance fee estimated and collected separately.
- Facebook/Messenger: GCash or Maya only, either 50% accommodation downpayment or full accommodation payment, entrance fee at resort.
- GCash/Maya screenshot proof is required; transaction reference is optional and validated when supplied. Image format and size policy unchanged (max 8 MB).
- Existing script frontend/adminJS/admin-walkin-payment.js is unchanged; same dynamically updated Paid/Remaining/Total Collected rows, computed totals, proof controls, loading/disabled submit, existing duplicate payment safeguards, backend token validation and reservation creation workflow.
- Important role finding from checkStaffAccess(): this HTML lives in the Admin folder but the current payment controller **only authorizes Front Desk/staff** and redirects Admin and other roles. That authorization remains intact; do not claim Admin can submit manual payment without an approved separate authorization change.
- No backend, Aiven database, customer payment JavaScript, main branch, Render or Vercel production changes.

## Preflight vs later QA
- Original 41 form/amount IDs preserved exactly once: PASS.
- HTML section nesting and payment area mapping: PASS.
- Scoped CSS bracket sanity: PASS.
- Read-only isolated/static test cases: 6/6 PASS.
- Real browser, cash/GCash/Maya controls, proof image preview, mobile visual QA, actual API submission: NOT YET TESTED.

## Later tester workflow — ONLY after owner ends development phase
1. Confirm current branch and verify nonproduction DB; log in as Front Desk with valid secure session.
2. Check desktop ≥1280px: minimal visual style, fixed staff navigation, summary left, payment breakdown right, readable dynamic amount due and info notes.
3. Check 390px/440px/768px: summary → breakdown → details order, no horizontal overflow, full-width controls and safe area.
4. For a safe Walk-in draft: Cash/GCash/Maya, Full only, due now = full accommodation total, entrance estimate excluded; verify Total Collected row visibility and payment rules.
5. For a safe Facebook/Messenger draft: GCash/Maya only and downpayment/full options. Amount, Paid, Remaining, and onsite estimate must update without rounding or double-charging.
6. For GCash/Maya: proof required and reference optional, show/hide toggles and image preview, invalid format/oversize rejected; Cash hides those controls.
7. Check duplicate reservation guard, disabled/loading button, existing schedule validation, guest records/receipt integrations in a **safe isolated environment**, only after explicit authorization for writes.
8. Report screenshot-based PASS/FAIL; retest any fixes and all impacted customer/Front Desk/Admin workflows. Never expose signed tokens or proof images in logs/screenshots.

**Later command (repository root):** cd backend; node --test tests/manual-payment-minimal-ui.test.js

**Release gate:** Keep changes on testing; no production merge/deploy until authorized, and browser QA has passed.