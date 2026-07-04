-- Migration: PWA stats v2 — device labels, install tracking, true daily uniques
-- Run in Supabase SQL Editor (or via Management API).

-- Label a device (e.g. "Venthan iPhone") so known devices can be segregated in stats
ALTER TABLE pwa_visits ADD COLUMN IF NOT EXISTS label TEXT;

-- When the visitor was FIRST seen running as an installed app (standalone).
-- is_standalone becomes sticky (once installed, stays installed) — installed_at
-- records the install date so daily install counts are possible.
ALTER TABLE pwa_visits ADD COLUMN IF NOT EXISTS installed_at TIMESTAMPTZ;

-- Backfill: existing standalone visitors get their last_seen as best-guess install date
UPDATE pwa_visits SET installed_at = last_seen_at
WHERE is_standalone = TRUE AND installed_at IS NULL;

-- One row per visitor per day — enables TRUE daily unique-user counts.
-- (The old daily table grouped by last_seen_at, so a user only counted on
--  their most recent day.)
CREATE TABLE IF NOT EXISTS pwa_visit_days (
  visitor_id TEXT NOT NULL,
  day        DATE NOT NULL,
  opens      INT  NOT NULL DEFAULT 1,
  PRIMARY KEY (visitor_id, day)
);

CREATE INDEX IF NOT EXISTS idx_pwa_visit_days_day ON pwa_visit_days (day);
