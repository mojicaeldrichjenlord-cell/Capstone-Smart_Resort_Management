"use strict";

// Payment questions are NOT accommodation searches. Resolve all prices from
// fresh DB rows; never compute a payable total from prior chat or photo cards.
const norm = value => String(value || "").normalize("NFKC")
  .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Broad inventory/rate questions must use the fresh accommodation catalog,
// not a selected-room payment breakdown. This preserves comparisons and the
// exact Admin-managed rates in the AI prompt (without changing any payment).
function isGeneralInventoryRateQuestion(text) {
  const inventory = /\b(?:rooms?|accommodations?|cottages?|pavilions?|huts?|shades?|function\s+areas?|kwarto|kuwarto|kubo)\b/i.test(text);
  const pricing = /\b(?:rates?|prices?|costs?|presyo|magkano)\b/i.test(text);
  if (!inventory || !pricing) return false;

  // An explicitly selected room or actual payment/deposit question still
  // belongs to the focused read-only payment handler.
  if (/\b(?:family|single|double)\s+room\s+(?:[a-z]|\d+)\b|\bnipa\s+hut\s*\d+\b/i.test(text) ||
      /\b(?:down[\s-]?payment|deposits?|balance|payments?|pay(?:ing)?|paypal|babayaran|bayaran|magbayad|magbabayad|ibabayad)\b/i.test(text)) {
    return false;
  }

  return /\b(?:offer|available|list|show|compare|options?|all|different|various|mga)\b/i.test(text) ||
    /\b(?:paano\s+mag[ -]?reserve|how\s+to\s+(?:reserve|book))\b/i.test(text) ||
    /\b(?:rooms?|accommodations?|cottages?|pavilions?|huts?|shades?)\s+(?:rates|prices|costs)\b/i.test(text);
}

function isRoomPaymentInquiry(message) {
  const text = String(message || "");
  if (!text.trim()) return false;
  const isPayment = /\b(?:payments?|pay(?:ing)?|paypal|down[\s-]?payment|deposits?|balance|total|amount|cost|prices?|rates?|presyo|magkano|babayaran|bayaran|magbayad|magbabayad|ibabayad|bayad)\b/i.test(text);
  if (!isPayment) return false;
  if (isGeneralInventoryRateQuestion(text)) return false;
  // Resort-wide parking questions (including "magkano parking fee") are
  // not accommodation deposits/rates. Mixed room + parking inquiries must
  // use grounded resort + fresh room data, not the room-only payment reply.
  if (/\b(?:parking|park|paradahan|mag[ -]?park|car\s*park)\b/i.test(text)) return false;
  // Entrance-only fees are a separate policy, not an accommodation quote.
  if (/\bentrance\b/i.test(text) &&
      !/\b(?:down[\s-]?payment|payment|total|lahat|overall|babayaran|magbayad|balance|accommodation|room)\b/i.test(text)) return false;
  if (/\b(?:preview|picture|photo|larawan|litrato|itsura)\b/i.test(text) &&
      !/\b(?:payment|magkano|price|cost|pay)\b/i.test(text)) return false;
  return true;
}

function referencedRooms(catalog, text) {
  const query = " " + norm(text) + " ";
  return (Array.isArray(catalog) ? catalog : []).filter(room => {
    const name = norm(room.room_name || room.name);
    return name && query.includes(" " + name + " ");
  }).sort((a, b) => norm(b.room_name || b.name).length -
                     norm(a.room_name || a.name).length);
}

