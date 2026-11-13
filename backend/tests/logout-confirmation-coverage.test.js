// Static QA for role-wide logout confirmation imports.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const frontend = path.resolve(__dirname, "../../frontend");
const roles = ["customerHTML", "adminHTML", "frontdeskHTML", "managerHTML", "housekeepingHTML"];

test("every account page with a logout control loads the shared confirmation", () => {
  let checked = 0;
  for (const role of roles) {
    for (const file of fs.readdirSync(path.join(frontend, role)).filter(name => name.endsWith(".html"))) {
      const html = fs.readFileSync(path.join(frontend, role, file), "utf8");
      if (!/\bid=["'](?:logoutBtn|mobileLogoutBtn)["']/.test(html)) continue;
      checked++;
      assert.match(html, /sharedCSS\/logout-confirm\.css/, role + "/" + file + " missing dialog CSS");
      assert.match(html, /sharedJS\/logout-confirm\.js/, role + "/" + file + " missing dialog JS");
      assert.equal((html.match(/sharedJS\/logout-confirm\.js/g) || []).length, 1, role + "/" + file + " imports twice");
    }
  }
  assert.ok(checked >= 28, "Expected coverage across all account roles");
});

test("original role-specific session cleanup is preserved", () => {
  const source = fs.readFileSync(path.join(frontend, "sharedJS/logout-confirm.js"), "utf8");
  assert.match(source, /stopImmediatePropagation\(\)/);
  assert.match(source, /trigger\.click\(\)/);
  assert.match(source, /approvedTrigger = trigger/);
  assert.match(source, /closeDialog\(\)/);
  assert.doesNotMatch(source, /(?:localStorage|sessionStorage)\.removeItem/);
});
