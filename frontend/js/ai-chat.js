// Match the resort API selector: local development uses localhost, Vercel uses Render.
const AI_API_BASE = typeof API_BASE === "string" ? API_BASE
  : (["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://127.0.0.1:5000/api"
    : "https://smartresort-backend.onrender.com/api");
// UI-37: Public landing inquiries and signed-in Customer chats must not share
// local history, recommendation context, or saved popup size.
const AI_IS_PUBLIC_LANDING = document.body?.dataset.aiChatSurface === "public";
const AI_ACCOUNT_SCOPE = window.ArvicAccountSession?.tabInfo()?.identity || "no-authenticated-account";
const AI_CONTEXT_KEY = AI_IS_PUBLIC_LANDING
  ? "arvic_public_ai_context_v1" : "arvic_ai_account_" + AI_ACCOUNT_SCOPE + "_context_v1";
const AI_WINDOW_STATE_KEY = AI_IS_PUBLIC_LANDING
  ? "arvic_public_ai_window_state_v1" : "arvic_ai_account_" + AI_ACCOUNT_SCOPE + "_window_state_v1";
const AI_CHAT_HISTORY_KEY = AI_IS_PUBLIC_LANDING
  ? "arvic_public_ai_chat_history_v1" : "arvic_ai_account_" + AI_ACCOUNT_SCOPE + "_chat_history_v1";
// UI-42: Public visitor conversations live only in this page's JavaScript
// memory. A new load, separate tab or next visitor starts completely fresh.
// Customer Home retains its existing separately keyed localStorage behavior.
let aiPublicChatHistory = [];
let aiPublicChatContext = {};
let aiPublicChatGeneration = 0;
if (AI_IS_PUBLIC_LANDING) {
  // Remove historical persisted public chats saved by older releases.
  // Never remove the Customer account, Customer chat, or booking state.
  for (const key of [AI_CHAT_HISTORY_KEY, AI_CONTEXT_KEY, AI_WINDOW_STATE_KEY]) {
    try { localStorage.removeItem(key); } catch (_) { /* storage may be disabled */ }
  }
  // Browsers can restore a previous DOM/JS snapshot with the Back button.
  // A reload prevents showing another visitor's cached chat from bfcache.
  window.addEventListener("pageshow", event => {
    if (event.persisted) window.location.reload();
  });
}
// Verified official Facebook page from the Customer Home page (refund support).
const OFFICIAL_RESORT_FACEBOOK_URL = "https://www.facebook.com/share/1E1kZLtrV4/?mibextid=wwXIfr";
// Keep these contact numbers consistent with the Customer Home contact card.
const OFFICIAL_RESORT_PHONE_PRIMARY = "0956-912-5625";
const OFFICIAL_RESORT_PHONE_ALTERNATIVE = "0967-817-0662";

let aiMessageInFlight = false;

document.addEventListener("DOMContentLoaded", () => {
  setupAiChat();
});

function aiReplyForSurface(reply) {
  const text = String(reply || "");
  if (!AI_IS_PUBLIC_LANDING) return text;
  return text.replace(/\bView Details\b/gi, "Login for Details")
    .replace(/\bBook This\b/gi, "Log In to Book This");
}

function setupAiChat() {
  const toggleBtn = document.getElementById("aiChatToggle");
  const closeBtn = document.getElementById("aiChatClose");
  const maximizeBtn = document.getElementById("aiChatMaximize");
  const newChatBtn = document.getElementById("aiNewChatBtn");
  const micBtn = document.getElementById("aiMicBtn");
  const chatWindow = document.getElementById("aiChatWindow");
  const sendBtn = document.getElementById("aiSendBtn");
  const input = document.getElementById("aiChatInput");
  const messages = document.getElementById("aiChatMessages");

  if (!toggleBtn || !chatWindow || !sendBtn || !input || !messages) return;

  restoreWindowState();
  restoreChatHistory();
  // Voice input and live conversation are initialized by ai-voice.js.

  toggleBtn.addEventListener("click", () => {
    chatWindow.classList.toggle("show");
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      chatWindow.classList.remove("show");
    });
  }

  if (maximizeBtn) {
    maximizeBtn.addEventListener("click", () => {
      toggleMaximize();
    });
  }

  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      const confirmed = confirm(
        "Start a new chat? This will clear the current AI conversation."
      );
      if (!confirmed) return;
      clearAiConversation();
    });
  }

  sendBtn.addEventListener("click", sendAiMessage);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendAiMessage();
    }
  });

  if (!messages.dataset.initialized) {
    messages.dataset.initialized = "true";
  }
}

