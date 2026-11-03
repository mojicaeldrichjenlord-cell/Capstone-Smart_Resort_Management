-- SMART RESORT BOOKING SYSTEM — REFUND PHASE 1 (REQUEST TRACKING ONLY)
-- PREPARED MIGRATION: Run ONLY after a verified backup on the isolated test DB.
-- Do not execute on the production Aiven defaultdb without a separate review.
-- A refund request is NOT proof of a refund or authorization to move money.
-- Approval, disbursement, actual provider capture matching, and accounting
-- corrections are deliberately NOT performed by this phase.
CREATE TABLE IF NOT EXISTS refund_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  customer_user_id INT NOT NULL,
  reason VARCHAR(500) NOT NULL,
  status ENUM('pending_review','approved','rejected','processing','refunded')
    NOT NULL DEFAULT 'pending_review',
  approved_amount DECIMAL(10,2) NULL,
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  admin_notes VARCHAR(1000) NULL,
  refund_reference VARCHAR(180) NULL,
  refunded_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  version INT UNSIGNED NOT NULL DEFAULT 0,
  -- Prevent duplicate concurrent customer requests for the same reservation.
  UNIQUE KEY uq_refund_request_reservation (reservation_id),
  KEY idx_refund_request_customer (customer_user_id, created_at),
  KEY idx_refund_request_status (status, created_at),
  CONSTRAINT fk_refund_request_reservation FOREIGN KEY (reservation_id)
    REFERENCES reservations(id),
  CONSTRAINT fk_refund_request_customer FOREIGN KEY (customer_user_id)
    REFERENCES users(id),
  CONSTRAINT fk_refund_request_reviewer FOREIGN KEY (reviewed_by)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- No rows are backfilled: past cancellations remain unchanged.
-- IMPORTANT: PAYPAL_DEMO_MODE may have credited a full 50% downpayment while
-- only capturing PHP 1; NEVER compute actual refund due from paid_amount alone.
-- Before any real payout, review the original capture(s) and resort policy.
