"use strict";
// AUTH-70: In-memory OTP -> signed customer session regression.
// No Aiven, Brevo, PayPal, real accounts, or production requests.
const test=require("node:test");
const assert=require("node:assert/strict");
const {before,after,beforeEach}=require("node:test");
const {randomBytes}=require("node:crypto");
const Module=require("node:module");
const bcrypt=require("bcrypt");
const express=require("express");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const OTP="194827";
const EMAIL="test-user@example.invalid";
const BCRYPT_HASH=bcrypt.hashSync(OTP,8);
process.env.FRONTDESK_TOKEN_SECRET=randomBytes(48).toString("hex");

let account;
let writes=0;
const fakeDb={
  promise(){
    return {async query(statement,params=[]){
      const sql=String(statement).replace(/\s+/g," ").trim();
      if(/\bSELECT\b/i.test(sql)&&/\bFROM users\b/i.test(sql)) {
        if(/\bWHERE email\s*=\s*\?/i.test(sql)) {
          return [account && String(params[0]).toLowerCase()===account.email ?
            [{...account}] : []];
        }
        if(/\bWHERE id\s*=\s*\?/i.test(sql)) {
          return [account && Number(params[0])===account.id?[{...account}]:[]];
        }
      }
      if(/^UPDATE users SET is_verified\s*=\s*1\b/i.test(sql)) {
        assert.equal(Number(params[0]),account.id);
        account.is_verified=1;
        account.register_otp_hash=null;
        account.register_otp_expires=null;
        writes+=1;
        return [{affectedRows:1}];
      }
      throw new Error("Unexpected fake-DB statement: "+sql);
    }};
  }
};
const dbPath=require.resolve("../config/db");
const moduleEntry=new Module(dbPath);
moduleEntry.filename=dbPath;
moduleEntry.loaded=true;
moduleEntry.exports=fakeDb;
require.cache[dbPath]=moduleEntry;
const {requireCustomerAuth}=require("../middleware/customerAuth");
const router=require("../routes/authRoutes");
const app=express();
app.use(express.json());
app.use("/api/auth",router);
app.get("/api/test/protected",requireCustomerAuth,(req,res)=>
  res.status(200).json({viewer:req.customerUser.id}));
