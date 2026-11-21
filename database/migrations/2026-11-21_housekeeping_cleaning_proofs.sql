-- HK-46: Optional/isolated cleaning proof storage, no booking or inventory changes.
-- TEST FIRST on a restored disposable schema. Verify backup before production.
-- Requires database/migrations/2026-10-13_create_housekeeping_tasks.sql.
-- Use SELECT DATABASE() before applying. DO NOT run automatically on Aiven.
-- Each completed reservation-item turnover has its own private photo proof;
-- do not reuse public accommodation_media, or save files on Render ephemeral disk.
CREATE TABLE IF NOT EXISTS housekeeping_cleaning_proofs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT UNSIGNED NOT NULL,
  uploaded_by INT NOT NULL,
  mime_type VARCHAR(32) NOT NULL,
  image_data MEDIUMBLOB NOT NULL,
  image_size INT UNSIGNED NOT NULL,
  image_sha256 CHAR(64) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INT DEFAULT NULL,
  reviewed_at DATETIME DEFAULT NULL,
  UNIQUE KEY uq_housekeeping_cleaning_proof_task (task_id),
  KEY idx_housekeeping_cleaning_proof_uploaded_by (uploaded_by),
  CONSTRAINT fk_housekeeping_cleaning_proof_task
    FOREIGN KEY (task_id) REFERENCES housekeeping_tasks (id),
  CONSTRAINT fk_housekeeping_cleaning_proof_uploader
    FOREIGN KEY (uploaded_by) REFERENCES users (id),
  CONSTRAINT fk_housekeeping_cleaning_proof_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Verification after migration:
-- SHOW TABLES LIKE 'housekeeping_cleaning_proofs';
-- SHOW CREATE TABLE housekeeping_cleaning_proofs;
-- No data is imported into this table, and no existing reservations,
-- accommodations, accounting or housekeeping_tasks statuses are modified.
