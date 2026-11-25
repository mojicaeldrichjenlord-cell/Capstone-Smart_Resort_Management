"use strict";
// UI-78: reservation cards only; no database, network or payment mutations.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = file => fs.readFileSync(path.join(__dirname,"../..",file),"utf8");
const html = read("frontend/frontdeskHTML/frontdeskReservations.html");
const js = read("frontend/frontdeskJS/frontdeskReservations.js");
const css = read("frontend/frontdeskCSS/frontdeskReservations.css");
const payments = read("frontend/frontdeskHTML/frontdeskPayments.html");
const paymentsJs = read("frontend/frontdeskJS/frontdeskPayments.js");

test("UI-78 keeps two reservation summary cards without payment counters",()=>{
  const section = html.match(/<section class="frontdesk-summary-grid"[^>]*>[\s\S]*?<\/section>/)[0];
  assert.equal((section.match(/class="summary-card"/g)||[]).length,2);
  for (const id of ["activeCount","pendingCount"]) assert.match(section,new RegExp('id="'+id+'"'));
  for (const id of ["partiallyPaidCount","paidCount"]) {
    assert.doesNotMatch(html,new RegExp('id="'+id+'"'));
    assert.doesNotMatch(js,new RegExp('setText\\("'+id+'"'));
  }
  assert.match(html,/frontdeskReservations\.css\?v=20261124-ui78/);
  assert.match(html,/frontdeskReservations\.js\?v=20261124-ui80/);
});

test("UI-78 active and pending counters retain their original independent definitions",()=>{
  const source = js.slice(js.indexOf("function updateSummaryCards()"),js.indexOf("function setText(id, value)"));
  const result = {};
  const ctx = {
    allFrontDeskReservations:[{status:"approved"},{status:"pending"},{status:"pending"},{status:"completed"},{status:"cancelled"},{status:"rejected"}],
    getReservationStatus: b=>b.status,
    isClosedStatus: status=>["completed","cancelled","rejected","no_show"].includes(status),
    setText:(id,value)=>{result[id]=value;}
  };
  vm.runInNewContext(source+"\nupdateSummaryCards();",ctx);
  assert.deepEqual(result,{activeCount:3,pendingCount:2});
  ctx.allFrontDeskReservations=[];
  vm.runInNewContext(source+"\nupdateSummaryCards();",ctx);
  assert.deepEqual(result,{activeCount:0,pendingCount:0});
});

test("UI-78 payment filters, payment display and receipt script remain available",()=>{
  assert.match(html,/id="paymentStatusFilter"/);
  assert.match(html,/<option value="partially_paid">Partially Paid<\/option>/);
  assert.match(html,/<option value="paid">Paid<\/option>/);
  assert.match(js,/function getPaymentStatus\(booking\)/);
  assert.match(js,/paymentStatusFilter/);
  assert.match(html,/frontdeskReservationReceiptActions\.js/);
});

test("UI-78 dedicated payment page retains all three counters",()=>{
  for(const id of ["pendingPaymentCount","partiallyPaidCount","paidCount"]){
    assert.match(payments,new RegExp('id="'+id+'"'));
    assert.match(paymentsJs,new RegExp('setText\\("'+id+'"'));
  }
});

test("UI-78 responsive layout retains two columns and mobile single column",()=>{
  assert.match(css,/\.frontdesk-summary-grid\s*\{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css,/\.frontdesk-summary-grid,\s*\.frontdesk-filter-grid,\s*\.reservation-detail-grid\s*\{\s*grid-template-columns: 1fr/);
  assert.match(css,/data-frontdesk-theme="dark"/);
});
