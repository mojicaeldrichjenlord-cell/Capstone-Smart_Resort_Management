"use strict";
// DM-01: Customer-only design tokens, with no theme toggle or state writes yet.
// Static checks intentionally never touch bookings, payments, AI, or database.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const themePath = "frontend/customerCSS/customer-theme-tokens.css";
const tokens = read(themePath);
const currentPalette = read("frontend/customerCSS/customer-manager-tone.css");
const customerPages = [
  "index.html",
  "rooms.html",
  "booking.html",
  "booking-payment.html",
  "booking-receipt.html",
  "my-bookings.html",
  "profile.html",
  "resort-map.html",
];

test("DM-01 shared semantic tokens describe soft navy/slate dark and original light palette", () => {
  assert.match(tokens, /@media screen\s*\{/);
  assert.match(tokens, /body\.customer-manager-tone\s*\{/);
  assert.match(tokens, /html\[data-customer-theme="dark"\]\s+body\.customer-manager-tone\s*\{/);
  assert.match(tokens, /--customer-page-top:\s*#f8fafc/);
  assert.match(tokens, /--customer-card:\s*#ffffff/);
  assert.match(tokens, /--customer-text-primary:\s*#0f172a/);
  assert.match(tokens, /--customer-nav-start:\s*#172554/);
  assert.match(tokens, /--customer-accent:\s*#0f766e/);
  assert.match(tokens, /--customer-page-top:\s*#172535/);
  assert.match(tokens, /--customer-card:\s*#24364a/);
  assert.match(tokens, /--customer-nav-start:\s*#142b3e/);
  assert.match(tokens, /--customer-accent:\s*#16877f/);
  assert.match(tokens, /--customer-text-primary:\s*#f1f5f9/);
  assert.doesNotMatch(tokens, /(?:^|:\s*)#000000\b|(?:^|:\s*)black\s*;/im);
});

test("DM-01 tokens loaded once after current theme on all eight signed-in Customer pages", () => {
  for (const file of customerPages) {
    const html = read("frontend/customerHTML/" + file);
    const cssRef = "customer-theme-tokens.css?v=20261121-dm01";
    assert.equal(html.split(cssRef).length - 1, 1, file);
    assert.match(html, /<body[^>]*\bcustomer-manager-tone\b/);
    const closingHead = html.indexOf("</head>");
    const themePos = html.indexOf(cssRef);
    assert.ok(themePos < closingHead && themePos > 0, file + " must load theme CSS in <head>");
    assert.ok(themePos > html.indexOf("customer-manager-tone.css"), file + " tokens load after current palette");
    const styleAfter = html.slice(themePos, closingHead);
    assert.match(styleAfter, /customer-theme-toggle\.css\?v=20261121-dm02/, file + " DM-02 toggle remains loaded");
    assert.match(styleAfter, /customer-dark-skin-dm03\.css\?v=20261121-dm03/, file + " DM-03 dark skin follows");
    assert.equal((styleAfter.match(/rel="stylesheet"/g) || []).length, 2, file + " loads only toggle and dark skin after tokens");
    assert.ok(styleAfter.indexOf("customer-theme-toggle.css") < styleAfter.indexOf("customer-dark-skin-dm03.css"), file);
    assert.doesNotMatch(html, /id="customerThemeToggle"/, file + " toggle is injected once by shared JS");
  }
});

test("DM-01 leaves public landing and other account pages outside Customer theme foundation", () => {
  for (const p of [
    "frontend/customerHTML/landing.html",
    "frontend/managerHTML/managerDashboard.html",
    "frontend/housekeepingHTML/housekeepingDashboard.html",
  ]) {
    assert.doesNotMatch(read(p), /customer-theme-tokens\.css/, p);
  }
  assert.doesNotMatch(tokens, /localStorage|sessionStorage|fetch\(|document\.|window\./);
  assert.doesNotMatch(tokens, /\bbody\s*\{/);
});

test("DM-01 current Customer background, cards, navbar, buttons use semantic variables with safe light fallbacks", () => {
  const required = [
    "--customer-page-top", "--customer-page-bottom", "--customer-text-primary",
    "--customer-card", "--customer-border", "--customer-nav-start",
    "--customer-nav-end", "--customer-accent", "--customer-focus",
  ];
  for (const name of required) {
    assert.match(currentPalette, new RegExp("var\\(" + name + ",\\s*#[a-fA-F0-9]{3,8}\\)"), name);
  }
  assert.match(currentPalette, /--checkout-teal:\s*var\(--customer-accent/);
  assert.match(currentPalette, /body\.customer-manager-tone\s+\.ai-chat-window/);
});
