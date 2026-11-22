"use strict";
/*
 * AI-63: Cross-reference multiple confirmed resort facts in ONE natural
 * response. A guest can ask about food, personal videoke and in-room Wi-Fi
 * while discussing an overnight group stay. Do not replace all policy
 * answers with a single room preview. Use ONLY approved knowledge helpers
 * and a fresh DB listing for an optional previously-selected room card.
 * No pricing, availability assertions, booking writes or Gemini calls.
 */
const {
  verifiedGuestAmenitiesReply, verifiedLeisurePoliciesReply,
} = require("./resortInquiryKnowledge");
const { explicitGuestCount } = require("./aiRecommendationIntake");
const { isPlainCottageCategory, isFunctionAreaCategory } =
  require("./aiAccommodationCategoryPolicy");

// This handler is intentionally narrow: mixed policies with unsupported
// requests (rates, booking dates, specific equipment inclusions) continue
// through the usual data-aware/grounded controller flow instead.
const UNHANDLED_FACTS = /\b(?:magkano|how\s+much|prices?|rates?|₱|php|downpayment|deposit|paypal|refund|cancel(?:lation)?|check[\s-]?in|check[\s-]?out|date\s+availability|available\s+on|availability|vacan(?:t|cy)|slot|tomorrow|bukas|next\s+week|book\s+(?:us|this)|mag[\s-]?book|mag[\s-]?reserve|reservation|reserve|kitchen|private\s+cr|bathroom|toilet|aircon|refrigerator|fridge|discount|entrance\s+fee|lifeguard|pool\s+depth)\b|\b\d{4}-\d{1,2}-\d{1,2}\b/i;
const PROVIDES_EQUIPMENT = /\b(?:does?\s+(?:the\s+)?(?:room|cottage)\s+(?:have|include)|do\s+you\s+(?:provide|have)|are\s+there\s+(?:any\s+)?speakers?|may\s+(?:ba\s+)?(?:videoke|karaoke|speaker)\s+(?:sa|ang|included)|kasama\s+(?:ba\s+)?(?:videoke|karaoke|speaker)|is\s+(?:videoke|karaoke|speaker)\s+included)\b/i;
const RETAIL_ALCOHOL = /\b(?:sell|selling|sold|serve|serving|buy|purchase|for\s+sale|magbenta|nagbebenta|tinda|do\s+you\s+have\s+(?:beer|alcohol|wine))\b/i;

