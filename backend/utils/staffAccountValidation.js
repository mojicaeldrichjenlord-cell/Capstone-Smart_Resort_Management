// Strong-password and role validation shared between staff management and tests.
// This module deliberately has no DB imports or side effects.
const ROLES = new Set(["frontdesk", "manager", "housekeeping"]);
function validStaffRole(value) { return ROLES.has(String(value || "")); }
function normalizeStaffEmail(value) { return String(value || "").trim().toLowerCase(); }
function validateStaffPassword(password) {
  const p = String(password || "");
  if (p.length < 12 || p.length > 72 || !/[A-Z]/.test(p) ||
      !/[a-z]/.test(p) || !/[0-9]/.test(p) ||
      !/[^A-Za-z0-9\s]/.test(p)) {
    return {valid:false, message:"Use 12–72 characters with uppercase, lowercase, a number and a symbol."};
  }
  return {valid:true, message:""};
}
module.exports = { validStaffRole, normalizeStaffEmail, validateStaffPassword };
