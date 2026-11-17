# November 19, 2026 — Controlled Live-Domain Booking Dry-Run

## Mandatory rules
- This is the **production domain**, connected to the current Aiven MySQL database. A 'test' reservation is a real DB record; it blocks accommodation availability and may appear in financial/occupancy reports.
- Never disable authorization, overlap checks, payment verification, 2-day customer booking policy, or staff role checks just to make a demo pass.
- No genuine bank/card/GCash/Maya transfer is needed for a demo. For Customer use **PayPal Sandbox buyer**, not real PayPal/real money; verify the environment before submitting. Front Desk can demonstrate the staff-recorded Cash workflow with a clearly identified non-customer TEST guest if the owner permits a recorded demonstration.
- Never upload fabricated proof as if a real transfer occurred. GCash/Maya screenshot flows must use genuine evidence; if no simulated/test payment available, test the validation/UI but not a fake paid transaction.

## Production preflight: Front Desk or Admin login
After deployment, sign into the domain as Front Desk or Admin, open F12 Console, paste:

```js
const token = sessionStorage.getItem('frontDeskToken') || sessionStorage.getItem('adminToken');
fetch('https://smartresort-backend.onrender.com/api/bookings/demo-readiness', {
  headers: { Authorization: 'Bearer ' + token }
}).then(async r => ({status:r.status, body:await r.json()})).then(console.log);
```

Never copy/send the token value. Only report the booleans, database name, paymentEnvironment, and missing required columns. This endpoint checks schema and config; it does **not** prove a complete booking or validate PayPal credentials with PayPal.
Also inspect the public GET `/api/paypal/config` in the browser Network tab. **Environment must say `sandbox`** for simulated Customer payment. Do not use a real buyer account if it says `live`.

## Customer online end-to-end dry-run
1. Log in on arvicseasideresort.com as a dedicated TEST customer. Use a valid test contact number belonging to the team (do not use another customer's identity).
2. Choose a real listed accommodation that is unoccupied on the desired **future** slot. If booking on November 19 in Manila, earliest Customer check-in is **November 21** (2 calendar days ahead). If pre-testing on Nov 18, earliest is Nov 20. Do not disable this rule.
3. On booking page select guest count, accommodation, date and fixed Day Tour/Night slot. Confirm the slot availability check responds.
4. Click Next to Payment. Confirm accommodation price, 50% downpayment, estimated remaining accommodation balance, and **separate** entrance fees.
5. Before PayPal approval, ensure `/api/paypal/config` reports `sandbox` and use test sandbox buyer credentials. The backend creates the pending reservation, then the sandbox capture should approve it.
6. Confirm receipt, Customer My Bookings and Admin Reservations show the **same reservation code and amounts**, approved/partially-paid state as applicable. Do not simulate PayPal approval by editing database rows.
7. On cancelled/failed PayPal checkout, inspect and clean up pending test reservation through authorized cancellation procedure; pending reservations can hold inventory. Capture receipt evidence only with dummy test data.

## Front Desk Manual Reservation dry-run
1. Log in as Front Desk. Open Manual Reservation. Select **Walk-in** for onsite same-day guest on November 19, or **Facebook/Messenger** for a future date. Only a non-expired slot may be selected.
2. Choose a different accommodation/slot from the Customer demo to avoid a legitimate double-booking rejection.
3. Add a second accommodation, verify four slot options where applicable, and validate capacity/time-slot UI for both cards.
4. For a controlled **walk-in Cash** example, use test guest information and declare the test reservation in customer note (e.g. `[DRY RUN NOV 19]`). The app records cash as fully collected and checks the guest in; do not claim actual revenue was received. The owner must reconcile these test rows in reports after demo.
5. Inspect reservation code, Front Desk Reservations, Guests Inside, Admin Reservations and receipt; check amounts/entrance separation and manual creator ID.
6. For Facebook GCash/Maya, **do not** submit with fake proof. Validate required proof handling; use an authorized sandbox/test scheme with truthful evidence if the client wants a fully paid demonstration.
7. Try booking an already-occupied slot (without submitting a second real reservation): expected Unavailable / 409 and no duplicate booking.

## Known blockers to look for
- 401: customer/staff signed session expired, role mismatch or password reset; re-login.
- 400: Customer date is <2 days away, mobile not 09XXXXXXXXX, proof mismatch or fixed slot already ended.
- 409: genuine overlapping accommodation/time window; select a different room/slot.
- 503: durable `reservation_payment_proofs` table missing for Front Desk e-wallet uploads; apply vetted migration only to the **correct backup-verified** production schema and re-check.
- PayPal SDK error: verify `/api/paypal/config` returns sandbox and credentials configured; UI alone does not prove successful capture.
- Backend 500: capture browser Network response with HTTP status + message and Render logs, never share tokens, payment IDs, passwords, guest PII.

## Cleanup and production sign-off
- Record each test reservation code, source, date and status in a local QA log. No real guest bookings should be deleted or modified.
- After demo, inspect authorized cancellation or administrative test-record reconciliation. Since walk-in cash records show as paid/checked-in, coordinate an **auditable** cleanup plan instead of directly deleting DB records or silently adjusting reports.
- Manual and online **live booking success remains unverified until actual test submits pass**. This document is a plan, not a PASS claim.