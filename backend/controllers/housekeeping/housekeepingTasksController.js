// Housekeeping Phase 2. Standalone turnover tasks only.
// Never updates accommodations, reservations, payments or check-in flags.
// Task statuses are operational checks, NOT real-time room availability.
const db = require("../../config/db");

// All dates are interpreted as Philippine calendar days, never browser-local dates.
const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
function manilaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return values.year + "-" + values.month + "-" + values.day;
}
function dayValid(value) {
  if (typeof value !== "string" || !dayPattern.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  const now = new Date(manilaToday() + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value &&
    Math.abs(date - now) <= 366 * 86400000;
}
// Reject invalid date filters before running any database query.
function getDay(req, res) {
  const day = req.query.date === undefined ? manilaToday() : req.query.date;
  if (!dayValid(day)) {
    res.status(400).json({ success: false, code: "INVALID_TASK_DATE",
      message: "Select a valid date within one year of today." });
    return null;
  }
  return day;
}
// Reservation, user and task IDs must be positive safe integers.
function positiveId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}
// Optimistic locking: every status change must carry the version just displayed.
// A stale version makes the UPDATE affect zero rows instead of overwriting another action.
function versionFrom(body) {
  if (!body || typeof body !== "object" || Array.isArray(body) ||
    Object.keys(body).length !== 1 || !Object.hasOwn(body, "version")) return null;
  if (typeof body.version !== "number") return null;
  return Number.isSafeInteger(body.version) && body.version >= 0 ? body.version : null;
}
// Missing housekeeping_tasks means the approved migration has not been applied.
// Return a useful 503 rather than leaking MySQL diagnostics into the UI.
function sendError(res, error, label) {
  if (error?.code === "ER_NO_SUCH_TABLE" || error?.errno === 1146) {
    return res.status(503).json({ success: false, code: "HOUSEKEEPING_MIGRATION_REQUIRED",
      message: "Cleaning tasks are not activated yet. Ask Admin to review the database migration." });
  }
  console.error("Housekeeping " + label + " failed:", error.message);
  return res.status(500).json({ success: false, message: "Housekeeping operation failed." });
}
// API whitelist: never send guest identity, contact details, payments or private notes.
function slim(row) {
  return {
    id: Number(row.id),
    reservation_item_id: Number(row.reservation_item_id),
    accommodation_id: Number(row.accommodation_id),
    accommodation: String(row.accommodation_name || ""),
    reservation_code: String(row.reservation_code || ""),
    task_date: String(row.task_date || "").slice(0,10),
    status: String(row.status || ""),
    version: Number(row.version),
    assigned_to: Number(row.assigned_to),
    assigned_name: String(row.assigned_name || ""),
    verified_by: row.verified_by === null ? null : Number(row.verified_by),
    started_at: row.started_at || null,
    cleaned_at: row.cleaned_at || null,
    verified_at: row.verified_at || null,
  };
}
// Shared read-only list query for both roles. Authorization is applied by each endpoint.
const taskListSql =
  "SELECT ht.id, ht.reservation_item_id, ht.accommodation_id, " +
  "a.name AS accommodation_name, r.reservation_code, " +
  "DATE_FORMAT(ht.task_date,'%Y-%m-%d') AS task_date, ht.status, " +
  "ht.version, ht.assigned_to, u.fullname AS assigned_name, " +
  "ht.verified_by, ht.started_at, ht.cleaned_at, ht.verified_at " +
  "FROM housekeeping_tasks ht " +
  "JOIN accommodations a ON a.id = ht.accommodation_id " +
  "JOIN reservation_items ri ON ri.id = ht.reservation_item_id " +
  "JOIN reservations r ON r.id = ri.reservation_id " +
  "JOIN users u ON u.id = ht.assigned_to ";

// MANAGER: view task progress for one checkout date; no database changes.
exports.listManagerHousekeepingTasks = async (req, res) => {
  const day = getDay(req, res);
  if (!day) return;
  try {
    const [rows] = await db.promise().query(
      taskListSql + "WHERE ht.task_date = ? " +
      "ORDER BY FIELD(ht.status,'needs_cleaning','in_progress','cleaned','verified_ready'), ht.id DESC LIMIT 200",
      [day]);
    return res.json({ success: true, date: day, tasks: rows.map(slim), limit: 200 });
  } catch (error) { return sendError(res, error, "manager task list"); }
};

// HOUSEKEEPING: only own assignments, plus unfinished tasks from prior dates.
exports.listMyHousekeepingTasks = async (req, res) => {
  const day = getDay(req, res);
  if (!day) return;
  try {
    const [rows] = await db.promise().query(
      taskListSql + "WHERE ht.assigned_to = ? AND " +
      "(ht.task_date = ? OR (ht.task_date < ? AND ht.status <> 'verified_ready')) " +
      "ORDER BY ht.task_date ASC, ht.id ASC LIMIT 200",
      [req.housekeepingUser.id, day, day]);
    return res.json({ success: true, date: day, tasks: rows.map(slim), limit: 200,
      note: "Includes outstanding older assignments; verified ready does not override booking availability." });
  } catch (error) { return sendError(res, error, "staff task list"); }
};

// MANAGER: offer active, verified Housekeeping accounts for the assignment dropdown.
exports.listHousekeepingStaff = async (_req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT id, fullname FROM users WHERE LOWER(role) = 'housekeeping' " +
      "AND account_status = 'active' AND is_verified = 1 ORDER BY fullname LIMIT 100");
    return res.json({ success: true, staff: rows.map(x => ({
      id: Number(x.id), fullname: String(x.fullname || ""),
    })) });
  } catch (error) { return sendError(res, error, "staff lookup"); }
};

