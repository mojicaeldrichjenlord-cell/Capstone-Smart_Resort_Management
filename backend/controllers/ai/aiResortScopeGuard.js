"use strict";
// AI-39: Both resort scope and the verified FAQ use the same operations intent.
const { isOpeningHoursInquiry } = require("./resortInquiryKnowledge");
/**
 * UI-36 — Only Arvic Seaside Resort guest-service inquiries reach Gemini.
 * All off-topic refusals are deterministic and cost ZERO API/DB calls.
 *
 * Intentional design: do not use a previous chat context by itself to approve
 * a new unrelated question. Only short, recognizably elliptical follow-ups
 * may inherit a real resort topic, and strong non-resort topic shifts still
 * win. This is a conservative gate, not a claim of 100% NLP understanding.
 */
const normalize = value => String(value || "").normalize("NFKC")
  .toLowerCase().replace(/[’‘]/g, "'").trim();

const RESORT_TOPICS = [
  // Resort identity, access, operations, contact and guest services.
  /\b(?:arvic|seaside|resort|hotel|front[\s-]?desk|reception|contact|hotline|makontak|manager|resort\s+staff)\b/i,
  /\b(?:parking|paradahan|mag[ -]?park|park(?:ing)?\s+(?:car|motor|van|bus))\b/i,
  /\b(?:address|location|directions?|how\s+(?:do\s+i|to)\s+get\s+there|operating\s+hours?|opening\s+hours?|open\s+(?:today|tomorrow|24|everyday)|hours?\s+(?:open|of operation)|nasaan|saan\s+(?:kayo|po\s+kayo)|bukas\s+ba\s+kayo)\b/i,
  /\b(?:pool|swimming|lifeguard|amenit(?:y|ies)|facilit(?:y|ies)|wifi|wi-fi|internet|pets?|dogs?|cats?|corkage|outside\s+food|pagkain|towels?|bathroom|restroom|shower|(?:private\s+)?cr|aircon|air[- ]?conditioning|refrigerator|kitchen|cabinet)\b/i,
  /\b(?:walk[\s-]?ins?|walk[\s-]?in\s+(?:guest|reservation|booking)|same[\s-]?day\s+booking)\b/i,
  // Booking and accommodation: avoid 'book' alone (a history book is unrelated).
  /\b(?:rooms?|kuwarto|kwarto|cottage|cottages|kubo|nipa|huts?|villas?|pavilions?|function\s+areas?|shades?|poolside|pool[\s-]?side|accommodations?|units?|beds?|queen\s+size|day\s*tour|overnight|night\s+(?:slot|tour|stay)|stay\s+(?:there|at|for|overnight)|check[\s-]?in|check[\s-]?out|reservations?|reserved|reserve|booking|booked|book\s+(?:a|the|this|that|my|your|online|now|for)|mag[\s-]?book|mag[\s-]?reserve|magpa[\s-]?reserve|magkano\s+(?:ang|yung|po\s+ang)\s+(?:room|kwarto|cottage|kubo))\b/i,
  /\b(?:guest(?:s)?|pax|capacity|vacanc(?:y|ies)|available|availability|rate(?:s)?\s+(?:of|for)\s+(?:a|the|rooms?|cottage)|entrance\s+fee|entrance\s+payment|down[\s-]?payment|deposit|paypal|cash\s+payment|payment|pay\s+(?:online|for|on|onsite)|refund|cancel(?:lation)?|discount|senior\s+citizen|pwd|additional\s+charges?|damages?|reschedule|slot(?:s)?)\b/i,
  /\b(?:bayad|babayaran|paunang\s+bayad|libre(?:ng)?\s+(?:parking|entrance|room|kubo)|pasok|pamasahe|sakay|schedule|iskedyul|presyo|mga\s+accommodation)\b/i,
  /\b(?:login|log[\s-]?in|register|registration|sign[\s-]?up|my\s+bookings|account|password|receipt|reference\s+(?:code|number)|booking\s+status)\b/i,
  /\b(?:can\s+i|how\s+(?:do\s+i|can\s+i|can\s+you\s+help\s+me)|may\s+i|could\s+i|where\s+can\s+i|paano\s+(?:po\s+)?(?:ako|kami))\s+(?:\w+\s+){0,4}book\b/i,
  /\b(?:may|meron|do\s+you\s+(?:have|serve)|is\s+there)\s+(?:\w+\s+){0,3}(?:food|foods|meals|kainan)\b/i,
  /\b(?:family\s+trip|family\s+outing|company\s+outing|team\s+building|day\s+trip|bakasyon|magbakasyon)\b/i,
  // The existing chat has multilingual customer conversations.
  /\b(?:habitación|habitaciones|alojamiento|reservar|reserva|reservación|pago|tarifa|piscina|estacionamiento|cabaña|cancelar\s+mi\s+reserva)\b/i,
  /(?:预订|预约|房间|客房|空房|度假村|酒店|入住|退房|退款|取消预订|停车|游泳池|住宿|房费|费用|价格|支付|付款|押金)/u,
  // Pinyin booking requests without a Chinese keyboard, not generic chit-chat.
  /\b(?:fangjian|yuding|jiudian|dujiacun|tingche|youyongchi|shoufei|jiage)\b/i,
  // Additional common, clearly resort-related guest questions in their
  // languages. Do not admit arbitrary foreign-language trivia or tasks.
  /(?:部屋|客室|予約|宿泊|料金|ホテル|リゾート|駐車場|プール)/u,
  /(?:객실|호텔|리조트|예약|숙박|요금|주차|수영장)/u,
  /(?:غرفة|حجز|فندق|منتجع|مسبح|موقف سيارات|أسعار)/u,
  /\b(?:chambre|chambres|réserver|réservation|hôtel|piscine|tarifs?|zimmer|buchung|übernachtung|preise?|schwimmbad)\b/iu,
];

