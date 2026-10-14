# Smart Resort — Safe Backup and Git Update Guide

> Updated 2026-10-14. This replaces old instructions that referenced obsolete working and backup branches.
> Current development branch: dev/admin-frontdesk-cleanup-2026-10-10
> **Do not run an automatic merge into main or use force push.** Check the actual branch head and status before any change.

## 1. Synchronize local development safely

From the capstone project root in VS Code PowerShell:

```powershell
git branch --show-current
git status --short
git fetch origin
```

- The branch must be **dev/admin-frontdesk-cleanup-2026-10-10** before pulling from it.
- If git status lists edits/untracked files, first review and preserve them; do not discard or overwrite them just to pull.
- If the tree is clean and you are on the correct branch:

```powershell
git pull --ff-only origin dev/admin-frontdesk-cleanup-2026-10-10
```

- Never assume an unrelated branch should be merged automatically.
- If fast-forward pull refuses to run, **stop** and inspect branch divergence rather than using reset, force push or a blind merge.

## 2. Save a reviewed local change

After local edits have passed syntax/tests and you have inspected the changed files:

```powershell
git status --short
git diff --check
git diff
```

Only commit intentionally reviewed files. Avoid git add -A when unreviewed files, credentials, screenshots or SQL dumps may be present. Do not commit backend/.env, passwords, tokens, full guest data, or PayPal credentials. Use meaningful commits and push to the approved development branch only.

## 3. Database backup is separate from Git

Git backs up **source code**, not your current Aiven MySQL records.

- Confirm whether MySQL Workbench is connected to the local test database or Aiven defaultdb **before** running SQL.
- Keep an independent, dated SQL backup outside the Git repository. Validate its restore in a disposable local schema; preserve the original backup unchanged.
- SQL migration on live Aiven requires inspection, reviewed rollback/restore plan and explicit authorization.
- The Housekeeping table is already present in the Aiven environment verified on October 14; never rerun migration scripts blindly.
- The gated real MySQL concurrency test is for **localhost-only dedicated disposable MariaDB**, never production Aiven.

## 4. Deployment and main branch policy

- Local Node/Live Server testing and git pull do **not** deploy the current branch to Vercel/Render automatically unless deployment configuration is separately verified.
- main may differ from the active development branch; review both histories, run integration tests, resolve differences safely, and obtain approval before a final merge.
- Create a documented release checkpoint and record the deployed commit SHA before changing hosting configuration.
- Never expose live PayPal/Aiven/Brevo/Gemini secrets in commits or console screenshots.

Related documents: CAPSTONE_CONTEXT.md, IMPLEMENTATION_ROADMAP.md, CHANGELOG.md.
