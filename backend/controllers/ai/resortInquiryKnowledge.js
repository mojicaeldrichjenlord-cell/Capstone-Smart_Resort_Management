"use strict";
/*
 * Verified resort-wide inquiry knowledge. NOT accommodation inventory:
 * per-room amenities, prices, slots and capacity still come from fresh MySQL.
 *
 * Facts are approved by the client (parking, 2026-11-19) or are already
 * published on both Customer Home and the public Landing page (contact,
 * hours, location, swimming pool). Do not infer pool/parking charges beyond
 * the approved fact, reserved parking slots, safety/security, pets, corkage,
 * Wi-Fi, child rates, or parking capacity.
 *
 * Add an approved fact here only after confirming it with the resort.
 */
const RESORT_INQUIRY_FACTS = Object.freeze({
  parking: "The resort has FREE on-site parking for ANY type of vehicle, including motorcycles, cars, vans and buses. There is no parking fee. Do NOT claim unlimited spaces, a reserved/private parking bay, covered or guarded parking, or parking capacity.",
  location: "The resort is at 17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite, Philippines. Do not invent directions or transport routes.",
  openingHours: "The resort is open 24 hours a day, Monday to Sunday. This does NOT mean guests may choose custom check-in/out hours; accommodation booking follows fixed Day/Night slots.",
  contact: "Published resort contact numbers: 0956-912-5625 and 0967-817-0662. For uncertain policies, refer the guest to the Front Desk.",
  pool: "The resort has a swimming pool as shown on the official public Landing page. Pool admission charges, water depth, rules, and inclusions with any specific room are NOT confirmed by this fact.",
});

const SHORT_ANSWERS = Object.freeze({
  parking: {
    english: "Yes! Arvic Seaside Resort has free parking for any type of vehicle, including motorcycles, cars, vans and buses.",
    taglish: "Yes po! May free parking tayo sa resort para sa kahit anong type ng vehicle—motor, kotse, van, o bus. Walang parking fee.",
    tagalog: "Opo! May libreng paradahan sa resort para sa anumang uri ng sasakyan, kasama ang motorsiklo, kotse, van at bus.",
    spanish: "Sí, el resort ofrece estacionamiento gratis para todo tipo de vehículos, como motos, coches, furgonetas y autobuses.",
    mandarin: "有的！度假村为各种车辆提供免费停车，包括摩托车、汽车、面包车和巴士。",
  },
  parkingEntrance: {
    english: "Parking is free for any vehicle. Entrance fees are separate from accommodation payments, and Front Desk confirms the applicable entrance charges onsite.",
    taglish: "Free po ang parking para sa kahit anong vehicle. Separate naman po ang entrance fee; sa Front Desk kino-confirm ang applicable entrance charges onsite.",
    tagalog: "Libre po ang paradahan para sa anumang sasakyan. Hiwalay po ang entrance fee, at sa Front Desk kinukumpirma ang kaukulang bayad.",
    spanish: "El estacionamiento es gratis para cualquier vehículo. La entrada se cobra aparte y recepción confirma la tarifa aplicable.",
    mandarin: "各种车辆均可免费停车。入场费另计，具体金额请向前台确认。",
  },
  location: {
    english: "We're at 17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite.",
    taglish: "Nasa 17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite po ang resort.",
    tagalog: "Matatagpuan po ang resort sa 17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite.",
    spanish: "Estamos en 17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite.",
    mandarin: "度假村地址是菲律宾甲米地省 Naic 的 Bagong Karsada 村 Mahogany 街 17 号。",
  },
  openingHours: {
    english: "The resort is open 24 hours, Monday through Sunday. Accommodation check-in and check-out still use fixed booking slots.",
    taglish: "Open po ang resort 24 hours, Monday to Sunday. Fixed schedules pa rin po ang check-in at check-out ng accommodations.",
    tagalog: "Bukas po ang resort nang 24 oras araw-araw, Lunes hanggang Linggo. May nakatakdang oras pa rin para sa check-in at check-out.",
    spanish: "El resort abre las 24 horas todos los días; las entradas y salidas de alojamiento siguen horarios fijos.",
    mandarin: "度假村每天 24 小时开放，但住宿办理入住和退房仍须遵守固定时段。",
  },
  contact: {
    english: "You can reach the resort at 0956-912-5625 or 0967-817-0662.",
    taglish: "Pwede niyo pong tawagan ang resort sa 0956-912-5625 o 0967-817-0662.",
    tagalog: "Maaari po kayong tumawag sa resort sa 0956-912-5625 o 0967-817-0662.",
    spanish: "Puede llamar al resort al 0956-912-5625 o al 0967-817-0662.",
    mandarin: "您可以拨打度假村电话 0956-912-5625 或 0967-817-0662。",
  },
  pool: {
    english: "Yes, the resort has a swimming pool. For pool entrance fees or specific rules, please confirm with Front Desk.",
    taglish: "Yes po, may swimming pool ang resort! For pool fees or specific rules, pa-confirm na lang po sa Front Desk.",
    tagalog: "Opo, may swimming pool ang resort. Para sa bayad at iba pang patakaran, pakikumpirma po sa Front Desk.",
    spanish: "Sí, el resort tiene piscina. Consulte con recepción las tarifas y normas específicas.",
    mandarin: "度假村有游泳池。泳池收费和具体规则请向前台确认。",
  },
});

