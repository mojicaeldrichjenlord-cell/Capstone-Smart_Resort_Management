-- Housekeeping Phase 2 — PREPARED MIGRATION ONLY.
-- Do NOT run on real Aiven until the owner approves and a verified backup exists.
-- Inspect SHOW CREATE TABLE for reservation_items, accommodations, users first.
-- One task per completed reservation item; same accommodation can have
-- multiple turnover tasks on one day. No accommodation/status/payment mutation.
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  reservation_item_id INT NOT NULL,
  accommodation_id INT NOT NULL,
  task_date DATE NOT NULL,
  status ENUM('needs_cleaning','in_progress','cleaned','verified_ready')
    NOT NULL DEFAULT 'needs_cleaning',
  assigned_to INT NOT NULL,
  created_by INT NOT NULL,
  verified_by INT DEFAULT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 0,
  started_at DATETIME DEFAULT NULL,
  cleaned_at DATETIME DEFAULT NULL,
  verified_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_housekeeping_item (reservation_item_id),
  KEY idx_housekeeping_date_status (task_date, status),
  KEY idx_housekeeping_staff_status (assigned_to, status),
  KEY idx_housekeeping_accommodation (accommodation_id),
  CONSTRAINT fk_housekeeping_item FOREIGN KEY (reservation_item_id)
    REFERENCES reservation_items (id),
  CONSTRAINT fk_housekeeping_accommodation FOREIGN KEY (accommodation_id)
    REFERENCES accommodations (id),
  CONSTRAINT fk_housekeeping_assignee FOREIGN KEY (assigned_to)
    REFERENCES users (id),
  CONSTRAINT fk_housekeeping_creator FOREIGN KEY (created_by)
    REFERENCES users (id),
  CONSTRAINT fk_housekeeping_verifier FOREIGN KEY (verified_by)
    REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
-- This creates an EMPTY task table; it does NOT backfill historical stays.
-- Manager explicitly creates a task only for a completed reservation item.
-- "verified_ready" is housekeeping verification, NOT accommodation availability.
