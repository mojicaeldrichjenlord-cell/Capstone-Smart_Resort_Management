const AI_API_BASE = "http://127.0.0.1:5000/api";
const AI_CONTEXT_KEY = "smartresort_ai_context_v1";
const AI_WINDOW_STATE_KEY = "smartresort_ai_window_state_v1";
const AI_CHAT_HISTORY_KEY = "smartresort_ai_chat_history_v1";

let aiRecognition = null;
let aiIsListening = false;
let aiShouldKeepListening = false;
let aiFinalTranscript = "";
let aiStoppedManually = false;  
let aiSendAfterStop = false;

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
  setupSpeechRecognition();

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

  if (micBtn) {
    micBtn.addEventListener("click", () => {
      toggleVoiceInput();
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

function setupSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    const micBtn = document.getElementById("aiMicBtn");
    if (micBtn) {
      micBtn.disabled = true;
      micBtn.textContent = "🚫";
      micBtn.title = "Mic not supported";
    }
    return;
  }

  aiRecognition = new SpeechRecognition();
  aiRecognition.lang = "en-PH";
  aiRecognition.continuous = true;
  aiRecognition.interimResults = true;

  aiRecognition.onstart = () => {
    aiIsListening = true;
    updateMicButton();
  };

  aiRecognition.onend = () => {
    aiIsListening = false;
    updateMicButton();

    if (aiShouldKeepListening) {
      setTimeout(() => {
        try {
          aiRecognition.start();
        } catch (error) {
          console.error("Speech recognition restart error:", error);
        }
      }, 150);
      return;
    }

    aiStoppedManually = false;
    aiSendAfterStop = false;
  };

  aiRecognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);

    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      aiShouldKeepListening = false;
      aiIsListening = false;
      aiStoppedManually = false;
      aiSendAfterStop = false;
      updateMicButton();
      appendAiSystemNote("Microphone permission was denied.");
    }
  };

  aiRecognition.onresult = (event) => {
    let interimTranscript = "";
    let finalChunk = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalChunk += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalChunk) {
      aiFinalTranscript += finalChunk;
    }

    const input = document.getElementById("aiChatInput");
    if (input) {
      input.value = `${aiFinalTranscript}${interimTranscript}`.trim();
    }
  };
}

function toggleVoiceInput() {
  if (!aiRecognition) {
    appendAiSystemNote("Voice input is not supported in this browser.");
    return;
  }

  if (aiShouldKeepListening) {
    stopVoiceInput(false);
  } else {
    startVoiceInput();
  }
}

function startVoiceInput() {
  aiFinalTranscript = "";
  aiShouldKeepListening = true;
  aiStoppedManually = false;
  aiSendAfterStop = false;

  try {
    aiRecognition.start();
  } catch (error) {
    console.error("startVoiceInput error:", error);
  }
}

function stopVoiceInput(autoSend = false) {
  aiShouldKeepListening = false;
  aiStoppedManually = true;
  aiSendAfterStop = autoSend;

  try {
    aiRecognition.stop();
  } catch (error) {
    console.error("stopVoiceInput error:", error);
  }

  aiIsListening = false;
  updateMicButton();
}

function updateMicButton() {
  const micBtn = document.getElementById("aiMicBtn");
  if (!micBtn) return;

  const active = aiShouldKeepListening || aiIsListening;
  micBtn.textContent = active ? "⏹" : "🎤";
  micBtn.classList.toggle("active-voice-btn", active);
  micBtn.title = active ? "Stop voice input" : "Voice input";
}

