const { GoogleGenAI } = require("@google/genai");
const db = require("../../config/db");
const { generateGemini, geminiPublicError, geminiErrorStatus } = require("./geminiResilience");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function normalizeText(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function extractJsonObject(text) {
  if (!text) return null;

  const direct = safeJsonParse(text);
  if (direct) return direct;

  const fencedMatch = String(text).match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch) {
    const parsed = safeJsonParse(fencedMatch[1].trim());
    if (parsed) return parsed;
  }

  const genericMatch = String(text).match(/\{[\s\S]*\}/);
  if (genericMatch) {
    const parsed = safeJsonParse(genericMatch[0]);
    if (parsed) return parsed;
  }

  return null;
}

function getNightDifference(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return formatDateOnly(date);
}

function cleanContextValue(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && !value.trim()) return null;
  return value;
}

function ensureFutureDate(dateString) {
  if (!dateString) return null;

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  if (parsed >= today) {
    return formatDateOnly(parsed);
  }

  parsed.setFullYear(parsed.getFullYear() + 1);
  return formatDateOnly(parsed);
}

function normalizePaymentMethod(value) {
  const text = normalizeText(value);

  if (!text) return null;
  if (text.includes("paypal")) return "paypal";
  if (text.includes("online")) return "paypal";
  if (text.includes("pay online")) return "paypal";
  if (text.includes("gcash")) return "paypal";
  if (text.includes("cash")) return "cash";

  return null;
}

function normalizeLanguageStyle(value) {
  const text = normalizeText(value);

  if (!text) return null;
  if (text.includes("taglish") || text.includes("filipino")) return "taglish";
  if (text.includes("tagalog")) return "tagalog";
  if (text.includes("spanish") || text.includes("español")) return "spanish";
  if (text.includes("mandarin") || text.includes("chinese") ||
      text.includes("中文") || text.includes("普通话")) return "mandarin";
  if (text.includes("english")) return "english";

  return null;
}

function normalizeTimeValue(value) {
  const text = String(value || "").trim();
  if (!text) return null;

  const timeMatch = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!timeMatch) return null;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const seconds = Number(timeMatch[3] || 0);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function detectLanguageFromMessage(message) {
  const text = normalizeText(message);
  if (!text) return null;

  // Mandarin characters are a reliable signal even after an English turn.
  if (/[\u3400-\u9FFF]/u.test(text)) return "mandarin";

  // Detect common Spanish resort questions without relying on prior
  // conversation settings. Single "para" is ambiguous with Tagalog.
  const spanishTokens = text.match(/\b(?:hola|habitaciones?|cu[aá]nto|cuesta|precios?|reservar|reservaci[oó]n|disponibles?|personas|noches|gracias|necesito|tenemos|quiero|busco|tienen|buenas|alojamiento)\b/giu) || [];
  if (spanishTokens.length >= 2 ||
      (/\b(?:hola|gracias|habitaciones?|cu[aá]nto|reservaci[oó]n)\b/iu.test(text)
        && spanishTokens.length > 0)) return "spanish";

  const tagalogWords = [
    "ako", "ikaw", "siya", "kami", "tayo", "kayo", "po", "opo", "naman",
    "gusto", "pwede", "puwede", "kuwarto", "kwarto", "magkano", "kailan",
    "saan", "petsa", "bayad", "bisita", "ilan", "meron", "wala", "naka",
    "lang", "muna", "nga", "dito", "iyan", "yan", "ito", "para", "pa",
    "paano", "hanggang", "mula", "oras"
  ];

  const englishWords = [
    "room", "booking", "check-in", "check-out", "guest", "payment", "price",
    "available", "recommend", "book", "cash", "online", "view", "aircon",
    "nights", "date", "dates", "how", "where", "what", "time"
  ];

  let tagalogScore = 0;
  let englishScore = 0;

  tagalogWords.forEach((word) => {
    if (text.includes(word)) tagalogScore++;
  });

  englishWords.forEach((word) => {
    if (text.includes(word)) englishScore++;
  });

  if (tagalogScore >= 2 && englishScore >= 2) return "taglish";
  if (tagalogScore >= 2 && englishScore === 0) return "tagalog";
  if (englishScore >= 2 && tagalogScore === 0) return "english";
  if (tagalogScore >= 1 && englishScore >= 1) return "taglish";

  return null;
}

