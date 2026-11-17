-- Finding #017: Admin-reviewed No-Show handling.
-- PREPARED ONLY. Apply to LOCAL TEST DB first, after backup + schema review.
-- NEVER run against production Aiven without approval and a verified backup.
--
-- Preflight (read-only):
-- SHOW COLUMNS FROM reservations LIKE 'reservation_status';
-- SELECT reservation_status, COUNT(*) FROM reservations GROUP BY reservation_status;
--
-- Append no_show AFTER existing enum values. This matches the earlier
-- 2026-10-13 rejected-status migration and preserves existing enum ordinals.
-- If the actual production ENUM differs, reconcile it before running ALTER.
ALTER TABLE reservations
  MODIFY COLUMN reservation_status
  ENUM('pending','approved','cancelled','completed','rejected','no_show')
  NOT NULL DEFAULT 'pending';

-- Audit EVERY deliberate Admin transition into no_show.
-- No automatic conversion of old Pending / Approved reservations.
-- Do not alter payment_status, paid_amount, or transaction history.
CREATE TABLE IF NOT EXISTS reservation_no_show_audit (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reservation_id INT NOT NULL,
  marked_by_admin_id INT NOT NULL,
  previous_status VARCHAR(20) NOT NULL,
  scheduled_checkout_at DATETIME NOT NULL,
  marked_at_utc DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_no_show_reservation (reservation_id),
  KEY idx_no_show_admin (marked_by_admin_id),
  CONSTRAINT fk_no_show_reservation
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Read-only verification:
-- SHOW COLUMNS FROM reservations LIKE 'reservation_status';
-- SHOW TABLES LIKE 'reservation_no_show_audit';
-- SELECT COUNT(*) FROM reservation_no_show_audit;
