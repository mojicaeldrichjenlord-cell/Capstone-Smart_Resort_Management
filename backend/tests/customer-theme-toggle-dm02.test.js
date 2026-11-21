"use strict";
// DM-02 regression: shared Customer navbar toggle and browser-only theme state.
// Runs without a browser, live backend, database, PayPal, or Gemini API.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const script = read("frontend/sharedJS/customer-theme-toggle.js");
const styles = read("frontend/customerCSS/customer-theme-toggle.css");
const pages = [
  "index.html","rooms.html","booking.html","booking-payment.html",
  "booking-receipt.html","my-bookings.html","profile.html","resort-map.html"
];

test("DM-02 all signed-in Customer pages restore theme before CSS and use one shared toggle style", () => {
  for (const page of pages) {
    const html=read("frontend/customerHTML/" + page);
    const jsTag='<script src="../sharedJS/customer-theme-toggle.js?v=20261121-dm02"></script>';
    const cssRef='customer-theme-toggle.css?v=20261121-dm02';
    assert.equal(html.split(jsTag).length-1,1,page);
    assert.equal(html.split(cssRef).length-1,1,page);
    assert.ok(html.indexOf(jsTag)<html.indexOf('rel="stylesheet"'),page+" restore before paint");
    assert.ok(html.indexOf(cssRef)<html.indexOf("</head>"),page+" CSS in head");
    assert.ok(html.indexOf(cssRef)>html.indexOf("customer-theme-tokens.css"),page);
    assert.match(html, /<body[^>]*customer-manager-tone/);
    assert.match(html, /id="mobileNav"/);
    assert.match(html, /id="logoutBtn"/);
    assert.doesNotMatch(html, /id="customerThemeToggle"/,page+" avoids duplicated markup");
  }
  for(const other of [
    "frontend/customerHTML/landing.html",
    "frontend/managerHTML/managerDashboard.html",
    "frontend/housekeepingHTML/housekeepingDashboard.html"
  ]) {
    assert.doesNotMatch(read(other), /customer-theme-toggle\.(?:js|css)/,other);
  }
});

test("DM-02 responsive toggle remains after Profile before Logout and is keyboard-focusable", () => {
  assert.match(script,/nav\.insertBefore\(button, logout\)/);
  assert.match(script,/button\.type = "button"/);
  assert.match(script,/button\.id = "customerThemeToggle"/);
  assert.match(script,/button\.setAttribute\("aria-pressed"/);
  assert.match(script,/button\.setAttribute\("aria-label"/);
  assert.match(styles, /\.customer-theme-toggle:focus-visible/);
  assert.match(styles, /@media \(max-width: 900px\)/);
  assert.match(styles, /@media \(min-width: 901px\) and \(max-width: 1240px\)/);
  assert.doesNotMatch(script,/window\.location\s*=|history\.pushState|fetch\(|logoutBtn\.click|sessionStorage|innerHTML/);
  assert.doesNotThrow(()=>new vm.Script(script));
});

function createEnvironment(initialSaved = null, storageDisabled = false) {
  const events = {};
  const keys = {};
  const storage = new Map();
  if(initialSaved!==null)storage.set("arvic_customer_theme_v1",initialSaved);
  const root = {
    attrs:{},
    setAttribute(name,value){this.attrs[name]=value;},
    getAttribute(name){return this.attrs[name]||null;}
  };
  function element(tag) {
    return {
      tagName:tag.toUpperCase(), attributes:{}, children:[],
      setAttribute(k,v){this.attributes[k]=v;},
      appendChild(child){this.children.push(child);},
      addEventListener(name,fn){this.listeners??={};this.listeners[name]=fn;},
      querySelector(selector) {
        if(selector===".customer-theme-icon")return this.children.find(x=>x.className==="customer-theme-icon")||null;
        if(selector===".customer-theme-label")return this.children.find(x=>x.className==="customer-theme-label")||null;
        return null;
      }
    };
  }
  const logout=element("a");logout.id="logoutBtn";
  const nav={
    items:["Home","Accommodations","Resort Map","My Bookings","Profile",logout],
    querySelector(s){return s==="#logoutBtn"?logout:null;},
    insertBefore(button,target) {
      const i=this.items.indexOf(target);
      if(i<0)throw Error("Logout target missing");
      this.items.splice(i,0,button);
      keys[button.id]=button;
    }
  };
  const document = {
    readyState:"loading",documentElement:root,
    getElementById(id){return keys[id]||null;},
    querySelector(selector){return selector.includes("nav#mobileNav")?nav:null;},
    createElement:element,
    addEventListener(name,callback){events[name]=callback;}
  };
  const window = {
    localStorage: {
      getItem(key) {
        if(storageDisabled)throw Error("Disabled");
        return storage.get(key)||null;
      },
      setItem(key,value) {
        if(storageDisabled)throw Error("Disabled");
        storage.set(key,value);
      }
    },
    addEventListener(name,callback){events[name]=callback;}
  };
  vm.runInNewContext(script,{document,window});
  return {root,storage,events,nav,keys};
}

test("DM-02 defaults to Light, adds exactly one button, persists Dark and restores Light",()=>{
  const ctx=createEnvironment();
  assert.equal(ctx.root.getAttribute("data-customer-theme"),"light");
  ctx.events.DOMContentLoaded();
  const button=ctx.keys.customerThemeToggle;
  assert.ok(button);
  assert.equal(ctx.nav.items[ctx.nav.items.length-2],button);
  assert.equal(button.attributes["aria-pressed"],"false");
  assert.equal(button.querySelector(".customer-theme-label").textContent,"Dark Mode");
  button.listeners.click();
  assert.equal(ctx.root.getAttribute("data-customer-theme"),"dark");
  assert.equal(ctx.storage.get("arvic_customer_theme_v1"),"dark");
  assert.equal(button.attributes["aria-pressed"],"true");
  assert.equal(button.querySelector(".customer-theme-label").textContent,"Light Mode");
  button.listeners.click();
  assert.equal(ctx.root.getAttribute("data-customer-theme"),"light");
  assert.equal(ctx.storage.get("arvic_customer_theme_v1"),"light");
  ctx.events.DOMContentLoaded();
  assert.equal(ctx.nav.items.filter(x=>x.id==="customerThemeToggle").length,1);
});

test("DM-02 saved Dark state restores before nav exists and syncs across tabs",()=>{
  const ctx=createEnvironment("dark");
  assert.equal(ctx.root.getAttribute("data-customer-theme"),"dark");
  ctx.events.DOMContentLoaded();
  assert.equal(ctx.keys.customerThemeToggle.attributes["aria-pressed"],"true");
  ctx.storage.set("arvic_customer_theme_v1","light");
  ctx.events.storage({key:"arvic_customer_theme_v1"});
  assert.equal(ctx.root.getAttribute("data-customer-theme"),"light");
  assert.equal(ctx.keys.customerThemeToggle.attributes["aria-pressed"],"false");
});

test("DM-02 unavailable localStorage does not break theme switch or booking routes",()=>{
  const ctx=createEnvironment(null,true);
  assert.equal(ctx.root.getAttribute("data-customer-theme"),"light");
  ctx.events.DOMContentLoaded();
  assert.doesNotThrow(()=>ctx.keys.customerThemeToggle.listeners.click());
  assert.equal(ctx.root.getAttribute("data-customer-theme"),"dark");
  assert.equal(ctx.nav.items.filter(x=>x.id==="customerThemeToggle").length,1);
});
