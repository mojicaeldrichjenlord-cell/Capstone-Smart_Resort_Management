"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = file => fs.readFileSync(path.join(__dirname, "../..", file), "utf8");
const online = read("frontend/customerHTML/booking.html");
const manual = read("frontend/adminHTML/admin-walkin.html");
const css = read("frontend/sharedCSS/reservation-preview.css");
const onlineJs = read("frontend/customerJS/booking.js");
const manualJs = read("frontend/adminJS/admin-walkin.js");
const canonical = ["summaryItemCount","accommodationTotal","estimatedEntranceFee","highlightRemainingBalance","requiredDownpayment"];
test("UI-76 both booking forms contain one breakdown and no duplicate amount nodes", () => {
  for (const html of [online, manual]) {
    assert.equal((html.match(/class="reservation-preview-breakdown"/g)||[]).length,1);
    for (const id of canonical) assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
    for (const id of ["highlightAccommodationTotal","highlightDownpayment","highlightEntranceFee"]) {
      assert.doesNotMatch(html,new RegExp('id="'+id+'"'));
    }
    assert.match(html,/reservation-preview\.css\?v=20261124-ui76/);
  }
});
test("UI-76 online totals preserve multi-item and multi-day calculations", () => {
  const ids = new Map(canonical.map(id=>[id,{textContent:""}]));
  const doc = {getElementById:id=>ids.get(id)||null,addEventListener(){}};
  const context = {document:doc, URLSearchParams, window:{location:{search:""}}};
  vm.createContext(context);
  vm.runInContext(onlineJs,context);
  context.collectBookingItems=()=>[{accommodation_id:1,slot_type:"day",stay_duration:2},{accommodation_id:2,slot_type:"day",stay_duration:1}];
  context.getAccommodationById=id=>({id});
  context.getSlotOptions=room=>[{value:"day",price:room.id===1?3000:1000}];
  context.getStayDuration=item=>item.stay_duration;
  context.getEstimatedEntranceFee=()=>750;
  vm.runInContext("updateSummary()",context);
  assert.equal(ids.get("summaryItemCount").textContent,"2 item(s)");
  assert.equal(ids.get("accommodationTotal").textContent,"₱7,000.00");
  assert.equal(ids.get("requiredDownpayment").textContent,"₱3,500.00");
  assert.equal(ids.get("highlightRemainingBalance").textContent,"₱3,500.00");
  assert.equal(ids.get("estimatedEntranceFee").textContent,"₱750.00");
  context.collectBookingItems=()=>[];
  context.getEstimatedEntranceFee=()=>0;
  vm.runInContext("updateSummary()",context);
  assert.equal(ids.get("requiredDownpayment").textContent,"₱0.00");
});
test("UI-76 manual toggles full payment vs minimum deposit without duplicate writes", () => {
  const ids = new Map([...canonical,"manualReservationType","requiredPaymentLabel","previewAccommodationRow","previewBalanceRow","previewOtherNote"].map(id=>[id,{textContent:"",hidden:false,value:"walkin"}]));
  const context = {document:{getElementById:id=>ids.get(id)||null,addEventListener(){}}};
  vm.createContext(context);
  vm.runInContext(manualJs,context);
  context.collectBookingItems=()=>[{accommodation_id:1,slot_type:"day"}];
  context.getAccommodationById=id=>({id});
  context.getSlotOptions=()=>[{value:"day",price:4000}];
  context.getStayDuration=()=>1;
  context.getEstimatedEntranceFee=()=>1000;
  for (const type of ["walkin","facebook","walkin"]) {
    ids.get("manualReservationType").value=type;
    vm.runInContext("updateSummary()",context);
    const walkin=type==="walkin";
    assert.equal(ids.get("requiredDownpayment").textContent,walkin?"₱4,000.00":"₱2,000.00");
    assert.equal(ids.get("highlightRemainingBalance").textContent,walkin?"₱0.00":"₱2,000.00");
    assert.equal(ids.get("accommodationTotal").textContent,"₱4,000.00");
    assert.equal(ids.get("estimatedEntranceFee").textContent,"₱1,000.00");
    for(const id of ["previewAccommodationRow","previewBalanceRow","previewOtherNote"]) assert.equal(ids.get(id).hidden,walkin);
  }
});
test("UI-76 styles support dark themes, hidden rows and mobile widths; payment guards remain",()=>{
  assert.match(css,/data-customer-theme="dark"/);
  assert.match(css,/data-frontdesk-theme="dark"/);
  assert.match(css,/\.reservation-preview-row\[hidden\][^{]*\{ display: none !important;/);
  assert.match(css,/@media \(max-width: 480px\)/);
  assert.match(online,/id="nextToPaymentBtn" disabled/);
  assert.match(manual,/id="manualNextPaymentBtn" disabled/);
});
