-- ── Acting driver license verification ─────────────────────────────
-- Admin toggles "DL Verified" after checking the driver's licence;
-- PWA shows a green "✅ உரிமம் சரிபார்க்கப்பட்டது" chip for extra trust.
--
-- Run this in the Supabase SQL Editor (project eoiaexdbnyzysolgwitw).

ALTER TABLE acting_drivers ADD COLUMN IF NOT EXISTS license_verified BOOLEAN DEFAULT FALSE;

-- Verify:
-- SELECT id, name_tamil, license_verified FROM acting_drivers;
