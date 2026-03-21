-- பண்ணைப்புரம் — Complete Bus Data Restore
-- Run this in Supabase SQL Editor (VenthanTechnologies)
-- Restores all 14 corridors + routes + verified timings
-- Sources: Thevaram Bus Stand + Handwritten schedules (March 2026)

-- ══════════════════════════════════════════════
-- 1. CLEAR EXISTING BUS DATA
-- ══════════════════════════════════════════════
DELETE FROM bus_timings;
DELETE FROM bus_routes;
DELETE FROM bus_corridors;

-- ══════════════════════════════════════════════
-- 2. ALL 14 CORRIDORS
-- ══════════════════════════════════════════════
INSERT INTO bus_corridors (id, name_tamil, name_english, color_hex) VALUES
  (1,  'தேனி',              'Theni',              '#1565C0'),
  (2,  'போடி',              'Bodi',               '#0288D1'),
  (3,  'கம்பம்',             'Cumbum',             '#2E7D32'),
  (4,  'சின்னமனூர்',         'Chinnamanur',        '#6A1B9A'),
  (5,  'மதுரை',              'Madurai',            '#E65100'),
  (6,  'கோயம்புத்தூர்',      'Coimbatore',         '#AD1457'),
  (7,  'திருச்சி',            'Trichy',             '#4527A0'),
  (8,  'பழனி',               'Palani',             '#558B2F'),
  (9,  'குமுளி',              'Kumily',             '#00695C'),
  (10, 'திண்டுக்கல்',        'Dindigul',           '#BF360C'),
  (11, 'கூடலூர்',             'Gudalur (Koodalur)', '#795548'),
  (12, 'மேட்டுப்பாளையம்',    'Mettupalayam',       '#0277BD'),
  (13, 'சுருளி தீர்த்தம்',   'Suruli Theertham',   '#00897B'),
  (14, 'தேவாரம்',             'Thevaram',           '#F57F17');
SELECT setval('bus_corridors_id_seq', 14);

-- ══════════════════════════════════════════════
-- 3. ALL 14 ROUTES (one outbound per corridor)
-- ══════════════════════════════════════════════
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
  (11, 11, 'outbound', 'பண்ணைப்புரம்', 'கூடலூர்'),
  (12, 12, 'outbound', 'பண்ணைப்புரம்', 'மேட்டுப்பாளையம்'),
  (13, 13, 'outbound', 'பண்ணைப்புரம்', 'சுருளி தீர்த்தம்'),
  (14, 14, 'outbound', 'பண்ணைப்புரம்', 'தேவாரம்');
SELECT setval('bus_routes_id_seq', 14);

-- ══════════════════════════════════════════════
-- 4. BODI (Route 2) — 23 buses — Verified March 2026
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (2, '05:30:00', 'daily', 'ordinary', false),
  (2, '05:45:00', 'daily', 'ordinary', false),
  (2, '06:30:00', 'daily', 'ordinary', false),
  (2, '06:40:00', 'daily', 'ordinary', false),
  (2, '07:30:00', 'daily', 'ordinary', false),
  (2, '08:00:00', 'daily', 'ordinary', false),
  (2, '08:10:00', 'daily', 'ordinary', false),
  (2, '08:50:00', 'daily', 'ordinary', false),
  (2, '09:20:00', 'daily', 'ordinary', false),
  (2, '09:40:00', 'daily', 'ordinary', false),
  (2, '10:00:00', 'daily', 'ordinary', false),
  (2, '10:10:00', 'daily', 'ordinary', false),
  (2, '10:45:00', 'daily', 'ordinary', false),
  (2, '11:10:00', 'daily', 'ordinary', false),
  (2, '11:30:00', 'daily', 'ordinary', false),
  (2, '12:00:00', 'daily', 'ordinary', false),
  (2, '13:00:00', 'daily', 'ordinary', false),
  (2, '14:00:00', 'daily', 'ordinary', false),
  (2, '14:40:00', 'daily', 'ordinary', false),
  (2, '15:50:00', 'daily', 'ordinary', false),
  (2, '16:10:00', 'daily', 'ordinary', false),
  (2, '17:00:00', 'daily', 'ordinary', false),
  (2, '18:10:00', 'daily', 'ordinary', true);

-- ══════════════════════════════════════════════
-- 5. CUMBUM (Route 3) — 25 buses — Verified March 2026
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (3, '05:00:00', 'daily', 'ordinary', false),
  (3, '07:00:00', 'daily', 'ordinary', false),
  (3, '07:10:00', 'daily', 'ordinary', false),
  (3, '07:50:00', 'daily', 'ordinary', false),
  (3, '08:10:00', 'daily', 'ordinary', false),
  (3, '08:20:00', 'daily', 'ordinary', false),
  (3, '08:30:00', 'daily', 'ordinary', false),
  (3, '08:40:00', 'daily', 'ordinary', false),
  (3, '09:00:00', 'daily', 'ordinary', false),
  (3, '09:10:00', 'daily', 'ordinary', false),
  (3, '09:40:00', 'daily', 'ordinary', false),
  (3, '10:00:00', 'daily', 'ordinary', false),
  (3, '11:00:00', 'daily', 'ordinary', false),
  (3, '11:20:00', 'daily', 'ordinary', false),
  (3, '12:10:00', 'daily', 'ordinary', false),
  (3, '12:30:00', 'daily', 'ordinary', false),
  (3, '13:10:00', 'daily', 'ordinary', false),
  (3, '13:20:00', 'daily', 'ordinary', false),
  (3, '13:35:00', 'daily', 'ordinary', false),
  (3, '13:45:00', 'daily', 'ordinary', false),
  (3, '14:30:00', 'daily', 'ordinary', false),
  (3, '15:00:00', 'daily', 'ordinary', false),
  (3, '15:15:00', 'daily', 'ordinary', false),
  (3, '16:00:00', 'daily', 'ordinary', false),
  (3, '17:50:00', 'daily', 'ordinary', true);

