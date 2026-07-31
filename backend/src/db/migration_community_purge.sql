-- Migration: Community Bulletin — nightly purge job
-- Run in Supabase SQL Editor AFTER migration_community_posts.sql
--
-- PREREQUISITE: enable pg_cron once, in
--   Supabase Dashboard → Database → Extensions → search "pg_cron" → Enable
--
-- Kept separate from the table migration on purpose: if pg_cron is not
-- enabled, this script errors, and had it been in the same transaction as
-- the CREATE TABLEs it would have rolled them all back.
--
-- Without this job, expires_at only HIDES posts from the API — the rows
-- stay forever and the database grows without bound.

-- ── 1. Show what is scheduled right now ───────────────────────────
-- (Run this alone first if you just want to look without changing anything.)
SELECT jobid, jobname, schedule, active, LEFT(command, 60) AS command_start
FROM cron.job
ORDER BY jobid;

-- ── 2. Remove EVERY existing purge job, however many there are ────
-- Unscheduling by NAME only removes one, and it errors if the name is
-- ambiguous — so delete by jobid in a loop. This makes the script safe to
-- run repeatedly and cleans up duplicates left by earlier attempts.
DO $$
DECLARE j RECORD;
BEGIN
  FOR j IN SELECT jobid FROM cron.job WHERE jobname = 'purge-bulletin' LOOP
    PERFORM cron.unschedule(j.jobid);
    RAISE NOTICE 'unscheduled old purge job %', j.jobid;
  END LOOP;
END $$;

-- ── 3. Create exactly one ─────────────────────────────────────────
-- 03:00 daily: drop expired posts (cascades to their likes) and stale counters
SELECT cron.schedule('purge-bulletin', '0 3 * * *', $$
  DELETE FROM community_posts       WHERE expires_at < NOW();
  DELETE FROM community_posts_daily WHERE post_date  < CURRENT_DATE - 30;
$$);

-- ── 4. Confirm there is now exactly ONE ───────────────────────────
SELECT jobid, jobname, schedule, active
FROM cron.job
WHERE jobname = 'purge-bulletin';
-- Expected: a single row, active = true, schedule = 0 3 * * *

-- Purge manually at any time:
--   DELETE FROM community_posts WHERE expires_at < NOW();
