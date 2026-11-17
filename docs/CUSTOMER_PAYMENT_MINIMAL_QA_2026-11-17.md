# Stage Payment-18 — Customer Payment Minimalist UI/UX, QA deferred
**Date:** November 17, 2026 (Asia/Manila)
**Status:** Implemented on testing; isolated/static 6/6 PASS; actual browser/PayPal QA **NOT YET STARTED at the owner's request**
**Never perform a real PayPal charge or reservation in Aiven production to prove a visual change.**

## Actual changes
- Frontend Customer Payment HTML: \`frontend/customerHTML/booking-payment.html\`
  - Adds payment-only body class \`customer-payment-page\` and loads \`booking-payment-minimal.css\` after the legacy stylesheet.
  - Header becomes "Review and pay". Removes the redundant static "Payment Method = PayPal" card; PayPal remains explicitly selected by the **existing hidden** \`paymentMethod\` select.
  - Makes Reservation Summary, PayPal Checkout, Payment Breakdown and Resort Policies direct children of one responsive \`payment-grid\` with unique grid-area classes.
  - Human-readable breakdown labels: "Downpayment due now (50%)", "Remaining balance at resort", "Estimated entrance fee (onsite)", "Estimated total due at resort". These are label changes only; each ID and numeric calculation stays intact.
  - Retains exact six policy conditions, PayPal SDK custom element, customer note, reservation summary, confirmation modal, signing/session and JS script reference.
- CSS \`frontend/customerCSS/booking-payment-minimal.css\`
  - Page-only "Arvic Coastal Minimal": off-white page, white cards, slate text and borders, deep teal as the only ordinary accent; no orange policy boxes or dark navy breakdown.
  - The **downpayment due now** row is the one emphasized amount. Site policies are neutral numbered rows; real cancellation warning still uses its warning styles.
  - Desktop grid: summary/breakdown on top, PayPal/policies below.
  - At 950px and below, the layout order is summary -> breakdown -> PayPal -> policies. Extra mobile typography and spacing changes at 560px.
  - No changes to other staff payment pages or shared navbar CSS.
- New static regression test: \`backend/tests/customer-payment-minimal-ui.test.js\`.

## Things deliberately NOT changed
- \`frontend/customerJS/booking-payment.js\` (same file blob SHA as before this stage): **all signed-session, PayPal SDK/capture, payment success and failure logic, draft price calculation, data validation and receipt/booking creation untouched**.
- 50% of accommodation only due now, no entrance fee in online downpayment.
- Onsite remaining accommodation balance and estimated entrance fee (including potential extra ₱100/guest/day for consecutive pool/beach use per actual resort assessment).
- PayPal-only customer payment mode, policy wording, cancellation confirm logic and any GCash/Maya manual reservation workflow.
- Backend, database, Aiven data, production \`main\`, Render or Vercel live deployment.

## Automated preflight
- HTML structural nesting after grid refactor: PASS.
- 18 critical element IDs preserved exactly once: PASS.
- CSS balanced brackets and scoped rules: PASS.
- \`customer-payment-minimal-ui.test.js\` 6 isolated static cases: PASS.
- **Authenticated browser UI, dynamic value rendering, PayPal load/error/success, mobile sizing and payment-flow behavior: PENDING.**

## Test later, only when the Programmer explicitly authorizes batch QA
1. From the *latest* testing branch open Customer Booking -> Payment on an isolated safe test environment. Do not submit a real PayPal charge or new reservation. Confirm \`booking-payment-minimal.css\` was loaded and navbar/navigation still works.
2. On desktop >=1280px compare: white/off-white/teal treatment, summary left, breakdown right; PayPal card and policy card below. No clipped long descriptions or prices.
3. On 390px / 440px / 768px mobile/tablet: confirm order **Reservation Summary -> Payment Breakdown -> PayPal -> Policies**. No horizontal overflow, labels/warnings readable, SDK PayPal element not clipped.
4. Verify that the amounts shown in \`paymentAccommodationTotal\`, \`paymentDownpayment\`, \`paymentRemaining\`, \`paymentEntranceFee\`, \`paymentFrontDeskReminder\` and \`paypalDownpaymentAmount\` correspond to a known sample booking without rounding mistakes: 50% of accommodation due now, remaining + estimated entrance onsite. Do not claim onsite fees have already been paid.
5. Confirm optional note is still accessible, keyboard focus visible, and back navigation still triggers **Cancel payment process?** popup.
6. Check six full policies, including current real PayPal confirmation semantics, damage terms, staff additional charges, and succeeding-day pool/beach estimate. All policy text still accessible on narrow/mobile.
7. Using a safe PayPal **sandbox** environment only if previously configured and separately authorized, test loading/eligibility/error/success without changing any real Aiven/PayPal production account. Production payment smoke test requires separate explicit sign-off.
8. Browser Console and Network must have no layout-related errors and no accidental extra payment requests; recover cleanly on reload/back/forward.
9. Cross-page smoke checks: Customer Booking data, Front Desk Manual Reservation, receipts, all role navigation continue to work; no global CSS leaks.

## Later-run command from repo root
\`\`\`powershell
cd backend
node --test tests/customer-payment-minimal-ui.test.js
\`\`\`

## Release gate
Do not merge to \`main\` or deploy to \`arvicseasideresort.com\` until the classmate tester supplies screenshot-based PASS/FAIL for this stage and impacted booking/payment functions, and the owner approves the overall batch.
