-- ARVIC SEASIDE: Admin-managed Extra Guest Charge rate
-- Apply to an isolated TEST SCHEMA first; back up before production use.
-- SAFE / RE-RUNNABLE: never changes bookings or historical payments.
-- Default ₱250 per extra guest, editable only via signed Admin API.

CREATE TABLE IF NOT EXISTS resort_settings (
  setting_key VARCHAR(64) PRIMARY KEY,
  setting_value DECIMAL(10,2) NOT NULL,
  updated_by INT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO resort_settings (setting_key, setting_value)
VALUES ('extra_guest_rate', 250.00);

-- Read-only verification after migration:
SELECT setting_key, setting_value, updated_at
FROM resort_settings WHERE setting_key = 'extra_guest_rate';
