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
  const VOICE_KEY_PREFIX = "smartresort_ai_voice_choice_v1_";
  // Speech synthesis voices vary by browser, operating system and device.
  // Named "natural"/"neural" voices are preferred only when exposed to Web Speech.
  const PREVIEW_TEXT = Object.freeze({
    english: "Hello! Welcome to Arvic Seaside. How can I help you today?",
    taglish: "Hello po! Welcome sa Arvic Seaside. Paano ko po kayo matutulungan?",
    spanish: "¡Hola! Bienvenido a Arvic Seaside. ¿En qué puedo ayudarte?",
    mandarin: "您好！欢迎来到 Arvic Seaside。请问有什么可以帮您？",
  });
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
    voiceChoice: "auto",
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
    if (controls.voice) controls.voice.disabled = state.live || state.mode === "dictation";
    if (controls.preview) controls.preview.disabled = state.live || state.mode === "dictation";
    controls.panel.classList.toggle("listening", listening);
  }

  function languageVoiceCandidates() {
    if (!("speechSynthesis" in window)) return [];
    const voices = window.speechSynthesis.getVoices?.() || [];
    return voices.filter(voice => {
      const lang = String(voice.lang || "").toLowerCase();
      if (state.language === "taglish") return /^(fil|tl|en)(-|$)/.test(lang);
      const base = getLocale().tts.split("-")[0].toLowerCase();
      return lang === base || lang.startsWith(base + "-");
    });
  }

  function qualityScore(voice) {
    const name = String(voice.name || "").toLowerCase();
    const lang = String(voice.lang || "").toLowerCase();
    const target = getLocale().tts.toLowerCase();
    let score = lang === target ? 18 : 0;
    if (state.language === "taglish" && /^(fil|tl)(-|$)/.test(lang)) score += 24;
    if (/natural|neural/.test(name)) score += 85;
    else if (/enhanced|premium/.test(name)) score += 35;
    if (/google|microsoft/.test(name)) score += 8;
    // Keep cloud voices available as a user choice, not a guarantee
    // of free or offline service.
    return score;
  }

  function orderedVoices() {
    return languageVoiceCandidates().sort((a, b) =>
      qualityScore(b) - qualityScore(a) ||
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  }

  function populateVoiceChoices() {
    if (!controls?.voice) return;
    const voiceSelect = controls.voice;
    const savedChoice = (() => {
      try { return localStorage.getItem(VOICE_KEY_PREFIX + state.language); }
      catch (_) { return null; }
    })();
    state.voiceChoice = savedChoice || "auto";
    // Voice names are inserted using textContent, never HTML interpolation.
    voiceSelect.innerHTML = '<option value="auto">Auto (best available)</option>';
    const voices = orderedVoices();
    for (const voice of voices) {
      const option = document.createElement("option");
      option.value = String(voice.voiceURI || voice.name);
      option.textContent = voice.name + " (" + voice.lang + ")" +
        (qualityScore(voice) >= 85 ? " · Natural/Neural" : "");
      voiceSelect.appendChild(option);
    }
    const match = voices.some(voice =>
      String(voice.voiceURI || voice.name) === state.voiceChoice);
    if (!match) state.voiceChoice = "auto";
    voiceSelect.value = state.voiceChoice;
    if (controls.voiceInfo) {
      controls.voiceInfo.textContent = voices.length
        ? voices.length + " available voice(s). Quality depends on your browser and device."
        : "No matching voice installed yet. Browser default will be used.";
    }
  }

  function selectSpeechVoice(utterance) {
    const voices = orderedVoices();
    const chosen = state.voiceChoice === "auto"
      ? voices[0]
      : voices.find(voice =>
          String(voice.voiceURI || voice.name) === state.voiceChoice);
    if (chosen) utterance.voice = chosen;
    utterance.lang = chosen?.lang || getLocale().tts;
  }

  function changeVoice(choice) {
    const voices = orderedVoices();
    if (choice !== "auto" &&
        !voices.some(voice => String(voice.voiceURI || voice.name) === choice)) {
      return;
    }
    if (state.live) stopConversation("Voice changed. Start Conversation again.");
    state.voiceChoice = choice;
    try { localStorage.setItem(VOICE_KEY_PREFIX + state.language, choice); }
    catch (_) { /* storage may be blocked */ }
    if (controls?.voice) controls.voice.value = choice;
    status("Voice selected. Press Preview Voice to listen.");
  }

  function previewVoice() {
    if (state.live || state.mode === "dictation") return;
    status("Playing voice preview…");
    speakReply(PREVIEW_TEXT[state.language] || PREVIEW_TEXT.english,
      () => status("Preview finished. You can try another voice."));
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
    // Subtle pacing change. A neural-capable voice matters more than pitch tweaks.
    utterance.rate = 0.98;
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
    populateVoiceChoices();
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
      // Set the pending state BEFORE stop(). Some speech recognizers
      // synchronously fire onend during stop(), while others do so later.
      // The onend handler owns the final "Review/edit" status in both cases.
      status("Finishing transcription…");
      try { state.recognizer?.stop(); } catch (_) { /* ending already */ }
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
      '</div>',
      '<div class="ai-voice-selection">',
      '<label for="aiVoiceChoice">AI voice</label>',
      '<select id="aiVoiceChoice" aria-label="Choose a voice style">',
      '<option value="auto">Auto (best available)</option>',
      '</select>',
      '<button id="aiVoicePreview" type="button">Preview Voice</button>',
      '</div>',
      '<p id="aiVoiceInfo" class="ai-voice-info">Checking installed voices…</p>',
      '<div class="ai-voice-actions">',
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
      voice: panel.querySelector("#aiVoiceChoice"),
      preview: panel.querySelector("#aiVoicePreview"),
      voiceInfo: panel.querySelector("#aiVoiceInfo"),
      live: panel.querySelector("#aiVoiceLive"),
      interrupt: panel.querySelector("#aiVoiceInterrupt"),
      status: panel.querySelector("#aiVoiceStatus"),
    };
    const saved = (() => {
      try { return localStorage.getItem(KEY); } catch (_) { return null; }
    })();
    state.language = Object.hasOwn(LOCALES, saved) ? saved : "english";
    controls.lang.value = state.language;
    populateVoiceChoices();
    // Chrome and Edge may populate system voices after DOMContentLoaded.
    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener?.("voiceschanged", populateVoiceChoices);
    }
    controls.voice.addEventListener("change", () => changeVoice(controls.voice.value));
    controls.preview.addEventListener("click", previewVoice);
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
    setLanguage, changeVoice,
    getVoiceChoices: () => orderedVoices().map(v => ({ name: v.name, lang: v.lang, uri: v.voiceURI })),

    getState: () => ({ mode: state.mode, live: state.live, language: state.language }),
  });
  document.addEventListener("DOMContentLoaded", init);
})();
