// ===============================================================
// AI free entrance: compact answers grounded in Aiven accommodation data.
// No guessed free-pax counts, booking actions, or Gemini token consumption.
// ===============================================================
"use strict";

function isFreeEntranceQuestion(message) {
  const text = String(message || "").normalize("NFKC").trim().toLowerCase();
  if (!text || text.length > 300) return false;
  const aboutFreeEntrance =
    /\bfree[\s-]+(?:pool\s*(?:and|&)\s*beach\s+)?entrance\b/i.test(text) ||
    /\bcomplimentary\s+entrance\b/i.test(text) ||
    /\blibreng?\s+(?:pool\s*(?:and|&)\s*beach\s+)?entrance\b/i.test(text) ||
    /\bentrance\s+(?:na\s+)?(?:free|libre)\b/i.test(text);
  if (!aboutFreeEntrance) return false;
  // "Ilang free entrance?" and "May free entrance ba?" are questions.
  return /\?|\b(?:ilang|ilan|may|meron|kasama|how many|does|do|is|are|included|pax|guests?)\b/i.test(text);
}

function explicitEntranceRoomName(message) {
  const text = String(message || "").normalize("NFKC").trim();
  const patterns = [
    [ /\bsingle\s+room\s+cottage\s+([1-5])\b/gi, x => "Single Room Cottage " + x ],
    [ /\bsingle\s+room\s*\(\s*pool\s*side\s*\)\s*([a-f])\b/gi,
      x => "Single Room (Pool side) " + x.toUpperCase() ],
    [ /\bsingle\s+room\s+pool\s*side\s+([a-f])\b/gi,
      x => "Single Room (Pool side) " + x.toUpperCase() ],
    [ /\bdouble\s+room\s+([12])\b/gi, x => "Double Room " + x ],
    [ /\bfamily\s+room\s+([ab])\b/gi, x => "Family Room " + x.toUpperCase() ],
  ];
  const names = new Set();
  for (const [regex, build] of patterns) {
    for (const match of text.matchAll(regex)) names.add(build(match[1]));
  }
  // Never arbitrarily pick A when the guest asked about both A and B.
  return names.size === 1 ? [...names][0] : null;
}

function verifiedFreeEntranceReply(row, language = "english") {
  const name = String(row?.room_name ?? row?.name ?? "").trim().slice(0, 90);
  const raw = row?.free_entrance_pax;
  const amount = raw === null || raw === undefined || String(raw).trim() === ""
    ? NaN : Number(raw);
  const taglish = ["tagalog", "taglish"].includes(String(language).toLowerCase());
  // A NULL is unknown. Never convert it to zero or invent a benefit.
  if (!Number.isSafeInteger(amount) || amount < 0) {
    return taglish
      ? "Hindi pa po naka-indicate ang free entrance allowance ng " + name + "."
      : "The free entrance allowance for " + name + " is not listed.";
  }
  if (amount === 0) {
    return taglish
      ? "Wala pong kasamang free entrance ang " + name + "."
      : name + " does not include free entrance.";
  }
  return taglish
    ? "May " + amount + " pax na free entrance po ang " + name + "."
    : name + " includes free entrance for " + amount + " " +
      (amount === 1 ? "guest." : "guests.");
}

module.exports = {
  isFreeEntranceQuestion,
  explicitEntranceRoomName,
  verifiedFreeEntranceReply,
};
