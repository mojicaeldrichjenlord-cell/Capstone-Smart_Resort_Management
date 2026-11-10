// STAGE 85-B: verified resort policy facts and conservative FAQ matching.
// These answers are intentionally data-independent, never booking confirmations.
// Based on current implemented policies. For customer-specific transactions,
// available room slots, refunds or prices, direct guests to authorized staff
// and the secure booking page; do NOT invent financial outcomes.
// Same official Facebook page linked from the signed-in Customer Home page.
// Keep this contact URL in sync with frontend/customerHTML/index.html.
const OFFICIAL_RESORT_FACEBOOK_URL = "https://www.facebook.com/share/1E1kZLtrV4/?mibextid=wwXIfr";

const POLICY_FACTS = Object.freeze({
  cancellation: "Customers may cancel their own pending/approved reservations in My Bookings at least one calendar day before check-in, provided they have not checked in. Front Desk handles checked-in reservations. Cancelling does not automatically reverse any payment.",
  refund: `Automated refunds and dispute decisions are outside the current system scope. Management handles refund requests manually and determines eligibility according to resort policy and verified payment records. Do not promise a refund or quote an amount. After explaining the manual process, suggest that the guest message the resort's official Facebook page for assistance: ${OFFICIAL_RESORT_FACEBOOK_URL}.`,
  entrance: "Entrance fees are separate from the 50% online accommodation downpayment. The booking page may show an estimate; actual entrance fees, guest adjustments and applicable verified discounts are finalized and collected onsite by Front Desk. Do not quote a fixed entrance price.",
  walkin: "Front Desk can create same-day manual walk-in reservations. Full accommodation payment is handled onsite for walk-ins. Actual slots and charges must be checked before confirming.",
  booking: "The AI provides information and preliminary suggestions only. A confirmed booking requires the Customer booking page, schedule validation and the applicable payment process.",
});

