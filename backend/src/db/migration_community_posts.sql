-- Migration: Create community_posts table
-- Run in Supabase SQL Editor
-- Date: July 2026

-- Registrants who can post (phone + name)
CREATE TABLE IF NOT EXISTS community_posters (
  id            SERIAL PRIMARY KEY,
  phone         VARCHAR(10) NOT NULL UNIQUE,
  name_tamil    VARCHAR(100) NOT NULL,
  name_english  VARCHAR(100),
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community bulletin posts
CREATE TABLE IF NOT EXISTS community_posts (
  id              SERIAL PRIMARY KEY,
  poster_id       INTEGER REFERENCES community_posters(id) ON DELETE CASCADE,
  title_tamil     VARCHAR(200) NOT NULL,
  title_english   VARCHAR(200),
  content_tamil   TEXT NOT NULL,
  content_english TEXT,
  image_url       TEXT,                           -- base64 data-URL (optional)
  status          VARCHAR(20) DEFAULT 'approved'  -- pending/approved/rejected/archived
                  CHECK (status IN ('pending','approved','rejected','archived')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_expires ON community_posts(expires_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_poster ON community_posts(poster_id);

-- Track daily post count per poster (for spam limit)
CREATE TABLE IF NOT EXISTS community_posts_daily (
  id       SERIAL PRIMARY KEY,
  poster_id INTEGER REFERENCES community_posters(id) ON DELETE CASCADE,
  post_date DATE NOT NULL,
  count    INTEGER DEFAULT 1,
  UNIQUE(poster_id, post_date)
);

COMMENT ON TABLE community_posts IS 'Community bulletin — users submit village news/announcements';
COMMENT ON TABLE community_posters IS 'Registered users who can post to community bulletin';
COMMENT ON COLUMN community_posts.status IS 'pending (awaiting mod), approved (live), rejected (spam), archived (old)';
