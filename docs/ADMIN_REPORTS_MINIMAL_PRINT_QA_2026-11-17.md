# Stage Reports-20 — Compact Admin Dashboard and Print Tables
Date: November 17, 2026 (Asia/Manila)
Branch: testing ONLY
Status: HTML/CSS/JS implemented; 7/7 isolated tests PASS; actual Chrome/browser/printer QA DEFERRED until Project Owner ends development batch.

## Implementation overview
- frontend/adminHTML/admin-reports.html: new reports-minimal-page body scope, new stylesheet loaded last, 9 original canvases/filters/KPIs retained, new No Data summary and print-only report detail area.
- frontend/adminCSS/admin-reports-minimal.css: Coastal Minimal off-white/white/slate/teal palette with compact KPIs, compact 220px desktop chart areas and 205px narrow-mobile chart areas; white cards, thinner borders and no oversized gradients.
- frontend/adminJS/admin-reports.js: only visual/chart palette, font, after-chart render presentation hook and print-preparation hook updated; all API calls, formulas and filtering functions unchanged.
- frontend/adminJS/admin-reports-presentation.js: 9 chart-derived print tables, one unified no-bookings message, individual zero-value chart placeholders; safely inserts database-derived accommodation names using textContent.
- backend/tests/admin-reports-minimal-ui.test.js: 7 read-only static/isolated mock tests.

## Screen behavior
- No bookings in selected range: display one clear No Reservations message instead of 9 huge empty graphs, while preserving all 7 KPI cards, 5 charge/reconciliation cards, error banner (if any) and estimates disclaimer.
- Bookings exist, but one graph has no values: show a short No recorded values placeholder, not a meaningless zero chart.
- Charts stay filtered by existing Admin selected dates, Chart.js still interactive; color hues are more subdued, including status distinctions.
- Dynamic refresh after switching date ranges should re-measure any canvas hidden in the previous filter result.
- Desktop uses two graph columns; mobile uses one column.

## Printed report behavior
- A4 portrait, 10mm margins for compact, readable printing. Browser print settings may override those defaults.
- Prints title, generated date, selected range, KPIs, paid charges, adjustments and financial-estimates disclaimer.
- Hides the 9 canvas-based charts on paper; instead prints 9 categories of concise tables derived from the same Chart.js datasets (outcomes, channel mix, most-booked, estimated category collections, guest counts by accommodation, slot usage, peak days, trend and cancellation).
- Prints first 8 nonzero entries of each table when needed; a note indicates if additional chart entries are available online. No invented numbers or claim that estimates are audited net revenue.
- For zero reservations, the paper report shows no trends explanation instead of huge blank graphs.
- Black/gray readable text with thin table lines minimizes ink. Page count depends on report data and browser/printer settings, so one sheet is NOT guaranteed.
- Chrome's URL/date/header/footer text is controlled by Chrome Print dialog Headers and footers; CSS cannot reliably remove it.

## Unchanged rules and safety
- Existing backend reports endpoints and signed Admin token, report filters, statuses, guest counts, booking summaries, paid additional charges, extra-bed overlap deductions, refunds, entrance corrections and financial estimates.
- Paid charge fetch errors must still show Unavailable rather than inaccurate zeros.
- Collection totals remain estimates from snapshots, not audited revenue. Preserve disclaimer.
- No write operations to Aiven, database migrations, booking/payment changes, changes to other roles or live production.
- Browser and printing QA were deliberately not run. Isolated tests are NOT an end-to-end PASS.

## Deferred tester checklist (ONLY after owner says all improvements complete)
1. Verify testing branch, localhost, signed Admin access and test-safe DB configuration.
2. Open date with no bookings; confirm no 9 huge blank graphs, accurate empty-state message and KPIs.
3. Filter date range with known reservations; verify 9 charts show matching values, no stale data after filter changes, and no broken canvas resize when switching empty/populated.
4. Check desktop widths 1280/1440 plus mobile 390/440/768: compact readable cards, no horizontal overflow; filter/reset/view unchanged.
5. Print Report in Chrome: verify A4 portrait, selected dates, overview KPIs, charge/reconciliation figures, financial disclaimer, category/period tables, and no oversized chart canvases.
6. Compare printed table values to screen chart datasets for reservation outcomes, source, popularity, collection by category, guests, slot usage, peak days, guest trends and cancellation.
7. Print no-data period: verify a concise paper report, no misleading tiny chart axes and no mostly-blank second page where print settings permit.
8. Test color vs B/W and optional Chrome Headers and footers; number of pages may vary with content.
9. Check Reports Console errors, Admin access, rest of dashboard and cross-role smoke tests; screenshots/print preview and PASS/FAIL required.
10. No merge to main or production until tester and owner approve.

Later command (project root):
cd backend
node --test tests/admin-reports-minimal-ui.test.js

Status: DEVELOPMENT; do not prompt the current user to run QA yet.