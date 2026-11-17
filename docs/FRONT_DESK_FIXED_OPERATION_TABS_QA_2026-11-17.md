# Stage FD-UX-TABS-01 — Front Desk Guest Operation Tabs

## Goal
Replace tall, scroll-through modals with fixed-height cards, clickable section tabs, and permanently visible action buttons. **UI/UX-only**, no changes to underlying reservation/payment APIs or charge calculations.

## Scope (Front Desk → Guests Inside)
| Operation | Tabs | Always-visible actions |
|---|---|---|
| Guest Adjustment | Guest Count; Charges & Review | Apply; Cancel |
| Entrance Fee Adjustment | Guest Summary; Special Rates; Charges & Review | Apply; Collect; Remove; Cancel |
| Add Accommodation | Choose Schedule; Review & Add | Add as Unpaid Balance; Cancel |
| Extend Stay | Extend Stay; Review Extension | Add as Unpaid Balance; Cancel |
| Extra Bed | Bed Quantity; Charges & Review | Apply; Collect; Cancel |
| Additional Charges | Saved Charges; Add New Charge | Add Unpaid Charge; Cancel |

### Implementation
- `frontend/frontdeskJS/frontdeskOperationTabs.js` is a **progressive enhancement**. It moves original live DOM nodes (does not clone or replace them) into short tab panels. Existing element IDs, event listeners, validations and API calls are preserved. On a future re-open, the first tab is selected again. Tabs support click, **Left/Right Arrow**, **Home/End**.
- `frontend/frontdeskCSS/frontdeskOperationTabs.css` creates the fixed-height card, accessible tab bar, active panel and fixed footer. Mobile uses compact 2-column layout, with **inner active-panel scroll fallback ONLY where content physically exceeds a small viewport**; cannot guarantee zero scrolling for arbitrarily long saved-charge lists or tiny screen heights.
- `frontend/frontdeskHTML/frontdeskGuests.html` loads tabs JS/CSS on Guest Management page **only**, not other pages.
- Does not touch database, backend, admin fees, Gemini, Render, Vercel, current booking or payment logic.
- Separate finance-intensive modals **Accommodation Balance, Collect Unpaid Charges, Final Checkout** use dynamically inserted UI and are deliberately not modified in this stage. Test six static modals first before considering those three.

## Release / safety
All changes on GitHub `testing` branch only. **No merge into `main` and no live deployment.**

**CRITICAL**: The programmer previously changed the local backend to `DB_NAME=defaultdb`, which is live production Aiven. UI-only opening/tab switching on existing records is read-only; **do not click save, apply, remove, collect, or complete actions** until you have independently confirmed the backend is using the isolated QA database.

Suggested DB check from backend terminal:
```powershell
node -r dotenv/config -e "const db=require('./config/db'); db.query('SELECT DATABASE() AS db_name',(e,r)=>{if(e)console.error(e.message);else console.table(r);db.end();});"
```
Expected for writable QA: `arvic_restore_test_20261020`. A production DB result `defaultdb` means **no financial actions**.

## Localhost visual QA
1. On project repo (or already within `backend`), run `git switch testing`; `git pull --ff-only origin testing`.
2. In `backend`, run `node --test tests/frontdesk-operation-tabs.test.js`. Expected **4/4 PASS**. This is a mock DOM/structure test, **not an actual browser screenshot pass**.
3. Open `127.0.0.1:5500/frontend/frontdeskHTML/frontdeskGuests.html` and use **Ctrl + Shift + R**.
4. Open each of the **six** operations. Check that modal is fixed/centered, tab row visible, **no outer modal scroll**, footer buttons stay visible, long content only scrolls in its active tab if truly necessary.
5. Click each tab and use Arrow keys, Home/End on focused tabs; confirm the right panel appears and no fields get cleared between tabs.
6. **Guest Adjustment**: Guest Count should show Booked/Extra, Actual Guests input, and **disabled ₱250 Admin-set rate**. Charges & Review should show Calculated Total, Paid, Additional Due, and note. With 2 booked and 5 actual, expected 3 × ₱250 = ₱750; if ₱750 already paid, due ₱0.
7. **Entrance Fee Adjustment**: Guest Summary lists existing adjustment/actual guests/rates; Special Rates shows three counts and mandatory verification note; Charges & Review has full fee breakdown and, if relevant, overpayment reconciliation form and its confirm button. Make sure reconciliation is **not hidden by tab design** when backend toggles it.
8. **Add Accommodation**: Choose Schedule has accommodation, date, schedule, duration; Review & Add displays availability and unpaid-balance warning. Save button remains disabled until source code's normal availability check passes.
9. **Extend Stay / Extra Bed / Additional Charges**: verify tabs, pre-existing inputs/list, server statuses, and action footer.
10. Repeat at **desktop**, **390×844**, and **440×844** using Chrome Device Toolbar. Small phones may have an inner active-panel scrollbar for lengthy notes/lists but not one long outside modal.
11. Inspect Console for real JavaScript errors; screenshot UI on each tab or send consolidated screenshots for PASS/FAIL.

## Automated checks
- `backend/tests/frontdesk-operation-tabs.test.js`: tests actual page HTML under a lightweight DOM mock, all six modal configs, preservation of original IDs/buttons, tab click/keyboard behavior, re-opening reset, reconciliation panel location, CSS/JS wiring. Isolated simulation **4/4 PASS** (reported via connected GitHub source harness). Full `node --test` and browser visual QA pending on tester PC.

## QA safety rule
Do not call this stage fully PASS until the tester has checked the actual modals in Chrome and the backend DB target. Do not execute financial actions against production during visual QA.
