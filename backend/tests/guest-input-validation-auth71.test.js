// Run from backend: node --test tests/guest-input-validation-auth71.test.js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { isValidName, hasValidNameParts, isValidNewPasswordLength, getRegistrationName } =
  require("../utils/guestInputValidation");
const root = path.join(__dirname, "../..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("Unicode letters, spaces and optional middle name", () => {
  for (const name of ["Juan", "Juan Carlos", "Dela Cruz", "Niño", "José", "Jose\u0301", "李", "  Ana  "]) {
    assert.equal(isValidName(name), true, name);
  }
  assert.equal(hasValidNameParts("Juan", "", "Dela Cruz"), true);
  assert.equal(hasValidNameParts("Juan", null, "Dela Cruz"), true);
  assert.equal(hasValidNameParts("Juan", undefined, "Dela Cruz"), true);
});
test("Reject invalid guest names and non-string API data", () => {
  for (const name of ["", " ", "Juan123", "Juan@", "Juan😂", "Anne-Marie", "O'Neil", "Juan\tCarlos", 123, ["Juan"], {}]) {
    assert.equal(isValidName(name), false, JSON.stringify(name));
  }
  assert.equal(hasValidNameParts("Juan", "Santos3", "Cruz"), false);
  assert.equal(hasValidNameParts("", "", "Cruz"), false);
  assert.equal(hasValidNameParts("Juan", "", ""), false);
});
test("Registration derives trusted full name and supports valid legacy full names", () => {
  assert.equal(getRegistrationName({first_name:"Juan", middle_name:"Santos", last_name:"Dela Cruz", fullname:"Ignored123"}), "Juan Santos Dela Cruz");
  assert.equal(getRegistrationName({fullname:"Juan Dela Cruz"}), "Juan Dela Cruz");
  assert.equal(getRegistrationName({fullname:"Juan123 Cruz"}), null);
  assert.equal(getRegistrationName({first_name:"Juan", middle_name:"Santos2", last_name:"Cruz", fullname:"Juan Cruz"}), null);
  assert.equal(getRegistrationName({first_name:"Juan", fullname:"Juan Cruz"}), null);
});
test("8 and 16 are inclusive; reject 7, 17 and non-string passwords", () => {
  for (const n of [0, 7, 17, 72]) assert.equal(isValidNewPasswordLength("a".repeat(n)), false);
  for (const n of [8, 9, 15, 16]) assert.equal(isValidNewPasswordLength("a".repeat(n)), true);
  assert.equal(isValidNewPasswordLength(12345678), false);
});
test("Shared browser validator filters typed and pasted text without changing valid accented letters", () => {
  const fields = {};
  for (const id of ["firstName", "middleName", "lastName"]) {
    fields[id] = {value:"", selectionStart:0, selectionEnd:0, handlers:{},
      addEventListener(type, fn) { this.handlers[type] = fn; },
      setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }};
  }
  const context = {window:{}, document:{getElementById:id=>fields[id]}};
  vm.runInNewContext(read("frontend/sharedJS/guest-name-validation.js"), context);
  for (const field of Object.values(fields)) {
    field.value="Niño123 @Cruz!"; field.selectionStart=14; field.selectionEnd=14;
    field.handlers.input({});
    assert.equal(field.value, "Niño Cruz");
    field.value="李"; field.handlers.compositionend({});
    assert.equal(field.value, "李");
  }
  const browser = context.window.GuestNameValidation;
  for (const name of ["Juan", "Dela Cruz", "Niño", "Jose\u0301", "Juan1", "Juan@", "", "Juan\tCarlos", 123]) {
    assert.equal(browser.isValidName(name), isValidName(name));
  }
});
test("All three actual name forms load the shared validator and contain example placeholders", () => {
  for (const file of ["frontend/authHTML/register.html", "frontend/customerHTML/booking.html", "frontend/adminHTML/admin-walkin.html"]) {
    const html = read(file);
    assert.match(html, /id="firstName" placeholder="Example: Juan"/);
    assert.match(html, /id="middleName" placeholder="Example: Santos"/);
    assert.match(html, /id="lastName" placeholder="Example: Dela Cruz"/);
    assert.match(html, /guest-name-validation\.js/);
  }
  for (const file of ["frontend/authJS/register.js", "frontend/customerJS/booking.js", "frontend/adminJS/admin-walkin.js"]) {
    assert.match(read(file), /GuestNameValidation\.hasValidNameParts/);
  }
  assert.match(read("frontend/frontdeskHTML/frontdeskDashboard.html"), /admin-walkin\.html/);
});
test("New password forms and API enforce length without limiting login or current password", () => {
  const register = read("frontend/authHTML/register.html");
  for (const id of ["password", "confirmPassword"]) {
    assert.match(register, new RegExp('id="'+id+'"[^>]*minlength="8"[^>]*maxlength="16"'));
  }
  for (const file of ["frontend/authHTML/forgot-password.html","frontend/customerHTML/profile.html","frontend/adminHTML/admin-profile.html"]) {
    assert.match(read(file), /id="newPassword"[^>]*minlength="8"[^>]*maxlength="16"/);
    assert.doesNotMatch(read(file), /id="currentPassword"[^>]*maxlength="16"/);
  }
  assert.match(read("frontend/authJS/register.js"), /if \(!requirements\.length\)/);
  const auth = read("backend/controllers/auth/authController.js");
  assert.match(auth, /getRegistrationName\(req\.body\)/);
  assert.match(auth, /if \(!requirements\.length\)/);
  assert.equal((auth.match(/if \(!isValidNewPasswordLength\(newPassword\)\)/g)||[]).length, 2);
  assert.match(read("backend/controllers/shared/bookingController.js"), /if \(!hasValidNameParts\(first_name, middle_name, last_name\)\)/);
});