function mergeContext(existing = {}, extracted = {}) {
  return {
    check_in: cleanContextValue(extracted.check_in) ?? cleanContextValue(existing.check_in),
    check_out: cleanContextValue(extracted.check_out) ?? cleanContextValue(existing.check_out),
    check_in_time:
      normalizeTimeValue(extracted.check_in_time) ||
      normalizeTimeValue(existing.check_in_time) ||
      null,
    check_out_time:
      normalizeTimeValue(extracted.check_out_time) ||
      normalizeTimeValue(existing.check_out_time) ||
      null,
    guests: cleanContextValue(extracted.guests) ?? cleanContextValue(existing.guests),
    bed_count: cleanContextValue(extracted.bed_count) ?? cleanContextValue(existing.bed_count),
    view_type: cleanContextValue(extracted.view_type) ?? cleanContextValue(existing.view_type),
    aircon_type: cleanContextValue(extracted.aircon_type) ?? cleanContextValue(existing.aircon_type),
    bed_type: cleanContextValue(extracted.bed_type) ?? cleanContextValue(existing.bed_type),
    max_price: cleanContextValue(extracted.max_price) ?? cleanContextValue(existing.max_price),
    room_name: cleanContextValue(extracted.room_name) ?? cleanContextValue(existing.room_name),
    room_id: cleanContextValue(extracted.room_id) ?? cleanContextValue(existing.room_id),
    intent: cleanContextValue(extracted.intent) ?? cleanContextValue(existing.intent),
    wants_booking: cleanContextValue(extracted.wants_booking) ?? cleanContextValue(existing.wants_booking),
    language_style:
      normalizeLanguageStyle(extracted.language_style) ||
      normalizeLanguageStyle(existing.language_style) ||
      null,
    payment_method:
      normalizePaymentMethod(extracted.payment_method) ||
      normalizePaymentMethod(existing.payment_method) ||
      null,
  };
}

function getMissingCoreDetails(context = {}) {
  const missing = [];
  if (!context.check_in) missing.push("check-in date");
  if (!context.check_in_time) missing.push("check-in time");
  if (!context.check_out) missing.push("check-out date");
  if (!context.check_out_time) missing.push("check-out time");
  if (!context.guests) missing.push("number of guests");
  return missing;
}

function hasEnoughForAvailability(context = {}) {
  return Boolean(
    context.check_in &&
      context.check_in_time &&
      context.check_out &&
      context.check_out_time &&
      context.guests
  );
}

function hasEnoughForBookingPreview(context = {}, chosenRoom = null, nights = 0) {
  return Boolean(
    chosenRoom &&
      context.check_in &&
      context.check_in_time &&
      context.check_out &&
      context.check_out_time &&
      context.guests &&
      nights > 0
  );
}

// Preliminary AI availability must reflect the active reservation system,
// never the retired rooms/bookings tables. Final validation always happens
// again in the secure Customer reservation workflow.
function isValidAiStayWindow(context) {
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const ci = String(context.check_in || "");
  const co = String(context.check_out || "");
  const it = normalizeTimeValue(context.check_in_time);
  const ot = normalizeTimeValue(context.check_out_time);
  if (!dateRe.test(ci) || !dateRe.test(co) || !it || !ot) return false;
  const start = new Date(ci + "T" + it);
  const finish = new Date(co + "T" + ot);
  return Number.isFinite(start.getTime()) &&
    Number.isFinite(finish.getTime()) &&
    finish.getTime() > start.getTime();
}

async function getAvailableRooms(checkIn, checkInTime, checkOut, checkOutTime, guests) {
  const [rooms] = await db.promise().query(
    `
    SELECT
      a.id, a.name AS room_name, a.description, a.image, a.amenities,
      a.status, a.max_capacity AS capacity, a.day_price, a.overnight_price,
      a.extended_price, c.name AS category_name
    FROM accommodations a
    JOIN accommodation_categories c ON c.id = a.category_id
    WHERE LOWER(COALESCE(a.status, '')) = 'available'
      AND a.max_capacity >= ?
      AND NOT EXISTS (
        SELECT 1 FROM reservation_items ri
        JOIN reservations r ON r.id = ri.reservation_id
        WHERE ri.accommodation_id = a.id
          AND LOWER(COALESCE(r.reservation_status, 'pending'))
            NOT IN ('cancelled', 'rejected', 'completed')
          AND LOWER(COALESCE(r.payment_status, 'pending'))
            NOT IN ('rejected', 'refunded')
          AND TIMESTAMP(ri.check_in_date, ri.check_in_time) < TIMESTAMP(?, ?)
          AND TIMESTAMP(?, ?) < TIMESTAMP(ri.check_out_date, ri.check_out_time)
      )
    ORDER BY a.day_price ASC, a.max_capacity ASC
    `,
    [guests, checkOut, checkOutTime, checkIn, checkInTime],
  );
  return rooms;
}

