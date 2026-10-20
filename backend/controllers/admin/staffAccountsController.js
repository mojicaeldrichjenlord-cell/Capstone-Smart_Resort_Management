// SMART RESORT BOOKING SYSTEM — staff administration controller
// Only /api/admin/staff routes protected by requireAdminAuth call these.
// Cannot list, modify or reset customer/admin accounts through this module.
const db = require("../../config/db");
const bcrypt = require("bcrypt");
const { validStaffRole, validateStaffPassword, normalizeStaffEmail } =
  require("../../utils/staffAccountValidation");

const STAFF_ROLES = ["frontdesk", "staff", "manager", "housekeeping"];

function staffIdFrom(req) {
  const id = Number(req.params.id);
  return Number.isSafeInteger(id) && id > 0 && String(id) === req.params.id ? id : null;
}
function normalizeProfile(body = {}) {
  return {
    fullname: String(body.fullname || "").trim(),
    email: normalizeStaffEmail(body.email),
    phone: String(body.phone || "").trim(),
    address: String(body.address || "").trim()
  };
}
function checkProfile(p) {
  return p.fullname.length >= 2 && p.fullname.length <= 120 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) && p.email.length <= 190 &&
    p.phone.length <= 40 && p.address.length <= 255;
}
function handleFailure(res, error, label) {
  // Never return SQL errors or password hashes to the browser.
  console.error(label, error.code || error.message);
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Email is already registered." });
  }
  return res.status(500).json({ message: "Unable to complete staff account request." });
}
async function findStaff(id) {
  const [rows] = await db.promise().query(
    "SELECT id, fullname, email, phone, address, role, account_status, is_verified " +
    "FROM users WHERE id = ? AND role IN (?, ?, ?, ?) LIMIT 1",
    [id, ...STAFF_ROLES]
  );
  return rows[0] || null;
}
// Display limited public staff profile fields, NEVER a password or OTP hash.
async function listStaff(req, res) {
  try {
    const [rows] = await db.promise().query(
      "SELECT id, fullname, email, phone, address, role, account_status, is_verified " +
      "FROM users WHERE role IN (?, ?, ?, ?) ORDER BY role, fullname, id",
      STAFF_ROLES
    );
    return res.json({ success: true, staff: rows });
  } catch (error) { return handleFailure(res, error, "listStaff"); }
}

// Admin creates a verified staff account using an initial strong password.
// Existing customers/admins are never modified as a side effect.
async function createStaff(req, res) {
  const profile = normalizeProfile(req.body);
  const role = String(req.body?.role || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!checkProfile(profile) || !validStaffRole(role)) {
    return res.status(400).json({ message: "Provide a valid name, email and staff role." });
  }
  const pass = validateStaffPassword(password);
  if (!pass.valid) return res.status(400).json({ message: pass.message });
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await db.promise().query(
      "INSERT INTO users (fullname, email, password, phone, address, role, account_status, is_verified) " +
      "VALUES (?, ?, ?, ?, ?, ?, 'active', 1)",
      [profile.fullname, profile.email, hashedPassword,
        profile.phone, profile.address, role]
    );
    return res.status(201).json({ success: true, id: result.insertId,
      message: "Staff account created. Ask the staff member to change their initial password." });
  } catch (error) { return handleFailure(res, error, "createStaff"); }
}

// Edit contact details only. Role cannot be changed here to prevent accidental
// reassignment of high-privilege Manager or Admin access.
async function updateStaff(req, res) {
  const id = staffIdFrom(req), p = normalizeProfile(req.body);
  if (!id || !checkProfile(p)) {
    return res.status(400).json({ message: "Valid staff ID, name and email are required." });
  }
  try {
    if (!await findStaff(id)) return res.status(404).json({ message: "Staff not found." });
    await db.promise().query(
      "UPDATE users SET fullname=?, email=?, phone=?, address=? " +
      "WHERE id=? AND role IN (?, ?, ?, ?)",
      [p.fullname, p.email, p.phone, p.address, id, ...STAFF_ROLES]
    );
    return res.json({ success: true, message: "Staff profile updated." });
  } catch (error) { return handleFailure(res, error, "updateStaff"); }
}

// Disable rather than deleting staff: historical housekeeping / reservations
// can still refer to their user IDs, and middleware denies disabled accounts.
async function setStaffStatus(req, res) {
  const id = staffIdFrom(req);
  const status = String(req.body?.account_status || "").trim().toLowerCase();
  if (!id || !["active", "disabled"].includes(status)) {
    return res.status(400).json({ message: "Valid staff ID and account status are required." });
  }
  try {
    if (!await findStaff(id)) return res.status(404).json({ message: "Staff not found." });
    await db.promise().query(
      "UPDATE users SET account_status=? WHERE id=? AND role IN (?, ?, ?, ?)",
      [status, id, ...STAFF_ROLES]
    );
    return res.json({ success: true, message: status === "active"
      ? "Staff account enabled." : "Staff account disabled." });
  } catch (error) { return handleFailure(res, error, "setStaffStatus"); }
}

// Password reset requires the ADMIN'S OWN password as a second confirmation.
// A bcrypt hash is saved; no existing password is readable or displayed.
// Signed role token password fingerprint checking (see token middleware)
// invalidates earlier role sessions after this update.
async function resetStaffPassword(req, res) {
  const id = staffIdFrom(req);
  const newPassword = String(req.body?.newPassword || "");
  const adminPassword = String(req.body?.adminPassword || "");
  if (!id || !adminPassword) {
    return res.status(400).json({ message: "Staff ID and admin confirmation password are required." });
  }
  const validation = validateStaffPassword(newPassword);
  if (!validation.valid) return res.status(400).json({ message: validation.message });
  try {
    const [adminRows] = await db.promise().query(
      "SELECT password FROM users WHERE id=? AND role='admin' AND account_status='active' AND is_verified=1 LIMIT 1",
      [req.adminUser.id]
    );
    if (!adminRows.length || !await bcrypt.compare(adminPassword, adminRows[0].password)) {
      return res.status(403).json({ message: "Administrator password confirmation failed." });
    }
    if (!await findStaff(id)) return res.status(404).json({ message: "Staff not found." });
    const hashed = await bcrypt.hash(newPassword, 12);
    await db.promise().query(
      "UPDATE users SET password=?, reset_otp_hash=NULL, reset_otp_expires=NULL " +
      "WHERE id=? AND role IN (?, ?, ?, ?)",
      [hashed, id, ...STAFF_ROLES]
    );
    return res.json({ success: true,
      message: "Staff password updated. Previous signed role sessions are revoked; staff must log in again." });
  } catch (error) { return handleFailure(res, error, "resetStaffPassword"); }
}

module.exports = { listStaff, createStaff, updateStaff, setStaffStatus, resetStaffPassword };
