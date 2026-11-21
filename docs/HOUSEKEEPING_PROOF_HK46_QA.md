# HK-46 — Housekeeping Photo Proof and Manager Review QA

## Current release status
- Implemented on GitHub `testing` branch only, not deployed to the public domain.
- Requires a **manual, separately approved MySQL migration** before the new APIs can be used.
- No reservation/payment/accommodation availability update is part of this release.
- Keep the resort AI changes in their existing branch state; HK-46 does not change Gemini.

## Why separate, protected image storage?
Render's normal filesystem is ephemeral. The existing `accommodation_media`
table is public (for customer gallery photos), so it is not suitable for
private housekeeping evidence. HK-46 adds a distinct protected MySQL table.

Photos are stored as a binary `MEDIUMBLOB` per housekeeping task, **not** in
a public gallery or public folder. Signed Housekeeping staff can upload only
during their assigned In Progress task. Only signed Managers can fetch/view
Cleaned or Verified proof. Manager review is recorded before Verify Ready.

## Database migration (manual, never automated)
1. Back up the **specific** Aiven schema you're targeting and restore it into
   an isolated test schema first. Production backup confirmation is required.
2. Confirm `SELECT DATABASE();` and `SHOW CREATE TABLE housekeeping_tasks;`.
   Migration `2026-10-13_create_housekeeping_tasks.sql` must already exist.
3. Run `database/migrations/2026-11-21_housekeeping_cleaning_proofs.sql`
   **only on the intended test schema** first.
4. Confirm `SHOW TABLES LIKE 'housekeeping_cleaning_proofs';`.
5. Do not run on the production Aiven `defaultdb` until the owner approves
   after QA. The two schemas must be reviewed independently.
6. Plan for storage: up to 2 MB per completed cleaning task (plus indexes and
   row overhead). Monitor Aiven size; never expose image blobs publicly.

## New task workflow
1. Manager chooses checkout date, opens **Assign a task**, chooses completed
   reservation item and an active, verified Housekeeping account, and assigns.
2. Staff opens Housekeeping → **My Cleaning Tasks**, taps Start Cleaning.
3. Staff takes or selects one JPEG, PNG or WebP photo. Pictures over 2 MB (up
   to 12 MB original) are optimized in the browser where supported; server
   always enforces the real 2 MB limit and validates file signatures.
4. Staff taps **Upload Proof** and waits for confirmation. Then **Mark Cleaned**
   becomes available. Server independently refuses Cleaned if no proof exists.
5. Manager opens **Review cleaning proofs** (Cleaned filter), taps **View Proof
   & Verify**, inspects the full image and confirms.
6. Server records the Manager review and **then** checks occupancy and task
   version again before `verified_ready`. A proof cannot directly change
   reservation status, payments, or public availability.
7. A legacy Cleaned task with no photo shows **Request Photo**; Manager may
   return that task to In Progress so Housekeeping can submit proof.

## Acceptance checklist
- [ ] Manager Housekeeping header shows Arvic logo.
- [ ] Quick links/summary counts and status filter work on desktop and phone.
- [ ] Housekeeping phone camera/file upload succeeds with a valid photo.
- [ ] Unsupported, corrupt, oversized photos fail with a readable message.
- [ ] No photo: Mark Cleaned not possible (including a direct API request).
- [ ] Wrong staff cannot upload; Manager cannot upload; staff cannot view
      private Manager proof URLs.
- [ ] After refresh and backend restart, photo is still available (MySQL).
- [ ] Manager photo opens in accessible dialog; close/reopen releases old URL.
- [ ] Verify is denied without Manager proof review, and if room is occupied.
- [ ] Two stale tabs cannot overwrite a newer task version.
- [ ] Legacy no-proof Cleaned task can request photo and complete again.
- [ ] Existing reservation, payment, availability and cleaning history unaffected.
- [ ] Testing and main remain separate until owner gives deployment approval.

## Quick test commands
After pulling the `testing` branch, from `backend`:
```powershell
node --test tests/housekeeping-task-boundaries.test.js
node --test tests/housekeeping-proof-ui46.test.js
```
These are mocked and require no connection to live Aiven, PayPal, or Gemini.
Run role-based browser QA on a restored test database after the migration.
