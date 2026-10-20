// Arvic AI Voice Assistant: optional Azure Blessica for Taglish plus browser fallback.
// Voice Message: transcribe -> review/edit -> press Send.
// Live Conversation: listen -> existing Gemini chat -> speak -> listen again.
// Microphone audio stays in browser speech recognition; Taglish text can be
// sent to the authenticated Azure-backed server for speech generation.
// When Azure is unavailable, regular browser speech remains functional.
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
  let voiceRequest = null;
  let playingAudio = null;
  let playingUrl = null;
  let cloudUnavailable = false;

  function voiceApiBase() {
    // Use the same local/Render API selection already used by the resort.
    return typeof API_BASE === "string"
      ? API_BASE
      : (typeof AI_API_BASE === "string" ? AI_API_BASE : "/api");
  }

  function releaseCloudPlayback() {
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.removeAttribute("src");
      playingAudio.load();
      playingAudio = null;
    }
    if (playingUrl) {
      URL.revokeObjectURL(playingUrl);
      playingUrl = null;
    }
  }

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
    // Interrupt BOTH browser TTS and Azure MP3/fetch without replaying
    // old responses or restarting the microphone after interruption.
    voiceRequest?.abort();
    voiceRequest = null;
    releaseCloudPlayback();
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
    // Filipino voices should outrank English voices when Taglish is chosen,
    // even if a polished English voice is also installed.
    if (state.language === "taglish" && /^(fil|tl)(-|$)/.test(lang)) score += 105;
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

  function selectSpeechVoice(utterance) {
    const voices = orderedVoices();
    let chosen = null;

    if (state.language === "english") {
      // User-approved English choice. Uses the named browser voice if available.
      chosen = voices.find(v =>
        /^google us english(?:\b|$)/i.test(String(v.name || "")));
    } else if (state.language === "taglish") {
      // User-approved Filipino/Taglish voice, available in Edge on some devices.
      chosen = voices.find(v =>
        /microsoft\s+blessica/i.test(String(v.name || "")) &&
        /natural|online/i.test(String(v.name || "")));
    }

    // Spanish and Mandarin retain the previous default auto-selection.
    // If a preferred voice is absent, use the best available same-language
    // voice; never claim a specific voice is installed on every device.
    chosen ||= voices[0];
    if (chosen) utterance.voice = chosen;
    utterance.lang = chosen?.lang || getLocale().tts;
  }

  async function playBlessicaCloud(content, serial, onFinish, useBrowser) {
    // This endpoint verifies the signed customer token and keeps the Azure key
    // exclusively on the backend. Do not send password/payment details.
    const token = sessionStorage.getItem("customerToken");
    if (!token || cloudUnavailable || content.length > 2000) return false;
    const controller = new AbortController();
    voiceRequest = controller;
    try {
      const response = await fetch(voiceApiBase() + "/ai/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ text: content }),
        signal: controller.signal
      });
      if (!response.ok) {
        // If Azure has not been configured, avoid repeating paid-voice
        // requests until the page is refreshed after backend setup.
        if ([401, 403, 503].includes(response.status)) cloudUnavailable = true;
        throw new Error("Blessica voice returned HTTP " + response.status);
      }
      const blob = await response.blob();
      if (serial !== state.speechSequence) return true;
      playingUrl = URL.createObjectURL(blob);
      const audio = new Audio();
      playingAudio = audio;
      audio.src = playingUrl;
      audio.onended = () => {
        if (serial !== state.speechSequence) return;
        releaseCloudPlayback();
        onFinish();
      };
      audio.onerror = () => {
        if (serial !== state.speechSequence) return;
        releaseCloudPlayback();
        status("Blessica playback failed; using browser voice.");
        useBrowser();
      };
      await audio.play();
      status("Speaking with Microsoft Blessica (Filipino).");
      return true;
    } catch (error) {
      if (controller.signal.aborted || serial !== state.speechSequence) return true;
      console.warn("Blessica cloud voice unavailable:", error.message);
      status("Blessica cloud voice unavailable; using browser voice.");
      return false;
    } finally {
      if (voiceRequest === controller) voiceRequest = null;
    }
  }

  function speakReply(text, onDone = null) {
    const content = String(text || "").trim();
    cancelSpeech();
    const serial = state.speechSequence;
    if (!content) {
      if (onDone) onDone();
      return;
    }
    let finished = false;
    const finish = () => {
      if (finished || serial !== state.speechSequence) return;
      finished = true;
      if (onDone) onDone();
    };
    const speakInBrowser = () => {
      if (serial !== state.speechSequence) return;
      if (!("speechSynthesis" in window) ||
          !("SpeechSynthesisUtterance" in window)) {
        finish();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(content);
      selectSpeechVoice(utterance);
      utterance.rate = 0.98;
      utterance.pitch = 1;
      utterance.onend = finish;
      utterance.onerror = finish;
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.warn("Browser TTS failed:", error.message);
        finish();
      }
    };

    if (state.language === "taglish") {
      // Cloud voice produces the SAME Filipina voice in Chrome and Edge.
      // Browser TTS is only the graceful fallback when Azure is not ready.
      playBlessicaCloud(content, serial, finish, speakInBrowser)
        .then(played => {
          if (!played && serial === state.speechSequence) speakInBrowser();
        })
        .catch(() => {
          if (serial === state.speechSequence) speakInBrowser();
        });
      return;
    }
    // English still prefers Google US English; Spanish/Mandarin unchanged.
    speakInBrowser();
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
