"use strict";
/*
 * UI-32 public landing navigation + mobile booking-receipt regression.
 * No network, database, account, payment or booking modifications.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const landing = read("frontend/customerHTML/landing.html");
const receiptHtml = read("frontend/customerHTML/booking-receipt.html");
const receiptCss = read("frontend/customerCSS/booking-receipt.css");
const routes = JSON.parse(read("frontend/vercel.json"));

test("UI-32 public landing logo targets a real page on root-domain and local Live Server", () => {
  const matched = landing.match(/<a href="([^"]+)" class="landing-logo"/);
  assert.ok(matched, "Landing brand link missing");
  const href = matched[1];
  assert.equal(href, "../customerHTML/landing.html");
  for (const current of [
    "https://arvicseasideresort.com/",
    "https://arvicseasideresort.com/customerHTML/landing.html",
    "http://127.0.0.1:5500/frontend/customerHTML/landing.html",
  ]) {
    const url = new URL(href, current);
    const directory = new URL("./", current);
    const expectedPath = directory.pathname.startsWith("/frontend/")
      ? "/frontend/customerHTML/landing.html"
      : "/customerHTML/landing.html";
    assert.equal(url.pathname, expectedPath, current);
    assert.equal(url.origin, new URL(current).origin);
    assert.notEqual(url.pathname, "/landing.html", "Must not link to missing Vercel root file");
  }
  assert.match(landing, /class="landing-menu-toggle"/);
  assert.match(landing, /class="nav-login"/);
  assert.match(landing, /class="nav-register"/);
});

test("UI-32 Vercel preserves public root and supports historical /landing.html bookmarks", () => {
  assert.deepEqual(routes.rewrites, [
    { source: "/", destination: "/customerHTML/landing.html" },
    { source: "/landing.html", destination: "/customerHTML/landing.html" },
  ]);
  assert.doesNotMatch(landing, /href="landing\.html"\s+class="landing-logo"/);
});

test("UI-32 mobile receipt title does not use a 340px vertical flex basis", () => {
  assert.match(receiptCss, /\.receipt-title\s*\{[^}]*flex:\s*1 1 340px/s);
  const mobileBlock = receiptCss.match(/@media \(max-width: 480px\)\s*\{([\s\S]*?)\n\}\s*@media \(max-width: 345px\)/)?.[1];
  assert.ok(mobileBlock, "Missing mobile receipt breakpoint");
  assert.match(mobileBlock, /\.receipt-hero\s*\{[^}]*flex-direction:\s*column/s);
  const mobileTitle = mobileBlock.match(/\.receipt-hero \.receipt-title\s*\{([^}]*)\}/)?.[1] || "";
  assert.match(mobileTitle, /flex:\s*0 0 auto/);
  assert.match(mobileTitle, /width:\s*100%/);
  assert.match(mobileTitle, /min-height:\s*0/);
  const code = mobileBlock.match(/\.receipt-code-box\s*\{([^}]*)\}/)?.[1] || "";
  assert.match(code, /align-self:\s*stretch/);
  assert.match(code, /width:\s*100%/);
  assert.match(receiptHtml, /booking-receipt\.css\?v=20261120-ui32/);
});

test("UI-32 receipt changes remain presentation-only and preserve amount breakdown", () => {
  const js = read("frontend/customerJS/booking-receipt.js");
  for (const label of [
    "Guest Name", "Guest Count", "Reserved At", "Reservation Code",
    "Accommodation Total", "Downpayment Paid", "Remaining Balance",
    "Entrance Fee Estimate", "Estimated Onsite Payment",
  ]) assert.ok(js.includes(label), "Missing receipt field: " + label);
  assert.match(js, /<div class="receipt-title">/);
  assert.match(js, /<div class="receipt-code-box">/);
  assert.match(receiptCss, /@media print/);
  assert.match(receiptCss, /\.payment-summary > \.amount-row:last-child/);
});


// UI-33: The public policy and actual secure checkout must describe the same
// currently implemented payment flow. These tests never capture money.
test("UI-33 landing policies describe PayPal-only online deposit and no proof upload", () => {
  const section = landing.match(/<section id="policies"[\s\S]*?<\/section>/)?.[0] || "";
  assert.ok(section, "Landing policies section missing");
  assert.match(section, /50% downpayment of the\s+accommodation price through PayPal/i);
  assert.match(section, /Entrance fees are separate/i);
  assert.match(section, /successful captured payment/i);
  assert.match(section, /automatically records the downpayment and confirms the booking/i);
  assert.match(section, /No payment proof upload is required/i);
  assert.match(section, /remaining accommodation balance, entrance fees/i);
  assert.doesNotMatch(section, /GCash and Maya proof of payment|verified by the admin/i);
  for (const safetyPolicy of [
    "Extra person fees may apply",
    "damaged items",
    "Additional charges may be added",
  ]) assert.ok(section.includes(safetyPolicy), "Missing unchanged policy: " + safetyPolicy);
});

test("UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only", () => {
  const checkout = read("frontend/customerHTML/booking-payment.html");
  assert.match(checkout, /<h2>Pay with PayPal<\/h2>/);
  assert.match(checkout, /<option value="paypal" selected>PayPal<\/option>/);
  assert.match(checkout, /50% accommodation\s+downpayment/i);
  assert.match(checkout, /Entrance fees, the remaining accommodation\s+balance/i);
  assert.match(checkout, /successful captured downpayment/i);
  assert.match(checkout, /50% downpayment of the\s+accommodation price through PayPal/i);
  assert.doesNotMatch(checkout, /GCash and Maya proof of payment must be verified/i);
});
