-- ── Doctor-level "More Details" note ────────────────────────────────
-- ONE note per doctor (clinic instructions, alternate clinic, fees…)
-- shown once under the doctor card in the PWA — instead of duplicating
-- the same text into every day's schedule note (see Dr. Shanmugapriya /
-- SP Clinic where one line was copied into all 7 day rows).
--
-- Run this in the Supabase SQL Editor (project eoiaexdbnyzysolgwitw).

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS notes_tamil TEXT;

-- Verify:
-- SELECT id, name_tamil, notes_tamil FROM doctors;
