"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = file => fs.readFileSync(path.join(__dirname,"../..",file),"utf8");
const html = read("frontend/adminHTML/admin-reports.html");
const js = read("frontend/adminJS/admin-reports-presentation.js");
const css = read("frontend/adminCSS/admin-reports-minimal.css");
test("UI-81 six summary cards retain all nine existing metric nodes",()=>{
  const grid = html.match(/<section class="stats-grid"[^>]*>[\s\S]*?<\/section>/)[0];
  assert.equal((grid.match(/class="stat-card(?: [^"]*)?"/g)||[]).length,6);
  for(const id of ["totalBookingsCount","totalGuestsCount","onlineBookingsCount","manualBookingsCount","approvedBookingsCount","completedBookingsCount","totalRevenueAmount","paidBookingChargesAmount","paidBedOverlapAmount"]) {
    assert.equal(grid.split('id="'+id+'"').length-1,1,id);
  }
  assert.match(html,/not audited net revenue/);
});
test("UI-81 seven outer panels preserve nine charts and print slots",()=>{
  const grid=html.match(/<section class="chart-grid">([\s\S]*?)<!-- Print uses/)[1];
  assert.equal((grid.match(/class="chart-box"/g)||[]).length,5);
  assert.equal((grid.match(/class="report-chart-group"/g)||[]).length,2);
  const ids=[...grid.matchAll(/<canvas id="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,9);
  assert.equal(new Set(ids).size,9);
  for(const id of ids)assert.ok(js.includes('["'+id+'",'),id);
  assert.match(css,/\.report-chart-view\[hidden\]\s*\{\s*display:\s*none !important/);
});
test("UI-81 switches visible chart and resizes only current selection",()=>{
  const map=new Map();
  for(const id of ["popularRoomsChart","guestsPerRoomChart"])map.set(id+"View",{hidden:false});
  const select={value:"popularRoomsChart"};
  map.set("reportAccommodationMetric",select);
  let resized=[];
  const source=js.slice(js.indexOf("  function syncMetricGroup("),js.indexOf("  function syncSourceBar("));
  const ctx={document:{getElementById:id=>map.get(id)},requestAnimationFrame:fn=>fn(),lastSnapshot:{chartInstances:{popularRoomsChart:{resize:()=>resized.push("popular")},guestsPerRoomChart:{resize:()=>resized.push("guests")}}}};
  vm.createContext(ctx);vm.runInContext(source,ctx);
  ctx.syncMetricGroup("reportAccommodationMetric",["popularRoomsChart","guestsPerRoomChart"]);
  assert.equal(map.get("popularRoomsChartView").hidden,false);
  assert.equal(map.get("guestsPerRoomChartView").hidden,true);
  select.value="guestsPerRoomChart";
  ctx.syncMetricGroup("reportAccommodationMetric",["popularRoomsChart","guestsPerRoomChart"]);
  assert.equal(map.get("popularRoomsChartView").hidden,true);
  assert.equal(map.get("guestsPerRoomChartView").hidden,false);
  assert.deepEqual(resized,["popular","guests"]);
});
