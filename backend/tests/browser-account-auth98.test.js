const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const source = fs.readFileSync(path.resolve(__dirname, "../../frontend/sharedJS/api-config.js"), "utf8");
function storage() {
  const m = new Map();
  return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),key:i=>[...m.keys()][i]??null,get length(){return m.size;}};
}
function token(user, lifetime=3600) {
  const prefix={customer:"cus1",admin:"adm1",frontdesk:"fd1",manager:"mgr1",housekeeping:"hk1"}[user.role];
  return prefix+"."+Buffer.from(JSON.stringify({sub:String(user.id),exp:Math.floor(Date.now()/1000)+lifetime})).toString("base64url")+".mockSignature";
}
function tab(localStorage,sessionStorage=storage(),pathname="/authHTML/login.html") {
  const events={}, redirects=[];
  const location={pathname,hostname:"localhost",replace:url=>redirects.push(url)};
  const window={location,addEventListener:(name,handler)=>events[name]=handler};
  const document={documentElement:{style:{}},addEventListener(){}};
  vm.runInNewContext(source,{window,document,location,localStorage,sessionStorage,
    navigator:{locks:{request:(_name,_options,fn)=>Promise.resolve().then(fn)}},
    atob:s=>Buffer.from(s,"base64").toString("binary")});
  return {api:window.ArvicAccountSession,sessionStorage,events,redirects};
}
const customer={id:12,role:"customer",email:"customer@example.test"};
const admin={id:15,role:"admin",email:"admin@example.test"};
test("one browser profile cannot replace an active different account",async()=>{
  const shared=storage(),a=tab(shared),b=tab(shared);
  await a.api.establish(customer,token(customer));
  const old=shared.getItem("user");
  await assert.rejects(b.api.establish(admin,token(admin)),{code:"ACTIVE_ACCOUNT_CONFLICT"});
  await assert.rejects(a.api.establish(admin,token(admin)),{code:"ACTIVE_ACCOUNT_CONFLICT"});
  assert.equal(shared.getItem("user"),old);
  assert.equal(a.sessionStorage.getItem("customerToken"),token(customer));
  assert.equal(b.sessionStorage.getItem("adminToken"),null);
  await b.api.establish(customer,token(customer));
  assert.ok(b.sessionStorage.getItem("customerToken"));
  const incognito=tab(storage());
  await incognito.api.establish(admin,token(admin));
  assert.ok(incognito.sessionStorage.getItem("adminToken"));
  assert.equal(shared.getItem("customerToken"),null);
});
test("missing token on a new tab and expiry never clear the valid account in another tab",async()=>{
  const shared=storage(),a=tab(shared),b=tab(shared);
  await a.api.establish(customer,token(customer));
  await b.api.establish(customer,token(customer));
  const page=tab(shared,storage(),"/managerHTML/managerDashboard.html");
  assert.equal(page.redirects.length,1);
  b.api.endTab();
  assert.ok(a.sessionStorage.getItem("customerToken"));
  assert.equal(JSON.parse(shared.getItem("user")).id,customer.id);
});
test("confirmed logout clears account across tabs and permits another login",async()=>{
  const shared=storage(),a=tab(shared);
  await a.api.establish(customer,token(customer));
  const page=tab(shared,a.sessionStorage,"/customerHTML/index.html");
  const b=tab(shared);
  await b.api.establish(customer,token(customer));
  b.api.signOut();
  page.events.storage({key:"user"});
  assert.equal(page.sessionStorage.getItem("customerToken"),null);
  assert.equal(page.redirects.length,1);
  await b.api.establish(admin,token(admin));
  assert.ok(b.sessionStorage.getItem("adminToken"));
});
test("expired or wrong identity token is rejected without replacing session",async()=>{
  const shared=storage(),a=tab(shared);
  await a.api.establish(customer,token(customer));
  await assert.rejects(a.api.establish(admin,token(customer)),/invalid/);
  await assert.rejects(a.api.establish(customer,token(customer,-1)),/invalid/);
  assert.equal(JSON.parse(shared.getItem("user")).id,customer.id);
});
