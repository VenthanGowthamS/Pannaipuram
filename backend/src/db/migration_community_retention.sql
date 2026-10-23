-- Migration: Community Bulletin retention — v91
-- Posts now live 60 days (was 7) and the newest 10 approved posts are always
-- kept. Safe to run repeatedly. Run BEFORE re-running migration_community_purge.sql
-- (which carries the "keep newest 10" rule in the nightly job).

ALTER TABLE community_posts
  ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '60 days');

-- Stretch posts that are still live under the old 7-day rule. Posts already
-- expired are left alone (the purge's keep-newest-10 rule protects the last 10).
UPDATE community_posts
   SET expires_at = created_at + INTERVAL '60 days'
 WHERE expires_at > NOW()
   AND expires_at < created_at + INTERVAL '60 days';
