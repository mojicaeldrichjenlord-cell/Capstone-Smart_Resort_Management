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
  const CONFLICT = "Use your current account or sign out from its open tab before switching accounts.";
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
    releaseLease();
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
    const write=async()=>{
      assertCompatible(user);
      const existing=active();
      if(!existing||existing.identity!==info.identity||!tabInfo(user)) clearTab();
      else Object.values(KEYS).filter(k=>k!==KEYS[roleOf(user.role)]).forEach(k=>sessionStorage.removeItem(k));
      sessionStorage.setItem(KEYS[roleOf(user.role)],token);
      const previous=parse(localStorage.getItem(META));
      const epoch=previous?.identity===info.identity && existing && previous.epoch ? previous.epoch : nonce();
      // A new generation is lease-managed only when every session starts here.
      const managed=await holdLease();
      localStorage.setItem(META,JSON.stringify({identity:info.identity,expires:Math.max(info.expires,existing?.expires||0),epoch,leaseManaged:managed&&(!existing||previous?.leaseManaged===true)}));
      localStorage.setItem("user",JSON.stringify({...user,role:roleOf(user.role)}));
      currentEpoch=epoch;
      LEGACY_AI.forEach(k=>localStorage.removeItem(k));
    };
    if(navigator.locks?.request) return navigator.locks.request("arvic-account-login-v1",{mode:"exclusive"},write);
    // Synchronous recheck for older browsers without Web Locks.
    return write();
  }
  // AUTH-100: hand off a still-valid signed token only between live same-origin
  // tabs. Never persist the bearer in localStorage or use account metadata as auth.
  function nonce() {
    const bytes=new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes,n=>n.toString(16).padStart(2,"0")).join("");
  }
  const path=location.pathname;
  const protectedPage=/\/(?:adminHTML|frontdeskHTML|managerHTML|housekeepingHTML)\//i.test(path) ||
    /\/customerHTML\/(?:index|rooms|accommodation-details|booking|booking-payment|my-bookings|profile|resort-map)\.html$/i.test(path);
  const authPage=/\/authHTML\/(?:login|register)\.html$/i.test(path);
  const landingPage=path==="/"||/\/landing\.html$/i.test(path);
  const currentUser=profile();
  const initial=tabInfo(currentUser);
  function roleAllowed(user) {
    const role=roleOf(user?.role);
    if(/\/adminHTML\/admin-walkin(?:-payment)?\.html$/i.test(path))return role==="frontdesk"||role==="admin";
    if(/\/adminHTML\//i.test(path))return role==="admin";
    if(/\/frontdeskHTML\//i.test(path))return role==="frontdesk";
    if(/\/managerHTML\//i.test(path))return role==="manager";
    if(/\/housekeepingHTML\//i.test(path))return role==="housekeeping";
    return role==="customer";
  }
  const dashboard=user=>ROUTES[roleOf(user?.role)]||"../authHTML/login.html";
  // AUTH-101: distinguish stale identity from an active tab using a browser-held
  // shared lease. A sleeping tab keeps its lock; timeout alone is not logout proof.
  const LEASE="arvic-active-session-lease-v1";
  const supportsLease=typeof navigator.locks?.query==="function"&&typeof navigator.locks?.request==="function";
  let leasePromise=null,releaseHeldLease=null,leaseGeneration=0;
  function holdLease(){
    if(!supportsLease)return Promise.resolve(false);
    if(leasePromise)return leasePromise;
    const generation=++leaseGeneration;
    leasePromise=new Promise(resolve=>{
      navigator.locks.request(LEASE,{mode:"shared"},lock=>{
        if(!lock||generation!==leaseGeneration){resolve(false);return;}
        return new Promise(release=>{releaseHeldLease=release;resolve(true);});
      }).catch(()=>{if(generation===leaseGeneration)leasePromise=null;resolve(false);});
    });
    return leasePromise;
  }
  function releaseLease(){leaseGeneration++;releaseHeldLease?.();releaseHeldLease=null;leasePromise=null;}
  let channel=null;
  try { if(typeof window.BroadcastChannel==="function")channel=new window.BroadcastChannel("arvic-account-session-v2"); } catch (_) {}
  function metadata(){return parse(localStorage.getItem(META));}
  // Existing sessions from AUTH-98 get a generation without changing their account.
  if(initial){
    const existing=active(),old=metadata();
    if(existing)localStorage.setItem(META,JSON.stringify({identity:existing.identity,expires:existing.expires,epoch:old?.identity===existing.identity&&old.epoch?old.epoch:nonce(),leaseManaged:old?.identity===existing.identity&&old.leaseManaged===true}));
    void holdLease();
  }
  let currentEpoch=initial?metadata()?.epoch:null;
  let leaving=false;
  function leave() {
    if(leaving)return;leaving=true;
    clearTab();
    if(protectedPage){
      document.documentElement.style.visibility="hidden";
      location.replace("../authHTML/login.html");
    }
  }
  function suspendPage() {
    document.documentElement.style.visibility="hidden";
    document.addEventListener("DOMContentLoaded",event=>event.stopImmediatePropagation(),true);
  }
  // Only a tab with the current, unexpired token may answer. The request carries
  // a random nonce and the current account generation; replies after logout are rejected.
  const pending=new Map();
  if(channel)channel.addEventListener("message",event=>{
    const msg=event.data;
    if(!msg||typeof msg!=="object")return;
    const user=profile(),meta=metadata(),info=tabInfo(user);
    if(msg.type==="request"&&!leaving&&info&&meta?.identity===info.identity&&meta.epoch&&currentEpoch===meta.epoch&&
       msg.identity===info.identity&&msg.epoch===meta.epoch&&
       typeof msg.nonce==="string"&&/^[a-f0-9]{32}$/.test(msg.nonce)){
      channel.postMessage({type:"reply",nonce:msg.nonce,identity:info.identity,epoch:meta.epoch,token:sessionStorage.getItem(KEYS[roleOf(user.role)])});
    }else if(msg.type==="reply"){
      const request=pending.get(msg.nonce);
      if(request&&msg.identity===request.identity&&msg.epoch===request.epoch&&
         meta?.identity===request.identity&&meta.epoch===request.epoch&&identity(user)===request.identity&&tokenInfo(msg.token,user)){
        request.finish(msg.token);
      }
    }
  });
  async function requestToken(existing) {
    if(!channel)return null;
    // A current sender may be upgrading its metadata from the preceding release.
    for(let attempt=0;attempt<3;attempt++){
      const meta=metadata();
      if(identity(profile())!==existing.identity)return null;
      if(meta?.identity===existing.identity&&meta.epoch){
        const id=nonce();
        const token=await new Promise(resolve=>{
          const finish=value=>{clearTimeout(timer);pending.delete(id);resolve(value);};
          const timer=setTimeout(()=>finish(null),700);
          pending.set(id,{identity:existing.identity,epoch:meta.epoch,finish});
          channel.postMessage({type:"request",nonce:id,identity:existing.identity,epoch:meta.epoch});
        });
        if(token){
          const latest=metadata();
          if(latest?.identity!==existing.identity||latest.epoch!==meta.epoch||identity(profile())!==existing.identity)return null;
          const user=profile(),info=tokenInfo(token,user);
          if(!info)return null;
          clearTab();
          await holdLease();
          if(metadata()?.epoch!==latest.epoch||identity(profile())!==existing.identity){releaseLease();return null;}
          sessionStorage.setItem(KEYS[roleOf(user.role)],token);
          currentEpoch=latest.epoch;
          return token;
        }
      }else await new Promise(resolve=>setTimeout(resolve,250));
    }
    return null;
  }
  async function discardStaleIdentity(existing) {
    if(!supportsLease||!existing||tabInfo())return false;
    const snapshot=metadata();
    // Legacy generations may have open tabs without a lease. Keep their identity
    // protected until a normal logout/expiry; never evict on a failed handshake.
    if(snapshot?.leaseManaged!==true||snapshot.identity!==existing.identity)return false;
    return navigator.locks.request("arvic-account-login-v1",{mode:"exclusive"},()=>
      navigator.locks.request(LEASE,{mode:"exclusive",ifAvailable:true},lock=>{
        if(!lock||tabInfo()||identity(profile())!==existing.identity||metadata()?.epoch!==snapshot.epoch)return false;
        localStorage.removeItem("user");localStorage.removeItem(META);
        clearTab();return true;
      })).catch(()=>false);
  }
  let restoring=null;
  function restoreAndRoute() {
    if(restoring)return restoring;
    restoring=(async()=>{
      const existing=active();
      if(!existing)return false;
      if(tabInfo(existing.user)){
        location.replace(dashboard(existing.user));
        return true;
      }
      if(await requestToken(existing)){
        // A protected URL for this role can reopen itself with the new tab token.
        if(protectedPage&&roleAllowed(existing.user))location.reload();
        else location.replace(dashboard(existing.user));
        return true;
      }
      await discardStaleIdentity(existing);
      return false;
    })().finally(()=>{restoring=null;});
    return restoring;
  }
  const gate=active();
  if(protectedPage&&!initial){
    suspendPage();
    restoreAndRoute().then(ok=>{if(!ok)leave();}).catch(leave);
  }else if(protectedPage&&initial&&!roleAllowed(currentUser)){
    suspendPage();
    location.replace(dashboard(currentUser));
  }else if((authPage||landingPage)&&gate){
    // AUTH-106: Public pages must paint normally even when a stale account
    // identity requires a cross-tab handshake. Keep private pages guarded.
    // Valid sessions still redirect automatically; a timeout never hides
    // the login, registration or landing UI.
    void restoreAndRoute().catch(()=>{});
  }
  window.addEventListener("storage",event=>{
    if(event.key==="user"||event.key===null){
      const ownIdentity=initial?.identity||tabInfo()?.identity;
      if(currentEpoch&&(event.key===null||!event.newValue||identity(parse(event.newValue))!==ownIdentity))leave();
    }
    if(event.key===META&&currentEpoch&&parse(event.newValue)?.epoch!==currentEpoch)leave();
  });
  window.addEventListener("pageshow",event=>{
    if(event.persisted&&protectedPage&&(!tabInfo()||identity(profile())!==initial?.identity||metadata()?.epoch!==currentEpoch))leave();
  });
  window.ArvicAccountSession=Object.freeze({active,identity,assertCompatible,establish,signOut,endTab:clearTab,restoreAndRoute,tabInfo,CONFLICT});
})();