function resolvePaymentRoom(catalog, message, context = {}, recentTurns = []) {
  const rows = Array.isArray(catalog) ? catalog : [];
  const named = referencedRooms(rows, message);
  if (named.length) {
    const specific = named[0];
    const otherDistinct = named.some(room =>
      Number(room.id) !== Number(specific.id) &&
      !norm(specific.room_name || specific.name).includes(norm(room.room_name || room.name)));
    return otherDistinct ? null : specific;
  }
  const id = Number(context.room_id);
  const selectedName = norm(context.room_name);
  const byId = Number.isSafeInteger(id) && id > 0
    ? rows.find(room => Number(room.id) === id) : null;
  if (byId && (!selectedName || norm(byId.room_name || byId.name) === selectedName)) {
    return byId;
  }
  // Reject a stale ID if it now points at a different accommodation.
  if (byId && selectedName) return null;
  if (selectedName) {
    const exact = rows.filter(room => norm(room.room_name || room.name) === selectedName);
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) return null;
  }
  // Older sessions may have lost a selected ID. Use the most recent clearly
  // named USER question, not a potentially irrelevant assistant suggestion.
  for (const turn of (Array.isArray(recentTurns) ? recentTurns : [])
    .slice(-6).reverse()) {
    if (turn?.role !== "user") continue;
    const mentioned = referencedRooms(rows, turn.text);
    if (mentioned.length === 1) return mentioned[0];
    if (mentioned.length > 1) break;
  }
  return null;
}

// Detect extended and multi-night language before considering one-night rates.
// "one night" and "20 day tour" remain standard slot requests.
function isExtendedOrMultiDayStay(message) {
  const text = String(message || "").normalize("NFKC").toLowerCase();
  const extended = /\b(?:extended|extend(?:ed)?\s+stay|22\s*hours?|23\s*hours?|multi[\s-]?days?|multi[\s-]?nights?|several\s+(?:days?|nights?)|multiple\s+(?:days?|nights?)|maraming\s+(?:gabi|araw)|ilang\s+(?:gabi|araw)|magkasunod\s+na\s+(?:gabi|araw)|mahigit\s+(?:isang|isa)\s+(?:gabi|araw))\b/iu;
  if (extended.test(text)) return true;
  const number = "(?:[2-9]|\\d{2,}|two|three|four|five|six|seven|eight|nine|ten|dalawang?|tatlong?|tatlo|apat|limang?|anim(?:\\s+na)?|pitong?|walong?|siyam(?:\\s+na)?|sampung?|duha|tulo|upat|dos|tres|cuatro|cinco)";
  const unit = "(?:nights?|days?(?!\\s*tour\\b)|gabi|gabii|araw|noches?|d[ií]as?)";
  if (new RegExp("\\b" + number + "\\b\\s*(?:(?:na|ka|nang|mga)\\s+)?\\b" + unit + "\\b", "iu").test(text)) return true;
  // Chinese: 两晚, 二晚, 三天. 一晚 remains a one-night request.
  return /[两二三四五六七八九十]\s*(?:个\s*)?(?:晚(?:上)?|夜|天)/u.test(text);
}

function getPaymentStayKind(message, context = {}) {
  const text = norm(message);
  // "Small Nipa Hut 20 day tour" is a named room plus a Day Tour slot,
  // NOT a 20-day reservation. Still refuse multi-night price estimates.
  if (isExtendedOrMultiDayStay(message)) return null;
  const overnight = /\b(?:overnight|night|gabi)\b/.test(text);
  const daytime = /\b(?:day tour|daytime|morning|umaga)\b/.test(text);
  if (overnight && daytime) return null;
  if (overnight) return "overnight";
  if (daytime) return "day";
  const slot = norm(context.slot_preference);
  if (slot === "night") return "overnight";
  if (slot === "day tour") return "day";
  return null;
}

