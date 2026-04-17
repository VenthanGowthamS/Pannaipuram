-- ═══════════════════════════════════════════════════════════════
-- Doctor seed data for Pannaipuram
-- Only verified local doctors: Dr. Sekar & Dr. Shanmugapriya
-- Date: 2026-03-23
-- ═══════════════════════════════════════════════════════════════

-- ⚠️ IMPORTANT: Verify hospital IDs before running.
-- Run this first to check: SELECT id, name_english FROM hospitals;

-- Only inserting verified doctors (confirmed by Venthan)
INSERT INTO doctors (hospital_id, name_tamil, name_english, specialisation)
VALUES
  (1, 'டாக்டர் சேகர்', 'Dr. Sekar', 'பொது மருத்துவம் (General Medicine)'),
  (1, 'டாக்டர் சண்முகப்பிரியா', 'Dr. Shanmugapriya', 'பொது மருத்துவம் (General Medicine)')
ON CONFLICT DO NOTHING;

-- Default schedules (Mon-Sat, 9 AM to 5 PM)
-- Adjust after confirming actual timings with the doctors
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, notes_tamil)
SELECT d.id, day.day_name, '09:00', '17:00', 'காலை 9 – மாலை 5'
FROM doctors d
CROSS JOIN (
  VALUES ('Monday'), ('Tuesday'), ('Wednesday'), ('Thursday'), ('Friday'), ('Saturday')
) AS day(day_name)
WHERE d.name_english IN ('Dr. Sekar', 'Dr. Shanmugapriya')
ON CONFLICT DO NOTHING;
-- ⚠️ NEEDS VERIFICATION: confirm actual schedule timings with Venthan
