"use strict";
// DM-06 Customer AI chat contrast regression, static and backend-independent.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = path.resolve(__dirname, "../..");
const read = (p) => fs.readFileSync(path.join(base, p), "utf8");
const css = read("frontend/customerCSS/customer-ai-dark-polish-dm06.css");
const pages = [
 "index.html", "rooms.html", "booking.html", "booking-payment.html",
 "booking-receipt.html", "my-bookings.html", "profile.html", "resort-map.html",
];
test("DM-06 Customer AI Dark CSS is the final stylesheet on all eight pages", () => {
 for(const name of pages) {
   const html = read("frontend/customerHTML/" + name);
   const head = html.slice(0, html.indexOf("</head>"));
   const link = "customer-ai-dark-polish-dm06.css?v=20261121-dm06";
   assert.equal(html.split(link).length-1, 1, name);
   assert.ok(head.includes(link), name);
   assert.ok(head.lastIndexOf('rel="stylesheet"') < head.indexOf(link), name + " DM-06 must be last");
   assert.ok(head.indexOf("customer-mobile-nav-dm05.css") < head.indexOf(link), name);
 }
 for(const path of [
   "frontend/customerHTML/landing.html",
   "frontend/managerHTML/managerDashboard.html",
   "frontend/housekeepingHTML/housekeepingDashboard.html"
 ]) assert.doesNotMatch(read(path), /customer-ai-dark-polish-dm06/, path);
});
test("DM-06 CSS is screen-only, Customer-dark scoped, and structurally balanced", () => {
 assert.match(css, /@media screen/);
 assert.doesNotMatch(css, /@media print|html\[data-customer-theme="light"\]/);
 const src = css.replace(/\/\*[\s\S]*?\*\//g,"");
 let braces = 0;
 for(const c of src){if(c==="{")braces++;if(c==="}")braces--;assert.ok(braces>=0);}
 assert.equal(braces,0,"CSS brace balance");
 assert.doesNotMatch(src, /\bfetch\s*\(|localStorage|sessionStorage|#paypalButton/);
 const selectors=src.split("\n").filter(x=>/^\s*html\[data-customer-theme="dark"\]/.test(x));
 assert.ok(selectors.length>=22,"Dark AI components should be covered");
 assert.ok(selectors.every(x=>x.includes("body.customer-manager-tone")));
});
test("DM-06 repairs voice panel, automatic language label and quick question surface", () => {
 for(const part of [
  ".ai-voice-options-toggle", ".ai-voice-panel", ".ai-voice-auto-label",
  "#aiVoiceStatus", ".ai-voice-info", "#aiVoiceLive", "#aiVoiceInterrupt",
  ".ai-quick-questions", ".ai-quick-questions-label", ".ai-quick-question"
 ]) assert.ok(css.includes(part), part);
 assert.match(css, /\.ai-quick-questions\s*\{\s*background:\s*var\(--ai-dark-surface\)\s*!important/);
 assert.match(css, /color:\s*var\(--ai-dark-muted\)\s*!important/);
 assert.match(css, /\.ai-quick-question:hover/);
});
test("DM-06 retains readable chat, composer, reply controls and recommendation cards", () => {
 for(const part of [
   ".ai-chat-header-btn", ".ai-chat-messages", ".ai-bubble",
   ".ai-reply-actions button", ".ai-recommendation-card",
   ".ai-chat-input-area", ".ai-chat-input-area input::placeholder",
   ":focus-visible"
 ]) assert.ok(css.includes(part),part);
});
function luminance(hex){
 const values=[1,3,5].map(x=>parseInt(hex.slice(x,x+2),16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));
 return values[0]*.2126 + values[1]*.7152 + values[2]*.0722;
}
function ratio(a,b){const [hi,lo]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (hi+.05)/(lo+.05);}
test("DM-06 muted text and voice labels meet AA contrast on dark panels",()=>{
 assert.ok(ratio("#b7c5d5","#24364a")>=4.5,"secondary on slate");
 assert.ok(ratio("#c4ede6","#24364a")>=4.5,"voice indicator on slate");
 assert.ok(ratio("#f1f5f9","#203145")>=4.5,"suggested answers on subtle slate");
 assert.ok(ratio("#ffffff","#0f766e")>=4.5,"Start Conversation white-on-teal");
});