function normalizeQuestion(message) {
  return String(message || "").normalize("NFKC").toLowerCase().trim();
}
function guessInquiryLanguage(message) {
  const t = normalizeQuestion(message);
  if (/[\u3400-\u9fff]/u.test(t)) return "mandarin";
  if (/[¿áéíóúñ]/u.test(t) || /\b(?:estacionamiento|aparcamiento|piscina|direcci[oó]n|abierto)\b/u.test(t)) return "spanish";
  if (/\b(?:may|meron|meron ba|meron bang|libre|libreng|magkano|saan|po|opo|yung|ba|bang|pwede|puwede|kotse|motor|sasakyan|paradahan|anong|oras|kayo|nyo|niyo)\b/i.test(t))
    return "taglish";
  return null;
}

/*
 * Recognize only an unambiguous single resort-wide subject.
 * Multi-part inquiries and per-accommodation questions continue through
 * Gemini with grounded knowledge. Unverified parking attributes (security,
 * reserved spaces, exact capacity, parking open hours) are handled honestly.
 */
function matchResortInquiry(message) {
  const t = normalizeQuestion(message);
  if (!t || t.length > 600) return null;
  const parking = /\b(?:park(?:ing|ing\s+lot)?|car\s*park|vehicle\s+parking|paradahan|mag[ -]?park|i[ -]?park)\b/i.test(t);
  const location = /\b(?:address|located|location|saan\s+(?:kayo|po\s+kayo|ang\s+resort)|nasaan\s+(?:ang\s+)?resort|directions?\s+to\s+(?:the\s+)?resort|direcci[oó]n)\b/i.test(t);
  const hours = /\b(?:operating\s+hours?|opening\s+hours?|business\s+hours?|open\s+(?:24\s*(?:\/\s*7|hours?)|everyday|on\s+(?:sunday|saturday|weekends?))|what\s+time\s+(?:do\s+you\s+)?open|anong\s+oras\s+(?:bukas|open)|bukas\s+ba\s+(?:kayo|ang\s+resort)|oras\s+ng\s+resort)\b/i.test(t);
  const contact = /\b(?:contact\s+(?:number|details?|info)|phone\s+(?:number|contact)|telephone|hotline|tawag(?:an)?\s+(?:ko\s+)?(?:sa\s+)?(?:resort|inyo|kayo)|numero\s+ng\s+(?:resort|contact)|number\s+(?:niyo|nyo|ninyo)|contact\s+kayo)\b/i.test(t);
  const pool = /\b(?:swimming\s+pool|pool\s+(?:area|facility)|may\s+(?:ba\s+)?pool|meron\s+(?:ba\s+)?pool|have\s+(?:a\s+)?pool|piscina)\b/i.test(t);
  // Prevent a resort-wide answer falsely promising a specific room amenity.
  if (/\b(?:family\s+room|double\s+room|single\s+room|nipa\s+hut|pool\s+shade|pavilion|cottage|private\s+(?:parking|pool)|dedicated\s+parking)\b/i.test(t)) return null;
  // Open-ended multi-facility questions need complete grounded reasoning,
  // not a one-line parking or pool answer that ignores other services.
  if (/\b(?:facilities|amenities|other\s+services|what\s+else|all\s+services|all\s+facilities)\b/i.test(t)) return null;
  // A compound parking + entrance-fee question needs BOTH independent facts.
  // Do not confuse the physical entrance to the parking lot with admission.
  const entranceFee = /\b(?:entrance\s+(?:fee|charge|payment|ticket|libre|free)|free\s+entrance|libre(?:ng)?(?:\s+rin)?(?:\s+ba)?\s+(?:ang\s+)?entrance|bayad\s+sa\s+pasok)\b/i.test(t);
  if (parking && entranceFee && !/\b(?:pets?|dogs?|cats?|wi-?fi|corkage|outside\s+food|swimming\s+pool|refund)\b/i.test(t))
    return { topic: "parkingEntrance", qualified: false };
  const topics = Object.entries({ parking, location, openingHours: hours, contact, pool })
    .filter(([,yes]) => yes).map(([name]) => name);
  if (topics.length !== 1) return null;
  const topic = topics[0];

  // Other guest questions have independent policies; don't silently ignore them.
  if (/\b(?:pets?|dogs?|cats?|wifi|wi-fi|internet|corkage|outside\s+food|bring\s+food|entrance\s+(?:fee|charge|payment|ticket|libre|free)|free\s+entrance|libre(?:ng)?(?:\s+rin)?(?:\s+ba)?\s+(?:ang\s+)?entrance|refund|refunds?|reservation\s+status|booking\s+code|paid\s+already|room\s+rate|price\s+of)\b/i.test(t)) return null;

  const parkingUnknown = topic === "parking" &&
    /\b(?:secure|security|cctv|guard(?:ed)?|covered|roof|shade|reserved?|reserve|dedicated|exclusive|capacity|how\s+many|ilang|\d{2,}\s*(?:vehicles?|cars?|vans?|buses|sasakyan|na\s+tao|pax|people|guests?)|full|available\s+(?:on|today|tomorrow)|overnight\s+parking\s+hours?|parking\s+hours?|entrance|exit|where\s+exactly|saan\s+exactly)\b/i.test(t);
  if (parkingUnknown) return { topic, qualified: true };

  // Resort's opening hours are not check-in/out schedules.
  if (topic === "openingHours" && /check[ -]?(?:in|out)|room|booking\s+time|reservation\s+time/i.test(t)) return null;
  // Pool pricing / eligibility / safety rules must not be inferred from pool existence.
  if (topic === "pool" && /\b(?:free|libre|libreng|magkano|price|rate|fee|depth|deep|rules|allowed|included|bawal|hours|open\s+until)\b/i.test(t))
    return { topic, qualified: true };
  return { topic, qualified: false };
}

