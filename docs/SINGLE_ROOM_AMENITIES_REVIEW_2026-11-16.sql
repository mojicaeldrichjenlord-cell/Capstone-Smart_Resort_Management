-- ARVIC SEASIDE BEACH RESORT: SINGLE ROOM AMENITIES (2026-11-16)
-- Status: REVIEW ONLY. Updates below are COMMENTED OUT.
-- Owner verified ALL 11 current Single Rooms share the same facilities:
-- 1 Double Size Bed, PRIVATE CR, TV, Air Conditioned, Dining Table,
-- Pool Balcony, Free Pool and Beach Entrance for 2 Pax.
-- IMPORTANT: NO REFRIGERATOR IN SINGLE ROOMS.
--
-- This review relates to the currently connected Aiven/defaultdb production DB.
-- Do not apply without an up-to-date accommodations backup and explicit review.
-- No GitHub commit or running this read-only preview changes live records.
--
-- Current known IDs from Workbench screenshot: 86-96 inclusive (11 records).
-- Scope guards require room category 2 and a name starting with "Single Room".
-- Does NOT include Double Room, Family Room, Cottage or Function Area.

-- STEP 1: READ ONLY. Preview and compare with existing DB values.
SELECT DATABASE() AS active_database, @@hostname AS server_host;
SELECT a.id, a.name, c.name AS category, a.amenities AS current_amenities
FROM accommodations a
JOIN accommodation_categories c ON c.id = a.category_id
WHERE a.id BETWEEN 86 AND 96
  AND a.category_id = 2
  AND LOWER(TRIM(c.name)) = 'room'
  AND LOWER(a.name) LIKE 'single room%'
ORDER BY a.id;

-- Expected preview count: 11. STOP if the count is different.
SELECT COUNT(*) AS expected_single_room_count
FROM accommodations a
JOIN accommodation_categories c ON c.id = a.category_id
WHERE a.id BETWEEN 86 AND 96
  AND a.category_id = 2
  AND LOWER(TRIM(c.name)) = 'room'
  AND LOWER(a.name) LIKE 'single room%';

-- STEP 2: REVIEW-ONLY UPDATE TEMPLATE.
-- This block is a SQL comment and WILL NOT EXECUTE as supplied.
-- After backup and explicit approval, execute a separate reviewed transaction.
--
-- TARGET AMENITIES, line-separated:
--   1 Double Size Bed
--   Private CR
--   TV
--   Air Conditioned
--   Dining Table
--   Pool Balcony
--   Free Pool and Beach Entrance for 2 Pax
--
/*
START TRANSACTION;

UPDATE accommodations a
JOIN accommodation_categories c ON c.id = a.category_id
SET a.amenities = CONCAT_WS(CHAR(10),
  '1 Double Size Bed',
  'Private CR',
  'TV',
  'Air Conditioned',
  'Dining Table',
  'Pool Balcony',
  'Free Pool and Beach Entrance for 2 Pax'
)
WHERE a.id BETWEEN 86 AND 96
  AND a.category_id = 2
  AND LOWER(TRIM(c.name)) = 'room'
  AND LOWER(a.name) LIKE 'single room%';

SELECT ROW_COUNT() AS changed_single_rooms;

SELECT id, name, amenities
FROM accommodations
WHERE id BETWEEN 86 AND 96
ORDER BY id;

-- DRY RUN ONLY: undo the update until the backup and review are verified.
ROLLBACK;
-- A final COMMIT is intentionally omitted from this draft.
*/
