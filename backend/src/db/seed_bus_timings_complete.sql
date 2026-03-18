-- பண்ணைப்புரம் — Complete Bus Timings Update
-- Source: Handwritten schedules from local people (March 2026)
-- 5 images from email to Deepiga
-- All destinations verified by Venthan
--
-- Corridor mapping (confirmed):
--   போடிநாய்/போடியம்/போடி = Bodi (#2)
--   கிம்பம்/சிவம்/கிடாரி  = கம்பம் Cumbum (#3)
--   கடலூர்/கூடலூர்        = கூடலூர் Gudalur (NEW #11)
--   மதுரை                 = Madurai (#5)
--   குளி/குமுளி            = Kumily (#9)
--   திண்டுக்கல்           = Dindigul (#10)

-- ══════════════════════════════════════════════
-- 1. ADD NEW CORRIDOR: கூடலூர் (Gudalur/Koodalur)
-- ══════════════════════════════════════════════
INSERT INTO bus_corridors (id, name_tamil, name_english, color_hex)
VALUES (11, 'கூடலூர்', 'Gudalur (Koodalur)', '#795548')
ON CONFLICT (id) DO UPDATE
  SET name_tamil = EXCLUDED.name_tamil,
      name_english = EXCLUDED.name_english,
      color_hex = EXCLUDED.color_hex;
SELECT setval('bus_corridors_id_seq', 11);

-- Add route for Gudalur
INSERT INTO bus_routes (id, corridor_id, direction, origin_tamil, dest_tamil)
VALUES (11, 11, 'outbound', 'பண்ணைப்புரம்', 'கூடலூர்')
ON CONFLICT (id) DO UPDATE
  SET corridor_id = EXCLUDED.corridor_id,
      origin_tamil = EXCLUDED.origin_tamil,
      dest_tamil = EXCLUDED.dest_tamil;
SELECT setval('bus_routes_id_seq', 11);

-- ══════════════════════════════════════════════
-- 2. CLEAR OLD TIMINGS for corridors we have new data for
--    Keep corridors 1,4,6,7,8 unchanged (no new data)
-- ══════════════════════════════════════════════
DELETE FROM bus_timings WHERE route_id IN (2, 3, 5, 9, 10, 11);

-- ══════════════════════════════════════════════
-- 3. BODI (Corridor #2, Route 2) — 23 buses
--    போடிநாயக்கனூர் / போடி
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
  (2, '18:10:00', 'daily', 'ordinary', true);   -- கடைசி பேருந்து 🔴

-- ══════════════════════════════════════════════
-- 4. CUMBUM (Corridor #3, Route 3) — 25 buses
--    கம்பம்
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
  (3, '17:50:00', 'daily', 'ordinary', true);   -- கடைசி பேருந்து 🔴

-- ══════════════════════════════════════════════
-- 5. MADURAI (Corridor #5, Route 5) — 4 buses
--    மதுரை
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (5, '04:00:00', 'daily', 'ordinary', false),
  (5, '07:10:00', 'daily', 'ordinary', false),
  (5, '07:35:00', 'daily', 'ordinary', false),
  (5, '09:25:00', 'daily', 'ordinary', true);   -- கடைசி பேருந்து 🔴

-- ══════════════════════════════════════════════
-- 6. KUMILY (Corridor #9, Route 9) — 2 buses
--    குமுளி
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (9, '03:50:00', 'daily', 'ordinary', false),
  (9, '04:40:00', 'daily', 'ordinary', true);   -- கடைசி பேருந்து 🔴

-- ══════════════════════════════════════════════
-- 7. DINDIGUL (Corridor #10, Route 10) — 17 buses
--    திண்டுக்கல்
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (10, '05:00:00', 'daily', 'ordinary', false),
  (10, '06:15:00', 'daily', 'ordinary', false),
  (10, '07:00:00', 'daily', 'ordinary', false),
  (10, '08:30:00', 'daily', 'ordinary', false),
  (10, '09:10:00', 'daily', 'ordinary', false),
  (10, '10:10:00', 'daily', 'ordinary', false),
  (10, '11:10:00', 'daily', 'ordinary', false),
  (10, '12:30:00', 'daily', 'ordinary', false),
  (10, '14:10:00', 'daily', 'ordinary', false),
  (10, '14:30:00', 'daily', 'ordinary', false),
  (10, '14:40:00', 'daily', 'ordinary', false),
  (10, '16:15:00', 'daily', 'ordinary', false),
  (10, '17:05:00', 'daily', 'ordinary', false),
  (10, '18:10:00', 'daily', 'ordinary', false),
  (10, '19:40:00', 'daily', 'ordinary', false),
  (10, '20:00:00', 'daily', 'ordinary', false),
  (10, '20:30:00', 'daily', 'ordinary', true);  -- கடைசி பேருந்து 🔴

-- ══════════════════════════════════════════════
-- 8. GUDALUR / KOODALUR (Corridor #11, Route 11) — 9 buses
--    கூடலூர்
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
  (11, '16:50:00', 'daily', 'ordinary', true);  -- கடைசி பேருந்து 🔴

-- ══════════════════════════════════════════════
-- VERIFY COUNTS
-- ══════════════════════════════════════════════
SELECT
  bc.name_english AS corridor,
  count(bt.id) AS timings
FROM bus_corridors bc
LEFT JOIN bus_routes br ON br.corridor_id = bc.id
LEFT JOIN bus_timings bt ON bt.route_id = br.id
GROUP BY bc.id, bc.name_english
ORDER BY bc.id;

-- Expected:
-- Theni (#1)        = 0 (frequent, no fixed timings)
-- Bodi (#2)         = 23
-- Cumbum (#3)       = 25
-- Chinnamanur (#4)  = 4 (unchanged)
-- Madurai (#5)      = 4
-- Coimbatore (#6)   = 4 (unchanged)
-- Trichy (#7)       = 3 (unchanged)
-- Palani (#8)       = 6 (unchanged)
-- Kumily (#9)       = 2
-- Dindigul (#10)    = 17
-- Gudalur (#11)     = 9
-- TOTAL             = 97
