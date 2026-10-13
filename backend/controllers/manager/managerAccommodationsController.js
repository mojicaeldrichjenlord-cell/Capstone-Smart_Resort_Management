// Manager-only accommodation rate and listing-status administration.
// Mounted behind requireManagerAuth. No category, gallery, map, capacity,
// payment, reservation, or accommodation-delete operations.
const db = require("../../config/db");
const ALLOWED_STATUS = new Set(["available", "unavailable"]);
const PRICE_KEYS = ["day_price", "overnight_price", "extended_price"];
const RATE_LIMIT = 1000000;

function validMoney(input) {
  const raw = String(input ?? "").trim();
  if (!/^(?:0|[1-9]\d{0,6})(?:\.\d{1,2})?$/.test(raw)) return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0 || amount > RATE_LIMIT) return null;
  return amount.toFixed(2);
}
function normalizeInventoryState(input, allowExtraFields = false) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const keys = Object.keys(input);
  if ((!allowExtraFields && keys.length !== 4) ||
      !["status", ...PRICE_KEYS].every(key => Object.prototype.hasOwnProperty.call(input, key))) {
    return null;
  }
  const status = String(input.status || "").trim().toLowerCase();
  if (!ALLOWED_STATUS.has(status)) return null;
  const parsed = { status };
  for (const key of PRICE_KEYS) {
    parsed[key] = validMoney(input[key]);
    if (parsed[key] === null) return null;
  }
  return parsed;
}

exports.listManagerAccommodations = async (_req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT a.id, a.name, c.name AS category_name, " +
      "a.max_capacity, a.status, a.day_price, a.overnight_price, " +
      "a.extended_price, a.updated_at " +
      "FROM accommodations a INNER JOIN accommodation_categories c " +
      "ON c.id = a.category_id ORDER BY a.id DESC LIMIT 300"
    );
    return res.status(200).json({
      success: true,
      accommodations: rows.map(row => ({
        id: Number(row.id),
        name: String(row.name || ""),
        category: String(row.category_name || ""),
        capacity: Number(row.max_capacity || 0),
        status: String(row.status || ""),
        day_price: Number(row.day_price || 0),
        overnight_price: Number(row.overnight_price || 0),
        extended_price: Number(row.extended_price || 0),
        updated_at: row.updated_at ?? null,
      })),
      limit: 300,
      note: "Listed status is not live date-specific booking availability.",
    });
  } catch (error) {
    console.error("Manager accommodation list error:", error.message);
    return res.status(500).json({
      success: false, message: "Could not load accommodation inventory.",
    });
  }
};

exports.updateManagerAccommodationOperations = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false, message: "Invalid accommodation ID.",
    });
  }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body) ||
      Object.keys(req.body).some(key => !["status", ...PRICE_KEYS, "expected"].includes(key))) {
    return res.status(400).json({
      success: false, message: "Manager may only update accommodation rates and listing status.",
    });
  }
  const desired = normalizeInventoryState(req.body, true);
  const expected = normalizeInventoryState(req.body.expected);
  if (!desired || !expected) {
    return res.status(400).json({
      success: false, message: "Invalid status or price. Use available/unavailable and rates from PHP 0 to 1,000,000 with up to 2 decimals.",
    });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT id, status, day_price, overnight_price, extended_price " +
      "FROM accommodations WHERE id = ? LIMIT 1",
      [id],
    );
    if (!rows.length) {
      return res.status(404).json({
        success: false, message: "Accommodation not found.",
      });
    }
    const current = normalizeInventoryState(rows[0], true);
    if (!current) {
      return res.status(409).json({
        success: false, code: "INVENTORY_STATUS_UNSUPPORTED",
        message: "Accommodation currently has unsupported inventory fields. Contact Admin.",
      });
    }
    const same = (a, b) =>
      a.status === b.status &&
      PRICE_KEYS.every(key => a[key] === b[key]);
    if (!same(current, expected)) {
      return res.status(409).json({
        success: false, code: "INVENTORY_CHANGED",
        message: "Inventory changed since you opened it. Refresh and review current prices.",
      });
    }
    if (same(current, desired)) {
      return res.status(200).json({
        success: true, message: "No changes needed.",
      });
    }

    const [result] = await db.promise().query(
      "UPDATE accommodations SET status = ?, day_price = ?, " +
      "overnight_price = ?, extended_price = ? " +
      "WHERE id = ? AND status = ? AND day_price = ? " +
      "AND overnight_price = ? AND extended_price = ?",
      [desired.status, ...PRICE_KEYS.map(key => desired[key]), id,
        expected.status, ...PRICE_KEYS.map(key => expected[key])],
    );
    if (Number(result.affectedRows) !== 1) {
      return res.status(409).json({
        success: false, code: "INVENTORY_CHANGED",
        message: "Inventory was updated by another user. Refresh and try again.",
      });
    }
    return res.status(200).json({
      success: true, message: "Accommodation rates and listing status saved.",
    });
  } catch (error) {
    console.error("Manager accommodation update error:", error.message);
    return res.status(500).json({
      success: false, message: "Could not update accommodation settings.",
    });
  }
};
