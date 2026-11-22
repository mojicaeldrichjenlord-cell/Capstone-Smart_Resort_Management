"use strict";
/*
 * AI-47 | Source-of-truth response safeguards.
 * These helpers are pure: no API calls, database writes, credentials or billing.
 * Admin-managed accommodation prices and the verified resort policy knowledge
 * are the only sources for factual monetary claims; never trust conversation
 * history as rate evidence. The secure booking/payment page remains final.
 */
const UNKNOWN_REPLIES = Object.freeze({
  english: "Sorry, that information isn't confirmed in our current resort records. Would you like the Front Desk contact details?",
  tagalog: "Pasensya na po, wala pang kumpirmadong detalye tungkol diyan sa kasalukuyang records ng resort. Gusto po ba ninyo ang contact details ng Front Desk?",
  taglish: "Pasensya na po, hindi pa confirmed sa current resort records yung information na 'yan. Gusto niyo po ba ng Front Desk contact details?",
  bisaya: "Pasayloa ko, wala pa na nakumpirma sa kasamtangang records sa resort. Gusto nimo nga ihatag nako ang contact details sa Front Desk?",
  spanish: "Lo siento, esa información no está confirmada en los registros actuales del resort. ¿Quieres los datos de contacto de recepción?",
  mandarin: "抱歉，度假村目前的记录中没有已核实的相关信息。您需要前台的联系方式吗？",
  japanese: "申し訳ありません。その情報は現在のリゾートの記録では確認できません。フロントの連絡先をご案内しましょうか？",
  korean: "죄송합니다. 현재 리조트 기록에서 해당 정보를 확인할 수 없습니다. 프런트 데스크 연락처를 알려드릴까요?",
  french: "Désolé, cette information n'est pas confirmée dans les dossiers actuels du complexe. Souhaitez-vous les coordonnées de la réception ?",
  german: "Entschuldigung, diese Information ist in unseren aktuellen Resort-Unterlagen nicht bestätigt. Möchten Sie die Kontaktdaten der Rezeption?",
  arabic: "عذرًا، هذه المعلومة غير مؤكدة في سجلات المنتجع الحالية. هل ترغب في معلومات التواصل مع الاستقبال؟",
});


