"use strict";
// AUTH-87: isolated registration controller with fake DB and email sender.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../controllers/auth/authController.js"),"utf8");
const start=source.indexOf("exports.register = async");
const end=source.indexOf("exports.verifyRegistrationOtp",start);
const {getRegistrationName}=require("../utils/guestInputValidation");
function mount(existing=[]){
  const writes=[],emails=[];
  const ctx={exports:{},getRegistrationName,normalizeEmail:v=>String(v||"").trim().toLowerCase(),
    NAME_ERROR:"Invalid name",validateStrongRegistrationPassword:()=>({valid:true}),
    generateOtp:()=>"123456",bcrypt:{hash:async v=>"hash:"+v},
    db:{promise:()=>({query:async(sql,params)=>{
      if(/SELECT/i.test(sql))return [existing];
      writes.push({sql,params});return [{affectedRows:1}];
    }})},
    sendOtpEmail:async data=>emails.push(data),console:{error(){}}
  };
  vm.runInNewContext(source.slice(start,end),ctx);
  return {writes,emails,async submit(extra={}){
    const res={code:0,body:null,status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
    await ctx.exports.register({body:{first_name:"Juan",last_name:"Cruz",email:"test@example.invalid",phone:"09123456789",password:"GoodPass1!",...extra}},res);
    return res;
  }};
}
test("AUTH-87 new account can register without any address and receives OTP",async()=>{
  const h=mount();const r=await h.submit();
  assert.equal(r.code,201);
  assert.equal(r.body.requiresVerification,true);
  assert.equal(h.writes.length,1);
  assert.match(h.writes[0].sql,/INSERT INTO users/);
  assert.equal(h.writes[0].params[4],"");
  assert.equal(h.emails.length,1);
});
test("AUTH-87 retry of unverified account preserves previously stored address when omitted",async()=>{
  const h=mount([{id:17,is_verified:0}]);const r=await h.submit();
  assert.equal(r.code,200);
  assert.match(h.writes[0].sql,/address = COALESCE\(NULLIF\(\?, ''\), address\)/);
  assert.equal(h.writes[0].params[3],"");
  assert.equal(h.emails.length,1);
});
test("AUTH-87 older clients with an address remain compatible",async()=>{
  const h=mount();const r=await h.submit({address:"  Naic, Cavite  "});
  assert.equal(r.code,201);assert.equal(h.writes[0].params[4],"Naic, Cavite");
});
test("AUTH-87 other required fields and verified email protection remain",async()=>{
  const h=mount();const r=await h.submit({phone:""});
  assert.equal(r.code,400);assert.equal(h.writes.length,0);assert.equal(h.emails.length,0);
  const verified=mount([{id:17,is_verified:1}]);const duplicate=await verified.submit();
  assert.equal(duplicate.code,400);assert.equal(verified.writes.length,0);assert.equal(verified.emails.length,0);
});
