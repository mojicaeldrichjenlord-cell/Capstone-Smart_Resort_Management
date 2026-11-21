"use strict";
// MGR-47: All five Manager routes use exactly the same accessible navbar brand.
// Static regression; no production API, database or deployment required.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const pages = [
  ["managerDashboard.html", "Dashboard"],
  ["managerReservations.html", "Reservations"],
  ["managerAccommodations.html", "Accommodations"],
  ["managerReports.html", "Reports"],
  ["managerHousekeeping.html", "Housekeeping"],
];

test("MGR-47 each Manager page has exactly one standard resort logo and brand", () => {
  for (const [file, active] of pages) {
    const html = read("frontend/managerHTML/" + file);
    assert.equal((html.match(/class="manager-brand"/g) || []).length, 1, file);
    assert.equal((html.match(/class="manager-brand-logo"/g) || []).length, 1, file);
    assert.equal((html.match(/class="manager-brand-text"/g) || []).length, 1, file);
    assert.match(html, /<img[^>]*class="manager-brand-logo"[^>]*src="\.\.\/images\/arvic-logo\.png"/, file);
    assert.match(html, /alt="Arvic Seaside Beach Resort and Hotel logo"/, file);
    assert.match(html, /<strong>Arvic Seaside<\/strong>/, file);
    assert.match(html, /<span>Resort Manager<\/span>/, file);
    assert.match(html, /href="\.\.\/managerCSS\/managerDashboard\.css\?v=20261121-mgr47"/, file);
    assert.match(html, new RegExp('href="manager' + active + '\\.html" aria-current="page"'), file);
    assert.match(html, /<nav class="manager-nav" aria-label="Manager navigation">/, file);
    assert.match(html, /id="logoutBtn"/, file);
  }
});

test("MGR-47 navbar uses one responsive logo size without Housekeeping-only overrides", () => {
  const shared = read("frontend/managerCSS/managerDashboard.css");
  const housekeeping = read("frontend/managerCSS/managerHousekeeping-review.css");
  assert.match(shared, /\.manager-navbar > \.manager-brand\s*\{[^}]*flex-direction:\s*row/s);
  assert.match(shared, /\.manager-navbar \.manager-brand-logo\s*\{[^}]*width:\s*52px;[^}]*height:\s*52px;/s);
  assert.match(shared, /\.manager-navbar \.manager-brand-text\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(shared, /@media \(max-width: 420px\)\s*\{[^}]*\.manager-navbar \.manager-brand-logo\s*\{[^}]*width:\s*44px/s);
  assert.doesNotMatch(housekeeping, /\.manager-hk-logo\s*\{/);
});

test("MGR-47 official logo asset exists at referenced location", () => {
  const logo = fs.readFileSync(path.join(root, "frontend/images/arvic-logo.png"));
  assert.deepEqual([...logo.subarray(0, 8)], [137,80,78,71,13,10,26,10], "valid PNG signature");
});
