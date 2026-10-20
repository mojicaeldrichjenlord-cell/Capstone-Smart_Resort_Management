// ============================================================
// SMARTRESORT FRONT DESK AUTHENTICATION MIDDLEWARE
// Exact destination: backend/middleware/frontDeskAuth.js
//
// Issues short-lived signed Front Desk bearer tokens after login,
// then verifies the signature AND current database account status
// before a manual reservation is allowed.
//
// Required backend environment variable (minimum 32 characters):
// FRONTDESK_TOKEN_SECRET=<a unique high-entropy secret>
//
// The booking route must derive created_by from req.frontDeskUser.id.
// Client-supplied created_by must never be trusted as authentication.
// ============================================================

const crypto = require("node:crypto");
const db = require("../config/db");
const { tagForHash, isCurrentStaffCredential } =
  require("./staffCredentialTag");

const TOKEN_PREFIX = "fd1";
const TOKEN_AUDIENCE = "smartresort-frontdesk-manual-reservations";
const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;

function signingSecret() {
  const secret = String(process.env.FRONTDESK_TOKEN_SECRET || "");
  if (secret.length < 32) {
    throw new Error(
      "FRONTDESK_TOKEN_SECRET must be configured with at least 32 characters.",
    );
  }
  return secret;
}

function signPayload(encodedPayload) {
  return crypto
    .createHmac("sha256", signingSecret())
    .update(`${TOKEN_PREFIX}.${encodedPayload}`, "utf8")
    .digest();
}

function issueFrontDeskToken(userId, passwordHash) {
  const id = Number(userId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid Front Desk user ID.");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: String(id),
    aud: TOKEN_AUDIENCE,
    iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS,
    pv: tagForHash(passwordHash),
  };
  const encodedPayload = Buffer.from(
    JSON.stringify(payload),
    "utf8",
  ).toString("base64url");
  const signature = signPayload(encodedPayload).toString("base64url");
  return `${TOKEN_PREFIX}.${encodedPayload}.${signature}`;
}

function verifyFrontDeskToken(token) {
  if (typeof token !== "string" || token.length > 2048) {
    return null;
  }
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== TOKEN_PREFIX) {
    return null;
  }
  const [, encodedPayload, encodedSignature] = parts;
  if (!/^[A-Za-z0-9_-]+$/.test(encodedPayload)) {
    return null;
  }
  if (!/^[A-Za-z0-9_-]{43}$/.test(encodedSignature)) {
    return null;
  }

  try {
    const expected = signPayload(encodedPayload);
    const supplied = Buffer.from(encodedSignature, "base64url");
    if (
      supplied.length !== expected.length ||
      !crypto.timingSafeEqual(supplied, expected)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
    const now = Math.floor(Date.now() / 1000);
    const id = Number(payload?.sub);
    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      String(payload?.sub) !== String(id) ||
      payload?.aud !== TOKEN_AUDIENCE ||
      !Number.isInteger(payload?.iat) ||
      !Number.isInteger(payload?.exp) ||
      payload.iat > now + 60 ||
      payload.exp <= now ||
      payload.exp > payload.iat + TOKEN_LIFETIME_SECONDS
    ) {
      return null;
    }
    return id;
  } catch (error) {
    return null;
  }
}

async function requireFrontDeskAuth(req, res, next) {
  try {
    const authHeader = String(req.get("authorization") || "");
    const match = /^Bearer\s+(\S+)$/i.exec(authHeader);
    if (!match) {
      return res.status(401).json({
        message: "Please log in to your Front Desk account again.",
      });
    }

    const authenticatedId = verifyFrontDeskToken(match[1]);
    if (!authenticatedId) {
      return res.status(401).json({
        message: "Front Desk session is invalid or expired. Please log in again.",
      });
    }

    const [rows] = await db.promise().query(
      `SELECT id, role,
              COALESCE(account_status, 'active') AS account_status,
              COALESCE(is_verified, 1) AS is_verified, password
         FROM users
        WHERE id = ?
        LIMIT 1`,
      [authenticatedId],
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({
        message: "Front Desk account was not found. Please log in again.",
      });
    }

    const role = String(user.role || "").trim().toLowerCase();
    const normalizedRole = role === "staff" ? "frontdesk" : role;
    if (normalizedRole !== "frontdesk") {
      return res.status(403).json({
        message: "Only Front Desk accounts can create manual reservations.",
      });
    }

    if (
      String(user.account_status || "active").toLowerCase() !== "active" ||
      Number(user.is_verified) !== 1
    ) {
      return res.status(403).json({
        message: "Front Desk account is disabled or unverified.",
      });
    }

    if (!isCurrentStaffCredential(match[1].split('.')[1], user.password)) {
      return res.status(401).json({ message: 'Staff session expired after password change. Log in again.' });
    }

    req.frontDeskUser = {
      id: Number(user.id),
      role: normalizedRole,
    };
    return next();
  } catch (error) {
    console.error("requireFrontDeskAuth error:", error.message);
    return res.status(500).json({
      message: "Unable to verify Front Desk session.",
    });
  }
}

module.exports = {
  issueFrontDeskToken,
  requireFrontDeskAuth,
};
