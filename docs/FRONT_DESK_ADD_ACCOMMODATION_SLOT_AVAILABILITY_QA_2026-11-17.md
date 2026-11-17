# Stage FD-UX-SLOTS-02 — Front Desk Add Accommodation: Live Time-Slot Status

## Requirement
Customer Booking already labels each native Time Slot dropdown option **Available / Unavailable**. Front Desk > Guests Inside > Add Accommodation > Choose Schedule should do the same **before choosing the time slot**.

## Implementation (GitHub `testing`, NOT main/domain)
- `frontend/frontdeskHTML/frontdeskGuests.html`: Time Slot select now starts with **Select time slot**, includes all four fixed choices and an `aria-live` status hint.
- `frontend/frontdeskJS/frontdeskAddSlotAvailability.js`: performs 4 read-only calls to the existing `POST /api/bookings/check-item-availability` endpoint after accommodation/date selection. Uses `mode:add`, current active reservation ID, chosen accommodation, date, per-slot duration (regular day/night always 1; extended uses selected 1–5 days).
- Displays category-appropriate fixed time ranges matching backend `buildSlotConfig`: Rooms day 7 AM–5 PM/night 7 PM–5 AM/22h; Cottages day 6 AM–5 PM/night 6 PM–5 AM/23h; Function 8 AM–6 PM/night 8 PM–6 AM/23h.
- Select option suffixes: **Available**, **Unavailable**, **Checking...**, **Unable to verify**. `Unavailable` choices disabled. Server/network failures must display **Unable to verify**, not pretend that the accommodation was booked.
- The UI caches the four-slot lookup for 20 seconds while switching the chosen slot; changes to accommodation/date/duration invalidate the cache. Aborted/outdated responses cannot overwrite the new selection. If a previously chosen slot becomes unavailable, clear it.
- Existing selected-slot availability gate and final **Add Accommodation** backend conflict/transaction check are still active. A green dropdown label is not a booking hold.
- `frontend/frontdeskJS/frontdeskStay.js`: reset time slot on new accommodation/operation; wire all-slot checks; validate selected schedule and discard stale selected-slot results. Pricing/unpaid balance unchanged.
- `frontend/frontdeskCSS/frontdeskOperationTabs.css`: compact status display inside the existing fixed tab layout.
- New isolated `backend/tests/frontdesk-add-accommodation-slots.test.js`: five tests covering 4 states, disabled booked slots, per-slot multi-day payload, errors, stale request responses, original backend conflict check. **5/5 passed via isolated mock JS evaluation**. Programmer's actual Node and Chrome visual QA still needed.

## Local QA Steps
1. In project backend VS Code terminal: `git switch testing`, then `git pull --ff-only origin testing`.
2. Run `node --test tests/frontdesk-add-accommodation-slots.test.js`. Expected: **5 passed, 0 failed**.
3. Refresh `127.0.0.1:5500/frontend/frontdeskHTML/frontdeskGuests.html` with **Ctrl + Shift + R**.
4. Front Desk > Guests > inside reservation > **Add Accommodation** > **Choose Schedule**.
5. Select an available accommodation. With a valid reservation date, open Time Slot: expected 4 choices with times and **Available/Unavailable** labels. Overlapping/ended options disabled.
6. Change reservation date. Confirm time slot statuses refresh (not old stale status).
7. Select an extended time slot and change **Stay Duration** to 2 or 3. Confirm statuses update using duration for extended slots only.
8. Select an available slot, click **Review & Add**. Confirmation preview should match selected accommodation, date, slot, price, and available status; the Add button should only enable after selected-slot backend verification.
9. Do not actually save on production DB. If backend target `DB_NAME=defaultdb` from previous configuration, opening/previewing is read-only but **Add as Unpaid Balance** would create a real reservation item. Switch to QA schema `arvic_restore_test_20261020` and verify it before clicking save.
10. Send screenshots of dropdown and Review & Add. Test mobile 390px/440px after desktop.

**Do not merge to `main` or deploy to domain until localhost QA PASS and programmer explicitly requests deployment.**
