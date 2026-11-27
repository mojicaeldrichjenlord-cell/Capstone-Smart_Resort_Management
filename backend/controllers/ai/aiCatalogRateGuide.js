"use strict";
// AI-48: read-only catalog rate overview for explicit room/cottage price lists.
// Values ALWAYS come from the fresh Admin-managed accommodations table.
// Catalog status is not slot availability; actual prices are rechecked at checkout.
function isCatalogRateOverviewQuestion(message) {
  const t = String(message || "").normalize("NFKC").trim().toLowerCase();
  if (!t || t.length > 350) return false;
  if (/\b(?:downpayments?|deposits?|refund|cancel|specific\s+date|tomorrow|bukas|next\s+week|booking\s+status)\b/i.test(t)) return false;
  if (/\b(?:family\s+room\s+[ab]|single\s+room\s+[a-f0-9]|double\s+room\s+\d|nipa\s+hut\s+\d|cottage\s+\d)\b/i.test(t)) return false;
  const rate = /\b(?:magkano|presyo|prices?|rates?|tarifas?|cu[aá]nto|tagpila|pila\s+ang\s+presyo)\b/i.test(t) || /价格|房费/u.test(t);
  const accommodation = /\b(?:rooms?|cottages?|kwarto|kuwarto|kubo|accommodations?|habitaciones?|cabañas?)\b/iu.test(t) || /房间|客房|小屋/u.test(t);
  const overview = /\b(?:rooms?|cottages?|all|list|bawat|each|mga|options|overview|available\s+rates|day\s+tour\s+(?:vs|and)\s+overnight)\b/i.test(t) || /价格|房费/u.test(t);
  return rate && accommodation && overview;
}
const positiveMoney = raw => {
  if (raw == null || String(raw).trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
};
function formatPeso(price) {
  return price == null ? "not listed" :
    "₱" + price.toLocaleString("en-PH",{minimumFractionDigits:2, maximumFractionDigits:2});
}
function catalogRateOverview(catalog, message, language="taglish") {
  const t = String(message || "").toLowerCase();
  const wantsRooms = /\b(?:rooms?|kwarto|kuwarto|habitaciones?)\b/iu.test(t) || /房间|客房/u.test(t);
  const wantsCottages = /\b(?:cottages?|kubo|cabañas?)\b/iu.test(t) || /小屋/u.test(t);
  const both = (wantsRooms && wantsCottages) || (!wantsRooms && !wantsCottages);
  const categories = both ? ["rooms", "cottages"] : wantsCottages ? ["cottages"] : ["rooms"];
  const records = (Array.isArray(catalog) ? catalog : [])
    .filter(r => String(r?.status || "").toLowerCase().trim() === "available")
    .filter(r => categories.some(kind => new RegExp("^"+kind+"?$","i").test(String(r?.category_name||""))));
  const unique = new Set();
  const rows = records.filter(room => {
    if (!Number.isSafeInteger(Number(room.id)) || unique.has(Number(room.id))) return false;
    unique.add(Number(room.id)); return true;
  }).sort((a,b) => Number(a.id)-Number(b.id));
  // QA-129: group only numbered variants with identical listed rates and
  // capacity. Keep distinct names (including Family Room A/B) and prices.
  // Group BEFORE limiting so early database IDs cannot hide other room types.
  const groups = new Map();
  for (const room of rows) {
    const category = String(room.category_name || "").trim().toLowerCase().replace(/s$/, "");
    const name = String(room.room_name || "Accommodation").trim();
    const stem = name.replace(/\s+\d+$/, "").trim();
    const prices = [room.day_price,room.overnight_price,room.extended_price].map(positiveMoney);
    const cap = Number(room.capacity);
    const capacity = Number.isSafeInteger(cap) && cap > 0 ? cap : null;
    const key = JSON.stringify([category,stem.toLowerCase(),...prices,capacity]);
    if (!groups.has(key)) groups.set(key,{category,stem,prices,capacity,rooms:[]});
    groups.get(key).rooms.push(room);
  }
  const chosenGroups = [];
  for (const cat of categories) {
    const filtered = [...groups.values()].filter(g=>g.category===cat.slice(0,-1));
    chosenGroups.push(...filtered.slice(0,5));
  }
  const chosen = chosenGroups.map(g=>g.rooms[0]);
  const noData = {
    english: "There are no matching current room/cottage rates in our listed records. Please ask Front Desk for details.",
    tagalog: "Wala pa pong makitang kumpirmadong room/cottage rates sa kasalukuyang listahan. Puwede po kayong magtanong sa Front Desk.",
    taglish: "Wala pa po akong makitang verified rates para sa hinahanap niyong rooms/cottages sa current listing. Pa-check po sa Front Desk.",
    bisaya: "Wala pay nakalistang verified rates sa gipangita ninyong rooms/cottages. Palihog pangutana sa Front Desk.",
    spanish: "No hay tarifas confirmadas para esos alojamientos en los registros actuales. Consulte con recepción.",
    mandarin: "当前记录中没有已核实的相关客房或小屋价格。请咨询前台。",
  };
  if (!chosen.length) return { reply: noData[language] || noData.english, rows: [] };
  const head = {
    english: "Here are current listed rates and maximum capacities (not live slot availability):",
    tagalog: "Narito po ang nakalistang presyo at maximum capacity (hindi pa live slot availability):",
    taglish: "Ito po ang listed rates at max capacity (hindi pa confirmed ang specific date/slot):",
    bisaya: "Mao ni ang listed rates ug max capacity (wala pa makumpirma ang petsa o slot):",
    spanish: "Estas son las tarifas y capacidades máximas de la lista (no confirma disponibilidad por fecha):",
    mandarin: "以下是当前列出的价格和最大容纳人数（尚未确认具体日期或时段）：",
  };
  const tail = {
    english: "Day Tour and Overnight are different rates. Final pricing, capacity adjustments and available slots are checked on the booking page.",
    tagalog: "Magkaiba po ang Day Tour at Overnight rates. Ang final presyo at availability ay sa booking page iche-check.",
    taglish: "Magkaiba po ang Day Tour at Overnight rate. Sa booking page iche-check ang final amount at available slots.",
    bisaya: "Lahi ang Day Tour ug Overnight rate. Ang final amount ug available slots i-check sa booking page.",
    spanish: "Los precios de día y noche son distintos. Confirme el importe final y los horarios en la página de reservas.",
    mandarin: "日间和夜间价格不同。请在预订页面确认最终金额和可用时段。",
  };
  const labels = {
    english:["Rooms","Cottages"],tagalog:["Rooms","Cottages"],taglish:["Rooms","Cottages"],
    bisaya:["Rooms","Cottages"],spanish:["Habitaciones","Cabañas"],mandarin:["客房","小屋"]
  };
  const follow = {
    english:"How many guests are coming, and are you planning a Day Tour, Overnight or Extended Stay?",
    tagalog:"Ilan po ang bisita at Day Tour, Overnight o Extended Stay ba ang plano ninyo?",
    taglish:"Ilan po kayong guests at Day Tour, Overnight o Extended Stay ba ang plan ninyo? Para ma-recommend ko ang bagay sa inyo.",
    bisaya:"Pila mo kabuok ug Day Tour, Overnight o Extended Stay ang plano ninyo?",
    spanish:"¿Cuántas personas vienen y prefieren visita de día, noche o estancia extendida?",
    mandarin:"请问有几位客人，计划日间游、过夜还是延长住宿？"
  };
  const lines=[];
  for(const [i,cat] of ["rooms","cottages"].entries()){
    const section=chosenGroups.filter(g=>g.category===cat.slice(0,-1));
    if(!section.length)continue;
    lines.push("**"+(labels[language]||labels.english)[i]+"**");
    for(const group of section){
      const name=String(group.rooms.length>1?group.stem:group.rooms[0].room_name||"Accommodation").slice(0,100);
      const [day,night,extended]=group.prices;
      const pax=group.capacity===null?"capacity not listed":group.capacity+" pax";
      const stay=day!==null&&day===night
        ?"Day Tour / Overnight "+formatPeso(day)
        :"Day Tour "+formatPeso(day)+" | Overnight "+formatPeso(night);
      lines.push("- "+name+": "+stay+(extended!==null?" | Extended Stay "+formatPeso(extended):"")+" | "+pax);
    }
  }
  if(groups.size>chosenGroups.length) lines.push(["taglish","tagalog"].includes(language)
    ?"May iba pa pong accommodation types sa website."
    :"More accommodation types are listed in the website catalog.");
  return { reply:[head[language]||head.english, ...lines, tail[language]||tail.english, follow[language]||follow.english].join("\n"), rows:chosen };
}
// A personalized price inquiry must filter by party size and the requested
// stay's actual positive rate before limiting the displayed recommendations.
function personalizedRateOverview(catalog, {category,guests,stay}, language="english") {
  const {categoryMatches}=require("./aiVerifiedPreview");
  const filipino=["taglish","tagalog"].includes(language);
  const rateKey=stay==="night"?"overnight_price":"day_price";
  const slot=stay==="night"?"Overnight":"Day Tour";
  const rows=(Array.isArray(catalog)?catalog:[]).filter(r=>
    String(r?.status||"").trim().toLowerCase()==="available" &&
    Number.isSafeInteger(Number(r.id)) && Number(r.id)>0 &&
    categoryMatches(r,category) &&
    (category!=="cottage" || /^cottages?$/i.test(String(r.category_name||"").trim())) &&
    Number(r.capacity)>=guests && positiveMoney(r[rateKey])!==null
  ).sort((a,b)=>positiveMoney(a[rateKey])-positiveMoney(b[rateKey]) ||
    Number(a.capacity)-Number(b.capacity)||Number(a.id)-Number(b.id));
  const chosen=[...new Map(rows.map(r=>[Number(r.id),r])).values()].slice(0,3);
  if(!chosen.length)return {rows:[],reply:filipino
    ? "Wala po akong makitang matching accommodation na kasya sa "+guests+" guests at may listed "+slot+" rate. Puwede po nating tingnan ang ibang type."
    : "I couldn't find a matching listed accommodation for "+guests+" guests with a "+slot+" rate. We can check another type."};
  const first=chosen[0];
  const alternatives=chosen.slice(1).map(r=>r.room_name+" ("+formatPeso(positiveMoney(r[rateKey]))+")").join(", ");
  const price=formatPeso(positiveMoney(first[rateKey]));
  return {rows:chosen,reply:filipino
    ? "Para sa "+guests+" guests, recommended po ang "+first.room_name+" — "+price+" for "+slot+"."
      +(alternatives?" Other options: "+alternatives+".":"")
      +" Anong date po ang plan ninyo para ma-check ko ang availability?"
    : "For "+guests+" guests, I'd recommend "+first.room_name+" at "+price+" for "+slot+"."
      +(alternatives?" Other options: "+alternatives+".":"")
      +" What date are you planning to visit so I can check availability?"};
}
module.exports={isCatalogRateOverviewQuestion,catalogRateOverview,personalizedRateOverview};
