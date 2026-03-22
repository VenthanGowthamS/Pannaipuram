-- ═══════════════════════════════════════════════════════════════
-- Emergency Contacts for Pannaipuram (Theni District, Tamil Nadu)
-- Verified via Tamil Nadu Police, Health Dept, NIC directories
-- Added: 2026-03-22
-- ═══════════════════════════════════════════════════════════════

-- National Emergency Numbers
INSERT INTO emergency_contacts (category, name_tamil, name_english, phone, is_national, is_verified, display_order)
VALUES
  ('police', 'ஒருங்கிணைந்த அவசர எண்', 'Unified Emergency Number', '112', TRUE, TRUE, 1),
  ('police', 'காவல் கட்டுப்பாட்டு அறை', 'Police Control Room', '100', TRUE, TRUE, 2),
  ('fire', 'தீயணைப்பு அவசர எண்', 'Fire & Rescue', '101', TRUE, TRUE, 3),
  ('medical', 'ஆம்புலன்ஸ் அவசர எண்', 'Ambulance / 108 Emergency', '108', TRUE, TRUE, 4),
  ('medical', 'மருத்துவ அவசர உதவி', 'Medical Emergency Helpline', '102', TRUE, TRUE, 5)
ON CONFLICT DO NOTHING;

-- Local Police Stations (nearest to Pannaipuram)
-- Source: Tamil Nadu Police eservices portal, Theni NIC directory
INSERT INTO emergency_contacts (category, name_tamil, name_english, phone, is_national, is_verified, display_order)
VALUES
  ('police', 'உத்தமபாளையம் காவல் நிலையம்', 'Uthamapalayam Police Station', '04554-265230', FALSE, TRUE, 10),
  ('police', 'கும்பம் வடக்கு காவல் நிலையம்', 'Cumbum North Police Station', '04554-271291', FALSE, TRUE, 11),
  ('police', 'கும்பம் தெற்கு காவல் நிலையம்', 'Cumbum South Police Station', '04554-271422', FALSE, TRUE, 12)
ON CONFLICT DO NOTHING;

-- Government Hospitals (nearest to Pannaipuram)
-- Source: Tamil Nadu Health Department, Medindia
INSERT INTO emergency_contacts (category, name_tamil, name_english, phone, is_national, is_verified, display_order)
VALUES
  ('medical', 'உத்தமபாளையம் அரசு மருத்துவமனை', 'Govt Hospital Uthamapalayam', '9894840333', FALSE, TRUE, 20),
  ('medical', 'தேனி அரசு மருத்துவமனை', 'Govt Hospital Theni', '04546-231292', FALSE, TRUE, 21),
  ('medical', 'போடிநாயக்கனூர் அரசு மருத்துவமனை', 'Govt Hospital Bodinayakkanur', '9443328375', FALSE, TRUE, 22)
ON CONFLICT DO NOTHING;

-- Fire Station
INSERT INTO emergency_contacts (category, name_tamil, name_english, phone, is_national, is_verified, display_order)
VALUES
  ('fire', 'தேனி மாவட்ட தீயணைப்பு', 'Theni District Fire Station', '101', FALSE, TRUE, 30)
ON CONFLICT DO NOTHING;

-- Helplines
INSERT INTO emergency_contacts (category, name_tamil, name_english, phone, is_national, is_verified, display_order)
VALUES
  ('other', 'பெண்கள் உதவி எண்', 'Women Helpline', '1091', TRUE, TRUE, 40),
  ('other', 'குழந்தைகள் உதவி எண்', 'Child Helpline', '1098', TRUE, TRUE, 41),
  ('other', 'பேரிடர் அவசர எண்', 'Disaster Helpline', '1077', TRUE, TRUE, 42),
  ('other', 'தேனி மாவட்ட கலெக்டர் அலுவலகம்', 'Theni Collectorate', '04546-255410', FALSE, TRUE, 43)
ON CONFLICT DO NOTHING;

-- Kombai PHC (nearest 24x7 PHC to Pannaipuram — Uthamapalayam taluk)
-- ⚠️ NEEDS VERIFICATION: number from NHM PHC directory, confirm with local contact
INSERT INTO emergency_contacts (category, name_tamil, name_english, phone, is_national, is_verified, display_order)
VALUES
  ('medical', 'கோம்பை அரசு ஆரம்ப சுகாதார நிலையம்', 'Kombai Primary Health Centre (24x7)', '9788160116', FALSE, FALSE, 23)
ON CONFLICT DO NOTHING;
-- is_verified = FALSE until Venthan confirms this number locally
