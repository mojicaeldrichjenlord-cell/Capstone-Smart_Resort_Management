"use strict";
// AI-68: Follow-up room discovery and "mas mura ba diyan?" requests.
// Only read freshly listed accommodations. No Gemini calls, booking writes,
// inferred dates/slots, or cross-category / cross-slot price comparisons.
const { requestedCategory } = require("./aiVerifiedPreview");
const { categoryGroup } = require("./aiAccommodationCounts");
const { explicitGuestCount, savedGuestCount } = require("./aiRecommendationIntake");

const trim = input => String(input || "").normalize("NFKC").trim();
const price = value => {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const roomLike = /\b(?:rooms?|kwarto|kuwarto|cottages?|kubo|huts?|pavilions?|function\s+areas?|accommodations?)\b/i;
const cheaperWord = /\b(?:mas\s+mura|mas\s+murang|mura\s+pa|mas\s+abot[\s-]?kaya|cheaper|less\s+expensive|more\s+affordable|lower[\s-]?(?:priced?|cost)|lower\s+rate)\b/i;
const blocked = /\b(?:refund|discount|voucher|promo|entrance|corkage|downpayment|deposit|payment|balance|parking|wifi|wi-fi|menu|store|restobar|repair|salary|tax|bill|electricity|phone|groceries|pizza|loan|rent|school|tuition)\b/i;
const dates = /\b(?:tomorrow|today|next\s+(?:week|month)|this\s+(?:week|month)|date|petsa|check[\s-]?in|check[\s-]?out|available\s+(?:on|for)|book(?:ed|ing)|reservation|reserve)\b|\b\d{4}-\d{1,2}-\d{1,2}\b/i;

function recentUserCategory(recentTurns=[]) {
  for (const turn of (Array.isArray(recentTurns) ? recentTurns : []).slice(-8).reverse()) {
    if (turn?.role !== "user") continue;
    const type = requestedCategory(turn.text);
    if (type) return type;
  }
  return "";
}
function stayPreference(message, recentTurns=[], context={}) {
  const q=trim(message).toLowerCase();
  if (/\b(?:overnight|night(?:time)?|gabi|pang\s+gabi)\b/.test(q)) return "night";
  if (/\b(?:day\s*tour|daytime|umaga|pang\s+umaga)\b/.test(q)) return "day";
  const slot=trim(context?.slot_preference).toLowerCase();
  if (/^(?:night|overnight|evening)$/.test(slot)) return "night";
  if (/^(?:day|day_tour|morning)$/.test(slot)) return "day";
  // Most recent USER stay preference wins; never infer one from an AI price.
  for (const turn of (Array.isArray(recentTurns) ? recentTurns : []).slice(-8).reverse()) {
    if (turn?.role !== "user") continue;
    if (/\b(?:overnight|night(?:time)?|gabi)\b/i.test(turn.text)) return "night";
    if (/\b(?:day\s*tour|daytime|umaga)\b/i.test(turn.text)) return "day";
  }
  return "any";
}
function supportedGroup(category) {
  if (["room","single","double","family","single_poolside"].includes(category)) return "room";
  if (["cottage","shade","big_shade","small_shade","pool_shade","nipa_hut","big_nipa","small_nipa","single_cottage"].includes(category)) return "cottage";
  if (category === "function") return "function";
  return "";
}
function matchRoomPriceFollowup(message,recentTurns=[],context={}) {
  const q=trim(message).toLowerCase();
  if(!q || q.length>180 || blocked.test(q) || dates.test(q)) return null;
  const type=requestedCategory(q);
  const previousType=recentUserCategory(recentTurns);
  const category=type || (supportedGroup(context?.recommendation_category) ? context.recommendation_category : previousType);
  const scope=supportedGroup(category);
  const hasPriorRoom=Number(context?.room_id)>0 ||
    (context?.intent==="ask_recommendation" && (previousType || scope));
  const guests=explicitGuestCount(q) || savedGuestCount(context);
  const cheaper=cheaperWord.test(q);
  // "May mas mura ba diyan?" only inherits the room conversation when a
  // verified category / room focus exists; unrelated price questions don't.
  if (cheaper && (type || (hasPriorRoom && scope))) {
    if (/\b(?:price\s+of|prices?\s+for|how\s+much|magkano\s+ang)\b/i.test(q) &&
        !/\b(?:room|kwarto|kuwarto|cottage)\b/i.test(q)) return null;
    return {kind:"cheaper",scope:scope || "room",category,guests,stay:stayPreference(q,recentTurns,context)};
  }
  const shortGroup=guests>0 && q.length<=90 && (
    /\b(?:pang|para\s+sa|good\s+for|for)\s+\d{1,3}\s*(?:na\s*)?(?:tao|guests?|pax|people|persons?)\b/i.test(q) ||
    /\b\d{1,3}\s*(?:na\s*)?(?:tao|guests?|pax|people|persons?)\b/i.test(q)
  ) && !/\b(?:may\s+cr|amenities|aircon|kitchen|how\s+much|magkano|presyo)\b/i.test(q);
  if (shortGroup && (type || (hasPriorRoom && scope))) {
    return {kind:"group",scope:scope || "room",category,guests,stay:stayPreference(q,recentTurns,context)};
  }
  return null;
}
function sameType(row,scope) {
  return categoryGroup(row.category_name || row.category)===scope;
}
function amountFor(row,stay) {
  if (stay==="day") return price(row.day_price);
  if (stay==="night") return price(row.overnight_price);
  return null;
}
function shortlistRoomFollowup(rows,intent,context={}) {
  const scope=intent?.scope || "room", n=Number(intent?.guests)||0;
  const valid=(Array.isArray(rows)?rows:[]).filter(r =>
    String(r.status || "").trim().toLowerCase()==="available" &&
    sameType(r,scope) && Number.isFinite(Number(r.capacity)) &&
    Number(r.capacity)>=n && Number(r.capacity)>0 &&
    (intent.stay==="day" ? price(r.day_price)!==null :
      intent.stay==="night" ? price(r.overnight_price)!==null :
      (price(r.day_price)!==null || price(r.overnight_price)!==null)));
  const baseline=valid.find(r=>Number(r.id)===Number(context?.room_id) &&
    (!context?.room_name || String(r.room_name||r.name).toLowerCase()===
      String(context.room_name).toLowerCase())) || null;
  // For unknown stay slots, compare day-to-day and night-to-night. Never
  // compare one room's day price with another room's overnight price.
  const cheaperThanBase = r => {
    if (!baseline) return true;
    const slots=intent.stay==="any" ? ["day","night"] : [intent.stay];
    return slots.some(slot=>{
      const base=amountFor(baseline,slot), next=amountFor(r,slot);
      return base!==null && next!==null && next<base;
    });
  };
  const candidates=valid.filter(r=>Number(r.id)!==Number(baseline?.id));
  const matching=intent.kind==="cheaper" && baseline
    ? candidates.filter(cheaperThanBase)
    : candidates.length ? candidates : valid;
  const score=r=>{
    const p=intent.stay==="any"
      ? Math.min(price(r.day_price)??Infinity,price(r.overnight_price)??Infinity)
      : amountFor(r,intent.stay)??Infinity;
    return p;
  };
  // A changed guest count needs one NEW best-fit room focus so a later
  // "may mas mura ba diyan?" unambiguously compares with that new room.
  matching.sort((a,b)=>intent.kind==="group"
    ? Number(a.capacity)-Number(b.capacity)||score(a)-score(b)||Number(a.id)-Number(b.id)
    : score(a)-score(b)||Number(a.capacity)-Number(b.capacity)||Number(a.id)-Number(b.id));
  return {rows:matching.slice(0,intent.kind==="group"?1:3),baseline,scope,guests:n,stay:intent.stay,
    kind:intent.kind,hasLower: Boolean(baseline && intent.kind==="cheaper" && matching.length)};
}
const peso = n => "₱"+Number(n).toLocaleString("en-PH",{
  minimumFractionDigits:2, maximumFractionDigits:2,
});
function describeRate(room,stay,language){
  const label=String(room.room_name||room.name||"Room");
  const day=price(room.day_price),night=price(room.overnight_price);
  const taglish=language!=="english";
  const rate=stay==="day" ? (day===null?"": "Day "+peso(day)) :
    stay==="night" ? (night===null?"":"Night "+peso(night)) :
    [day!==null && "Day "+peso(day),night!==null && "Night "+peso(night)]
      .filter(Boolean).join(" / ");
  return label+" ("+rate+", up to "+Number(room.capacity)+" guests)";
}
function roomPriceFollowupReply(selection,language="taglish"){
  const english=language==="english";
  const num=selection.guests,slot=selection.stay;
  const type=selection.scope==="room"?"room":selection.scope==="cottage"?"cottage":"function area";
  const typePlural=type==="function area"?"function areas":type+"s";
  const note=english
    ? " Listed rates only; date and time-slot availability must be checked when booking."
    : " Listed rates pa lang ito; sa booking page pa mache-check ang date at slot.";
  if(selection.kind==="cheaper" && !selection.baseline && !num){
    return english ? "How many guests are staying, and is this for day tour or overnight?"
      : "Ilan po kayo, at day tour o overnight?";
  }
  if(!selection.rows.length) {
    return english
      ? (selection.kind==="cheaper" && selection.baseline
          ? "I couldn't find a cheaper listed "+type+" that fits "+num+" guests for the same stay type."+note
          : "I couldn't find a listed "+type+" with sufficient capacity for "+num+" guests."+note)
      : (selection.kind==="cheaper" && selection.baseline
          ? "Wala po akong makitang mas murang "+type+" na kasya sa "+num+" guests sa parehong stay type."+note
          : "Wala po akong makitang listed "+type+" na kasya sa "+num+" guests."+note);
  }
  const items=selection.rows.map(r=>describeRate(r,slot,language)).join("; ");
  if(selection.kind==="cheaper" && !selection.baseline) {
    return (english
      ? "Here are listed "+typePlural+" for "+num+" guests. I couldn't verify the previous room's rate, so I can't confirm which is cheaper: "
      : "Ito po ang listed "+typePlural+" para sa "+num+" guests. Hindi ko ma-verify ang naunang room rate para masabing alin ang mas mura: ")+items+"."+note;
  }
  if(selection.kind==="cheaper") {
    return (english
      ? "Yes, these "+typePlural+" have a lower listed rate than "+
        selection.baseline.room_name+" in at least one matching stay slot: "
      : "Yes po, ito ang "+typePlural+" na may mas mababang listed rate kaysa "+
        selection.baseline.room_name+" sa kaparehong stay slot: ")+items+"."+note;
  }
  return (english ? "For "+num+" guests, here are "+typePlural+" from the current listing: "
      : "Para sa "+num+" guests, ito po ang mga "+typePlural+" mula sa current listing: ")+
    items+"."+note;
}
module.exports={matchRoomPriceFollowup,shortlistRoomFollowup,roomPriceFollowupReply};
