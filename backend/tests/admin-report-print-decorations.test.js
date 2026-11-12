// Read-only print stylesheet regression checks. No MySQL, browser, or PayPal.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const frontend = path.resolve(__dirname, "../../frontend");
const css = fs.readFileSync(path.join(frontend, "adminCSS/admin-reports.css"), "utf8");
const globalCss = fs.readFileSync(path.join(frontend, "css/style.css"), "utf8");
const html = fs.readFileSync(path.join(frontend, "adminHTML/admin-reports.html"), "utf8");

test("Global page decorations exist, but Admin Reports hides them when printing", () => {
  // The wave emoji is inserted by the global stylesheet, not the report HTML.
  assert.match(globalCss, /body:not\(\.auth-page\)::after\s*\{[^}]*content:\s*"🌊"/);
  // Keep print-only override scoped to Admin Reports. Do not remove screen visuals.
  const printStart = css.indexOf("@media print {");
  // Search for section text instead of exact newline bytes: on Windows,
  // Git can check out this stylesheet using CRLF instead of LF.
  const responsiveStart = css.indexOf("RESPONSIVE DESIGN", printStart);
  assert.ok(printStart >= 0 && responsiveStart > printStart);
  const printCss = css.slice(printStart, responsiveStart);
  assert.match(printCss, /body:not\(\.auth-page\)::before,\s*body:not\(\.auth-page\)::after\s*\{[^}]*content:\s*none\s*!important;[^}]*display:\s*none\s*!important;/);
});

test("A4 landscape print still displays reports and all nine charts", () => {
  assert.match(css, /@page\s*\{\s*size:\s*A4 landscape;/);
  assert.match(css, /\.chart-grid\s*\{\s*display:\s*grid\s*!important;/);
  assert.equal((html.match(/<canvas id="[^"]+Chart"/g) || []).length, 9);
});

// Regression against Git checkout line-ending differences across platforms.
test("Print CSS section can be located after LF and CRLF checkout", () => {
  const variants = [css.replace(/\r?\n/g, "\n"), css.replace(/\r?\n/g, "\r\n")];
  for (const stylesheet of variants) {
    const start = stylesheet.indexOf("@media print {");
    const end = stylesheet.indexOf("RESPONSIVE DESIGN", start);
    assert.ok(start >= 0 && end > start);
    const printCss = stylesheet.slice(start, end);
    assert.match(printCss, /body:not\(\.auth-page\)::after\s*\{[^}]*content:\s*none\s*!important;/);
  }
});
