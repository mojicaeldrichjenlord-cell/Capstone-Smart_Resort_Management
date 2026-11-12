// Signed customer access for reservation-changing operations.
// Reuses the existing backend signing secret but uses a separate audience and
// prefix, so Admin/Front Desk bearer tokens cannot impersonate customers.
const crypto = require("node:crypto");
const db = require("../config/db");

const PREFIX = "cus1";
const AUDIENCE = "smartresort-customer-reservation-management";
const LIFETIME_SECONDS = 8 * 60 * 60;

function signingSecret() {
  const secret = String(process.env.FRONTDESK_TOKEN_SECRET || "");
  if (secret.length < 32) {
    throw new Error("FRONTDESK_TOKEN_SECRET must contain at least 32 characters.");
  }
  return secret;
}
function signature(encoded) {
  return crypto.createHmac("sha256", signingSecret())
    .update(PREFIX + "." + encoded, "utf8").digest();
}
function issueCustomerToken(userId) {
  const id = Number(userId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Invalid customer account ID.");
  }
  const now = Math.floor(Date.now() / 1000);
  const encoded = Buffer.from(JSON.stringify({
    sub: String(id),
    aud: AUDIENCE,
    iat: now,
    exp: now + LIFETIME_SECONDS
  }), "utf8").toString("base64url");
  return PREFIX + "." + encoded + "." + signature(encoded).toString("base64url");
}
function verifyCustomerToken(token) {
  if (typeof token !== "string" || token.length > 2048) return null;
  const parts = token.split(".");
  if (
    parts.length !== 3 || parts[0] !== PREFIX ||
    !/^[A-Za-z0-9_-]+$/.test(parts[1]) ||
    !/^[A-Za-z0-9_-]{43}$/.test(parts[2])
  ) return null;
  try {
    const supplied = Buffer.from(parts[2], "base64url");
    const expected = signature(parts[1]);
    if (supplied.length !== expected.length ||
      !crypto.timingSafeEqual(supplied, expected)) return null;

    const data = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    const id = Number(data?.sub);
    if (!Number.isSafeInteger(id) || id <= 0 ||
      String(data?.sub) !== String(id) ||
      data?.aud !== AUDIENCE ||
      !Number.isInteger(data?.iat) || !Number.isInteger(data?.exp) ||
      data.iat > now + 60 || data.exp <= now ||
      data.exp > data.iat + LIFETIME_SECONDS
    ) return null;
    return id;
  } catch {
    return null;
  }
}
async function requireCustomerAuth(req, res, next) {
  try {
    const match = /^Bearer\s+(\S+)$/i.exec(String(req.get("authorization") || ""));
    if (!match) return res.status(401).json({
      message: "Please log in to your Customer account again."
    });
    const id = verifyCustomerToken(match[1]);
    if (!id) return res.status(401).json({
      message: "Customer session is invalid or expired. Please log in again."
    });
    const [rows] = await db.promise().query(
      "SELECT id,role,COALESCE(account_status,'active') AS account_status," +
      "COALESCE(is_verified,1) AS is_verified FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({
      message: "Customer account not found. Please log in again."
    });
    if (String(user.role || "").trim().toLowerCase() !== "customer") {
      return res.status(403).json({ message: "Customer account required." });
    }
    if (String(user.account_status || "").toLowerCase() !== "active" ||
      Number(user.is_verified) !== 1) {
      return res.status(403).json({
        message: "Customer account is disabled or unverified."
      });
    }
    req.customerUser = { id: Number(user.id), role: "customer" };
    return next();
  } catch (error) {
    console.error("requireCustomerAuth error:", error.message);
    return res.status(500).json({ message: "Unable to verify Customer session." });
  }
}
module.exports = { issueCustomerToken, requireCustomerAuth };
