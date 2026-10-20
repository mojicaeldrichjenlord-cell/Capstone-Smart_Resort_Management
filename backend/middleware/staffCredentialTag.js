// Password-bound signed staff sessions.
// The fingerprint is an HMAC of the stored bcrypt hash (not the password).
// Changing staff's password changes the fingerprint, revoking old role tokens.
// No schema migration is required. Never log tokens or password hashes.
const crypto = require("node:crypto");
function tagForHash(passwordHash) {
  const secret = String(process.env.FRONTDESK_TOKEN_SECRET || "");
  if (secret.length < 32) throw new Error("Staff token secret is missing.");
  if (typeof passwordHash !== "string" || passwordHash.length < 10) {
    throw new Error("Staff password hash is required for signed sessions.");
  }
  return crypto.createHmac("sha256", secret)
    .update("smartresort-staff-password-v1:" + passwordHash)
    .digest("base64url")
    .slice(0, 24);
}
function isCurrentStaffCredential(encodedToken, currentPasswordHash) {
  try {
    const payload = JSON.parse(Buffer.from(encodedToken, "base64url").toString("utf8"));
    if (typeof payload.pv !== "string" || !/^[a-zA-Z0-9_-]{24}$/.test(payload.pv)) {
      return false; // Old unbound staff tokens must sign in again.
    }
    const expected = Buffer.from(tagForHash(currentPasswordHash), "utf8");
    const supplied = Buffer.from(payload.pv, "utf8");
    return crypto.timingSafeEqual(expected, supplied);
  } catch (_) { return false; }
}
module.exports = { tagForHash, isCurrentStaffCredential };
