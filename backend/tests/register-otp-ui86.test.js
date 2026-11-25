"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = p => fs.readFileSync(path.join(__dirname,"../..",p),"utf8");
const html=read("frontend/authHTML/register.html");
const js=read("frontend/authJS/register.js");
const css=read("frontend/authCSS/register.css");
function mount(ok=true){
  const nodes={};
  const get=id=>nodes[id]||(nodes[id]={id,value:"",type:"text",hidden:false,disabled:false,style:{},attrs:{},classes:new Set(),
    classList:{add(...a){a.forEach(x=>get(id).classes.add(x));},remove(...a){a.forEach(x=>get(id).classes.delete(x));},toggle(){}},
    setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this[k]=fn;},focus(){this.focused=true;},closest(){return null;}});
  for(const [id,value] of Object.entries({firstName:"Juan",middleName:"",lastName:"Cruz",email:"test@example.invalid",phone:"09123456789",password:"GoodPass1!",confirmPassword:"GoodPass1!"}))get(id).value=value;
  get("password").type=get("confirmPassword").type="password";
  get("registerOtpBox").hidden=true;
  const buttons=["password","confirmPassword"].map(id=>Object.assign(get(id+"Toggle"),{dataset:{target:id}}));
  const store=new Map();
  let calls=0;
  let lastBody;
  const ctx={document:{getElementById:get,addEventListener(){},querySelectorAll:()=>buttons},window:{GuestNameValidation:{hasValidNameParts:()=>true},scrollTo(){}},localStorage:{setItem:(k,v)=>store.set(k,v)},API_BASE:"/api",fetch:async(_url, options)=>{calls++;lastBody=JSON.parse(options.body);return {ok,json:async()=>({email:"test@example.invalid",message:ok?"OTP sent":"Failed"})};},setInterval:()=>1,clearInterval(){},console:{error(){}}};
  vm.createContext(ctx);vm.runInContext(js,ctx);
  return {get,buttons,ctx,store,calls:()=>calls,lastBody:()=>lastBody};
}
test("UI-86 both toggles show slash by default and independently reflect actual input type",()=>{
  const h=mount();h.ctx.setupPasswordToggles();
  for(const button of h.buttons)assert.equal(button.attrs["aria-pressed"],"false");
  h.buttons[0].click();
  assert.equal(h.get("password").type,"text");
  assert.equal(h.buttons[0].attrs["aria-pressed"],"true");
  assert.equal(h.get("confirmPassword").type,"password");
  h.buttons[0].click();
  assert.equal(h.get("password").type,"password");
  assert.equal(h.buttons[0].attrs["aria-pressed"],"false");
  h.buttons[1].click();
  assert.equal(h.get("confirmPassword").type,"text");
  assert.equal(h.buttons[1].attrs["aria-label"],"Hide confirm password");
});
test("UI-86 successful registration switches to OTP only, clears form and blocks duplicate submissions",async()=>{
  const h=mount();
  await h.ctx.submitRegistration({preventDefault(){}});
  for(const id of ["registerHeading","registerSubtext","registerForm","registerShowcase"])assert.equal(h.get(id).hidden,true,id);
  assert.equal(h.get("registerOtpBox").hidden,false);
  assert.equal(h.get("registerOtp").focused,true);
  assert.equal(h.get("otpEmailText").textContent,"test@example.invalid");
  assert.equal(h.get("password").value,"");
  assert.equal(h.get("password").disabled,true);
  assert.equal(h.get("resendOtpBtn").disabled,true);
  await h.ctx.submitRegistration({preventDefault(){}});
  assert.equal(h.calls(),1);
  assert.equal(Object.hasOwn(h.lastBody(),"address"),false);
});
test("UI-86 failed registration preserves input and keeps verification hidden",async()=>{
  const h=mount(false);
  await h.ctx.submitRegistration({preventDefault(){}});
  assert.equal(h.get("registerForm").hidden,false);
  assert.equal(h.get("registerOtpBox").hidden,true);
  assert.equal(h.get("password").value,"GoodPass1!");
  assert.equal(h.get("registerSubmitBtn").disabled,false);
});
test("UI-86 markup and CSS support actual visibility, OTP autofill, and reduced motion",()=>{
  assert.equal((html.match(/class="password-eye-slash"/g)||[]).length,2);
  assert.equal((html.match(/aria-pressed="false"/g)||[]).length,2);
  assert.match(html,/id="registerOtpBox"[^>]*hidden/);
  assert.match(html,/autocomplete="one-time-code"/);
  assert.match(html,/id="registerOtpForm"/);
  assert.doesNotMatch(html,/id="address"|Home Address/);
  assert.match(css,/\[aria-pressed="true"\] \.password-eye-slash/);
  assert.match(css,/#registerContainer \[hidden\]/);
  assert.match(css,/prefers-reduced-motion/);
});