function getResortInquiryReply(match, language) {
  if (!match || !SHORT_ANSWERS[match.topic]) return null;
  const locale = Object.hasOwn(SHORT_ANSWERS[match.topic], language) ? language : "english";
  if (match.qualified) {
    if (locale === "taglish" || locale === "tagalog") {
      return match.topic === "parking"
        ? "May free parking po tayo para sa lahat ng vehicle types, pero hindi pa confirmed yung specific parking detail na tinanong niyo. Pwede niyo pong i-check sa Front Desk: 0956-912-5625."
        : "Yes po, may swimming pool ang resort, pero hindi pa confirmed yung specific fee o rules. Pa-check na lang po sa Front Desk: 0956-912-5625.";
    }
    return match.topic === "parking"
      ? "Parking is free for all vehicle types, but that specific parking detail isn't confirmed. Please check with Front Desk at 0956-912-5625."
      : "The resort has a pool, but that specific fee or rule isn't confirmed. Please check with Front Desk at 0956-912-5625.";
  }
  return SHORT_ANSWERS[match.topic][locale];
}

function resortInquiryPromptLines() {
  return [
    "CLIENT-VERIFIED / OFFICIALLY PUBLISHED RESORT-WIDE FACTS:",
    ...Object.entries(RESORT_INQUIRY_FACTS).map(([kind, fact]) => "- " + kind + ": " + fact),
    "Use these facts naturally for paraphrased questions; do NOT require a customer to use any specific keywords.",
    "Resort-wide parking being free does NOT mean entrance, room, or pool admission is free.",
    "For unverified pet rules, Wi-Fi, outside food/corkage, parking security/space guarantees,",
    "pool fees or safety, early check-in, and other missing resort policies: never invent a yes/no,",
    "rate or promise. State that it is not yet confirmed and refer to Front Desk.",
    "If a guest asks multiple unrelated questions, answer verified parts briefly and qualify unknown parts.",
  ].join("\n");
}

module.exports = {
  RESORT_INQUIRY_FACTS, matchResortInquiry,
  guessInquiryLanguage, getResortInquiryReply, resortInquiryPromptLines,
};