// MANAGER: offer completed reservation items not yet assigned a cleaning task.
// Pending/approved/rejected reservations must not appear in this list.
exports.listEligibleHousekeepingItems = async (req, res) => {
  const day = getDay(req, res);
  if (!day) return;
  try {
    const [rows] = await db.promise().query(
      "SELECT ri.id AS reservation_item_id, a.name AS accommodation, " +
      "r.reservation_code, DATE_FORMAT(ri.check_out_date,'%Y-%m-%d') AS task_date " +
      "FROM reservation_items ri " +
      "JOIN reservations r ON r.id = ri.reservation_id " +
      "JOIN accommodations a ON a.id = ri.accommodation_id " +
      "LEFT JOIN housekeeping_tasks ht ON ht.reservation_item_id = ri.id " +
      "WHERE r.reservation_status = 'completed' AND ri.check_out_date = ? " +
      "AND ht.id IS NULL ORDER BY ri.id DESC LIMIT 200",
      [day]);
    return res.json({ success: true, date: day, items: rows.map(x => ({
      reservation_item_id: Number(x.reservation_item_id),
      accommodation: String(x.accommodation || ""),
      reservation_code: String(x.reservation_code || ""),
      task_date: String(x.task_date || "").slice(0,10),
    })) });
  } catch (error) { return sendError(res, error, "eligible items"); }
};

// MANAGER: create one task per completed reservation item. The UNIQUE constraint
// prevents duplicates even when two managers click Create simultaneously.
exports.createHousekeepingTask = async (req, res) => {
  const body = req.body;
  const item = positiveId(body?.reservation_item_id);
  const assignee = positiveId(body?.assigned_to);
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      Object.keys(body).length !== 2 || !item || !assignee) {
    return res.status(400).json({ success: false,
      message: "Select one completed reservation item and active Housekeeping staff." });
  }
  try {
    // Atomic INSERT SELECT: only completed bookings and verified active staff.
    // Unique reservation_item_id prevents duplicate turnover tasks even in races.
    const [result] = await db.promise().query(
      "INSERT INTO housekeeping_tasks " +
      "(reservation_item_id, accommodation_id, task_date, assigned_to, created_by) " +
      "SELECT ri.id, ri.accommodation_id, ri.check_out_date, u.id, ? " +
      "FROM reservation_items ri " +
      "JOIN reservations r ON r.id = ri.reservation_id " +
      "JOIN users u ON u.id = ? " +
      "WHERE ri.id = ? AND r.reservation_status = 'completed' " +
      "AND LOWER(u.role) = 'housekeeping' AND u.account_status = 'active' " +
      "AND u.is_verified = 1",
      [req.managerUser.id, assignee, item]);
    if (Number(result.affectedRows) !== 1) {
      return res.status(409).json({ success: false,
        code: "TASK_INELIGIBLE", message: "Completed reservation item or active Housekeeping staff not found." });
    }
    return res.status(201).json({ success: true, id: Number(result.insertId),
      message: "Turnover task assigned. Accommodation availability is unchanged." });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY" || error?.errno === 1062) {
      return res.status(409).json({ success: false, code: "TASK_ALREADY_EXISTS",
        message: "This reservation item already has a cleaning task." });
    }
    return sendError(res, error, "create task");
  }
};

