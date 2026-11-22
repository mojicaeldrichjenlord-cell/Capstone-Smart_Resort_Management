"use strict";
// AI-50: Two-accommodation comparison using fresh Admin-managed DB rows.
// No Gemini call, no database mutation, no invented price/inclusion.
const { listedAmenityParts } = require("./aiNaturalRoomDetails");

function norm(value) {
  return String(value || "").normalize("NFKC").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").trim();
}
function escapeRegExp(s) { return s.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"); }
function fact(s, max=160) {
  return String(s ?? "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ")
    .replace(/<[^>]*>/g," ").replace(/[\u0000-\u001f\u007f]+/g," ")
    .replace(/\s+/g," ").trim().slice(0,max);
}
function isComparisonQuestion(message) {
  const text = String(message || "").normalize("NFKC");
  if (!text || text.length > 450) return false;
  return /\b(?:pinag[\s-]*kaiba|pagkakaiba|pagkaiba|kaibahan|difference|differences|compare|comparison|vs\.?|versus|kaysa|alin(?:g)?\s+(?:ang\s+)?mas|diferencia|comparar|comparaci[oó]n|kalainan)\b/iu.test(text) ||
    /(?:区别|不同|比较)/u.test(text);
}
function selectComparisonRooms(catalog,message) {
  if (!isComparisonQuestion(message)) return null;
  const q = " " + norm(message) + " ";
  const rooms = (Array.isArray(catalog)?catalog:[]).filter(row =>
    Number.isSafeInteger(Number(row?.id)) && Number(row.id)>0 &&
    norm(row.room_name || row.name));
  const named = new Map();
  for(const row of rooms) {
    const title=norm(row.room_name || row.name);
    if(q.includes(" "+title+" ")) named.set(title,row);
  }
  const targets=new Set(named.keys());
  // "Family Room B at A" means the two distinct exact Family Room listings.
  // The second is looked up in DB; a fabricated counterpart is never returned.
  for(const title of named.keys()) {
    const words=title.split(" "),suffix=words.at(-1),root=words.slice(0,-1).join(" ");
    if(!root || !/^[a-z0-9]{1,3}$/.test(suffix) ||
      !/\b(?:room|cottage|shade|hut|pavilion|villa|area)\b/.test(root)) continue;
    const pair="(?:at|and|vs\\.?|versus|or|o|kaysa|to)";
    const right=new RegExp("\\b"+escapeRegExp(title)+"\\s+"+pair+
      "\\s+(?:room\\s+)?([a-z0-9]{1,3})\\b","i");
    const left=new RegExp("\\b([a-z0-9]{1,3})\\s+"+pair+
      "\\s+"+escapeRegExp(title)+"\\b","i");
    const other=q.match(right)?.[1] || q.match(left)?.[1];
    if(other && other!==suffix) targets.add(root+" "+other);
  }
  if(!targets.size)return null;
  const names=[...targets].sort((a,b)=>a.localeCompare(b));
  const rows=names.map(n=>rooms.find(r=>norm(r.room_name||r.name)===n)||null);
  return {
    names, rows:rows.filter(Boolean),
    missing:names.filter((_,i)=>!rows[i]),
    complete:names.length===2 && rows.every(Boolean),
    tooMany:names.length>2
  };
}
function number(value,zero=false) {
  if(value==null || String(value).trim()==="")return null;
  const n=Number(value);
  return Number.isFinite(n) && (zero?n>=0:n>0)?n:null;
}
function money(value) {
  return "₱"+value.toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
}
const LANG = {
  taglish: {
    title:"Ito po ang comparison based sa current resort listing:",
    same:"pareho", unknown:"hindi nakalista", one:"Aling isa pang accommodation po ang gusto niyong i-compare?",
    many:"Aling dalawang accommodation po ang gusto niyong i-compare?",
    missing:"Hindi ko po ma-verify sa current records ang parehong accommodation. Pa-confirm po sa Front Desk.",
    note:"Wala pang ibang confirmed difference sa records. Tingnan niyo po ang photos sa dalawang preview cards.",
    footer:"Hindi pa verified ang availability sa date/time na gusto niyo; check sa booking page.",
    labels:["Max capacity","Day Tour","Night","Extended","Free entrance","Amenities","Description"], pax:" guests"
  },
  tagalog: {
    title:"Ito po ang paghahambing ayon sa kasalukuyang talaan:",
    same:"pareho", unknown:"hindi nakatala", one:"Alin pa pong matutuluyan ang nais ninyong ihambing?",
    many:"Aling dalawang matutuluyan po ang nais ninyong ihambing?",
    missing:"Hindi pa po makumpirma ang parehong matutuluyan sa records. Pakitanong po sa Front Desk.",
    note:"Wala pang ibang kumpirmadong pagkakaiba sa talaan. Tingnan po ang mga larawan sa dalawang card.",
    footer:"Sa booking page pa po makukumpirma ang petsa at oras.", 
    labels:["Maximum na bisita","Day Tour","Night","Extended","Libreng entrance","Amenities","Paglalarawan"],pax:" bisita"
  },
  english: {
    title:"Here is the comparison from the current resort records:",
    same:"both",unknown:"not listed",one:"Which other accommodation would you like to compare?",
    many:"Which two accommodations would you like to compare?",
    missing:"I can't verify both accommodation records. Please check with Front Desk.",
    note:"No other differences are confirmed by the records. You can compare the photos in both cards.",
    footer:"Date/time availability is not yet confirmed; check the booking page.",
    labels:["Max capacity","Day Tour","Night","Extended","Free entrance","Amenities","Description"],pax:" guests"
  },
  bisaya: {
    title:"Mao ni ang kalainan base sa kasamtangang resort records:",
    same:"pareho",unknown:"wala nakalista",one:"Unsa pa nga accommodation ang gusto nimo ikompara?",
    many:"Unsang duha ka accommodation ang gusto nimo ikompara?",
    missing:"Dili pa makumpirma ang duha ka accommodation sa records. Palihog pangutana sa Front Desk.",
    note:"Wala pay lain nga kumpirmadong kalainan sa listing. Tan-awa ang photos sa duha ka cards.",
    footer:"I-check ang date ug slot availability sa booking page.",
    labels:["Maximum guests","Day Tour","Night","Extended","Free entrance","Amenities","Description"],pax:" guests"
  },
  spanish: {
    title:"Comparación según los registros actuales del resort:",
    same:"iguales",unknown:"sin datos",one:"¿Qué otro alojamiento deseas comparar?",
    many:"¿Qué dos alojamientos deseas comparar?",
    missing:"No puedo verificar ambos alojamientos. Consulta con recepción.",
    note:"No hay más diferencias confirmadas. Puedes comparar sus fotos en las dos tarjetas.",
    footer:"La disponibilidad se comprueba en la página de reservas.",
    labels:["Capacidad máxima","Día","Noche","Extendido","Entradas gratis","Servicios","Descripción"],pax:" personas"
  },
  mandarin: {
    title:"以下是根据度假村当前记录的住宿对比：",
    same:"相同",unknown:"未列出",one:"您还想比较哪间住宿？",
    many:"您要比较哪两间住宿？",
    missing:"记录中无法核实两间住宿，请联系前台确认。",
    note:"记录中没有确认其他差异，您可以比较下方两张卡片的照片。",
    footer:"具体日期和时段的可订情况请在预订页面确认。",
    labels:["最大入住人数","日间价格","夜间价格","延长价格","免费入场名额","设施","描述"],pax:"人"
  }
};
function comparisonReply(selection,language="taglish") {
  const t=LANG[language]||LANG.english;
  if(!selection || selection.names.length===1)return t.one;
  if(selection.tooMany)return t.many;
  if(!selection.complete)return t.missing;
  const [a,b]=selection.rows;
  const an=fact(a.room_name||a.name,80),bn=fact(b.room_name||b.name,80);
  const parts=[t.title, an+" vs "+bn], difference=[];
  function line(label,x,y,fmt=v=>String(v)) {
    if(x==null && y==null)return;
    if(x!=null && y!=null && x===y)parts.push("- "+label+": "+t.same+" ("+fmt(x)+")");
    else {
      if(x!=null && y!=null)difference.push(label);
      parts.push("- "+label+": "+an+" — "+(x==null?t.unknown:fmt(x))+
        "; "+bn+" — "+(y==null?t.unknown:fmt(y)));
    }
  }
  line(t.labels[0],number(a.capacity),number(b.capacity),n=>n+t.pax);
  line(t.labels[1],number(a.day_price),number(b.day_price),money);
  line(t.labels[2],number(a.overnight_price),number(b.overnight_price),money);
  line(t.labels[3],number(a.extended_price),number(b.extended_price),money);
  // "Available" in a listing is NOT a promise about any particular slot.
  const as=String(a.status||"").trim().toLowerCase(),
    bs=String(b.status||"").trim().toLowerCase();
  if(as && bs && (as!==bs || as!=="available"))
    line("Listing status",as,bs);
  const af=number(a.free_entrance_pax,true),bf=number(b.free_entrance_pax,true);
  if((af!=null && af>0)||(bf!=null && bf>0))line(t.labels[4],af,bf,n=>n+t.pax);
  const ap=listedAmenityParts(a).map(x=>fact(x,90)).filter(Boolean);
  const bp=listedAmenityParts(b).map(x=>fact(x,90)).filter(Boolean);
  const ka=ap.map(x=>norm(x)).sort().join("|");
  const kb=bp.map(x=>norm(x)).sort().join("|");
  if(ap.length||bp.length) {
    if(ap.length&&bp.length&&ka===kb)parts.push("- "+t.labels[5]+": "+t.same+" ("+ap.join(", ")+")");
    else {
      if(ap.length&&bp.length)difference.push(t.labels[5]);
      parts.push("- "+t.labels[5]+": "+an+" — "+(ap.join(", ")||t.unknown)+
        "; "+bn+" — "+(bp.join(", ")||t.unknown));
    }
  }
  const da=fact(a.description),db=fact(b.description);
  if(da && db && norm(da)!==norm(db)) {
    difference.push(t.labels[6]);
    parts.push("- "+t.labels[6]+": "+an+" — "+da+"; "+bn+" — "+db);
  } else if(da && db)parts.push("- "+t.labels[6]+": "+t.same);
  if(!difference.length)parts.push(t.note);
  parts.push(t.footer);
  return parts.join("\n");
}
module.exports={isComparisonQuestion,selectComparisonRooms,comparisonReply};
