-- ═══════════════════════════════════════════════════════════════
-- Doctor seed data for Pannaipuram hospitals
-- Source: Medindia directory, Theni NIC, local verification needed
-- Date: 2026-03-22
-- ═══════════════════════════════════════════════════════════════

-- Hospital 1: Uthamapalayam GH (nearest to Pannaipuram)
-- Hospital 2: Bodinayakkanur GH

-- ⚠️ IMPORTANT: Verify hospital IDs before running.
-- Run this first to check: SELECT id, name_english FROM hospitals;
-- Adjust hospital_id values below to match your actual IDs.

-- Uthamapalayam GH doctors (hospital_id = 1, adjust if different)
INSERT INTO doctors (hospital_id, name_tamil, name_english, specialisation)
VALUES
  (1, 'டாக்டர் செல்வராஜ்', 'Dr. Selvaraj', 'பொது மருத்துவம் (General Medicine)'),
  (1, 'டாக்டர் கவிதா', 'Dr. Kavitha', 'மகப்பேறு மருத்துவம் (OB/GYN)'),
  (1, 'டாக்டர் முருகன்', 'Dr. Murugan', 'அறுவை சிகிச்சை (General Surgery)')
ON CONFLICT DO NOTHING;
-- ⚠️ NEEDS VERIFICATION: confirm names with Uthamapalayam GH locally

-- Bodinayakkanur GH doctors (hospital_id = 2, adjust if different)
-- Source: Dr. S Rajavel verified via Medindia directory
-- Source: Dr. Inbarathi verified via Medindia directory
INSERT INTO doctors (hospital_id, name_tamil, name_english, specialisation)
VALUES
  (2, 'டாக்டர் எஸ். ராஜவேல்', 'Dr. S. Rajavel', 'பொது மருத்துவம் (General Medicine)'),
  (2, 'டாக்டர் இன்பராதி', 'Dr. Inbarathi', 'மகப்பேறு மருத்துவம் (OB/GYN)'),
  (2, 'டாக்டர் குமார்', 'Dr. Kumar', 'குழந்தை மருத்துவம் (Pediatrics)')
ON CONFLICT DO NOTHING;
-- ⚠️ Dr. Kumar NEEDS VERIFICATION — common name placeholder, confirm locally
