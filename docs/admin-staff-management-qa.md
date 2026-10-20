# Admin Staff Account Management — Capstone QA

## Scope and roles
Admin-only page: `frontend/adminHTML/admin-staff.html`

- Directory covers Front Desk (including legacy `staff`), Manager, and Housekeeping accounts.
- Create staff accounts with strong initial passwords (12-72 chars with upper,
  lower, number, symbol); existing email is rejected across all users.
- Edit contact details; role deliberately immutable from this panel.
- Enable/disable an account **without deleting** references to housekeeping
  assignments or reservations.
- Reset staff password only after entering the current Administrator password.
- Passwords are bcrypt hashed and are NEVER returned by the API.
- Earlier signed staff tokens are rejected after password change, because new
  tokens carry a signed fingerprint derived from the stored bcrypt hash.
- Older pre-upgrade staff tokens that lack this credential binding must log
  in again after backend restart.
- No customer/admin accounts can be edited or reset from this page.

## Changed files, purpose
- `backend/controllers/admin/staffAccountsController.js`: restricted list,
  create, contact edit, status update and admin-confirmed reset.
- `backend/routes/adminStaffRoutes.js`: all routes require a valid admin
  signed token and live role verification.
- `backend/utils/staffAccountValidation.js`: password policy, role allowlist
  and email normalization without database dependencies.
- `backend/middleware/staffCredentialTag.js`: token credential binding.
- `backend/middleware/frontDeskAuth.js`,
  `backend/middleware/managerAuth.js`,
  `backend/middleware/housekeepingAuth.js`: reject tokens issued with an old
  staff password hash. This also applies to self-service password changes.
- `backend/controllers/auth/authController.js`: issues password-bound staff
  tokens at login.
- `backend/server.js`: mounts admin staff API.
- `frontend/adminHTML/admin-staff.html`: standalone responsive Admin page.
- `frontend/adminJS/admin-staff.js`: safe DOM rendering and interaction.
- `frontend/adminCSS/admin-staff.css`: responsive styling.
- Admin navbar HTML pages: link to Staff Accounts.
- `backend/tests/admin-staff-security.test.js`: pure security unit tests.

## Pull and tests
From the root of the repository:
```powershell
git switch dev/admin-frontdesk-cleanup-2026-10-10
git pull origin dev/admin-frontdesk-cleanup-2026-10-10
cd backend
node --test tests/admin-staff-security.test.js
```

Run the existing regression suite as well; a security change affecting
role tokens may need test fixtures to provide a real bcrypt password hash.
A failed regression suite must be fixed before enabling production rollout.

## Manual acceptance scenarios — TEST accounts only
1. Log in as Admin and open Admin > Staff Accounts.
2. The directory shows no customer/admin accounts and no password hashes.
3. Create one TEST Housekeeping user with an unused email and strong password.
4. Verify weak password rejected; duplicate email rejected.
5. Login in another browser/incognito as that TEST Housekeeping user.
6. In Admin page, reset the staff password:
   - bad Admin confirmation must be rejected;
   - valid Admin confirmation updates the password;
   - old password stops logging in;
   - previous signed staff token must fail on protected API calls (401);
   - new password logs in.
7. Disable the test account; protected staff requests must return 403.
8. Enable the account; check it can log in again.
9. Edit contact details; role must stay unchanged.
10. Open on mobile width; verify directory scroll and form actions.
11. Repeat login/disable test for Front Desk and Manager test accounts.
12. Confirm no booking, payment, map, gallery or housekeeping task data
    was deleted during staff management.

## Important cautions
- This feature does not require any SQL migration; it reuses the users table.
- Do NOT perform database cleanup for this test.
- Do not reset actual staff passwords without their agreement and a secure
  way to deliver the newly chosen password.
- Admin or Customer logins are NOT affected by the staff token change.
- Existing staff may need to sign in again on first use after the rollout.
- Backend restart is required (new API routes/middleware); local frontend
  needs a hard refresh. No Azure account required.
