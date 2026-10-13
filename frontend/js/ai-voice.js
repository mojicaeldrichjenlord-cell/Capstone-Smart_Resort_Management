// Arvic AI Voice Assistant (free/browser-based Option A).
// Voice Message: transcribe -> review/edit -> press Send.
// Live Conversation: listen -> existing Gemini chat -> speak -> listen again.
// No raw audio is uploaded or stored. Microphone/voices depend on the browser.
(() => {
  "use strict";

  const LOCALES = Object.freeze({
    english: { stt: "en-PH", tts: "en-PH", label: "English" },
    taglish: { stt: "fil-PH", tts: "fil-PH", label: "Taglish" },
    spanish: { stt: "es-ES", tts: "es-ES", label: "Español" },
    mandarin: { stt: "zh-CN", tts: "zh-CN", label: "中文 (Mandarin)" },
  });
  const KEY = "smartresort_ai_voice_language_v1";
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const state = {
    language: "english",
    live: false,
    mode: "idle",
    recognizer: null,
    finalText: "",
    draftPrefix: "",
    error: "",
    emptyTurns: 0,
    session: 0,
    speechSequence: 0,
    restartTimer: null,
    transcriptLimit: 1800,
  };
  let controls = null;

  function getLocale() {
    return LOCALES[state.language] || LOCALES.english;
  }

  function status(message) {
    if (controls?.status) controls.status.textContent = message;
  }

  function clearRestart() {
    if (state.restartTimer !== null) {
      clearTimeout(state.restartTimer);
      state.restartTimer = null;
    }
  }

  function cancelSpeech() {
    state.speechSequence++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function stopRecognition(useAbort = true) {
    const active = state.recognizer;
    if (!active) return;
    // Old callbacks must not send messages after cancellation.
    state.recognizer = null;
    try {
      if (useAbort) active.abort();
      else active.stop();
    } catch (error) {
      console.warn("Stopping speech recognition:", error.message);
    }
  }

  function updateControls() {
    if (!controls) return;
    const listening = state.mode === "dictation" || state.mode === "live-listening";
    controls.mic.textContent = state.mode === "dictation" ? "■" : "🎤";
    controls.mic.title = state.mode === "dictation"
      ? "Stop recording and review transcript" : "Dictate a message, then review and send";
    controls.mic.setAttribute("aria-label", controls.mic.title);
    controls.mic.disabled = state.live || !SpeechRecognitionAPI;
    controls.live.textContent = state.live ? "End Conversation" : "Start Conversation";
    controls.live.setAttribute("aria-pressed", state.live ? "true" : "false");
    controls.live.disabled = !SpeechRecognitionAPI;
    controls.live.classList.toggle("active", state.live);
    controls.interrupt.hidden = !(state.live && state.mode === "live-speaking");
    controls.lang.disabled = state.mode === "dictation";
    controls.panel.classList.toggle("listening", listening);
  }

  function selectSpeechVoice(utterance) {
    const voices = window.speechSynthesis.getVoices?.() || [];
    const preferred = getLocale().tts.toLowerCase();
    const base = preferred.split("-")[0];
    const matching = voices.find(voice => voice.lang?.toLowerCase() === preferred)
      || voices.find(voice => voice.lang?.toLowerCase().startsWith(base + "-"));
    // Some platforms have no Filipino voice. English-PH is a fallback,
    // not a claim of fluent Taglish pronunciation.
    const fallback = state.language === "taglish"
      ? voices.find(voice => /^en-ph$/i.test(voice.lang || ""))
      : null;
    const selected = matching || fallback;
    if (selected) utterance.voice = selected;
    utterance.lang = selected?.lang || getLocale().tts;
  }

  function speakReply(text, onDone = null) {
    const content = String(text || "").trim();
    cancelSpeech();
    const serial = state.speechSequence;
    if (!content || !("speechSynthesis" in window) ||
        !("SpeechSynthesisUtterance" in window)) {
      if (onDone) onDone();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(content);
    selectSpeechVoice(utterance);
    utterance.rate = 1;
    utterance.pitch = 1;
    let finished = false;
    const finish = () => {
      if (finished || serial !== state.speechSequence) return;
      finished = true;
      if (onDone) onDone();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn("Speech synthesis failed:", error.message);
      finish();
    }
  }

  function stopConversation(message = "Voice conversation ended.") {
    state.live = false;
    state.session++;
    state.mode = "idle";
    state.emptyTurns = 0;
    clearRestart();
    stopRecognition(true);
    cancelSpeech();
    updateControls();
    status(message);
  }

  function setLanguage(language) {
    if (!Object.hasOwn(LOCALES, language)) return;
    if (state.live) stopConversation("Voice language changed. Start a new conversation to continue.");
    if (state.mode === "dictation") {
      stopRecognition(true);
      state.mode = "idle";
    }
    state.language = language;
    try { localStorage.setItem(KEY, language); } catch (_) { /* private mode */ }
    if (controls?.lang) controls.lang.value = language;
    updateControls();
    status("Voice language: " + getLocale().label + ". Text chat can use other languages.");
  }

  function scheduleListen(session) {
    clearRestart();
    if (!state.live || state.session !== session) return;
    state.restartTimer = setTimeout(() => {
      state.restartTimer = null;
      if (state.live && state.session === session) beginRecognition("live");
    }, 800);
  }

  function beginRecognition(kind) {
    if (!SpeechRecognitionAPI || state.recognizer) return false;
    if (kind === "live" && !state.live) return false;

    const input = document.getElementById("aiChatInput");
    if (!input) return false;
    const recognizer = new SpeechRecognitionAPI();
    const session = state.session;
    state.recognizer = recognizer;
    state.error = "";
    state.finalText = "";
    state.draftPrefix = kind === "dictation" ? input.value.trim() : "";
    state.mode = kind === "dictation" ? "dictation" : "live-listening";
    recognizer.lang = getLocale().stt;
    recognizer.continuous = kind === "dictation";
    recognizer.interimResults = true;
    recognizer.maxAlternatives = 1;
    recognizer.onstart = () => {
      if (state.recognizer !== recognizer) return;
      status(kind === "dictation"
        ? "Recording speech as text. Press ■ to review and send."
        : "Listening in " + getLocale().label + "…");
      updateControls();
    };
    recognizer.onresult = event => {
      if (state.recognizer !== recognizer) return;
      let pending = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = String(result?.[0]?.transcript || "");
        if (result.isFinal) final += transcript + " ";
        else pending += transcript;
      }
      if (final) state.finalText += final;
      const text = [state.draftPrefix, state.finalText.trim(), pending.trim()]
        .filter(Boolean).join(" ").slice(0, state.transcriptLimit);
      input.value = text;
      if (kind === "live") status("Heard: " + text.slice(0, 90));
    };
    recognizer.onerror = event => {
      if (state.recognizer !== recognizer) return;
      const reason = String(event?.error || "unknown");
      state.error = reason;
      if (reason !== "no-speech" && reason !== "aborted") {
        status("Voice recognition error (" + reason + "). Try text chat or another browser.");
      }
    };
    recognizer.onend = () => {
      if (state.recognizer !== recognizer) return;
      state.recognizer = null;
      const utterance = state.finalText.trim().slice(0, state.transcriptLimit);
      const error = state.error;
      state.finalText = "";
      if (kind === "dictation") {
        state.mode = "idle";
        updateControls();
        status(utterance
          ? "Transcript ready. Review/edit it, then press Send."
          : "No speech captured. Try again or type your message.");
        return;
      }
      if (!state.live || session !== state.session) return;
      if (error && !["no-speech", "aborted"].includes(error)) {
        stopConversation("Microphone error: " + error + ". Continue with text chat.");
        return;
      }
      if (utterance) {
        state.emptyTurns = 0;
        input.value = utterance;
        state.mode = "live-thinking";
        updateControls();
        status("Processing your question...");
        handleVoiceTurn(session);
      } else {
        state.emptyTurns++;
        if (state.emptyTurns >= 3) {
          stopConversation("No voice detected after several attempts. Tap Start Conversation again.");
        } else {
          status("Waiting for speech…");
          scheduleListen(session);
        }
      }
    };

    try {
      recognizer.start();
      updateControls();
      return true;
    } catch (error) {
      state.recognizer = null;
      state.mode = "idle";
      updateControls();
      status("Could not start microphone: " + error.message);
      if (kind === "live") stopConversation("Could not start voice recognition.");
      return false;
    }
  }

  async function handleVoiceTurn(session) {
    // sendAiMessage is the EXISTING guarded Gemini chat/fallback pipeline.
    let responseText = "";
    try {
      responseText = await sendAiMessage({ source: "voice" });
    } catch (error) {
      console.error("AI voice response error:", error);
    }
    if (!state.live || state.session !== session) return;
    if (!responseText) {
      stopConversation("No reply was available. Continue with text chat.");
      return;
    }
    state.mode = "live-speaking";
    updateControls();
    status("AI is speaking. Use Interrupt to ask another question.");
    speakReply(responseText, () => {
      if (!state.live || state.session !== session) return;
      state.mode = "live-listening";
      updateControls();
      status("AI finished. Listening for your next question…");
      scheduleListen(session);
    });
  }

  function toggleDictation() {
    if (!SpeechRecognitionAPI || state.live) return;
    if (state.mode === "dictation") {
      // Let final recognition results arrive before showing transcript.
      try { state.recognizer?.stop(); } catch (_) { /* ending already */ }
      status("Finishing transcription…");
      return;
    }
    beginRecognition("dictation");
  }

  function startConversation() {
    if (!SpeechRecognitionAPI) {
      status("Speech recognition is not supported. Use a compatible browser or text chat.");
      return;
    }
    if (state.mode === "dictation") {
      stopRecognition(true);
      state.mode = "idle";
    }
    cancelSpeech();
    state.live = true;
    state.session++;
    state.emptyTurns = 0;
    const input = document.getElementById("aiChatInput");
    if (input) input.value = "";
    updateControls();
    beginRecognition("live");
  }

  function interruptConversation() {
    if (!state.live || state.mode !== "live-speaking") return;
    cancelSpeech(); // invalidates prior speech callbacks
    clearRestart();
    status("AI interrupted. Listening to you…");
    beginRecognition("live");
  }

  function readAloud(text) {
    if (state.live) stopConversation("Voice conversation stopped to play this reply.");
    status("Reading response in " + getLocale().label + "…");
    speakReply(text, () => status("Finished reading aloud."));
  }

  function init() {
    const messages = document.getElementById("aiChatMessages");
    const microphone = document.getElementById("aiMicBtn");
    if (!messages || !microphone || document.getElementById("aiVoicePanel")) return;

    const panel = document.createElement("section");
    panel.className = "ai-voice-panel";
    panel.id = "aiVoicePanel";
    panel.setAttribute("aria-label", "AI voice assistance");
    panel.innerHTML = [
      '<div class="ai-voice-actions">',
      '<label for="aiVoiceLanguage">Voice language</label>',
      '<select id="aiVoiceLanguage" aria-label="Choose a voice language">',
      '<option value="english">English</option>',
      '<option value="taglish">Taglish / Filipino</option>',
      '<option value="spanish">Español</option>',
      '<option value="mandarin">中文 Mandarin</option>',
      '</select>',
      '<button id="aiVoiceLive" type="button" aria-pressed="false">Start Conversation</button>',
      '<button id="aiVoiceInterrupt" type="button" hidden>Interrupt AI</button>',
      '</div>',
      '<p id="aiVoiceStatus" role="status" aria-live="polite">',
      '🎤 Dictate with the mic, or start hands-free conversation.</p>',
    ].join("");
    messages.parentNode.insertBefore(panel, messages);

    controls = {
      panel,
      mic: microphone,
      lang: panel.querySelector("#aiVoiceLanguage"),
      live: panel.querySelector("#aiVoiceLive"),
      interrupt: panel.querySelector("#aiVoiceInterrupt"),
      status: panel.querySelector("#aiVoiceStatus"),
    };
    const saved = (() => {
      try { return localStorage.getItem(KEY); } catch (_) { return null; }
    })();
    state.language = Object.hasOwn(LOCALES, saved) ? saved : "english";
    controls.lang.value = state.language;
    microphone.addEventListener("click", toggleDictation);
    controls.live.addEventListener("click", () => {
      if (state.live) stopConversation();
      else startConversation();
    });
    controls.interrupt.addEventListener("click", interruptConversation);
    controls.lang.addEventListener("change", () => setLanguage(controls.lang.value));

    document.getElementById("aiChatClose")?.addEventListener("click", () =>
      stopConversation("Voice controls stopped when the assistant closed."));
    document.getElementById("aiNewChatBtn")?.addEventListener("click", () =>
      stopConversation("Ready for a new conversation."));
    window.addEventListener("pagehide", () => {
      // Release microphone and speech when navigating away.
      stopConversation("");
    });

    if (!SpeechRecognitionAPI) {
      status("Voice input is unavailable in this browser. Text chat still works.");
    } else {
      status("Voice language: " + getLocale().label +
        ". 🎤 = dictate and review; Start Conversation = talk hands-free.");
    }
    updateControls();
  }

  window.ArvicVoice = Object.freeze({
    init, readAloud, stopConversation, isLiveActive: () => state.live,
    getLanguage: () => state.language,
    setLanguage,
    getState: () => ({ mode: state.mode, live: state.live, language: state.language }),
  });
  document.addEventListener("DOMContentLoaded", init);
})();
