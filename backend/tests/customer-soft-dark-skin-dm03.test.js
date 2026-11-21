"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const css=read("frontend/customerCSS/customer-dark-skin-dm03.css");
const tokens=read("frontend/customerCSS/customer-theme-tokens.css");
const pages=["index.html","rooms.html","booking.html","booking-payment.html",
  "booking-receipt.html","my-bookings.html","profile.html","resort-map.html"];

test("DM-03 original dark skin stays before DM-04 comfort polish on Customer pages only",()=>{
  for(const name of pages){
    const page=read("frontend/customerHTML/"+name);
    const ref="customer-dark-skin-dm03.css?v=20261121-dm03";
    assert.equal(page.split(ref).length-1,1,name);
    const head=page.slice(0,page.indexOf("</head>"));
    assert.ok(head.includes(ref),name);
    assert.ok(head.indexOf(ref) < head.indexOf("customer-comfort-polish-dm04.css"),name+" dark skin before comfort polish");
    assert.ok(head.indexOf("customer-theme-tokens.css")<head.indexOf(ref),name);
    assert.ok(head.indexOf("customer-theme-toggle.css")<head.indexOf(ref),name);
    assert.match(page,/<body[^>]*customer-manager-tone/);
  }
  for(const p of ["frontend/customerHTML/landing.html",
    "frontend/managerHTML/managerDashboard.html",
    "frontend/housekeepingHTML/housekeepingDashboard.html"]){
    assert.doesNotMatch(read(p),/customer-dark-skin-dm03\.css/,p);
  }
});

test("DM-03 exclusively screen-only, dark-theme, Customer-scoped, balanced CSS",()=>{
  assert.match(css,/@media screen\s*\{/);
  assert.doesNotMatch(css,/@media\s+print\s*\{/);
  assert.doesNotMatch(css,/html\[data-customer-theme="light"\]/);
  const actual=css.replace(/\/\*[\s\S]*?\*\//g,"");
  const starts=actual.split("\n").filter(v=>/^\s*html\[data-customer-theme="dark"\]/.test(v));
  assert.ok(starts.length>=65);
  assert.ok(starts.every(v=>v.includes("body.customer-manager-tone")));
  assert.doesNotMatch(actual,/#000000|background:\s*black/);
  let braces=0;
  for(const ch of actual){
    if(ch==="{")braces++;
    if(ch==="}")braces--;
    assert.ok(braces>=0,"orphan CSS closing brace");
  }
  assert.equal(braces,0,"unbalanced CSS");
  assert.match(css,/color-scheme:\s*dark/);
});

test("DM-03 includes all Customer screens and status-safe dialogs",()=>{
  const areas=[
    ".room-ai-card",".room-accordion-toggle",".room-ai-meta",
    ".customer-amenities-list",".booking-card",".booking-form-group input",
    ".accommodation-picker-panel",".booking-availability-note",
    ".booking-slot-status",".status-approved",".status-cancelled",
    ".payment-grid > .section-box",
    ".paypal-payment-section",
    ".paypal-amount-row",
    ".receipt-shell",".receipt-hero",".payment-summary",
    ".profile-card",
    ".request-modal-box",".logout-confirm-dialog",
    ".map-info-card",".ai-chat-window .ai-chat-messages",
    ".ai-chat-window .ai-message.assistant .ai-bubble"
  ];
  for(const selector of areas)assert.ok(css.includes(selector),"Missing "+selector);
  assert.doesNotMatch(css,/(?:#paypalButton|paypal-button)\s*\{\s*(?:background|color|display|visibility|opacity)\s*:/);
  assert.doesNotMatch(css,/\bfetch\s*\(|\.innerHTML\b|localStorage/);
});

const lum=hex=>{
  const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
    .map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));
  return .2126*c[0]+.7152*c[1]+.0722*c[2];
};
const contrast=(a,b)=>{
  const [light,dark]=[lum(a),lum(b)].sort((a,b)=>b-a);
  return (light+.05)/(dark+.05);
};
test("DM-03 dark primary buttons and readable text meet WCAG AA contrast",()=>{
  const dark=tokens.split('html[data-customer-theme="dark"] body.customer-manager-tone {')[1].split("}")[0];
  const get=name=>{
    const line=dark.split("\n").find(v=>v.trim().startsWith(name+":"));
    assert.ok(line,name+" exists");
    const hex=line.match(/#[a-f0-9]{6}/i);
    assert.ok(hex,name+" contains a color");
    return hex[0];
  };
  assert.ok(contrast("#ffffff",get("--customer-accent-strong"))>=4.5);
  assert.ok(contrast("#ffffff",get("--customer-accent-strong-hover"))>=4.5);
  assert.ok(contrast(get("--customer-text-primary"),get("--customer-card"))>=4.5);
  assert.ok(contrast(get("--customer-text-secondary"),get("--customer-card"))>=4.5);
  assert.notEqual(get("--customer-page-top"),"#000000");
});

test("DM-03 no receipt print overrides; original print rules remain white",()=>{
  const receipt=read("frontend/customerCSS/booking-receipt.css");
  assert.match(receipt,/@media print/);
  assert.match(receipt,/background:\s*#fff\s*!important/);
  assert.match(css,/@media screen/);
  assert.doesNotMatch(css,/print-color-adjust|@page|window\.print/);
});
