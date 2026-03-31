const { GoogleGenAI } = require("@google/genai");
const db = require("../config/db");

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
  if (text.includes("taglish")) return "taglish";
  if (text.includes("tagalog")) return "tagalog";
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

async function getAvailableRooms(checkIn, checkOut, guests) {
  const [rooms] = await db.promise().query(
    `
    SELECT
      r.id,
      r.room_name,
      r.description,
      r.price,
      r.capacity,
      r.bed_count,
      r.bed_type,
      r.view_type,
      r.aircon_type,
      r.amenities,
      r.image,
      r.status
    FROM rooms r
    WHERE r.status = 'available'
      AND r.capacity >= ?
      AND r.id NOT IN (
        SELECT b.room_id
        FROM bookings b
        WHERE b.status NOT IN ('cancelled', 'rejected')
          AND (? < b.check_out AND ? > b.check_in)
      )
    ORDER BY r.price ASC, r.capacity ASC
    `,
    [guests, checkIn, checkOut]
  );

  return rooms;
}

function filterRooms(rooms, filters) {
  let results = [...rooms];

  if (filters.bed_count) {
    const neededBeds = Number(filters.bed_count);
    if (!Number.isNaN(neededBeds)) {
      results = results.filter((room) => Number(room.bed_count || 0) >= neededBeds);
    }
  }

  if (filters.view_type) {
    const wantedView = normalizeText(filters.view_type);
    results = results.filter((room) => normalizeText(room.view_type) === wantedView);
  }

  if (filters.aircon_type) {
    const wantedAircon = normalizeText(filters.aircon_type);
    results = results.filter((room) => normalizeText(room.aircon_type) === wantedAircon);
  }

  if (filters.bed_type) {
    const wantedBedType = normalizeText(filters.bed_type);
    results = results.filter((room) => normalizeText(room.bed_type).includes(wantedBedType));
  }

  if (filters.max_price) {
    const maxPrice = Number(filters.max_price);
    if (!Number.isNaN(maxPrice)) {
      results = results.filter((room) => Number(room.price || 0) <= maxPrice);
    }
  }

  if (filters.room_id) {
    const wantedRoomId = Number(filters.room_id);
    if (!Number.isNaN(wantedRoomId)) {
      results = results.filter((room) => Number(room.id) === wantedRoomId);
    }
  }

  if (filters.room_name) {
    const wantedRoomName = normalizeText(filters.room_name);
    results = results.filter((room) => normalizeText(room.room_name).includes(wantedRoomName));
  }

  return results;
}

function buildRoomsSummary(rooms, nights) {
  if (!rooms.length) return "No matching rooms found.";

  return rooms
    .slice(0, 5)
    .map((room, index) => {
      const total = Number(room.price || 0) * Number(nights || 1);
      return [
        `${index + 1}. ${room.room_name}`,
        `   - Room ID: ${room.id}`,
        `   - Price per night: ₱${formatCurrency(room.price)}`,
        `   - Estimated total: ₱${formatCurrency(total)}`,
        `   - Capacity: ${room.capacity}`,
        `   - Bed count: ${room.bed_count || "N/A"}`,
        `   - Bed type: ${room.bed_type || "N/A"}`,
        `   - View type: ${room.view_type || "N/A"}`,
        `   - Aircon type: ${room.aircon_type || "N/A"}`,
        `   - Amenities: ${room.amenities || "N/A"}`,
        `   - Description: ${room.description || "N/A"}`,
      ].join("\n");
    })
    .join("\n\n");
}

function buildTopRecommendationSummary(rooms, nights) {
  if (!rooms.length) return "No strong recommendation available.";

  return rooms
    .slice(0, 3)
    .map((room, index) => {
      const total = Number(room.price || 0) * Number(nights || 1);
      return `${index + 1}. ${room.room_name} | ₱${formatCurrency(room.price)}/night | est. total ₱${formatCurrency(total)} | capacity ${room.capacity} | ${room.view_type || "no view info"} | ${room.aircon_type || "no aircon info"}`;
    })
    .join("\n");
}