// Fresh read-only catalog for general accommodation questions. Admin
// create/edit/status changes are reflected on the NEXT relevant AI request.
// Never cache this response as a reservation-availability result.
async function getAccommodationCatalog() {
  const [rows] = await db.promise().query(
    `
    SELECT
      a.id, a.name AS room_name, a.description, a.amenities, a.status,
      a.max_capacity AS capacity, a.day_price, a.overnight_price,
      a.extended_price, c.name AS category_name
    FROM accommodations a
    JOIN accommodation_categories c ON c.id = a.category_id
    ORDER BY a.id DESC
    LIMIT 150
    `,
  );
  return rows;
}

function isAccommodationInquiry(message, context) {
  const intent = normalizeText(context.intent);
  if (["ask_recommendation", "ask_availability", "ask_price"].includes(intent)) {
    return true;
  }
  if (context.room_name || context.room_id || context.max_price ||
      context.guests || context.wants_booking === true) return true;
  return /room|cottage|accommodat|pavilion|function area|villa|poolside|pool side|capacity|rates?|prices?|amenit|budget|overnight|day tour|kuwarto|kwarto|kubo|kottage|magkano|matutuluyan|房间|客房|住宿|价格|房价|酒店房|habitaci[oó]n|alojamiento|caba[nñ]a/i
    .test(String(message || ""));
}

function preferredAccommodationType(message, context) {
  const text = normalizeText(String(message || "") + " " + String(context.room_name || ""));
  if (/\bcottages?\b|\bkubo\b|\bkottage\b/.test(text)) return "cottage";
  if (/\bpavilions?\b/.test(text)) return "pavilion";
  if (/\bfunction\s*(area|hall|room)\b/.test(text)) return "function";
  if (/\brooms?\b|\bkwarto\b|\bkuwarto\b|\bhabitaci[oó]n\b|房间|客房/.test(text)) return "room";
  return null;
}

function catalogMatchFilter(rooms, context, message) {
  const selectedType = preferredAccommodationType(message, context);
  const name = normalizeText(context.room_name || "");
  const guestCount = Number(context.guests || 0);
  const budget = Number(context.max_price || 0);
  const isOvernight = /\bovernight\b|\bnight\b|\bgabi\b|\bnoche\b/.test(normalizeText(message));
  const isDayTour = /\bday\s*tour\b|\bdaytime\b|\baraw\b/.test(normalizeText(message));
  return rooms.filter(room => {
    if (name && !normalizeText(room.room_name).includes(name)) return false;
    if (context.room_id && Number(room.id) !== Number(context.room_id)) return false;
    if (selectedType &&
        !normalizeText(room.category_name).includes(selectedType) &&
        !normalizeText(room.room_name).includes(selectedType)) return false;
    if (guestCount > 0 && Number(room.capacity) < guestCount) return false;
    if (budget > 0 && Number.isFinite(budget)) {
      const day = Number(room.day_price || 0);
      const overnight = Number(room.overnight_price || 0);
      if (isOvernight ? (!overnight || overnight > budget)
        : isDayTour ? (!day || day > budget)
        : (!day || day > budget) && (!overnight || overnight > budget)) return false;
    }
    return true;
  });
}

