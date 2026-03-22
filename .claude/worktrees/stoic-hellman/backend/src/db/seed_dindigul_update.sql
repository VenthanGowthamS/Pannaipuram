-- பண்ணைப்புரம் — Updated Dindigul Bus Timings
-- Source: Handwritten schedule from local people (March 2026)
-- Image 5 of bus timing email
-- Corridor 10 (திண்டுக்கல் / Dindigul), Route 10

-- First, remove old Dindigul timings
DELETE FROM bus_timings WHERE route_id = 10;

-- Insert updated timings (17 buses, all daily, ordinary)
INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  -- காலை (Morning)
  (10, '05:00:00', 'daily', 'ordinary', false),
  (10, '06:15:00', 'daily', 'ordinary', false),
  (10, '07:00:00', 'daily', 'ordinary', false),
  (10, '08:30:00', 'daily', 'ordinary', false),
  (10, '09:10:00', 'daily', 'ordinary', false),
  (10, '10:10:00', 'daily', 'ordinary', false),
  (10, '11:10:00', 'daily', 'ordinary', false),
  -- மதியம் (Afternoon)
  (10, '12:30:00', 'daily', 'ordinary', false),
  (10, '14:10:00', 'daily', 'ordinary', false),
  (10, '14:30:00', 'daily', 'ordinary', false),
  (10, '14:40:00', 'daily', 'ordinary', false),
  (10, '16:15:00', 'daily', 'ordinary', false),
  (10, '17:05:00', 'daily', 'ordinary', false),
  -- மாலை (Evening)
  (10, '18:10:00', 'daily', 'ordinary', false),
  (10, '19:40:00', 'daily', 'ordinary', false),
  (10, '20:00:00', 'daily', 'ordinary', false),
  (10, '20:30:00', 'daily', 'ordinary', true);  -- கடைசி பேருந்து (Last Bus) 🔴

-- Also insert Bodi (corridor 2) timings that I'm confident about from Images 1-4
-- These are times where the destination clearly says போடிநாய் or போடி
DELETE FROM bus_timings WHERE route_id = 2;

INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  -- Very Early Morning (Image 4)
  (2, '05:30:00', 'daily', 'ordinary', false),
  (2, '05:45:00', 'daily', 'ordinary', false),
  (2, '06:30:00', 'daily', 'ordinary', false),
  (2, '06:40:00', 'daily', 'ordinary', false),
  -- Early Morning (Image 3)
  (2, '07:30:00', 'daily', 'ordinary', false),
  (2, '08:00:00', 'daily', 'ordinary', false),
  (2, '08:10:00', 'daily', 'ordinary', false),
  (2, '08:40:00', 'daily', 'ordinary', false),
  (2, '08:50:00', 'daily', 'ordinary', false),
  (2, '09:20:00', 'daily', 'ordinary', false),
  (2, '09:40:00', 'daily', 'ordinary', false),
  (2, '10:00:00', 'daily', 'ordinary', false),
  -- Late Morning (Image 2)
  (2, '10:10:00', 'daily', 'ordinary', false),
  (2, '10:45:00', 'daily', 'ordinary', false),
  (2, '11:10:00', 'daily', 'ordinary', false),
  (2, '11:30:00', 'daily', 'ordinary', false),
  (2, '12:00:00', 'daily', 'ordinary', false),
  (2, '13:00:00', 'daily', 'ordinary', false),
  -- Afternoon (Image 1)
  (2, '14:00:00', 'daily', 'ordinary', false),
  (2, '14:40:00', 'daily', 'ordinary', false),
  (2, '15:50:00', 'daily', 'ordinary', false),
  (2, '16:10:00', 'daily', 'ordinary', false),
  (2, '17:00:00', 'daily', 'ordinary', false),
  (2, '18:10:00', 'daily', 'ordinary', true);  -- கடைசி பேருந்து (Last Bus) 🔴

-- Also insert confirmed Madurai timings from Images 2, 3, 4
DELETE FROM bus_timings WHERE route_id = 5;

INSERT INTO bus_timings (route_id, departs_at, days_of_week, bus_type, is_last_bus) VALUES
  (5, '04:00:00', 'daily', 'ordinary', false),  -- Image 4
  (5, '07:10:00', 'daily', 'ordinary', false),  -- Image 3
  (5, '07:35:00', 'daily', 'ordinary', false),  -- Image 4
  (5, '09:25:00', 'daily', 'ordinary', false),  -- Image 2
  (5, '16:30:00', 'daily', 'ordinary', true);   -- Last bus (estimated)

-- Verify counts
SELECT 'Dindigul timings' AS info, count(*) FROM bus_timings WHERE route_id = 10
UNION ALL
SELECT 'Bodi timings', count(*) FROM bus_timings WHERE route_id = 2
UNION ALL
SELECT 'Madurai timings', count(*) FROM bus_timings WHERE route_id = 5
UNION ALL
SELECT 'Total bus timings', count(*) FROM bus_timings;