const ANSWERS = Object.freeze({
  cancellation: {
    english: "You can cancel an eligible pending or approved reservation through My Bookings at least 1 day before check-in, as long as you have not checked in. Checked-in or ineligible reservations need Front Desk assistance. Cancellation does not automatically refund a payment.",
    tagalog: "Maaari po ninyong i-cancel sa My Bookings ang pending o approved reservation nang hindi bababa sa 1 araw bago ang check-in, basta hindi pa naka-check-in. Kung naka-check-in na o hindi na eligible, makipag-ugnayan po sa Front Desk. Hindi po automatic ang refund kapag nag-cancel.",
    taglish: "Puwede po kayong mag-cancel sa My Bookings ng eligible pending o approved reservation at least 1 day before check-in, kung hindi pa naka-check-in. Kung hindi na eligible, Front Desk po ang makakatulong. Hindi automatic ang refund kapag nag-cancel.",
    spanish: "Puede cancelar una reserva pendiente o aprobada desde My Bookings al menos un día antes del check-in si aún no ha ingresado. Consulte a recepción si no cumple estas condiciones. Cancelar no genera un reembolso automático.",
    mandarin: "若尚未入住，待处理或已批准的订单可在入住至少一天前通过 My Bookings 取消。其他情况请联系前台。取消预订不代表自动退款。",
  },
  refund: {
    english: "Refunds are not processed automatically by this booking system. Resort management reviews refund requests and disputes manually, based on the resort's policies and verified payments. Cancellation alone does not guarantee a refund. Please contact resort management for your specific case.",
    tagalog: "Hindi po automatic ang refund sa booking system. Mano-manong sinusuri ng resort management ang refund requests at disputes batay sa policies at verified payments. Hindi po garantisadong may refund kapag nag-cancel. Makipag-ugnayan po sa management para sa inyong request.",
    taglish: "Hindi po automatic ang refund sa system. Manual na nirereview ng resort management ang requests base sa policies at verified payment. Hindi guaranteed ang refund dahil lang sa cancellation. Please contact management po para sa specific case ninyo.",
    spanish: "El sistema no procesa reembolsos automáticamente. La administración del resort revisa cada solicitud según sus políticas y los pagos verificados. Cancelar no garantiza un reembolso. Consulte con la administración.",
    mandarin: "本系统不会自动退款。度假村管理人员会根据政策和已核实的付款记录人工审核退款或争议。取消预订不保证退款，请联系管理人员。",
  },
  cancellationRefund: {
    english: "You may cancel an eligible pending or approved reservation in My Bookings at least 1 day before check-in, if you have not checked in. But cancellation does not automatically refund the payment. Refund requests are reviewed manually by resort management, so please contact them about your specific case.",
    tagalog: "Maaari po ninyong i-cancel ang eligible pending o approved reservation sa My Bookings nang hindi bababa sa 1 araw bago ang check-in, kung hindi pa naka-check-in. Pero hindi po automatic ang refund. Mano-manong sinusuri ito ng resort management, kaya makipag-ugnayan po sa kanila.",
    taglish: "Puwede po kayong mag-cancel sa My Bookings at least 1 day before check-in kung eligible at hindi pa naka-check-in. Pero hindi automatic ang refund. Manual po itong nirereview ng resort management, kaya sila ang dapat i-contact para sa case ninyo.",
    spanish: "Puede cancelar una reserva elegible desde My Bookings al menos un día antes del check-in, si no ha ingresado. El reembolso no es automático; consulte a la administración del resort.",
    mandarin: "符合条件且尚未入住的待处理或已批准订单，可在入住至少一天前通过 My Bookings 取消。但不会自动退款；请联系度假村管理人员审核具体情况。",
  },
  entrance: {
    english: "The entrance fee is separate from the accommodation downpayment. The booking page shows an estimate, while Front Desk finalizes entrance fees, guest adjustments and applicable discounts onsite. Please check your booking details for the estimate; I cannot quote one fixed entrance price.",
    tagalog: "Hiwalay po ang entrance fee sa accommodation downpayment. Estimate lang po ang nasa booking page; fina-finalize ng Front Desk ang entrance fees, actual guests at applicable discounts onsite. Pakitingnan po ang estimate sa booking details.",
    taglish: "Separate po ang entrance fee sa accommodation downpayment. Estimate lang po ang nasa booking page; Front Desk ang magfi-finalize ng entrance fee, actual guests at applicable discounts onsite. Please check your booking details po.",
    spanish: "La entrada se cobra por separado del anticipo del alojamiento. El importe mostrado al reservar es una estimación; recepción confirma cargos y descuentos aplicables al llegar.",
    mandarin: "入场费不包含在住宿订金中。预订页面显示的为预估金额，前台会在现场根据实际人数和适用优惠确定费用。",
  },
  walkin: {
    english: "Yes, Front Desk can assist with same-day walk-in reservations. The accommodation is subject to availability, and the walk-in accommodation payment is handled onsite. Please contact Front Desk to confirm the slot and charges.",
    tagalog: "Opo, tumatanggap po ang Front Desk ng same-day walk-in reservations, depende sa availability. Onsite po ang accommodation payment. I-confirm po muna sa Front Desk ang schedule at total charges.",
    taglish: "Yes po, puwedeng same-day walk-in sa Front Desk, subject to availability. Onsite po ang accommodation payment. Please confirm the available slot and charges with Front Desk.",
    spanish: "Sí, recepción puede asistir con reservas presenciales para el mismo día, sujetas a disponibilidad. El pago del alojamiento se gestiona en el resort.",
    mandarin: "可以，前台可协助办理当天现场预订，但须确认房源和时段。现场办理住宿付款，请先向前台确认。",
  },
  booking: {
    english: "I can help you explore accommodations and check preliminary availability, but I cannot confirm or pay for a reservation in chat. To book, choose your accommodation and dates on the Customer booking page, then complete the secure payment steps.",
    tagalog: "Matutulungan ko po kayong pumili ng accommodation at tingnan ang preliminary availability, pero hindi po ako makakapag-confirm o magbayad ng booking sa chat. Gamitin po ang Customer booking page para sa schedule at secure payment.",
    taglish: "I can help po sa accommodation suggestions at preliminary availability, pero hindi ako puwedeng mag-confirm ng booking sa chat. Continue po sa Customer booking page para sa schedule at secure payment.",
    spanish: "Puedo orientar sobre alojamientos y disponibilidad preliminar, pero el chat no confirma ni paga reservas. Utilice la página segura de reservas.",
    mandarin: "我可以提供住宿建议和初步可用性信息，但不能在聊天中确认预订或付款。请通过客户预订页面完成。",
  },
});

// Fixed-policy language correction: a prior English conversation preference
// must not override an explicitly Filipino new question. Voice language wins.
function inferPolicyLanguage(message) {
  const t = String(message || "").normalize("NFKC").toLowerCase();
  if (/[\u3400-\u9fff]/u.test(t)) return "mandarin";
  if (/\b(?:reembolso|reembolsos|cancelar|cancelaci[oó]n|entrada|reserva|reservaci[oó]n|alojamiento|puedo|c[oó]mo)\b/iu.test(t) &&
      /[¿áéíóúñ]|\b(?:reembolso|cancelar|cancelaci[oó]n)\b/iu.test(t)) return "spanish";
  const filipino = /\b(?:magkano|paano|pwede|puwede|maaari|kansela|kanselahin|bayad|po|opo|ninyo|tumatanggap|paki|bakit)\b/i.test(t);
  if (!filipino) return null;
  const englishMix = /\b(?:entrance|fee|booking|cancel|refund|walk[\s-]?in|online|check[\s-]?in|downpayment|payment)\b/i.test(t);
  return englishMix ? "taglish" : "tagalog";
}

