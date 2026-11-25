const test=require("node:test");
const assert=require("node:assert/strict");
const vm=require("node:vm");
const fs=require("node:fs");
const {webcrypto}=require("node:crypto");
const path=require("node:path");
const source=fs.readFileSync(path.resolve(__dirname,"../../frontend/sharedJS/api-config.js"),"utf8");
function storage(seed={}){
 const m=new Map(Object.entries(seed));return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),key:i=>[...m.keys()][i]??null,get length(){return m.size;}};
}
function fixture(pathname,{signed=false,empty=false}={}){
 const user={id:12,role:"customer"};
 const token="cus1."+Buffer.from(JSON.stringify({sub:12,exp:Math.floor(Date.now()/1000)+3600})).toString("base64url")+".mock";
 const localStorage=storage(empty?{}:{user:JSON.stringify(user),arvic_active_account_v1:JSON.stringify({identity:"customer:12",expires:Date.now()+3600000,epoch:"existing"})});
 const sessionStorage=storage(signed?{customerToken:token}:{});
 const style={},redirects=[],timers=[],listeners=[];
 const location={hostname:"localhost",pathname,replace:p=>redirects.push(p),reload:()=>redirects.push("reload")};
 const document={documentElement:{style},addEventListener:(...args)=>listeners.push(args)};
 const window={location,crypto:webcrypto,addEventListener(){},BroadcastChannel:class{addEventListener(){} postMessage(){}}};
 vm.runInNewContext(source,{window,location,document,localStorage,sessionStorage,navigator:{},atob:v=>Buffer.from(v,"base64").toString("binary"),setTimeout:fn=>{timers.push(fn);return timers.length},clearTimeout(){}});
 return {style,redirects,timers,listeners,api:window.ArvicAccountSession,localStorage,sessionStorage};
}
for(const route of ["/authHTML/login.html","/authHTML/register.html","/customerHTML/landing.html","/"]){
 test("public page stays visible while session recovery is pending: "+route,()=>{
  const f=fixture(route);
  assert.notEqual(f.style.visibility,"hidden");assert.equal(f.timers.length,1);assert.equal(f.redirects.length,0);
  assert.equal(f.localStorage.getItem("user")!==null,true);
 });
}
test("active tab still automatically redirects to its dashboard",()=>{
 const f=fixture("/authHTML/login.html",{signed:true});
 assert.deepEqual(f.redirects,["../customerHTML/index.html"]);
 assert.notEqual(f.style.visibility,"hidden");
});
test("fresh profile renders login immediately without a recovery timer",()=>{
 const f=fixture("/authHTML/login.html",{empty:true});assert.notEqual(f.style.visibility,"hidden");assert.equal(f.timers.length,0);
});
test("protected page remains guarded until a token is recovered",()=>{
 const f=fixture("/customerHTML/index.html");assert.equal(f.style.visibility,"hidden");assert.equal(f.listeners[0][0],"DOMContentLoaded");
});
test("different account remains blocked",()=>{
 const f=fixture("/authHTML/login.html");
 assert.throws(()=>f.api.assertCompatible({id:99,role:"admin"}),{code:"ACTIVE_ACCOUNT_CONFLICT"});
});
