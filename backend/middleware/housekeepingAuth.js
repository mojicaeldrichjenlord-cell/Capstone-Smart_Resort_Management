// Housekeeping-only signed 8-hour session.
// Independent from Admin/Manager/Customer/Front Desk tokens; verifies live
// user role and account status for EVERY housekeeping operation.
const crypto = require("node:crypto");
const db = require("../config/db");
const { tagForHash, isCurrentStaffCredential } =
  require("./staffCredentialTag");
const PREFIX = "hk1";
const AUDIENCE = "smartresort-housekeeping-schedule";
const MAX_AGE = 8 * 60 * 60;
// All signed role tokens share the configured secret but use distinct prefixes
// and audiences; an Admin/Manager token is NOT valid for Housekeeping routes.
function secret() {
  const value = String(process.env.FRONTDESK_TOKEN_SECRET || "");
  if (value.length < 32) throw new Error("FRONTDESK_TOKEN_SECRET requires 32+ characters.");
  return value;
}
// HMAC protects the token payload from client-side changes.
function signature(encoded) {
  return crypto.createHmac("sha256", secret())
    .update(PREFIX + "." + encoded, "utf8").digest();
}
// A login returns an eight-hour signed session, never a plain role flag.
function issueHousekeepingToken(userId, passwordHash) {
  const id = Number(userId);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid Housekeeping ID.");
  const now = Math.floor(Date.now() / 1000);
  const encoded = Buffer.from(JSON.stringify({
    sub: String(id), aud: AUDIENCE, iat: now, exp: now + MAX_AGE,
    pv: tagForHash(passwordHash),
  }), "utf8").toString("base64url");
  return PREFIX + "." + encoded + "." + signature(encoded).toString("base64url");
}
// Validate format, HMAC (timing-safe), expiry and audience before DB access.
function verifyHousekeepingToken(token) {
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
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const id = Number(payload?.sub), now = Math.floor(Date.now() / 1000);
    if (!Number.isSafeInteger(id) || id <= 0 ||
      String(payload.sub) !== String(id) ||
      payload.aud !== AUDIENCE ||
      !Number.isInteger(payload.iat) || !Number.isInteger(payload.exp) ||
      payload.iat > now + 60 || payload.exp <= now ||
      payload.exp > payload.iat + MAX_AGE) return null;
    return id;
  } catch (_) {
    return null;
  }
}
// Run on EVERY protected API call. Recheck the user's current DB role,
// verification and disabled status so old tokens cannot bypass demotion.
async function requireHousekeepingAuth(req, res, next) {
  const match = /^Bearer\s+(\S+)$/i.exec(String(req.get("authorization") || ""));
  if (!match) return res.status(401).json({
    success: false, message: "Housekeeping login required.",
  });
  const id = verifyHousekeepingToken(match[1]);
  if (!id) return res.status(401).json({
    success: false, message: "Housekeeping session invalid or expired.",
  });
  try {
    const [rows] = await db.promise().query(
      "SELECT id, role, fullname, email, " +
      // Do not default NULL account flags to active/verified: fail closed.
      "account_status, is_verified, password " +
      "FROM users WHERE id = ? LIMIT 1", [id],
    );
    const user = rows[0];
    if (!user) return res.status(401).json({
      success: false, message: "Housekeeping account not found.",
    });
    if (String(user.role || "").trim().toLowerCase() !== "housekeeping") {
      return res.status(403).json({
        success: false, message: "Housekeeping role required.",
      });
    }
    if (String(user.account_status ?? "").toLowerCase() !== "active" ||
      Number(user.is_verified) !== 1) {
      return res.status(403).json({
        success: false, message: "Housekeeping account disabled or unverified.",
      });
    }
    if (!isCurrentStaffCredential(match[1].split('.')[1], user.password)) {
      return res.status(401).json({ success: false, message: 'Housekeeping session expired after password change.' });
    }
    req.housekeepingUser = {
      id: Number(user.id), role: "housekeeping",
      fullname: String(user.fullname || ""), email: String(user.email || ""),
    };
    return next();
  } catch (error) {
    console.error("Housekeeping authorization failed:", error.message);
    return res.status(500).json({
      success: false, message: "Unable to verify Housekeeping session.",
    });
  }
}
module.exports = { issueHousekeepingToken, requireHousekeepingAuth };
