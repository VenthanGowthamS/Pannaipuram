-- Migration: Community Bulletin — clickable link on a post — v81
-- Run in Supabase SQL Editor
-- Date: August 2026
--
-- Why a dedicated column instead of letting people paste a URL into the
-- body: a URL sitting inside content_tamil renders as plain text, so a
-- villager on a phone has to select it, copy it and paste it into a
-- browser — most simply don't, and the YouTube video or the TNEB notice
-- the post was ABOUT never gets opened. One column the app can render as
-- a real tappable button fixes that, and keeps the URL out of the escaped
-- free-text body where it can never be made clickable safely.
--
-- Safe to re-run. Existing posts get NULL — the app renders no link chip.

ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS link_url TEXT;

COMMENT ON COLUMN community_posts.link_url IS
  'Optional http(s) URL shown as a tappable button under the post. Scheme is validated server-side (http/https only) — never store a javascript:/data: URL here, the PWA renders it into an href.';
