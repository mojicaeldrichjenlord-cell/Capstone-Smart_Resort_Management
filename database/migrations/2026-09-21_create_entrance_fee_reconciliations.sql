-- ============================================================
-- Smart Resort Booking System
-- Migration: Entrance Fee Overpayment Reconciliation
-- Date: 2026-09-21
-- Purpose:
--   Preserve original entrance collections while recording
--   refunds/payment corrections as separate audit records.
-- ============================================================

USE defaultdb;

CREATE TABLE IF NOT EXISTS entrance_fee_reconciliations (
  id INT NOT NULL AUTO_INCREMENT,
  booking_id INT NOT NULL,
  reconciliation_type ENUM('refund', 'correction') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  note VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  INDEX idx_entrance_fee_reconciliations_booking_id (booking_id),

  CONSTRAINT fk_entrance_fee_reconciliations_booking
    FOREIGN KEY (booking_id)
    REFERENCES reservations(id)
    ON DELETE CASCADE
);