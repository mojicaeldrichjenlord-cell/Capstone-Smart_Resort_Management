-- Stage AI-14E correction: Single Room Cottage 1-5 do NOT have Pool Balcony.
-- Verified by resort project owner on 2026-11-16.
-- Manual Aiven/defaultdb data correction ONLY: do not deploy/run automatically.
-- A backup of accommodations was exported in Workbench before earlier updates.
-- Review the preview first; execute the UPDATE only when the five IDs/names match.
-- Poolside A-F (91-96) retain Pool Balcony.
--
-- 1. Preview target records (read-only).
SELECT id, name, amenities
FROM accommodations
WHERE id BETWEEN 86 AND 90
  AND category_id = 2
  AND name IN ('Single Room Cottage 1','Single Room Cottage 2',
    'Single Room Cottage 3','Single Room Cottage 4','Single Room Cottage 5')
ORDER BY id;

-- 2. Scoped UPDATE: remove just the line 'Pool Balcony' and its LF newline.
-- In the previous bulk insert, 'Pool Balcony' was followed by a newline.
-- This preserves all other inclusions and doesn't touch descriptions.
UPDATE accommodations
SET amenities = REPLACE(amenities, CONCAT('Pool Balcony', CHAR(10)), '')
WHERE id BETWEEN 86 AND 90
  AND category_id = 2
  AND name IN ('Single Room Cottage 1','Single Room Cottage 2',
    'Single Room Cottage 3','Single Room Cottage 4','Single Room Cottage 5')
  AND amenities LIKE CONCAT('%Pool Balcony', CHAR(10), '%');

-- 3. Verify Cottage 1-5 lack balcony; Poolside A-F still include it.
SELECT id, name,
       CASE WHEN amenities LIKE '%Pool Balcony%' THEN 'YES' ELSE 'NO' END
         AS has_pool_balcony,
       amenities
FROM accommodations
WHERE id BETWEEN 86 AND 96 AND category_id = 2
ORDER BY id;