function compoundTopics(message) {
  const q=String(message || "").normalize("NFKC").trim().toLowerCase();
  if (!q || q.length>850 || UNHANDLED_FACTS.test(q)) return null;
  const bring = /\b(?:mag[\s-]?dala|magdadala|dalhin|dala|baon|bring(?:ing)?|own|sariling|kaugalingong|puwede|pwede|allowed|permit)\b/i.test(q);
  const food = bring && /\b(?:food|pagkain|snacks?|baon|inumin|drinks?|beverages?)\b/i.test(q);
  const corkage = food && /\b(?:corkage|charge|fees?|libre|free)\b/i.test(q);
  const wifi = /\b(?:wi[\s-]?fi|wireless\s+internet|internet\s+(?:access|connection|signal))\b/i.test(q);
  const wifiDetails = wifi && /\b(?:password|mbps|speed|signal\s+strength|fast|reliable)\b/i.test(q);
  const pool = /\b(?:swimming\s+pool|swim(?:ming)?|pool(?![\s-]?(?:shade|side|pavilion))|palanguyan)\b/i.test(q);
  const parking = /\b(?:parking|paradahan|parking\s+lot)\b/i.test(q);
  const pets = /\b(?:pets?|dogs?|cats?|animals?|aso|pusa|hayop)\b/i.test(q);
  const alcohol = bring && /\b(?:alcohol(?:ic)?|beer|liquor|wine|alak)\b/i.test(q);
  const smoking = /\b(?:smok(?:e|ing)|vapes?|vaping|yosi|sigarilyo)\b/i.test(q);
  const audioWord = /\b(?:videoke|karaoke|mag[\s-]?videoke|mag[\s-]?karaoke|speakers?|bluetooth\s+speaker|sound\s+system)\b/i.test(q);
  const audio = audioWord && bring && !PROVIDES_EQUIPMENT.test(q);
  // Don't treat an asked-for resort service as permission to bring it.
  if ((audioWord && !audio) || (alcohol && RETAIL_ALCOHOL.test(q))) return null;
  const count=[food,wifi,pool,parking,pets,alcohol,smoking,audio].filter(Boolean).length;
  return count>=2 ? {food,corkage,wifi,wifiDetails,pool,parking,pets,alcohol,smoking,audio} : null;
}
const WORDS={
  english:{
    candidate:(name,guests,cap)=>"For your "+guests+" guests, "+name+" has a listed capacity of "+cap+". You can review its details below; overnight date/slot availability is checked on the booking page.",
    insufficient:(name,guests,cap)=>name+" lists a capacity of "+cap+" guests, below your group of "+guests+". Please compare other options on the booking page.",
    options:guests=>"For "+guests+" guests, I can also show suitable room options if you'd like.",
  },
  taglish:{
    candidate:(name,guests,cap)=>"For "+guests+" guests po, listed capacity ng "+name+" ay "+cap+". Puwede niyo itong i-preview below; check pa rin ang overnight date at slot sa booking page.",
    insufficient:(name,guests,cap)=>"Listed capacity ng "+name+" ay "+cap+" guests, below sa "+guests+" ninyo. Puwede tayong tumingin ng ibang options.",
    options:guests=>"For "+guests+" guests po, puwede rin akong magpakita ng suitable rooms kung gusto ninyo.",
  },
  tagalog:{
    candidate:(name,guests,cap)=>"Para po sa "+guests+" bisita, nakatalang kapasidad ng "+name+" ang "+cap+". Maaari ninyong tingnan ang detalye sa ibaba; sa booking page pa kukumpirmahin ang petsa at slot.",
    insufficient:(name,guests,cap)=>"Ang nakatalang kapasidad ng "+name+" ay "+cap+" bisita, mas mababa sa bilang ninyong "+guests+". Maaari tayong tumingin ng ibang pagpipilian.",
    options:guests=>"Para po sa "+guests+" bisita, maaari rin akong magpakita ng angkop na kuwarto kung nais ninyo.",
  },
  bisaya:{
    candidate:(name,guests,cap)=>"Para sa "+guests+" ka bisita, ang nakalistang kapasidad sa "+name+" kay "+cap+". Tan-awa ang preview; sa booking page pa makumpirma ang overnight slot.",
    insufficient:(name,guests,cap)=>"Ang kapasidad sa "+name+" kay "+cap+" lang, ubos sa "+guests+" ka bisita. Mangita ta og lain nga option.",
    options:guests=>"Para sa "+guests+" ka bisita, pwede ko ipakita ang angay nga mga kwarto.",
  },
  spanish:{
    candidate:(name,guests,cap)=>"Para "+guests+" huéspedes, "+name+" tiene capacidad indicada para "+cap+". Consulta la ficha; confirma las fechas y el turno nocturno al reservar.",
    insufficient:(name,guests,cap)=>name+" tiene capacidad indicada para "+cap+", menos de "+guests+". Consulta otras opciones.",
    options:guests=>"También puedo mostrar habitaciones para "+guests+" huéspedes.",
  },
  mandarin:{
    candidate:(name,guests,cap)=>name+" 的标示容量为 "+cap+" 人，适合了解 "+guests+" 人的入住需求。请在预订页面核实夜间日期和时段。",
    insufficient:(name,guests,cap)=>name+" 标示容量只有 "+cap+" 人，少于 "+guests+" 人。请考虑其他客房。",
    options:guests=>"我也可以展示适合 "+guests+" 人的客房选项。",
  },
};

// AI-64: In mixed amenity/policy messages, do NOT use the single-intent
// recommendation guard: it deliberately rejects Wi-Fi and other detail words.
// A customer can ask for a room AND for Wi-Fi in the same message.
function asksForAccommodationRecommendation(message) {
  const q = String(message || "").normalize("NFKC").toLowerCase();
  const target = /\b(?:rooms?|kwarto|kuwarto|cottages?|accommodations?|pavilions?|function\s+areas?)\b/i.test(q);
  const request = /\b(?:recommend(?:ations?|ed)?|suggest(?:ions?|ed)?|marerecommend|marecommend|mare-recommend|ma-recommend|mairerecommend|irerecommend|masuggest|massuggest|masusuggest|ma-suggest)\b/i.test(q);
  return q.length <= 850 && target && request;
}

