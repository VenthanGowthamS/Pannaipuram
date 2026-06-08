-- Migration: Create acting_drivers table
-- "Acting driver" = substitute / temporary driver who fills in for regular
-- auto/van/car drivers. Run this in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS acting_drivers (
  id               SERIAL PRIMARY KEY,
  name_tamil       VARCHAR(150) NOT NULL,
  name_english     VARCHAR(150),
  phone            VARCHAR(20)  NOT NULL,
  phone_verified   BOOLEAN      DEFAULT FALSE,
  vehicle_type     VARCHAR(20)  NOT NULL DEFAULT 'auto'
                   CHECK (vehicle_type IN ('auto','van','car','any')),
  coverage_tamil   VARCHAR(255),
  coverage_english VARCHAR(255),
  schedule_tamil   VARCHAR(255),   -- availability note (e.g. "எப்போ வேணாலும்")
  is_active        BOOLEAN      DEFAULT TRUE,
  display_order    INTEGER      DEFAULT 0,
  created_at       TIMESTAMP    DEFAULT NOW()
);

-- Seed examples (replace phone numbers with real ones via admin panel)
INSERT INTO acting_drivers (name_tamil, name_english, phone, vehicle_type, coverage_tamil, coverage_english, schedule_tamil, phone_verified, display_order)
VALUES
  ('மாற்று ஓட்டுநர் 1', 'Substitute Driver 1', '', 'any', 'பண்ணைப்புரம் சுற்றுவட்டாரம்', 'Pannaipuram area', 'எப்போ வேணாலும்', FALSE, 1)
ON CONFLICT DO NOTHING;
