// Distinct signed 8-hour Manager session. Revalidates live DB role on each call.
const crypto = require("node:crypto");
const db = require("../config/db");
const PREFIX = "mgr1";
const AUDIENCE = "smartresort-manager-operations";
const MAX_AGE = 8 * 60 * 60;
function secret() {
  const value = String(process.env.FRONTDESK_TOKEN_SECRET || "");
  if (value.length < 32) throw new Error("FRONTDESK_TOKEN_SECRET requires 32+ characters.");
  return value;
}
function signature(payload) {
  return crypto.createHmac("sha256", secret())
    .update(PREFIX + "." + payload, "utf8").digest();
}
function issueManagerToken(userId) {
  const id = Number(userId);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid Manager ID.");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: String(id), aud: AUDIENCE, iat: now, exp: now + MAX_AGE,
  }), "utf8").toString("base64url");
  return PREFIX + "." + payload + "." + signature(payload).toString("base64url");
}
function verifyManagerToken(token) {
  if (typeof token !== "string" || token.length > 2048) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== PREFIX ||
      !/^[A-Za-z0-9_-]+$/.test(parts[1]) ||
      !/^[A-Za-z0-9_-]{43}$/.test(parts[2])) return null;
  try {
    const actual = Buffer.from(parts[2], "base64url");
    const expected = signature(parts[1]);
    if (actual.length !== expected.length ||
        !crypto.timingSafeEqual(actual, expected)) return null;
    const parsed = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const id = Number(parsed?.sub), now = Math.floor(Date.now() / 1000);
    if (!Number.isSafeInteger(id) || id <= 0 || String(parsed.sub) !== String(id) ||
        parsed.aud !== AUDIENCE ||
        !Number.isInteger(parsed.iat) || !Number.isInteger(parsed.exp) ||
        parsed.iat > now + 60 || parsed.exp <= now ||
        parsed.exp > parsed.iat + MAX_AGE) return null;
    return id;
  } catch (_) { return null; }
}
async function requireManagerAuth(req, res, next) {
  const match = /^Bearer\s+(\S+)$/i.exec(String(req.get("authorization") || ""));
  if (!match) return res.status(401).json({ success: false, message: "Manager login required." });
  const id = verifyManagerToken(match[1]);
  if (!id) return res.status(401).json({ success: false, message: "Manager session invalid or expired." });
  try {
    const [rows] = await db.promise().query(
      "SELECT id, role, fullname, email, " +
      "COALESCE(account_status,'active') AS account_status, " +
      "COALESCE(is_verified,1) AS is_verified FROM users WHERE id = ? LIMIT 1",
      [id]);
    const user = rows[0];
    if (!user) return res.status(401).json({ success: false, message: "Manager account not found." });
    if (String(user.role || "").trim().toLowerCase() !== "manager") {
      return res.status(403).json({ success: false, message: "Manager role required." });
    }
    if (String(user.account_status || "active").toLowerCase() !== "active" ||
        Number(user.is_verified) !== 1) {
      return res.status(403).json({ success: false, message: "Manager account disabled or unverified." });
    }
    req.managerUser = { id: Number(user.id), role: "manager",
      fullname: user.fullname || "", email: user.email || "" };
    return next();
  } catch (error) {
    console.error("Manager authorization failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to verify Manager session." });
  }
}
module.exports = { issueManagerToken, requireManagerAuth };
