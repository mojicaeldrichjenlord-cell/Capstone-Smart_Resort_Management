const AI_API_BASE = "http://127.0.0.1:5000/api";
const AI_CONTEXT_KEY = "smartresort_ai_context_v1";
const AI_WINDOW_STATE_KEY = "smartresort_ai_window_state_v1";

let aiRecognition = null;
let aiIsListening = false;
let aiShouldKeepListening = false;
let aiFinalTranscript = "";

document.addEventListener("DOMContentLoaded", () => {
  setupAiChat();
});

function setupAiChat() {
  const toggleBtn = document.getElementById("aiChatToggle");
  const closeBtn = document.getElementById("aiChatClose");
  const maximizeBtn = document.getElementById("aiChatMaximize");
  const micBtn = document.getElementById("aiMicBtn");
  const chatWindow = document.getElementById("aiChatWindow");
  const sendBtn = document.getElementById("aiSendBtn");
  const input = document.getElementById("aiChatInput");
  const messages = document.getElementById("aiChatMessages");

  if (!toggleBtn || !chatWindow || !sendBtn || !input || !messages) return;

  restoreWindowState();
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
    appendAiMessage(
      "assistant",
      "Hi! I’m your SmartResort AI assistant. Tell me your travel dates, number of guests, preferences like pool view, aircon, bed count, and payment method."
    );

    const savedContext = getStoredAiContext();
    const summary = summarizeContext(savedContext);

    if (summary) {
      appendAiSystemNote(`Saved details from this chat: ${summary}`);
    }

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
    }
  };

  aiRecognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);

    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      aiShouldKeepListening = false;
      aiIsListening = false;
      updateMicButton();
      appendAiSystemNote("Microphone permission was denied.");
      return;
    }

    if (event.error === "aborted") {
      return;
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
    stopVoiceInput();
  } else {
    startVoiceInput();
  }
}

function startVoiceInput() {
  if (!aiRecognition) return;

  aiFinalTranscript = "";
  aiShouldKeepListening = true;

  try {
    aiRecognition.lang = "en-PH";
    aiRecognition.start();
  } catch (error) {
    console.error("startVoiceInput error:", error);
  }
}

function stopVoiceInput() {
  if (!aiRecognition) return;

  aiShouldKeepListening = false;

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
  micBtn.title = active ? "Stop mic" : "Voice input";
}

async function sendAiMessage() {
  const input = document.getElementById("aiChatInput");
  const messages = document.getElementById("aiChatMessages");
  const sendBtn = document.getElementById("aiSendBtn");

  if (!input || !messages || !sendBtn) return;

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
    appendAiMessage(
      "assistant",
      `Sorry, something went wrong: ${error.message || "Unable to contact the AI assistant."}`
    );
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send";
  }
}

function getAiPageContext() {
  const checkIn = document.getElementById("checkIn");
  const checkOut = document.getElementById("checkOut");
  const guests = document.getElementById("guests");

  const context = {};

  if (checkIn && checkIn.value) context.check_in = checkIn.value;
  if (checkOut && checkOut.value) context.check_out = checkOut.value;
  if (guests && guests.value) context.guests = Number(guests.value);

  return context;
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

function mergeContext(oldContext = {}, newContext = {}) {
  return {
    check_in: newContext.check_in ?? oldContext.check_in ?? null,
    check_out: newContext.check_out ?? oldContext.check_out ?? null,
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

  if (context.check_in && context.check_out) parts.push(`dates ${context.check_in} to ${context.check_out}`);
  if (context.guests) parts.push(`${context.guests} guest(s)`);
  if (context.bed_count) parts.push(`${context.bed_count}+ bed(s)`);
  if (context.view_type) parts.push(context.view_type);
  if (context.aircon_type) parts.push(context.aircon_type);
  if (context.bed_type) parts.push(context.bed_type);
  if (context.max_price) parts.push(`budget ₱${context.max_price}`);
  if (context.room_name) parts.push(`room ${context.room_name}`);
  if (context.payment_method) parts.push(`payment ${context.payment_method}`);

  return parts.join(", ");
}

function appendAiMessage(role, text) {
  const messages = document.getElementById("aiChatMessages");
  if (!messages) return;

  const wrapper = document.createElement("div");
  wrapper.className = `ai-message ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "ai-bubble";

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
  speakBtn.addEventListener("click", () => speakText(originalText));

  const translateBtn = document.createElement("button");
  translateBtn.type = "button";
  translateBtn.textContent = "Translate to Tagalog";
  translateBtn.style.cssText =
    "border:none;background:#e2e8f0;color:#0f172a;padding:6px 10px;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;";

  let translated = false;
  const bubble = wrapper.querySelector(".ai-bubble");

  translateBtn.addEventListener("click", () => {
    if (!bubble) return;

    if (!translated) {
      const translatedText = fallbackTranslateToTagalog(originalText);
      bubble.innerHTML = formatAiReply(translatedText);
      translateBtn.textContent = "Show Original";
      translated = true;
    } else {
      bubble.innerHTML = formatAiReply(originalText);
      translateBtn.textContent = "Translate to Tagalog";
      translated = false;
    }
  });

  actions.appendChild(speakBtn);
  actions.appendChild(translateBtn);
  wrapper.appendChild(actions);
}

function fallbackTranslateToTagalog(text) {
  let output = String(text || "");
  const replacements = [
    [/room/gi, "kuwarto"],
    [/rooms/gi, "mga kuwarto"],
    [/guest/gi, "bisita"],
    [/guests/gi, "mga bisita"],
    [/check-in/gi, "petsa ng pag-check-in"],
    [/check-out/gi, "petsa ng pag-check-out"],
    [/payment/gi, "bayad"],
    [/booking/gi, "booking"],
    [/price per night/gi, "presyo bawat gabi"],
    [/estimated total/gi, "tinatayang kabuuan"],
    [/cash on arrival/gi, "cash pagdating"],
    [/online payment/gi, "online payment"],
    [/pool view/gi, "tanawin ng pool"],
    [/aircon/gi, "aircon"],
    [/available/gi, "available"],
    [/Alternative dates/gi, "Mga alternatibong petsa"],
  ];

  replacements.forEach(([pattern, replacement]) => {
    output = output.replace(pattern, replacement);
  });

  return output;
}

function appendAiSystemNote(text) {
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
}

function appendBookingPreviewCard(preview) {
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
      <div><strong>Check-in:</strong> ${escapeHtml(preview.check_in)}</div>
      <div><strong>Check-out:</strong> ${escapeHtml(preview.check_out)}</div>
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
        check_out: preview.check_out,
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

  for (let rawLine of lines) {
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}