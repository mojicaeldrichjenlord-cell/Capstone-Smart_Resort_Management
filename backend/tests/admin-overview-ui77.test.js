"use strict";
// UI-77: isolated dashboard presentation and count checks; no DB or payment calls.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = file => fs.readFileSync(path.join(__dirname,"../..",file),"utf8");
const html = read("frontend/adminHTML/admin.html");
const js = read("frontend/adminJS/admin.js");
const css = read("frontend/adminCSS/admin-overview-ui77.css");
test("UI-77 six overview cards preserve every existing metric ID once",()=>{
  const overview = html.match(/<section class="admin-overview-grid"[^>]*>[\s\S]*?<\/section>/)[0];
  assert.equal((overview.match(/class="overview-card(?:\s[^"]*)?"/g)||[]).length,6);
  for(const id of ["totalBookings","approvedCount","guestsInside","guestsInsideNote","onlineToday","walkinToday","partiallyPaidCount","paidCount","todayRevenue","reservationsToday"]) {
    assert.equal((overview.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
  }
  assert.match(overview,/Today's Collections \(Estimate\)/);
  assert.match(overview,/may include earlier payments/);
  assert.match(overview,/Not actual daily revenue/);
  assert.match(html,/admin-overview-ui77\.css\?v=20261124-ui77/);
  assert.match(html,/admin\.js\?v=20261124-ui77/);
});
function harness(){
  const nodes = new Map();
  const get = id => { if(!nodes.has(id))nodes.set(id,{textContent:"",style:{}}); return nodes.get(id); };
  const start = js.indexOf("function updateSummaryCards(bookings)");
  const end = js.indexOf("function setText(id, value)",start);
  assert.ok(start>=0&&end>start);
  const ctx={
    document:{getElementById:get},
    setText:(id,value)=>{get(id).textContent=String(value);},
    getPhilippineDateKey:v=>v||"today",
    getPaymentStatus:b=>b.payment,
    getReservationStatus:b=>b.status,
    getBookingSource:b=>b.source,
    getGuestPresenceCounts:()=>({activeGuests:7,overdueBookings:1}),
    calculateTodayCollectedRevenue:b=>b.amount,
    formatMoney:n=>n.toFixed(2)
  };
  vm.createContext(ctx);
  vm.runInContext(js.slice(start,end),ctx);
  return {get,update:bookings=>ctx.updateSummaryCards(bookings)};
}
test("UI-77 existing counters and revenue remain intact while daily sources combine",()=>{
  const h=harness();
  h.update([
    {source:"online",created_at:"today",payment:"partially_paid",status:"approved",amount:500},
    {source:"manual",created_at:"today",payment:"paid",status:"approved",amount:1500},
    {source:"online",created_at:"today",payment:"paid",status:"completed",amount:1000},
    {source:"manual",created_at:"yesterday",payment:"paid",status:"completed",amount:0}
  ]);
  for(const [id,value] of Object.entries({totalBookings:"4",approvedCount:"2",partiallyPaidCount:"1",paidCount:"3",onlineToday:"2",walkinToday:"1",reservationsToday:"3",guestsInside:"7",todayRevenue:"₱3000.00"})){
    assert.equal(h.get(id).textContent,value,id);
  }
  assert.match(h.get("guestsInsideNote").textContent,/1 overdue checked-in reservation/);
  assert.ok(Math.abs(parseFloat(h.get("onlineTodayBar").style.width)-200/3)<0.001);
  assert.ok(Math.abs(parseFloat(h.get("manualTodayBar").style.width)-100/3)<0.001);
  h.update([]);
  assert.equal(h.get("reservationsToday").textContent,"0");
  assert.equal(h.get("onlineTodayBar").style.width,"0%");
  assert.equal(h.get("manualTodayBar").style.width,"0%");
});
test("UI-77 dashboard responsive grid has three, two, and one columns",()=>{
  assert.match(css,/repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css,/repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css,/@media \(max-width: 600px\)[\s\S]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css,/body\.admin-manager-tone \.admin-overview-grid/);
});
