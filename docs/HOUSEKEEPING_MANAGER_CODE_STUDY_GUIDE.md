# Smart Resort — Manager & Housekeeping Code Study Guide

> For capstone review. The real resort database is on Aiven; **never run test writes or migration scripts on live data without a reviewed backup and explicit approval**.

## 1. How to read the code

The application has three layers:

1. **Frontend HTML/CSS/JS** — displays information, collects inputs and sends API requests. It cannot authorize itself.
2. **Express routes and authentication middleware** — checks the signed role-specific token and current DB role/account status on **every** protected call.
3. **Controllers and Aiven MySQL** — validates inputs, performs permitted queries and returns safe API data. MySQL constraints provide the final protection against duplicates.

Follow the request path: **Button → JavaScript fetch → Express route → auth middleware → controller → SQL query → response → UI refresh**.

All code comments use concise, simple English so the implementation is easy to defend.

## 2. Housekeeping — Phase 1 schedule

| File | Purpose |
| --- | --- |
| `backend/middleware/housekeepingAuth.js` | Issues and verifies signed `hk1` tokens; checks live user role, verification and account status |
| `backend/controllers/housekeeping/housekeepingScheduleController.js` | Read-only booked accommodation schedule and staff profile; excludes guest contacts/payments |
| `backend/routes/housekeepingRoutes.js` | Protects every Housekeeping endpoint |
| `frontend/housekeepingHTML/housekeepingDashboard.html` | Staff dashboard markup and semantic sections |
| `frontend/housekeepingJS/housekeepingDashboard.js` | Fetches authenticated schedule and renders safe text |
| `frontend/housekeepingCSS/housekeepingDashboard.css` | Responsive schedule, status badges and task controls |
| `backend/tests/housekeeping-role-schedule.test.js` | Mocked signed-login, privacy, and read-only access tests |

**Important:** `checked_in` is a reservation flag, not historical proof that somebody physically occupied the room on the displayed date. A `completed` reservation is not proof that cleaning has finished.

## 3. Housekeeping — Phase 2 task lifecycle

A **separate** `housekeeping_tasks` table tracks turnover cleaning. It never reuses or overwrites `accommodations.status` or `reservations.reservation_status`.

| State | Who changes it? | What it means |
| --- | --- | --- |
| `needs_cleaning` | Manager creates/assigns task | Completed checkout needs a turnover clean |
| `in_progress` | Assigned Housekeeping user | Cleaning started |
| `cleaned` | Same assigned Housekeeping user | Cleaning marked finished, awaiting inspection |
| `verified_ready` | Manager | Cleaning inspection verified, **not** a guarantee of bookable availability |

Main files:

- `backend/controllers/housekeeping/housekeepingTasksController.js`: all task listing, assignment, creation, start, cleaned and verification operations.
- `frontend/housekeepingJS/housekeepingTasks.js`: staff's own tasks, Start and Mark Cleaned buttons.
- `frontend/managerHTML/managerHousekeeping.html` and `frontend/managerJS/managerHousekeeping.js`: Manager task assignment/verification UI.
- `database/migrations/2026-10-13_create_housekeeping_tasks.sql`: **prepared, not automatically executed** table creation.
- `backend/tests/housekeeping-task-boundaries.test.js`: isolated task lifecycle and role-permission tests.

### Why the `version` field exists

Every task starts with `version = 0`. Successful updates use `WHERE id = ? AND version = ? AND status = ?`, then increment the version. If two browser tabs try to update the same task, the second update affects **zero rows** and returns a conflict instead of overwriting the first user's work.

The database `UNIQUE (reservation_item_id)` prevents creating duplicate cleaning tasks for the same checkout item even when two Managers click simultaneously.

### Why the queries may mention reservations

A query can **read** a reservation to check that checkout completed before creating a task. An SQL command like `INSERT INTO housekeeping_tasks ... SELECT ... FROM reservations` **writes only to `housekeeping_tasks`**. Reading data via JOIN or SELECT does not update the source table.

This was the cause of a false positive in the previous 63/64 test result: an old assertion searched the entire SQL string for a table name rather than checking the **mutation target**. The regression now checks the actual destination of INSERT/UPDATE/DELETE statements.

## 4. Manager code

| File | Purpose |
| --- | --- |
| `backend/controllers/manager/managerOverviewController.js` | Read-only dashboard metrics |
| `backend/controllers/manager/managerReservationsController.js` | Pending-only approve/reject with concurrency checks |
| `backend/controllers/manager/managerAccommodationsController.js` | Rate/listing-status changes limited to Manager-approved fields |
| `backend/controllers/manager/managerReportsController.js` | Read-only reservation and financial snapshots; compatible with MySQL `ONLY_FULL_GROUP_BY` |
| `backend/routes/managerRoutes.js` | Requires verified signed `mgr1` session for all Manager APIs |
| `frontend/managerJS/manager*.js` | Fetch, render and submit only allowed Manager actions |

A reservation's **payment status** is separate from the reservation status. `approved` does not mean paid; `rejected` does not automatically change the payment ledger.

Recorded booking payments, booked accommodation value and paid booking charges use different definitions. **Do not add them together and call that net revenue.**

## 5. Safe local test commands

From the repository's `backend` directory:

```powershell
node --test tests/housekeeping-task-boundaries.test.js tests/housekeeping-role-schedule.test.js
```

The tests use mocked SQL and a temporary local Express listener. They never perform live Aiven writes.

If routes/controllers change, restart the Node backend after pulling. For frontend-only changes, a browser hard refresh is enough.

### Migration activation checklist

1. Verify the actual live database table/foreign-key structure in MySQL Workbench.
2. Verify an independent backup exists and can be restored.
3. Obtain explicit authorization before executing the housekeeping migration.
4. Run `SHOW TABLES LIKE 'housekeeping_tasks';` after authorized migration.
5. Only then test creating a **test checkout** task via Manager → Housekeeping.
6. Confirm `needs_cleaning → in_progress → cleaned → verified_ready` and that **bookings/payments remain unchanged**.

The workflow is intentionally manual: completing a checkout does **not** automatically create or clear a cleaning task in this phase.
