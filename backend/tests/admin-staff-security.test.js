// SMART RESORT BOOKING SYSTEM - Admin Staff Management security unit tests.
// No database connection is opened. Run from backend:
// node --test tests/admin-staff-security.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validStaffRole, validateStaffPassword, normalizeStaffEmail
} = require("../utils/staffAccountValidation");
const {
  tagForHash, isCurrentStaffCredential
} = require("../middleware/staffCredentialTag");

test("Only intended staff roles are creatable from Admin page", () => {
  for (const allowed of ["frontdesk", "manager", "housekeeping"]) {
    assert.equal(validStaffRole(allowed), true, allowed);
  }
  for (const denied of ["admin", "customer", "staff", "", "ADMIN", "owner"]) {
    assert.equal(validStaffRole(denied), false, denied);
  }
});

test("Initial and reset passwords must meet strong policy", () => {
  assert.equal(validateStaffPassword("strongNoDigit!").valid, false);
  assert.equal(validateStaffPassword("short1!A").valid, false);
  assert.equal(validateStaffPassword("nouppercase1!").valid, false);
  assert.equal(validateStaffPassword("ALLUPPERCASE1!").valid, false);
  assert.equal(validateStaffPassword("SecureStaff2026!").valid, true);
});

test("Email is normalized for uniqueness", () => {
  assert.equal(normalizeStaffEmail("  Staff@Example.COM "), "staff@example.com");
});

test("Password-bound staff session stops working after password reset", () => {
  const previous = process.env.FRONTDESK_TOKEN_SECRET;
  process.env.FRONTDESK_TOKEN_SECRET = "testing-only-secret-key-32-characters-minimum";
  try {
    const oldHash = "$2b$12$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const newHash = "$2b$12$BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
    const oldTag = tagForHash(oldHash);
    const encoded = Buffer.from(JSON.stringify({pv:oldTag}),"utf8").toString("base64url");
    assert.equal(isCurrentStaffCredential(encoded, oldHash), true);
    assert.equal(isCurrentStaffCredential(encoded, newHash), false);
    const legacy = Buffer.from(JSON.stringify({sub:"1"}),"utf8").toString("base64url");
    assert.equal(isCurrentStaffCredential(legacy, oldHash), false);
  } finally {
    if (previous===undefined) delete process.env.FRONTDESK_TOKEN_SECRET;
    else process.env.FRONTDESK_TOKEN_SECRET=previous;
  }
});
