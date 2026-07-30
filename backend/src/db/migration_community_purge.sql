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

-- Clear any previous schedule so re-running is safe
SELECT cron.unschedule('purge-bulletin')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-bulletin');

-- 03:00 daily: drop expired posts (cascades to their likes) and stale counters
SELECT cron.schedule('purge-bulletin', '0 3 * * *', $$
  DELETE FROM community_posts       WHERE expires_at < NOW();
  DELETE FROM community_posts_daily WHERE post_date  < CURRENT_DATE - 30;
$$);

-- Verify it registered:
--   SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'purge-bulletin';
--
-- Purge manually at any time:
--   DELETE FROM community_posts WHERE expires_at < NOW();
