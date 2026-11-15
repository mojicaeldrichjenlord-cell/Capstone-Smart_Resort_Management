// Customer UI regression for mobile sticky navbar and concise Remember Me layout.
// Read-only static checks; no live website, network, credentials, or database calls.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../../frontend");
const css = fs.readFileSync(path.join(root, "sharedCSS/customer-navbar.css"), "utf8");

test("Customer navbar explicitly overrides legacy mobile relative positioning", () => {
  assert.match(css, /\.navbar\s*\{\s*position:\s*sticky;/);
  const mobileCss = css.slice(css.indexOf("@media (max-width: 900px)"));
  assert.match(mobileCss, /\.navbar\s*\{[\s\S]*?position:\s*sticky\s*!important\s*;/);
  assert.match(mobileCss, /top:\s*0\s*;/);
  assert.doesNotMatch(mobileCss, /position:\s*relative\s*;/);
});

test("All 8 Customer navigation pages load the new CSS revision", () => {
  const pages = ["index", "rooms", "resort-map", "my-bookings",
    "profile", "booking", "booking-payment", "booking-receipt"];
  for (const name of pages) {
    const html = fs.readFileSync(
      path.join(root, "customerHTML", name + ".html"), "utf8");
    assert.match(html, /class="navbar"/, name);
    assert.match(html, /customer-navbar\.css\?v=20261115-sticky1/, name);
    assert.match(html, /id="menuToggle"/, name);
  }
});

test("Remember Me stays accessible but its explanatory note is removed", () => {
  const html = fs.readFileSync(path.join(root, "authHTML/login.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "authCSS/login.css"), "utf8");
  assert.match(html, /id="rememberMe"/);
  assert.match(html, /for="rememberMe"/);
  assert.match(html, /forgot-password\.html/);
  assert.doesNotMatch(html, /remember-me-help|Remembers your Customer email on this device/);
  assert.doesNotMatch(css, /\.auth-card \.remember-me-help/);
});
