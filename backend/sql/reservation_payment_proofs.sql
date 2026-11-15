-- QA-008: Durable, private payment-proof images for Front Desk manual bookings.
-- Apply once to the selected TEST database before enabling/testing the backend
-- changes. After QA approval, apply to production Aiven BEFORE deploying code.
-- This creates a new table only; it does not rewrite historical reservations.
-- MAX proof upload: 8 MB, stored as binary (not a public /uploads URL).
CREATE TABLE IF NOT EXISTS reservation_payment_proofs (
  id INT NOT NULL AUTO_INCREMENT,
  reservation_id INT NOT NULL,
  mime_type VARCHAR(32) NOT NULL,
  image_data MEDIUMBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reservation_payment_proof (reservation_id),
  CONSTRAINT fk_reservation_payment_proof_reservation
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Read-only sanity check:
-- SELECT COUNT(*) AS durable_proof_count FROM reservation_payment_proofs;
