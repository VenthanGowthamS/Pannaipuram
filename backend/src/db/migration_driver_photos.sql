-- ── Driver photos (auto + acting drivers) ──────────────────────────
-- PWA shows the photo inside the avatar circle (falls back to the
-- vehicle emoji when empty). Photos are uploaded in the admin panel,
-- resized in the browser to ≤320px JPEG and stored as a data-URL
-- (~15-35 KB) — no separate file storage needed.
--
-- Run this in the Supabase SQL Editor (project eoiaexdbnyzysolgwitw).

ALTER TABLE auto_drivers   ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE acting_drivers ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Verify:
-- SELECT id, name_tamil, LEFT(COALESCE(photo_url,''), 30) AS photo FROM auto_drivers LIMIT 5;
