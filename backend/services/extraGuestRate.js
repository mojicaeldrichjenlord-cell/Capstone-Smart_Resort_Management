// ============================================================
// ARVIC SEASIDE - ADMIN-OWNED EXTRA GUEST RATE
// Shared by Front Desk billing and Admin Resort Pricing settings.
// Default is ₱250/pax until an explicit Admin update is saved.
// NEVER use a rate supplied by a Front Desk browser request.
// ============================================================
const db = require("../config/db");

const DEFAULT_EXTRA_GUEST_RATE = 250;
const EXTRA_GUEST_RATE_KEY = "extra_guest_rate";
const MAX_EXTRA_GUEST_RATE = 100000;

function parseExtraGuestRate(value) {
  const numeric = Number(value);
  if (value === null || value === undefined || String(value).trim() === "" ||
      !Number.isFinite(numeric) || numeric < 0 ||
      numeric > MAX_EXTRA_GUEST_RATE ||
      Math.abs(Math.round(numeric * 100) - numeric * 100) > 1e-6) {
    return null;
  }
  return numeric;
}

// Read through the same transaction connection where the guest count is locked.
// Table-absent fallback makes the default work before the optional migration,
// while Admin cannot save a new rate until persistent storage is installed.
async function getExtraGuestRate(connection = null) {
  const executor = connection || db.promise();
  try {
    const [rows] = await executor.query(
      "SELECT setting_value FROM resort_settings WHERE setting_key = ? LIMIT 1",
      [EXTRA_GUEST_RATE_KEY],
    );
    if (!rows.length) return DEFAULT_EXTRA_GUEST_RATE;
    const rate = parseExtraGuestRate(rows[0].setting_value);
    if (rate === null) throw new Error("Stored extra guest rate is invalid.");
    return rate;
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") return DEFAULT_EXTRA_GUEST_RATE;
    throw error;
  }
}

async function setExtraGuestRate(rate, adminId) {
  const parsed = parseExtraGuestRate(rate);
  if (parsed === null) {
    const error = new Error("Enter a valid rate from ₱0 to ₱100,000 (maximum 2 decimals).");
    error.status = 400;
    throw error;
  }
  await db.promise().query(
    `INSERT INTO resort_settings (setting_key, setting_value, updated_by)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value),
       updated_by = VALUES(updated_by)`,
    [EXTRA_GUEST_RATE_KEY, parsed, adminId],
  );
  return parsed;
}

module.exports = {
  DEFAULT_EXTRA_GUEST_RATE,
  getExtraGuestRate,
  setExtraGuestRate,
  parseExtraGuestRate,
};