// Refund questions include a practical contact next step, NOT a refund promise.
// The verified Home page uses the exact same URL. All five language variants
// keep policy answers local (zero Gemini calls, zero database queries).
const REFUND_FACEBOOK_GUIDANCE = Object.freeze({
  english: "For help with your refund request, please message the resort's official Facebook page:",
  tagalog: "Para po sa tulong sa refund request, maaari po kayong mag-message sa official Facebook page ng resort:",
  taglish: "Para po sa refund assistance, message ninyo ang official Facebook page ng resort:",
  spanish: "Para recibir ayuda con su solicitud de reembolso, escriba a la página oficial de Facebook del resort:",
  mandarin: "如需退款申请方面的协助，请向度假村官方 Facebook 页面发送消息：",
});

function getPolicyReply(kind, language) {
  const locale = ["english","tagalog","taglish","spanish","mandarin"].includes(language)
    ? language : "english";
  const answer = ANSWERS[kind]?.[locale] || null;
  if (!answer) return null;
  if (kind === "refund" || kind === "cancellationRefund") {
    return answer + "\n\n" + REFUND_FACEBOOK_GUIDANCE[locale] +
      "\n" + OFFICIAL_RESORT_FACEBOOK_URL;
  }
  return answer;
}

// Only route clear, general FAQ questions locally. Numerical booking codes,
// named accommodations, account/payment status and exact rate requests are
// always handled through the normal data-aware pipeline.
function matchGeneralPolicyQuestion(message) {
  const t = String(message || "").normalize("NFKC").trim().toLowerCase();
  if (!t || t.length > 350) return null;
  if (/\b\d{2,}\b|₱|\bphp\b|\b(?:nipa|hut|villa|pavilion|cottages?|rooms?|accommodation\s+(?:a|b|c)|transaction|receipt|reference|booking\s+code|status\s+of|already\s+paid|paid\s+already|payment\s+status|available\s+(?:on|for)|price\s+of)\b/i.test(t)) return null;
  const refund = /\b(?:refunds?|refundable|money back|refund\s+request|return.*payment|reembolsos?)\b|ibalik.*(?:pera|bayad)|balik.*(?:pera|bayad)|marefund|ma-refund|退款|退费/i.test(t);
  const cancel = /\b(?:cancel|cancellation|cancelled|canceled|cancelling|cancelar|cancelaci[oó]n)\b|(?:i|mag|pa)?kansela|mag-?cancel|取消|退订/i.test(t);
  const entrance = /\bentrance(?:\s+fees?|\s+payment|\s+charges?)?\b|bayad.*(?:entrance|pasok)|\b(?:tarifa\s+de\s+entrada|precio\s+de\s+entrada)\b|入场费|门票/i.test(t);
  const walkin = /\bwalk[\s-]?ins?\b|\b(?:sin\s+reserva|sin\s+reservaci[oó]n)\b|现场预订|到店预订/i.test(t);
  const question = /[?？¿]|吗|可以|多少|怎么|\b(?:how|what|where|when|can|may|do|does|is|are|allowed|policy|paano|pwede|puwede|maaari|magkano|kailangan|saan|ilan|ano|tumatanggap|may|puedo|c[oó]mo|cu[aá]nto)\b/i.test(t);
  if (!question) return null;
  if (refund && cancel) return "cancellationRefund";
  if (refund) return "refund";
  if (cancel) return "cancellation";
  if (walkin && !entrance) return "walkin";
  if (entrance && !/\b(?:downpayments?|deposits?|advance)\b|paunang\s+bayad/i.test(t)) return "entrance";
  // Avoid a broad 'how do I book' match: such questions may contain
  // accommodation names/dates that need live DB verification.
  if (/^(?:can|may)\s+(?:you|the\s+ai)\s+(?:book|reserve|confirm)\s+(?:for\s+me|my\s+reservation)|^(?:pwede|puwede)\s+(?:ka|ba\s+ang\s+ai)\s+mag-?book/i.test(t)) return "booking";
  return null;
}

function policyPromptLines() {
  return Object.entries(POLICY_FACTS).map(([k,v]) => "- " + k + ": " + v).join("\n");
}

module.exports = { POLICY_FACTS, matchGeneralPolicyQuestion, inferPolicyLanguage, getPolicyReply, policyPromptLines };
