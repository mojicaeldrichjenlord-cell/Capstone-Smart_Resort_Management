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

function mergeContext(existing = {}, extracted = {}) {
  return {
    check_in: cleanContextValue(extracted.check_in) ?? cleanContextValue(existing.check_in),
    check_out: cleanContextValue(extracted.check_out) ?? cleanContextValue(existing.check_out),
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
    language_style: cleanContextValue(extracted.language_style) ?? cleanContextValue(existing.language_style),
    payment_method:
      normalizePaymentMethod(extracted.payment_method) ||
      normalizePaymentMethod(existing.payment_method) ||
      null,
  };
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
  "check_out": null,
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

Payment method rules:
- If user says cash, cash on arrival, or pay in person, set payment_method to "cash".
- If user says online payment, paypal, pay online, gcash, or card, set payment_method to "paypal".

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

language_style must be one of:
- english
- tagalog
- taglish

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
    check_out: context.check_out,
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
      check_out: req.body.check_out,
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
    let alternativeDates = [];
    let alternativeSummary = "No alternative dates were checked.";
    let chosenRoom = null;
    let bookingPreview = null;

    const hasBookingCoreDetails =
      mergedContext.check_in &&
      mergedContext.check_out &&
      mergedContext.guests;

    if (hasBookingCoreDetails) {
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

          if (mergedContext.wants_booking === true) {
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

    const finalPrompt = `
You are SmartResort's friendly booking assistant.
You can reply in English, Tagalog, or Taglish depending on the user's style.
Be friendly, casual, and helpful like a resort staff assistant.

Important rules:
- Only use the room/system data provided below.
- Do not invent rooms, prices, amenities, or availability.
- Do not use markdown symbols like **, *, #, or messy formatting.
- Use clean short paragraphs or simple numbered points only when needed.
- Keep the format easy to read in a chat window.
- If the customer has not yet provided complete booking details, ask only for the missing important detail(s).
- Missing important details for availability are:
  1. check-in
  2. check-out
  3. guests
- Payment method is optional until booking confirmation, but if missing and the user wants to book, ask whether they prefer cash on arrival or online payment via PayPal.
- If the user says online payment, explain that the booking will be saved as pending online payment for now.
- If the user already gave some preferences, remember them and use them.
- If there are matching rooms, recommend the best 1 to 3 options only.
- If there are no matching rooms, clearly say that and suggest other available dates if provided.
- If booking preview is available, clearly tell the user that booking is ready and they can press the confirm booking button.
- Keep replies practical, clear, and not too long.
- Mention price when helpful.
- Mention why the room matches the user's request.

Saved booking context:
${JSON.stringify(mergedContext, null, 2)}

Live booking details:
- Check-in: ${mergedContext.check_in || "Not provided"}
- Check-out: ${mergedContext.check_out || "Not provided"}
- Guests: ${mergedContext.guests || "Not provided"}
- Nights: ${nights || "Not provided"}
- Payment method: ${paymentMethodText}

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

exports.createBookingFromChat = async (req, res) => {
  try {
    const {
      user_id,
      room_id,
      check_in,
      check_out,
      guests,
      payment_method,
    } = req.body;

    if (!user_id || !room_id || !check_in || !check_out || !guests) {
      return res.status(400).json({
        success: false,
        message: "Missing booking details from chat.",
      });
    }

    const startDate = new Date(check_in);
    const endDate = new Date(check_out);
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
      (user_id, room_id, check_in, check_out, guests, status, payment_method, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        room_id,
        check_in,
        check_out,
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