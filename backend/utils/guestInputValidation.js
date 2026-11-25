// Stage AUTH-71: guest names and new password length.
const NAME_PATTERN = /^\p{L}[\p{L}\p{M}]*(?: +\p{L}[\p{L}\p{M}]*)*$/u;
function isValidName(value, optional = false) {
  if (value === undefined || value === null) return optional;
  if (typeof value !== "string") return false;
  const name = value.trim();
  return optional && !name ? true : NAME_PATTERN.test(name);
}
function hasValidNameParts(first, middle, last) {
  return isValidName(first) && isValidName(middle, true) && isValidName(last);
}
const NAME_ERROR = "First, middle and last names may contain letters and spaces only.";

function isValidNewPasswordLength(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 16;
}
function getRegistrationName(body) {
  const { first_name, middle_name, last_name, fullname } = body;
  // Retain compatibility with legacy clients that send only a full name.
  if (first_name === undefined && middle_name === undefined && last_name === undefined) {
    return isValidName(fullname) && fullname.trim().split(/ +/).length >= 2
      ? fullname.trim() : null;
  }
  if (!hasValidNameParts(first_name, middle_name, last_name)) return null;
  return [first_name.trim(), (middle_name || "").trim(), last_name.trim()]
    .filter(Boolean).join(" ");
}
module.exports = { isValidName, hasValidNameParts, isValidNewPasswordLength, getRegistrationName, NAME_ERROR };
