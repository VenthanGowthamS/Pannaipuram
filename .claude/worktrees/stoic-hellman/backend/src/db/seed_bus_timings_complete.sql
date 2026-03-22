-- பண்ணைப்புரம் — Complete Bus Timings Update
-- Source: Handwritten schedules from local people (March 2026)
-- 5 images from email to Deepiga
-- All destinations verified by Venthan
--
-- Corridor mapping (confirmed):
--   போடிநாய்/போடியம்/போடி = Bodi (#2)
--   கிம்பம்/சிவம்/கிடாரி  = கம்பம் Cumbum (#3)
--   சின்னமனூர்            = Chinnamanur (#4)  ← corrected (was wrongly listed as Dindigul)
--   கடலூர்/கூடலூர்        = கூடலூர் Gudalur (NEW #11)
--   மதுரை                 = Madurai (#5)
--   குளி/குமுளி            = Kumily (#9)
--   திண்டுக்கல்           = Dindigul (#10) — NO VERIFIED DATA, cleared
--   மேட்டுப்பாளையம்       = Mettupalayam (NEW #12)
--   சுருளி தீர்த்தம்      = Suruli Theertham (NEW #13)

-- ══════════════════════════════════════════════
-- 1. ADD / UPDATE CORRIDORS & ROUTES
-- ══════════════════════════════════════════════

-- Gudalur (NEW #11)
INSERT INTO bus_corridors (id, name_tamil, name_english, color_hex)
VALUES (11, 'கூடலூர்', 'Gudalur (Koodalur)', '#795548')
ON CONFLICT (id) DO UPDATE
  SET name_tamil = EXCLUDED.name_tamil,
      name_english = EXCLUDED.name_english,
      color_hex = EXCLUDED.color_hex;

-- Mettupalayam (NEW #12)
INSERT INTO bus_corridors (id, name_tamil, name_english, color_hex)
VALUES (12, 'மேட்டுப்பாளையம்', 'Mettupalayam', '#0277BD')
ON CONFLICT (id) DO UPDATE
  SET name_tamil = EXCLUDED.name_tamil,
      name_english = EXCLUDED.name_english,
      color_hex = EXCLUDED.color_hex;

-- Suruli Theertham (NEW #13)
INSERT INTO bus_corridors (id, name_tamil, name_english, color_hex)
VALUES (13, 'சுருளி தீர்த்தம்', 'Suruli Theertham', '#00897B')
ON CONFLICT (id) DO UPDATE
  SET name_tamil = EXCLUDED.name_tamil,
      name_english = EXCLUDED.name_english,
      color_hex = EXCLUDED.color_hex;

-- Thevaram (NEW #14)
-- Verified: village in Uttamapalaiyam block, Theni district, 4km from Uthamapalayam
-- Source: http://www.onefivenine.com/india/villages/Theni/Uttamapalaiyam/Thevaram
INSERT INTO bus_corridors (id, name_tamil, name_english, color_hex)
VALUES (14, 'தேவாரம்', 'Thevaram', '#F57F17')
ON CONFLICT (id) DO UPDATE
  SET name_tamil = EXCLUDED.name_tamil,
      name_english = EXCLUDED.name_english,
      color_hex = EXCLUDED.color_hex;

SELECT setval('bus_corridors_id_seq', 14);

-- Routes for new corridors
INSERT INTO bus_routes (id, corridor_id, direction, origin_tamil, dest_tamil)
VALUES (11, 11, 'outbound', 'பண்ணைப்புரம்', 'கூடலூர்')
ON CONFLICT (id) DO UPDATE
  SET corridor_id = EXCLUDED.corridor_id,
      origin_tamil = EXCLUDED.origin_tamil,
      dest_tamil = EXCLUDED.dest_tamil;

INSERT INTO bus_routes (id, corridor_id, direction, origin_tamil, dest_tamil)
VALUES (12, 12, 'outbound', 'பண்ணைப்புரம்', 'மேட்டுப்பாளையம்')
ON CONFLICT (id) DO UPDATE
  SET corridor_id = EXCLUDED.corridor_id,
      origin_tamil = EXCLUDED.origin_tamil,
      dest_tamil = EXCLUDED.dest_tamil;

INSERT INTO bus_routes (id, corridor_id, direction, origin_tamil, dest_tamil)
VALUES (13, 13, 'outbound', 'பண்ணைப்புரம்', 'சுருளி தீர்த்தம்')
ON CONFLICT (id) DO UPDATE
  SET corridor_id = EXCLUDED.corridor_id,
      origin_tamil = EXCLUDED.origin_tamil,
      dest_tamil = EXCLUDED.dest_tamil;

INSERT INTO bus_routes (id, corridor_id, direction, origin_tamil, dest_tamil)
VALUES (14, 14, 'outbound', 'பண்ணைப்புரம்', 'தேவாரம்')
ON CONFLICT (id) DO UPDATE
  SET corridor_id = EXCLUDED.corridor_id,
      origin_tamil = EXCLUDED.origin_tamil,
      dest_tamil = EXCLUDED.dest_tamil;

SELECT setval('bus_routes_id_seq', 14);

-- ══════════════════════════════════════════════
-- 2. CLEAR OLD TIMINGS for corridors we have new data for
--    Keep corridors 1,4,6,7,8 unchanged (no new data)
-- ══════════════════════════════════════════════
DELETE FROM bus_timings WHERE route_id IN (2, 3, 4, 5, 9, 10, 11, 12, 13, 14);

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
-- 4. CHINNAMANUR (Corridor #4, Route 4) — 17 buses
--    சின்னமனூர்
--    Confirmed by Venthan from handwritten image (March 2026)
--    Previously misidentified as Dindigul — corrected
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
  (4, '20:30:00', 'daily', 'ordinary', true);   -- கடைசி பேருந்து 🔴

-- ══════════════════════════════════════════════
-- 5. MADURAI (Corridor #5, Route 5) — 5 buses
--    மதுரை
--    Confirmed by Venthan (March 2026)
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (5, '04:00:00', 'daily', 'ordinary', false),
  (5, '07:35:00', 'daily', 'ordinary', false),
  (5, '09:25:00', 'daily', 'ordinary', false),
  (5, '10:35:00', 'daily', 'ordinary', false),
  (5, '19:10:00', 'daily', 'ordinary', true);   -- கடைசி பேருந்து 🔴

-- ══════════════════════════════════════════════
-- 6. KUMILY (Corridor #9, Route 9) — 2 buses
--    குமுளி
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (9, '03:50:00', 'daily', 'ordinary', false),
  (9, '04:40:00', 'daily', 'ordinary', true);   -- கடைசி பேருந்து 🔴

-- ══════════════════════════════════════════════
-- 7. DINDIGUL (Corridor #10, Route 10)
--    திண்டுக்கல்
--    ⚠️ NO VERIFIED DATA — timings pending from Venthan
-- ══════════════════════════════════════════════
-- (timings cleared — will be added when Venthan provides verified schedule)

-- ══════════════════════════════════════════════
-- 8. METTUPALAYAM (Corridor #12, Route 12) — 1 bus
--    மேட்டுப்பாளையம் (local village near Pannaipuram)
--    Confirmed by Venthan (March 2026)
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (12, '06:30:00', 'daily', 'ordinary', true);   -- கடைசி பேருந்து 🔴

-- ══════════════════════════════════════════════
-- 9. SURULI THEERTHAM (Corridor #13, Route 13) — 1 bus
--    சுருளி தீர்த்தம் (Suruli Falls, 10km from Cumbum, Theni district)
--    Verified: https://theni.nic.in/tourist-place/surulifalls/
--    Confirmed by Venthan (March 2026)
-- ══════════════════════════════════════════════
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (13, '07:20:00', 'daily', 'ordinary', true);   -- கடைசி பேருந்து 🔴

-- ══════════════════════════════════════════════
-- 10. GUDALUR / KOODALUR (Corridor #11, Route 11) — 9 buses
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
-- Theni (#1)              = 0  (frequent, no fixed timings)
-- Bodi (#2)               = 23
-- Cumbum (#3)             = 25
-- Chinnamanur (#4)        = 17 ← corrected from misread Dindigul data
-- Madurai (#5)            = 5  ← updated by Venthan
-- Coimbatore (#6)         = 4  (unchanged)
-- Trichy (#7)             = 3  (unchanged)
-- Palani (#8)             = 6  (unchanged)
-- Kumily (#9)             = 2
-- Dindigul (#10)          = 0  ⚠️ pending verified data
-- Gudalur (#11)           = 9
-- Mettupalayam (#12)      = 1   ← NEW
-- Suruli Theertham (#13)  = 1   ← NEW
-- Thevaram (#14)          = ⏳  ← timings pending from Venthan
-- TOTAL (so far)          = 96
