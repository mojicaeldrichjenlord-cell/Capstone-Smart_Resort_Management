-- ARVIC SEASIDE RESORT — LOCAL ROOM AMENITIES (MANUAL QA UPDATE)
-- Date: 2026-11-16
-- Run ONLY in your local MySQL Workbench connection and local smart_resort DB.
-- NEVER run on Aiven / production. This script is not executed by the application.
--
-- Confirmed by project owner: every Room accommodation includes Aircon,
-- Own CR (private bathroom), TV, Ref (refrigerator) and Table.
-- Cottages and Function Areas are NOT modified.
-- This updates only amenities; descriptions/prices/status/reservations remain as-is.
--
-- Before execution: back up/export the local accommodations table.
-- Make sure the preview shows the intended local rooms and category IDs.

USE `smart_resort`;

-- STEP A: Preview all records that the UPDATE can affect.
SELECT a.id, a.name, c.name AS category, a.amenities AS previous_amenities
FROM accommodations AS a
JOIN accommodation_categories AS c ON c.id = a.category_id
WHERE a.category_id = 2 AND LOWER(TRIM(c.name)) = 'room'
ORDER BY a.name, a.id;

-- STEP B: Update ONLY Room-category accommodations on local MySQL.
START TRANSACTION;

UPDATE accommodations AS a
JOIN accommodation_categories AS c ON c.id = a.category_id
SET a.amenities = CONCAT_WS(CHAR(10),
  'Aircon',
  'Own CR',
  'TV',
  'Ref',
  'Table'
)
WHERE a.category_id = 2
  AND LOWER(TRIM(c.name)) = 'room'
  AND COALESCE(a.amenities, '') <> CONCAT_WS(CHAR(10),
    'Aircon', 'Own CR', 'TV', 'Ref', 'Table'
  );

SELECT ROW_COUNT() AS rooms_changed;

-- STEP C: Verify all Room-category accommodations now have these five amenities.
SELECT a.id, a.name, c.name AS category, a.amenities
FROM accommodations AS a
JOIN accommodation_categories AS c ON c.id = a.category_id
WHERE a.category_id = 2 AND LOWER(TRIM(c.name)) = 'room'
ORDER BY a.name, a.id;

-- STEP D: Confirm no other accommodation categories were targeted.
SELECT c.name AS category, COUNT(*) AS accommodation_count
FROM accommodations AS a
JOIN accommodation_categories AS c ON c.id = a.category_id
GROUP BY c.id, c.name
ORDER BY c.id;

-- Commit the LOCAL update after checking that the above scope is correct.
COMMIT;
