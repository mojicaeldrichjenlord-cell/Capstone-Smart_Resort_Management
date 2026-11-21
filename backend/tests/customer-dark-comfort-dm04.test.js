"use strict";
// DM-04: UI-only regression, no credentials or production calls.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const polish=read("frontend/customerCSS/customer-comfort-polish-dm04.css");
const bookings=read("frontend/customerJS/my-bookings.js");
const toggleCss=read("frontend/customerCSS/customer-theme-toggle.css");
const toggleJs=read("frontend/sharedJS/customer-theme-toggle.js");
const pages=[
  "index.html","rooms.html","booking.html","booking-payment.html",
  "booking-receipt.html","my-bookings.html","profile.html","resort-map.html"
];

test("DM-04 decorative emoji body backgrounds removed in both Customer modes",()=>{
  assert.match(polish,/body\.customer-manager-tone::before,/);
  assert.match(polish,/body\.customer-manager-tone::after/);
  assert.match(polish,/content:\s*none\s*!important/);
  assert.match(polish,/display:\s*none\s*!important/);
  assert.doesNotMatch(polish,/🌴|🌊|🐬|☁|background-image:\s*url/);
  const noComments=polish.replace(/\/\*[\s\S]*?\*\//g,"");
  let braces=0;
  for(const char of noComments){if(char==="{")braces++;if(char==="}")braces--;}
  assert.equal(braces,0,"CSS must have balanced braces");
});

test("DM-04 corrects every dynamic My Bookings white card without altering booking data",()=>{
  for(const className of [
    "customer-booking-history-card",
    "customer-booking-history-title",
    "customer-booking-history-status",
    "customer-booking-payment-summary",
    "customer-booking-detail",
    "customer-booking-feedback"
  ]) {
    assert.ok(bookings.includes(className),className+" missing in generated card");
    assert.ok(polish.includes("."+className),className+" missing in dark CSS");
  }
  assert.match(bookings,/data-status="\$\{escapeHtml\(status\)\}"/);
  assert.match(polish,/\[data-status="approved"\]/);
  assert.match(polish,/\[data-status="cancelled"\]/);
  assert.match(polish,/var\(--customer-card/);
  assert.match(polish,/background-image:\s*none\s*!important/);
  assert.doesNotThrow(()=>new vm.Script(bookings));
  assert.doesNotThrow(()=>new vm.Script(toggleJs));
});

test("DM-04 compact switch slides, supports reduced motion and keeps native button semantics",()=>{
  assert.match(toggleCss,/width:\s*82px/);
  assert.match(toggleCss,/height:\s*44px/);
  assert.match(toggleCss,/\.customer-theme-toggle\[aria-pressed="true"\] \.customer-theme-icon/);
  assert.match(toggleCss,/transform:\s*translateX\(38px\)/);
  assert.match(toggleCss,/prefers-reduced-motion:\s*reduce/);
  assert.match(toggleJs,/button\.type = "button"/);
  assert.match(toggleJs,/setAttribute\("aria-pressed"/);
  assert.match(toggleJs,/setAttribute\("aria-label"/);
  assert.match(toggleJs,/nav\.insertBefore\(button, logout\)/);
  assert.match(toggleJs,/icon\.textContent = isDark \? "☾" : "☀"/);
});

test("DM-04 polish loaded last on all Customer pages, never on public or staff pages",()=>{
  for(const page of pages){
    const source=read("frontend/customerHTML/"+page);
    const head=source.slice(0,source.indexOf("</head>"));
    const ref="customer-comfort-polish-dm04.css?v=20261121-dm04";
    assert.equal(source.split(ref).length-1,1,page);
    assert.ok(head.lastIndexOf('rel="stylesheet"') < head.indexOf(ref),page+" last CSS");
    assert.ok(head.indexOf("customer-dark-skin-dm03.css")<head.indexOf(ref));
    assert.match(head,/customer-theme-toggle\.js\?v=20261121-dm04/);
    assert.match(head,/customer-theme-toggle\.css\?v=20261121-dm04/);
  }
  assert.match(read("frontend/customerHTML/my-bookings.html"),/my-bookings\.js\?v=20261121-dm04/);
  for(const other of [
    "frontend/customerHTML/landing.html",
    "frontend/managerHTML/managerDashboard.html",
    "frontend/housekeepingHTML/housekeepingDashboard.html"
  ]) assert.doesNotMatch(read(other),/customer-comfort-polish-dm04/,other);
});

test("DM-04 retains light-mode colors, PayPal isolation and white printed receipt",()=>{
  assert.match(polish,/@media screen/);
  assert.doesNotMatch(polish,/@media print|html\[data-customer-theme="light"\]/);
  assert.doesNotMatch(polish,/\bfetch\s*\(|localStorage|#paypalButton/);
  assert.match(read("frontend/customerCSS/booking-receipt.css"),/@media print/);
  const css=polish.replace(/\/\*[\s\S]*?\*\//g,"");
  const darkSelectors=css.split("\n").filter(s=>/^\s*html\[data-customer-theme="dark"\]/.test(s));
  assert.ok(darkSelectors.length>=10);
  assert.ok(darkSelectors.every(s=>s.includes("body.customer-manager-tone")));
});