async function sendAiMessage() {
  const input = document.getElementById("aiChatInput");
  const sendBtn = document.getElementById("aiSendBtn");

  if (!input || !sendBtn) return;

  const message = input.value.trim();
  if (!message) return;

  appendAiMessage("user", message);
  input.value = "";
  aiFinalTranscript = "";

  const storedContext = getStoredAiContext();
  const pageContext = getAiPageContext();

  const payload = {
    message,
    ...pageContext,
    context: storedContext,
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
      throw new Error(data.message || "Failed to get AI response.");
    }

    if (data.extracted_context) {
      const merged = mergeContext(getStoredAiContext(), data.extracted_context);
      saveAiContext(merged);

      const summary = summarizeContext(merged);
      if (summary) {
        appendAiSystemNote(`Saved details: ${summary}`);
      }
    }

    appendAiMessage("assistant", data.reply || "No reply generated.");

    if (Array.isArray(data.alternative_dates) && data.alternative_dates.length > 0) {
      const altText = data.alternative_dates
        .map((item, index) => `${index + 1}. ${item.check_in} to ${item.check_out}`)
        .join("\n");
      appendAiSystemNote(`Alternative dates found:\n${altText}`);
    }

    if (data.booking_preview) {
      appendBookingPreviewCard(data.booking_preview);
    }
  } catch (error) {
    console.error("AI chat error:", error);
    removeTypingIndicator();

    const fallback = getOfflineFallbackReply(message, storedContext, pageContext);
    const mergedFallbackContext = mergeContext(storedContext, fallback.context || {});
    saveAiContext(mergedFallbackContext);

    appendAiSystemNote(fallback.modeNotice);

    const summary = summarizeContext(mergedFallbackContext);
    if (summary) {
      appendAiSystemNote(`Saved details: ${summary}`);
    }

    appendAiMessage("assistant", fallback.reply);
  } finally {
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
  speakBtn.addEventListener("click", () => speakText(getCurrentBubbleText(wrapper, originalText)));

  const translateTagalogBtn = document.createElement("button");
  translateTagalogBtn.type = "button";
  translateTagalogBtn.textContent = "Translate to Tagalog";
  translateTagalogBtn.style.cssText =
    "border:none;background:#e2e8f0;color:#0f172a;padding:6px 10px;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;";

  const translateTaglishBtn = document.createElement("button");
  translateTaglishBtn.type = "button";
  translateTaglishBtn.textContent = "Translate to Taglish";
  translateTaglishBtn.style.cssText =
    "border:none;background:#e2e8f0;color:#0f172a;padding:6px 10px;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;";

  let currentMode = "original";
  const bubble = wrapper.querySelector(".ai-bubble");

  translateTagalogBtn.addEventListener("click", async () => {
    if (!bubble) return;

    if (currentMode === "tagalog") {
      bubble.innerHTML = formatAiReply(originalText);
      bubble.dataset.currentText = originalText;
      currentMode = "original";
      translateTagalogBtn.textContent = "Translate to Tagalog";
      translateTaglishBtn.textContent = "Translate to Taglish";
      return;
    }

    translateTagalogBtn.disabled = true;
    translateTaglishBtn.disabled = true;
    translateTagalogBtn.textContent = "Translating...";

    try {
      const response = await fetch(`${AI_API_BASE}/ai/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: originalText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Translation failed.");
      }

      const translatedText = data.translated_text || originalText;
      bubble.innerHTML = formatAiReply(translatedText);
      bubble.dataset.currentText = translatedText;
      currentMode = "tagalog";
      translateTagalogBtn.textContent = "Show Original";
      translateTaglishBtn.textContent = "Translate to Taglish";
    } catch (error) {
      console.error("Tagalog translate error:", error);
      appendAiSystemNote("Tagalog translation is unavailable right now.");
      translateTagalogBtn.textContent = "Translate to Tagalog";
    } finally {
      translateTagalogBtn.disabled = false;
      translateTaglishBtn.disabled = false;
    }
  });

  translateTaglishBtn.addEventListener("click", async () => {
    if (!bubble) return;

    if (currentMode === "taglish") {
      bubble.innerHTML = formatAiReply(originalText);
      bubble.dataset.currentText = originalText;
      currentMode = "original";
      translateTaglishBtn.textContent = "Translate to Taglish";
      translateTagalogBtn.textContent = "Translate to Tagalog";
      return;
    }

    translateTagalogBtn.disabled = true;
    translateTaglishBtn.disabled = true;
    translateTaglishBtn.textContent = "Translating...";

    try {
      const response = await fetch(`${AI_API_BASE}/ai/translate-taglish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: originalText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Translation failed.");
      }

      const translatedText = data.translated_text || originalText;
      bubble.innerHTML = formatAiReply(translatedText);
      bubble.dataset.currentText = translatedText;
      currentMode = "taglish";
      translateTaglishBtn.textContent = "Show Original";
      translateTagalogBtn.textContent = "Translate to Tagalog";
    } catch (error) {
      console.error("Taglish translate error:", error);
      appendAiSystemNote("Taglish translation is unavailable right now.");
      translateTaglishBtn.textContent = "Translate to Taglish";
    } finally {
      translateTagalogBtn.disabled = false;
      translateTaglishBtn.disabled = false;
    }
  });

  actions.appendChild(speakBtn);
  actions.appendChild(translateTagalogBtn);
  actions.appendChild(translateTaglishBtn);
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
  const paymentLabel = preview.payment_method === "paypal" ? "PayPal / Online Payment" : "Cash on Arrival";
  const paymentStatusLabel = preview.payment_status === "pending" ? "Pending online payment" : "Unpaid";

  bubble.innerHTML = `
    <div style="font-weight:800;margin-bottom:10px;font-size:1.05rem;">Booking Preview</div>
    <div style="margin-bottom:12px;">
      <img
        src="${imagePath}"
        alt="${escapeHtml(preview.room_name)}"
        style="width:100%;height:150px;object-fit:cover;border-radius:10px;border:1px solid #cbd5e1;display:block;"
        onerror="this.src='images/no-image.jpg'"
      />
    </div>
    <div style="font-size:0.94rem;line-height:1.7;">
      <div><strong>Room:</strong> ${escapeHtml(preview.room_name)}</div>
      <div><strong>Check-in Date:</strong> ${escapeHtml(preview.check_in)}</div>
      <div><strong>Check-in Time:</strong> ${escapeHtml(formatTime(preview.check_in_time))}</div>
      <div><strong>Check-out Date:</strong> ${escapeHtml(preview.check_out)}</div>
      <div><strong>Check-out Time:</strong> ${escapeHtml(formatTime(preview.check_out_time))}</div>
      <div><strong>Guests:</strong> ${preview.guests}</div>
      <div><strong>Nights:</strong> ${preview.nights}</div>
      <div><strong>Payment:</strong> ${escapeHtml(paymentLabel)}</div>
      <div><strong>Status:</strong> ${escapeHtml(paymentStatusLabel)}</div>
      <div><strong>Price/Night:</strong> ₱${formatMoney(preview.price_per_night)}</div>
      <div><strong>Estimated Total:</strong> ₱${formatMoney(preview.estimated_total)}</div>
    </div>
    <button
      type="button"
      class="ai-confirm-booking-btn"
      style="margin-top:12px;width:100%;border:none;background:#14b8a6;color:white;padding:11px 12px;border-radius:10px;font-weight:700;cursor:pointer;"
    >
      Confirm Booking
    </button>
  `;

  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;

  const confirmBtn = bubble.querySelector(".ai-confirm-booking-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => createBookingFromPreview(preview, confirmBtn));
  }

  if (save) {
    addToChatHistory({
      type: "preview",
      preview,
    });
  }
}