async function findRoomByName(roomName) {
  const [rows] = await db.promise().query(
    `
    SELECT
      id,
      room_name,
      description,
      price,
      capacity,
      bed_count,
      bed_type,
      view_type,
      aircon_type,
      amenities,
      image,
      status
    FROM rooms
    WHERE LOWER(room_name) LIKE ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [`%${normalizeText(roomName)}%`]
  );

  return rows[0] || null;
}

async function getAlternativeDatesForRoom(roomId, checkIn, nights) {
  const suggestions = [];
  let daysToCheck = 0;

  while (suggestions.length < 4 && daysToCheck < 21) {
    const candidateCheckIn = addDays(checkIn, daysToCheck);
    const candidateCheckOut = addDays(candidateCheckIn, nights);

    const [conflicts] = await db.promise().query(
      `
      SELECT id
      FROM bookings
      WHERE room_id = ?
        AND status NOT IN ('cancelled', 'rejected')
        AND (? < check_out AND ? > check_in)
      LIMIT 1
      `,
      [roomId, candidateCheckIn, candidateCheckOut]
    );

    if (conflicts.length === 0) {
      suggestions.push({
        check_in: candidateCheckIn,
        check_out: candidateCheckOut,
        nights,
      });
    }

    daysToCheck++;
  }

  return suggestions;
}

function buildAlternativeSummary(alternatives) {
  if (!alternatives.length) return "No alternative dates found.";

  return alternatives
    .map((item, index) => `${index + 1}. Check-in: ${item.check_in}, Check-out: ${item.check_out}, Nights: ${item.nights}`)
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
- Return "english" if the message is mostly English.

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

  const extractionResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: extractionPrompt,
  });

  const parsed = extractJsonObject(extractionResponse.text || "");
  return parsed || {};
}

function buildBookingPreview(room, context, nights) {
  const pricePerNight = Number(room.price || 0);
  const totalPrice = pricePerNight * Number(nights || 1);
  const paymentMethod = normalizePaymentMethod(context.payment_method) || "cash";
  const paymentStatus = paymentMethod === "paypal" ? "pending" : "unpaid";

  return {
    room_id: room.id,
    room_name: room.room_name,
    image: room.image,
    check_in: context.check_in,
    check_in_time: context.check_in_time,
    check_out: context.check_out,
    check_out_time: context.check_out_time,
    guests: Number(context.guests),
    nights,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    price_per_night: pricePerNight,
    estimated_total: totalPrice,
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
    if (!mergedContext.language_style && detectedLanguage) {
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
    let roomSummary = "No live room availability was checked.";
    let topRecommendationSummary = "No strong recommendation available.";
    let alternativeDates = [];
    let alternativeSummary = "No alternative dates were checked.";
    let chosenRoom = null;
    let bookingPreview = null;

    const missingCoreDetails = getMissingCoreDetails(mergedContext);
    const hasAvailabilityDetails = hasEnoughForAvailability(mergedContext);

    if (hasAvailabilityDetails) {
      nights = getNightDifference(mergedContext.check_in, mergedContext.check_out);

      if (nights > 0) {
        availableRooms = await getAvailableRooms(
          mergedContext.check_in,
          mergedContext.check_out,
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

        roomSummary = buildRoomsSummary(matchedRooms, nights);
        topRecommendationSummary = buildTopRecommendationSummary(matchedRooms, nights);

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
              nights
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
        ? "Reply in natural Taglish."
        : "Reply in clear English.";

    const missingDetailsText = missingCoreDetails.length
      ? missingCoreDetails.join(", ")
      : "None";

    const finalPrompt = `
You are SmartResort's friendly booking assistant.
Be friendly, casual, and helpful like a resort staff assistant.

${replyLanguage}

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
- If rooms are available, recommend only the best 1 to 3 options.
- Briefly explain why each recommended room matches.
- If there are no exact matches, say that clearly and mention alternative dates if provided.
- If booking preview is ready, clearly tell the user they can press the confirm booking button.
- If the user wants to book but payment method is still missing, ask whether they prefer cash on arrival or PayPal.
- If the user wants to book but check-in time or check-out time is missing, ask for the missing time.
- If the user says online payment, explain that booking will be saved as pending online payment.
- If dates are invalid or nights is 0 or negative, ask the user to correct the dates.
- Prefer concise answers over long answers.

Saved booking context:
${JSON.stringify(mergedContext, null, 2)}

Live booking details:
- Check-in date: ${mergedContext.check_in || "Not provided"}
- Check-in time: ${mergedContext.check_in_time || "Not provided"}
- Check-out date: ${mergedContext.check_out || "Not provided"}
- Check-out time: ${mergedContext.check_out_time || "Not provided"}
- Guests: ${mergedContext.guests || "Not provided"}
- Nights: ${nights || "Not provided"}
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
    });

    return res.status(200).json({
      success: true,
      reply: response.text || "No response generated.",
      matched_rooms: matchedRooms.slice(0, 5),
      extracted_context: mergedContext,
      alternative_dates: alternativeDates,
      booking_preview: bookingPreview,
    });
  } catch (error) {
    console.error("chatWithGemini error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to chat with Gemini.",
      error: error.message,
    });
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return res.status(200).json({
      success: true,
      translated_text: response.text || "",
    });
  } catch (error) {
    console.error("translateReplyToTagalog error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to translate reply.",
      error: error.message,
    });
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return res.status(200).json({
      success: true,
      translated_text: response.text || "",
    });
  } catch (error) {
    console.error("translateReplyToTaglish error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to translate reply to Taglish.",
      error: error.message,
    });
  }
};

