const db = require("../config/db");

function normalizeText(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
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

function getNightDifference(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

async function getAvailableRoomsInternal(check_in, check_out, guests) {
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
    [guests, check_in, check_out]
  );

  return rooms;
}

exports.getAvailableRooms = async (req, res) => {
  try {
    const { check_in, check_out, guests } = req.query;

    if (!check_in || !check_out || !guests) {
      return res.status(400).json({
        success: false,
        message: "check_in, check_out, and guests are required.",
      });
    }

    const guestCount = Number(guests);

    if (Number.isNaN(guestCount) || guestCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Guests must be a valid number greater than 0.",
      });
    }

    const nights = getNightDifference(check_in, check_out);

    if (nights < 1) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be at least one day after check-in.",
      });
    }

    const rooms = await getAvailableRoomsInternal(check_in, check_out, guestCount);

    return res.status(200).json({
      success: true,
      check_in,
      check_out,
      guests: guestCount,
      nights,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("getAvailableRooms AI error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check available rooms.",
      error: error.message,
    });
  }
};

exports.recommendRooms = async (req, res) => {
  try {
    const {
      check_in,
      check_out,
      guests,
      bed_count,
      view_type,
      aircon_type,
      bed_type,
      max_price,
    } = req.body;

    if (!check_in || !check_out || !guests) {
      return res.status(400).json({
        success: false,
        message: "check_in, check_out, and guests are required.",
      });
    }

    const guestCount = Number(guests);
    const requestedBedCount = bed_count ? Number(bed_count) : null;
    const requestedMaxPrice = max_price ? Number(max_price) : null;

    if (Number.isNaN(guestCount) || guestCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Guests must be a valid number greater than 0.",
      });
    }

    const nights = getNightDifference(check_in, check_out);

    if (nights < 1) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be at least one day after check-in.",
      });
    }

    let rooms = await getAvailableRoomsInternal(check_in, check_out, guestCount);

    if (requestedBedCount && !Number.isNaN(requestedBedCount)) {
      rooms = rooms.filter((room) => Number(room.bed_count || 0) >= requestedBedCount);
    }

    if (view_type) {
      const wantedView = normalizeText(view_type);
      rooms = rooms.filter(
        (room) => normalizeText(room.view_type) === wantedView
      );
    }

    if (aircon_type) {
      const wantedAircon = normalizeText(aircon_type);
      rooms = rooms.filter(
        (room) => normalizeText(room.aircon_type) === wantedAircon
      );
    }

    if (bed_type) {
      const wantedBedType = normalizeText(bed_type);
      rooms = rooms.filter((room) =>
        normalizeText(room.bed_type).includes(wantedBedType)
      );
    }

    if (requestedMaxPrice && !Number.isNaN(requestedMaxPrice)) {
      rooms = rooms.filter((room) => Number(room.price || 0) <= requestedMaxPrice);
    }

    const recommendedRooms = rooms.map((room) => ({
      ...room,
      estimated_total: Number(room.price || 0) * nights,
    }));

    return res.status(200).json({
      success: true,
      check_in,
      check_out,
      guests: guestCount,
      nights,
      filters: {
        bed_count: requestedBedCount,
        view_type: view_type || "",
        aircon_type: aircon_type || "",
        bed_type: bed_type || "",
        max_price: requestedMaxPrice,
      },
      count: recommendedRooms.length,
      rooms: recommendedRooms,
    });
  } catch (error) {
    console.error("recommendRooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to recommend rooms.",
      error: error.message,
    });
  }
};

exports.getRoomAlternativeDates = async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const { check_in, check_out, nights } = req.query;

    if (!roomId || Number.isNaN(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    if (!check_in || !check_out) {
      return res.status(400).json({
        success: false,
        message: "check_in and check_out are required.",
      });
    }

    let totalNights = Number(nights);
    if (Number.isNaN(totalNights) || totalNights < 1) {
      totalNights = getNightDifference(check_in, check_out);
    }

    if (totalNights < 1) {
      return res.status(400).json({
        success: false,
        message: "Night count must be at least 1.",
      });
    }

    const [roomRows] = await db.promise().query(
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
      WHERE id = ?
      LIMIT 1
      `,
      [roomId]
    );

    if (roomRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    const room = roomRows[0];

    const suggestions = [];
    let daysToCheck = 0;

    while (suggestions.length < 5 && daysToCheck < 30) {
      const candidateCheckIn = addDays(check_in, daysToCheck);
      const candidateCheckOut = addDays(candidateCheckIn, totalNights);

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
          nights: totalNights,
        });
      }

      daysToCheck++;
    }

    return res.status(200).json({
      success: true,
      room,
      requested: {
        check_in,
        check_out,
        nights: totalNights,
      },
      suggestions,
    });
  } catch (error) {
    console.error("getRoomAlternativeDates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to suggest alternative dates.",
      error: error.message,
    });
  }
};