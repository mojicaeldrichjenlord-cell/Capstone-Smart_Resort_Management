"use strict";
// UI-24 Housekeeping brand alignment, no changes to booking/cleaning logic.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const html = fs.readFileSync(path.join(root, "frontend/housekeepingHTML/housekeepingDashboard.html"), "utf8");
const css = fs.readFileSync(path.join(root, "frontend/housekeepingCSS/housekeepingDashboard.css"), "utf8");

test("Housekeeping header uses existing Arvic resort logo, name, and role subtitle", () => {
  assert.match(html, /<header class="hk-navbar">/);
  assert.match(html, /class="hk-brand-logo"[\s\S]*?src="\.\.\/images\/arvic-logo\.png"/);
  assert.match(html, /alt="Arvic Seaside resort logo"/);
  assert.match(html, /class="hk-brand-name">Arvic Seaside<\/strong>/);
  assert.match(html, /class="hk-brand-role">Housekeeping Staff<\/span>/);
  assert.ok(fs.existsSync(path.join(root, "frontend/images/arvic-logo.png")));
});

test("Housekeeping navbar height and palette match Admin/Front Desk, not an undersized 74px bar", () => {
  assert.match(css, /\.hk-navbar\s*\{[^}]*min-height:\s*86px/);
  assert.match(css, /\.hk-navbar\s*\{[^}]*padding:\s*12px 34px/);
  assert.match(css, /\.hk-navbar\s*\{[^}]*#172554[^}]*#0f766e/);
  assert.match(css, /\.hk-brand-logo\s*\{[^}]*width:\s*54px;[^}]*height:\s*54px/);
  assert.match(css, /\.hk-navbar\s*\{\s*position:\s*sticky;\s*top:\s*0/);
});

test("Tablet/mobile navbar preserves 48px image, legible role, and visible Logout", () => {
  assert.match(css, /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.hk-navbar\s*\{[^}]*min-height:\s*72px/);
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.hk-brand-logo\s*\{[^}]*width:\s*48px;[^}]*height:\s*48px/);
  assert.match(css, /@media\s*\(max-width:\s*900px\)[\s\S]*?\.hk-navbar button\s*\{[^}]*flex-shrink:\s*0/);
  assert.match(html, /<button type="button" id="logoutBtn">Logout<\/button>/);
  assert.match(html, /class="hk-skip" href="#mainContent"/);
});

test("Housekeeping scheduling, cleaning actions, auth, and scripts are unchanged", () => {
  for (const hook of [
    "hkScheduleFilters", "hkDate", "hkScheduleBody", "hkTaskRows",
    "hkRefreshTasks", "hkTaskStatus", "accountName", "accountEmail"
  ]) {
    assert.ok(html.includes('id="' + hook + '"'), "missing Housekeeping hook " + hook);
  }
  assert.match(html, /housekeepingJS\/housekeepingDashboard\.js/);
  assert.match(html, /housekeepingJS\/housekeepingTasks\.js/);
  assert.match(html, /sharedJS\/logout-confirm\.js/);
  assert.match(css, /\.hk-table-region\s*\{[^}]*overflow-x:\s*auto/);
});
