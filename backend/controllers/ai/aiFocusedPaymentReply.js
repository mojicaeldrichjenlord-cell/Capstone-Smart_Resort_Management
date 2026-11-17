"use strict";

// Payment questions are NOT accommodation searches. Resolve all prices from
// fresh DB rows; never compute a payable total from prior chat or photo cards.
const norm = value => String(value || "").normalize("NFKC")
  .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function isRoomPaymentInquiry(message) {
  const text = String(message || "");
  if (!text.trim()) return false;
  const isPayment = /\b(?:payments?|pay(?:ing)?|paypal|down[\s-]?payment|deposits?|balance|total|amount|cost|prices?|rates?|presyo|magkano|babayaran|bayaran|magbayad|ibabayad|bayad)\b/i.test(text);
  if (!isPayment) return false;
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

function getPaymentStayKind(message, context = {}) {
  const text = norm(message);
  if (/\b(?:22 hours?|23 hours?|extended|multi day|multi night|several nights?)\b/.test(text) ||
      /\b(?:[2-9]|[1-9][0-9]+)\s*(?:nights?|days?|gabi|araw)\b/.test(text)) return null;
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

function paymentReply(message, context, room, language = "taglish") {
  const filipino = language === "tagalog" || language === "taglish";
  const stay = getPaymentStayKind(message, context);
  const field = stay === "overnight" ? room?.overnight_price :
    stay === "day" ? room?.day_price : null;
  const amount = validRate(field);
  const name = room && String(room.room_name || room.name || "").trim();
  let rateLine;
  if (room && stay && amount !== null) {
    rateLine = filipino
      ? "Para po sa " + name + ", ang listed " + (stay === "overnight" ? "overnight" : "day tour") +
        " rate para sa isang standard slot ay " + peso(amount) +
        ". Estimated 50% downpayment: " + peso(amount * 0.5) + "."
      : "For " + name + ", the listed " + (stay === "overnight" ? "overnight" : "day-tour") +
        " rate for one standard slot is " + peso(amount) +
        ". Estimated 50% downpayment: " + peso(amount * 0.5) + ".";
  } else if (room) {
    rateLine = filipino
      ? "Para po sa " + name + ", kailangan munang i-confirm ang exact stay type para ma-compute ang applicable accommodation rate."
      : "For " + name + ", please confirm the stay type so I can estimate the applicable accommodation rate.";
  } else {
    rateLine = filipino
      ? "Aling accommodation po ang balak ninyong i-book? Para mabigyan ko kayo ng tamang estimated amount."
      : "Which accommodation are you considering? I can help estimate the amount from its listed rate.";
  }
  const paymentLine = filipino
    ? "Sa kasalukuyang online checkout, PayPal ang ginagamit sa 50% accommodation downpayment. Sa resort babayaran ang natitirang accommodation balance, entrance fees, at applicable charges."
    : "The current online checkout uses PayPal for the 50% accommodation downpayment. The remaining accommodation balance, entrance fees, and applicable charges are paid at the resort.";
  const disclaimer = filipino
    ? "Estimate lang po ito; hindi pa verified ang petsa, booking slot, o final total. Ang booking/payment page ang magko-confirm ng babayaran."
    : "This is only an estimate: the date, slot and final total have not been verified. The booking/payment page confirms the amount.";
  return [rateLine, paymentLine, disclaimer].join(" ");
}

module.exports = {
  isRoomPaymentInquiry, resolvePaymentRoom, getPaymentStayKind,
  paymentReply, validRate,
};
