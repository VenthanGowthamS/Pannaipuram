-- Migration: more local-service categories (v110, November 2026)
-- Run in the Supabase SQL Editor. Safe to run more than once.
--
-- The original table only allowed 6 categories (milk, post, flower, plumber,
-- electrician, other), so car wash, e-Sevai centres and logistics all had to
-- be saved as "other". This widens the list and moves the existing rows.
-- Keep in sync with backend/src/utils/serviceCategories.js.

-- Remove EVERY old CHECK rule on category, whatever it is called. (Dropping
-- only 'local_services_category_check' by name is not enough if production's
-- rule has another name: the old 6-value rule would survive, the first UPDATE
-- below would break it, and the SQL Editor would roll the whole file back.)
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
     WHERE conrelid = 'local_services'::regclass
       AND contype = 'c'
       AND pg_get_constraintdef(oid) ILIKE '%category%'
  LOOP
    EXECUTE format('ALTER TABLE local_services DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;
ALTER TABLE local_services ADD CONSTRAINT local_services_category_check CHECK (category IN (
  'milk', 'grocery', 'flower',
  'vehicle', 'esevai', 'logistics',
  'post', 'plumber', 'electrician', 'carpenter',
  'other'
));

-- Move the rows that were filed under "other" (ids as of November 2026).
-- Each UPDATE only touches a row that is still "other", so re-running is harmless.
-- ⚠️ Check with: SELECT id, category, name_tamil FROM local_services ORDER BY category, id;
UPDATE local_services SET category = 'vehicle'   WHERE category = 'other' AND id IN (25, 31);  -- Engine Doctor (tyre/battery), car water service
UPDATE local_services SET category = 'esevai'    WHERE category = 'other' AND id IN (32, 33);  -- Ezhumalaiyan Net Works, Vanji e-Sevai & Aadhaar
UPDATE local_services SET category = 'logistics' WHERE category = 'other' AND id = 34;         -- Om Logistics
UPDATE local_services SET category = 'grocery'   WHERE category = 'other' AND id = 27;         -- vegetables (Dhamotharan)

-- Check: every row should now be in one of the new categories
SELECT category, COUNT(*) FROM local_services GROUP BY category ORDER BY category;

COMMENT ON COLUMN local_services.category IS 'milk | grocery | flower | vehicle | esevai | logistics | post | plumber | electrician | carpenter | other';
