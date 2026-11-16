# Stage Booking-16 — Early Time Slot Availability (Testing Branch)

## Purpose
Help Customer users see booked/unavailable time slots **before** completing the booking form and going to payment.

## Scope implemented
- Customer **Booking** page displays **Reservation Date before Time Slot**.
- After accommodation and reservation date are selected, the UI checks all four configured fixed slots against the existing **read-only** `POST /bookings/check-item-availability` endpoint.
- Each Time Slot option shows **Checking...**, **Available**, **Unavailable**, or **Unable to verify**. Only verified unavailable choices and conflicting choices within the customer's own multi-item draft are disabled.
- Date, accommodation and extended stay duration changes trigger new checks; stale requests are aborted and a short 20-second UI cache prevents needless repeat requests from changing the selected slot.
- If an already-selected slot becomes unavailable, the selected slot is cleared and **Next to Payment** remains blocked until a different slot is checked.
- The original per-item availability verification, final pre-payment recheck, actual booking-creation conflict prevention and **two-calendar-days-ahead** Customer policy remain unchanged.
- Backend and Aiven production database were **not edited**. No AI voice/UI changes or Gemini calls.

## Limits / accuracy
- **Available** means the schedule was available when checked. It is **not** a held or confirmed reservation.
- **Unavailable** may mean an existing reservation, ended schedule, disabled accommodation, or a conflict with another item in the same draft; the UI does not expose other customers' information.
- **Unable to verify** does NOT mean booked. That option remains selectable, but payment progression still requires a successful independent availability check.
- The calendar does **not** yet show fully booked dates with custom highlights. This stage adds status to the fixed **Time Slot dropdown after date selection**.

## Programmer checks
From the repository root:
```powershell
git switch testing
git pull origin testing
cd backend
node --test tests/customer-booking-early-slots.test.js
```
The standalone mocked JavaScript checks have been executed in the assistant runtime and passed 6/6; real browser/backend QA remains pending.

## Tester browser QA — DO NOT SUBMIT A REAL RESERVATION
1. Load `frontend/customerHTML/booking.html` on **localhost** from the updated `testing` branch. Hard refresh (`Ctrl+Shift+R`).
2. Select a known accommodation and a **future date at least two calendar days ahead**. Wait for **Checking...** to resolve.
3. Verify that an existing occupied test slot has an **Unavailable** label and cannot be selected. Confirm another open slot is selectable and shows **Available**.
4. Change the date; ensure status labels update for the new date, with no stale disabled slots from the previous date.
5. Change to Day 22/23 Hours or Night 22/23 Hours with **2–5 days** (where allowed); verify that the labels recheck for the longer span.
6. Add a second booking item for the same accommodation and overlapping schedule; make sure local conflict disables conflicting choices. Verify the payment button stays blocked for incomplete/unavailable choices.
7. Simulate failed connectivity only locally: options must say **Unable to verify**, not falsely **Booked**. The original pre-payment protection must still block if verification fails.
8. Check mobile widths 390px and 440px: options and hint are legible, no overflow, and date/slot controls work.
9. **Do not click the final payment or confirmation steps.** Test without creating reservations or changing payment records.

## Release gate
- Static/source checks: PASS.
- Isolated mock behavior checks: PASS (6/6).
- Actual authenticated browser + database conflict checks: **PENDING tester screenshots / PASS-FAIL**.
- No merge to `main` and no production deployment until QA approval.
