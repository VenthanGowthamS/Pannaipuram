-- Migration: rename the official bulletin account to "admin"
-- Run in Supabase SQL Editor.
--
-- migration_community_posts.sql seeded this account as
-- 'பண்ணைப்புரம் நிர்வாகம்'. That row already exists in production, so
-- changing the seed in the code does NOT change the live name — every post
-- already published keeps showing the old name until this runs.
--
-- name_tamil is the field the PWA renders on the post card, so it is the one
-- that has to change; name_english is kept in step for the admin panel.

UPDATE community_posters
   SET name_tamil   = 'admin',
       name_english = 'admin'
 WHERE is_official = TRUE;

-- Confirm: expect one row, name 'admin', is_official true, is_trusted true
SELECT id, phone, name_tamil, name_english, is_official, is_trusted
  FROM community_posters
 WHERE is_official = TRUE;
