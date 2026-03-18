-- பண்ணைப்புரம் — All Bus Corridors (matching app routes)
-- Run this once in Supabase SQL Editor

-- Clear existing corridors and re-seed all
DELETE FROM bus_timings;
DELETE FROM bus_routes;
DELETE FROM bus_corridors;

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
  SET name_tamil   = EXCLUDED.name_tamil,
      name_english = EXCLUDED.name_english,
      color_hex    = EXCLUDED.color_hex;

-- Reset sequence
SELECT setval('bus_corridors_id_seq', 11);
