-- Migration: Create local_services table
-- Run in Supabase SQL Editor
-- Date: March 2026

CREATE TABLE IF NOT EXISTS local_services (
  id            SERIAL PRIMARY KEY,
  category      TEXT NOT NULL CHECK (category IN ('milk', 'post', 'flower', 'plumber', 'electrician', 'other')),
  name_tamil    TEXT NOT NULL,
  name_english  TEXT,
  phone         TEXT NOT NULL,
  area_tamil    TEXT,
  area_english  TEXT,
  notes_tamil   TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast category lookups
CREATE INDEX IF NOT EXISTS idx_local_services_category ON local_services(category, is_active);

-- ⚠️ Sample data — replace with real numbers from Pannaipuram
-- INSERT INTO local_services (category, name_tamil, name_english, phone, area_tamil, area_english, display_order)
-- VALUES
--   ('milk',        'ராஜன்',    'Rajan',    '9876543210', 'முழு ஊர்',    'Whole village',      1),
--   ('post',        'செல்வம்',  'Selvam',   '9876543211', 'முழு ஊர்',    'Whole village',      1),
--   ('flower',      'லக்ஷ்மி',  'Lakshmi',  '9876543212', 'காலை மட்டும்', 'Mornings only',      1),
--   ('plumber',     'குமார்',   'Kumar',    '9876543213', NULL,           NULL,                 1),
--   ('electrician', 'முத்து',   'Muthu',    '9876543214', NULL,           NULL,                 1);

COMMENT ON TABLE local_services IS 'Local service providers (milk man, postman, plumber, etc.) for Pannaipuram';
COMMENT ON COLUMN local_services.category IS 'milk | post | flower | plumber | electrician | other';
