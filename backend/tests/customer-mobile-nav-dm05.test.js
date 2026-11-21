"use strict";
/* DM-05 mobile Customer nav regression: presentation only, no live service calls. */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const css=read("frontend/customerCSS/customer-mobile-nav-dm05.css");
const nav=read("frontend/sharedCSS/customer-navbar.css");
const scroll=read("frontend/sharedJS/customer-scroll-nav.js");
const theme=read("frontend/sharedJS/customer-theme-toggle.js");
const pages=["index.html","rooms.html","booking.html","booking-payment.html",
 "booking-receipt.html","my-bookings.html","profile.html","resort-map.html"];

test("DM-05 scoped mobile stylesheet is last across 8 authenticated Customer pages",()=>{
  for(const page of pages){
    const s=read("frontend/customerHTML/"+page);
    const head=s.slice(0,s.indexOf("</head>"));
    const ref="customer-mobile-nav-dm05.css?v=20261121-dm05";
    assert.equal(s.split(ref).length-1,1,page+" should load exactly once");
    assert.ok(head.includes(ref),page+" mobile CSS must load in head");
    assert.ok(head.indexOf("customer-comfort-polish-dm04.css")<head.indexOf(ref),page+" mobile CSS should override earlier theme");
    assert.ok(head.indexOf(ref)<head.indexOf("customer-ai-dark-polish-dm06.css"),page+" mobile stylesheet before DM-06 contrast polish");
    assert.match(s,/id="menuToggle"/);
    assert.match(s,/id="mobileNav"/);
    assert.match(s,/id="logoutBtn"/);
    assert.doesNotMatch(s,/class="mobile-theme-row"/,page+" no extra duplicate theme button");
  }
  for(const file of [
    "frontend/customerHTML/landing.html",
    "frontend/managerHTML/managerHousekeeping.html",
    "frontend/housekeepingHTML/housekeepingDashboard.html",
  ]) assert.doesNotMatch(read(file),/customer-mobile-nav-dm05\.css/,file);
});

test("DM-05 keeps navbar compact and open menu scrollable instead of resizing header",()=>{
  assert.match(css,/@media screen and \(max-width: 900px\)/);
  assert.match(css,/position:\s*absolute\s*!important/);
  assert.match(css,/top:\s*calc\(100%\s*\+\s*5px\)\s*!important/);
  assert.match(css,/#mobileNav\.show/);
  assert.match(css,/display:\s*flex\s*!important/);
  assert.match(css,/max-height:\s*calc\(100dvh\s*-\s*90px\)/);
  assert.match(css,/overflow-y:\s*auto\s*!important/);
  assert.match(css,/min-height:\s*42px\s*!important/);
  assert.match(css,/@media screen and \(max-width: 480px\)/);
  assert.doesNotMatch(css,/position:\s*fixed/);
  assert.match(nav,/\.navbar\.is-scroll-hidden/);
  assert.match(scroll,/function syncSpacerHeight\(\)/);
});

test("DM-05 Theme row is accessible, compact and includes working 64px slider",()=>{
  assert.match(css,/#mobileNav > button#customerThemeToggle/);
  assert.match(css,/content:\s*"Theme"/);
  assert.match(css,/width:\s*64px/);
  assert.match(css,/height:\s*34px/);
  assert.match(css,/width:\s*26px\s*!important/);
  assert.match(css,/\[aria-pressed="true"\] \.customer-theme-icon/);
  assert.match(css,/right:\s*44px/);
  assert.match(css,/right:\s*14px/);
  assert.match(css,/prefers-reduced-motion:\s*reduce/);
  assert.match(theme,/nav\.insertBefore\(button, logout\)/);
  assert.match(theme,/setAttribute\("aria-pressed"/);
  assert.match(theme,/button\.type = "button"/);
});

test("DM-05 hides only the floating AI launcher when the mobile menu is open",()=>{
  assert.match(css,/body\.customer-manager-tone:has\(> header\.navbar #mobileNav\.show\) \.ai-chat-toggle/);
  assert.match(css,/visibility:\s*hidden\s*!important/);
  assert.match(css,/pointer-events:\s*none\s*!important/);
  assert.match(css,/z-index:\s*5200\s*!important/);
  assert.doesNotMatch(css,/\.ai-chat-window\s*\{\s*display:\s*none/);
  assert.doesNotMatch(css,/fetch\s*\(|localStorage|window\.location|window\.print|#paypalButton/);
});

test("DM-05 changes screen/mobile CSS only, no desktop or print rules",()=>{
  assert.doesNotMatch(css,/@media\s+print|@media\s+\(min-width:\s*901px/);
  assert.doesNotMatch(css,/🌴|🌊|🐬/);
  const stripped=css.replace(/\/\*[\s\S]*?\*\//g,"");
  let depth=0;
  for(const letter of stripped){if(letter==="{")depth++;if(letter==="}")depth--;assert.ok(depth>=0,"no orphan CSS brace");}
  assert.equal(depth,0,"CSS balanced");
  assert.ok(stripped.includes("body.customer-manager-tone"),"Customer scope");
  assert.match(read("frontend/customerCSS/booking-receipt.css"),/@media print/);
});
