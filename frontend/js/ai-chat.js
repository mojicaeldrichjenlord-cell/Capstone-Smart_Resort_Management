// Match the resort API selector: local development uses localhost, Vercel uses Render.
const AI_API_BASE = typeof API_BASE === "string" ? API_BASE
  : (["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://127.0.0.1:5000/api"
    : "https://smartresort-backend.onrender.com/api");
const AI_CONTEXT_KEY = "smartresort_ai_context_v1";
const AI_WINDOW_STATE_KEY = "smartresort_ai_window_state_v1";
const AI_CHAT_HISTORY_KEY = "smartresort_ai_chat_history_v1";
// Verified official Facebook page from the Customer Home page (refund support).
const OFFICIAL_RESORT_FACEBOOK_URL = "https://www.facebook.com/share/1E1kZLtrV4/?mibextid=wwXIfr";
// Keep these contact numbers consistent with the Customer Home contact card.
const OFFICIAL_RESORT_PHONE_PRIMARY = "0956-912-5625";
const OFFICIAL_RESORT_PHONE_ALTERNATIVE = "0967-817-0662";

let aiMessageInFlight = false;

document.addEventListener("DOMContentLoaded", () => {
  setupAiChat();
});

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
  const message = input.value.trim();
  if (!message) return null;

  // Manual messages must not race with an active voice conversation.
  if (options.source !== "voice" && window.ArvicVoice?.isLiveActive?.()) {
    window.ArvicVoice.stopConversation();
  }

  aiMessageInFlight = true;
  appendAiMessage("user", message);
  input.value = "";

  const storedContext = getStoredAiContext();
  const pageContext = getAiPageContext();

  const payload = {
    message,
    ...pageContext,
    context: storedContext,
    // Voice sessions use a fixed selected language; typed chat stays adaptive.
    ...(options.source === "voice"
      ? { voice_language: window.ArvicVoice?.getLanguage?.() || "english" }
      : {}),
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

    removeTypingIndicator();

    const data = await response.json();

    if (!response.ok) {
      const requestError = new Error(data.message || "Failed to get AI response.");
      requestError.status = response.status;
      requestError.code = data.code || null;
      throw requestError;
    }

    if (data.extracted_context) {
      const merged = mergeContext(getStoredAiContext(), data.extracted_context);
      saveAiContext(merged);

      const summary = summarizeContext(merged);
      if (summary) {
        appendAiSystemNote(`Saved details: ${summary}`);
      }
    }

    const aiReply = data.reply || "No reply generated.";
    appendAiMessage("assistant", aiReply);

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
    console.warn("AI chat request failed:", error.code || error.message);
    removeTypingIndicator();

    if (["GEMINI_BUSY", "GEMINI_RATE_LIMIT", "AI_LOCAL_BUDGET", "AI_RATE_LIMIT"].includes(error.code)) {
      // Upstream demand/quota issues do not mean a room is unavailable.
      // Keep booking context unchanged, and do not invent rates.
      const voiceLanguage = options.source === "voice"
        ? window.ArvicVoice?.getLanguage?.()
        : null;
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

    appendAiSystemNote(fallback.modeNotice);

    const summary = summarizeContext(mergedFallbackContext);
    if (summary) {
      appendAiSystemNote(`Saved details: ${summary}`);
    }

    // In Live Voice mode, preserve the selected spoken language even when
    // Gemini is offline. Never make unverified availability promises.
    const voiceFallbacks = {
      english: "Sorry, the AI service is temporarily unavailable. Please try again or continue using the booking page.",
      taglish: "Pasensya na po, temporarily unavailable ang AI service. Puwede po kayong mag-try ulit o magpatuloy sa booking page.",
      spanish: "Lo siento, el servicio de inteligencia artificial no está disponible temporalmente. Puede intentarlo de nuevo o continuar en la página de reservas.",
      mandarin: "抱歉，人工智能服务暂时无法使用。您可以稍后再试，或前往预订页面继续操作。",
    };
    const voiceLanguage = options.source === "voice"
      ? window.ArvicVoice?.getLanguage?.()
      : null;
    const safeReply = voiceFallbacks[voiceLanguage] || fallback.reply;
    appendAiMessage("assistant", safeReply);
    return safeReply;
  } finally {
    aiMessageInFlight = false;
    sendBtn.disabled = false;
    sendBtn.textContent = "Send";
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
  try {
    const raw = localStorage.getItem(AI_CONTEXT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveAiContext(context) {
  localStorage.setItem(AI_CONTEXT_KEY, JSON.stringify(context || {}));
}

function getStoredChatHistory() {
  try {
    const raw = localStorage.getItem(AI_CHAT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveChatHistory(history) {
  localStorage.setItem(AI_CHAT_HISTORY_KEY, JSON.stringify(history || []));
}

function addToChatHistory(entry) {
  const history = getStoredChatHistory();
  history.push(entry);
  saveChatHistory(history);
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
      "Hi! I’m your SmartResort assistant. This is a fresh new chat. You can ask about rooms, booking dates, check-in/check-out time, guests, or payment method.",
      false
    );

    const savedContext = getStoredAiContext();
    const summary = summarizeContext(savedContext);

    if (summary) {
      appendAiSystemNote(`Saved details from this chat: ${summary}`, false);
    }

    return;
  }

  history.forEach((item) => {
    if (item.type === "message") {
      appendAiMessage(item.role, item.text, false);
    } else if (item.type === "system") {
      appendAiSystemNote(item.text, false);
    } else if (item.type === "preview") {
      appendBookingPreviewCard(item.preview, false);
    }
  });

  messages.scrollTop = messages.scrollHeight;
}

function clearAiConversation() {
  localStorage.removeItem(AI_CHAT_HISTORY_KEY);
  localStorage.removeItem(AI_CONTEXT_KEY);

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
    check_in: newContext.check_in ?? oldContext.check_in ?? null,
    check_in_time: newContext.check_in_time ?? oldContext.check_in_time ?? null,
    check_out: newContext.check_out ?? oldContext.check_out ?? null,
    check_out_time: newContext.check_out_time ?? oldContext.check_out_time ?? null,
    guests: newContext.guests ?? oldContext.guests ?? null,
    bed_count: newContext.bed_count ?? oldContext.bed_count ?? null,
    view_type: newContext.view_type ?? oldContext.view_type ?? null,
    aircon_type: newContext.aircon_type ?? oldContext.aircon_type ?? null,
    bed_type: newContext.bed_type ?? oldContext.bed_type ?? null,
    max_price: newContext.max_price ?? oldContext.max_price ?? null,
    room_name: newContext.room_name ?? oldContext.room_name ?? null,
    room_id: newContext.room_id ?? oldContext.room_id ?? null,
    intent: newContext.intent ?? oldContext.intent ?? null,
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

function appendReplyActions(wrapper, originalText) {
  const actions = document.createElement("div");
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
  actions.appendChild(translateEnglishBtn);
  actions.appendChild(translateTagalogBtn);
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
      Continue to Booking
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

function createBookingFromPreview(preview, button) {
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
  window.location.href =
    frontendPrefix + "/customerHTML/booking.html?room_id=" +
    encodeURIComponent(String(accommodationId));
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

  if (detectedLanguage === "tagalog") {
    return getTagalogFallbackReply(text, merged);
  }

  if (detectedLanguage === "taglish") {
    return getTaglishFallbackReply(text, merged);
  }

  return getEnglishFallbackReply(text, merged);
}

// Stage 85-D: Offline guidance mirrors the verified PayPal-only customer online flow.
// It must not claim that cash checkout or an automatic booking is available.
function getEnglishFallbackReply(text, merged) {
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
  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    return {
      modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
      reply: "Hello! I can still help in offline mode. You can ask about booking steps, payment methods, your bookings page, or tell me your dates, time, and number of guests.",
      context: merged,
    };
  }

  if (text.includes("how to book") || text.includes("book room") || text.includes("booking process")) {
    return {
      modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
      reply: "To book online, open the Rooms page and choose an accommodation. Enter your check-in and check-out dates and times and the number of guests, then review the secure booking and PayPal payment steps. Online reservations require a 50% accommodation downpayment through PayPal; entrance fees are settled onsite. You can view the reservation and receipt in My Bookings.",
      context: merged,
    };
  }

  if (text.includes("payment") || text.includes("paypal") || text.includes("cash")) {
    return {
      modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
      reply: "Customer online reservations use PayPal for the required 50% accommodation downpayment; the remaining accommodation balance and entrance fees are paid onsite. Cash and other onsite payment methods apply to eligible staff-assisted manual reservations, not customer online checkout. Please verify the final amount on the secure booking page.",
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

  if (merged.check_in || merged.check_out || merged.guests || merged.check_in_time || merged.check_out_time) {
    const missing = [];
    if (!merged.check_in) missing.push("check-in date");
    if (!merged.check_in_time) missing.push("check-in time");
    if (!merged.check_out) missing.push("check-out date");
    if (!merged.check_out_time) missing.push("check-out time");
    if (!merged.guests) missing.push("number of guests");

    if (missing.length) {
      return {
        modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
        reply: `I saved part of your booking details. I still need your ${missing.join(", ")}. After that, you can continue on the Rooms page or Booking page.`,
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
    reply: "AI is temporarily unavailable, but I can still help with offline guidance. You can ask about booking steps, payment methods, receipts, My Bookings, or tell me your dates, time, and number of guests.",
    context: merged,
  };
}

function getTagalogFallbackReply(text, merged) {
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
  if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("kumusta")) {
    return {
      modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
      reply: "Hello! Makakatulong pa rin ako sa offline mode. Maaari kang magtanong tungkol sa booking steps, payment methods, My Bookings page, o ibigay ang iyong dates, oras, at bilang ng bisita.",
      context: merged,
    };
  }

  if (text.includes("paano mag book") || text.includes("paano mag-book") || text.includes("booking process") || text.includes("mag book")) {
    return {
      modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
      reply: "Para po mag-book online, buksan ang Rooms page at pumili ng accommodation. Ilagay ang check-in at check-out dates, oras, at bilang ng bisita, saka sundin ang secure booking at PayPal payment steps. Ang downpayment ay 50% ng accommodation price; hiwalay ang entrance fee na babayaran onsite. Makikita po ang booking at receipt sa My Bookings.",
      context: merged,
    };
  }

  if (text.includes("bayad") || text.includes("payment") || text.includes("paypal") || text.includes("cash")) {
    return {
      modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
      reply: "Para po sa customer online booking, PayPal ang ginagamit para sa 50% accommodation downpayment. Ang natitirang accommodation balance at entrance fee ay babayaran onsite. Ang cash at ibang onsite payment methods ay para sa eligible manual reservations na inaasikaso ng staff, hindi sa online checkout. I-check po ang final amount sa secure booking page.",
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

  if (merged.check_in || merged.check_out || merged.guests || merged.check_in_time || merged.check_out_time) {
    const missing = [];
    if (!merged.check_in) missing.push("check-in date");
    if (!merged.check_in_time) missing.push("check-in time");
    if (!merged.check_out) missing.push("check-out date");
    if (!merged.check_out_time) missing.push("check-out time");
    if (!merged.guests) missing.push("bilang ng bisita");

    if (missing.length) {
      return {
        modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
        reply: `Na-save ko ang ilang booking details mo. Kailangan ko pa ang ${missing.join(", ")}. Pagkatapos noon, maaari kang magpatuloy sa Rooms page o Booking page.`,
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
    reply: "Pansamantalang hindi available ang AI, pero makakatulong pa rin ako gamit ang offline guidance. Maaari kang magtanong tungkol sa booking steps, payment methods, resibo, My Bookings, o sabihin ang iyong dates, oras, at bilang ng bisita.",
    context: merged,
  };
}

function getTaglishFallbackReply(text, merged) {
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
  if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("kumusta")) {
    return {
      modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
      reply: "Hello! Makakatulong pa rin ako sa offline mode. Pwede kang magtanong tungkol sa booking steps, payment methods, My Bookings page, o ibigay ang dates, time, at number of guests mo.",
      context: merged,
    };
  }

  if (text.includes("how to book") || text.includes("paano mag book") || text.includes("paano mag-book") || text.includes("booking process")) {
    return {
      modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
      reply: "Para po mag-book online, open ang Rooms page, select an accommodation, then ilagay ang check-in/check-out dates, times, at number of guests. Review the secure booking and PayPal payment steps; required ang 50% accommodation downpayment via PayPal, at separate ang onsite entrance fee. Makikita po ang booking at receipt sa My Bookings.",
      context: merged,
    };
  }

  if (text.includes("payment") || text.includes("bayad") || text.includes("paypal") || text.includes("cash")) {
    return {
      modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
      reply: "For customer online reservations po, PayPal ang payment method para sa 50% accommodation downpayment. Onsite naman ang remaining accommodation balance at entrance fee. Cash at other onsite payment methods are for eligible staff-assisted manual reservations, hindi sa online checkout. Confirm the final amount po sa secure booking page.",
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

  if (merged.check_in || merged.check_out || merged.guests || merged.check_in_time || merged.check_out_time) {
    const missing = [];
    if (!merged.check_in) missing.push("check-in date");
    if (!merged.check_in_time) missing.push("check-in time");
    if (!merged.check_out) missing.push("check-out date");
    if (!merged.check_out_time) missing.push("check-out time");
    if (!merged.guests) missing.push("number of guests");

    if (missing.length) {
      return {
        modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
        reply: `Na-save ko na ang part ng booking details mo. Kailangan ko pa ang ${missing.join(", ")}. After that, pwede ka nang magpatuloy sa Rooms page or Booking page.`,
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
    reply: "Temporarily unavailable ang AI, pero makakatulong pa rin ako gamit ang offline guidance. Pwede kang magtanong tungkol sa booking steps, payment methods, receipt, My Bookings, o sabihin ang dates, time, at number of guests mo.",
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
    payment_method: null,
    language_style: null,
  };

  const text = String(message || "");

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

function toggleMaximize() {
  const chatWindow = document.getElementById("aiChatWindow");
  const maximizeBtn = document.getElementById("aiChatMaximize");
  if (!chatWindow || !maximizeBtn) return;

  chatWindow.classList.toggle("maximized");
  const isMaximized = chatWindow.classList.contains("maximized");
  maximizeBtn.textContent = isMaximized ? "❐" : "▢";
  localStorage.setItem(AI_WINDOW_STATE_KEY, isMaximized ? "maximized" : "normal");
}

function restoreWindowState() {
  const chatWindow = document.getElementById("aiChatWindow");
  const maximizeBtn = document.getElementById("aiChatMaximize");
  if (!chatWindow || !maximizeBtn) return;

  const savedState = localStorage.getItem(AI_WINDOW_STATE_KEY);
  if (savedState === "maximized") {
    chatWindow.classList.add("maximized");
    maximizeBtn.textContent = "❐";
  } else {
    maximizeBtn.textContent = "▢";
  }
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