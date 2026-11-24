"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = file => fs.readFileSync(path.join(__dirname,"../..",file),"utf8");
const html = read("frontend/frontdeskHTML/frontdeskReservations.html");
const js = read("frontend/frontdeskJS/frontdeskReservations.js");
const start = js.indexOf("function matchesReservationStatusFilter(");
const end = js.indexOf("function isClosedStatus(",start);
const helpers = vm.runInNewContext(js.slice(start,end)+"\n;({matchesReservationStatusFilter,matchesPaymentStatusFilter})");
function options(id){
  const section=html.match(new RegExp('<select id="'+id+'">([\\s\\S]*?)</select>'))[1];
  return [...section.matchAll(/<option value="([^"]*)"/g)].map(m=>m[1]);
}
test("UI-80 dropdowns group related statuses without removing record categories",()=>{
  assert.deepEqual(options("statusFilter"),["active","pending","approved","completed","unsuccessful","all"]);
  assert.deepEqual(options("paymentStatusFilter"),["","awaiting_payment","partially_paid","paid","rejected"]);
});
test("UI-80 unsuccessful group matches cancelled, rejected and no-show only",()=>{
  for(const status of ["pending","approved","completed","cancelled","rejected","no_show"]){
    assert.equal(helpers.matchesReservationStatusFilter({status},"unsuccessful"),["cancelled","rejected","no_show"].includes(status));
    assert.equal(helpers.matchesReservationStatusFilter({status},status),true);
  }
});
test("UI-80 pending/unpaid group matches both states but not recorded payments",()=>{
  for(const payment_status of ["pending","unpaid","partially_paid","paid","rejected"]){
    assert.equal(helpers.matchesPaymentStatusFilter({payment_status},"awaiting_payment"),["pending","unpaid"].includes(payment_status));
    assert.equal(helpers.matchesPaymentStatusFilter({payment_status},payment_status),true);
  }
});
test("UI-80 grouped filters are actually wired and original status labels remain",()=>{
  assert.match(js,/matchesReservationStatusFilter\(booking, status\)/);
  assert.match(js,/matchesPaymentStatusFilter\(booking, paymentStatus\)/);
  for(const label of ['cancelled: "Cancelled"','rejected: "Rejected"','no_show: "No-Show"','unpaid: "Unpaid"']) assert.ok(js.includes(label));
  assert.match(html,/frontdeskReservationReceiptActions\.js/);
});
