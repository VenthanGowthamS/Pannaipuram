-- Migration: சங்கமம் open posting (v110, November 2026)
-- Run in the Supabase SQL Editor BEFORE deploying v110. Safe to run more than once,
-- and safe for the code already running (it only adds columns and relaxes NOT NULLs).
--
-- Anyone can now post without registering a phone. A post is tied to the
-- app's own device id (the same id shown in ☰ → About and in the admin
-- PWA Stats), so the admin can see which app posted it and block that app.
-- The name is optional and stored per post.

-- A poster is now EITHER a phone registration (old) OR an app device (new)
ALTER TABLE community_posters ADD COLUMN IF NOT EXISTS device_id VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS uq_community_posters_device
  ON community_posters (device_id) WHERE device_id IS NOT NULL;
ALTER TABLE community_posters ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE community_posters ALTER COLUMN name_tamil DROP NOT NULL;

-- Optional name typed with the post (NULL = posted without a name)
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS author_name VARCHAR(60);

-- The admin's own phones: an app marked here (admin panel → PWA Stats →
-- "Can delete posts") may delete ANY post straight from the app.
ALTER TABLE pwa_visits ADD COLUMN IF NOT EXISTS can_moderate BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN community_posters.device_id IS 'App device id (localStorage pannai:visitor-id) for posters who did not register a phone';
COMMENT ON COLUMN community_posts.author_name IS 'Optional name the villager typed with this post';