async function createBookingFromPreview(preview, button) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  try {
    button.disabled = true;
    button.textContent = "Creating booking...";

    const response = await fetch(`${AI_API_BASE}/ai/create-booking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        room_id: preview.room_id,
        check_in: preview.check_in,
        check_in_time: preview.check_in_time,
        check_out: preview.check_out,
        check_out_time: preview.check_out_time,
        guests: preview.guests,
        payment_method: preview.payment_method || "cash",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create booking.");
    }

    appendAiSystemNote("Booking created successfully. Redirecting to your receipt...");
    localStorage.removeItem(AI_CONTEXT_KEY);
    localStorage.removeItem(AI_CHAT_HISTORY_KEY);

    setTimeout(() => {
      window.location.href = `booking-receipt.html?id=${data.bookingId}`;
    }, 1000);
  } catch (error) {
    console.error("createBookingFromPreview error:", error);
    appendAiMessage("assistant", `Sorry, booking failed: ${error.message}`);
    button.disabled = false;
    button.textContent = "Confirm Booking";
  }
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

function getEnglishFallbackReply(text, merged) {
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
      reply: "To book a room, open the Rooms page, choose a room, enter your check-in date, check-in time, check-out date, check-out time, number of guests, and payment method, then confirm the booking. After that, you can view the receipt in My Bookings.",
      context: merged,
    };
  }

  if (text.includes("payment") || text.includes("paypal") || text.includes("cash")) {
    return {
      modeNotice: "AI is temporarily unavailable. Offline assistant mode is active.",
      reply: "Available payment methods are Cash on Arrival and PayPal. If you choose PayPal, the booking can be saved with pending online payment status until it is confirmed.",
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
      reply: "Para mag-book ng room, buksan ang Rooms page, pumili ng room, ilagay ang check-in date, check-in time, check-out date, check-out time, bilang ng bisita, at payment method, pagkatapos ay i-confirm ang booking. Pagkatapos noon, makikita mo ang receipt sa My Bookings.",
      context: merged,
    };
  }

  if (text.includes("bayad") || text.includes("payment") || text.includes("paypal") || text.includes("cash")) {
    return {
      modeNotice: "Pansamantalang hindi available ang AI. Naka-offline assistant mode muna.",
      reply: "Ang available na payment methods ay Cash on Arrival at PayPal. Kapag PayPal ang pinili mo, puwedeng ma-save ang booking bilang pending online payment habang hindi pa nakukumpirma.",
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
      reply: "Para mag-book ng room, open mo ang Rooms page, pumili ng room, ilagay ang check-in date, check-in time, check-out date, check-out time, number of guests, at payment method, then confirm the booking. After that, makikita mo ang receipt sa My Bookings.",
      context: merged,
    };
  }

  if (text.includes("payment") || text.includes("bayad") || text.includes("paypal") || text.includes("cash")) {
    return {
      modeNotice: "Temporarily unavailable ang AI. Naka-offline assistant mode muna tayo.",
      reply: "Available na payment methods ay Cash on Arrival at PayPal. Kapag PayPal ang pinili mo, puwedeng ma-save ang booking as pending online payment habang hindi pa confirmed.",
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