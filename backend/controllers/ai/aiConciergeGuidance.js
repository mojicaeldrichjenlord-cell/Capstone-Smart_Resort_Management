"use strict";
// AI-48: Deterministic, policy-grounded concierge handoffs.
// No database writes, Gemini calls, prices or speculative event packages.
const CONTACT_PRIMARY = "0956-912-5625";
const CONTACT_ALTERNATE = "0967-817-0662";
const CONTACT_EMAIL = "resortarvicseaside@gmail.com";

function matchConciergeGuide(message) {
  const t = String(message || "").normalize("NFKC").trim().toLowerCase();
  if (!t || t.length > 400) return null;
  // A special-event or customized package is handled by staff, not quoted
  // from an ordinary accommodation rate.
  const special = /\b(?:wedding|kasal|reception|birthday|debut|team[ -]?building|corporate\s+event|company\s+event|custom(?:ized)?\s+(?:event|package|discount)|special\s+(?:event|package|request)|event\s+packages?|private\s+event|party\s+package|catering\s+package|event\s+quotation)\b/i.test(t);
  if (special) return "special_event";
  // This path explains the GENERAL customer journey. Questions about a
  // particular booking/payment status or amount need the normal DB handler.
  if (/\b(?:booking\s+(?:status|code|reference)|payment\s+(?:status|reference)|already\s+paid|confirmed\s+booking|refund|cancel|remaining\s+balance|my\s+booking|my\s+reservation)\b/i.test(t))
    return null;
  const askingProcess =
    /\b(?:how\s+(?:do|can|to)\s+(?:i|we)?\s*(?:book|reserve|pay)|how\s+(?:does|do)\s+(?:booking|paypal\s+checkout|online\s+payment)\s+work|how\s+to\s+(?:book|reserve|pay)|booking\s+(?:process|steps|instructions)|paypal\s+(?:checkout|steps|payment\s+process)|paano\s+(?:po\s+)?(?:mag[ -]?book|mag[ -]?reserve|magbayad|mag[ -]?bayad)|paano\s+(?:ang|po\s+ang)\s+(?:booking|pag[ -]?book|paypal\s+payment)|unsaon\s+(?:pag[ -]?book|pag[ -]?reserve|pagbayad)|c[oó]mo\s+(?:reservar|pagar)|如何(?:预订|付款)|怎么(?:预订|付款))/iu.test(t) ||
    /(?:如何|怎么)(?:预订|付款)/u.test(t);
  const readyToBook =
    /\b(?:ready\s+to\s+book|i\s+(?:want|would\s+like)\s+to\s+(?:book|reserve)|let\s+me\s+book|start\s+(?:a|my|the)\s+booking|mag[ -]?book\s+na\s+(?:ako|kami|po|tayo)|gusto\s+(?:ko|namin)\s+(?:(?:na|nang)\s+)?mag[ -]?book|mag[ -]?reserve\s+na\s+(?:ako|kami)|gusto\s+ko\s+na\s+magbayad|quiero\s+reservar|我要预订)/iu.test(t) || /我要预订/u.test(t);
  return askingProcess || readyToBook ? "booking" : null;
}

function isMixedEntranceAndCorkage(message) {
  const t = String(message || "").normalize("NFKC").toLowerCase();
  // A named room or an exact amount should stay in the data-aware flow.
  if (t.length > 400 || /\b(?:family\s+room|double\s+room|single\s+room|booking\s+code|transaction|₱|php\s*\d+)\b/i.test(t)) return false;
  return /\b(?:entrance|admission|pasok|entrada)\b/i.test(t) &&
    /\b(?:corkage|outside\s+food|own\s+food|magdala\s+(?:ng\s+)?pagkain|magdala\s+ng\s+inumin|bringing\s+food|bringing\s+drinks)\b/i.test(t);
}

