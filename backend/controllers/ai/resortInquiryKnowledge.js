"use strict";
const { unknownRecordReply } = require("./aiGroundedResponseRules");
/*
 * Verified resort-wide inquiry knowledge. NOT accommodation inventory:
 * per-room amenities, prices, slots and capacity still come from fresh MySQL.
 *
 * Facts are approved by the client (parking, 2026-11-19) or are already
 * published on both Customer Home and the public Landing page (contact,
 * hours, location, swimming pool). Client confirmation on 2026-11-22:
 * animals/pets are NOT allowed in the resort. Do not infer pool/parking
 * charges beyond the approved fact, reserved spaces/security, corkage,
 * Wi-Fi, child rates, or parking capacity.
 *
 * Add an approved fact here only after confirming it with the resort.
 */
const RESORT_INQUIRY_FACTS = Object.freeze({
  parking: "The resort has FREE on-site parking for ANY type of vehicle, including motorcycles, cars, vans and buses. There is no parking fee. Do NOT claim unlimited spaces, a reserved/private parking bay, covered or guarded parking, or parking capacity.",
  pets: "CLIENT-VERIFIED 2026-11-22: Animals and pets are NOT ALLOWED inside Arvic Seaside Beach Resort and Hotel. This includes dogs, cats and other animals. Never claim the property is pet-friendly or that guests may bring a pet for a fee. Do not invent exceptions or a pet boarding service.",
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
// AI-39: One shared intent for the resort-only gate AND verified FAQ route.
// Avoid matching generic "open" (e.g. "open source code") as a resort question.
function isOpeningHoursInquiry(message) {
  const t = normalizeQuestion(message);
  if (!t || t.length > 350) return false;
  const patterns = [
    /\b(?:tuwing\s+)?(?:kailan|kelan)\s+(?:(?:po|ba|nga|kaya)\s+)*(?:(?:kayo|ang\s+(?:resort|hotel))\s+)?(?:open|bukas|nagbubukas|magbubukas|nag[ -]?oopen|nagsasara|sarado|close)\b/i,
    /\b(?:hanggang\s+)?(?:anong\s+oras|anong\s+araw|anong\s+mga\s+araw|anong\s+days?)\s+(?:(?:po|ba)\s+)*(?:(?:kayo|ang\s+(?:resort|hotel))\s+)?(?:open|bukas|nagbubukas|nagsasara|nag[ -]?oopen|sarado|close)\b/i,
    /\b(?:open|bukas|sarado|closed)\s+(?:(?:po|ba|pa|din|rin)\s+)*(?:kayo|ang\s+(?:resort|hotel))\b/i,
    /\b(?:kayo|ang\s+(?:resort|hotel))\s+(?:po\s+)?(?:ba\s+)?(?:open|bukas|sarado|closed)\b/i,
    /\b(?:are\s+you|is\s+(?:the\s+)?(?:resort|hotel))\s+open\b(?=\s*(?:[?!.]|$|(?:now|today|tomorrow|on|every|at|24|during|weekends?|weekdays?|daily)\b))/i,
    /\b(?:when|what\s+days?|what\s+time|how\s+late)\s+(?:(?:are|do)\s+you|is\s+(?:the\s+)?resort)?\s*(?:open|close|closed)\b/i,
    /\b(?:what\s+time\s+do\s+you|when\s+do\s+you|until\s+what\s+time\s+are\s+you)\s+(?:open|close)\b/i,
    /\b(?:tuwing|every)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|miyerkules|huwebes|biyernes|sabado|linggo|weekends?)\s+(?:(?:po|ba|kayo|ang)\s+){0,4}(?:open|bukas)\b/i,
    /\b(?:what\s+(?:are\s+)?your\s+)?(?:operating|opening|business)\s+(?:hours?|days?|schedule)\b/i,
    /\b24\s*(?:\/\s*7|hours?|oras)\b.{0,65}\b(?:kayo|resort|hotel|open|bukas)\b|\b(?:kayo|resort|hotel|open|bukas)\b.{0,65}\b24\s*(?:\/\s*7|hours?|oras)\b/i,
  ];
  return patterns.some(pattern => pattern.test(t));
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
  const hours = isOpeningHoursInquiry(t) ||
    /\b(?:operating\s+hours?|opening\s+hours?|business\s+hours?|open\s+(?:24\s*(?:\/\s*7|hours?)|everyday|on\s+(?:sunday|saturday|weekends?))|what\s+time\s+(?:do\s+you\s+)?open|anong\s+oras\s+(?:bukas|open)|bukas\s+ba\s+(?:kayo|ang\s+resort)|oras\s+ng\s+resort)\b/i.test(t);
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
  // Normal posted hours do not guarantee emergency or holiday operations.
  if (topic === "openingHours" &&
      /\b(?:holidays?|pasko|christmas|new\s+year|undas|bagyo|typhoon|storm|brownout|power\s+outage|emergency|maintenance)\b/i.test(t))
    return { topic, qualified: true };
  // Pool pricing / eligibility / safety rules must not be inferred from pool existence.
  if (topic === "pool" && /\b(?:free|libre|libreng|magkano|price|rate|fee|depth|deep|rules|allowed|included|bawal|hours|open\s+until)\b/i.test(t))
    return { topic, qualified: true };
  return { topic, qualified: false };
}


// AI-47: Only client-verified facts are rendered here. A Bisaya fast-path
// must not silently fall back to English when no Gemini call is made.
const BISAYA_SHORT_ANSWERS = Object.freeze({
  parking: "Oo, libre ang parking sa Arvic Seaside Resort para sa tanang klase sa sakyanan—motor, awto, van ug bus. Wala'y parking fee.",
  parkingEntrance: "Libre ang parking para sa tanang sakyanan. Lahi ang entrance fee; ang Front Desk maoy mokumpirma sa bayranan didto sa resort.",
  location: "Ang Arvic Seaside Resort naa sa 17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite.",
  openingHours: "Abli ang resort 24 oras kada adlaw. Apan fixed gihapon ang check-in ug check-out slots sa accommodation.",
  contact: "Mahimo ninyong tawagan ang resort sa 0956-912-5625 o 0967-817-0662.",
  pool: "Oo, naay swimming pool ang resort. Sa Front Desk lang palihog kumpirmaha ang pool fees ug mga rules.",
});

function getResortInquiryReply(match, language) {
  if (!match || !SHORT_ANSWERS[match.topic]) return null;
  if (language === "bisaya") {
    const base = BISAYA_SHORT_ANSWERS[match.topic];
    if (!match.qualified) return base;
    if (match.topic === "openingHours") {
      return base + " Para sa holiday o emergency changes, kumpirmaha sa Front Desk: 0956-912-5625.";
    }
    if (match.topic === "parking") {
      return "Libre ang parking sa tanang sakyanan, pero wala pa makumpirma ang espesipikong parking detail nga inyong gipangutana. Palihog kontaka ang Front Desk: 0956-912-5625.";
    }
    return "Naay swimming pool ang resort, pero wala pa makumpirma ang espesipikong bayad o rules. Palihog kontaka ang Front Desk: 0956-912-5625.";
  }
  const locale = Object.hasOwn(SHORT_ANSWERS[match.topic], language) ? language : "english";
  if (match.qualified) {
    if (match.topic === "openingHours") {
      if (locale === "taglish" || locale === "tagalog")
        return "Regular hours po ng resort ay 24 hours, Monday to Sunday. Para sa special holiday o emergency changes, pa-confirm po muna sa Front Desk: 0956-912-5625.";
      return "Our regular resort hours are 24 hours, Monday to Sunday. Please confirm possible holiday or emergency changes with Front Desk at 0956-912-5625.";
    }
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

/*
 * Some resort-wide policies have no approved answer yet. Handle short direct
 * inquiries conservatively rather than asking Gemini to guess a yes/no.
 * Room-specific amenities are deliberately excluded so DB-backed responses
 * remain authoritative for the selected accommodation.
 */

// AI-60: No-pets policy was explicitly confirmed by the resort on 2026-11-22.
// The rule applies property-wide, including stays in any room or cottage.
// Respond deterministically (0 Gemini credits) so "pwede magdala ng aso?"
// cannot accidentally fall into the previously unverified pet-policy path.
function matchVerifiedPetPolicy(message) {
  const t = normalizeQuestion(message);
  if (!t || t.length > 400) return null;
  const pet = /\b(?:pets?|pet[\s-]?friendly|dogs?|cats?|pupp(?:y|ies)|kittens?|animals?|aso|pusa|hayop|alagang\s+hayop|iro|iring|mascotas?|perros?|gatos?)\b/iu.test(t) ||
    /(?:宠物|猫|狗|動物|ペット|犬|고양이|반려동물)/u.test(t);
  if (!pet) return null;
  // Requests about multiple unrelated booking policies need the grounded
  // model to address all the parts; it will still receive the verified fact.
  if (/\b(?:downpayment|deposit|paypal|refund|cancellation|check[\s-]?in|check[\s-]?out|room\s+rate|total\s+price|magkano\s+(?:ang\s+)?(?:room|kwarto)|presyo\s+ng\s+kwarto)\b/iu.test(t)) return null;
  return {
    parking: /\b(?:parking|park|paradahan|mag[\s-]?park)\b/i.test(t),
    wifi: /\b(?:wi[\s-]?fi|internet|wireless)\b/i.test(t),
    food: /\b(?:corkage|outside\s+food|bring\s+food|magdala\s+ng\s+pagkain|dalang\s+pagkain)\b/i.test(t),
  };
}
function verifiedPetPolicyReply(match, language = "taglish") {
  if (!match) return null;
  const answers = {
    english: "Sorry, animals and pets are not allowed at Arvic Seaside Resort, including dogs and cats.",
    tagalog: "Pasensya na po, bawal magdala ng mga hayop sa Arvic Seaside Resort, kasama ang aso at pusa.",
    taglish: "Sorry po, hindi pet-friendly ang Arvic Seaside Resort. Bawal po magdala ng pets o kahit anong hayop, including dogs and cats.",
    bisaya: "Pasayloa, bawal magdala og mga hayop sa Arvic Seaside Resort, apil ang iro ug iring.",
    spanish: "Lo sentimos, no se permiten mascotas ni otros animales en Arvic Seaside Resort, incluidos perros y gatos.",
    mandarin: "抱歉，Arvic Seaside Resort 禁止携带宠物及其他动物，包括狗和猫。",
  };
  const extras = {
    english: {
      parking: "Parking for vehicles is free.",
      wifi: "Wi-Fi availability has not been verified; please ask Front Desk.",
      food: "The outside-food/corkage policy has not been verified; please ask Front Desk.",
    },
    tagalog: {
      parking: "Libre po ang paradahan ng mga sasakyan.",
      wifi: "Hindi pa po kumpirmado ang Wi-Fi; pakitanong sa Front Desk.",
      food: "Hindi pa po kumpirmado ang patakaran sa dalang pagkain at corkage; pakitanong sa Front Desk.",
    },
    taglish: {
      parking: "Free naman po ang parking ng vehicles.",
      wifi: "Hindi pa po confirmed ang Wi-Fi policy; pa-check sa Front Desk.",
      food: "Hindi pa po confirmed ang outside food/corkage policy; pa-check sa Front Desk.",
    },
    bisaya: {
      parking: "Libre ang parking sa mga sakyanan.",
      wifi: "Wala pa makumpirma ang Wi-Fi; palihog pangutana sa Front Desk.",
      food: "Wala pa makumpirma ang outside food/corkage; palihog pangutana sa Front Desk.",
    },
    spanish: {
      parking: "El estacionamiento de vehículos es gratuito.",
      wifi: "La disponibilidad de Wi-Fi no está confirmada; consulte con recepción.",
      food: "La política de alimentos externos no está confirmada; consulte con recepción.",
    },
    mandarin: {
      parking: "车辆停车免费。",
      wifi: "Wi-Fi 使用情况尚未核实，请咨询前台。",
      food: "自带食物及开瓶费政策尚未核实，请咨询前台。",
    },
  };
  const locale=answers[language] ? language : "english";
  return [answers[locale],...["parking","wifi","food"].filter(k=>match[k]).map(k=>extras[locale][k])].join(" ");
}

function matchUnverifiedResortPolicy(message, context = {}) {
  const t = normalizeQuestion(message);
  if (!t || t.length > 350) return null;
  const wifi = /\b(?:wi-?fi|wireless\s+internet|internet\s+connection)\b/i.test(t);
  const food = /\b(?:corkage|outside\s+food|bring\s+(?:(?:my|our|your|own)\s+)?food|own\s+food|dalang\s+(?:pagkain|food)|magdala\s+ng\s+(?:pagkain|food))\b/i.test(t);
  if (![wifi,food].some(Boolean)) return null;
  if (/\b(?:family\s+room|double\s+room|single\s+room|rooms?|kwarto|kuwarto|accommodations?|nipa\s+hut|cottage|pavilion|pool\s+shade|booking\s+code|transaction|payment\s+status)\b/i.test(t)) return null;
  // A customer asking "May Wi-Fi dito?" while a room is focused needs a
  // fresh per-room lookup / grounded Gemini answer, not a property-wide FAQ.
  const focused = Number(context?.room_id) > 0 || Boolean(String(context?.room_name || "").trim());
  if (wifi && focused &&
      /\b(?:dito|ito|iyan|this|that|sa\s+room|sa\s+kwarto|sa\s+kuwarto|included|meron\s+ba)\b/i.test(t)) return null;
  const park = /\b(?:parking|park|paradahan|mag[ -]?park)\b/i.test(t);
  // Generic refund/booking/pricing requests have their own verified handlers.
  if (/\b(?:refund|cancellation|cancel|downpayment|booking\s+status|room\s+price|room\s+rate)\b/i.test(t)) return null;
  return { kind: wifi ? "wifi" : "food", mentionsParking: park };
}

function getUnverifiedResortPolicyReply(match, language) {
  if (!match) return null;
  if (!["english", "tagalog", "taglish"].includes(language)) {
    // Mixed known/unknown questions can preserve the independently verified
    // free-parking fact, but never imply Wi-Fi, pets or corkage is approved.
    const freeParking = {
      bisaya: "Libre ang parking para sa tanang sakyanan. ",
      spanish: "El estacionamiento es gratuito para cualquier vehículo. ",
      mandarin: "各种车辆均可免费停车。",
      japanese: "あらゆる車両の駐車は無料です。",
      korean: "모든 차량의 주차는 무료입니다. ",
      french: "Le stationnement est gratuit pour tout véhicule. ",
      german: "Das Parken ist für alle Fahrzeugtypen kostenlos. ",
      arabic: "موقف السيارات مجاني لجميع أنواع المركبات. ",
    }[language] || "";
    return (match.mentionsParking ? freeParking : "") + unknownRecordReply(language);
  }
  const locale = ["english","tagalog","taglish"].includes(language) ? language : "english";
  const subject = {
    wifi: { english: "Wi-Fi availability", tagalog: "Wi-Fi", taglish: "Wi-Fi" },
    food: { english: "the outside food/corkage policy", tagalog: "outside food/corkage policy", taglish: "outside food/corkage policy" },
  }[match.kind]?.[locale];
  const parking = match.mentionsParking;
  if (locale === "taglish") return (parking ? "Free po ang parking para sa kahit anong vehicle. " : "") +
    "Hindi pa po confirmed yung " + subject + " ng resort. " +
    "Pa-check po sa Front Desk: 0956-912-5625.";
  if (locale === "tagalog") return (parking ? "Libre po ang parking para sa anumang sasakyan. " : "") +
    "Hindi pa po kumpirmado ang " + subject + " ng resort. " +
    "Magtanong po sa Front Desk: 0956-912-5625.";
  return (parking ? "Parking is free for any vehicle. " : "") +
    subject + " hasn't been confirmed by the resort. Please contact Front Desk at 0956-912-5625.";
}

function resortInquiryPromptLines() {
  return [
    "CLIENT-VERIFIED / OFFICIALLY PUBLISHED RESORT-WIDE FACTS:",
    ...Object.entries(RESORT_INQUIRY_FACTS).map(([kind, fact]) => "- " + kind + ": " + fact),
    "Use these facts naturally for paraphrased questions; do NOT require a customer to use any specific keywords.",
    "Resort-wide parking being free does NOT mean entrance, room, or pool admission is free.",
    "The confirmed resort-wide NO-ANIMALS/NO-PETS policy applies to all accommodations. Do not invent exceptions.",
    "For unverified Wi-Fi, outside food/corkage, parking security/space guarantees,",
    "pool fees or safety, early check-in, and other missing resort policies: never invent a yes/no,",
    "rate or promise. State that it is not yet confirmed and refer to Front Desk.",
    "If a guest asks multiple unrelated questions, answer verified parts briefly and qualify unknown parts.",
  ].join("\n");
}

module.exports = {
  RESORT_INQUIRY_FACTS, matchResortInquiry, isOpeningHoursInquiry,
  guessInquiryLanguage, getResortInquiryReply, resortInquiryPromptLines,
  matchVerifiedPetPolicy, verifiedPetPolicyReply,
  matchUnverifiedResortPolicy, getUnverifiedResortPolicyReply,
};