let server,base;
before(async()=>{
  server=await new Promise(resolve=>{
    const s=app.listen(0,"127.0.0.1",()=>resolve(s));
  });
  base="http://127.0.0.1:"+server.address().port;
});
after(async()=>{
  if(server){
    server.closeAllConnections();
    await new Promise(resolve=>server.close(resolve));
  }
});
beforeEach(()=>{
  account={id:17,fullname:"Synthetic Guest",email:EMAIL,role:"customer",
    phone:"000",address:"Test",account_status:"active",is_verified:0,
    register_otp_hash:BCRYPT_HASH,
    register_otp_expires:new Date(Date.now()+600000)};
  writes=0;
});
async function verify(otp=OTP){
  const response=await fetch(base+"/api/auth/register/verify-otp",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email:EMAIL,otp})
  });
  return {status:response.status,data:await response.json()};
}
test("AUTH-70: a correct OTP issues a signed customer token and creates a usable authenticated session",async()=>{
  const result=await verify();
  assert.equal(result.status,200);
  assert.equal(result.data.success,true);
  assert.equal(result.data.user.role,"customer");
  assert.equal(result.data.user.is_verified,1);
  assert.match(result.data.customerToken,/^cus1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.equal(writes,1);
  const protectedPage=await fetch(base+"/api/test/protected",{
    headers:{Authorization:"Bearer "+result.data.customerToken}
  });
  assert.equal(protectedPage.status,200);
  assert.deepEqual(await protectedPage.json(),{viewer:17});
});
test("AUTH-70: a missing customer token remains rejected",async()=>{
  const response=await fetch(base+"/api/test/protected");
  assert.equal(response.status,401);
});
test("AUTH-70: invalid OTP cannot issue a token or verify an account",async()=>{
  const result=await verify("000000");
  assert.equal(result.status,400);
  assert.equal(result.data.customerToken,undefined);
  assert.equal(account.is_verified,0);
  assert.equal(writes,0);
});
test("AUTH-70: replay/any OTP for already-verified email does not disclose profile or token",async()=>{
  account.is_verified=1;
  const result=await verify("000000");
  assert.equal(result.status,200);
  assert.equal(result.data.already_verified,true);
  assert.equal(result.data.user,undefined);
  assert.equal(result.data.customerToken,undefined);
  assert.equal(writes,0);
});
test("AUTH-70: disabled and non-customer accounts cannot receive customer tokens",async()=>{
  account.account_status="disabled";
  const disabled=await verify();
  assert.equal(disabled.status,403);
  assert.equal(disabled.data.customerToken,undefined);
  assert.equal(writes,0);
  account.account_status="active";
  account.role="admin";
  const admin=await verify();
  assert.equal(admin.status,403);
  assert.equal(admin.data.customerToken,undefined);
  assert.equal(writes,0);
});
test("AUTH-70: missing signing secret does not mark account verified",async()=>{
  const prior=process.env.FRONTDESK_TOKEN_SECRET;
  process.env.FRONTDESK_TOKEN_SECRET="";
  try{
    const result=await verify();
    assert.equal(result.status,503);
    assert.equal(result.data.customerToken,undefined);
    assert.equal(writes,0);
    assert.equal(account.is_verified,0);
  }finally{
    process.env.FRONTDESK_TOKEN_SECRET=prior;
  }
});
function mountBrowser(body){
  const local=new Map([["pendingVerificationEmail",EMAIL]]);
  const session=new Map([["frontDeskToken","previous-role-test"]]);
  const node={registerOtp:{value:OTP},verifyOtpBtn:{disabled:false,
    textContent:"Verify OTP",style:{}},resendOtpBtn:{disabled:false,
    textContent:"Resend OTP",style:{}},registerMessage:{textContent:"",
    style:{},className:"",hidden:false},email:{value:EMAIL}};
  const storage=map=>({
    getItem:k=>map.get(k)??null,
    setItem:(k,v)=>map.set(k,String(v)),
    removeItem:k=>map.delete(k)
  });
  const pending=[];
  const sandbox={
    document:{
      addEventListener(){},
      getElementById:id=>node[id]||null,
      querySelectorAll:()=>[]
    },
    window:{location:{href:""}},
    localStorage:storage(local),
    sessionStorage:storage(session),
    API_BASE:"/api",
    fetch:async()=>({ok:true,json:async()=>body}),
    setTimeout:cb=>{pending.push(cb);return pending.length;},
    clearInterval(){},
    console:{log(){},error(){}},
  };
  const script=fs.readFileSync(path.join(__dirname,"../../frontend/authJS/register.js"),"utf8");
  vm.createContext(sandbox);
  vm.runInContext(script,sandbox,{filename:"register.js"});
  return {
    local,session,node,sandbox,
    async verify(){await vm.runInContext("verifyRegistrationOtp()",sandbox);
      pending.splice(0).forEach(fn=>fn());}
  };
}
test("AUTH-70 browser: only a signed token redirects to dashboard; token stays in sessionStorage",async()=>{
  const browser=mountBrowser({success:true,customerToken:"cus1.abc.def",
    user:{id:17,role:"customer",account_status:"active",is_verified:1}});
  await browser.verify();
  assert.equal(browser.sandbox.window.location.href,"../customerHTML/index.html");
  assert.equal(browser.session.get("customerToken"),"cus1.abc.def");
  assert.equal(browser.local.has("customerToken"),false);
  assert.equal(browser.session.has("frontDeskToken"),false);
  assert.equal(JSON.parse(browser.local.get("user")).id,17);
});
test("AUTH-70 browser: verified-without-token falls back to password login",async()=>{
  const browser=mountBrowser({success:true,already_verified:true});
  await browser.verify();
  assert.equal(browser.sandbox.window.location.href,"../authHTML/login.html");
  assert.equal(browser.local.has("user"),false);
  assert.equal(browser.session.has("customerToken"),false);
  assert.equal(browser.local.get("registeredEmail"),EMAIL);
});
test("AUTH-70 browser: a user-only legacy response cannot create pseudo-login",async()=>{
  const browser=mountBrowser({success:true,
    user:{id:17,role:"customer",account_status:"active",is_verified:1}});
  await browser.verify();
  assert.equal(browser.sandbox.window.location.href,"../authHTML/login.html");
  assert.equal(browser.local.has("user"),false);
  assert.equal(browser.session.has("customerToken"),false);
});
test("AUTH-70: registration page refreshes corrected JS and does not store JWT in localStorage",()=>{
  const html=fs.readFileSync(path.join(__dirname,
    "../../frontend/authHTML/register.html"),"utf8");
  const js=fs.readFileSync(path.join(__dirname,
    "../../frontend/authJS/register.js"),"utf8");
  assert.match(html,/register\.js\?v=20261125-auth87/);
  assert.doesNotMatch(js,/localStorage\.setItem\(["']customerToken["']/);
});
