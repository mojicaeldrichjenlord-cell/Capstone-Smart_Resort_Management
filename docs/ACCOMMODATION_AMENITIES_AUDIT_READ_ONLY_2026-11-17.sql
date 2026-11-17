-- ==============================================================
-- ARVIC SEASIDE — AMENITIES AUDIT, READ-ONLY
-- Date: 2026-11-17
-- Connect to Aiven MySQL Workbench where defaultdb is production.
-- Execute SELECT statements ONLY. This file contains NO UPDATE/DELETE.
-- ==============================================================

-- Q1. Inspect EVERY room's actual amenities status. Avoid assuming that
-- all names/IDs have been checked, including any legacy duplicate rooms.
SELECT
  a.id,
  a.name AS accommodation,
  c.name AS category,
  CASE
    WHEN TRIM(COALESCE(a.amenities, '')) = '' THEN 'MISSING'
    ELSE 'FILLED'
  END AS amenities_status,
  LEFT(REPLACE(COALESCE(a.amenities, ''), CHAR(10), ' | '), 160) AS amenities_preview
FROM defaultdb.accommodations AS a
JOIN defaultdb.accommodation_categories AS c
  ON c.id = a.category_id
WHERE LOWER(c.name) LIKE '%room%'
ORDER BY a.id;

-- Q2. Specifically verify Double Room 1/2 + Family Room A/B.
SELECT
  a.id,
  a.name AS accommodation,
  c.name AS category,
  CASE
    WHEN TRIM(COALESCE(a.amenities, '')) = '' THEN 'MISSING'
    ELSE 'FILLED'
  END AS amenities_status,
  a.amenities
FROM defaultdb.accommodations AS a
JOIN defaultdb.accommodation_categories AS c ON c.id = a.category_id
WHERE a.name IN ('Double Room 1', 'Double Room 2', 'Family Room A', 'Family Room B')
ORDER BY a.id;

-- Q3. Confirm that ordinary COTTAGE-category rows have no listed amenities.
-- Do NOT include Single Room Cottage 1-5: these are ROOM-category records.
SELECT
  a.id, a.name AS accommodation, c.name AS category,
  CASE WHEN TRIM(COALESCE(a.amenities, '')) = '' THEN 'NONE LISTED'
       ELSE 'REVIEW: DATA CONTRADICTS CONFIRMED POLICY' END AS status,
  a.amenities
FROM defaultdb.accommodations AS a
JOIN defaultdb.accommodation_categories AS c ON c.id = a.category_id
WHERE LOWER(c.name) LIKE '%cottage%'
ORDER BY a.id;

-- Q4. Inspect Function Area rows before any admin-side data edits.
-- Resort-confirmed inclusions: Tables; Monoblock chairs; Karaoke.
SELECT
  a.id, a.name AS accommodation, c.name AS category,
  CASE WHEN TRIM(COALESCE(a.amenities, '')) = '' THEN 'MISSING'
       ELSE 'FILLED / REVIEW CONTENT' END AS amenities_status,
  a.amenities
FROM defaultdb.accommodations AS a
JOIN defaultdb.accommodation_categories AS c ON c.id = a.category_id
WHERE LOWER(c.name) LIKE '%function%'
ORDER BY a.id;

-- Production safety: NO SQL DML here. Back up and verify exact Function
-- Area IDs before applying the inclusions to the source-of-truth database.
