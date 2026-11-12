-- Smart Resort Booking System: reservation_status ENUM consistency.
-- PREPARED ONLY. DO NOT execute against live Aiven without a verified backup
-- and explicit approval from the system owner.
--
-- Existing database/smart_resort.sql has:
-- ENUM('pending','approved','cancelled','completed')
-- but both Admin and Manager controllers use 'rejected'.
--
-- Verify live schema (read-only) before applying:
-- SHOW COLUMNS FROM reservations LIKE 'reservation_status';
--
-- MySQL stores ENUM as ordinal indices. Append 'rejected' at the END
-- to preserve the numeric ordinals of all four existing statuses.
-- This migration does NOT change existing reservation records.
--
-- Only after approval and backup, execute during a maintenance window:
ALTER TABLE `reservations`
  MODIFY COLUMN `reservation_status`
  ENUM('pending','approved','cancelled','completed','rejected')
  NOT NULL DEFAULT 'pending';
--
-- Verify afterward (read-only):
-- SHOW COLUMNS FROM reservations LIKE 'reservation_status';
--
-- Do not map 'rejected' to 'cancelled': the business meanings differ.
