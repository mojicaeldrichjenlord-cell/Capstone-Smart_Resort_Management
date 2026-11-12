// Static UI safety checks: no browser, network or database connection is needed.
// These checks protect basic accessibility and action-button behavior.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function page(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", "..", "frontend", relativePath), "utf8");
}

test("Admin and Customer action buttons declare type=button", () => {
  // Explicit types prevent an accidental form submit if the layout is later refactored.
  const pages = [
    "adminHTML/admin-reports.html",
    "adminHTML/admin.html",
    "customerHTML/index.html",
    "customerHTML/rooms.html",
  ];
  for (const file of pages) {
    const html = page(file);
    const buttons = [...html.matchAll(/<button\b[^>]*>/gi)].map(match => match[0]);
    assert.ok(buttons.length > 0, file + " should contain action buttons");
    for (const button of buttons) {
      assert.match(button, /\btype="button"/i, file + ": " + button);
    }
  }
});

test("Customer photo viewer buttons have readable screen-reader labels", () => {
  // Arrow icons and a multiplication sign alone do not explain an image action.
  const html = page("customerHTML/rooms.html");
  const labels = [
    ["imageViewerClose", "Close image viewer"],
    ["imageViewerPrev", "Previous photo"],
    ["imageViewerNext", "Next photo"],
  ];
  for (const [id, label] of labels) {
    const tag = [...html.matchAll(/<button\b[^>]*>/gi)]
      .map(match => match[0])
      .find(button => button.includes('id="' + id + '"'));
    assert.ok(tag, "Missing photo control: " + id);
    assert.ok(tag.includes('aria-label="' + label + '"'), id + " needs a useful label");
  }
});
