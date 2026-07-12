-- ── Fix "Server error" when adding a driver from admin ──────────────
-- Two DB-side causes:
--   1) Admin form now offers a 4th vehicle type "🚖 Taxi", but the
--      auto_drivers.vehicle_type CHECK constraint only allowed
--      ('auto','van','car') → INSERT with 'taxi' failed.
--   2) photo_url column was never added (migration_driver_photos.sql
--      pending) → INSERT with a photo failed.
--
-- Run this whole block in the Supabase SQL Editor (project eoiaexdbnyzysolgwitw).

-- 1) Allow 'taxi' as a vehicle type (auto_drivers)
ALTER TABLE auto_drivers DROP CONSTRAINT IF EXISTS auto_drivers_vehicle_type_check;
ALTER TABLE auto_drivers
  ADD CONSTRAINT auto_drivers_vehicle_type_check
  CHECK (vehicle_type IN ('auto','van','car','taxi'));

-- 2) Add the photo_url columns (idempotent — safe if already present)
ALTER TABLE auto_drivers   ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE acting_drivers ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 3) Add license_verified to acting_drivers — the Acting Drivers admin
--    form always sends the "🪪 DL verified" toggle, so this column must
--    exist or every acting-driver add/update 500s.
ALTER TABLE acting_drivers ADD COLUMN IF NOT EXISTS license_verified BOOLEAN DEFAULT FALSE;

-- Verify:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
--   WHERE conrelid = 'auto_drivers'::regclass AND contype = 'c';
-- SELECT id, name_tamil, vehicle_type, LEFT(COALESCE(photo_url,''),20) AS photo
--   FROM auto_drivers LIMIT 5;
