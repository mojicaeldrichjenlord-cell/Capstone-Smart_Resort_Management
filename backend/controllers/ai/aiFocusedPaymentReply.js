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
      /\b(?:down[\s-]?payment|deposits?|balance|payments?|pay(?:ing)?|paypal|babayaran|bayaran|magbayad|ibabayad)\b/i.test(text)) {
    return false;
  }

  return /\b(?:offer|available|list|show|compare|options?|all|different|various|mga)\b/i.test(text) ||
    /\b(?:paano\s+mag[ -]?reserve|how\s+to\s+(?:reserve|book))\b/i.test(text) ||
    /\b(?:rooms?|accommodations?|cottages?|pavilions?|huts?|shades?)\s+(?:rates|prices|costs)\b/i.test(text);
}

function isRoomPaymentInquiry(message) {
  const text = String(message || "");
  if (!text.trim()) return false;
  const isPayment = /\b(?:payments?|pay(?:ing)?|paypal|down[\s-]?payment|deposits?|balance|total|amount|cost|prices?|rates?|presyo|magkano|babayaran|bayaran|magbayad|ibabayad|bayad)\b/i.test(text);
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
  const isListed = room && (!room.status ||
    String(room.status).toLowerCase().trim() === "available");
  // Casual, spoken-friendly Taglish. Keep all calculations exactly the
  // same as the other language paths and never imply a confirmed booking.
  if (language === "taglish") {
    let lead;
    if (room && !isListed) {
      lead = "Sorry po, hindi currently available sa listing yung " + name +
        ", kaya hindi pa tayo makakapagbigay ng booking estimate.";
    } else if (room && stay && amount !== null) {
      lead = "For " + name + " po, " + peso(amount) + " yung listed " +
        (stay === "overnight" ? "overnight" : "day tour") +
        " rate for one standard slot. Estimated 50% downpayment is " +
        peso(amount * 0.5) + " via PayPal, then " + peso(amount * 0.5) +
        " yung remaining room balance.";
    } else if (room) {
      lead = "For " + name + " po, day tour or overnight ba ang plan niyo? " +
        "Para tama yung rate na ma-estimate natin.";
    } else {
      lead = "Anong room po ang balak niyong i-book? " +
        "Para ma-check natin yung correct listed rate.";
    }
    const fees = "Separate pa po ang entrance fees and other charges na babayaran onsite.";
    const notice = "Final amount and slot availability sa booking page pa po mache-check.";
    return [lead, fees, notice].join(" ");
  }
  let rateLine;
  if (room && !isListed) {
    rateLine = filipino
      ? "Ang " + name + " po ay hindi kasalukuyang listed as available. Hindi muna ako magbibigay ng payable quote para rito."
      : name + " is not currently listed as available, so I cannot give a payable quote for it.";
  } else if (room && stay && amount !== null) {
    rateLine = filipino
      ? "Para po sa " + name + ", ang listed " + (stay === "overnight" ? "overnight" : "day tour") +
        " rate para sa isang standard slot ay " + peso(amount) +
        ". Estimated 50% downpayment: " + peso(amount * 0.5) +
        "; natitirang accommodation balance: " + peso(amount * 0.5) + "."
      : "For " + name + ", the listed " + (stay === "overnight" ? "overnight" : "day-tour") +
        " rate for one standard slot is " + peso(amount) +
        ". Estimated 50% downpayment: " + peso(amount * 0.5) +
        "; remaining accommodation balance: " + peso(amount * 0.5) + ".";
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
