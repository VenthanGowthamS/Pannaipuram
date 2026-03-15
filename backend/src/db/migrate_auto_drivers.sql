-- Migration: Create auto_drivers table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS auto_drivers (
  id               SERIAL PRIMARY KEY,
  name_tamil       VARCHAR(150) NOT NULL,
  name_english     VARCHAR(150),
  phone            VARCHAR(20) NOT NULL,
  vehicle_type     VARCHAR(20) NOT NULL DEFAULT 'auto'
                   CHECK (vehicle_type IN ('auto','van','car')),
  coverage_tamil   VARCHAR(255),
  coverage_english VARCHAR(255),
  schedule_tamil   VARCHAR(255),
  is_active        BOOLEAN DEFAULT TRUE,
  display_order    INTEGER DEFAULT 0,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Seed with Pannaipuram's known auto/van drivers
-- NOTE: Replace phone numbers with real ones via admin panel
INSERT INTO auto_drivers (name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, display_order)
VALUES
  ('முருகேசன்', 'Murugesan', '', 'auto', 'உத்தமபாளையம் வரை', 'Up to Uthamapalayam', NULL, 1),
  ('கதிரவன்', 'Kathiravan', '', 'auto', 'போடி / கம்பம் வரை', 'Up to Bodi / Cumbum', NULL, 2),
  ('வேன் சேவை', 'Van Service', '', 'van', 'உத்தமபாளையம்', 'Uthamapalayam', 'காலை 7 மணி புறப்படும்', 3)
ON CONFLICT DO NOTHING;
