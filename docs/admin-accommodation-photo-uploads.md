# Accommodation photo picker — Admin QA and deployment

## Purpose
Admin Accommodations no longer asks the administrator to type image paths.
Cover uses Choose Photo; Gallery uses Choose Photos (up to 10).
Old image URLs stay unchanged when an existing accommodation is edited
without a replacement. Gallery previews have Remove controls.

## One-time SQL migration required
1. Make a fresh backup of the live schema before modifying it.
2. Open `backend/sql/accommodation_media.sql` in MySQL Workbench.
3. Explicitly select the intended schema (`defaultdb` for the current
   live/local development database; use the disposable restore DB to test
   the migration first). Verify `SELECT DATABASE();`.
4. Execute the migration (only `CREATE TABLE IF NOT EXISTS`). Verify
   `media_table_exists = 1` in the result grid.
5. Restart the local Node backend and hard-refresh the admin page.

**This migration does not delete or rewrite any booking, payment, gallery,
accommodation or customer records.** It adds a new table. Do not run a
schema migration while doing the financial/test-record cleanup.

## Storage and security
- The signed admin token is required for uploads (no anonymous uploads).
- JPEG/PNG/WebP only; the file picker accepts up to 12 MB per photo.\n  Files over 3 MB are optimized client-side to JPEG before upload; the backend\n  independently checks MIME from file bytes and accepts at most 3 MB each.
- MySQL stores image binary in `accommodation_media` instead of Render disk.
- Uploaded image URLs such as `/api/rooms/media/10` go into the existing
  `accommodations.image` and `room_gallery.image_url` columns.
- The image-reading route is public because room photos appear on the public
  customer catalog. Do not upload private documents or customer IDs.
- No external photo-hosting account or new Azure account is needed.
- Uploaded but never saved/attached images can become orphan media rows.
  Do not run manual deletion on the new table until a verified cleanup policy
  exists. Restrict full-resolution originals and monitor Aiven storage usage.

## How to test
From the repository root:
```powershell
git switch dev/admin-frontdesk-cleanup-2026-10-10
git pull origin dev/admin-frontdesk-cleanup-2026-10-10
cd backend
node --test tests/accommodation-media.test.js
node --test tests/ai-blessica.test.js
node server.js
```

On the Admin Accommodations page:
1. Choose an existing accommodation and click Edit.
2. Without choosing a new image, click Update, then Edit again: existing
   cover/gallery must remain unchanged.
3. Choose one small JPG cover and 2 gallery images. Check previews.
4. Remove one gallery preview. Save; verify the new cover and retained gallery.
5. Open Customer > Accommodations; verify both images load and image viewer
   works after a refresh.
6. Test JPG, PNG, WebP, non-image, a 5 MB camera photo (auto optimized),\n   >12 MB file rejection, expired admin session, and phone-width UI.
7. Check Chrome Console and Node terminal for errors; confirm no file paths
   are manually required.
8. Optionally restart Node and refresh both pages: persisted MySQL images
   should still load. A successful local run is not proof of Render deployment.

## Troubleshooting
- HTTP 503 with storage not initialized -> run the SQL migration on the
  same DB that `backend/.env` points to.
- HTTP 401/403 -> log in as a verified Admin account again.
- HTTP 400/415 -> choose a valid smaller JPEG, PNG or WebP.
- Image broken after deploy -> verify Render branch/backend API_BASE and that
  both frontend and backend commits are deployed, and inspect GET response.
