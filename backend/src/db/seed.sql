-- பண்ணைப்புரம் App — Seed Data
-- All verified ground-truth data collected so far

-- ─────────────────────────────────────
-- Streets (1 verified so far)
-- ─────────────────────────────────────
INSERT INTO streets (name_tamil, name_english) VALUES
  ('வள்ளுவர் தெரு', 'Valluvar Street')
ON CONFLICT DO NOTHING;
-- Remaining 56 streets to be added from panchayat office list

-- ─────────────────────────────────────
-- Water Schedules (1 verified so far)
-- ─────────────────────────────────────
INSERT INTO water_schedules (street_id, frequency_days, supply_time, last_supply_date)
VALUES (
  (SELECT id FROM streets WHERE name_english = 'Valluvar Street'),
  3,
  '06:00:00',
  CURRENT_DATE
) ON CONFLICT (street_id) DO NOTHING;

-- ─────────────────────────────────────
-- Bus Corridors
-- ─────────────────────────────────────
INSERT INTO bus_corridors (name_tamil, name_english, color_hex) VALUES
  ('போடி பக்கம்',  'Towards Bodi',   '#2196F3'),
  ('கம்பம் பக்கம்', 'Towards Kamban', '#4CAF50')
ON CONFLICT DO NOTHING;
-- Bus timings to be added after collection from TNSTC / conductors

-- ─────────────────────────────────────
-- Hospital
-- ─────────────────────────────────────
INSERT INTO hospitals (name_tamil, name_english) VALUES
  ('PTV பத்மாவதி மருத்துவமனை', 'PTV Padmavathy Hospital')
ON CONFLICT DO NOTHING;
-- phone_casualty, phone_ambulance to be added when collected

-- ─────────────────────────────────────
-- Doctors (1 verified so far)
-- ─────────────────────────────────────
INSERT INTO doctors (hospital_id, name_tamil, name_english) VALUES
  (1, 'டாக்டர் சேகர்', 'Dr. Sekar')
ON CONFLICT DO NOTHING;
-- specialisation TBC

INSERT INTO doctor_schedules (doctor_id, day_of_week, notes_tamil) VALUES
  (
    (SELECT id FROM doctors WHERE name_english = 'Dr. Sekar'),
    3,  -- Wednesday
    'காலை முதல் மாலை வரை'
  )
ON CONFLICT DO NOTHING;
-- start_time / end_time to be updated when exact times confirmed

-- ─────────────────────────────────────
-- Emergency Contacts (2 verified so far)
-- ─────────────────────────────────────
INSERT INTO emergency_contacts
  (category, name_tamil, name_english, phone, is_national, is_verified, display_order)
VALUES
  ('power', 'TNEB உள்ளூர் புகார்',  'TNEB Local Complaint',  '9498794987', FALSE, TRUE, 1),
  ('power', 'TNEB தேசிய புகார் எண்', 'TNEB National Helpline', '1912',       TRUE,  TRUE, 2)
ON CONFLICT DO NOTHING;
-- More contacts to be added: hospital casualty, ambulance, police, panchayat, fire
