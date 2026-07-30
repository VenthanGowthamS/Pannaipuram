-- Migration: Community Bulletin (சங்கமம்) — v75
-- Run in Supabase SQL Editor
-- Date: July 2026
--
-- Model: registration required to post · admin approves · trusted posters skip
--        the queue · anyone (no registration) can view and like · 7-day purge.

-- ── Registered posters ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posters (
  id            SERIAL PRIMARY KEY,
  phone         VARCHAR(10) NOT NULL UNIQUE,
  name_tamil    VARCHAR(100) NOT NULL,
  name_english  VARCHAR(100),
  is_trusted    BOOLEAN DEFAULT FALSE,   -- admin flips ON → their posts go live instantly
  is_blocked    BOOLEAN DEFAULT FALSE,   -- admin flips ON → poster can no longer submit
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Existing installs: add the new columns without touching data
ALTER TABLE community_posters ADD COLUMN IF NOT EXISTS is_trusted BOOLEAN DEFAULT FALSE;
ALTER TABLE community_posters ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE community_posters ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE;

-- ── The official village account ──────────────────────────────────
-- Used by "New official post" in the admin panel. Its phone is a reserved
-- sentinel, NOT a real number: it starts with 1, so the public registration
-- endpoint (which requires 6-9) can never create or hijack it, and the
-- is_official flag is checked there as a second lock. Only someone holding
-- an admin JWT can post as this account.
INSERT INTO community_posters (phone, name_tamil, name_english, is_trusted, is_official)
VALUES ('1234567890', 'பண்ணைப்புரம் நிர்வாகம்', 'Pannaipuram Admin', TRUE, TRUE)
ON CONFLICT (phone) DO UPDATE
  SET is_official = TRUE, is_trusted = TRUE, is_blocked = FALSE;

-- ── Bulletin posts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id              SERIAL PRIMARY KEY,
  poster_id       INTEGER REFERENCES community_posters(id) ON DELETE CASCADE,
  title_tamil     VARCHAR(200) NOT NULL,
  title_english   VARCHAR(200),
  content_tamil   TEXT NOT NULL,
  content_english TEXT,
  image_url       TEXT,                    -- compressed base64 JPEG data-URL (~80KB cap)
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected','archived')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Existing installs created before moderation was turned on defaulted to
-- 'approved'. Flip the default so new posts queue for review.
ALTER TABLE community_posts ALTER COLUMN status SET DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_community_posts_live    ON community_posts(status, expires_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_expires ON community_posts(expires_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_poster  ON community_posts(poster_id);

-- ── Likes — anyone can like, no registration (device-scoped) ──────
CREATE TABLE IF NOT EXISTS community_post_likes (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  device_id  VARCHAR(64) NOT NULL,        -- localStorage 'pannai:visitor-id'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, device_id)              -- one like per device per post
);

CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_post_likes(post_id);

-- ── Daily post counter (1 post per phone per day) ─────────────────
CREATE TABLE IF NOT EXISTS community_posts_daily (
  id        SERIAL PRIMARY KEY,
  poster_id INTEGER REFERENCES community_posters(id) ON DELETE CASCADE,
  post_date DATE NOT NULL,
  count     INTEGER DEFAULT 1,
  UNIQUE(poster_id, post_date)
);

COMMENT ON TABLE  community_posts        IS 'Community bulletin — village news submitted by registered villagers';
COMMENT ON TABLE  community_posters      IS 'Registered villagers allowed to post (phone + name)';
COMMENT ON TABLE  community_post_likes   IS 'One like per device per post — no registration needed to like';
COMMENT ON COLUMN community_posts.status IS 'pending (awaiting admin) · approved (live) · rejected · archived';
COMMENT ON COLUMN community_posters.is_trusted IS 'TRUE → posts skip the approval queue and go live instantly';

-- ── Nightly purge ─────────────────────────────────────────────────
-- Deliberately NOT in this file: it needs the pg_cron extension, and if
-- pg_cron isn't enabled yet the error would roll back every table above.
-- Run migration_community_purge.sql separately, after enabling pg_cron.