const GREETING = /^(?:hi|hello|hey|hola|kumusta|kamusta|good\s+(?:morning|afternoon|evening)|magandang\s+(?:umaga|hapon|gabi)|你好|嗨|こんにちは|안녕하세요|bonjour|guten\s+tag|مرحبا|ni\s*hao(?:\s*ma)?|nihao|xie\s*xie|salamat|thank\s+you|thanks|gracias|谢谢|ok(?:ay)?|sige|opo|yes\s+po|no\s+po|bye|goodbye)[!?.\s😊👋]*$/iu;

// Unambiguous non-resort tasks should never be executed just because the
// user happened to mention the word "booking" or "resort" somewhere else.
const NON_RESORT_TASK = /\b(?:(?:write|create|generate|build)\s+(?:\w+\s+){0,4}(?:code|program|essay|poem|story|script)|write\s+(?:me\s+)?(?:a\s+)?(?:code|program|essay|poem|story|song|script)|(?:solve|calculate)\s+(?:this|the|my|an?|equation|math)|homework|quiz\s+(?:answers?|questions?)|who\s+(?:is|was)\s+(?:andres|jose|bonifacio|rizal)|full\s+name\s+(?:ni|of)\s+(?:jose|andres|bonifacio|rizal)|(?:capital|president)\s+of\s+(?:the\s+)?(?:philippines|japan|usa)|(?:recipe|luto)\s+(?:ng|for)|(?:weather\s+forecast|stock\s+price|bitcoin|nba|valorant))\b|(?:\b(?:bonifacio|rizal)\b.*\b(?:full\s+name|buong\s+pangalan)\b)|(?:\b(?:full\s+name|buong\s+pangalan)\b.*\b(?:bonifacio|rizal)\b)/iu;

// An explicit unrelated person/topic wins over stale saved room/guest context.
// If guests explicitly ask about a resort facility named after someone, the
// actual accommodation term makes the question eligible for fresh verification.
const HISTORICAL_PERSON = /\b(?:andres\s+bonifacio|jose\s+(?:protacio\s+)?rizal|si\s+(?:jose\s+)?rizal|si\s+(?:andres\s+)?bonifacio)\b/iu;
const CURRENT_ACCOMMODATION_REFERENCE = /\b(?:room|cottage|accommodation|resort|hotel|booking|reserv(?:e|ation)|kwarto|kuwarto|kubo)\b/iu;