function buildCatalogSummary(catalog, context, message) {
  const byCategory = {};
  for (const room of catalog) {
    const label = String(room.category_name || "Other");
    byCategory[label] = (byCategory[label] || 0) + 1;
  }
  const matches = catalogMatchFilter(catalog, context, message);
  const recommendable = matches.filter(room =>
    normalizeText(room.status) === "available");
  const unavailable = matches.filter(room =>
    normalizeText(room.status) !== "available");

  const sorted = recommendable.slice().sort((a, b) => {
    const priceA = Math.min(...[a.day_price, a.overnight_price]
      .map(Number).filter(x => Number.isFinite(x) && x > 0).concat([Infinity]));
    const priceB = Math.min(...[b.day_price, b.overnight_price]
      .map(Number).filter(x => Number.isFinite(x) && x > 0).concat([Infinity]));
    return priceA - priceB || Number(a.id) - Number(b.id);
  });

  const formatRoom = room => [
    "ID " + room.id + ": " + room.room_name + " (" +
      (room.category_name || "Uncategorized") + ")",
    "Admin status: " + (room.status || "unknown"),
    "Maximum guests: " + room.capacity,
    "Day Tour: PHP " + formatCurrency(room.day_price),
    "Overnight: PHP " + formatCurrency(room.overnight_price),
    "Extended: PHP " + formatCurrency(room.extended_price),
    "Amenities: " + (room.amenities || "Not specified"),
    "Description: " + (room.description || "Not provided"),
  ].join(" | ");

  const categories = Object.entries(byCategory)
    .map(([name, count]) => name + " (" + count + ")").join(", ");
  const highlights = sorted.slice(0, 5);
  return {
    summary: [
      "CURRENT ADMIN-MANAGED ACCOMMODATION CATALOG (fresh database read):",
      "Records retrieved: " + catalog.length + " (maximum 150 per request).",
      "Categories: " + (categories || "None"),
      "Filter matches: " + matches.length +
        "; status-available candidates: " + recommendable.length + ".",
      "NOTE: Admin status available means listed for use, NOT a verified booking slot.",
      "Final dates, time slots, conflicts and price are verified by booking flow.",
      "SUGGESTED CANDIDATES (not availability-confirmed):",
      ...(highlights.length ? highlights.map(formatRoom) :
        ["No currently listed candidate matches the requested type/capacity/budget."]),
      "MATCHING UNAVAILABLE OR MAINTENANCE RECORDS:",
      ...(unavailable.length ? unavailable.slice(0, 3).map(formatRoom) : ["None"]),
      "NEWEST ADDED ACCOMMODATIONS (by latest record ID; not necessarily available):",
      ...catalog.slice(0, 4).map(formatRoom),
    ].join("\n"),
    recommendations: highlights.map(room => ({
      id: room.id, name: room.room_name, category: room.category_name,
      capacity: room.capacity, day_price: room.day_price,
      overnight_price: room.overnight_price, status: room.status,
      availability_verified: false,
    })),
  };
}

function filterRooms(rooms, filters) {
  // The current accommodations table does not contain structured bed, view
  // or aircon fields. Do not claim those preferences were verified.
  return rooms.filter((room) => {
    if (filters.max_price) {
      const maxPrice = Number(filters.max_price);
      if (Number.isFinite(maxPrice) && maxPrice > 0 &&
          Number(room.day_price || 0) > maxPrice &&
          Number(room.overnight_price || 0) > maxPrice) return false;
    }
    if (filters.room_id && Number(room.id) !== Number(filters.room_id)) {
      return false;
    }
    if (filters.room_name && !normalizeText(room.room_name)
        .includes(normalizeText(filters.room_name))) return false;
    return true;
  });
}

function buildRoomsSummary(rooms) {
  if (!rooms.length) return "No matching accommodations found for the requested window.";
  return rooms.slice(0, 5).map((room, index) => [
    String(index + 1) + ". " + room.room_name,
    "   - Accommodation ID: " + room.id,
    "   - Category: " + (room.category_name || "N/A"),
    "   - Day Tour: PHP " + formatCurrency(room.day_price),
    "   - Overnight: PHP " + formatCurrency(room.overnight_price),
    "   - Extended: PHP " + formatCurrency(room.extended_price),
    "   - Maximum capacity: " + room.capacity,
    "   - Listed amenities: " + (room.amenities || "Not specified"),
    "   - Description: " + (room.description || "Not provided"),
  ].join("\n")).join("\n\n");
}

function buildTopRecommendationSummary(rooms) {
  if (!rooms.length) return "No matching recommendation is available.";
  return rooms.slice(0, 3).map((room, index) =>
    String(index + 1) + ". " + room.room_name +
    " | Day PHP " + formatCurrency(room.day_price) +
    " | Overnight PHP " + formatCurrency(room.overnight_price) +
    " | Capacity " + room.capacity
  ).join("\n");
}

