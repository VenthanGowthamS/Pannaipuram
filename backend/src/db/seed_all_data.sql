-- பண்ணைப்புரம் — Complete Data Seed
-- Run this in Supabase SQL Editor ONCE
-- Seeds: hospitals, bus routes, bus timings, streets (sample)
-- Source: Thevaram Bus Stand (TNSTC, Feb 2026)
-- All times = Thevaram +10 min for Pannaipuram stop

-- ══════════════════════════════════════════════
-- 1. HOSPITALS
-- ══════════════════════════════════════════════
INSERT INTO hospitals (id, name_tamil, name_english, address_tamil)
VALUES
  (1, 'PTV பத்மாவதி மருத்துவமனை', 'PTV Padmavathy Hospital', 'தேவாரம் அருகில்'),
  (2, 'S P கிளினிக்', 'S P Clinic', 'பண்ணைப்புரம்')
ON CONFLICT (id) DO UPDATE
  SET name_tamil = EXCLUDED.name_tamil,
      name_english = EXCLUDED.name_english,
      address_tamil = EXCLUDED.address_tamil;
SELECT setval('hospitals_id_seq', 2);

-- ══════════════════════════════════════════════
-- 2. BUS CORRIDORS (already seeded, but ensure)
-- ══════════════════════════════════════════════
INSERT INTO bus_corridors (id, name_tamil, name_english, color_hex) VALUES
  (1,  'தேனி',           'Theni',         '#1565C0'),
  (2,  'போடி',           'Bodi',           '#0288D1'),
  (3,  'கம்பம்',          'Cumbum',         '#2E7D32'),
  (4,  'சின்னமனூர்',      'Chinnamanur',    '#6A1B9A'),
  (5,  'மதுரை',           'Madurai',        '#E65100'),
  (6,  'கோயம்புத்தூர்',   'Coimbatore',     '#AD1457'),
  (7,  'திருச்சி',         'Trichy',         '#4527A0'),
  (8,  'பழனி',            'Palani',          '#558B2F'),
  (9,  'குமுளி',           'Kumily',          '#00695C'),
  (10, 'திண்டுக்கல்',     'Dindigul',        '#BF360C'),
  (11, 'கூடலூர்',          'Gudalur (Koodalur)', '#795548')
ON CONFLICT (id) DO UPDATE
  SET name_tamil = EXCLUDED.name_tamil,
      name_english = EXCLUDED.name_english,
      color_hex = EXCLUDED.color_hex;
SELECT setval('bus_corridors_id_seq', 11);

-- ══════════════════════════════════════════════
-- 3. BUS ROUTES (one outbound route per corridor)
-- ══════════════════════════════════════════════
-- Clean existing routes first to avoid duplicates
DELETE FROM bus_timings;
DELETE FROM bus_routes;

INSERT INTO bus_routes (id, corridor_id, direction, origin_tamil, dest_tamil) VALUES
  (1,  1,  'outbound', 'பண்ணைப்புரம்', 'தேனி'),
  (2,  2,  'outbound', 'பண்ணைப்புரம்', 'போடி'),
  (3,  3,  'outbound', 'பண்ணைப்புரம்', 'கம்பம்'),
  (4,  4,  'outbound', 'பண்ணைப்புரம்', 'சின்னமனூர்'),
  (5,  5,  'outbound', 'பண்ணைப்புரம்', 'மதுரை'),
  (6,  6,  'outbound', 'பண்ணைப்புரம்', 'கோயம்புத்தூர்'),
  (7,  7,  'outbound', 'பண்ணைப்புரம்', 'திருச்சி'),
  (8,  8,  'outbound', 'பண்ணைப்புரம்', 'பழனி'),
  (9,  9,  'outbound', 'பண்ணைப்புரம்', 'குமுளி'),
  (10, 10, 'outbound', 'பண்ணைப்புரம்', 'திண்டுக்கல்'),
  (11, 11, 'outbound', 'பண்ணைப்புரம்', 'கூடலூர்');
SELECT setval('bus_routes_id_seq', 11);

-- ══════════════════════════════════════════════
-- 4. BUS TIMINGS — All from Thevaram Bus Stand + 10 min
-- Corridors 1-3 (Theni, Bodi, Cumbum) = frequent, no fixed timings
-- ══════════════════════════════════════════════

-- Chinnamanur (corridor 4, route 4)
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (4, '10:25:00', 'daily', 'ordinary', false),
  (4, '12:30:00', 'daily', 'ordinary', false),
  (4, '16:20:00', 'daily', 'ordinary', false),
  (4, '18:10:00', 'daily', 'ordinary', true);

-- Madurai (corridor 5, route 5)
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (5, '04:25:00', 'daily', 'ordinary', false),
  (5, '06:00:00', 'daily', 'express',  false),
  (5, '06:40:00', 'daily', 'ordinary', false),
  (5, '09:40:00', 'daily', 'ordinary', false),
  (5, '14:55:00', 'daily', 'ordinary', false),
  (5, '15:40:00', 'daily', 'express',  false),
  (5, '16:30:00', 'daily', 'ordinary', true);

-- Coimbatore (corridor 6, route 6)
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (6, '05:10:00', 'daily', 'express',  false),
  (6, '09:30:00', 'daily', 'ordinary', false),
  (6, '11:30:00', 'daily', 'ordinary', false),
  (6, '20:50:00', 'daily', 'express',  true);

-- Trichy (corridor 7, route 7)
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (7, '05:50:00', 'daily', 'express',  false),
  (7, '15:10:00', 'daily', 'ordinary', false),
  (7, '19:30:00', 'daily', 'ordinary', true);

-- Palani (corridor 8, route 8)
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (8, '05:20:00', 'daily', 'ordinary', false),
  (8, '06:10:00', 'daily', 'ordinary', false),
  (8, '06:25:00', 'daily', 'express',  false),
  (8, '09:25:00', 'daily', 'ordinary', false),
  (8, '11:25:00', 'daily', 'ordinary', false),
  (8, '16:20:00', 'daily', 'ordinary', true);

-- Kumily (corridor 9, route 9)
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (9, '03:40:00', 'daily', 'ordinary', false),
  (9, '05:00:00', 'daily', 'ordinary', false),
  (9, '05:40:00', 'daily', 'express',  false),
  (9, '08:40:00', 'daily', 'ordinary', false),
  (9, '12:00:00', 'daily', 'ordinary', false),
  (9, '14:00:00', 'daily', 'ordinary', false),
  (9, '14:30:00', 'daily', 'express',  true);

-- Dindigul (corridor 10, route 10)
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (10, '06:30:00', 'daily', 'ordinary', false),
  (10, '09:10:00', 'daily', 'ordinary', false),
  (10, '15:00:00', 'daily', 'ordinary', false),
  (10, '15:40:00', 'daily', 'express',  false),
  (10, '16:40:00', 'daily', 'ordinary', false),
  (10, '17:30:00', 'daily', 'ordinary', true);

-- ══════════════════════════════════════════════
-- DONE — Verify counts
-- ══════════════════════════════════════════════
SELECT 'hospitals' AS table_name, count(*) FROM hospitals
UNION ALL
SELECT 'bus_corridors', count(*) FROM bus_corridors
UNION ALL
SELECT 'bus_routes', count(*) FROM bus_routes
UNION ALL
SELECT 'bus_timings', count(*) FROM bus_timings;