// Short follow-up syntax only. No arbitrary pronouns or every message with
// "po" are allowed to inherit old rooms: "si Jose Rizal" stays off-topic.
const FOLLOW_UP = /^(?:(?:ano|anong|how|what|which|can|may|meron|pwede|puwede|is|are|does|do|and|paano|pero|what\s+about|how\s+about|what's|magkano|ilan|ilang|kasya|available|libre|day\s*tour|overnight|night|gabi|umaga|for|para\s+sa)\b[\s\S]{0,105}|(?:\d{1,3})\s*(?:kami|po|pax|guests?|tao|people|persons?)\s*[?.!]?|(?:yes|oo|opo|sige)\s*[?.!]?)$/iu;
const FOLLOW_UP_REFERENCE = /\b(?:yan|iyan|iyon|yun|yung|ito|nito|niyan|siya|sya|nya|those|these|that|this|there|it|its|them|they|one|ones|same|much|price|rate|cost|how\s+many|how\s+much|remaining|balance|total|still|ulit|naman|pa|ba|po|para|for|kami|guests?|pax|tao|people|available|day\s*tour|overnight|gabi|umaga|bukas|tomorrow|next\s+week|weekend|may|meron|pwede|puwede|paano|why|bakit|more|details|preview|photos?|pictures?|cr|aircon|magkano|ilan|ilang|kasya)\b/iu;

function hasResortTopic(message) {
  const text = normalize(message);
  return RESORT_TOPICS.some(regex => regex.test(text));
}

function isRecognizedResortFollowUp(message, context = {}, recentTurns = []) {
  const text = normalize(message);
  if (text.length < 1 || text.length > 135 ||
      !FOLLOW_UP.test(text) || !FOLLOW_UP_REFERENCE.test(text)) return false;
  const focused = Number(context?.room_id) > 0 ||
    Boolean(String(context?.room_name || "").trim());
  // Only recent USER messages supply a prior topic, not untrusted assistant
  // text supplied in the request. Look only at the two latest user turns.
  const previous = Array.isArray(recentTurns) ? recentTurns
    .filter(t => t?.role === "user" && typeof t?.text === "string")
    .slice(-2) : [];
  return focused || previous.some(t => hasResortTopic(t.text));
}

function isResortQuestion(message, context = {}, recentTurns = []) {
  const text = normalize(message);
  if (!text) return false;
  if (NON_RESORT_TASK.test(text)) return false;
  if (HISTORICAL_PERSON.test(text) && !CURRENT_ACCOMMODATION_REFERENCE.test(text))
    return false;
  if (GREETING.test(text)) return true;
  // Common phrasing like "tuwing kelan po kayo open?" is resort-related,
  // even if the visitor did not explicitly say "resort" or "hours".
  if (isOpeningHoursInquiry(text)) return true;
  if (hasResortTopic(text)) return true;
  return isRecognizedResortFollowUp(text, context, recentTurns);
}

function resortOnlyReply(language = "taglish") {
  switch (language) {
    case "mandarin": return "我主要回答 Arvic Seaside Resort 的住宿、预订、设施和度假村政策相关问题。您想了解哪方面呢？";
    case "spanish": return "Puedo ayudarte con habitaciones, reservas, servicios y políticas de Arvic Seaside Resort. ¿Qué necesitas saber del resort?";
    case "tagalog": return "Tungkol lang po sa Arvic Seaside Resort ang masasagot ko—mga kuwarto, booking, amenities at policies. Ano po ang gusto ninyong malaman?";
    case "japanese": return "Arvic Seaside Resort の客室、予約、設備やルールについてご案内できます。何をお知りになりたいですか？";
    case "korean": return "Arvic Seaside Resort의 객실, 예약, 시설 및 이용 규정에 대해 안내해 드릴 수 있습니다. 무엇이 궁금하신가요?";
    case "french": return "Je peux vous renseigner sur les chambres, réservations et services d'Arvic Seaside Resort. Que souhaitez-vous savoir ?";
    case "german": return "Ich helfe gern bei Fragen zu Zimmern, Buchungen und Einrichtungen im Arvic Seaside Resort. Was möchten Sie wissen?";
    case "arabic": return "يمكنني مساعدتك في الاستفسارات عن غرف ومنشآت وحجوزات منتجع Arvic Seaside Resort. ما الذي تود معرفته؟";
    case "english": return "I can help with Arvic Seaside Resort rooms, bookings, amenities and policies. What would you like to know about the resort?";
    default: return "Resort inquiries lang po ang masasagot ko—rooms, bookings, amenities at policies ng Arvic Seaside. Ano po ang gusto niyong malaman?";
  }
}

module.exports = {
  hasResortTopic, isResortQuestion, isRecognizedResortFollowUp,
  resortOnlyReply,
};