function conciergeGuideReply(kind, language = "taglish") {
  const variants = {
    booking: {
      english: "Here's how online booking works:\n1. Log in or create a Customer account.\n2. Choose your accommodation, date and fixed Day Tour or Night slot. The booking page checks availability and final pricing.\n3. Review the total and pay 50% of the final accommodation price through PayPal. Once PayPal successfully captures payment, the system automatically confirms the booking—no payment-proof upload needed.\n4. Pay the remaining accommodation balance and separate entrance fees or applicable charges onsite.",
      taglish: "Madali lang po mag-book online:\n1. Mag-login o register.\n2. Pumili ng accommodation, date at schedule.\n3. Review ang availability at total, then pay 50% accommodation downpayment via PayPal. Automatic ang confirmation kapag successful ang payment capture; no proof upload.\n4. Bayaran ang remaining balance at entrance fees sa resort.",
      tagalog: "Ganito po ang online booking:\n1. Mag-log in o gumawa ng Customer account.\n2. Pumili ng matutuluyan, petsa at nakatakdang Day Tour o Night slot. Sa booking page makikita ang availability at halaga.\n3. Bayaran sa PayPal ang 50% ng pinal na presyo ng matutuluyan. Awtomatikong makukumpirma ang booking kapag matagumpay na naitala ang bayad; hindi na kailangang mag-upload ng patunay.\n4. Sa resort babayaran ang natitirang halaga at hiwalay na entrance fees.",
      bisaya: "Mao ni ang online booking:\n1. Mag-login o register og Customer account.\n2. Pilia ang accommodation, petsa ug fixed Day Tour o Night slot. Ipakita sa booking page ang availability ug final rate.\n3. Bayri ang 50% nga accommodation downpayment pinaagi sa PayPal. Automatic ang booking confirmation human sa successful payment capture; walay proof upload.\n4. Bayri sa resort ang nahibiling balance ug lahing entrance fees.",
      spanish: "Así funciona la reserva en línea:\n1. Inicia sesión o crea una cuenta.\n2. Elige alojamiento, fecha y turno fijo de día o noche. La página de reservas comprueba la disponibilidad y el importe.\n3. Paga el 50 % del precio final del alojamiento con PayPal. La confirmación es automática tras la captura exitosa del pago; no hace falta subir un comprobante.\n4. Paga el saldo y las entradas por separado en el resort.",
      mandarin: "在线预订步骤：\n1. 登录或注册客户账号。\n2. 选择住宿、日期及固定日间或夜间时段，并在预订页面查看房源和最终价格。\n3. 通过 PayPal 支付最终住宿价格的 50%。付款成功入账后系统自动确认预订，无需上传付款截图。\n4. 剩余住宿费用和单独的入场费等在度假村支付。",
    },
    special_event: {
      english: "For weddings, birthdays, team building or a customized event package, our Front Desk can discuss your requirements. Package inclusions, special discounts and quotes aren't confirmed in the current records, so please contact " + CONTACT_PRIMARY + " or " + CONTACT_ALTERNATE + ". You can also email " + CONTACT_EMAIL + ".",
      taglish: "For weddings, birthdays, team building o custom event packages, mas okay pong directly sa Front Desk para ma-discuss ang requirements. Wala pang confirmed custom package rates o discounts sa records. Contact: " + CONTACT_PRIMARY + " / " + CONTACT_ALTERNATE + " o email " + CONTACT_EMAIL + ".",
      tagalog: "Para po sa kasal, kaarawan, team building o espesyal na event, direktang makipag-usap sa Front Desk para sa mga kailangan ninyo. Wala pang kumpirmadong presyo o espesyal na diskuwento ng package sa records. Tumawag sa " + CONTACT_PRIMARY + " o " + CONTACT_ALTERNATE + "; email: " + CONTACT_EMAIL + ".",
      bisaya: "Para sa kasal, birthday, team building o custom event package, palihog kontaka ang Front Desk aron mahisgutan ang inyong kinahanglanon. Wala pay kumpirmadong package rates o discounts sa records. Tawag sa " + CONTACT_PRIMARY + " / " + CONTACT_ALTERNATE + " o email " + CONTACT_EMAIL + ".",
      spanish: "Para bodas, cumpleaños, actividades de equipo o eventos especiales, consulta directamente con recepción. Los precios y descuentos de paquetes personalizados no están confirmados en nuestros registros. Llama al " + CONTACT_PRIMARY + " o " + CONTACT_ALTERNATE + "; correo: " + CONTACT_EMAIL + ".",
      mandarin: "婚礼、生日、团队活动或定制活动套餐，请直接联系前台讨论需求。目前记录中没有已确认的定制套餐价格或折扣。电话：" + CONTACT_PRIMARY + " / " + CONTACT_ALTERNATE + "；邮箱：" + CONTACT_EMAIL + "。",
    },
    entrance_corkage: {
      english: "Entrance fees are separate from the 50% accommodation downpayment. The booking page shows an estimate; Front Desk confirms the applicable fees and discounts onsite. You may bring your own food and drinks with no corkage fee.",
      taglish: "**Entrance fee:** Separate po ito sa 50% accommodation downpayment at payable onsite. Estimate ang nasa booking page; Front Desk ang magco-confirm ng final fees at discounts.\n**Corkage:** Wala pong corkage fee. Puwede kayong magdala ng sariling food at drinks.",
      tagalog: "Hiwalay po ang entrance fee sa 50% na paunang bayad sa matutuluyan. Tantiya muna ang makikita sa booking page; ang Front Desk ang magkukumpirma ng final fees at naaangkop na diskuwento sa resort. Puwede pong magdala ng sariling pagkain at inumin nang walang corkage fee.",
      bisaya: "Lahi ang entrance fee sa 50% nga accommodation downpayment. Estimate lang sa booking page; ang Front Desk mag-confirm sa fees ug angay nga discounts didto sa resort. Pwede magdala sa kaugalingong pagkaon ug ilimnon ug walay corkage fee.",
      spanish: "La entrada se cobra aparte del anticipo del alojamiento del 50 %. La página de reservas muestra una estimación y recepción confirma las tarifas y descuentos aplicables. Puede traer su propia comida y bebidas sin cargo de descorche.",
      mandarin: "入场费不包含在住宿费用的 50% 订金中。预订页面提供估算，前台会在现场确认费用和适用优惠。允许自带食物和饮料，不收取外带费。",
    },
  };
  return variants[kind]?.[language] || null;
}

module.exports = {
  matchConciergeGuide, isMixedEntranceAndCorkage, conciergeGuideReply,
  CONTACT_PRIMARY, CONTACT_ALTERNATE, CONTACT_EMAIL,
};
