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

## QA-17F — Added accommodation missing time-slot options (2026-11-17)

**Reported localhost symptom:** On Front Desk > Manual Reservation, Accommodation Item 1 had a populated slot dropdown and capacity. After adding Accommodation Item 2 and selecting **Beach Pavilion (Function Area)**, its Time Slot showed only "Select time slot", the status showed "0 of 4 slots currently show available", and Maximum Capacity remained "-". This is a UI-population problem, not proof all slots are booked.

**Targeted fix on `testing` only:**
- Manual booking cards now retain stable internal `data-item-id` identifiers after removing/re-adding an item. Only displayed "Accommodation Item N" titles are renumbered.
- Accommodation selection, duration, date, and preview updates use the clicked card reference, avoiding stale global ID lookups. Each card previews its own schedule.
- The live slot-status renderer restores missing four native dropdown options and capacity for an actual selected room before applying server-backed availability labels. It does **not** infer availability or bypass the existing final booking conflict check.
- Two isolated regression tests were added to `backend/tests/manual-booking-early-slots.test.js` for missing slots/capacity recovery and remove/re-add stable IDs.
- Backend routes, payment calculations, database schema/data, and the Customer Booking page are unchanged. **Browser QA not yet passed.**

**Programmer preflight:** JavaScript syntax compilation and targeted source checks passed. Actual Node test command and browser QA must still be run on the tester device.

**Tester retest (read-only, no reservations or payments):**
1. Pull `testing` after verifying the local working tree is clean; hard refresh `frontend/adminHTML/admin-walkin.html`.
2. From `backend`, run `node --test tests/manual-booking-early-slots.test.js` and send the PASS/FAIL summary.
3. In Front Desk Manual Reservation, select **TEST ROOM (Cottage)** for Item 1 and **Beach Pavilion (Function Area)** for Item 2 with a valid date. Both Time Slot dropdowns must contain four choices, and both Maximum Capacity fields must display database values.
4. Open Item 2 dropdown and verify available/unavailable/expired labels are shown after API verification (do not infer all-available from a count or current day). The summary must not claim "0 of 4" merely because the options are missing.
5. Remove Item 2, add another, reselect **Beach Pavilion**, and verify all four options/capacity still render and Item 1 is unchanged.
6. Choose a valid slot in Item 2; its own schedule/price preview should update without changing Item 1. Do not click Next to Payment until safe DB target is independently confirmed.
7. Screenshot the two cards, slot dropdown, and browser Console if FAIL. Verify the backend's database name/server identity separately because localhost can still point to Aiven production.

**Release gate:** No merge to `main` or live domain until owner approval and actual browser PASS.
