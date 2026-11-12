// SMARTRESORT ADMIN WRITE AUTHORIZATION
// Signed Admin-only session for administrative reservation/status APIs.
// Uses the existing FRONTDESK_TOKEN_SECRET with a separate token audience and
// prefix; a Front Desk token cannot be used as an Admin token.

const crypto = require("node:crypto");
const db = require("../config/db");

const PREFIX = "adm1";
const AUDIENCE = "smartresort-admin-reservation-management";
const MAX_AGE = 8 * 60 * 60;

function secret() {
  const key = String(process.env.FRONTDESK_TOKEN_SECRET || "");
  if (key.length < 32) {
    throw new Error("FRONTDESK_TOKEN_SECRET must be configured with at least 32 characters.");
  }
  return key;
}

function sign(payload) {
  return crypto.createHmac("sha256", secret())
    .update(`${PREFIX}.${payload}`, "utf8")
    .digest();
}

function issueAdminToken(userId) {
  const id = Number(userId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid Admin account ID.");
  }
  const now = Math.floor(Date.now() / 1000);
  const encoded = Buffer.from(JSON.stringify({
    sub: String(id), aud: AUDIENCE, iat: now, exp: now + MAX_AGE,
  }), "utf8").toString("base64url");
  return `${PREFIX}.${encoded}.${sign(encoded).toString("base64url")}`;
}

function verifyAdminToken(token) {
  if (typeof token !== "string" || token.length > 2048) return null;
  const parts = token.split(".");
  if (
    parts.length !== 3 ||
    parts[0] !== PREFIX ||
    !/^[A-Za-z0-9_-]+$/.test(parts[1]) ||
    !/^[A-Za-z0-9_-]{43}$/.test(parts[2])
  ) return null;

  try {
    const signature = Buffer.from(parts[2], "base64url");
    const expected = sign(parts[1]);
    if (
      signature.length !== expected.length ||
      !crypto.timingSafeEqual(signature, expected)
    ) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    const id = Number(payload?.sub);
    if (
      !Number.isSafeInteger(id) || id <= 0 ||
      String(payload?.sub) !== String(id) ||
      payload?.aud !== AUDIENCE ||
      !Number.isInteger(payload?.iat) || !Number.isInteger(payload?.exp) ||
      payload.iat > now + 60 || payload.exp <= now ||
      payload.exp > payload.iat + MAX_AGE
    ) return null;
    return id;
  } catch {
    return null;
  }
}

async function requireAdminAuth(req, res, next) {
  try {
    const header = String(req.get("authorization") || "");
    const match = /^Bearer\s+(\S+)$/i.exec(header);
    if (!match) {
      return res.status(401).json({
        message: "Please log in to your Administrator account again.",
      });
    }
    const id = verifyAdminToken(match[1]);
    if (!id) {
      return res.status(401).json({
        message: "Administrator session is invalid or expired. Please log in again.",
      });
    }

    // Never trust a client-supplied role or account ID.
    const [rows] = await db.promise().query(
      `SELECT id, role,
              COALESCE(account_status, 'active') AS account_status,
              COALESCE(is_verified, 1) AS is_verified
         FROM users WHERE id = ? LIMIT 1`,
      [id],
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({
        message: "Administrator account not found. Please log in again.",
      });
    }
    if (String(user.role || "").trim().toLowerCase() !== "admin") {
      return res.status(403).json({
        message: "Administrator account required.",
      });
    }
    if (
      String(user.account_status || "active").toLowerCase() !== "active" ||
      Number(user.is_verified) !== 1
    ) {
      return res.status(403).json({
        message: "Administrator account is disabled or unverified.",
      });
    }
    req.adminUser = { id: Number(user.id), role: "admin" };
    return next();
  } catch (error) {
    console.error("requireAdminAuth error:", error.message);
    return res.status(500).json({
      message: "Unable to verify Administrator session.",
    });
  }
}

module.exports = { issueAdminToken, requireAdminAuth };