function validRate(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function peso(value) {
  return "₱" + Number(value).toLocaleString("en-PH", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

// AI-57: A guest asking whether full payment is required needs a concise,
// direct answer—not the complete reservation FAQ repeated verbatim.
// The monetary values still come from the fresh, verified DB record below.
function asksFullVsPartialPayment(message) {
  const text = String(message || "").normalize("NFKC");
  return /\b(?:full\s+(?:amount|payment|price)|pay\s+in\s+full|entire\s+(?:amount|payment)|pay\s+(?:it\s+)?all|pay\s+everything|pay\s+(?:just\s+|only\s+)?(?:part|half)|part\s+of\s+it|partial\s+payment|pay\s+(?:a\s+)?portion|half\s+first|balance\s+later|pay\s+everything\s+now|pay\s+upfront\s+in\s+full|kalahati\s+muna|buong\s+bayad|bayad\s+ng\s+buo|bayaran\s+(?:ang\s+)?lahat|pwede\s+bang\s+kalahati)\b/iu.test(text);
}

function paymentReply(message, context, room, language = "taglish") {
  const stay = getPaymentStayKind(message, context);
  // AI-54: The deposit on a single standard slot is determinable without
  // a Day/Night choice ONLY when BOTH live DB-listed rates are identical.
  // Extended/multi-day requests require their own verified stay breakdown.
  const nonStandard = isExtendedOrMultiDayStay(message);
  const day = validRate(room?.day_price);
  const night = validRate(room?.overnight_price);
  const equalStandardRates = !stay && !nonStandard && day !== null &&
    night !== null && Math.abs(day - night) < 0.005;
  const amount = nonStandard ? null : stay === "overnight" ? night :
    stay === "day" ? day : equalStandardRates ? day : null;
  const name = room && String(room.room_name || room.name || "").trim()
    .replace(/<[^>]*>/g," ").slice(0,100);
  const listed = !!room && (!room.status ||
    String(room.status).toLowerCase().trim() === "available");
  const verified = !!room && listed && amount !== null;
  const half = verified ? peso(amount * 0.5) : null;
  const rate = verified ? peso(amount) : null;

  // Multi-night bookings require 50% of the FINAL total for the whole stay.
  // Without a live checkout calculation, never reuse or multiply a one-slot
  // amount to invent the payable deposit.
  if (nonStandard && room && listed) {
    const answers = {
      english: "Not necessarily. For a multi-night stay at " + name +
        ", the downpayment is 50% of the final accommodation total for the whole stay—not the one-night estimate. Please check the booking page for the exact duration and total, plus available dates. Pay the deposit via PayPal; settle the balance and separate entrance fees at the resort.",
      tagalog: "Hindi po natin puwedeng ipagpalagay na pareho ang paunang bayad para sa isang gabi. Para sa maraming gabing pananatili sa " + name +
        ", ang paunang bayad ay 50% ng kabuuang pinal na presyo ng matutuluyan para sa buong pananatili. Sa booking page po muna makikita ang eksaktong halaga at availability. Sa PayPal babayaran ang paunang bayad; sa resort naman ang natitira at hiwalay na entrance fees.",
      taglish: "Hindi po automatic na same pa rin ang one-night downpayment. Para sa multi-night stay sa " + name +
        ", 50% ng final accommodation total para sa buong stay ang downpayment. Check po muna sa booking page ang exact duration at total, pati availability. Via PayPal ang downpayment; remaining balance at separate entrance fees ay onsite.",
      bisaya: "Dili automatic nga pareho gihapon ang downpayment sa usa ka gabii. Para sa daghang gabii sa " + name +
        ", 50% sa final accommodation total sa tibuok stay ang downpayment. I-check sa booking page ang exact total ug available dates. Bayri ang downpayment sa PayPal; ang nahibilin ug entrance fees sa resort.",
      spanish: "No necesariamente. Para varias noches en " + name +
        ", el anticipo es el 50 % del importe final del alojamiento para toda la estancia, no del precio de una sola noche. Confirma el total y las fechas disponibles en la página de reservas. El anticipo se paga con PayPal; el saldo y las entradas, en el resort.",
      mandarin: "不一定。" + name +
        " 的多晚住宿订金是整个入住期间最终住宿总价的50%，不是单晚的订金。请先在预订页面查看准确总价及可订日期。订金通过PayPal支付，剩余住宿费用及单独入场费在度假村支付。",
    };
    return answers[language] || answers.english;
  }

  // Answer the decision first. No rate is assumed when the room, slot or
  // special duration is unverified; those cases follow the safe existing flow.
  if (verified && asksFullVsPartialPayment(message)) {
    const line = {
      english: "No, you don't need to pay the full amount upfront. For " + name +
        ", the estimated deposit is " + half + " (50% of the listed " + rate +
        " one-slot rate). Pay through PayPal on the booking page; the remaining " +
        half + " and separate entrance fees are paid at the resort. The booking is confirmed after successful PayPal capture. Check the final amount and available slot before paying.",
      taglish: "Hindi po kailangang full payment agad. For " + name +
        ", estimated " + half + " muna (50% ng listed " + rate +
        " standard rate) via PayPal sa booking page. Yung remaining " +
        half + " at separate entrance fees ay sa resort na babayaran. Confirmed lang ang booking kapag successful ang PayPal capture; check muna ang final total at available slot.",
      tagalog: "Hindi po kailangang bayaran agad ang buong halaga. Para sa " + name +
        ", tinatayang " + half + " muna ang paunang bayad (50% ng nakatalang " + rate +
        " para sa isang slot) gamit ang PayPal sa booking page. Ang natitirang " +
        half + " at hiwalay na entrance fees ay babayaran sa resort. Makukumpirma ang booking matapos ang matagumpay na PayPal payment capture.",
      bisaya: "Dili kinahanglan bayran dayon ang tibuok kantidad. Sa " + name +
        ", ang estimated downpayment kay " + half + " (50% sa listed " + rate +
        " nga rate) pinaagi sa PayPal sa booking page. Ang nahibiling " +
        half + " ug entrance fees bayran sa resort. Makumpirma ang booking human sa successful PayPal capture.",
      spanish: "No es necesario pagar todo por adelantado. Para " + name +
        ", el anticipo estimado es " + half + " (50 % de la tarifa indicada de " +
        rate + ") por PayPal en la página de reservas. Los " + half +
        " restantes y la entrada se pagan en el resort. La reserva se confirma tras el cobro exitoso de PayPal.",
      mandarin: "不用提前支付全部金额。" + name + " 的预计订金为 " +
        half + "（挂牌标准时段价格 " + rate +
        " 的50%），请在预订页面通过 PayPal 支付。剩余住宿费 " + half +
        " 和单独的入场费在度假村支付。PayPal 成功扣款后预订才会确认。",
    }[language] || null;
    if (line) return line;
  }

  if (language === "bisaya") {
    const intro = !room ? "Unsang accommodation ang inyong plano i-book?" :
      !listed ? "Wala sa current available listing ang " + name + ", busa dili ko makahatag og booking estimate." :
      verified ? "Sa " + name + ", " + (equalStandardRates ? "pareho ang listed Day Tour ug Night rate nga " : "ang listed rate kay ") +
        rate + " alang sa usa ka standard slot. Ang estimated 50% downpayment kay " + half +
        "; ang nahibiling accommodation balance kay " + half + "." :
      nonStandard ? "Para sa extended o multi-day stay sa " + name +
        ", kinahanglan i-check ang eksaktong duration ug total sa booking page." :
        "Day Tour ba o Night slot ang gusto ninyo sa " + name + "? Lahi ang listed rates.";
    return intro + " Sa online booking/payment page magbayad pinaagi sa PayPal. Automatic ang confirmation human sa successful PayPal capture; dili na kinahanglan mag-upload og payment screenshot. Ang nahibiling accommodation balance ug lahing entrance fees bayran sa resort. Ang final amount ug availability i-check sa booking page.";
  }

  if (language === "spanish") {
    const intro = !room ? "¿Qué alojamiento deseas reservar?" :
      !listed ? name + " no figura como disponible en la lista actual, así que no puedo estimar la reserva." :
      verified ? "Para " + name + ", " + (equalStandardRates ? "las tarifas de día y noche son iguales: " : "la tarifa indicada es ") +
        rate + " por un turno estándar. El anticipo estimado del 50 % es " + half + " y el saldo del alojamiento es " + half + "." :
      nonStandard ? "Para una estancia extendida en " + name + ", confirma la duración y el precio total en la página de reservas." :
        "¿Prefieres el turno de día o de noche en " + name + "? Las tarifas son diferentes.";
    return intro + " Paga el anticipo en PayPal desde la página de reservas. La confirmación es automática tras el cobro exitoso; no hace falta subir un comprobante. El saldo del alojamiento y las entradas se pagan en el resort. Confirma el importe final y la disponibilidad antes de pagar.";
  }

  if (language === "mandarin") {
    const intro = !room ? "您准备预订哪间住宿？" :
      !listed ? name + " 目前未被标记为可预订房源，因此无法估算付款。" :
      verified ? name + " 的" + (equalStandardRates ? "日间与夜间挂牌价格相同，均为" : "当前挂牌价格为") +
        rate + "（一个标准时段）；预计 50% 订金为 " + half + "，剩余住宿费为 " + half + "。" :
      nonStandard ? "如需延长或多日入住，请在预订页面确认具体时长与费用。" :
        "您想选择 " + name + " 的日间还是夜间时段？目前两种价格不同。";
    return intro + " 在线预订付款页面通过 PayPal 支付订金；成功扣款后系统自动确认，无需上传付款截图。剩余住宿费和单独的入场费在度假村支付。最终金额及可用时段以预订页面为准。";
  }

  if (language === "taglish") {
    const intro = !room ? "Anong accommodation po ang balak niyong i-book?" :
      !listed ? "Hindi currently available sa listing ang " + name +
        ", kaya hindi pa ako makapagbigay ng payable estimate." :
      verified ? "For " + name + " po, " + (equalStandardRates
        ? "parehong " + rate + " ang listed Day Tour at Night rate"
        : rate + " ang listed " + (stay === "overnight" ? "Night" : "Day Tour") + " rate") +
        " for one standard slot. Estimated 50% downpayment: " + half +
        "; remaining accommodation balance: " + half + "." :
      nonStandard ? "Para sa extended o multi-day stay ng " + name +
        ", sa booking page pa natin mache-check ang exact duration at total." :
        "For " + name + " po, Day Tour or Night ba ang plan niyo? Magkaiba kasi ang listed rates.";
    return intro + " Sa online booking/payment page po magbabayad via PayPal. Automatic ang confirmation kapag successful ang payment capture—walang screenshot upload na kailangan. Yung remaining accommodation balance, separate entrance fees at applicable charges ay sa resort babayaran. " + (verified ? "Estimate ito for one standard slot; " : "") + "Final amount at slot availability sa booking page pa mache-check.";
  }

  if (language === "tagalog") {
    const intro = !room ? "Aling accommodation po ang balak ninyong i-book?" :
      !listed ? "Hindi po kasalukuyang available sa listing ang " + name + ", kaya hindi pa ako makapagbigay ng tantiya." :
      verified ? "Para po sa " + name + ", " + (equalStandardRates
        ? "parehong " + rate + " ang nakatalang Day Tour at Night na presyo"
        : rate + " ang nakatalang presyo sa " + (stay === "overnight" ? "gabi" : "araw")) +
        " para sa isang karaniwang slot. Tinatayang 50% na paunang bayad: " + half +
        "; natitirang bayad sa matutuluyan: " + half + "." :
      nonStandard ? "Para sa extended o maraming araw na pananatili sa " + name +
        ", sa booking page pa po kukumpirmahin ang tagal at kabuuang halaga." :
        "Day Tour po ba o Night slot ang pipiliin ninyo sa " + name + "? Magkaiba po ang nakatalang presyo.";
    return intro + " Sa online booking/payment page magbabayad gamit ang PayPal. Awtomatikong makukumpirma ang booking matapos ang matagumpay na payment capture; hindi na kailangang mag-upload ng resibo. Sa resort babayaran ang natitirang halaga at hiwalay na entrance fees. Ang pinal na presyo at availability ay sa booking page pa makukumpirma.";
  }

  const intro = !room ? "Which accommodation are you planning to book?" :
    !listed ? name + " is not currently listed as available, so I can't give a booking estimate." :
    verified ? "For " + name + ", " + (equalStandardRates
      ? "both the listed Day Tour and Night rate are " + rate
      : "the listed " + (stay === "overnight" ? "Night" : "Day Tour") + " rate is " + rate) +
      " for one standard slot. Estimated 50% downpayment: " + half +
      "; remaining accommodation balance: " + half + "." :
    nonStandard ? "For extended or multi-day stays at " + name +
      ", confirm the exact duration and total on the booking page." :
      "Would you prefer Day Tour or Night at " + name + "? The listed rates differ.";
  return intro + " Pay the online downpayment via PayPal on the booking/payment page. Successful PayPal capture automatically confirms the reservation; no screenshot upload is required. The remaining accommodation balance, separate entrance fees and applicable charges are paid at the resort. Final price and slot availability must be checked on the booking page.";
}

module.exports = {
  isRoomPaymentInquiry, resolvePaymentRoom, getPaymentStayKind,
  paymentReply, validRate, asksFullVsPartialPayment,
  isExtendedOrMultiDayStay,
};