-- ══════════════════════════════════════════════
-- 6. CHINNAMANUR (Route 4) — 17 buses — Verified March 2026
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (4, '05:00:00', 'daily', 'ordinary', false),
  (4, '06:15:00', 'daily', 'ordinary', false),
  (4, '07:00:00', 'daily', 'ordinary', false),
  (4, '08:30:00', 'daily', 'ordinary', false),
  (4, '09:10:00', 'daily', 'ordinary', false),
  (4, '10:10:00', 'daily', 'ordinary', false),
  (4, '11:10:00', 'daily', 'ordinary', false),
  (4, '12:30:00', 'daily', 'ordinary', false),
  (4, '14:10:00', 'daily', 'ordinary', false),
  (4, '14:30:00', 'daily', 'ordinary', false),
  (4, '14:40:00', 'daily', 'ordinary', false),
  (4, '16:15:00', 'daily', 'ordinary', false),
  (4, '17:05:00', 'daily', 'ordinary', false),
  (4, '18:10:00', 'daily', 'ordinary', false),
  (4, '19:40:00', 'daily', 'ordinary', false),
  (4, '20:00:00', 'daily', 'ordinary', false),
  (4, '20:30:00', 'daily', 'ordinary', true);

-- ══════════════════════════════════════════════
-- 7. MADURAI (Route 5) — 5 buses — Verified March 2026
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (5, '04:00:00', 'daily', 'ordinary', false),
  (5, '07:35:00', 'daily', 'ordinary', false),
  (5, '09:25:00', 'daily', 'ordinary', false),
  (5, '10:35:00', 'daily', 'ordinary', false),
  (5, '19:10:00', 'daily', 'ordinary', true);

-- ══════════════════════════════════════════════
-- 8. COIMBATORE (Route 6) — 4 buses
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (6, '05:10:00', 'daily', 'express',  false),
  (6, '09:30:00', 'daily', 'ordinary', false),
  (6, '11:30:00', 'daily', 'ordinary', false),
  (6, '20:50:00', 'daily', 'express',  true);

-- ══════════════════════════════════════════════
-- 9. TRICHY (Route 7) — 3 buses
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (7, '05:50:00', 'daily', 'express',  false),
  (7, '15:10:00', 'daily', 'ordinary', false),
  (7, '19:30:00', 'daily', 'ordinary', true);

-- ══════════════════════════════════════════════
-- 10. PALANI (Route 8) — 6 buses
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (8, '05:20:00', 'daily', 'ordinary', false),
  (8, '06:10:00', 'daily', 'ordinary', false),
  (8, '06:25:00', 'daily', 'express',  false),
  (8, '09:25:00', 'daily', 'ordinary', false),
  (8, '11:25:00', 'daily', 'ordinary', false),
  (8, '16:20:00', 'daily', 'ordinary', true);

-- ══════════════════════════════════════════════
-- 11. KUMILY (Route 9) — 2 buses — Verified March 2026
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (9, '03:50:00', 'daily', 'ordinary', false),
  (9, '04:40:00', 'daily', 'ordinary', true);

-- ══════════════════════════════════════════════
-- 12. GUDALUR / KOODALUR (Route 11) — 9 buses — Verified March 2026
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (11, '06:15:00', 'daily', 'ordinary', false),
  (11, '07:20:00', 'daily', 'ordinary', false),
  (11, '09:35:00', 'daily', 'ordinary', false),
  (11, '10:20:00', 'daily', 'ordinary', false),
  (11, '12:05:00', 'daily', 'ordinary', false),
  (11, '13:00:00', 'daily', 'ordinary', false),
  (11, '14:10:00', 'daily', 'ordinary', false),
  (11, '16:30:00', 'daily', 'ordinary', false),
  (11, '16:50:00', 'daily', 'ordinary', true);

-- ══════════════════════════════════════════════
-- 13. METTUPALAYAM (Route 12) — 1 bus — Verified March 2026
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (12, '06:30:00', 'daily', 'ordinary', true);

-- ══════════════════════════════════════════════
-- 14. SURULI THEERTHAM (Route 13) — 1 bus — Verified March 2026
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (13, '07:20:00', 'daily', 'ordinary', true);

-- Corridor 1 (Theni) = frequent service, no fixed timings needed
-- Corridor 10 (Dindigul) = ⚠️ no verified data yet
-- Corridor 14 (Thevaram) = ⏳ timings pending from Venthan

-- ══════════════════════════════════════════════
-- VERIFY — Expected totals
-- ══════════════════════════════════════════════
SELECT
  bc.id,
  bc.name_english AS corridor,
  count(bt.id) AS timings
FROM bus_corridors bc
LEFT JOIN bus_routes br ON br.corridor_id = bc.id
LEFT JOIN bus_timings bt ON bt.route_id = br.id
GROUP BY bc.id, bc.name_english
ORDER BY bc.id;

-- Expected:
-- 1  Theni           = 0  (frequent service)
-- 2  Bodi            = 23
-- 3  Cumbum          = 25
-- 4  Chinnamanur     = 17
-- 5  Madurai         = 5
-- 6  Coimbatore      = 4
-- 7  Trichy          = 3
-- 8  Palani          = 6
-- 9  Kumily          = 2
-- 10 Dindigul        = 0  (pending)
-- 11 Gudalur         = 9
-- 12 Mettupalayam    = 1
-- 13 Suruli Theertham= 1
-- 14 Thevaram        = 0  (pending)
-- TOTAL              = 96