exports.createBookingFromChat = async (req, res) => {
  try {
    const {
      user_id,
      room_id,
      check_in,
      check_in_time,
      check_out,
      check_out_time,
      guests,
      payment_method,
    } = req.body;

    if (
      !user_id ||
      !room_id ||
      !check_in ||
      !check_in_time ||
      !check_out ||
      !check_out_time ||
      !guests
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing booking details from chat.",
      });
    }

    const startDate = new Date(check_in);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return res.status(400).json({
        success: false,
        message: "Check-in date cannot be in the past.",
      });
    }

    const nights = getNightDifference(check_in, check_out);
    if (nights < 1) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be at least one day after check-in.",
      });
    }

    const normalizedCheckInTime = normalizeTimeValue(check_in_time);
    const normalizedCheckOutTime = normalizeTimeValue(check_out_time);

    if (!normalizedCheckInTime || !normalizedCheckOutTime) {
      return res.status(400).json({
        success: false,
        message: "Check-in time and check-out time are required.",
      });
    }

    const [roomRows] = await db.promise().query(
      `SELECT * FROM rooms WHERE id = ? LIMIT 1`,
      [room_id]
    );

    if (roomRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Selected room not found.",
      });
    }

    const room = roomRows[0];

    if (String(room.status).toLowerCase() !== "available") {
      return res.status(400).json({
        success: false,
        message: "This room is currently unavailable.",
      });
    }

    if (Number(guests) > Number(room.capacity)) {
      return res.status(400).json({
        success: false,
        message: `This room can only accommodate up to ${room.capacity} guests.`,
      });
    }

    const [conflicts] = await db.promise().query(
      `
      SELECT id
      FROM bookings
      WHERE room_id = ?
        AND status NOT IN ('cancelled', 'rejected')
        AND (? < check_out AND ? > check_in)
      `,
      [room_id, check_in, check_out]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This room is no longer available for the selected dates.",
      });
    }

    const finalPaymentMethod = normalizePaymentMethod(payment_method) || "cash";
    const finalPaymentStatus =
      finalPaymentMethod === "paypal" ? "pending" : "unpaid";

    const [result] = await db.promise().query(
      `
      INSERT INTO bookings
      (
        user_id,
        room_id,
        check_in,
        check_out,
        check_in_time,
        check_out_time,
        guests,
        status,
        payment_method,
        payment_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        room_id,
        check_in,
        check_out,
        normalizedCheckInTime,
        normalizedCheckOutTime,
        guests,
        "pending",
        finalPaymentMethod,
        finalPaymentStatus,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Booking created successfully from AI chat.",
      bookingId: result.insertId,
    });
  } catch (error) {
    console.error("createBookingFromChat error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create booking from chat.",
      error: error.message,
    });
  }
};