async function findRoomByName(roomName) {
  const [rows] = await db.promise().query(
    "SELECT a.id, a.name AS room_name, a.description, a.image, " +
    "a.amenities, a.status, a.max_capacity AS capacity, a.day_price, " +
    "a.overnight_price, a.extended_price, c.name AS category_name " +
    "FROM accommodations a JOIN accommodation_categories c ON c.id = a.category_id " +
    "WHERE LOWER(a.name) LIKE ? ORDER BY a.id DESC LIMIT 1",
    ["%" + normalizeText(roomName) + "%"],
  );
  return rows[0] || null;
}

async function getAlternativeDatesForRoom(
  accommodationId, checkIn, checkOut, checkInTime, checkOutTime
) {
  const suggestions = [];
  const daySpan = getNightDifference(checkIn, checkOut);
  if (!Number.isInteger(daySpan) || daySpan < 0) return suggestions;
  let daysToCheck = 1;
  while (suggestions.length < 4 && daysToCheck <= 21) {
    const candidateCheckIn = addDays(checkIn, daysToCheck);
    const candidateCheckOut = addDays(candidateCheckIn, daySpan);
    const [conflicts] = await db.promise().query(
      "SELECT ri.id FROM reservation_items ri " +
      "JOIN reservations r ON r.id = ri.reservation_id " +
      "WHERE ri.accommodation_id = ? " +
      "AND LOWER(COALESCE(r.reservation_status, 'pending')) " +
      "NOT IN ('cancelled','rejected','completed') " +
      "AND LOWER(COALESCE(r.payment_status, 'pending')) " +
      "NOT IN ('rejected','refunded') " +
      "AND TIMESTAMP(ri.check_in_date, ri.check_in_time) < TIMESTAMP(?, ?) " +
      "AND TIMESTAMP(?, ?) < TIMESTAMP(ri.check_out_date, ri.check_out_time) LIMIT 1",
      [accommodationId, candidateCheckOut, checkOutTime,
        candidateCheckIn, checkInTime],
    );
    if (conflicts.length === 0) {
      suggestions.push({
        check_in: candidateCheckIn,
        check_out: candidateCheckOut,
        check_in_time: checkInTime,
        check_out_time: checkOutTime,
      });
    }
    daysToCheck++;
  }
  return suggestions;
}

function buildAlternativeSummary(alternatives) {
  if (!alternatives.length) return "No alternative dates found.";

  return alternatives
    .map((item, index) => `${index + 1}. Check-in: ${item.check_in} ${item.check_in_time}, Check-out: ${item.check_out} ${item.check_out_time} (preliminary)`)
    .join("\n");
}

async function extractStructuredIntent(message, existingContext = {}) {
  const today = new Date();
  const todayText = formatDateOnly(today);

  const extractionPrompt = `
You are extracting booking details from a resort customer message.

Return ONLY valid JSON.
Do not add markdown.
Do not explain anything.

Use this exact JSON shape:
{
  "intent": "",
  "check_in": null,
  "check_in_time": null,
  "check_out": null,
  "check_out_time": null,
  "guests": null,
  "bed_count": null,
  "view_type": null,
  "aircon_type": null,
  "bed_type": null,
  "max_price": null,
  "room_name": null,
  "room_id": null,
  "wants_booking": false,
  "language_style": "english",
  "payment_method": null
}

Important date rules:
- Today is ${todayText}.
- Dates must be returned in YYYY-MM-DD format.
- If the user gives month/day without a year, choose the nearest FUTURE valid year.
- Never return a past date unless the user clearly asked for a past date.
- If the month/day this year is already past, use next year.

Time rules:
- Return time in HH:MM:SS 24-hour format if the user gives a specific time.
- If time is not mentioned, return null.
- Examples:
  - 2 PM => 14:00:00
  - 11:30 AM => 11:30:00
  - 14:00 => 14:00:00

Payment method rules:
- If user says cash, cash on arrival, or pay in person, set payment_method to "cash".
- If user says online payment, paypal, pay online, gcash, or card, set payment_method to "paypal".

language_style rules:
- Return "tagalog" if the message is mostly Tagalog.
- Return "taglish" if the message is mixed Tagalog and English.
- Return "spanish" if the message is mostly Spanish.
- Return "mandarin" if the message is Mandarin Chinese (including Simplified Chinese characters).
- Return "english" if the message is mostly English.
- Do not infer a different language merely because stored conversation context uses one.

Allowed intent values:
- ask_recommendation
- ask_availability
- ask_alternative_dates
- ask_price
- ask_booking_help
- general_question

Allowed aircon_type examples:
- aircon
- non-aircon

Current saved context:
${JSON.stringify(existingContext, null, 2)}

Customer message:
${message}
`;

  const extractionResponse = await generateGemini(ai, extractionPrompt);

  const parsed = extractJsonObject(extractionResponse.text || "");
  return parsed || {};
}