// A genuinely underspecified resort inquiry deserves ONE simple follow-up,
// rather than a guess, a scripted multi-question form or an off-topic refusal.
// No model tokens or database queries are needed for these bare prompts.
function clarifyAmbiguousResortQuestion(message, language = "english") {
  const text = String(message || "").normalize("NFKC").trim().toLowerCase()
    .replace(/[?!。！？.,]+$/gu, "").trim();
  const price = /^(?:magkano|hm|how\s+much|what(?:'s|\s+is)\s+(?:the\s+)?price|price|presyo|tagpila|pila\s+(?:ang\s+)?presyo)(?:\s+po|\s+please|\s+pls)?$/iu.test(text);
  const suggestion = /^(?:ano(?:ng)?\s+ma-?suggest\s+mo|ano\s+ma-?recommend\s+mo|what\s+do\s+you\s+recommend|any\s+recommendation|recommend\s+something|suggest\s+something|unsa\s+imong\s+ma-?recommend)(?:\s+po|\s+please|\s+pls)?$/iu.test(text);
  if (!price && !suggestion) return null;
  const replies = suggestion ? {
    english: "Sure! How many guests are you booking for?",
    tagalog: "Sige po! Ilan po kayong bisita?",
    taglish: "Sure po! Ilan po kayong guests?",
    bisaya: "Sige! Pila mo kabuok nga guests?",
    spanish: "¡Claro! ¿Para cuántas personas buscas alojamiento?",
    mandarin: "当然可以！请问有几位客人？",
  } : {
    english: "Which accommodation would you like the rate for?",
    tagalog: "Aling accommodation po ang gusto ninyong malaman ang presyo?",
    taglish: "Aling room o cottage po ang gusto niyong malaman ang rate?",
    bisaya: "Unsang kwarto o cottage ang gusto ninyong pangutan-on og presyo?",
    spanish: "¿De qué alojamiento quieres saber el precio?",
    mandarin: "您想了解哪间客房或哪种住宿的价格？",
  };
  return replies[language] || replies.english;
}

function unknownRecordReply(language = "english") {
  return UNKNOWN_REPLIES[language] || UNKNOWN_REPLIES.english;
}

// Only one clearly unknown resort service. Multi-topic questions must be
// answered with verified facts PLUS an explicit unknown qualifier by Gemini.
function matchUnverifiedServiceQuestion(message) {
  const text = String(message || "").normalize("NFKC").trim().toLowerCase();
  if (!text || text.length > 240) return null;
  const topics = [
    ["promotions", /\b(?:promos?|promo\s+codes?|vouchers?|coupons?|special\s+offers?|discount\s+codes?|promociones?|descuentos?|promosyon)\b/i],
    ["transport", /\b(?:shuttle|airport\s+transfer|pick[\s-]?up\s+service|sund[oô]|hatid\s+service|van\s+transfer|transporte\s+gratuito)\b/i],
    ["recreation", /\b(?:kayaks?|jet\s+skis?|boat\s+rentals?|parasailing|banana\s+boat|scuba\s+diving)\b/i],
    ["other", /\b(?:lifeguards?|security\s+guards?|cctv\s+coverage|wheelchair\s+accessibility|ev\s+chargers?|pet\s+deposits?)\b/i],
  ].filter(([,re]) => re.test(text));
  if (topics.length !== 1) return null;
  // Don't intercept a question with a separate clearly verified topic.
  if (/\b(?:rates?\s+for\s+(?:rooms?|cottages?)|room\s+price|free\s+parking|paypal|downpayment|check[\s-]?in|check[\s-]?out|booking\s+status|refund)\b/i.test(text)) return null;
  return topics[0][0];
}

// Verify any literal PHP currency claims against current DB numeric rates.
// We do NOT validate currency against previous turns, guesses, user budget or
// model-generated examples. Other, non-currency facts remain governed by the
// strict evidence-only prompt and deterministic FAQ/DB fast paths.
function extractPesoAmounts(text) {
  const values = [];
  const raw = String(text || "");
  const regex = /(?:₱\s*|\bPHP\s+)([\d,]+(?:\.\d{1,2})?)/gi;
  for (const m of raw.matchAll(regex)) {
    const value = Number(m[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value >= 0) values.push(value);
  }
  return values;
}

function verifiedMoneyAmounts(records = [], approvedPolicyText = "") {
  const amounts = new Set(extractPesoAmounts(approvedPolicyText).map(n => n.toFixed(2)));
  const keys = ["day_price", "overnight_price", "extended_price",
    "accommodation_total", "total_price", "total_amount",
    "required_downpayment", "paid_amount", "remaining_balance"];
  for (const record of records.filter(Boolean)) {
    for (const key of keys) {
      const raw = record[key];
      if (raw == null || String(raw).trim() === "") continue;
      const amount = Number(raw);
      if (!Number.isFinite(amount) || amount <= 0) continue;
      amounts.add(amount.toFixed(2));
      amounts.add((Math.round(amount * 50) / 100).toFixed(2)); // 50% deposit
    }
  }
  return amounts;
}

function guardUnsupportedPesoClaims(reply, { language = "english", records = [], policyText = "" } = {}) {
  const text = String(reply || "").trim();
  if (!text) return unknownRecordReply(language);
  const amounts = extractPesoAmounts(text);
  if (!amounts.length) return text;
  const verified = verifiedMoneyAmounts(records, policyText);
  if (amounts.some(n => !verified.has(n.toFixed(2)))) {
    return unknownRecordReply(language);
  }
  return text;
}

module.exports = {
  unknownRecordReply, clarifyAmbiguousResortQuestion, matchUnverifiedServiceQuestion, extractPesoAmounts,
  verifiedMoneyAmounts, guardUnsupportedPesoClaims,
};