// MANAGER: reassign only BEFORE staff begins cleaning. Version prevents races.
exports.reassignHousekeepingTask = async (req, res) => {
  const id = positiveId(req.params.id), staff = positiveId(req.body?.assigned_to);
  const version = req.body?.version;
  if (!id || !staff || !req.body || typeof req.body !== "object" || Array.isArray(req.body) ||
      Object.keys(req.body).length !== 2 || typeof version !== "number" ||
      !Number.isSafeInteger(version) || version < 0) {
    return res.status(400).json({ success: false, message: "Invalid task, assignee or version." });
  }
  try {
    const [result] = await db.promise().query(
      "UPDATE housekeeping_tasks ht JOIN users u ON u.id = ? " +
      "SET ht.assigned_to = u.id, ht.version = ht.version + 1 " +
      "WHERE ht.id = ? AND ht.version = ? AND ht.status = 'needs_cleaning' " +
      "AND LOWER(u.role) = 'housekeeping' AND u.account_status = 'active' AND u.is_verified = 1",
      [staff, id, version]);
    if (Number(result.affectedRows) !== 1) {
      return res.status(409).json({ success: false, code: "TASK_CHANGED",
        message: "Task changed, is already underway, or staff is not active. Refresh." });
    }
    return res.json({ success: true, message: "Task reassigned successfully." });
  } catch (error) { return sendError(res, error, "reassign task"); }
};

// ASSIGNED STAFF: Needs Cleaning -> In Progress; cannot start another staff's task.
exports.startHousekeepingTask = async (req, res) => {
  const id = positiveId(req.params.id), version = versionFrom(req.body);
  if (!id || version === null) {
    return res.status(400).json({ success: false, message: "Invalid task version." });
  }
  try {
    const [result] = await db.promise().query(
      "UPDATE housekeeping_tasks SET status = 'in_progress', started_at = NOW(), " +
      "version = version + 1 WHERE id = ? AND assigned_to = ? " +
      "AND status = 'needs_cleaning' AND version = ?",
      [id, req.housekeepingUser.id, version]);
    if (Number(result.affectedRows) !== 1) {
      return res.status(409).json({ success: false, code: "TASK_CHANGED",
        message: "Task is not assigned to you or was already updated. Refresh." });
    }
    return res.json({ success: true, message: "Cleaning started." });
  } catch (error) { return sendError(res, error, "start task"); }
};

// ASSIGNED STAFF: In Progress -> Cleaned, leaving verification to the Manager.
exports.markHousekeepingCleaned = async (req, res) => {
  const id = positiveId(req.params.id), version = versionFrom(req.body);
  if (!id || version === null) {
    return res.status(400).json({ success: false, message: "Invalid task version." });
  }
  try {
    const [result] = await db.promise().query(
      "UPDATE housekeeping_tasks SET status = 'cleaned', cleaned_at = NOW(), " +
      "version = version + 1 WHERE id = ? AND assigned_to = ? " +
      "AND status = 'in_progress' AND version = ?",
      [id, req.housekeepingUser.id, version]);
    if (Number(result.affectedRows) !== 1) {
      return res.status(409).json({ success: false, code: "TASK_CHANGED",
        message: "Cleaning was not started by you or task changed. Refresh." });
    }
    return res.json({ success: true, message: "Task marked cleaned. Manager verification is pending." });
  } catch (error) { return sendError(res, error, "mark cleaned"); }
};

// MANAGER: Cleaned -> Verified Ready only when no checked-in booking occupies
// this accommodation. This DOES NOT make the accommodation bookable automatically.
exports.verifyHousekeepingTask = async (req, res) => {
  const id = positiveId(req.params.id), version = versionFrom(req.body);
  if (!id || version === null) {
    return res.status(400).json({ success: false, message: "Invalid task version." });
  }
  try {
    const [result] = await db.promise().query(
      "UPDATE housekeeping_tasks ht SET ht.status = 'verified_ready', " +
      "ht.verified_at = NOW(), ht.verified_by = ?, ht.version = ht.version + 1 " +
      "WHERE ht.id = ? AND ht.status = 'cleaned' AND ht.version = ? " +
      "AND NOT EXISTS (SELECT 1 FROM reservation_items ri " +
      "JOIN reservations r ON r.id = ri.reservation_id " +
      "WHERE ri.accommodation_id = ht.accommodation_id " +
      "AND r.reservation_status = 'approved' AND r.is_checked_in = 1)",
      [req.managerUser.id, id, version]);
    if (Number(result.affectedRows) !== 1) {
      return res.status(409).json({ success: false, code: "TASK_CHANGED_OR_OCCUPIED",
        message: "Task changed, is not cleaned, or accommodation has a checked-in reservation. Refresh and verify." });
    }
    return res.json({ success: true,
      message: "Cleaning verified. This does not alter booking availability." });
  } catch (error) { return sendError(res, error, "verify task"); }
};