function buildBookingPreview(room, context, stayDays) {
  // Suggestion only. The secure booking form determines slot-specific price.
  return {
    booking_schema: "accommodations_v2",
    room_id: room.id,
    room_name: room.room_name,
    image: room.image,
    check_in: context.check_in,
    check_in_time: context.check_in_time,
    check_out: context.check_out,
    check_out_time: context.check_out_time,
    guests: Number(context.guests),
    nights: stayDays,
    day_price: Number(room.day_price || 0),
    overnight_price: Number(room.overnight_price || 0),
    extended_price: Number(room.extended_price || 0),
  };
}

exports.chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing in .env",
      });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const requestContext = {
      check_in: req.body.check_in,
      check_in_time: req.body.check_in_time,
      check_out: req.body.check_out,
      check_out_time: req.body.check_out_time,
      guests: req.body.guests,
      bed_count: req.body.bed_count,
      view_type: req.body.view_type,
      aircon_type: req.body.aircon_type,
      bed_type: req.body.bed_type,
      max_price: req.body.max_price,
      room_name: req.body.room_name,
      room_id: req.body.room_id,
      intent: req.body.intent,
      wants_booking: req.body.wants_booking,
      language_style: req.body.language_style,
      payment_method: req.body.payment_method,
      ...(req.body.context || {}),
    };

    const extractedContext = await extractStructuredIntent(message, requestContext);
    const mergedContext = mergeContext(requestContext, extractedContext);

    const detectedLanguage = detectLanguageFromMessage(message);
    // Only the live voice mode locks response language. Normal text chat
    // adapts to each new message while retaining previous booking details.
    const fixedVoiceLanguage = normalizeLanguageStyle(req.body.voice_language);
    if (fixedVoiceLanguage) {
      mergedContext.language_style = fixedVoiceLanguage;
    } else if (detectedLanguage) {
      mergedContext.language_style = detectedLanguage;
    }

    if (mergedContext.check_in) {
      mergedContext.check_in = ensureFutureDate(mergedContext.check_in);
    }

    if (mergedContext.check_out) {
      mergedContext.check_out = ensureFutureDate(mergedContext.check_out);
    }

    let nights = 0;
    let matchedRooms = [];
    let availableRooms = [];
    let roomSummary = "No availability has been verified. Please provide valid check-in/out dates and times.";
    let topRecommendationSummary = "No strong recommendation available.";
    let alternativeDates = [];
    let alternativeSummary = "No alternative dates were checked.";
    let chosenRoom = null;
    let bookingPreview = null;

    const missingCoreDetails = getMissingCoreDetails(mergedContext);
    const hasAvailabilityDetails = hasEnoughForAvailability(mergedContext) &&
      isValidAiStayWindow(mergedContext);

    if (hasAvailabilityDetails) {
      nights = Math.max(1, getNightDifference(mergedContext.check_in, mergedContext.check_out));

      if (nights > 0) {
        availableRooms = await getAvailableRooms(
          mergedContext.check_in,
          mergedContext.check_in_time,
          mergedContext.check_out,
          mergedContext.check_out_time,
          Number(mergedContext.guests)
        );

        matchedRooms = filterRooms(availableRooms, {
          bed_count: mergedContext.bed_count,
          view_type: mergedContext.view_type,
          aircon_type: mergedContext.aircon_type,
          bed_type: mergedContext.bed_type,
          max_price: mergedContext.max_price,
          room_id: mergedContext.room_id,
          room_name: mergedContext.room_name,
        });

        roomSummary = buildRoomsSummary(matchedRooms);
        topRecommendationSummary = buildTopRecommendationSummary(matchedRooms);

        if (matchedRooms.length > 0) {
          chosenRoom = matchedRooms[0];

          if (mergedContext.room_id) {
            const exactRoom = matchedRooms.find(
              (room) => Number(room.id) === Number(mergedContext.room_id)
            );
            if (exactRoom) chosenRoom = exactRoom;
          }

          if (mergedContext.room_name) {
            const byName = matchedRooms.find((room) =>
              normalizeText(room.room_name).includes(normalizeText(mergedContext.room_name))
            );
            if (byName) chosenRoom = byName;
          }

          if (
            mergedContext.wants_booking === true &&
            hasEnoughForBookingPreview(mergedContext, chosenRoom, nights)
          ) {
            bookingPreview = buildBookingPreview(chosenRoom, mergedContext, nights);
          }
        } else {
          if (mergedContext.room_id) {
            chosenRoom =
              availableRooms.find((room) => Number(room.id) === Number(mergedContext.room_id)) ||
              null;
          }

          if (!chosenRoom && mergedContext.room_name) {
            chosenRoom = await findRoomByName(mergedContext.room_name);
          }

          if (chosenRoom) {
            alternativeDates = await getAlternativeDatesForRoom(
              chosenRoom.id,
              mergedContext.check_in,
              mergedContext.check_out,
              mergedContext.check_in_time,
              mergedContext.check_out_time
            );
            alternativeSummary = buildAlternativeSummary(alternativeDates);
          }
        }
      }
    }

    const paymentMethodText =
      mergedContext.payment_method === "paypal"
        ? "PayPal / online payment"
        : mergedContext.payment_method === "cash"
        ? "Cash on arrival"
        : "Not provided";

    const replyLanguage =
      mergedContext.language_style === "tagalog"
        ? "Reply in natural Tagalog."
        : mergedContext.language_style === "taglish"
        ? "Reply in natural Taglish (Filipino and English)."
        : mergedContext.language_style === "spanish"
        ? "Reply entirely in natural Spanish."
        : mergedContext.language_style === "mandarin"
        ? "Reply entirely in Mandarin Chinese, using Simplified Chinese characters."
        : "Reply in clear English.";

    const missingDetailsText = missingCoreDetails.length
      ? missingCoreDetails.join(", ")
      : "None";

    const finalPrompt = `
You are SmartResort's friendly booking assistant.
Be friendly, casual, and helpful like a resort staff assistant.

${replyLanguage}

${fixedVoiceLanguage ? `
LIVE SPOKEN CONVERSATION (important):
- Speak naturally like a warm, attentive human resort receptionist, not a text-reading robot.
- Respond directly to what the guest just said, as in a real conversation.
- Usually use one or two short sentences, ideally under 55 words.
- Ask at most ONE useful follow-up question per turn.
- Avoid repetitive greetings, stiff scripts, excessive apologies, bullet lists, numbered lists, and repeating dates/guest counts unnecessarily.
- Do not recite saved context or booking summaries unless the guest asks.
- Use natural conversational pacing and everyday words suitable for speech.
- Answer in the requested fixed voice language above, regardless of the language of the transcript.
- Only explain rates, availability, or policies that are supported by system data. Never invent or promise a booking.
` : ""}

Important rules:
- Only use the room/system data provided below.
- Do not invent rooms, prices, amenities, availability, or times.
- Do not use markdown symbols like **, *, #, or messy formatting.
- Use clean short paragraphs or simple numbered points only when needed.
- Keep replies easy to read in a chat window.
- Keep replies practical and not too long.
- Do not repeat saved details unless useful.
- Do not ask again for information that is already saved.
- If details are incomplete, ask ONLY for the missing important detail(s).
- Missing core details right now: ${missingDetailsText}
- These are preliminary availability results for the exact requested window; final slot availability is rechecked on the booking page.
- Day, overnight and extended rates are different. Never call a day rate a nightly price or invent a total.
- Structured bed count, view and aircon details are not verified; do not promise them.
- If rooms are available, recommend only the best 1 to 3 options.
- Briefly explain why each recommended room matches.
- If there are no exact matches, say that clearly and mention alternative dates if provided.
- A booking suggestion is NOT a reservation. Tell the user to press Continue to Booking, then confirm dates, slot price, and payment on the secure reservation page.
- Explain that payment options are confirmed on the secure Customer booking/payment page; do not promise cash on arrival for online reservations.
- If the user wants to book but check-in time or check-out time is missing, ask for the missing time.
- Online payments are finalized only on the secure Customer booking/payment page. Never imply an AI chat creates a reservation.
- If the date/time range is invalid, ask the user to correct both dates and times. Same-day day tours may be valid if checkout is later than check-in.
- Prefer concise answers over long answers.

Saved booking context:
${JSON.stringify(mergedContext, null, 2)}

Live booking details:
- Check-in date: ${mergedContext.check_in || "Not provided"}
- Check-in time: ${mergedContext.check_in_time || "Not provided"}
- Check-out date: ${mergedContext.check_out || "Not provided"}
- Check-out time: ${mergedContext.check_out_time || "Not provided"}
- Guests: ${mergedContext.guests || "Not provided"}
- Requested stay day count (same-day tour = 1): ${nights || "Not yet verified"}
- Payment method: ${paymentMethodText}
- Preferred language style: ${mergedContext.language_style || "english"}

Missing core details:
${missingDetailsText}

Top recommendations:
${topRecommendationSummary}

Matching room results:
${roomSummary}

Alternative date suggestions:
${alternativeSummary}

Booking preview:
${bookingPreview ? JSON.stringify(bookingPreview, null, 2) : "Not ready"}

Customer message:
${message}
`;

    const response = await generateGemini(ai, finalPrompt);

    return res.status(200).json({
      success: true,
      reply: response.text || "No response generated.",
      matched_rooms: matchedRooms.slice(0, 5),
      extracted_context: mergedContext,
      alternative_dates: alternativeDates,
      booking_preview: bookingPreview,
    });
  } catch (error) {
    const failure = geminiPublicError(error);
    console.warn("Gemini request failed (HTTP " + geminiErrorStatus(error) + ").");
    return res.status(failure.status).json(failure.body);
  }
};

