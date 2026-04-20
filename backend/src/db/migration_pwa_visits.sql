-- ── PWA Visit Tracking ──────────────────────────────────────
-- Tracks unique PWA visitors via a client-generated visitor_id
-- (random UUID-like string persisted in localStorage on first load).
-- Privacy-safe: no IP, no location, no cookies, no personal data.
-- Lets admins see "how many people are using the village app".

CREATE TABLE IF NOT EXISTS pwa_visits (
  id              SERIAL PRIMARY KEY,
  visitor_id      VARCHAR(64) NOT NULL,
  first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visit_count     INTEGER     NOT NULL DEFAULT 1,
  is_standalone   BOOLEAN     NOT NULL DEFAULT FALSE,  -- true = installed as PWA
  user_agent      TEXT
);

-- Unique per visitor (upsert target)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pwa_visits_visitor
  ON pwa_visits(visitor_id);

-- For admin dashboard queries (active visitors, recent list)
CREATE INDEX IF NOT EXISTS idx_pwa_visits_last_seen
  ON pwa_visits(last_seen_at DESC);

-- Verify
-- SELECT COUNT(*) AS rows, COUNT(DISTINCT visitor_id) AS uniques FROM pwa_visits;