const COMPOUND_RECOMMENDATION = {
  english: {
    noMatch: n => "I couldn't find a listed room with enough capacity for " + n +
      " guests. We can check another accommodation type.",
    askGuests: "How many guests will be staying?",
  },
  taglish: {
    noMatch: n => "Wala po akong makitang listed room na kasya sa " + n +
      " guests. Puwede nating tingnan ang ibang accommodation type.",
    askGuests: "Ilan po kayong guests?",
  },
  tagalog: {
    noMatch: n => "Wala po akong makitang nakalistang kuwarto para sa " + n +
      " bisita. Maaari tayong tumingin ng ibang uri ng accommodation.",
    askGuests: "Ilan po kayong bisita?",
  },
  bisaya: {
    noMatch: n => "Wala koy nakitang nalistang kwarto nga igo sa " + n +
      " ka bisita. Mangita ta og lain nga klase sa accommodation.",
    askGuests: "Pila mo kabuok?",
  },
  spanish: {
    noMatch: n => "No encontré una habitación registrada con capacidad para " +
      n + " huéspedes. Podemos revisar otro tipo de alojamiento.",
    askGuests: "¿Cuántos huéspedes serán?",
  },
  mandarin: {
    noMatch: n => "暂未找到标示容量满足 " + n + " 人的客房，可查看其他住宿类型。",
    askGuests: "请问有几位客人？",
  },
};

// A room picked by the customer (or explicitly named this turn) is eligible
// only after a fresh catalog lookup. Never assert a live available date.
function compoundRoom(catalog,message,context={}) {
  const rows=Array.isArray(catalog)?catalog:[];
  const norm=x=>String(x||"").normalize("NFKC").toLowerCase()
    .replace(/[^a-z0-9]+/g," ").trim();
  const q=" "+norm(message)+" ";
  const named=rows.filter(r=>{
    const name=norm(r.room_name||r.name);
    return name.length>=6&&q.includes(" "+name+" ");
  });
  if(named.length>1)return null;
  if(named.length===1)return named[0];
  const id=Number(context?.room_id),name=norm(context?.room_name);
  if(!Number.isSafeInteger(id)||id<1||!name)return null;
  return rows.find(r=>Number(r.id)===id &&
    norm(r.room_name||r.name)===name)||null;
}

function compoundGuestReply(topics,message,context={},language="taglish",room=null,recommendationRequested=false) {
  if(!topics)return null;
  const locale=WORDS[language]?language:"english";
  const parts=[];
  // Keep each assertion grounded in the SAME centrally maintained verified
  // policy source; no duplicated made-up facts or fees.
  if(topics.food) parts.push(verifiedGuestAmenitiesReply({
    food:true,corkage:topics.corkage,
  },locale));
  if(topics.alcohol||topics.smoking||topics.audio)parts.push(
    verifiedLeisurePoliciesReply({
      alcohol:topics.alcohol,smoking:topics.smoking,audio:topics.audio,
    },locale));
  if(topics.wifi)parts.push(verifiedGuestAmenitiesReply({
    wifi:true,wifiDetail:topics.wifiDetails,
    rooms:true,cottage:Boolean(room &&
      (isPlainCottageCategory(room) || isFunctionAreaCategory(room))),
  },locale));
  if(topics.pool||topics.parking||topics.pets)parts.push(
    verifiedGuestAmenitiesReply({
      pool:topics.pool,parking:topics.parking,pets:topics.pets,
    },locale));
  const guests=explicitGuestCount(message);
  let validRoom=null;
  let explainsInsufficientCapacity=false;
  if(guests&&room){
    const cap=Number(room.capacity);
    const listed=String(room.status||"").trim().toLowerCase()==="available";
    const name=String(room.room_name||room.name||"").trim().slice(0,100);
    if(listed&&Number.isFinite(cap)&&cap>0) {
      if(cap>=guests) {
        validRoom=room;
        parts.push(WORDS[locale].candidate(name,guests,cap));
      }else{
        explainsInsufficientCapacity=true;
        parts.push(WORDS[locale].insufficient(name,guests,cap));
      }
    }
  }
  if(recommendationRequested && !guests){
    parts.push(COMPOUND_RECOMMENDATION[locale].askGuests);
  }else if(recommendationRequested && !validRoom && !explainsInsufficientCapacity){
    parts.push(COMPOUND_RECOMMENDATION[locale].noMatch(guests));
  }else if(!recommendationRequested && guests && !room){
    parts.push(WORDS[locale].options(guests));
  }
  return {reply:parts.filter(Boolean).join(" "),guests,previewRoom:validRoom};
}

module.exports={compoundTopics,compoundRoom,compoundGuestReply,asksForAccommodationRecommendation};