exports.translateReplyToEnglish = async (req, res) => {
  try {
    const inputText = String(req.body?.text || "").trim();
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false, message: "The AI translation service is not configured.",
      });
    }
    if (!inputText) {
      return res.status(400).json({
        success: false, message: "Text is required for translation.",
      });
    }
    const prompt = [
      "Translate the following SmartResort AI assistant reply into fluent, natural English.",
      "Preserve accommodation names, dates, times, prices, rates, numbers,",
      "and all important booking or payment details exactly. Do not invent facts.",
      "Use a friendly and clear resort receptionist tone.",
      "Do not include markdown, explanations, or notes; return only the translation.",
      "",
      "Text:",
      inputText,
    ].join("\n");
    const response = await generateGemini(ai, prompt);
    return res.status(200).json({
      success: true, translated_text: response.text || "",
    });
  } catch (error) {
    const failure = geminiPublicError(error);
    console.warn("Gemini English translation failed (HTTP " +
      geminiErrorStatus(error) + ").");
    return res.status(failure.status).json(failure.body);
  }
};

exports.translateReplyToTagalog = async (req, res) => {
  try {
    const { text } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing in .env",
      });
    }

    if (!text || !String(text).trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required for translation.",
      });
    }

    const prompt = `
Translate the following SmartResort AI assistant reply into natural, easy-to-understand Tagalog.

Rules:
- Keep the meaning exactly the same.
- Keep dates, times, room names, prices, and booking details accurate.
- Do not add information.
- Do not remove important information.
- Use natural Tagalog that a normal resort guest can easily understand.
- Keep the tone friendly and helpful.
- Do not use markdown symbols like ** or #.
- Return only the translated text.

Text:
${text}
`;

    const response = await generateGemini(ai, prompt);

    return res.status(200).json({
      success: true,
      translated_text: response.text || "",
    });
  } catch (error) {
    const failure = geminiPublicError(error);
    console.warn("Gemini request failed (HTTP " + geminiErrorStatus(error) + ").");
    return res.status(failure.status).json(failure.body);
  }
};

exports.translateReplyToTaglish = async (req, res) => {
  try {
    const { text } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing in .env",
      });
    }

    if (!text || !String(text).trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required for translation.",
      });
    }

    const prompt = `
Translate the following SmartResort AI assistant reply into natural Taglish.

Rules:
- Keep the meaning exactly the same.
- Keep dates, times, room names, prices, and booking details accurate.
- Do not add information.
- Do not remove important information.
- Use natural Taglish that normal Filipino resort guests can easily understand.
- Blend English and Tagalog naturally.
- Keep the tone friendly, casual, and helpful.
- Do not use markdown symbols like ** or #.
- Return only the translated text.

Text:
${text}
`;

    const response = await generateGemini(ai, prompt);

    return res.status(200).json({
      success: true,
      translated_text: response.text || "",
    });
  } catch (error) {
    const failure = geminiPublicError(error);
    console.warn("Gemini request failed (HTTP " + geminiErrorStatus(error) + ").");
    return res.status(failure.status).json(failure.body);
  }
};

// Retired the legacy AI direct booking writer. All reservations use /api/bookings.
