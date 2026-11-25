// const API_BASE = "http://127.0.0.1:5000/api";
// taskkill /F /IM node.exe
// cd backend
// npm start
// const API_BASE = "https://smartresort-backend.onrender.com/api";

/* ======================================================
   API CONFIG
   Local = localhost backend
   Online = Render backend
====================================================== */

const API_BASE =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000/api"
    : "https://smartresort-backend.onrender.com/api";

/* AUTH-98: one account per browser profile. Tokens remain tab-scoped.
 * This is a browser UX guard, not server authorization. The backend still verifies signed tokens.
 */
(() => {
  "use strict";
  const META = "arvic_active_account_v1";
  const KEYS = {customer:"customerToken",admin:"adminToken",frontdesk:"frontDeskToken",manager:"managerToken",housekeeping:"housekeepingToken"};
  const PREFIX = {customer:"cus1",admin:"adm1",frontdesk:"fd1",manager:"mgr1",housekeeping:"hk1"};
  const ROUTES = {customer:"../customerHTML/index.html",admin:"../adminHTML/admin.html",frontdesk:"../frontdeskHTML/frontdeskDashboard.html",manager:"../managerHTML/managerDashboard.html",housekeeping:"../housekeepingHTML/housekeepingDashboard.html"};
  const LEGACY_AI = ["smartresort_ai_context_v1","smartresort_ai_chat_history_v1","smartresort_ai_window_state_v1"];
  const CONFLICT = "Another account is currently signed in on this browser. Log out of that account first, or use an incognito window or another browser.";
  const roleOf = value => { const r=String(value||"").trim().toLowerCase(); return r==="staff"?"frontdesk":r; };
  function identity(user) {
    const id=Number(user?.id),role=roleOf(user?.role);
    return Number.isSafeInteger(id)&&id>0&&KEYS[role]?role+":"+id:null;
  }
  function parse(value) { try { return JSON.parse(value||"null"); } catch (_) { return null; } }
  const profile = () => parse(localStorage.getItem("user"));
  function tokenInfo(token, user) {
    try {
      const role=roleOf(user?.role),id=identity(user);
      if (!id || typeof token!=="string") return null;
      const parts=token.split(".");
      if(parts.length!==3||parts[0]!==PREFIX[role]||!/^[A-Za-z0-9_-]+$/.test(parts[1])||!/^[A-Za-z0-9_-]+$/.test(parts[2])) return null;
      const data=JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")));
      if(Number(data.sub)!==Number(user.id)||!Number.isSafeInteger(data.exp)||data.exp*1000<=Date.now())return null;
      return {identity:id,expires:data.exp*1000};
    } catch (_) { return null; }
  }
  function tabInfo(user=profile()) {
    const role=roleOf(user?.role);
    return tokenInfo(sessionStorage.getItem(KEYS[role]||""),user);
  }
  function active() {
    const user=profile(),id=identity(user);
    if(!id) return null;
    const meta=parse(localStorage.getItem(META));
    const tab=tabInfo(user);
    if(tab) {
      const expires=Math.max(tab.expires,meta?.identity===id?Number(meta.expires)||0:0);
      return {user,identity:id,expires};
    }
    if(meta?.identity===id&&Number.isFinite(meta.expires)&&meta.expires<=Date.now()) return null;
    // Legacy sessions without expiration metadata are protected until explicit logout or same-account login.
    return {user,identity:id,expires:meta?.identity===id?meta.expires:null};
  }
  function clearTab() {
    Object.values(KEYS).forEach(k=>sessionStorage.removeItem(k));
    const discard=[];
    for(let i=0;i<sessionStorage.length;i++){
      const k=sessionStorage.key(i);
      if(k&&(/^(smartresort_(booking_draft|admin_walkin|paypal|ai_)|arvic_ai_account_)/.test(k))) discard.push(k);
    }
    discard.forEach(k=>sessionStorage.removeItem(k));
  }
  function signOut() {
    clearTab();
    localStorage.removeItem("user");
    localStorage.removeItem(META);
  }
  function assertCompatible(user) {
    const existing=active();
    if(existing&&existing.identity!==identity(user)){
      const e=new Error(CONFLICT); e.code="ACTIVE_ACCOUNT_CONFLICT"; throw e;
    }
  }
  async function establish(user,token) {
    const info=tokenInfo(token,user);
    if(!info)throw new Error("Secure login session is invalid. Please log in again.");
    const write=()=>{
      assertCompatible(user);
      const existing=active();
      if(!existing||existing.identity!==info.identity||!tabInfo(user)) clearTab();
      else Object.values(KEYS).filter(k=>k!==KEYS[roleOf(user.role)]).forEach(k=>sessionStorage.removeItem(k));
      sessionStorage.setItem(KEYS[roleOf(user.role)],token);
      localStorage.setItem(META,JSON.stringify({identity:info.identity,expires:Math.max(info.expires,existing?.expires||0)}));
      localStorage.setItem("user",JSON.stringify({...user,role:roleOf(user.role)}));
      LEGACY_AI.forEach(k=>localStorage.removeItem(k));
    };
    if(navigator.locks?.request) return navigator.locks.request("arvic-account-login-v1",{mode:"exclusive"},write);
    // Synchronous recheck for older browsers without Web Locks.
    return write();
  }
  function showConflict() {
    const current=active();
    if(!current) return false;
    if(typeof HTMLDialogElement==="undefined"||!document.body) return false;
    const dialog=document.createElement("dialog");
    dialog.setAttribute("aria-label","Active Account Detected");
    dialog.style.cssText="width:min(440px,calc(100% - 32px));box-sizing:border-box;border:1px solid #476174;border-radius:18px;padding:24px;background:#223548;color:#edf5fa;box-shadow:0 20px 80px #0f172a66;font:inherit;";
    const title=document.createElement("h2"); title.textContent="Active Account Detected";title.style.margin="0 0 12px";
    const desc=document.createElement("p");desc.textContent=CONFLICT;desc.style.lineHeight="1.55";
    const button=document.createElement("button");button.type="button";button.textContent="Return to Current Account";button.style.cssText="width:100%;padding:12px;border:0;border-radius:10px;background:#0f766e;color:white;font:inherit;font-weight:700;cursor:pointer;";
    button.addEventListener("click",()=>{
      dialog.close();
      if(tabInfo(current.user)) location.href=ROUTES[roleOf(current.user.role)];
      else if(/\/login\.html$/i.test(location.pathname)){
        const email=document.getElementById("email");
        if(email&&current.user.email)email.value=current.user.email;
        document.getElementById("password")?.focus();
      }else location.href="../authHTML/login.html";
    });
    dialog.addEventListener("close",()=>dialog.remove(),{once:true});
    dialog.append(title,desc,button);document.body.append(dialog);
    if(typeof dialog.showModal!=="function"){dialog.remove();return false;}
    dialog.showModal();return true;
  }
  const protectedPage=/\/(?:adminHTML|frontdeskHTML|managerHTML|housekeepingHTML)\//i.test(location.pathname) ||
    /\/customerHTML\/(?:index|rooms|accommodation-details|booking|booking-payment|my-bookings|profile|resort-map)\.html$/i.test(location.pathname);
  const currentUser=profile();
  const initial=tabInfo(currentUser);
  let leaving=false;
  function leave() {
    if(leaving)return;leaving=true;
    clearTab();
    if(protectedPage){
      document.documentElement.style.visibility="hidden";
      location.replace("../authHTML/login.html");
    }
  }
  if(protectedPage&&!initial){
    // A fresh tab must authenticate the same account; do not let an old page handler
    // clear the profile-wide identity merely because this tab has no token.
    document.addEventListener("DOMContentLoaded",e=>e.stopImmediatePropagation(),true);
    leave();
  } else if(initial){
    const existing=active();
    if(existing)localStorage.setItem(META,JSON.stringify({identity:existing.identity,expires:existing.expires}));
  }
  window.addEventListener("storage",event=>{
    if(event.key!=="user"&&event.key!==null)return;
    if(initial&&identity(profile())!==initial.identity)leave();
  });
  window.addEventListener("pageshow",event=>{
    if(event.persisted&&protectedPage&&(!tabInfo()||identity(profile())!==initial?.identity))leave();
  });
  window.ArvicAccountSession=Object.freeze({active,identity,assertCompatible,establish,signOut,showConflict,tabInfo,CONFLICT});
})();
