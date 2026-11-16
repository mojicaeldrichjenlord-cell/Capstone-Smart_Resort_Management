# Stage Booking-17 — Manual Reservation Early Time Slot Availability (2026-11-16)

## Scope
Implement the same early fixed-slot availability visibility as Customer Booking on the existing `frontend/adminHTML/admin-walkin.html` page, which is shared by **Front Desk and Admin**. Changes are in the `testing` branch only.

## Functionality
- Display **Reservation Date before Time Slot**.
- After selecting accommodation/date, query the existing **read-only** `POST /bookings/check-item-availability` endpoint for the four configured slots, including extended slots and the currently selected duration.
- Show `Checking...`, `Available`, `Unavailable`, and `Unable to verify`. Only slots confirmed unavailable (or locally expired / in conflict with another selected booking item) are disabled. Unknown/network errors are NOT labeled "booked".
- Automatic refresh when room, date, duration, reservation type or another selected item changes. Discard stale responses via AbortController and use a short 15-second preview cache.
- Clear an already-selected slot if it becomes unavailable. Keep **Next to Payment** disabled until each booking item has a selected, server-verified schedule.
- Recheck all selected schedules immediately **before saving the manual payment draft**; stop if any server check fails or reservation selection changed.
- Existing backend conflict checks at actual booking creation remain unchanged.

## Different Manual Reservation Policies (preserved)
| Mode | Allowed dates |
| --- | --- |
| Walk-in | Today in Asia/Manila only; expired fixed slots blocked, but the onsite stay window is evaluated up to checkout |
| Facebook / Messenger | Today or any future date (NOT the Customer online two-days-ahead limit) |

Manual Reservation payment proof uploads, guest details, reservation creation, staff permissions and admin/Front Desk roles are untouched.

## Preliminary automated checks
- JavaScript parse: PASS.
- Isolated mock tests for status labels, disabled conflicts, error handling, time/date mode, overlapping slots, request caching and payment block: **6/6 PASS**.
- **Actual browser/API QA is pending.** No production or Aiven database write was performed.

## Tester: focused Stage Booking-17A
1. In the local `testing` branch, open the existing Front Desk **Manual Reservation** page as an authenticated staff member. Refresh the page.
2. Select a **Single Room** with a known existing test reservation. For a **Walk-in**, the date should be forced to **today only**. Check the Time Slot dropdown: an elapsed slot must say `Unavailable`, and a still-valid open slot should show `Available`.
3. Switch Reservation Type to **Facebook / Messenger**. Pick a specific **future date** that contains a known occupied booking. Confirm that booked/overlapping slot is `Unavailable` and disabled, while a free one can be selected. Do not assume availability without a known test booking.
4. Change the date. Confirm the statuses refresh and stale `Unavailable` labels from the previous date are cleared.
5. Change extended stay duration and verify the new full schedule is checked. Add a second item with the same room/overlapping slot; the conflicting slot must be blocked.
6. Confirm **Next to Payment** is disabled until every item is verified. If a network request fails, the UI should say `Unable to verify`, not `Booked`; the navigation remains blocked.
7. Check 390px and 440px mobile layouts plus desktop; the Time Slot dropdown, hint, and actions must remain readable.
8. **Do not complete a payment or create an actual reservation** during QA. Existing test data may be used for read-only conflict checks.

From the repository root:
```powershell
git switch testing
git pull origin testing
cd backend
node --test tests/manual-booking-early-slots.test.js
```

**Release gate:** static/isolated PASS; actual Front Desk/browser screenshots PENDING, no merge to `main` until tester PASS.
