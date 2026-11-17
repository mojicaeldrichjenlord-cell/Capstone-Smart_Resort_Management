// Arvic AI Voice Assistant: optional Azure Blessica for Taglish plus browser fallback.
// Voice Message: transcribe -> review/edit -> press Send.
// Live Conversation: listen -> existing Gemini chat -> speak -> listen again.
// Accurate voice input records short WAV clips for signed Gemini transcription;
// Fast voice input uses browser SpeechRecognition when available.
// Cloud input is explicit in the UI, is not stored by this application, and
// remains separate from optional Azure Blessica speech output.
(() => {
  "use strict";

  const LOCALES = Object.freeze({
    english: { stt: "en-PH", tts: "en-US", label: "English" },
    taglish: { stt: "fil-PH", tts: "fil-PH", label: "Taglish" },
    spanish: { stt: "es-ES", tts: "es-ES", label: "Español" },
    mandarin: { stt: "zh-CN", tts: "zh-CN", label: "中文 (Mandarin)" },
  });
  const KEY = "smartresort_ai_voice_language_v1";
  const INPUT_MODE_KEY = "arvic_ai_voice_input_mode_v1";
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  // Web Speech can be denied by Safari even when the iPhone mic is allowed.
  const isIOS = /iPhone|iPad|iPod/i.test(window.navigator?.userAgent || "") ||
    (/Macintosh/i.test(window.navigator?.userAgent || "") &&
     Number(window.navigator?.maxTouchPoints) > 1);
  let preferRecording = isIOS || !SpeechRecognitionAPI;
  let recording = null;
  let recordingGeneration = 0;
  let transcriptionController = null;
  const canRecord = () => Boolean(window.navigator?.mediaDevices?.getUserMedia &&
    (window.AudioContext || window.webkitAudioContext));
  const canSpeak = () => Boolean(SpeechRecognitionAPI || canRecord());
  const state = {
    language: "english",
    inputMode: "fast",
    inputModeExplicit: false,
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

  // Show which browser voice was really selected so mobile QA can distinguish
  // an unavailable enhanced voice from a playback bug. No audio is uploaded.
  function reportBrowserVoice(voice) {
    if (!controls?.info) return;
    if (!voice) {
      controls.info.textContent =
        "Voice output: browser default (no selectable voice reported by this device).";
      return;
    }
    const name = String(voice.name || "Unnamed voice");
    const lang = String(voice.lang || "unknown language");
    const limited = /compact|low.quality|e?speak/i.test(
      name + " " + String(voice.voiceURI || "")
    );
    controls.info.textContent = "Voice output: " + name + " (" + lang + ")" +
      (limited ? " — basic/compact voice; an Enhanced voice may sound better." : ".");
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
    controls.mic.disabled = state.live || !canSpeak();
    controls.live.textContent = state.live ? "End Conversation" : "Start Conversation";
    controls.live.setAttribute("aria-pressed", state.live ? "true" : "false");
    controls.live.disabled = !canSpeak();
    controls.live.classList.toggle("active", state.live);
    controls.interrupt.hidden = !(state.live && state.mode === "live-speaking");
    controls.lang.disabled = state.mode === "dictation" || state.mode === "dictation-transcribing";
    // Avoid changing transcription providers in the middle of recording.
    if (controls.inputMode) {
      controls.inputMode.disabled = state.live || listening || state.mode === "dictation-transcribing";
      controls.inputMode.value = state.inputMode;
    }
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
    const uri = String(voice.voiceURI || "").toLowerCase();
    const lang = String(voice.lang || "").toLowerCase();
    const target = getLocale().tts.toLowerCase();
    let score = lang === target ? 25 : 0;
    // Taglish must prefer a Filipino voice over even a polished English one.
    if (state.language === "taglish" && /^(fil|tl)(-|$)/.test(lang)) score += 180;
    // Mobile Safari often exposes compact and enhanced versions of a voice.
    // Prefer higher-quality local voices without requiring a paid API.
    if (/natural|neural|enhanced|premium|siri/.test(name)) score += 95;
    else if (/samantha|ava|allison|serena|aria|jenny/.test(name)) score += 45;
    if (/google|microsoft/.test(name)) score += 8;
    if (/compact|low.quality|e?speak/.test(name + " " + uri)) score -= 180;
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
      // Keep Google US English as the familiar fallback, but do not force it
      // over a clearly higher-quality Enhanced/Neural voice on mobile or desktop.
      const googleVoice = voices.find(v =>
        /^google us english(?:\b|$)/i.test(String(v.name || "")));
      const bestVoice = voices[0];
      chosen = googleVoice && bestVoice &&
        qualityScore(bestVoice) <= qualityScore(googleVoice) + 30
        ? googleVoice : bestVoice;
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
    return chosen;
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
      if (controls?.info) controls.info.textContent =
        "Voice output: Microsoft Blessica Neural (cloud audio).";
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
      const chosenVoice = selectSpeechVoice(utterance);
      reportBrowserVoice(chosenVoice);
      utterance.rate = isIOS ? 1 : 0.98;
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


  // WAV avoids Safari's MP4 and Chrome's WebM format differences. Only a
  // maximum 12-second mono clip is sent, authenticated, to Gemini via Render.
  function makeWav(parts, sourceRate) {
    const length = parts.reduce((n, p) => n + p.length, 0);
    const combined = new Float32Array(length);
    let offset = 0;
    for (const part of parts) { combined.set(part, offset); offset += part.length; }
    const samples = Math.floor(length * 16000 / sourceRate);
    const data = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(data);
    function tag(i, text) {
      for (let c = 0; c < text.length; c++) view.setUint8(i + c, text.charCodeAt(c));
    }
    tag(0, "RIFF"); view.setUint32(4, 36 + samples * 2, true);
    tag(8, "WAVE"); tag(12, "fmt "); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, 16000, true); view.setUint32(28, 32000, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    tag(36, "data"); view.setUint32(40, samples * 2, true);
    for (let i = 0; i < samples; i++) {
      const at = i * sourceRate / 16000;
      const lo = Math.floor(at), mix = at - lo;
      const value = Math.max(-1, Math.min(1,
        (combined[lo] || 0) * (1 - mix) +
        (combined[Math.min(lo + 1, length - 1)] || 0) * mix));
      view.setInt16(44 + 2 * i, value < 0 ? value * 32768 : value * 32767, true);
    }
    return new Blob([data], { type: "audio/wav" });
  }

  function cancelRecordedInput() {
    recordingGeneration++;
    transcriptionController?.abort();
    transcriptionController = null;
    const active = recording;
    recording = null;
    if (!active) return;
    clearTimeout(active.timeout);
    active.processor.onaudioprocess = null;
    for (const node of [active.source, active.processor, active.gain]) {
      try { node.disconnect(); } catch (_) { /* track already stopped */ }
    }
    active.stream.getTracks().forEach(track => track.stop());
    active.context.close().catch(() => {});
  }

  function finishRecordedInput(send = true) {
    const active = recording;
    if (!active) {
      cancelRecordedInput();
      state.mode = "idle";
      updateControls();
      return;
    }
    const { kind, session, prefix, parts, context, count, heard } = active;
    // Never spend a Gemini transcription request on a silent mic,
    // including manual dictation stopped before any actual speech.
    const wav = send && count > 4000 && heard
      ? makeWav(parts, context.sampleRate) : null;
    cancelRecordedInput();
    if (!wav) {
      if (kind === "live") stopConversation("No speech detected. Try Start Conversation again.");
      else { state.mode = "idle"; updateControls(); status("No speech detected. Try again."); }
      return;
    }
    state.mode = kind === "live" ? "live-thinking" : "dictation-transcribing";
    updateControls();
    void transcribeRecording(wav, kind, session, prefix);
  }

  async function transcribeRecording(wav, kind, session, prefix) {
    const token = sessionStorage.getItem("customerToken");
    if (!token) {
      if (kind === "live") stopConversation("Please log in again to use voice.");
      else { state.mode = "idle"; updateControls(); status("Please log in again to use voice."); }
      return;
    }
    const controller = new AbortController();
    transcriptionController = controller;
    try {
      status("Transcribing voice securely…");
      const response = await fetch(voiceApiBase() + "/ai/transcribe", {
        method: "POST", headers: {
          "Content-Type": "audio/wav",
          "X-Arvic-Voice-Language": state.language,
          "Authorization": "Bearer " + token
        }, body: wav, signal: controller.signal
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.message || "Transcription failed");
      if (controller.signal.aborted || (kind === "live" && (!state.live || state.session !== session))) return;
      // This is already a model-transcribed audio result, not a browser
      // guess. Preserve it instead of rewriting specific words afterwards.
      const text = String(body.transcript || "").trim().slice(0, state.transcriptLimit);
      const input = document.getElementById("aiChatInput");
      if (!input) return;
      if (kind === "dictation") {
        input.value = [prefix, text].filter(Boolean).join(" ");
        state.mode = "idle"; updateControls();
        status(text ? "Transcript ready. Review/edit it, then press Send."
          : "No speech detected. Try again or type.");
      } else if (text) {
        input.value = text;
        state.mode = "live-thinking"; updateControls();
        status("Processing your question…");
        await handleVoiceTurn(session);
      } else {
        stopConversation("No speech detected. Tap Start Conversation again.");
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      if (kind === "live") stopConversation("Voice transcription unavailable. Please use text chat.");
      else { state.mode = "idle"; updateControls(); status("Voice transcription unavailable. Please use text chat."); }
      console.warn("Recorded voice transcription failed:", error.message);
    } finally {
      if (transcriptionController === controller) transcriptionController = null;
    }
  }

  async function startRecordedInput(kind) {
    if (!canRecord()) { status("Voice recording unsupported in this browser."); return false; }
    const generation = ++recordingGeneration, session = state.session;
    const prefix = kind === "dictation"
      ? String(document.getElementById("aiChatInput")?.value || "").trim() : "";
    state.mode = kind === "live" ? "live-listening" : "dictation";
    updateControls();
    status("Requesting microphone access…");
    let stream, context;
    try {
      stream = await window.navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true,
          channelCount: 1 }
      });
      if (generation !== recordingGeneration || (kind === "live" && (!state.live || state.session !== session))) {
        stream.getTracks().forEach(track => track.stop()); return false;
      }
      const Context = window.AudioContext || window.webkitAudioContext;
      context = new Context();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(2048, 1, 1);
      const gain = context.createGain();
      gain.gain.value = 0;
      source.connect(processor); processor.connect(gain); gain.connect(context.destination);
      const active = { kind, session, prefix, stream, context, source, processor,
        gain, parts: [], count: 0, heard: false, voiceFrames: 0,
        lastSpeech: 0, timeout: null };
      recording = active;
      processor.onaudioprocess = event => {
        if (recording !== active) return;
        const samples = new Float32Array(event.inputBuffer.getChannelData(0));
        active.parts.push(samples); active.count += samples.length;
        let energy = 0;
        for (let n = 0; n < samples.length; n++) energy += samples[n] * samples[n];
        const elapsed = active.count / context.sampleRate;
        if (Math.sqrt(energy / samples.length) > 0.012) {
          active.voiceFrames++;
          // Require sustained voice, not a single click or mic pop.
          if (active.voiceFrames >= 3) active.heard = true;
          active.lastSpeech = elapsed;
        }
        // Allow natural pauses in Taglish without cutting off the sentence.
        // Keep WAV under the backend's 500 KB audio limit (14 s at 16 kHz).
        if (elapsed >= 14 || (kind === "live" && active.heard &&
          elapsed - active.lastSpeech >= 1.6)) {
          finishRecordedInput(true);
        }
      };
      await context.resume();
      if (generation !== recordingGeneration || recording !== active) {
        stream.getTracks().forEach(track => track.stop()); return false;
      }
      active.timeout = setTimeout(() => {
        if (recording === active) finishRecordedInput(true);
      }, 14500);
      status(kind === "dictation"
        ? "Recording… Tap ■ to transcribe and review."
        : "Listening… Speak, then pause for the AI reply.");
      return true;
    } catch (error) {
      if (recording?.context === context) cancelRecordedInput();
      else { stream?.getTracks().forEach(track => track.stop()); context?.close().catch(() => {}); }
      if (kind === "live") stopConversation("Microphone access unavailable. Please check browser permission.");
      else { state.mode = "idle"; updateControls(); status("Microphone access unavailable. Check browser permission."); }
      console.warn("Recorded microphone unavailable:", error.name || "unknown");
      return false;
    }
  }

  function beginVoiceInput(kind) {
    // Accurate mode transcribes actual audio via the existing signed Gemini
    // endpoint. Fast mode retains browser STT without an extra Gemini request.
    if (canRecord() && (state.inputMode === "accurate" ||
        preferRecording || !SpeechRecognitionAPI)) {
      return startRecordedInput(kind);
    }
    if (state.inputMode === "accurate" && !canRecord()) {
      status("Accurate input unsupported on this device; using browser speech recognition.");
    }
    return beginRecognition(kind);
  }

  function setInputMode(mode) {
    if (!["accurate", "fast"].includes(mode)) return;
    if (state.live) stopConversation("Voice input mode changed. Start a new conversation.");
    if (state.mode === "dictation" || state.mode === "dictation-transcribing") {
      stopRecognition(true); cancelRecordedInput(); state.mode = "idle";
    }
    state.inputMode = mode;
    state.inputModeExplicit = true;
    try { localStorage.setItem(INPUT_MODE_KEY, mode); } catch (_) { /* private mode */ }
    if (controls?.inputMode) controls.inputMode.value = mode;
    updateControls();
    status(mode === "accurate"
      ? "Accurate voice input: short microphone clips are securely transcribed with Gemini. This uses Gemini credits."
      : "Fast voice input: browser speech recognition, no Gemini transcription call.");
  }

  function stopConversation(message = "Voice conversation ended.") {
    state.live = false;
    state.session++;
    state.mode = "idle";
    state.emptyTurns = 0;
    clearRestart();
    stopRecognition(true);
    cancelRecordedInput();
    cancelSpeech();
    updateControls();
    status(message);
  }

  function setLanguage(language) {
    if (!Object.hasOwn(LOCALES, language)) return;
    if (state.live) stopConversation("Voice language changed. Start a new conversation to continue.");
    if (state.mode === "dictation" || state.mode === "dictation-transcribing") {
      stopRecognition(true); cancelRecordedInput(); state.mode = "idle";
    }
    state.language = language;
    if (!state.inputModeExplicit) {
      // Mixed Filipino/English needs higher quality STT by default when audio
      // recording is available; other locales retain faster browser input.
      state.inputMode = language === "taglish" && canRecord() ? "accurate" : "fast";
    }
    try { localStorage.setItem(KEY, language); } catch (_) { /* private mode */ }
    if (controls?.lang) controls.lang.value = language;
    if (controls?.inputMode) controls.inputMode.value = state.inputMode;
    updateControls();
    status("Voice language: " + getLocale().label + ". Text chat can use other languages.");
  }

  function scheduleListen(session) {
    clearRestart();
    if (!state.live || state.session !== session) return;
    state.restartTimer = setTimeout(() => {
      state.restartTimer = null;
      if (state.live && state.session === session) beginVoiceInput("live");
    }, 800);
  }

  // Improve STT interpretation for resort terms without rewriting ordinary
  // speech. Web Speech still controls audio recognition; these corrections
  // apply ONLY to voice transcripts, never typed customer messages.
  function recentAccommodationVoiceContext() {
    try {
      if (typeof getAiRecentConversationTurns === "function") {
        const turns = getAiRecentConversationTurns("") || [];
        if (turns.slice(-6).some(turn =>
          turn?.role === "user" && /\b(?:room|rooms|kwarto|kuwarto|accommodation|resort|cottage|nipa|hut|shade|pool ?side|pavilion|pavillion)\b/i.test(String(turn.text || "")))) {
          return true;
        }
      }
      if (typeof getStoredAiContext === "function") {
        const context = getStoredAiContext() || {};
        return Boolean(context.room_id || context.room_name);
      }
    } catch (_) { /* Voice is still usable if conversation storage is blocked. */ }
    return false;
  }

  function normalizeArvicVoiceTranscript(raw, language = state.language) {
    let text = String(raw || "").replace(/\s+/g, " ").trim();
    // Never translate or "fix" foreign-language speech with Taglish rules.
    if (!text || !["taglish", "english"].includes(language)) return text;

    const resortTerms = /\b(?:room|rooms|kwarto|kuwarto|accommodation|resort|cottage|nipa|hut|shade|pool ?side|pavilion|pavillion|family|double)\b/i;
    const inAccommodationConversation =
      resortTerms.test(text) || recentAccommodationVoiceContext();
    const searchingForAccommodation =
      /\b(?:anong|ano|which|what|show|pakita|patingin|preview|picture|photo|list|options?|hanap)\b/i.test(text) ||
      /\bfull[ -]shades?\b.*\b(?:meron|available)\b/i.test(text);

    // Edge Taglish frequently hears "full shade" instead of "pool shade"
    // when customers are asking which resort accommodations exist.
    if (searchingForAccommodation && inAccommodationConversation) {
      text = text.replace(/\bfull[ -]shades?\b/gi, match =>
        /shades$/i.test(match) ? "pool shades" : "pool shade");
    }

    // "May premyo ka ba?" is ambiguous without context: it can mean a
    // genuine prize. Correct to "preview" ONLY in an accommodation discussion
    // with a preview-looking request and no promotion/contest terminology.
    const clearlyAboutPrize = /\b(?:raffle|contest|giveaway|winner|winning|panalo|paligsahan|claim|prize|promo(?:tion)?|discount)\b/i.test(text);
    const looksLikePreviewQuestion =
      /\b(?:may|meron|pwede|puwede|patingin|pakita|show|tingnan|picture|photos?|preview|send)\b/i.test(text);
    if (inAccommodationConversation && looksLikePreviewQuestion && !clearlyAboutPrize) {
      text = text.replace(/\bpre[ -]?myo\b/gi, "preview");
    }
    return text;
  }

  function chooseVoiceRecognitionAlternative(result) {
    const primary = String(result?.[0]?.transcript || "");
    if (!["taglish", "english"].includes(state.language) || !result || result.length < 2) return primary;
    const accommodationContext = recentAccommodationVoiceContext() ||
      /\b(?:room|cottage|shade|nipa|pavilion|resort|pool)\b/i.test(primary);
    const primaryConfidence = Number(result[0]?.confidence);
    for (let i = 1; i < Math.min(result.length, 3); i++) {
      const alternative = String(result[i]?.transcript || "");
      const confidence = Number(result[i]?.confidence);
      if (Number.isFinite(primaryConfidence) && primaryConfidence > 0 &&
          Number.isFinite(confidence) && confidence > 0 &&
          confidence < primaryConfidence - 0.15) continue;
      if (/\bpool[ -]shade\b/i.test(alternative) && /\bfull[ -]shade\b/i.test(primary)) {
        return alternative;
      }
      if (accommodationContext && /\bpreview\b/i.test(alternative) &&
          /\bpremyo\b/i.test(primary)) return alternative;
    }
    return primary;
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
    // Some browsers offer a better-scored "pool shade"/"preview" alternative.
    // Prefer it only when confidence is comparable and resort context fits.
    recognizer.maxAlternatives = 3;
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
        const transcript = chooseVoiceRecognitionAlternative(result);
        if (result.isFinal) final += transcript + " ";
        else pending += transcript;
      }
      if (final) state.finalText += final;
      const text = [state.draftPrefix, state.finalText.trim(), pending.trim()]
        .filter(Boolean).join(" ").slice(0, state.transcriptLimit);
      input.value = normalizeArvicVoiceTranscript(text);
      if (kind === "live") status("Heard: " + input.value.slice(0, 90));
    };
    recognizer.onerror = event => {
      if (state.recognizer !== recognizer) return;
      const reason = String(event?.error || "unknown");
      state.error = reason;
      if (["service-not-allowed", "language-not-supported", "network"].includes(reason) && canRecord()) {
        preferRecording = true;
        state.error = "fallback-recording";
        status("Browser speech blocked. Switching to secure audio recording…");
      } else if (reason !== "no-speech" && reason !== "aborted") {
        status("Voice recognition error (" + reason + "). Try text chat or another browser.");
      }
    };
    recognizer.onend = () => {
      if (state.recognizer !== recognizer) return;
      state.recognizer = null;
      const utterance = normalizeArvicVoiceTranscript(
        state.finalText.trim().slice(0, state.transcriptLimit)
      );
      const error = state.error;
      state.finalText = "";
      if (error === "fallback-recording") { void startRecordedInput(kind); return; }
      if (kind === "dictation") {
        input.value = [state.draftPrefix, utterance].filter(Boolean).join(" ");
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
    if (!canSpeak() || state.live) return;
    if (state.mode === "dictation") {
      status("Finishing transcription…");
      if (recording || (preferRecording && !state.recognizer)) finishRecordedInput(true);
      else try { state.recognizer?.stop(); } catch (_) { /* ending already */ }
      return;
    }
    if (state.mode === "dictation-transcribing") return;
    void beginVoiceInput("dictation");
  }

  function startConversation() {
    if (!canSpeak()) { status("Voice input unavailable. Use text chat."); return; }
    if (state.mode === "dictation" || state.mode === "dictation-transcribing") {
      stopRecognition(true); cancelRecordedInput(); state.mode = "idle";
    }
    cancelSpeech();
    state.live = true; state.session++; state.emptyTurns = 0;
    const input = document.getElementById("aiChatInput");
    if (input) input.value = "";
    updateControls();
    void beginVoiceInput("live");
  }

  function interruptConversation() {
    if (!state.live || state.mode !== "live-speaking") return;
    cancelSpeech(); // invalidates prior speech callbacks
    clearRestart();
    status("AI interrupted. Listening to you…");
    void beginVoiceInput("live");
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
      '<label for="aiVoiceInputMode">Voice input</label>',
      '<select id="aiVoiceInputMode" aria-label="Choose voice recognition mode">',
      '<option value="accurate">Accurate (Gemini)</option>',
      '<option value="fast">Fast (browser)</option>',
      '</select>',
      '</div>',
      '<div class="ai-voice-actions">',
      '<button id="aiVoiceInterrupt" type="button" hidden>Interrupt AI</button>',
      '</div>',
      '<p id="aiVoiceStatus" role="status" aria-live="polite">',
      '🎤 Dictate with the mic, or start hands-free conversation.</p>',
      '<p id="aiVoiceInfo" class="ai-voice-info" aria-live="polite">',
      'Voice output: waiting for device voices. Quality depends on installed voices.</p>',
    ].join("");
    messages.parentNode.insertBefore(panel, messages);

    controls = {
      panel,
      mic: microphone,
      lang: panel.querySelector("#aiVoiceLanguage"),
      inputMode: panel.querySelector("#aiVoiceInputMode"),
      live: panel.querySelector("#aiVoiceLive"),
      interrupt: panel.querySelector("#aiVoiceInterrupt"),
      status: panel.querySelector("#aiVoiceStatus"),
      info: panel.querySelector("#aiVoiceInfo"),
    };
    const saved = (() => {
      try { return localStorage.getItem(KEY); } catch (_) { return null; }
    })();
    state.language = Object.hasOwn(LOCALES, saved) ? saved : "english";
    const preferredMode = (() => {
      try { return localStorage.getItem(INPUT_MODE_KEY); } catch (_) { return null; }
    })();
    state.inputModeExplicit = preferredMode === "accurate" || preferredMode === "fast";
    state.inputMode = state.inputModeExplicit ? preferredMode
      : (state.language === "taglish" && canRecord() ? "accurate" : "fast");
    controls.lang.value = state.language;
    controls.inputMode.value = state.inputMode;
    // Safari/Android may populate voices lazily; warm the list before Read Aloud.
    // Still synthesize synchronously when the user taps to preserve iOS gestures.
    window.speechSynthesis?.getVoices?.();
    microphone.addEventListener("click", toggleDictation);
    controls.live.addEventListener("click", () => {
      if (state.live) stopConversation();
      else startConversation();
    });
    controls.interrupt.addEventListener("click", interruptConversation);
    controls.lang.addEventListener("change", () => setLanguage(controls.lang.value));
    controls.inputMode.addEventListener("change", () => setInputMode(controls.inputMode.value));

    document.getElementById("aiChatClose")?.addEventListener("click", () =>
      stopConversation("Voice controls stopped when the assistant closed."));
    document.getElementById("aiNewChatBtn")?.addEventListener("click", () =>
      stopConversation("Ready for a new conversation."));
    window.addEventListener("pagehide", () => {
      // Release microphone and speech when navigating away.
      stopConversation("");
    });

    if (!canSpeak()) {
      status("Voice input unavailable in this browser. Text chat still works.");
    } else {
      status("Voice language: " + getLocale().label +
        ". 🎤 = dictate and review; Start Conversation = talk hands-free. " +
        (state.inputMode === "accurate"
          ? "Accurate input uploads short microphone audio to Gemini for transcription and uses credits."
          : "Fast input uses browser recognition when available."));
    }
    updateControls();
  }

  window.ArvicVoice = Object.freeze({
    init, readAloud, stopConversation, isLiveActive: () => state.live,
    getLanguage: () => state.language,
    setLanguage, setInputMode,
    getState: () => ({ mode: state.mode, live: state.live, language: state.language,
      inputMode: state.inputMode, recordingFallback: preferRecording }),
  });
  document.addEventListener("DOMContentLoaded", init);
})();
