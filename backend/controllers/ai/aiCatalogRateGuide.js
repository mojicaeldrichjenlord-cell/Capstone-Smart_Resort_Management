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
  // Bounded overview for chat readability, no fabricated catch-all "from" rate.
  const chosen = [];
  for (const cat of categories) {
    const filtered = rows.filter(r => String(r.category_name||"").toLowerCase().startsWith(cat.slice(0,-1)));
    chosen.push(...filtered.slice(0,5));
  }
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
  const lines=chosen.map(room=>{
    const cap = Number(room.capacity);
    const pax = Number.isSafeInteger(cap) && cap > 0 ? cap + " pax" : "capacity not listed";
    return "- " + String(room.room_name||"Accommodation").slice(0,100) +
      ": Day Tour " + formatPeso(positiveMoney(room.day_price)) +
      " | Overnight " + formatPeso(positiveMoney(room.overnight_price)) +
      " | " + pax;
  });
  if(rows.length>chosen.length) lines.push(language==="taglish" ? "- May iba pa pong accommodation sa website; piliin ang type para sa complete details." :
    "- Additional accommodations are available in the website catalog.");
  return { reply:[head[language]||head.english, ...lines, tail[language]||tail.english].join("\n"), rows:chosen };
}
module.exports={isCatalogRateOverviewQuestion,catalogRateOverview};
