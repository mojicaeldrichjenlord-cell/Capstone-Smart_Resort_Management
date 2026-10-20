-- Smart Resort Booking System: permanent accommodation image storage
-- Run ONCE against the selected database after checking the active schema.
-- Non-destructive: preserves accommodations, room_gallery, reservations and payments.
-- Uploaded photographs use this table; existing photo URL columns stay unchanged.

CREATE TABLE IF NOT EXISTS accommodation_media (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  mime_type VARCHAR(32) NOT NULL,
  image_data MEDIUMBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verify installation (should show 1 table):
SELECT COUNT(*) AS media_table_exists
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'accommodation_media';