async function sendAiMessage(options = {}) {
  const input = document.getElementById("aiChatInput");
  const sendBtn = document.getElementById("aiSendBtn");

  if (!input || !sendBtn || aiMessageInFlight) return null;
  const isAccommodationAction = options.source === "accommodation";
  const message = isAccommodationAction ? String(options.message || "").trim() : input.value.trim();
  if (!message) return null;

  // Manual messages must not race with an active voice conversation.
  if (options.source !== "voice" && window.ArvicVoice?.isLiveActive?.()) {
    window.ArvicVoice.stopConversation();
  }

  aiMessageInFlight = true;
  const requestGeneration = aiPublicChatGeneration;
  // New broad recommendation requests must not stay locked to an older card.
  const freshSearch = !isAccommodationAction && isFreshAiAccommodationSearch(message, getStoredAiContext());
  if (freshSearch) {
    const current = getStoredAiContext();
    delete current.room_id;
    delete current.room_name;
    saveAiContext(current);
  }
  const recentTurns = getAiRecentConversationTurns(message);
  // Starter prompts are visual shortcuts only, never conversation memory.
  document.getElementById("aiQuickQuestions")?.remove();
  appendAiMessage("user", message);
  if (!isAccommodationAction) input.value = "";

  const storedContext = getStoredAiContext();
  const pageContext = getAiPageContext();

  const payload = {
    message,
    recent_turns: recentTurns,
    ...pageContext,
    context: freshSearch ? getStoredAiContext() : storedContext,
    // AI-44: Voice transcripts use the very same per-message language
    // detection as typed chat. No language selection is sent or persisted.
    ...(options.source === "voice" ? { input_source: "voice" } : {}),
  };

  try {
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";
    appendTypingIndicator();

    const response = await fetch(`${AI_API_BASE}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (AI_IS_PUBLIC_LANDING && requestGeneration !== aiPublicChatGeneration) return null;
    removeTypingIndicator();

    const data = await response.json();
    if (AI_IS_PUBLIC_LANDING && requestGeneration !== aiPublicChatGeneration) return null;

    if (!response.ok) {
      const requestError = new Error(data.message || "Failed to get AI response.");
      requestError.status = response.status;
      requestError.code = data.code || null;
      throw requestError;
    }

    if (data.extracted_context) {
      const merged = mergeContext(getStoredAiContext(), data.extracted_context);
      if (data.mode === "verified_live_availability") {
        Object.assign(merged,data.extracted_context);
      }
      // Keep ONE-card recommendations focused for follow-up amenity questions.
      // If a new search has zero/multiple results, or the backend cannot verify
      // an old selected room, clear the stale context instead of resurrecting
      // an unrelated Nipa Hut (mergeContext uses nullish fallbacks).
      if (((data.mode === "verified_accommodation_preview" ||
             data.mode === "verified_cheapest_accommodation" ||
             data.mode === "verified_room_price_followup" ||
             data.mode === "verified_pair_recommendation") &&
            !Object.prototype.hasOwnProperty.call(data.extracted_context, "room_id")) ||
          data.mode === "accommodation_selection_needed" ||
          data.mode === "recommendation_needs_guest_count" ||
          data.mode === "verified_accommodation_comparison") {
        // AI-37: A new recommendation is pending guest count; don't
        // preserve an older selected accommodation by merging nullish keys.
        delete merged.room_id;
        delete merged.room_name;
      }
      saveAiContext(merged);

      // Save silently. Repeating context summaries on every reply feels robotic.
    }

    // UI-49: Public visitors see "Login for Details" on recommendation cards,
    // while signed-in customers see "View Details". Match the visible label
    // without changing backend recommendations or authentication behavior.
    const aiReply = aiReplyForSurface(data.reply || "No reply generated.");
    appendAiMessage("assistant", aiReply);
    // AI-48: Backend requests a known safe booking or human handoff. Never
    // derive link destinations from model text or user-supplied URLs.
    if (data.handoff === "booking" || data.handoff === "human") {
      appendAiConciergeActions(data.handoff);
    }

    if (Array.isArray(data.recommendation_cards) && data.recommendation_cards.length) {
      appendAiRecommendationCards(data.recommendation_cards);
    }

    if (Array.isArray(data.alternative_dates) && data.alternative_dates.length > 0) {
      const altText = data.alternative_dates
        .map((item, index) => `${index + 1}. ${item.check_in} to ${item.check_out}`)
        .join("\n");
      appendAiSystemNote(`Alternative dates found:\n${altText}`);
    }

    if (data.booking_preview) {
      appendBookingPreviewCard(data.booking_preview);
    }
    return aiReply;
  } catch (error) {
    // A response from a prior public New Chat must never reappear later.
    if (AI_IS_PUBLIC_LANDING && requestGeneration !== aiPublicChatGeneration) return null;
    console.warn("AI chat request failed:", error.code || error.message);
    removeTypingIndicator();

    if (["GEMINI_BUSY", "GEMINI_RATE_LIMIT", "AI_LOCAL_BUDGET", "AI_RATE_LIMIT"].includes(error.code)) {
      // Upstream demand/quota issues do not mean a room is unavailable.
      // Keep booking context unchanged, and do not invent rates.
      const voiceLanguage = detectOfflineLanguage(message, storedContext);
      const messages = {
        english: "Sorry, our AI assistant is busy right now. Please try again in a moment.",
        taglish: "Pasensya na po, busy muna ang AI assistant. Pakisubukan ulit maya-maya.",
        spanish: "Lo siento, el asistente está ocupado en este momento. Inténtelo de nuevo en unos instantes.",
        mandarin: "抱歉，智能助手现在比较忙。请稍后再试。",
      };
      const busyReply = messages[voiceLanguage] || error.message ||
        "The AI assistant is temporarily busy. Please try again shortly.";
      appendAiMessage("assistant", busyReply);
      return busyReply;
    }

    const fallback = getOfflineFallbackReply(message, storedContext, pageContext);
    const mergedFallbackContext = mergeContext(storedContext, fallback.context || {});
    saveAiContext(mergedFallbackContext);

    // AI-49: A network error does not erase verified offline resort knowledge.
    // Previous code ALWAYS replaced fallback.reply with a generic voice error,
    // even for typed parking questions. Keep the factual fallback and show one
    // separate connection notice. Never pretend rates or slots are verified.
    const localHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const isTransportError = error instanceof TypeError &&
      /fetch|network|load failed/i.test(String(error.message || ""));
    const notice = localHost && isTransportError
      ? "Hindi ma-connect ang localhost backend (127.0.0.1:5000). I-start o i-restart muna ang backend server. Offline verified resort info lang ang available."
      : fallback.modeNotice;
    if (!getStoredChatHistory().some((entry) => entry.type === "system" &&
        entry.text === notice)) {
      appendAiSystemNote(notice);
    }
    // This is useful resort information only when the local verified answer is
    // known. Other inquiries remain cautious and never fabricate availability.
    const safeReply = fallback.reply ||
      "Sorry, the AI service is temporarily unavailable. Please try again.";
    appendAiMessage("assistant", safeReply);
    return safeReply;
  } finally {
    if (!AI_IS_PUBLIC_LANDING || requestGeneration === aiPublicChatGeneration) {
      aiMessageInFlight = false;
      sendBtn.disabled = false;
      sendBtn.textContent = "Send";
    }
  }
}

function getAiPageContext() {
  const checkIn = document.getElementById("checkIn");
  const checkInTime = document.getElementById("checkInTime");
  const checkOut = document.getElementById("checkOut");
  const checkOutTime = document.getElementById("checkOutTime");
  const guests = document.getElementById("guests");

  const context = {};

  if (checkIn && checkIn.value) context.check_in = checkIn.value;
  if (checkInTime && checkInTime.value) context.check_in_time = normalizeTimeForContext(checkInTime.value);
  if (checkOut && checkOut.value) context.check_out = checkOut.value;
  if (checkOutTime && checkOutTime.value) context.check_out_time = normalizeTimeForContext(checkOutTime.value);
  if (guests && guests.value) context.guests = Number(guests.value);

  return context;
}

function normalizeTimeForContext(value) {
  const text = String(value || "").trim();
  if (!text) return null;

  const parts = text.split(":");
  if (parts.length < 2) return null;

  const hours = String(parts[0]).padStart(2, "0");
  const minutes = String(parts[1]).padStart(2, "0");
  const seconds = String(parts[2] || "00").padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getStoredAiContext() {
  if (AI_IS_PUBLIC_LANDING) return { ...aiPublicChatContext };
  try {
    const raw = sessionStorage.getItem(AI_CONTEXT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveAiContext(context) {
  if (AI_IS_PUBLIC_LANDING) {
    aiPublicChatContext = { ...(context || {}) };
    return;
  }
  sessionStorage.setItem(AI_CONTEXT_KEY, JSON.stringify(context || {}));
}

// Send only a few recent conversational messages. Skip UI notices and
// the current input; booking context continues in the separate structured state.
function getAiRecentConversationTurns(currentMessage) {
  const turns = getStoredChatHistory()
    .filter((entry) => entry?.type === "message" &&
      ["user", "assistant"].includes(entry.role) && typeof entry.text === "string")
    .map(({ role, text }) => ({ role, text: text.trim().slice(0, 240) }));
  if (turns.length && turns[turns.length - 1].role === "user" &&
      turns[turns.length - 1].text === String(currentMessage).trim().slice(0, 240)) {
    turns.pop();
  }
  return turns.slice(-6);
}

function isFreshAiAccommodationSearch(text, context = {}) {
  const input = String(text || "").toLowerCase().trim();
  const focusedName = String(context?.room_name || "").toLowerCase().trim();
  const focusedId = Number(context?.room_id);

  // "Ask AI About This" on the catalog page sets an exact room ID/name.
  // Its historical suggested message starts with "Recommend", but it is
  // NOT a new broad search. Preserve that selected room for the AI reply.
  if (Number.isSafeInteger(focusedId) && focusedId > 0 && focusedName &&
      /^recommend this accommodation for me\s*:/.test(input) &&
      input.includes(focusedName)) {
    return false;
  }

  // Explicit new searches should still clear the previously selected room.
  return /\b(?:recommend|suggest|ibang|other|more options|show rooms|list rooms|hanap|marerecommend|looking for)\b/.test(input) &&
    !/\b(?:magkano|how much|may cr|amenit|tell me more)\b/.test(input);
}

function getStoredChatHistory() {
  if (AI_IS_PUBLIC_LANDING) return aiPublicChatHistory.slice();
  try {
    const raw = sessionStorage.getItem(AI_CHAT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveChatHistory(history) {
  if (AI_IS_PUBLIC_LANDING) {
    aiPublicChatHistory = Array.isArray(history) ? history.slice(-80) : [];
    return;
  }
  sessionStorage.setItem(AI_CHAT_HISTORY_KEY, JSON.stringify(history || []));
}

function addToChatHistory(entry) {
  const history = getStoredChatHistory();
  history.push(entry);
  // Keep local chat storage bounded; do not keep old stale previews indefinitely.
  saveChatHistory(history.slice(-80));
}

function clearChatMessagesUI() {
  const messages = document.getElementById("aiChatMessages");
  if (messages) {
    messages.innerHTML = "";
  }
}

function restoreChatHistory() {
  const messages = document.getElementById("aiChatMessages");
  if (!messages) return;

  clearChatMessagesUI();

  const history = getStoredChatHistory();

  if (!history.length) {
    appendAiMessage(
      "assistant",
      AI_IS_PUBLIC_LANDING
        ? "Magandang araw po! Welcome sa Arvic Seaside Beach Resort and Hotel. Tulungan ko kayong mag-check ng rooms, rates at booking options. Ano pong gusto niyong malaman?"
        : "Hi po! Anong accommodation o booking details ang maitutulong ko sa inyo?",
      false
    );

    const savedContext = getStoredAiContext();
    const summary = summarizeContext(savedContext);

    if (summary) {
      appendAiSystemNote(`Saved details from this chat: ${summary}`, false);
    }

    // Only on an empty chat. Do not reinsert hints into restored user history.
    appendAiStarterSuggestions(messages);
    return;
  }

  history.forEach((item) => {
    if (item.type === "message") {
      appendAiMessage(item.role, item.text, false);
    } else if (item.type === "system") {
      appendAiSystemNote(item.text, false);
    } else if (item.type === "preview") {
      appendBookingPreviewCard(item.preview, false);
    } else if (item.type === "recommendations") {
      appendAiRecommendationCards(item.cards, false);
    }
  });

  messages.scrollTop = messages.scrollHeight;
}

// UI-27: Helpful first-use examples make the chat feel like a concierge.
// Buttons use the EXISTING sendAiMessage route, so there are no special
// offline rules, fabricated answers, or extra network calls on page load.
function appendAiStarterSuggestions(messages) {
  if (!messages || document.getElementById("aiQuickQuestions")) return;
  const wrapper = document.createElement("div");
  wrapper.id = "aiQuickQuestions";
  wrapper.className = "ai-quick-questions";
  const label = document.createElement("p");
  label.className = "ai-quick-questions-label";
  label.textContent = "You can ask me about";
  wrapper.appendChild(label);
  const prompts = AI_IS_PUBLIC_LANDING ? [
    ["Room & cottage rates", "Magkano ang rooms at cottages?"],
    ["Book & pay online", "Paano mag-book at magbayad?"],
    ["Entrance & corkage", "Ano ang policies sa entrance fee at corkage?"],
    ["Exact location", "Saan ang exact location ninyo?"],
  ] : [
    ["Parking", "May free parking ba kayo?"],
    ["Cottages", "Ilang cottages meron kayo?"],
    ["Find a room", "Anong magandang room para sa 10 guests?"],
  ];
  const row = document.createElement("div");
  row.className = "ai-quick-questions-row";
  for (const [name, question] of prompts) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ai-quick-question";
    button.textContent = name;
    button.title = question;
    button.setAttribute("aria-label", "Ask: " + question);
    button.addEventListener("click", () => {
      const input = document.getElementById("aiChatInput");
      if (!input || aiMessageInFlight) return;
      input.value = question;
      wrapper.remove();
      sendAiMessage();
    });
    row.appendChild(button);
  }
  wrapper.appendChild(row);
  messages.appendChild(wrapper);
}

// AI-48: Fixed first-party UI actions. Backend has already verified the
// concierge route; links are never generated by Gemini or supplied by guests.
function appendAiConciergeActions(handoff) {
  const messages = document.getElementById("aiChatMessages");
  if (!messages || !["booking", "human"].includes(handoff)) return;
  const section = document.createElement("div");
  section.className = "ai-concierge-actions";
  section.setAttribute("role", "group");
  section.setAttribute("aria-label", handoff === "booking"
    ? "Continue to online booking" : "Contact Arvic Seaside Front Desk");
  const actions = handoff === "booking"
    ? (AI_IS_PUBLIC_LANDING
        ? [
            ["Log in to book", "../authHTML/login.html"],
            ["Create account", "../authHTML/register.html"],
          ]
        : [["Browse accommodations", "rooms.html"]])
    : [
        ["Call Front Desk", "tel:09569125625"],
        ["Alternate number", "tel:09678170662"],
        ["Email resort", "mailto:resortarvicseaside@gmail.com"],
      ];
  for (const [label, safeHref] of actions) {
    const link = document.createElement("a");
    link.className = "ai-concierge-action-link";
    link.textContent = label;
    link.href = safeHref;
    // Links intentionally remain same-tab for the booking flow.
    section.appendChild(link);
  }
  messages.appendChild(section);
  messages.scrollTop = messages.scrollHeight;
}

function clearAiConversation() {
  if (AI_IS_PUBLIC_LANDING) {
    aiPublicChatGeneration++;
    aiPublicChatHistory = [];
    aiPublicChatContext = {};
    aiMessageInFlight = false;
    removeTypingIndicator();
    const sendBtn = document.getElementById("aiSendBtn");
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = "Send";
    }
  } else {
    sessionStorage.removeItem(AI_CHAT_HISTORY_KEY);
    sessionStorage.removeItem(AI_CONTEXT_KEY);
  }

  const input = document.getElementById("aiChatInput");
  if (input) {
    input.value = "";
  }

  aiFinalTranscript = "";
  aiShouldKeepListening = false;
  aiStoppedManually = false;
  aiSendAfterStop = false;

  restoreChatHistory();
  appendAiSystemNote("New chat started.");
}

function mergeContext(oldContext = {}, newContext = {}) {
  return {
    availability_pending: newContext.availability_pending ?? oldContext.availability_pending ?? false,
    stay_duration: newContext.stay_duration ?? oldContext.stay_duration ?? null,
    check_in: newContext.check_in ?? oldContext.check_in ?? null,
    check_in_time: newContext.check_in_time ?? oldContext.check_in_time ?? null,
    check_out: newContext.check_out ?? oldContext.check_out ?? null,
    check_out_time: newContext.check_out_time ?? oldContext.check_out_time ?? null,
    // Preserve chosen preset slot between turns without changing booking fields.
    ...((newContext.slot_preference || oldContext.slot_preference)
      ? { slot_preference: newContext.slot_preference || oldContext.slot_preference }
      : {}),
    guests: newContext.guests ?? oldContext.guests ?? null,
    bed_count: newContext.bed_count ?? oldContext.bed_count ?? null,
    view_type: newContext.view_type ?? oldContext.view_type ?? null,
    aircon_type: newContext.aircon_type ?? oldContext.aircon_type ?? null,
    bed_type: newContext.bed_type ?? oldContext.bed_type ?? null,
    max_price: newContext.max_price ?? oldContext.max_price ?? null,
    room_name: newContext.room_name ?? oldContext.room_name ?? null,
    room_id: newContext.room_id ?? oldContext.room_id ?? null,
    intent: newContext.intent ?? oldContext.intent ?? null,
    // Keep the original accommodation category for follow-up corrections:
    // 2 guests -> 7 guests should refresh the same type of room.
    recommendation_category:
      newContext.recommendation_category ?? oldContext.recommendation_category ?? null,
    wants_booking: newContext.wants_booking ?? oldContext.wants_booking ?? null,
    language_style: newContext.language_style ?? oldContext.language_style ?? null,
    payment_method: newContext.payment_method ?? oldContext.payment_method ?? null,
  };
}

function summarizeContext(context = {}) {
  const parts = [];

  if (context.check_in && context.check_out) {
    parts.push(`dates ${context.check_in} to ${context.check_out}`);
  }
  if (context.check_in_time) {
    parts.push(`check-in time ${formatTime(context.check_in_time)}`);
  }
  if (context.check_out_time) {
    parts.push(`check-out time ${formatTime(context.check_out_time)}`);
  }
  if (context.guests) parts.push(`${context.guests} guest(s)`);
  if (context.payment_method) parts.push(`payment ${context.payment_method}`);
  if (context.language_style) parts.push(`language ${context.language_style}`);

  return parts.join(", ");
}

function detectOfflineLanguage(message, context = {}) {
  const text = String(message || "").toLowerCase();
  // AI-44: Even when the API is unavailable, don't use stale language
  // when the latest message is recognizably Mandarin or Spanish.
  if (/[\u3400-\u9fff]/u.test(text) || /\b(?:ni\s*hao(?:\s*ma)?|nihao|xie\s*xie|fangjian|yuding)\b/i.test(text)) return "mandarin";
  if (/\b(?:hola|gracias|habitaciones?|cu[aá]nto|reservaci[oó]n|precio|quiero|tienen)\b/i.test(text)) return "spanish";
  // Short Filipino slot replies must not suddenly switch to English offline.
  if (/^(?:umaga|gabi|day tour po|night po)$/.test(text.trim())) return "tagalog";

  const tagalogHints = [
    "gusto", "kuwarto", "kwarto", "bisita", "mula", "hanggang", "petsa",
    "bayad", "pwede", "puwede", "magkano", "saan", "kailan", "ako",
    "po", "opo", "naman", "lang", "muna", "wala", "meron", "para",
    "paano", "mag", "ng", "sa", "ito", "iyan", "pwede ba", "oras"
  ];

  const englishHints = [
    "room", "guest", "guests", "payment", "book", "booking", "receipt",
    "available", "price", "check-in", "check-out", "cash", "paypal",
    "online", "date", "dates", "how", "where", "what", "time"
  ];

  let tagalogScore = 0;
  let englishScore = 0;

  tagalogHints.forEach((word) => {
    if (text.includes(word)) tagalogScore++;
  });

  englishHints.forEach((word) => {
    if (text.includes(word)) englishScore++;
  });

  if (tagalogScore >= 2 && englishScore >= 2) return "taglish";
  if (tagalogScore >= 2) return "tagalog";
  if (englishScore >= 2) return "english";

  return context.language_style || "english";
}

function appendAiMessage(role, text, save = true) {
  const messages = document.getElementById("aiChatMessages");
  if (!messages) return;

  const wrapper = document.createElement("div");
  wrapper.className = `ai-message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "ai-bubble";
  bubble.dataset.originalText = text;
  bubble.dataset.currentText = text;

  if (role === "assistant") {
    bubble.innerHTML = formatAiReply(text);
  } else {
    bubble.textContent = text;
  }

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);

  if (role === "assistant") {
    appendReplyActions(wrapper, text);
  }

  messages.scrollTop = messages.scrollHeight;

  if (save) {
    addToChatHistory({
      type: "message",
      role,
      text,
    });
  }
}

// UI-46: The public landing concierge should stay uncluttered for English and
// Taglish. Translation controls are relevant only when the AI actually replies
// in Spanish or Mandarin, not merely when a guest mentions those languages.
// No external language-detection request or Gemini credits are consumed.
function isSpanishOrMandarinAiReply(replyText) {
  const text = String(replyText || "")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/`[^`]*`/g, " ")
    .trim();

  if (!text) return false;

  // Mandarin: Chinese script in the reply, including Chinese punctuation.
  const hanCount = (text.match(/[\u3400-\u9fff]/gu) || []).length;
  if (hanCount >= 2) return true;

  // Spanish: require either a full short greeting or multiple signals.
  // One isolated word such as "hola" inside an English reply should not
  // suddenly add Translate buttons.
  if (/^(?:[¡¿]?\s*(?:hola|gracias|buenos\s+d[ií]as|buenas\s+tardes|buenas\s+noches|bienvenid[oa]s?)[\s.!¡¿?]*)$/iu.test(text)) {
    return true;
  }

  const strongSignals = text.match(/\b(?:hola|gracias|bienvenid[oa]s?|habitaciones?|reservaci[oó]n(?:es)?|reservar|tenemos|ofrecemos|puedes?|pueden|cu[aá]nto|piscina|precios?|disponibles?|estacionamiento|necesitas?|quier[oe]|tienen|estamos|buen[oa]s|noches|d[ií]as|ustedes?|aqu[ií]|visitar|disfrutar|alojamiento|personas|puedo|usted)\b/giu) || [];
  const grammarSignals = text.match(/\b(?:el|la|los|las|una?|de|del|en|con|para|que|por|nuestro|nuestra|sus|est[aá]|est[aá]n|son)\b/giu) || [];
  return (/[¿¡]/u.test(text) && strongSignals.length >= 1) ||
    strongSignals.length >= 2 ||
    (strongSignals.length >= 1 && grammarSignals.length >= 2);
}

function appendReplyActions(wrapper, originalText) {
  const actions = document.createElement("div");
  actions.className = "ai-reply-actions"; // Shared compact controls across Customer pages.
  actions.style.display = "flex";
  actions.style.gap = "8px";
  actions.style.marginTop = "6px";
  actions.style.flexWrap = "wrap";

  const speakBtn = document.createElement("button");
  speakBtn.type = "button";
  speakBtn.textContent = "Read Aloud";
  speakBtn.style.cssText =
    "border:none;background:#e2e8f0;color:#0f172a;padding:6px 10px;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;";
  speakBtn.addEventListener("click", () =>
    speakText(getCurrentBubbleText(wrapper, originalText)));

  const translateEnglishBtn = document.createElement("button");
  translateEnglishBtn.type = "button";
  translateEnglishBtn.textContent = "Translate to English";
  translateEnglishBtn.style.cssText = speakBtn.style.cssText;

  const translateTagalogBtn = document.createElement("button");
  translateTagalogBtn.type = "button";
  translateTagalogBtn.textContent = "Translate to Tagalog";
  translateTagalogBtn.style.cssText = speakBtn.style.cssText;

  const bubble = wrapper.querySelector(".ai-bubble");
  let currentMode = "original";
  let translating = false;
  const translations = {};
  const options = [
    { mode: "english", button: translateEnglishBtn, url: "/ai/translate-english", label: "Translate to English" },
    { mode: "tagalog", button: translateTagalogBtn, url: "/ai/translate", label: "Translate to Tagalog" },
  ];

  function updateButtons() {
    for (const option of options) {
      option.button.textContent = currentMode === option.mode
        ? "Show Original" : option.label;
      option.button.disabled = translating;
    }
  }

  async function changeTranslation(option) {
    if (!bubble || translating) return;
    if (currentMode === option.mode) {
      bubble.innerHTML = formatAiReply(originalText);
      bubble.dataset.currentText = originalText;
      currentMode = "original";
      updateButtons();
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(translations, option.mode)) {
      translating = true;
      updateButtons();
      option.button.textContent = "Translating...";
      try {
        const response = await fetch(AI_API_BASE + option.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: originalText }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Translation temporarily unavailable.");
        }
        if (!String(data.translated_text || "").trim()) {
          throw new Error("No translation was returned.");
        }
        translations[option.mode] = data.translated_text;
      } catch (error) {
        console.error("AI translation error:", error);
        appendAiSystemNote(error.message || "Translation temporarily unavailable.");
        return;
      } finally {
        translating = false;
        updateButtons();
      }
    }
    currentMode = option.mode;
    bubble.innerHTML = formatAiReply(translations[option.mode]);
    bubble.dataset.currentText = translations[option.mode];
    updateButtons();
  }

  for (const option of options) {
    option.button.addEventListener("click", () => changeTranslation(option));
  }
  actions.appendChild(speakBtn);
  // UI-57: On ALL Customer surfaces, show translation only if the AI
  // actually replied in Spanish or Mandarin. Read Aloud is always available.
  // History restoration also calls appendReplyActions, so previously saved
  // English/Taglish replies no longer show irrelevant Translate controls.
  if (isSpanishOrMandarinAiReply(originalText)) {
    actions.appendChild(translateEnglishBtn);
    actions.appendChild(translateTagalogBtn);
  }
  wrapper.appendChild(actions);
}

function getCurrentBubbleText(wrapper, fallbackText) {
  const bubble = wrapper.querySelector(".ai-bubble");
  if (!bubble) return fallbackText;
  return bubble.dataset.currentText || bubble.dataset.originalText || fallbackText;
}

function appendAiSystemNote(text, save = true) {
  const messages = document.getElementById("aiChatMessages");
  if (!messages) return;

  const wrapper = document.createElement("div");
  wrapper.className = "ai-message assistant";

  const bubble = document.createElement("div");
  bubble.className = "ai-bubble";
  bubble.style.background = "#ecfeff";
  bubble.style.border = "1px solid #99f6e4";
  bubble.style.color = "#115e59";
  bubble.style.whiteSpace = "pre-line";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;

  if (save) {
    addToChatHistory({
      type: "system",
      text,
    });
  }
}

function appendBookingPreviewCard(preview, save = true) {
  const messages = document.getElementById("aiChatMessages");
  if (!messages) return;

  const wrapper = document.createElement("div");
  wrapper.className = "ai-message assistant";

  const bubble = document.createElement("div");
  bubble.className = "ai-bubble";
  bubble.style.background = "#f8fafc";
  bubble.style.border = "1px solid #cbd5e1";
  bubble.style.color = "#0f172a";

  const imagePath = preview.image ? escapeHtml(preview.image) : "images/no-image.jpg";

  bubble.innerHTML = `
    <div style="font-weight:800;margin-bottom:10px;font-size:1.05rem;">Accommodation Suggestion</div>
    <div style="margin-bottom:12px;">
      <img
        src="${imagePath}"
        alt="${escapeHtml(preview.room_name)}"
        style="width:100%;height:150px;object-fit:cover;border-radius:10px;border:1px solid #cbd5e1;display:block;"
        onerror="this.src='images/no-image.jpg'"
      />
    </div>
    <div style="font-size:0.94rem;line-height:1.7;">
      <div><strong>Accommodation:</strong> ${escapeHtml(preview.room_name)}</div>
      <div><strong>Check-in Date:</strong> ${escapeHtml(preview.check_in)}</div>
      <div><strong>Check-in Time:</strong> ${escapeHtml(formatTime(preview.check_in_time))}</div>
      <div><strong>Check-out Date:</strong> ${escapeHtml(preview.check_out)}</div>
      <div><strong>Check-out Time:</strong> ${escapeHtml(formatTime(preview.check_out_time))}</div>
      <div><strong>Guests:</strong> ${preview.guests}</div>
      <div><strong>Day Tour:</strong> ${Number(preview.day_price || 0) > 0 ? "₱" + formatMoney(preview.day_price) : "Ask Front Desk"}</div>
      <div><strong>Overnight:</strong> ${Number(preview.overnight_price || 0) > 0 ? "₱" + formatMoney(preview.overnight_price) : "Ask Front Desk"}</div>
      <div><strong>Extended:</strong> ${Number(preview.extended_price || 0) > 0 ? "₱" + formatMoney(preview.extended_price) : "Ask Front Desk"}</div>
      <div style="font-size:0.85rem;margin-top:8px;">Not reserved yet. Final slot availability and official amount are verified on the secure booking page.</div>
    </div>
    <button
      type="button"
      class="ai-confirm-booking-btn"
      style="margin-top:12px;width:100%;border:none;background:#14b8a6;color:white;padding:11px 12px;border-radius:10px;font-weight:700;cursor:pointer;"
    >
      ${AI_IS_PUBLIC_LANDING ? "Log In to Book This" : "Continue to Booking"}
    </button>
  `;

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;

  const confirmBtn = bubble.querySelector(".ai-confirm-booking-btn");
  if (confirmBtn) {
    if (preview?.booking_schema !== "accommodations_v2") {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Old suggestion — ask AI again";
      confirmBtn.title = "Legacy AI room IDs are not compatible with current accommodations.";
    } else {
      confirmBtn.addEventListener("click", () => createBookingFromPreview(preview, confirmBtn));
    }
  }

  if (save) {
    addToChatHistory({
      type: "preview",
      preview,
    });
  }
}


// Verified room photos and amounts are rendered by the website, not generated
// inside the model's reply. Reject javascript:/file:/unsupported image schemes.
const AI_ROOM_IMAGE_FALLBACK = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#e2e8f0"/><text x="320" y="185" text-anchor="middle" font-family="Arial" font-size="24" fill="#475569">Photo unavailable</text></svg>'
);

// Verified image paths from the actual Git-tracked accommodation assets.
// Resolve Windows/DB casing differences to their exact Vercel filenames.
const AI_VERIFIED_STATIC_IMAGE_PATHS = [
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-10.jpg",
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-11.jpg",
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-12.jpg",
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-13.jpg",
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-14.jpg",
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-15.jpg",
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-16.jpg",
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-2.jpg",
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-3.jpg",
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-4.jpg",
  "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-5.jpg",
  "images/accommodations/Big-Shade/Big-Shade-2.jpg",
  "images/accommodations/Big-Shade/Big-Shade-4.jpg",
  "images/accommodations/Big-Shade/Big-Shade-6.jpg",
  "images/accommodations/Big-Shade/Big-Shade-7.jpg",
  "images/accommodations/Big-Shade/Big-Shade-8.jpg",
  "images/accommodations/Big-Shade/Big-Shade-9.jpg",
  "images/accommodations/Double-Room/Double-Room-1.jpg",
  "images/accommodations/Double-Room/Double-Room-2.jpg",
  "images/accommodations/Double-Room/Double-Room-3.jpg",
  "images/accommodations/Double-Room/Double-Room-4.jpg",
  "images/accommodations/Double-Room/Double-Room-Cover.jpg",
  "images/accommodations/Family-Room-A/family-room-a-1.jpg",
  "images/accommodations/Family-Room-A/family-room-a-2.jpg",
  "images/accommodations/Family-Room-A/family-room-a-3.jpg",
  "images/accommodations/Family-Room-A/family-room-a-4.jpg",
  "images/accommodations/Family-Room-A/family-room-a-5.jpg",
  "images/accommodations/Family-Room-A/family-room-a-6.jpg",
  "images/accommodations/Family-Room-A/family-room-a-cover.jpg",
  "images/accommodations/Family-Room-B/family-room-b-1.jpg",
  "images/accommodations/Family-Room-B/family-room-b-2.jpg",
  "images/accommodations/Family-Room-B/family-room-b-3.jpg",
  "images/accommodations/Family-Room-B/family-room-b-4.jpg",
  "images/accommodations/Family-Room-B/family-room-b-5.jpg",
  "images/accommodations/Family-Room-B/family-room-b-6.jpg",
  "images/accommodations/Family-Room-B/family-room-b-7.jpg",
  "images/accommodations/Family-Room-B/family-room-b-cover.jpg",
  "images/accommodations/Function-Area/Beach-Pavillion.jpg",
  "images/accommodations/Function-Area/Pool-Pavillion.jpg",
  "images/accommodations/Pool-Shade/Pool-Shade-A.jpg",
  "images/accommodations/Pool-Shade/Pool-Shade-C.jpg",
  "images/accommodations/Pool-Shade/Pool-Shade-D.jpg",
  "images/accommodations/Pool-Shade/Pool-Shade-E.jpg",
  "images/accommodations/Pool-Shade/Pool-Shade-G.jpg",
  "images/accommodations/Pool-Shade/Pool-Shade-H.jpg",
  "images/accommodations/Single-Room-Cottage/single-room-1.jpg",
  "images/accommodations/Single-Room-Cottage/single-room-2.jpg",
  "images/accommodations/Single-Room-Cottage/single-room-cottage-1.jpg",
  "images/accommodations/Single-Room-Cottage/single-room-cottage-2.jpg",
  "images/accommodations/Single-Room-Cottage/single-room-cottage-3.jpg",
  "images/accommodations/Single-Room-Cottage/single-room-cottage-4.jpg",
  "images/accommodations/Single-Room-Cottage/single-room-cottage-5.jpg",
  "images/accommodations/Single-Room-Cottage/single-room-cover.jpg",
  "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-1.jpg",
  "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-2.jpg",
  "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-3.jpg",
  "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-A.jpg",
  "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-B.jpg",
  "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-C.jpg",
  "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-Cover.jpg",
  "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-D.jpg",
  "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-E.jpg",
  "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-F.jpg",
  "images/accommodations/Small-Nipa-Hut/Small-Nipa-Hut-2.jpg",
  "images/accommodations/Small-Nipa-Hut/Small-Nipa-Hut-3.jpg",
  "images/accommodations/Small-Nipa-Hut/Small-Nipa-Hut-4.jpg",
  "images/accommodations/Small-Nipa-Hut/Small-Nipa-Hut-7.jpg",
  "images/accommodations/Small-Nipa-Hut/Small-Nipa-Hut-8.jpg",
  "images/accommodations/Small-Shade/Small-Shade-1.jpg",
  "images/accommodations/Small-Shade/Small-Shade-10.jpg",
  "images/accommodations/Small-Shade/Small-Shade-10A.jpg",
  "images/accommodations/Small-Shade/Small-Shade-11.jpg",
  "images/accommodations/Small-Shade/Small-Shade-11A.jpg",
  "images/accommodations/Small-Shade/Small-Shade-12.jpg",
  "images/accommodations/Small-Shade/Small-Shade-12A.jpg",
  "images/accommodations/Small-Shade/Small-Shade-13.jpg",
  "images/accommodations/Small-Shade/Small-Shade-13A.jpg",
  "images/accommodations/Small-Shade/Small-Shade-14.jpg",
  "images/accommodations/Small-Shade/Small-Shade-14A.jpg",
  "images/accommodations/Small-Shade/Small-Shade-1A.jpg",
  "images/accommodations/Small-Shade/Small-Shade-3.jpg",
  "images/accommodations/Small-Shade/Small-Shade-3A.jpg",
  "images/accommodations/Small-Shade/Small-Shade-5.jpg",
  "images/accommodations/Small-Shade/Small-Shade-5A.jpg"
];
const AI_STATIC_IMAGE_CASE = new Map(
  AI_VERIFIED_STATIC_IMAGE_PATHS.map(path => [path.toLowerCase(), path])
);

// Name-specific fallback for legacy DB cover paths. Never borrow a different
// accommodation's photo or guess that a non-existent asset is present.
function verifiedAiRoomStaticPhoto(room) {
  const name = String(room?.name || "").normalize("NFKC").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").trim();
  let candidate = "";
  let match;
  if ((match = name.match(/^family room ([ab])$/))) {
    const letter = match[1];
    candidate = "images/accommodations/Family-Room-" + letter.toUpperCase() +
      "/family-room-" + letter + "-cover.jpg";
  } else if ((match = name.match(/^double room ([1-4])$/))) {
    candidate = "images/accommodations/Double-Room/Double-Room-" + match[1] + ".jpg";
  } else if (name === "double room") {
    candidate = "images/accommodations/Double-Room/Double-Room-Cover.jpg";
  } else if ((match = name.match(/^single room cottage ([1-5])$/))) {
    candidate = "images/accommodations/Single-Room-Cottage/single-room-cottage-" + match[1] + ".jpg";
  } else if ((match = name.match(/^single room pool side ([a-f])$/))) {
    candidate = "images/accommodations/Single-Room-Poolside/Single-Room-Poolside-" +
      match[1].toUpperCase() + ".jpg";
  } else if ((match = name.match(/^big shade (\d+)(?: cottage)?$/))) {
    candidate = "images/accommodations/Big-Shade/Big-Shade-" + match[1] + ".jpg";
  } else if ((match = name.match(/^small shade (\d+a?)(?: cottage)?$/))) {
    candidate = "images/accommodations/Small-Shade/Small-Shade-" + match[1].toUpperCase() + ".jpg";
  } else if ((match = name.match(/^big nipa hut (\d+)$/))) {
    candidate = "images/accommodations/Big-Nipa-Hut/Big-Nipa-Hut-" + match[1] + ".jpg";
  } else if ((match = name.match(/^small nipa hut (\d+)$/))) {
    candidate = "images/accommodations/Small-Nipa-Hut/Small-Nipa-Hut-" + match[1] + ".jpg";
  } else if ((match = name.match(/^pool shade ([a-z])$/))) {
    candidate = "images/accommodations/Pool-Shade/Pool-Shade-" + match[1].toUpperCase() + ".jpg";
  } else if (name === "beach pavilion" || name === "beach pavillion") {
    candidate = "images/accommodations/Function-Area/Beach-Pavillion.jpg";
  } else if (name === "pool pavilion" || name === "pool pavillion") {
    candidate = "images/accommodations/Function-Area/Pool-Pavillion.jpg";
  }
  return AI_STATIC_IMAGE_CASE.get(candidate.toLowerCase()) || "";
}

function resolveAiRoomImage(value) {
  const image = String(value || "").trim();
  const base = AI_API_BASE.replace(/\/api\/?$/, "");
  if (/^https?:\/\//i.test(image)) return image;

  // Some older room photos are inline image bytes. Never truncate a valid
  // JPG/PNG/WebP/GIF data URI; the AI response may hold only a short prefix,
  // so the full image can also be recovered from GET /api/rooms/:id.
  if (/^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(image) &&
      image.length <= 4500000) return image;

  const clean = image.replace(/^(?:\.\.\/)+/, "").replace(/^\/+/, "");
  if (clean.includes("..")) return AI_ROOM_IMAGE_FALLBACK;
  if (/^api\/rooms\/media\/[1-9]\d*$/.test(clean)) return base + "/" + clean;
  if (/^uploads\/[a-z0-9_./-]+$/i.test(clean)) return base + "/" + clean;
  if (/^(?:frontend\/)?(?:images|assets)\/[a-z0-9_./-]+$/i.test(clean)) {
    // Git/Vercel file paths are case-sensitive even though local Windows Live
    // Server accepts the older mixed-case DB filenames. IDs 1-5 have confirmed
    // lowercase filenames in /images/accommodations/Single-Room-Cottage/.
    // Correct ONLY this verified legacy mismatch; preserve other room paths.
    const cottage = clean.match(
      /^(frontend\/)?images\/accommodations\/single-room-cottage\/single-room-cottage-([1-5])\.jpg$/i
    );
    const staticPath = cottage
      ? (cottage[1] || "") + "images/accommodations/Single-Room-Cottage/single-room-cottage-" + cottage[2] + ".jpg"
      : clean;
    const withoutFrontend = staticPath.replace(/^frontend\//i, "");
    const canonicalPath = AI_STATIC_IMAGE_CASE.get(withoutFrontend.toLowerCase()) ||
      withoutFrontend;
    // Match Customer Accommodations: root-relative on Vercel, /frontend/
    // prefix in the local project-root VS Code Live Server.
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const prefix = /^\/frontend\//i.test(pathname) ? "/frontend/" : "/";
    return prefix + canonicalPath;
  }
  return AI_ROOM_IMAGE_FALLBACK;
}

// AI cards can receive a missing, legacy or truncated cover-image value.
// Retrieve the SAME publicly listed accommodation/gallery as the catalog
// page when needed, instead of inventing an image or consuming Gemini credits.
// One read-only GET per failed card, with an ID+name guard against stale cards.
function setAiRecommendationPhoto(img, room) {
  const id = Number(room?.id);
  const expectedName = String(room?.name || "").trim();
  const attempted = new Set();
  const candidates = [];
  let detailChecked = false;
  let triedVerifiedStatic = false;

  function addCandidate(value) {
    const src = resolveAiRoomImage(value);
    if (src !== AI_ROOM_IMAGE_FALLBACK && !attempted.has(src)) {
      attempted.add(src);
      candidates.push(src);
    }
  }

  async function loadRoomImages() {
    detailChecked = true;
    try {
      const response = await fetch(AI_API_BASE + "/rooms/" + encodeURIComponent(String(id)));
      if (response.ok) {
        const data = await response.json();
        const latest = data?.room;
        // Never show a different room's photo if Admin renamed/replaced it.
        if (Number(latest?.id) === id && String(latest?.name || "").trim() === expectedName) {
          addCandidate(latest.image);
          if (Array.isArray(latest.gallery_images)) {
            latest.gallery_images.forEach(addCandidate);
          }
        }
      }
    } catch (_) {
      // A failed photo request must not hide recommendations or stop the chat.
    }
    showNext();
  }

  function showNext() {
    if (candidates.length) {
      img.src = candidates.shift();
      return;
    }
    if (!detailChecked && Number.isSafeInteger(id) && id > 0) {
      // A response image may be blank or too short to contain real data.
      void loadRoomImages();
      return;
    }
    if (!triedVerifiedStatic) {
      triedVerifiedStatic = true;
      // Use ONLY the verified asset corresponding to this exact listing,
      // after trying its actual DB cover and read-only gallery.
      addCandidate(verifiedAiRoomStaticPhoto(room));
      if (candidates.length) {
        showNext();
        return;
      }
    }
    img.onerror = null;
    img.src = AI_ROOM_IMAGE_FALLBACK;
  }

  img.onerror = showNext;
  addCandidate(room?.image);
  showNext();
}

function aiRoomMoney(amount) {
  return Number.isFinite(Number(amount)) && Number(amount) > 0
    ? "₱" + formatMoney(amount) : "Rate not listed";
}

function getAiCustomerPageUrl(page, accommodationId) {
  // Public visitors can inquire and compare room cards, but entering any
  // Customer accommodation/booking workflow requires signing in first.
  if (AI_IS_PUBLIC_LANDING) return "../authHTML/login.html";
  const id = Number(accommodationId);
  if (!Number.isSafeInteger(id) || id <= 0) return "rooms.html";
  return page + "?room_id=" + encodeURIComponent(String(id));
}

function aiBookingUrl(id, selection={}) {
  const roomId=Number(id);
  if(!Number.isSafeInteger(roomId)||roomId<=0)return "rooms.html";
  const query=new URLSearchParams({room_id:String(roomId)});
  const slot=selection?.slot_type;
  if(/^\d{4}-\d{2}-\d{2}$/.test(String(selection?.check_in||"")))query.set("check_in",selection.check_in);
  if(["day_tour","night","day_extended","night_extended"].includes(slot))query.set("slot_type",slot);
  const duration=Number(selection?.stay_duration), guests=Number(selection?.guests);
  if(Number.isInteger(duration)&&duration>=1&&duration<=5)query.set("stay_duration",String(duration));
  if(Number.isSafeInteger(guests)&&guests>=1&&guests<=200)query.set("guests",String(guests));
  return AI_IS_PUBLIC_LANDING ? "../authHTML/login.html?"+query : "booking.html?"+query;
}

function setAiFocusedAccommodation(room) {
  const id = Number(room?.id);
  if (!Number.isSafeInteger(id) || id <= 0) return;
  const context = getStoredAiContext();
  context.room_id = id;
  context.room_name = String(room.name || "").slice(0, 110);
  // Keep existing guests/date preferences, but change the property being discussed.
  saveAiContext(context);
}

// UI-97: a deliberate accommodation click sends one focused inquiry.
window.askAiAboutAccommodation = function(room) {
  const id = Number(room?.id);
  const input = document.getElementById("aiChatInput");
  const sendBtn = document.getElementById("aiSendBtn");
  const chat = document.getElementById("aiChatWindow");
  if (!Number.isSafeInteger(id) || id <= 0 || !input || !sendBtn || !chat) return;
  chat.classList.add("show");
  // Never replace the active request or the user's unsent draft.
  if (aiMessageInFlight) return;
  setAiFocusedAccommodation(room);
  return sendAiMessage({ source: "accommodation", message: "Tell me more about " + String(room.name || "this accommodation") + "." });
};

function appendAiRecommendationCards(items, save = true) {
  const messages = document.getElementById("aiChatMessages");
  if (!messages || !Array.isArray(items)) return;
  const cards = items.filter((room) => Number.isSafeInteger(Number(room?.id)) &&
    Number(room.id) > 0).slice(0, 3);
  if (!cards.length) return;

  const wrapper = document.createElement("div");
  wrapper.className = "ai-recommendations";
  const caption = document.createElement("p");
  caption.className = "ai-recommendations-caption";
  caption.textContent = "Accommodation previews · Rates are listed prices; final slot availability is checked when booking.";
  wrapper.appendChild(caption);
  const grid = document.createElement("div");
  grid.className = "ai-recommendations-grid";

  cards.forEach((room) => {
    const card = document.createElement("article");
    card.className = "ai-recommendation-card";
    const img = document.createElement("img");
    img.className = "ai-recommendation-photo";
    img.alt = String(room.name || "Accommodation") + " preview";
    img.loading = "lazy";
    setAiRecommendationPhoto(img, room);
    card.appendChild(img);

    const body = document.createElement("div");
    body.className = "ai-recommendation-body";
    const name = document.createElement("strong");
    name.textContent = String(room.name || "Accommodation");
    const info = document.createElement("p");
    info.textContent = [
      String(room.category || "Accommodation"),
      Number(room.capacity) > 0 ? "Up to " + Number(room.capacity) + " guests" : "Capacity not listed",
    ].join(" · ");
    const prices = document.createElement("p");
    prices.className = "ai-recommendation-price";
    prices.textContent = "Day " + aiRoomMoney(room.day_price) +
      " · Night " + aiRoomMoney(room.overnight_price);
    const note = document.createElement("p");
    note.className = "ai-recommendation-note";
    const selection=room.booking_selection;
    const status=room.availability_status;
    if(selection&&["available","unavailable","unknown"].includes(status)){
      const label={day_tour:"Day Tour",night:"Overnight",day_extended:"Day Extended",night_extended:"Night Extended"}[selection.slot_type]||"Selected slot";
      note.textContent=(status==="available"?"Available when checked":status==="unavailable"?"Unavailable":"Not verified")+" · "+selection.check_in+" · "+label+(selection.check_out?" · "+formatTime(selection.check_in_time)+" to "+selection.check_out+" "+formatTime(selection.check_out_time):"")+(status==="available"?" · Recheck before payment":"");
      if(Number(room.selected_rate)>0)prices.textContent=label+" rate "+aiRoomMoney(room.selected_rate)+(Number(selection.stay_duration)>1?" per day":"");
    }else note.textContent = room.availability_verified
      ? "Preliminary date match · Recheck exact time slot before payment"
      : "Listing available · Date and time slot not checked yet";
    body.append(name, info, prices, note);

    const actions = document.createElement("div");
    actions.className = "ai-recommendation-actions";
    const detail = document.createElement("a");
    detail.href = getAiCustomerPageUrl("rooms.html", room.id);
    detail.textContent = AI_IS_PUBLIC_LANDING ? "Login for Details" : "View Details";
    detail.className = "ai-recommendation-link";
    const book = document.createElement("a");
    book.href = aiBookingUrl(room.id,room.booking_selection);
    book.textContent = AI_IS_PUBLIC_LANDING ? "Log In to Book This" : "Book This";
    book.className = "ai-recommendation-link primary";
    const ask = document.createElement("button");
    ask.type = "button";
    ask.textContent = "Ask About This";
    ask.className = "ai-recommendation-link";
    ask.addEventListener("click", () => window.askAiAboutAccommodation(room));
    actions.append(detail);
    if(room.availability_status!=="unavailable"&&room.availability_status!=="unknown")actions.append(book);
    actions.append(ask);
    body.appendChild(actions);
    card.appendChild(body);
    grid.appendChild(card);
  });
  wrapper.appendChild(grid);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
  if (save) {
    addToChatHistory({ type: "recommendations", cards });
  }
}

function createBookingFromPreview(preview, button) {
  // UI-37: Public landing visitors must always go through Customer login.
  // A stale localStorage user object is not proof of authentication.
  if (AI_IS_PUBLIC_LANDING) {
    window.location.href = aiBookingUrl(preview?.room_id,preview?.booking_selection || {check_in:preview?.check_in,slot_type:preview?.slot_type,stay_duration:preview?.stay_duration,guests:preview?.guests});
    return;
  }
  // AI suggestions never create reservations directly. The Customer
  // booking form owns final dates, slot pricing, payment and conflict checks.
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const frontendPrefix = window.location.pathname.includes("/frontend/")
    ? "/frontend"
    : "";

  if (!user || String(user.role || "").toLowerCase() !== "customer") {
    appendAiSystemNote("Please log in as a Customer before continuing to booking.");
    window.location.href = frontendPrefix + "/authHTML/login.html";
    return;
  }

  if (preview?.booking_schema !== "accommodations_v2") {
    appendAiSystemNote("This AI suggestion is outdated. Please ask for an updated accommodation recommendation.");
    return;
  }

  const accommodationId = Number(preview?.room_id);
  if (!Number.isSafeInteger(accommodationId) || accommodationId <= 0) {
    appendAiSystemNote("Please select an accommodation on the booking page.");
    return;
  }

  button.disabled = true;
  button.textContent = "Opening booking form...";
  appendAiSystemNote("No reservation has been created yet. Confirm dates, slot, official price and payment on the secure booking form.");
  window.location.href = aiBookingUrl(accommodationId,preview.booking_selection || {check_in:preview.check_in,slot_type:preview.slot_type,stay_duration:preview.stay_duration,guests:preview.guests});
}

function getOfflineFallbackReply(message, storedContext = {}, pageContext = {}) {
  const text = String(message || "").toLowerCase();
  const context = {
    ...storedContext,
    ...pageContext,
  };

  const extracted = extractOfflineDetails(message);
  const detectedLanguage = detectOfflineLanguage(message, context);
  extracted.language_style = detectedLanguage;

  const merged = mergeContext(context, extracted);

  // Resort-wide verified facts are still available when Gemini/network fails.
  // This helper never creates a booking or infers any unconfirmed policy.
  const inquiryLanguage = /\b(?:may|meron|kayo|ba|bang|po|opo|libre|libreng|magkano|pwede|puwede|saan|sasakyan)\b/i.test(String(message))
    ? "taglish" : detectedLanguage;
  const verifiedResortReply = getOfflineVerifiedResortReply(
    message, inquiryLanguage, merged
  );
  if (verifiedResortReply) return verifiedResortReply;

  if (detectedLanguage === "tagalog") {
    return getTagalogFallbackReply(text, merged);
  }

  if (detectedLanguage === "taglish") {
    return getTaglishFallbackReply(text, merged);
  }

  return getEnglishFallbackReply(text, merged);
}

// Keep this tiny offline mirror aligned with backend/resortInquiryKnowledge.js.
// Source of truth for parking: client-confirmed November 19, 2026;
// no-animals policy: client-confirmed November 22, 2026.
// Outside food/drinks allowed (corkage fee unknown), free Wi-Fi in Rooms only,
 // pool always open with no swimwear restrictions. Pool fees still unverified.
function getOfflineVerifiedResortReply(message, language, context) {
  const t = String(message || "").normalize("NFKC").toLowerCase().trim();
  if (!t || t.length > 600) return null;
  const park = /\b(?:parking|park|car\s*park|paradahan|mag[ -]?park)\b/i.test(t);
  const address = /\b(?:address|located|location|nasaan\s+(?:ang\s+)?resort|saan\s+(?:kayo|ang\s+resort))\b/i.test(t);
  const hours = /\b(?:open\s+(?:24\s*(?:\/\s*7|hours?)|everyday)|operating\s+hours?|opening\s+hours?|bukas\s+ba\s+kayo)\b/i.test(t);
  const contact = /\b(?:contact\s+(?:number|details?)|phone\s+number|hotline|numero\s+ng\s+resort)\b/i.test(t);
  const pool = /\b(?:swimming\s+pool|pool(?![\s-]?(?:shade|side|pavilion|pavillion))|may\s+(?:ba\s+)?pool|have\s+(?:a\s+)?pool|swim(?:ming)?\s+(?:at|hours?|anytime|attire|clothes|wear|dress)|swimwear|palanguyan|panglangoy)\b/i.test(t);
  const entry = /\b(?:entrance\s+(?:fee|charge|payment)|free\s+entrance|libre(?:ng)?(?:\s+rin)?(?:\s+ba)?\s+(?:ang\s+)?entrance)\b/i.test(t);
  const lang = ["english", "tagalog", "taglish"].includes(language) ? language : "english";
  const notice = lang === "english"
    ? "AI is temporarily unavailable. Offline assistant mode is active."
    : lang === "tagalog"
      ? "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna."
      : "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.";
  const reply = (english, tagalog, taglish) =>
    ({ english, tagalog, taglish })[lang];
  const withReply = answer => ({ modeNotice: notice, reply: answer, context });

  // AI-60: Approved no-pets policy also applies when the backend is offline.
  // The question may involve a named room because this restriction is
  // property-wide. Never infer pet-fee exceptions or pet boarding options.
  const pet = /\b(?:pets?|pet[\s-]?friendly|dogs?|cats?|pupp(?:y|ies)|kittens?|animals?|aso|pusa|hayop|alagang\s+hayop|iro|iring|mascotas?|perros?|gatos?)\b/iu.test(t) ||
    /(?:宠物|猫|狗)/u.test(t);
  const wifi = /\b(?:wi-?fi|wireless|internet)\b/i.test(t);
  const food = /\b(?:corkage|outside[\s-]?food|outside[\s-]?drinks?|own\s+(?:food|drinks?|beverages?)|bring(?:ing)?\s+(?:(?:my|our|your|their|some|own)\s+)?(?:food|drinks?|snacks?|beverages?)|baon|magbaon|dalang\s+(?:pagkain|inumin|food)|magdala\s+(?:ng\s+)?(?:pagkain|inumin|food)|(?:pwede|puwede)\s+.*\b(?:pagkain|inumin)\b|food\s+policy|food\s+allowed)\b/i.test(t);
  // AI-62: Same resort-confirmed guest permissions offline, without claiming
  // any booked accommodation includes karaoke/audio equipment. In multi-part
  // inquiries, include the other verified facts rather than ignoring them.
  const guestAlcohol = /\b(?:alcohol(?:ic)?|beer|liquor|wine|spirits|alak|inuming\s+may\s+alkohol)\b/i.test(t);
  const guestSmoke = /\b(?:smok(?:e|ing)|cigarettes?|tobacco|vap(?:e|ing)|e[\s-]?cigarettes?|yosi|sigarilyo|manigarilyo|mag[\s-]?yosi)\b/i.test(t);
  const guestAudio = /\b(?:videoke|karaoke|mag[\s-]?videoke|mag[\s-]?karaoke|speakers?|bluetooth\s+speakers?|sound\s+system|soundbox|music\s+system|microphone|mikropono)\b/i.test(t);
  const audioProvided = guestAudio &&
    /\b(?:do\s+you\s+(?:have|provide|offer)|(?:is\s+there|are\s+there)\s+(?:(?:a|any|some)\s+)?(?:videoke|karaoke|speakers?|sound\s+system)|included|inclusions?|comes?\s+with|may\s+(?:(?:ba|po|sariling)\s+)*(?:videoke|karaoke|speaker)|meron\s+(?:(?:ba|po|sariling)\s+)*(?:videoke|karaoke|speaker)|kasama\s+(?:(?:ba|po|ang)\s+)*(?:videoke|karaoke|speaker)|provided|built[\s-]?in|rental|rent(?:ing)?)\b/i.test(t) &&
    !/\b(?:bring|bringing|own|our|my|dalhin|magdala|pwede|puwede|allowed|bawal)\b/i.test(t);
  const alcoholRetail = guestAlcohol && /\b(?:sell|selling|sold|serve|serving|provide|buy|purchase|order|for\s+sale|magbenta|nagbebenta|tinda)\b/i.test(t);
  const otherFinancial = /\b(?:downpayment|deposit|paypal|refund|booking\s+total|room\s+rate|room\s+price|magkano\s+(?:ang\s+)?(?:room|kwarto))\b/i.test(t);
  if ((guestAlcohol || guestSmoke || guestAudio) && !audioProvided &&
      !alcoholRetail && !otherFinancial) {
    const answer=[];
    if (guestAlcohol) answer.push(reply(
      "Yes, guests may bring alcoholic drinks.",
      "Opo, maaaring magdala ng mga inuming may alkohol.",
      "Yes po, puwede magdala ng alcoholic drinks."
    ));
    if (guestSmoke) answer.push(reply(
      "Smoking and vaping are allowed.",
      "Pinapayagan po ang paninigarilyo at paggamit ng vape.",
      "Allowed po ang smoking at vaping."
    ));
    if (guestAudio) answer.push(reply(
      "You may bring and use your own videoke or speakers.",
      "Maaari pong magdala at gumamit ng sariling videoke o speakers.",
      "Puwede po magdala at gumamit ng sariling videoke at speakers."
    ));
    answer.push(reply(
      "The resort has no specific time restrictions for these activities.",
      "Wala pong itinakdang oras ng pagbabawal ang resort para sa mga gawaing ito.",
      "Wala pong specific time restrictions ang resort para sa mga ito."
    ));
    if (guestSmoke && /\b(?:inside\s+(?:a|the|our|my)\s+room|in\s+(?:a|the|our|my)\s+room|sa\s+(?:loob\s+ng\s+)?(?:room|kwarto|kuwarto|cottage)|indoors?|balcony|poolside|designated\s+(?:area|zone))\b/i.test(t)) answer.push(reply(
      "Whether smoking/vaping is allowed inside a specific room or area isn't confirmed; please ask Front Desk.",
      "Hindi pa kumpirmado kung puwede sa loob ng partikular na kuwarto o lugar; pakitanong sa Front Desk.",
      "Hindi pa confirmed kung puwede mismo sa loob ng room o specific area; pa-check sa Front Desk."
    ));
    if (pet) answer.push(reply(
      "Pets and other animals are not allowed.",
      "Bawal po ang mga alagang hayop at iba pang hayop.",
      "Bawal po ang pets at ibang hayop."
    ));
    if (wifi) answer.push(reply(
      "Free Wi-Fi is provided in rooms only, not cottages or common areas.",
      "Sa mga kuwarto lamang po may libreng Wi-Fi, hindi sa cottages o common areas.",
      "Sa rooms lang po may free Wi-Fi, hindi sa cottages o common areas."
    ));
    if (food) answer.push(reply(
      "Guests may bring food and drinks. Corkage fees are not yet confirmed.",
      "Maaaring magdala ng pagkain at inumin. Hindi pa kumpirmado ang corkage fee.",
      "Puwede magdala ng food at drinks; hindi pa confirmed ang corkage fee."
    ));
    if (pool) answer.push(reply(
      "The pool is always open, with no specific swimwear restrictions.",
      "Laging bukas ang pool at walang partikular na swimwear restrictions.",
      "Always open po ang pool, walang specific swimwear restrictions."
    ));
    if (park) answer.push(reply(
      "Vehicle parking is free.","Libre po ang paradahan ng mga sasakyan.",
      "Free po ang parking ng vehicles."
    ));
    return withReply(answer.join(" "));
  }

  if (pet && !/\b(?:downpayment|deposit|paypal|refund|booking\s+total|room\s+rate|magkano\s+(?:ang\s+)?(?:room|kwarto))\b/i.test(t)) {
    const policy = reply(
      "Sorry, animals and pets are not allowed at Arvic Seaside Resort, including dogs and cats.",
      "Pasensya na po, bawal magdala ng mga hayop sa Arvic Seaside Resort, kasama ang aso at pusa.",
      "Sorry po, hindi pet-friendly ang Arvic Seaside Resort. Bawal magdala ng pets o kahit anong hayop, including dogs and cats."
    );
    const parkingNote = park ? reply(
      " Parking for vehicles is free.", " Libre ang parking ng sasakyan.",
      " Free po ang parking ng vehicles."
    ) : "";
    const wifiNote = wifi ? reply(
      " Free Wi-Fi is available in room accommodations only, not in cottages or common areas.",
      " Sa mga kuwarto lamang po may libreng Wi-Fi, hindi sa cottages o common areas.",
      " Sa rooms lang po may free Wi-Fi, hindi sa cottages o common areas."
    ) : "";
    const foodNote = food ? reply(
      " Guests may bring their own food and drinks. Corkage fees have not been confirmed.",
      " Maaari pong magdala ng pagkain at inumin. Hindi pa kumpirmado ang corkage fee.",
      " Puwede magdala ng sariling food at drinks; hindi pa confirmed ang corkage fee."
    ) : "";
    return withReply(policy + parkingNote + wifiNote + foodNote);
  }

  // AI-61: Offline facts mirror the verified backend; don't guess corkage,
  // Wi-Fi credentials, pool entrance price or unrelated safety rules.
  const alcoholRule = /\b(?:alcohol(?:ic)?|beer|liquor|wine|alak|smoking|vaping|yosi|sigarilyo|videoke|karaoke)\b/i.test(t);
  const otherBooking= /\b(?:downpayment|deposit|paypal|refund|booking\s+status|room\s+rate|magkano\s+(?:ang\s+)?(?:room|kwarto))\b/i.test(t);
  if ((wifi || food || pool) && !alcoholRule && !otherBooking) {
    const cottage = /\b(?:cottages?|kubo|nipa\s+hut|pavilions?|function\s+areas?|lobby|common\s+areas?|poolside)\b/i.test(t) &&
      !/\bsingle\s+room\s+cottage\b/i.test(t);
    const asksCorkage = food && /\b(?:corkage|charge|fee|free|libre|bayad|magkano|how\s+much)\b/i.test(t);
    const asksPoolFee = pool && (
      /\b(?:pool|swimming|piscina)\b.{0,55}\b(?:entrance|admission|fees?|ticket|price|cost|libre|free|magkano|how\s+much|bayad)\b/i.test(t) ||
      /\b(?:entrance|admission|fees?|ticket|price|cost|magkano|how\s+much|bayad)\b.{0,55}\b(?:pool|swimming|piscina)\b/i.test(t)
    );
    const asksPoolRule = pool && /\b(?:life[\s-]?guards?|children|bata|safety|supervis|age|depth|rules?|restrictions?)\b/i.test(t);
    const answer=[];
    if (wifi) answer.push(cottage ? reply(
      "Free Wi-Fi is available in rooms only, not in cottages or common areas.",
      "Sa mga kuwarto lamang po may libreng Wi-Fi, hindi sa cottages o common areas.",
      "Free Wi-Fi po sa rooms lang, hindi sa cottages o common areas."
    ) : reply(
      "Free Wi-Fi is available in room accommodations only.",
      "Sa mga kuwarto lamang po may libreng Wi-Fi.",
      "Free Wi-Fi po ay nasa rooms lang."
    ));
    if (wifi && /\b(?:password|speed|mbps|signal|fast|reliable)\b/i.test(t)) answer.push(reply(
      "The Wi-Fi password and speeds aren't confirmed; please ask Front Desk.",
      "Hindi pa kumpirmado ang password at bilis ng Wi-Fi; pakitanong sa Front Desk.",
      "Hindi pa confirmed ang Wi-Fi password at speed; pa-check sa Front Desk."
    ));
    if (food) answer.push(reply(
      "Yes, you may bring your own food and drinks.",
      "Opo, maaari pong magdala ng sariling pagkain at inumin.",
      "Yes po, puwede magdala ng sariling food at drinks."
    ));
    if (asksCorkage) answer.push(reply(
      "Whether any corkage fee applies hasn't been confirmed; please ask Front Desk.",
      "Hindi pa kumpirmado kung may corkage fee; pakitanong sa Front Desk.",
      "Hindi pa confirmed kung may corkage fee; pa-check sa Front Desk."
    ));
    if (pool) answer.push(reply(
      "The swimming pool is always open, including at night, with no specific swimwear restrictions.",
      "Laging bukas ang pool, kahit gabi, at walang partikular na pagbabawal sa kasuotang panlangoy.",
      "Always open po ang swimming pool, kahit gabi, at walang specific swimwear restrictions."
    ));
    if (asksPoolFee) answer.push(reply(
      "Pool entrance fees haven't been confirmed; please ask Front Desk.",
      "Hindi pa kumpirmado ang pool entrance fee; pakitanong sa Front Desk.",
      "Hindi pa confirmed ang pool entrance fee; pa-check sa Front Desk."
    ));
    if (asksPoolRule) answer.push(reply(
      "Other pool safety and supervision rules haven't been confirmed; please ask Front Desk.",
      "Hindi pa kumpirmado ang ibang pool safety rules; pakitanong sa Front Desk.",
      "Hindi pa confirmed ang ibang pool safety rules; pa-check sa Front Desk."
    ));
    if (park) answer.push(reply(
      "Vehicle parking is free.", "Libre po ang paradahan ng mga sasakyan.",
      "Free po ang parking ng vehicles."
    ));
    return withReply(answer.join(" "));
  }

  // Unsupported general policies are handled conservatively even offline.
  // Parking being free does not imply that Wi-Fi or corkage is also free.
  const unknownPolicy = /\b(?:alcohol(?:ic)?|beer|liquor|wine|alak|smoking|vaping|yosi|sigarilyo)\b/i.test(t);
  if (unknownPolicy) return withReply(reply(
    (park ? "Parking is free for all vehicles. " : "") +
      "That resort policy has not yet been confirmed. Please ask Front Desk at 0956-912-5625.",
    (park ? "Libre po ang parking. " : "") +
      "Hindi pa confirmed ang iba pang policy na iyon. Pakitanong po sa Front Desk: 0956-912-5625.",
    (park ? "Free po ang parking. " : "") +
      "Hindi pa confirmed yung iba pang policy. Pa-check po sa Front Desk: 0956-912-5625."
  ));

  // Don't answer only one part of a complex question or promise a room-specific perk.
  if (/\b(?:family\s+room|double\s+room|single\s+room|nipa\s+hut|pool\s+shade|pavilion|cottage|facilities|amenities|pets?|dogs?|cats?|wi-?fi|corkage|outside\s+food|room\s+rate)\b/i.test(t)) return null;
  if ([park, address, hours, contact, pool].filter(Boolean).length !== 1) return null;

  if (park && entry) return withReply(reply(
    "Parking is free for any vehicle. Entrance fees are separate and confirmed by Front Desk.",
    "Libre po ang parking para sa anumang sasakyan. Hiwalay po ang entrance fee, at Front Desk ang magko-confirm.",
    "Free po ang parking for any vehicle. Separate naman po ang entrance fee; Front Desk ang magko-confirm onsite."
  ));
  if (entry) return null;
  if (park) {
    const unknown = /\b(?:secure|security|cctv|guard(?:ed)?|covered|roof|shade|reserve|reserved|slots?|spaces?|capacity|how\s+many|ilang|where|saan|entrance|exit|parking\s+hours?)\b/i.test(t);
    return withReply(unknown ? reply(
      "Parking is free for all vehicle types, but that specific parking detail isn't verified. Please confirm with Front Desk at 0956-912-5625.",
      "Libre po ang parking, pero hindi pa confirmed ang specific detail. Pakitanong po sa Front Desk: 0956-912-5625.",
      "Free po ang parking, pero hindi pa confirmed yung detail na iyon. Pa-check sa Front Desk: 0956-912-5625."
    ) : reply(
      "Yes! Free parking is available for every vehicle type, including motorcycles, cars, vans, and buses.",
      "Opo, libre ang parking para sa anumang sasakyan, kasama ang motor, kotse, van at bus.",
      "Yes po, may free parking para sa kahit anong vehicle—motor, kotse, van, o bus. Walang parking fee."
    ));
  }
  if (address) return withReply(reply(
    "We're at 17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite.",
    "Nasa 17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite po ang resort.",
    "Nasa 17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite po ang resort."
  ));
  if (hours && !/check[ -]?(?:in|out)|booking\s+time/i.test(t)) return withReply(reply(
    "The resort is open 24 hours, Monday to Sunday. Accommodation check-in and check-out use fixed booking slots.",
    "Bukas po ang resort nang 24 oras araw-araw, pero fixed pa rin ang accommodation check-in at check-out.",
    "Open po ang resort 24 hours, Monday to Sunday. Fixed booking slots pa rin po ang check-in at check-out."
  ));
  if (contact) return withReply(reply(
    "Resort contact numbers: 0956-912-5625 and 0967-817-0662.",
    "Maaaring tumawag sa 0956-912-5625 o 0967-817-0662.",
    "Pwede niyo pong tawagan ang resort sa 0956-912-5625 o 0967-817-0662."
  ));
  if (pool) return withReply(reply(
    "Yes, the resort has a swimming pool. Pool fees and rules must be confirmed with Front Desk.",
    "Opo, may swimming pool ang resort. I-confirm po sa Front Desk ang fees at rules.",
    "Yes po, may swimming pool! For fees and rules, pa-confirm po sa Front Desk."
  ));
  return null;
}

// Stage 85-D: Offline guidance mirrors the verified PayPal-only customer online flow.
// It must not claim that cash checkout or an automatic booking is available.
function getEnglishFallbackReply(text, merged) {
  // Offline timing FAQ uses verified preset slots, not invented custom hours.
  if (/\b(?:check[ -]?in|check[ -]?out)\b.*\b(?:times?|hours?|oras|schedule|slot)\b|\b(?:times?|hours?|oras|schedule|slot)\b.*\b(?:check[ -]?in|check[ -]?out)\b/i.test(text)) {
    return { modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.", reply: "Arvic Seaside Resort uses fixed Day Tour (morning) and Night (evening) slots, not custom check-in or check-out times. Rooms: 7 AM-5 PM or 7 PM-5 AM; cottages/huts: 6 AM-5 PM or 6 PM-5 AM; pavilions/function areas: 8 AM-6 PM or 8 PM-6 AM. Extended slots are separate. Choose your exact schedule on the booking page.", context: merged };
  }
  // Offline refund guidance mirrors the verified manual refund policy.
  // Do not promise a refund or attempt any refund transaction here.
  if (/refund|reimbursement|money back|return.*payment/i.test(text)) {
    return {
      modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
      reply: "Refunds are not processed automatically. Resort management reviews refund requests manually based on resort policy and verified payments; cancellation does not guarantee a refund. For assistance, please message the resort's official Facebook page: " + OFFICIAL_RESORT_FACEBOOK_URL + "\n\nFront Desk: " +
        OFFICIAL_RESORT_PHONE_PRIMARY + "\nAlternative: " +
        OFFICIAL_RESORT_PHONE_ALTERNATIVE,
      context: merged,
    };
  }
  if (/\b(?:hello|hi|hey)\b/i.test(text)) {
    return {
      modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
      reply: "Hi! You can still ask me about bookings and room details.",
      context: merged,
    };
  }

  if (text.includes("how to book") || text.includes("book room") || text.includes("booking process")) {
    return {
      modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
      reply: "Choose a room, date and fixed Day Tour or Night slot on the booking page. Pay the 50% accommodation downpayment through PayPal; entrance fees are paid onsite. After confirmation, check the reservation in My Bookings.",
      context: merged,
    };
  }

  if (text.includes("payment") || text.includes("paypal") || text.includes("cash")) {
    return {
      modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
      reply: "Online booking uses PayPal for the 50% accommodation downpayment. The balance and entrance fee are paid onsite; check the final amount before paying.",
      context: merged,
    };
  }

  if (text.includes("my booking") || text.includes("my bookings") || text.includes("receipt")) {
    return {
      modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
      reply: "You can open the My Bookings page to view your reservation history, booking status, and receipt.",
      context: merged,
    };
  }

  if (merged.check_in || merged.check_out || merged.guests || merged.check_in_time || merged.check_out_time || merged.slot_preference) {
    const missing = [];
    if (!merged.check_in) missing.push("check-in date");
    if (!merged.check_out) missing.push("check-out date");
    if ((!merged.check_in_time || !merged.check_out_time) && !merged.slot_preference) missing.push("fixed Day Tour (morning) or Night (evening) slot on the booking page");
    if (!merged.guests) missing.push("number of guests");

    if (missing.length) {
      return {
        modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
        reply: `I saved part of your booking details. I still need your ${missing.join(", ")}. After that, you can continue on the Rooms page or Booking page.`,
        context: merged,
      };
    }

    // The slot preference is conversational, not an exact verified stay window.
    // Never show N/A check-in hours as a completed booking summary.
    if (!merged.check_in_time || !merged.check_out_time) {
      return {
        modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
        reply: `I saved your dates, guest count, and preferred fixed ${merged.slot_preference === "night" ? "Night (evening)" : "Day Tour (morning)"} slot. The secure booking page sets the actual check-in and check-out times based on your accommodation and checks availability. No reservation has been created.`,
        context: merged,
      };
    }

    return {
      modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
      reply: `I saved your booking details: check-in ${merged.check_in} at ${formatTime(merged.check_in_time)}, check-out ${merged.check_out} at ${formatTime(merged.check_out_time)}, and ${merged.guests} guest(s). Offline mode cannot check live room availability right now, but you can go to the Rooms page and choose the best room manually.`,
      context: merged,
    };
  }

  return {
    modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
    reply: "I can still help with basic booking questions. What would you like to know?",
    context: merged,
  };
}

function getTagalogFallbackReply(text, merged) {
  // Offline timing FAQ uses verified preset slots, not invented custom hours.
  if (/\b(?:check[ -]?in|check[ -]?out)\b.*\b(?:times?|hours?|oras|schedule|slot)\b|\b(?:times?|hours?|oras|schedule|slot)\b.*\b(?:check[ -]?in|check[ -]?out)\b/i.test(text)) {
    return { modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.", reply: "Fixed slot po ang booking sa Arvic Seaside Resort, hindi custom na check-in/check-out oras. Day Tour (umaga) o Night (gabi) po ang pipiliin. Rooms: 7 AM-5 PM o 7 PM-5 AM; cottages/huts: 6 AM-5 PM o 6 PM-5 AM; pavilions/function areas: 8 AM-6 PM o 8 PM-6 AM. May hiwalay na extended slots. Piliin po ang exact schedule sa booking page.", context: merged };
  }
  // Offline Tagalog refund assistance uses the same official contact.
  if (/refund|marefund|ma-refund|ibalik.*(?:bayad|pera)|balik.*(?:bayad|pera)/i.test(text)) {
    return {
      modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
      reply: "Hindi po automatic ang refund. Manual na sinusuri ng resort management ang requests batay sa policy at verified payment; hindi guaranteed ang refund kapag nag-cancel. Para po sa assistance, mag-message sa official Facebook page ng resort: " + OFFICIAL_RESORT_FACEBOOK_URL + "\n\nFront Desk: " +
        OFFICIAL_RESORT_PHONE_PRIMARY + "\nAlternative: " +
        OFFICIAL_RESORT_PHONE_ALTERNATIVE,
      context: merged,
    };
  }
  if (/\b(?:hello|hi|hey|kumusta)\b/i.test(text)) {
    return {
      modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
      reply: "Hi po! Puwede pa rin kayong magtanong tungkol sa booking.",
      context: merged,
    };
  }

  if (text.includes("paano mag book") || text.includes("paano mag-book") || text.includes("booking process") || text.includes("mag book")) {
    return {
      modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
      reply: "Pumili po ng accommodation, date at fixed Day Tour o Night slot sa booking page. Ang downpayment ay 50% via PayPal; hiwalay po ang entrance fee. Kapag confirmed na, makikita ang reservation sa My Bookings.",
      context: merged,
    };
  }

  if (text.includes("bayad") || text.includes("payment") || text.includes("paypal") || text.includes("cash")) {
    return {
      modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
      reply: "Sa online booking po, PayPal ang 50% accommodation downpayment. Onsite naman ang balance at entrance fee; makikita ang final amount bago magbayad.",
      context: merged,
    };
  }

  if (text.includes("my bookings") || text.includes("aking booking") || text.includes("resibo") || text.includes("receipt")) {
    return {
      modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
      reply: "Maaari mong buksan ang My Bookings page para makita ang reservation history, booking status, at receipt mo.",
      context: merged,
    };
  }

  if (merged.check_in || merged.check_out || merged.guests || merged.check_in_time || merged.check_out_time || merged.slot_preference) {
    const missing = [];
    if (!merged.check_in) missing.push("check-in date");
    if (!merged.check_out) missing.push("check-out date");
    if ((!merged.check_in_time || !merged.check_out_time) && !merged.slot_preference) missing.push("fixed Day Tour (morning) or Night (evening) slot on the booking page");
    if (!merged.guests) missing.push("bilang ng bisita");

    if (missing.length) {
      return {
        modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
        reply: `Na-save ko ang ilang booking details mo. Kailangan ko pa ang ${missing.join(", ")}. Pagkatapos noon, maaari kang magpatuloy sa Rooms page o Booking page.`,
        context: merged,
      };
    }

    // The slot preference is conversational, not an exact verified stay window.
    // Never show N/A check-in hours as a completed booking summary.
    if (!merged.check_in_time || !merged.check_out_time) {
      return {
        modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
        reply: `Na-save po ang dates, bilang ng bisita, at napiling fixed ${merged.slot_preference === "night" ? "Night (gabi)" : "Day Tour (umaga)"} slot. Sa booking page po makikita ang eksaktong check-in/check-out times ayon sa accommodation at availability. Wala pang nakumpirmang reservation.`,
        context: merged,
      };
    }

    return {
      modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
      reply: `Na-save ko ang booking details mo: check-in ${merged.check_in} nang ${formatTime(merged.check_in_time)}, check-out ${merged.check_out} nang ${formatTime(merged.check_out_time)}, at ${merged.guests} bisita. Hindi makakapag-check ng live room availability ang offline mode ngayon, pero maaari kang pumunta sa Rooms page at manual na pumili ng pinakamagandang room.`,
      context: merged,
    };
  }

  return {
    modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
    reply: "Makakatulong pa rin po ako sa basic booking questions. Ano po ang gusto ninyong malaman?",
    context: merged,
  };
}

function getTaglishFallbackReply(text, merged) {
  // Offline timing FAQ uses verified preset slots, not invented custom hours.
  if (/\b(?:check[ -]?in|check[ -]?out)\b.*\b(?:times?|hours?|oras|schedule|slot)\b|\b(?:times?|hours?|oras|schedule|slot)\b.*\b(?:check[ -]?in|check[ -]?out)\b/i.test(text)) {
    return { modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.", reply: "Fixed Day Tour (umaga) at Night (gabi) slots po ang Arvic Seaside Resort, hindi custom ang check-in/check-out times. Rooms: 7 AM-5 PM o 7 PM-5 AM; cottages/huts: 6 AM-5 PM o 6 PM-5 AM; pavilions/function areas: 8 AM-6 PM o 8 PM-6 AM. May hiwalay na extended slots. Piliin po ang exact schedule sa booking page.", context: merged };
  }
  // Offline Taglish refund assistance uses the same official contact.
  if (/refund|marefund|ma-refund|ibalik.*(?:bayad|pera)|balik.*(?:bayad|pera)/i.test(text)) {
    return {
      modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
      reply: "Hindi po automatic ang refund. Resort management manually reviews requests based on policy at verified payments; hindi guaranteed ang refund dahil lang sa cancellation. For assistance po, message the official Facebook page ng resort: " + OFFICIAL_RESORT_FACEBOOK_URL + "\n\nFront Desk: " +
        OFFICIAL_RESORT_PHONE_PRIMARY + "\nAlternative: " +
        OFFICIAL_RESORT_PHONE_ALTERNATIVE,
      context: merged,
    };
  }
  if (/\b(?:hello|hi|hey|kumusta)\b/i.test(text)) {
    return {
      modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
      reply: "Hi po! Puwede pa rin kayong magtanong tungkol sa booking.",
      context: merged,
    };
  }

  if (text.includes("how to book") || text.includes("paano mag book") || text.includes("paano mag-book") || text.includes("booking process")) {
    return {
      modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
      reply: "Pili po ng accommodation, date, at Day Tour o Night slot sa booking page. 50% po ang downpayment via PayPal; hiwalay ang entrance fee. Kapag confirmed na, check niyo po sa My Bookings.",
      context: merged,
    };
  }

  if (text.includes("payment") || text.includes("bayad") || text.includes("paypal") || text.includes("cash")) {
    return {
      modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
      reply: "50% accommodation downpayment po via PayPal ang online booking. Sa resort na ang balance at entrance fee; check po ang final amount bago magbayad.",
      context: merged,
    };
  }

  if (text.includes("my booking") || text.includes("my bookings") || text.includes("receipt") || text.includes("resibo")) {
    return {
      modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
      reply: "Pwede mong buksan ang My Bookings page para makita ang reservation history, booking status, at receipt mo.",
      context: merged,
    };
  }

  if (merged.check_in || merged.check_out || merged.guests || merged.check_in_time || merged.check_out_time || merged.slot_preference) {
    const missing = [];
    if (!merged.check_in) missing.push("check-in date");
    if (!merged.check_out) missing.push("check-out date");
    if ((!merged.check_in_time || !merged.check_out_time) && !merged.slot_preference) missing.push("fixed Day Tour (morning) or Night (evening) slot on the booking page");
    if (!merged.guests) missing.push("number of guests");

    if (missing.length) {
      return {
        modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
        reply: `Na-save ko na ang part ng booking details mo. Kailangan ko pa ang ${missing.join(", ")}. After that, pwede ka nang magpatuloy sa Rooms page or Booking page.`,
        context: merged,
      };
    }

    // The slot preference is conversational, not an exact verified stay window.
    // Never show N/A check-in hours as a completed booking summary.
    if (!merged.check_in_time || !merged.check_out_time) {
      return {
        modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
        reply: `Saved na po ang dates, guest count at fixed ${merged.slot_preference === "night" ? "Night (gabi)" : "Day Tour (umaga)"} slot. Booking page po ang magse-set ng exact check-in/check-out hours based on accommodation at magche-check ng availability. Hindi pa confirmed ang booking.`,
        context: merged,
      };
    }

    return {
      modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
      reply: `Na-save ko ang booking details mo: check-in ${merged.check_in} at ${formatTime(merged.check_in_time)}, check-out ${merged.check_out} at ${formatTime(merged.check_out_time)}, at ${merged.guests} guest(s). Hindi makakapag-check ng live room availability ang offline mode ngayon, pero pwede kang pumunta sa Rooms page at manual na pumili ng best room.`,
      context: merged,
    };
  }

  return {
    modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
    reply: "Puwede pa rin po akong sumagot sa basic booking questions. Ano pong gusto ninyong malaman?",
    context: merged,
  };
}

function extractOfflineDetails(message) {
  const result = {
    check_in: null,
    check_in_time: null,
    check_out: null,
    check_out_time: null,
    guests: null,
    slot_preference: null,
    payment_method: null,
    language_style: null,
  };

  const text = String(message || "");

  // Accept only explicit preset slot words, never free-form check-in hours.
  if (/\b(?:day\s*tour|morning|umaga)\b/i.test(text)) result.slot_preference = "day_tour";
  if (/\b(?:night|overnight|evening|gabi)\b/i.test(text)) result.slot_preference = "night";

  const guestMatch = text.match(/(\d+)\s*(guest|guests|bisita)/i);
  if (guestMatch) {
    result.guests = Number(guestMatch[1]);
  }

  if (/paypal|online payment|pay online/i.test(text)) {
    result.payment_method = "paypal";
  } else if (/cash|cash on arrival/i.test(text)) {
    result.payment_method = "cash";
  }

  const isoDates = text.match(/\b\d{4}-\d{2}-\d{2}\b/g);
  if (isoDates && isoDates.length >= 1) {
    result.check_in = isoDates[0];
  }
  if (isoDates && isoDates.length >= 2) {
    result.check_out = isoDates[1];
  }

  const timeMatches = text.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/g);
  if (timeMatches && timeMatches.length >= 1) {
    result.check_in_time = normalizeTimeForContext(timeMatches[0]);
  }
  if (timeMatches && timeMatches.length >= 2) {
    result.check_out_time = normalizeTimeForContext(timeMatches[1]);
  }

  return result;
}

function appendTypingIndicator() {
  const messages = document.getElementById("aiChatMessages");
  if (!messages) return;

  removeTypingIndicator();

  const wrapper = document.createElement("div");
  wrapper.className = "ai-message assistant";
  wrapper.id = "aiTypingIndicator";

  const bubble = document.createElement("div");
  bubble.className = "ai-bubble";
  bubble.textContent = "Typing...";

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("aiTypingIndicator");
  if (indicator) indicator.remove();
}

// UI-30: Keep the maximize/restore control accessible on phones and iPads.
function syncChatSizeButton(chatWindow, maximizeBtn) {
  const expanded = chatWindow.classList.contains("maximized");
  maximizeBtn.textContent = expanded ? "❐" : "▢";
  maximizeBtn.title = expanded ? "Restore size" : "Maximize";
  maximizeBtn.setAttribute("aria-label",
    expanded ? "Restore compact chat size" : "Maximize chat");
  maximizeBtn.setAttribute("aria-pressed", String(expanded));
}

function toggleMaximize() {
  const chatWindow = document.getElementById("aiChatWindow");
  const maximizeBtn = document.getElementById("aiChatMaximize");
  if (!chatWindow || !maximizeBtn) return;

  chatWindow.classList.toggle("maximized");
  const isMaximized = chatWindow.classList.contains("maximized");
  syncChatSizeButton(chatWindow, maximizeBtn);
  if (!AI_IS_PUBLIC_LANDING) {
    sessionStorage.setItem(AI_WINDOW_STATE_KEY, isMaximized ? "maximized" : "normal");
  }
}

function restoreWindowState() {
  const chatWindow = document.getElementById("aiChatWindow");
  const maximizeBtn = document.getElementById("aiChatMaximize");
  if (!chatWindow || !maximizeBtn) return;

  const savedState = AI_IS_PUBLIC_LANDING ? "normal" : sessionStorage.getItem(AI_WINDOW_STATE_KEY);
  chatWindow.classList.toggle("maximized", savedState === "maximized");
  syncChatSizeButton(chatWindow, maximizeBtn);
}

function speakText(text) {
  if (window.ArvicVoice?.readAloud) {
    window.ArvicVoice.readAloud(text);
    return;
  }
  if (!("speechSynthesis" in window)) {
    appendAiSystemNote("Text-to-speech is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(String(text || ""));
  utterance.lang = "en-PH";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}

function formatAiReply(text) {
  let safe = escapeHtml(String(text || ""));
  safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  safe = safe.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Only linkify this verified resort contact URL; never turn arbitrary
  // AI-generated text/HTML into unsafe links. Open a new tab securely.
  const officialUrl = escapeHtml(OFFICIAL_RESORT_FACEBOOK_URL);
  safe = safe.split(officialUrl).join(
    '<a href="' + officialUrl + '" target="_blank" rel="noopener noreferrer">' +
    'Message resort on Facebook</a>'
  );

  // Linkify ONLY the exact verified phone numbers. The HTML was escaped
  // above, and tel: destinations contain only trusted digits from Home.
  for (const [display, phoneDigits] of [
    [OFFICIAL_RESORT_PHONE_PRIMARY, "09569125625"],
    [OFFICIAL_RESORT_PHONE_ALTERNATIVE, "09678170662"],
  ]) {
    safe = safe.split(display).join(
      '<a href="tel:' + phoneDigits + '">' + display + '</a>'
    );
  }

  const lines = safe.split("\n");
  let html = "";
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += "<div style='height:8px'></div>";
      continue;
    }

    if (/^(\d+)\.\s+/.test(line) || /^[-•]\s+/.test(line)) {
      if (!inList) {
        html += "<ul style='margin:8px 0 8px 18px; padding:0;'>";
        inList = true;
      }
      const itemText = line.replace(/^(\d+)\.\s+/, "").replace(/^[-•]\s+/, "");
      html += `<li style="margin-bottom:6px;">${itemText}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<div style="margin-bottom:8px; line-height:1.65;">${line}</div>`;
    }
  }

  if (inList) html += "</ul>";
  return html;
}

function formatMoney(value) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTime(timeValue) {
  if (!timeValue) return "N/A";

  const timeText = String(timeValue).trim();
  if (!timeText) return "N/A";

  const parts = timeText.split(":");
  if (parts.length < 2) return timeText;

  let hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) return timeText;

  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${suffix}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}