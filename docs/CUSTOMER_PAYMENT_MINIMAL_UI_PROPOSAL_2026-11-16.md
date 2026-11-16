# Customer Payment Page — Coastal Minimal Design Proposal (APPROVED & IMPLEMENTED)
**Date:** 2026-11-16
**Status:** Approved by the Project Owner and implemented as Stage Payment-18 in `testing` on November 17, 2026. Browser/PayPal QA deferred until the development batch is complete. See `docs/CUSTOMER_PAYMENT_MINIMAL_QA_2026-11-17.md`.
**Branch:** testing only

## Source files reviewed
- frontend/customerHTML/booking-payment.html
- frontend/customerCSS/booking-payment.css (legacy styles preserved)
- frontend/customerCSS/booking-payment-minimal.css (new payment-only override)
- frontend/customerJS/booking-payment.js

## Baseline facts before redesign
- Customer online checkout HTML is currently **PayPal-only** (hidden paymentMethod=paypal). It has an automated 50%-of-accommodation downpayment PayPal section, reservation summary, payment breakdown, and resort policies.
- IDs feeding the live breakdown include paymentAccommodationTotal, paymentDownpayment, paymentRemaining, paymentEntranceFee, paymentFrontDeskReminder and paypalDownpaymentAmount.
- Current breakdown is dark navy (#0f172a); policy uses warm orange/cream backgrounds and orange badges; PayPal/other surfaces are white/teal. The mixed treatments make the page look visually inconsistent.
- Payment terms: downpayment is 50% of accommodation ONLY; remaining accommodation balance and entrance fees are settled onsite; additional pool/beach use on succeeding days **may incur** ₱100/guest/day, subject to resort assessment. No refund system to be added. Policies and charges must remain correct.
- Existing PayPal payment/confirmation and exit-confirmation modal logic should not be changed in this stage.

## Recommended design — "Arvic Coastal Minimal"
**Palette (mostly neutrals + one brand accent)**
- Page background: #F8FAFC (very light slate/off-white), no saturated gradient.
- Cards: #FFFFFF with subtle border #E2E8F0 and radius 14–16px. Keep shadows mild, not elevated floating panels everywhere.
- Main headings/amounts: #0F172A; secondary labels: #64748B.
- Brand action color: #0F766E (deep teal), accent tint #F0FDFA.
- Use amber/red **only for actual warnings and errors**; not for every policy rule. Use blue only if provider-controlled/PayPal branding truly requires it.
- Typography: predictable sizes: main title 24–28px, card title 16–18px, body 14–16px, helper text 13–14px; no dense 0.78rem paragraphs for critical payment policy.

**Desktop layout (>= 900px)**
- Top: "Review and pay" headline + one concise payment explanation + back action.
- LEFT primary content (roughly 60–65%): Reservation Summary, Guest details when applicable, PayPal payment card.
- RIGHT (roughly 35–40%): Payment Breakdown first, Resort Policies below.
- One dominant visually highlighted number: **Downpayment due now** in teal on a light neutral background; other numbers standard typography.
- Breakdowns aligned in two columns, with thin dividers; separate "Pay now" from "Pay at resort" and estimated entrance fee without suggesting the estimated amount is charged today.
- Simplify dense policy box to 5–6 short readable rows with subtle dividers and accessible spacing; don't remove legal/payment conditions.

**Mobile layout**
- Single-column order should be: Reservation Summary -> Payment Breakdown -> PayPal payment -> Policy Reminder/acknowledgement, so the customer sees how much is due BEFORE paying.
- Keep the PayPal provider component visibly accessible, full width with no clipping; buttons/tap areas >=44px; totals don't overflow at 390/440px.
- Maintain checkout cancellation/exit warning modal and keyboard/focus accessibility. Do not modify its behavior.

**Suggested wireframe (concept, not a screenshot)**
[Review and pay]
[Reservation Summary]                     [Payment Breakdown]
[Guest / reservation detail]              [Accommodation total]
[Pay 50% using PayPal]                    [**Downpayment due now**]  (teal)
[PayPal SDK status and real button]       [Balance & entrance due onsite]
                                          [Resort Policies — plain numbered rows]
On mobile, the breakdown goes before the real PayPal payment block.

## Implementation boundaries once approved
1. First implement CSS/scoped HTML-only structural improvements in small commits, mapping all existing IDs/classes that JS updates. Do NOT remove IDs or event targets or PayPal SDK web component.
2. Keep amount computation, signed session, PayPal SDK create/capture/confirmation, verified booking schedule, reservation create, receipt handling and policy wording unchanged.
3. Avoid arbitrary "book now" substitute buttons: the existing PayPal SDK button is the real payment control.
4. Clearly distinguish estimates from charges; no misleading paid/confirmed state unless verified by backend.
5. Reuse CSS tokens; remove redundant legacy visual CSS only if not referenced elsewhere. Avoid global selectors that affect other pages.
6. Follow completed implementation with static checks then tester browser review across desktop, 390/440 mobile, zoom, long reservation summaries, PayPal loading/error/success, and cancel/return flow. Never run real payment on production as a UI test.

## Approval and implementation log
- Owner confirmed "okay sige" following the design proposal.
- `frontend/customerHTML/booking-payment.html` presentation/structure and new scoped `frontend/customerCSS/booking-payment-minimal.css` implemented on `testing`.
- `frontend/customerJS/booking-payment.js` and all backend and database/payment processing code remained unchanged.
- Static checkout safety checks: 6/6 PASS; actual authenticated desktop/mobile/PayPal/browser QA PENDING by user request.
- Full future test plan: `docs/CUSTOMER_PAYMENT_MINIMAL_QA_2026-11-17.md`; master handover: `docs/CAPSTONE_TESTER_HANDOVER_MASTER_2026-11-16.md`.
- No merge to `main` or live production deployment.
