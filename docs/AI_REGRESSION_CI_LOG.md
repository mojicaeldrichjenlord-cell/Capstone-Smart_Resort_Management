# AI Mock Regression — testing branch

Source commit: e90bd60a784861bba726adc1027aee148f539854
Exit code: 1

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-81 reports retain both paid-charge figures in one card, not the three removed cards
    ok 1 - UI-81 reports retain both paid-charge figures in one card, not the three removed cards
      ---
      duration_ms: 1.150226
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.404159
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 35.20625
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 1.075683
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.340384
      type: 'test'
      ...
    # Subtest: AI-44 customer voice has no manual language selector or persisted language setting
    not ok 6 - AI-44 customer voice has no manual language selector or persisted language setting
      ---
      duration_ms: 6.826459
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-auto-multilingual-ui44.test.js:16:1'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /if \(canRecord\(\)\) \{\s*return startRecordedInput\(kind\);/. Input:
        
        '// Arvic AI Voice Assistant: optional Azure Blessica for Taglish plus browser fallback.\n' +
          '// Voice Message: transcribe -> review/edit -> press Send.\n' +
          '// Live Conversation: listen -> existing Gemini chat -> speak -> listen again.\n' +
          '// Gemini-first mic input records short WAV clips for signed transcription.\n' +
          '// Browser SpeechRecognition is a fallback ONLY when recording is unsupported.\n' +
          '// No mode dropdown; voice controls remain visible and clarify credit usage.\n' +
          '// Optional Azure Blessica output remains a separate existing feature.\n' +
          '(() => {\n' +
          '  "use strict";\n' +
          '\n' +
          '  const LOCALES = Object.freeze({\n' +
          '    english: { stt: "en-PH", tts: "en-US", label: "English" },\n' +
          '    taglish: { stt: "fil-PH", tts: "fil-PH", label: "Taglish" },\n' +
          '    spanish: { stt: "es-ES", tts: "es-ES", label: "Español" },\n' +
          '    mandarin: { stt: "zh-CN", tts: "zh-CN", label: "中文 (Mandarin)" },\n' +
          '    japanese: { stt: "ja-JP", tts: "ja-JP", label: "日本語" },\n' +
          '    korean: { stt: "ko-KR", tts: "ko-KR", label: "한국어" },\n' +
          '    french: { stt: "fr-FR", tts: "fr-FR", label: "Français" },\n' +
          '    german: { stt: "de-DE", tts: "de-DE", label: "Deutsch" },\n' +
          '    arabic: { stt: "ar-SA", tts: "ar-SA", label: "العربية" },\n' +
          '  });\n' +
          '  // DM-08: Consistent, vector-based Speech-to-Text and Stop icons.\n' +
          '  // Presentational only: dictation/live transcription state remains unchanged.\n' +
          '  const MIC_ICON_SVG = [\n' +
          `    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"',\n` +
          `    ' stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"',\n` +
          `    ' aria-hidden="true" focusable="false">',\n` +
          `    '<rect x="9" y="2.5" width="6" height="12" rx="3"/>',\n` +
          `    '<path d="M5 10.5v1.5a7 7 0 0 0 14 0v-1.5M12 19v3M8 22h8"/>',\n` +
          "    '</svg>'\n" +
          '  ].join("");\n' +
          '  const STOP_ICON_SVG = [\n' +
          `    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"',\n` +
          `    ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"',\n` +
          `    ' aria-hidden="true" focusable="false">',\n` +
          `    '<rect x="6" y="6" width="12" height="12" rx="2"/>',\n` +
          "    '</svg>'\n" +
          '  ].join("");\n' +
          '\n' +
          '  // UI-44: No persistent voice-language picker. Each turn is auto-detected.\n' +
          '  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;\n' +
          '  // Web Speech can be denied by Safari even when the iPhone mic is allowed.\n' +
          '  const isIOS = /iPhone|iPad|iPod/i.test(window.navigator?.userAgent || "") ||\n' +
          '    (/Macintosh/i.test(window.navigator?.userAgent || "") &&\n' +
          '     Number(window.navigator?.maxTouchPoints) > 1);\n' +
          '  let preferRecording = isIOS || !SpeechRecognitionAPI;\n' +
          '  let useBrowserFallback = false;\n' +
          '  let recordingTried = false;\n' +
          '  let browserTried = false;\n' +
          '  let playbackTimer = null;\n' +
          '  let replayText = "";\n' +
          '  let recording = null;\n' +
          '  let recordingGeneration = 0;\n' +
          '  let transcriptionController = null;\n' +
          '  const canRecord = () => Boolean(window.isSecureContext !== false && window.navigator?.mediaDevices?.getUserMedia &&\n' +
          '    (window.AudioContext || window.webkitAudioContext));\n' +
          '  const canSpeak = () => Boolean(SpeechRecognitionAPI || canRecord());\n' +
          '  const state = {\n' +
          '    language: "english", // last detected language, for reply playback only\n' +
          '    inputMode: "accurate", // Gemini-first for all supported languages/devices.\n' +
          '    live: false,\n' +
          '    mode: "idle",\n' +
          '    recognizer: null,\n' +
          '    finalText: "",\n' +
          '    draftPrefix: "",\n' +
          '    error: "",\n' +
          '    emptyTurns: 0,\n' +
          '    session: 0,\n' +
          '    speechSequence: 0,\n' +
          '    restartTimer: null,\n' +
          '    transcriptLimit: 1800,\n' +
          '  };\n' +
          '  let controls = null;\n' +
          '  let voiceRequest = null;\n' +
          '  let playingAudio = null;\n' +
          '  let playingUrl = null;\n' +
          '  let cloudUnavailable = false;\n' +
          '\n' +
          '  function voiceApiBase() {\n' +
          '    // Use the same local/Render API selection already used by the resort.\n' +
          '    return typeof API_BASE === "string"\n' +
          '      ? API_BASE\n' +
          '      : (typeof AI_API_BASE === "string" ? AI_API_BASE : "/api");\n' +
          '  }\n' +
          '\n' +
          '  function releaseCloudPlayback() {\n' +
          '    if (playingAudio) {\n' +
          '      playingAudio.pause();\n' +
          '      playingAudio.removeAttribute("src");\n' +
          '      playingAudio.load();\n' +
          '      playingAudio = null;\n' +
          '    }\n' +
          '    if (playingUrl) {\n' +
          '      URL.revokeObjectURL(playingUrl);\n' +
          '      playingUrl = null;\n' +
          '    }\n' +
          '  }\n' +
          '\n' +
          '  // Detect reply voice from the actual utterance, not the old dropdown.\n' +
          '  // On-device synthesis is limited to installed voices; unsupported languages\n' +
          "  // fall back to the browser's voice rather than pretending to be native.\n" +
          '  function inferReplyLanguage(raw) {\n' +
          '    const text = String(raw || "").trim();\n' +
          '    if (/[\\u3040-\\u30ff]/u.test(text)) return "japanese";\n' +
          '    if (/[\\uac00-\\ud7af]/u.test(text)) return "korean";\n' +
          '    if (/[\\u0600-\\u06ff]/u.test(text)) return "arabic";\n' +
          '    if (/[\\u3400-\\u9fff]/u.test(text) ||\n' +
          '        /\\b(?:ni\\s*hao|nihao|xie\\s*xie|fangjian|yuding)\\b/i.test(text)) return "mandarin";\n' +
          '    if (/\\b(?:hola|gracias|habitaciones?|reservar|reservaci[oó]n|precios?|cu[aá]nto|buenos|tienen|quiero|puedo|por\\s+favor|estamos|ofrecemos|está|están|sí)\\b/iu.test(text))\n' +
          '      return "spanish";\n' +
          '    if (/\\b(?:bonjour|merci|chambre|chambres|réservation|réserver|hôtel|piscine|combien|nous\\s+avons)\\b/iu.test(text))\n' +
          '      return "french";\n' +
          '    if (/\\b(?:guten\\s+tag|danke|zimmer|buchung|übernachtung|preise?|schwimmbad)\\b/iu.test(text))\n' +
          '      return "german";\n' +
          '    if (/\\b(?:po|opo|kayo|meron|may|kwarto|kuwarto|magkano|paano|saan|ilan|puwede|pwede|yung|ninyo|niyo|salamat)\\b/i.test(text))\n' +
          '      return "taglish";\n' +
          '    return "english";\n' +
          '  }\n' +
          '\n' +
          '  function getLocale() {\n' +
          '    return LOCALES[state.language] || LOCALES.english;\n' +
          '  }\n' +
          '\n' +
          '  function status(message) {\n' +
          '    if (controls?.status) controls.status.textContent = message;\n' +
          '  }\n' +
          '\n' +
          '  // Show which browser voice was really selected so mobile QA can distinguish\n' +
          '  // an unavailable enhanced voice from a playback bug. No audio is uploaded.\n' +
          '  function reportBrowserVoice(voice) {\n' +
          '    if (!controls?.info) return;\n' +
          '    if (!voice) {\n' +
          '      controls.info.textContent =\n' +
          '        "Voice output: browser default (no selectable voice reported by this device).";\n' +
          '      return;\n' +
          '    }\n' +
          '    const name = String(voice.name || "Unnamed voice");\n' +
          '    const lang = String(voice.lang || "unknown language");\n' +
          '    const limited = /compact|low.quality|e?speak/i.test(\n' +
          '      name + " " + String(voice.voiceURI || "")\n' +
          '    );\n' +
          '    controls.info.textContent = "Voice output: " + name + " (" + lang + ")" +\n' +
          '      (limited ? " — basic/compact voice; an Enhanced voice may sound better." : ".");\n' +
          '  }\n' +
          '\n' +
          '  // AI-99: stable, actionable errors. Never bypass permission or session checks.\n' +
          '  function micError(error) {\n' +
          '    switch (error?.name) {\n' +
          '      case "NotAllowedError": case "PermissionDeniedError": case "SecurityError":\n' +
          '        return "Microphone permission denied. Allow microphone access in browser settings, then try again.";\n' +
          '      case "NotFoundError": case "DevicesNotFoundError":\n' +
          '        return "No microphone detected. Connect or enable a microphone, then try again.";\n' +
          '      case "NotReadableError": case "TrackStartError":\n' +
          '        return "Microphone is unavailable or in use. Check your device and close other recording apps.";\n' +
          '      default: return "Could not start microphone recording. Try again or use text chat.";\n' +
          '    }\n' +
          '  }\n' +
          '  function transcriptionError(code, timedOut) {\n' +
          '    if(timedOut) return "Voice transcription timed out. Try again or use text chat.";\n' +
          '    if(code===401||code===403) return "Voice session expired or not authorized. Sign in again to use voice.";\n' +
          '    if(code===429) return "Voice transcription limit reached. Try again later or use text chat.";\n' +
          '    if(code===413||code===415||code===400) return "Recording could not be processed. Try a shorter voice message.";\n' +
          '    return "Voice transcription unavailable. Check your connection or try again later.";\n' +
          '  }\n' +
          '  function revealVoiceOptions() {\n' +
          '    if(controls?.panel) controls.panel.hidden=false;\n' +
          '    document.getElementById("aiVoiceOptionsToggle")?.setAttribute?.("aria-expanded","true");\n' +
          '  }\n' +
          '  function failInput(kind,message) {\n' +
          '    revealVoiceOptions();\n' +
          '    if(kind==="live") stopConversation(message);\n' +
          '    else { state.mode="idle";updateControls();status(message); }\n' +
          '  }\n' +
          '  function fallbackToBrowser(kind) {\n' +
          '    if(!SpeechRecognitionAPI||browserTried||(kind==="live"&&!state.live))return false;\n' +
          '    revealVoiceOptions();\n' +
          '    useBrowserFallback=true;\n' +
          '    preferRecording=false;\n' +
          '    status("Switching to browser speech recognition. Please repeat your message.");\n' +
          '    return beginRecognition(kind);\n' +
          '  }\n' +
          '  function clearPlaybackTimer() {\n' +
          '    if(playbackTimer!==null)clearTimeout(playbackTimer);\n' +
          '    playbackTimer=null;\n' +
          '  }\n' +
          '  function setReplay(text) {\n' +
          '    replayText=String(text||"");\n' +
          '    if(controls?.replay)controls.replay.hidden=!replayText;\n' +
          '    if(replayText)revealVoiceOptions();\n' +
          '  }\n' +
          '\n' +
          '  function clearRestart() {\n' +
          '    if (state.restartTimer !== null) {\n' +
          '      clearTimeout(state.restartTimer);\n' +
          '      state.restartTimer = null;\n' +
          '    }\n' +
          '  }\n' +
          '\n' +
          '  function cancelSpeech() {\n' +
          '    state.speechSequence++;\n' +
          '    clearPlaybackTimer();\n' +
          '    setReplay("");\n' +
          '    // Interrupt BOTH browser TTS and Azure MP3/fetch without replaying\n' +
          '    // old responses or restarting the microphone after interruption.\n' +
          '    voiceRequest?.abort();\n' +
          '    voiceRequest = null;\n' +
          '    releaseCloudPlayback();\n' +
          '    if ("speechSynthesis" in window) window.speechSynthesis.cancel();\n' +
          '  }\n' +
          '\n' +
          '  function stopRecognition(useAbort = true) {\n' +
          '    const active = state.recognizer;\n' +
          '    if (!active) return;\n' +
          '    // Old callbacks must not send messages after cancellation.\n' +
          '    state.recognizer = null;\n' +
          '    try {\n' +
          '      if (useAbort) active.abort();\n' +
          '      else active.stop();\n' +
          '    } catch (error) {\n' +
          '      console.warn("Stopping speech recognition:", error.message);\n' +
          '    }\n' +
          '  }\n' +
          '\n' +
          '  function updateControls() {\n' +
          '    if (!controls) return;\n' +
          '    const listening = state.mode === "dictation" || state.mode === "live-listening";\n' +
          '    if (document.body.classList.contains("customer-manager-tone")) {\n' +
          '      // updateControls() runs on each state change; keep the visible icon in\n' +
          '      // sync with dictation without touching microphone/session handlers.\n' +
          '      const micIcon = state.mode === "dictation" ? STOP_ICON_SVG : MIC_ICON_SVG;\n' +
          '      if (controls.mic.innerHTML !== micIcon) controls.mic.innerHTML = micIcon;\n' +
          '      controls.mic.classList.add("ai-chat-icon-btn");\n' +
          '    } else {\n' +
          '     '... 37446 more characters
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: |-
        // Arvic AI Voice Assistant: optional Azure Blessica for Taglish plus browser fallback.
        // Voice Message: transcribe -> review/edit -> press Send.
        // Live Conversation: listen -> existing Gemini chat -> speak -> listen again.
        // Gemini-first mic input records short WAV clips for signed transcription.
        // Browser SpeechRecognition is a fallback ONLY when recording is unsupported.
        // No mode dropdown; voice controls remain visible and clarify credit usage.
        // Optional Azure Blessica output remains a separate existing feature.
        (() => {
          "use strict";
        
          const LOCALES = Object.freeze({
            english: { stt: "en-PH", tts: "en-US", label: "English" },
            taglish: { stt: "fil-PH", tts: "fil-PH", label: "Taglish" },
            spanish: { stt: "es-ES", tts: "es-ES", label: "Español" },
            mandarin: { stt: "zh-CN", tts: "zh-CN", label: "中文 (Mandarin)" },
            japanese: { stt: "ja-JP", tts: "ja-JP", label: "日本語" },
            korean: { stt: "ko-KR", tts: "ko-KR", label: "한국어" },
            french: { stt: "fr-FR", tts: "fr-FR", label: "Français" },
            german: { stt: "de-DE", tts: "de-DE", label: "Deutsch" },
            arabic: { stt: "ar-SA", tts: "ar-SA", label: "العربية" },
          });
          // DM-08: Consistent, vector-based Speech-to-Text and Stop icons.
          // Presentational only: dictation/live transcription state remains unchanged.
          const MIC_ICON_SVG = [
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"',
            ' stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"',
            ' aria-hidden="true" focusable="false">',
            '<rect x="9" y="2.5" width="6" height="12" rx="3"/>',
            '<path d="M5 10.5v1.5a7 7 0 0 0 14 0v-1.5M12 19v3M8 22h8"/>',
            '</svg>'
          ].join("");
          const STOP_ICON_SVG = [
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"',
            ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"',
            ' aria-hidden="true" focusable="false">',
            '<rect x="6" y="6" width="12" height="12" rx="2"/>',
            '</svg>'
          ].join("");
        
          // UI-44: No persistent voice-language picker. Each turn is auto-detected.
          const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
          // Web Speech can be denied by Safari even when the iPhone mic is allowed.
          const isIOS = /iPhone|iPad|iPod/i.test(window.navigator?.userAgent || "") ||
            (/Macintosh/i.test(window.navigator?.userAgent || "") &&
             Number(window.navigator?.maxTouchPoints) > 1);
          let preferRecording = isIOS || !SpeechRecognitionAPI;
          let useBrowserFallback = false;
          let recordingTried = false;
          let browserTried = false;
          let playbackTimer = null;
          let replayText = "";
          let recording = null;
          let recordingGeneration = 0;
          let transcriptionController = null;
          const canRecord = () => Boolean(window.isSecureContext !== false && window.navigator?.mediaDevices?.getUserMedia &&
            (window.AudioContext || window.webkitAudioContext));
          const canSpeak = () => Boolean(SpeechRecognitionAPI || canRecord());
          const state = {
            language: "english", // last detected language, for reply playback only
            inputMode: "accurate", // Gemini-first for all supported languages/devices.
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
        
          // Detect reply voice from the actual utterance, not the old dropdown.
          // On-device synthesis is limited to installed voices; unsupported languages
          // fall back to the browser's voice rather than pretending to be native.
          function inferReplyLanguage(raw) {
            const text = String(raw || "").trim();
            if (/[\u3040-\u30ff]/u.test(text)) return "japanese";
            if (/[\uac00-\ud7af]/u.test(text)) return "korean";
            if (/[\u0600-\u06ff]/u.test(text)) return "arabic";
            if (/[\u3400-\u9fff]/u.test(text) ||
                /\b(?:ni\s*hao|nihao|xie\s*xie|fangjian|yuding)\b/i.test(text)) return "mandarin";
            if (/\b(?:hola|gracias|habitaciones?|reservar|reservaci[oó]n|precios?|cu[aá]nto|buenos|tienen|quiero|puedo|por\s+favor|estamos|ofrecemos|está|están|sí)\b/iu.test(text))
              return "spanish";
            if (/\b(?:bonjour|merci|chambre|chambres|réservation|réserver|hôtel|piscine|combien|nous\s+avons)\b/iu.test(text))
              return "french";
            if (/\b(?:guten\s+tag|danke|zimmer|buchung|übernachtung|preise?|schwimmbad)\b/iu.test(text))
              return "german";
            if (/\b(?:po|opo|kayo|meron|may|kwarto|kuwarto|magkano|paano|saan|ilan|puwede|pwede|yung|ninyo|niyo|salamat)\b/i.test(text))
              return "taglish";
            return "english";
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
        
          // AI-99: stable, actionable errors. Never bypass permission or session checks.
          function micError(error) {
            switch (error?.name) {
              case "NotAllowedError": case "PermissionDeniedError": case "SecurityError":
                return "Microphone permission denied. Allow microphone access in browser settings, then try again.";
              case "NotFoundError": case "DevicesNotFoundError":
                return "No microphone detected. Connect or enable a microphone, then try again.";
              case "NotReadableError": case "TrackStartError":
                return "Microphone is unavailable or in use. Check your device and close other recording apps.";
              default: return "Could not start microphone recording. Try again or use text chat.";
            }
          }
          function transcriptionError(code, timedOut) {
            if(timedOut) return "Voice transcription timed out. Try again or use text chat.";
            if(code===401||code===403) return "Voice session expired or not authorized. Sign in again to use voice.";
            if(code===429) return "Voice transcription limit reached. Try again later or use text chat.";
            if(code===413||code===415||code===400) return "Recording could not be processed. Try a shorter voice message.";
            return "Voice transcription unavailable. Check your connection or try again later.";
          }
          function revealVoiceOptions() {
            if(controls?.panel) controls.panel.hidden=false;
            document.getElementById("aiVoiceOptionsToggle")?.setAttribute?.("aria-expanded","true");
          }
          function failInput(kind,message) {
            revealVoiceOptions();
            if(kind==="live") stopConversation(message);
            else { state.mode="idle";updateControls();status(message); }
          }
          function fallbackToBrowser(kind) {
            if(!SpeechRecognitionAPI||browserTried||(kind==="live"&&!state.live))return false;
            revealVoiceOptions();
            useBrowserFallback=true;
            preferRecording=false;
            status("Switching to browser speech recognition. Please repeat your message.");
            return beginRecognition(kind);
          }
          function clearPlaybackTimer() {
            if(playbackTimer!==null)clearTimeout(playbackTimer);
            playbackTimer=null;
          }
          function setReplay(text) {
            replayText=String(text||"");
            if(controls?.replay)controls.replay.hidden=!replayText;
            if(replayText)revealVoiceOptions();
          }
        
          function clearRestart() {
            if (state.restartTimer !== null) {
              clearTimeout(state.restartTimer);
              state.restartTimer = null;
            }
          }
        
          function cancelSpeech() {
            state.speechSequence++;
            clearPlaybackTimer();
            setReplay("");
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
            if (document.body.classList.contains("customer-manager-tone")) {
              // updateControls() runs on each state change; keep the visible icon in
              // sync with dictation without touching microphone/session handlers.
              const micIcon = state.mode === "dictation" ? STOP_ICON_SVG : MIC_ICON_SVG;
              if (controls.mic.innerHTML !== micIcon) controls.mic.innerHTML = micIcon;
              controls.mic.classList.add("ai-chat-icon-btn");
            } else {
              controls.mic.textContent = state.mode === "dictation" ? "■" : "🎤";
            }
            controls.mic.title = state.mode === "dictation"
              ? "Stop recording and review transcript" : "Dictate a message, then review and send";
            controls.mic.setAttribute("aria-label", controls.mic.title);
            controls.mic.disabled = state.live || !canSpeak();
            controls.live.textContent = state.live ? "End Conversation" : "Start Conversation";
            controls.live.setAttribute("aria-pressed", state.live ? "true" : "false");
            controls.live.disabled = !canSpeak();
            controls.live.classList.toggle("active", state.live);
            controls.interrupt.hidden = !(state.live && state.mode === "live-speaking");
            // Input language is detected automatically; there is no language selector.
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
            const deadline=setTimeout(()=>controller.abort(),18000);
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
              if (serial !== state.speechSequence) return true;
              releaseCloudPlayback();
              console.warn("Blessica cloud voice unavailable:", error.message);
              status("Blessica cloud voice unavailable; using browser voice.");
              return false;
            } finally {
              clearTimeout(deadline);
              if (voiceRequest === controller) voiceRequest = null;
            }
          }
        
          function speakReply(text, onDone = null, browserOnly = false) {
            const content = String(text || "").trim();
            if (content) state.language = inferReplyLanguage(content);
            cancelSpeech();
            const serial = state.speechSequence;
            if (!content) {
              if (onDone) onDone();
              return;
            }
            let finished = false;
            const finish = (ok = true) => {
              if (finished || serial !== state.speechSequence) return;
              finished = true;
              clearPlaybackTimer();
              if (!ok) {
                if (state.live) stopConversation("Audio playback unavailable. Tap Play Reply to hear the response or continue with text.");
                else status("Audio playback unavailable. Tap Play Reply to retry.");
                setReplay(content);
              }
              if (onDone) onDone(ok);
            };
            // Prevent a stuck live-speaking state if a mobile audio engine emits no end/error.
            const watchdog = () => { clearPlaybackTimer(); playbackTimer=setTimeout(()=>{
              if(serial!==state.speechSequence||finished)return;
              voiceRequest?.abort(); releaseCloudPlayback(); window.speechSynthesis?.cancel(); finish(false);
            }, Math.min(180000, Math.max(30000, content.length * 120 + 18000))); };
            watchdog();
            let browserStarted=false;
            const speakInBrowser = () => {
              if (serial !== state.speechSequence || finished || browserStarted) return;
              browserStarted=true;
              if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
                finish(false);
                return;
              }
              const utterance = new window.SpeechSynthesisUtterance(content);
              const chosenVoice = selectSpeechVoice(utterance);
              reportBrowserVoice(chosenVoice);
              utterance.rate = isIOS ? 1 : 0.98;
              utterance.pitch = 1;
              utterance.onend = () => finish(true);
              utterance.onerror = () => finish(false);
              try {
                if(window.speechSynthesis.paused)window.speechSynthesis.resume();
                window.speechSynthesis.speak(utterance);
              } catch (error) {
                console.warn("Browser TTS failed:", error.message);
                finish(false);
              }
            };
        
            if (state.language === "taglish" && !browserOnly) {
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
              failInput(kind,"Please log in again to use voice.");
              return;
            }
            const controller = new AbortController();
            transcriptionController = controller;
            let timedOut=false;
            let responseCode=0;
            const deadline=setTimeout(()=>{timedOut=true;controller.abort();},25000);
            try {
              status("Transcribing voice securely…");
              const response = await fetch(voiceApiBase() + "/ai/transcribe", {
                method: "POST", headers: {
                  "Content-Type": "audio/wav",
                  "X-Arvic-Voice-Language": "auto",
                  "Authorization": "Bearer " + token
                }, body: wav, signal: controller.signal
              });
              responseCode=response.status;
              const body = await response.json();
              if (!response.ok || !body.success) throw new Error("Transcription failed");
              if (transcriptionController!==controller || controller.signal.aborted || (kind === "live" && (!state.live || state.session !== session))) return;
              // This is already a model-transcribed audio result, not a browser
              // guess. Preserve it instead of rewriting specific words afterwards.
              const text = String(body.transcript || "").trim().slice(0, state.transcriptLimit);
              if (text) state.language = inferReplyLanguage(text);
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
              if (transcriptionController!==controller || (controller.signal.aborted&&!timedOut)) return;
              // Retry by asking the guest to speak again, not by sending paid requests repeatedly.
              if (responseCode!==401 && responseCode!==403 && fallbackToBrowser(kind)) return;
              failInput(kind,transcriptionError(responseCode,timedOut));
              console.warn("Recorded voice transcription failed:", error.name || "unknown",responseCode);
            } finally {
              clearTimeout(deadline);
              if (transcriptionController === controller) transcriptionController = null;
            }
          }
        
          async function startRecordedInput(kind) {
            if (!canRecord()) { status("Voice recording unsupported in this browser."); return false; }
            if(!sessionStorage.getItem("customerToken")){failInput(kind,"Sign in again to use voice transcription.");return false;}
            recordingTried=true;
            preferRecording=true;
            const generation = ++recordingGeneration, session = state.session;
            const prefix = kind === "dictation"
              ? String(document.getElementById("aiChatInput")?.value || "").trim() : "";
            state.mode = kind === "live" ? "live-listening" : "dictation";
            updateControls();
            status("Requesting microphone access…");
            let stream, context;
            try {
              // Construct/resume audio context from the original user gesture, before permission awaits.
              const Context = window.AudioContext || window.webkitAudioContext;
              context = new Context();
              const resume=context.resume().catch(()=>{});
              stream = await window.navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true,
                  channelCount: 1 }
              });
              if (generation !== recordingGeneration || (kind === "live" && (!state.live || state.session !== session))) {
                stream.getTracks().forEach(track => track.stop()); context.close().catch(()=>{});return false;
              }
              const source = context.createMediaStreamSource(stream);
              const processor = context.createScriptProcessor(2048, 1, 1);
              const gain = context.createGain();
              gain.gain.value = 0;
              source.connect(processor); processor.connect(gain); gain.connect(context.destination);
              const active = { kind, session, prefix, stream, context, source, processor,
                gain, parts: [], count: 0, heard: false, voiceFrames: 0, voiceSeconds:0, noiseFloor:0.002,
                lastSpeech: 0, timeout: null };
              recording = active;
              processor.onaudioprocess = event => {
                if (recording !== active) return;
                const samples = new Float32Array(event.inputBuffer.getChannelData(0));
                active.parts.push(samples); active.count += samples.length;
                let energy = 0;
                for (let n = 0; n < samples.length; n++) energy += samples[n] * samples[n];
                const elapsed = active.count / context.sampleRate;
                const rms=Math.sqrt(energy/samples.length);
                const threshold=Math.max(0.004,Math.min(0.012,active.noiseFloor*2.5));
                if(rms>threshold){
                  active.voiceFrames++;
                  active.voiceSeconds+=samples.length/context.sampleRate;
                  if(active.voiceSeconds>=0.12)active.heard=true;
                  active.lastSpeech=elapsed;
                }else{
                  active.noiseFloor=0.97*active.noiseFloor+0.03*rms;
                  if(!active.heard)active.voiceSeconds=0;
                }
                // Allow natural pauses in Taglish without cutting off the sentence.
                // Keep WAV under the backend's 500 KB audio limit (14 s at 16 kHz).
                if (elapsed >= 14 || (kind === "live" && active.heard &&
                  elapsed - active.lastSpeech >= 1.6)) {
                  finishRecordedInput(true);
                }
              };
              let resumeDeadline;
              try {
                await Promise.race([resume.then(()=>context.state==="suspended"?context.resume():undefined),new Promise((_,reject)=>{resumeDeadline=setTimeout(()=>reject(new Error("Audio context suspended")),2500);})]);
              } finally {clearTimeout(resumeDeadline);}
              if(context.state!=="running")throw new Error("Audio context unavailable");
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
              const stale=generation!==recordingGeneration||(kind==="live"&&(!state.live||state.session!==session));
              if (recording?.context === context) cancelRecordedInput();
              else { stream?.getTracks().forEach(track => track.stop()); context?.close().catch(() => {}); }
              if(stale)return false;
              const denied=["NotAllowedError","PermissionDeniedError","SecurityError","NotFoundError","DevicesNotFoundError"].includes(error.name);
              if(!denied&&fallbackToBrowser(kind))return true;
              failInput(kind,micError(error));
              console.warn("Recorded microphone unavailable:", error.name || "unknown");
              return false;
            }
          }
        
          function beginVoiceInput(kind) {
            // Multilingual input uses Gemini audio auto-detection whenever available;
            // browser speech recognition is a limited device-language fallback only.
            if (canRecord() && !useBrowserFallback) {
              return startRecordedInput(kind);
            }
            if (state.inputMode === "accurate" && !canRecord() && !useBrowserFallback) {
              status("Accurate input unsupported on this device; using browser speech recognition.");
            }
            if(SpeechRecognitionAPI)return beginRecognition(kind);
            failInput(kind,"Voice input unavailable in this browser. Text chat still works.");
            return false;
          }
        
          function setInputMode(mode) {
            if (!["accurate", "fast"].includes(mode)) return;
            if (state.live) stopConversation("Voice input mode changed. Start a new conversation.");
            if (state.mode === "dictation" || state.mode === "dictation-transcribing") {
              stopRecognition(true); cancelRecordedInput(); state.mode = "idle";
            }
            state.inputMode = mode; // Legacy programmatic API; no user-visible selector.
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
            // Programmatic voice output change must not interrupt a live call.
            if (state.mode === "dictation" || state.mode === "dictation-transcribing") {
              stopRecognition(true); cancelRecordedInput(); state.mode = "idle";
            }
            state.language = language;
            // Never persist a language preference: the next visitor turn can differ.
            // No picker; this is retained as an internal TTS compatibility method.
            if (controls?.inputMode) controls.inputMode.value = state.inputMode;
            updateControls();
            status(canRecord()
              ? "Auto language mic ready · transcription uses Gemini credits."
              : "Browser microphone fallback: language recognition may be limited.");
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
            browserTried=true;
            let recognizer;
            try { recognizer=new SpeechRecognitionAPI(); } catch(error) {failInput(kind,micError(error));return false;}
            const session = state.session;
            state.recognizer = recognizer;
            state.error = "";
            state.finalText = "";
            state.draftPrefix = kind === "dictation" ? input.value.trim() : "";
            state.mode = kind === "dictation" ? "dictation" : "live-listening";
            recognizer.lang = getLocale().stt; // Device fallback cannot auto-detect arbitrary languages.
            recognizer.continuous = kind === "dictation";
            recognizer.interimResults = true;
            // Some browsers offer a better-scored "pool shade"/"preview" alternative.
            // Prefer it only when confidence is comparable and resort context fits.
            recognizer.maxAlternatives = 3;
            recognizer.onstart = () => {
              if (state.recognizer !== recognizer) return;
              status(kind === "dictation"
                ? "Browser speech recognition (device language may be limited). Review text before sending."
                : "Browser listening · speech language may be limited on this device.");
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
              if (["service-not-allowed", "language-not-supported", "network"].includes(reason) && canRecord() && !recordingTried) {
                preferRecording = true;
                useBrowserFallback = false;
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
                  : error && !["no-speech","aborted"].includes(error)
                    ? "Voice recognition failed ("+error+"). Check microphone permissions or use text chat."
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
            speakReply(responseText, ok => {
              if (!ok || !state.live || state.session !== session) return;
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
              if (recording || !state.recognizer) finishRecordedInput(true);
              else try { state.recognizer?.stop(); } catch (_) { /* ending already */ }
              return;
            }
            if (state.mode === "dictation-transcribing") return;
            useBrowserFallback=false;recordingTried=false;browserTried=false;
            void beginVoiceInput("dictation");
          }
        
          function startConversation() {
            if (!canSpeak()) { status("Voice input unavailable. Use text chat."); return; }
            if (state.mode === "dictation" || state.mode === "dictation-transcribing") {
              stopRecognition(true); cancelRecordedInput(); state.mode = "idle";
            }
            cancelSpeech();
            useBrowserFallback=false;recordingTried=false;browserTried=false;
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
            state.language = inferReplyLanguage(text);
            status("Reading response in " + getLocale().label + "…");
            speakReply(text, ok => {if(ok)status("Finished reading aloud.");});
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
              '<span class="ai-voice-auto-label">Automatic language detection</span>',
              '<button id="aiVoiceLive" type="button" aria-pressed="false">Start Conversation</button>',
              '</div>',
              // A single microphone mode keeps the UI simple. Gemini is the default;
              // if recording is unsupported, the existing browser fallback is used.
              '<div class="ai-voice-actions">',
              '<button id="aiVoiceInterrupt" type="button" hidden>Interrupt AI</button>',
              '<button id="aiVoiceReplay" type="button" hidden>Play Reply</button>',
              '</div>',
              '<p id="aiVoiceStatus" role="status" aria-live="polite">',
              'Gemini mic ready · transcription uses credits.</p>',
              '<p id="aiVoiceInfo" class="ai-voice-info" aria-live="polite">',
              'Voice output: detecting device voice…</p>',
            ].join("");
            messages.parentNode.insertBefore(panel, messages);
        
            controls = {
              panel,
              mic: microphone,
              live: panel.querySelector("#aiVoiceLive"),
              interrupt: panel.querySelector("#aiVoiceInterrupt"),
              replay: panel.querySelector("#aiVoiceReplay"),
              status: panel.querySelector("#aiVoiceStatus"),
              info: panel.querySelector("#aiVoiceInfo"),
            };
            // Ignore any legacy saved voice selection; public users choose by speaking.
            state.language = "english";
            // Ignore earlier Fast/browser preferences: Gemini transcription is now
            // the default across sessions, with browser STT as a device fallback.
            state.inputMode = "accurate";
             // Safari/Android may populate voices lazily; warm the list before Read Aloud.
            // Still synthesize synchronously when the user taps to preserve iOS gestures.
            window.speechSynthesis?.getVoices?.();
            microphone.addEventListener("click", toggleDictation);
            controls.live.addEventListener("click", () => {
              if (state.live) stopConversation();
              else startConversation();
            });
            controls.interrupt.addEventListener("click", interruptConversation);
            controls.replay.addEventListener("click",()=>{
              const text=replayText;if(!text)return;
              // Direct gesture gives browser TTS the best chance on iOS.
              speakReply(text,ok=>{if(ok)status("Finished reading aloud.");},true);
            });
         
            document.getElementById("aiChatClose")?.addEventListener("click", () =>
              stopConversation("Voice controls stopped when the assistant closed."));
            document.getElementById("aiNewChatBtn")?.addEventListener("click", () =>
              stopConversation("Ready for a new conversation."));
            window.addEventListener("pagehide", () => {
              // Release microphone and speech when navigating away.
              stopConversation("");
            });
            document.addEventListener("visibilitychange",()=>{
              if(document.hidden&&(state.live||state.mode!=="idle"))stopConversation("Voice paused while the page was in the background. Tap Start Conversation to resume.");
            });
        
            if (window.isSecureContext===false) {
              status("Microphone requires HTTPS or localhost. Text chat still works.");
            } else if (!canSpeak()) {
              status("Voice input unavailable in this browser. Text chat still works.");
            } else if (canRecord()) {
              status("Gemini mic ready · transcription uses credits.");
            } else {
              // Preserve a working voice option on devices without AudioContext.
              // Never claim Gemini transcription is running when only browser STT works.
              status("Browser voice recognition fallback active on this device.");
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
        
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-auto-multilingual-ui44.test.js:23:10)
        Test.runInAsyncScope (node:async_hooks:214:14)
        Test.run (node:internal/test_runner/test:1047:25)
        Test.start (node:internal/test_runner/test:944:17)
        startSubtestAfterBootstrap (node:internal/test_runner/harness:296:17)
      ...
    # Subtest: AI-44 voice and text requests detect each utterance independently
    ok 7 - AI-44 voice and text requests detect each utterance independently
      ---
      duration_ms: 0.411411
      type: 'test'
      ...
    # Subtest: AI-44 signed Gemini audio accepts mixed spoken languages without translating
    ok 8 - AI-44 signed Gemini audio accepts mixed spoken languages without translating
      ---
      duration_ms: 0.213282
      type: 'test'
      ...
    # Subtest: AI-44 safe Romanized Mandarin greeting and multilingual resort guard
    ok 9 - AI-44 safe Romanized Mandarin greeting and multilingual resort guard
      ---
      duration_ms: 0.198049
      type: 'test'
      ...
    # Subtest: AI-44 all authenticated Customer pages load fresh voice implementation
    not ok 10 - AI-44 all authenticated Customer pages load fresh voice implementation
      ---
      duration_ms: 0.458822
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-auto-multilingual-ui44.test.js:51:1'
      failureType: 'testCodeFailure'
      error: 'index.html'
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: |-
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
          <!-- DM-02: Restore Customer theme before first paint; navbar switch initializes after DOM load. -->
          <script src="../sharedJS/customer-theme-toggle.js?v=20261121-dm04"></script>
        
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
            <title>Arvic Seaside | Home</title>
            <!-- Arvic Seaside: square brand favicon for browser tabs and Google Search. -->
            <link rel="icon" type="image/svg+xml" sizes="any" href="../favicon.svg" />
        
            <link rel="stylesheet" href="../sharedCSS/global.css" />
            <link rel="stylesheet" href="../css/style.css" />
            <link rel="stylesheet" href="../customerCSS/index.css" />
            <link rel="stylesheet" href="../sharedCSS/customer-navbar.css?v=20261120-ui30" />
            <link rel="stylesheet" href="../sharedCSS/ai-voice.css?v=20261126-ai99" />
            <link rel="stylesheet" href="../sharedCSS/ai-recommendations.css" />
            <link rel="stylesheet" href="../sharedCSS/ai-chat-layout.css?v=20261126-ui96" />
              <!-- Consistent, centered confirmation for accidental logout clicks. -->
            <link rel="stylesheet" href="../sharedCSS/logout-confirm.css" />
            <!-- Stage UI-22: visual-only muted Customer theme, loaded last. -->
          <link rel="stylesheet" href="../customerCSS/customer-manager-tone.css?v=20261119-ui22" />
            <!-- UI-26: Light, airy shared AI chat skin; load AFTER customer theme. -->
            <link rel="stylesheet" href="../sharedCSS/ai-chat-airy.css?v=20261120-ui30" />
          <!-- DM-01: Customer-only theme palette. Default is the existing Light Mode. -->
          <link rel="stylesheet" href="../customerCSS/customer-theme-tokens.css?v=20261121-dm01" />
          <link rel="stylesheet" href="../customerCSS/customer-theme-toggle.css?v=20261121-dm04" />
          <!-- DM-03: Soft Dark styling, screen-only and customer-only. Light Mode unaffected. -->
          <link rel="stylesheet" href="../customerCSS/customer-dark-skin-dm03.css?v=20261121-dm03" />
          <!-- DM-04: Soft Dark polish, background icon removal and My Bookings fixes. -->
          <link rel="stylesheet" href="../customerCSS/customer-comfort-polish-dm04.css?v=20261121-dm04" />
          <!-- DM-05: Compact signed-in Customer mobile menu, touch-friendly Theme row. -->
          <link rel="stylesheet" href="../customerCSS/customer-mobile-nav-dm05.css?v=20261121-dm05" />
          <!-- DM-06: Last dark-only AI concierge palette; keep Light Mode untouched. -->
          <link rel="stylesheet" href="../customerCSS/customer-ai-dark-polish-dm06.css?v=20261121-dm06" />
          <!-- DM-07: one compact, unified Customer AI concierge skin (must load last). -->
          <link rel="stylesheet" href="../sharedCSS/ai-concierge-dm07.css?v=20261121-dm08" />
            <link rel="stylesheet" href="../sharedCSS/ai-concierge-guide-ui48.css?v=20261122-ai48" />
        </head>
        
          <body class="customer-manager-tone">
            <!-- ======================================================
               CUSTOMER NAVBAR
               Same Resort Map navbar style on all customer pages.
            ======================================================= -->
            <header class="navbar">
              <!-- UI-30: Tappable Customer brand link; booking/payment routes retain exit confirmation. -->
              <a class="logo" href="index.html" aria-label="Arvic Seaside — Customer Home">Arvic Seaside</a>
        
              <button id="menuToggle" class="menu-toggle" type="button" aria-controls="mobileNav" aria-expanded="false">☰</button>
        
              <nav id="mobileNav">
                <a href="index.html" class="active-nav">Home</a>
                <a href="rooms.html">Accommodations</a>
                <a href="resort-map.html">Resort Map</a>
                <a href="my-bookings.html">My Bookings</a>
                <a href="profile.html">Profile</a>
                <a href="#" id="logoutBtn">Logout</a>
              </nav>
            </header>
        
            <!-- ======================================================
               HERO SECTION
            ======================================================= -->
            <section class="hero-section">
              <div class="hero-inner">
                <div class="hero-badge">
                  Seaside comfort • Easy online booking • AI Chatbot Assistant
                </div>
        
                <h1>Escape to a more relaxing resort stay.</h1>
        
                <p>
                  Explore beautiful accommodations, book your preferred schedule, and
                  manage your stay with a cleaner, smarter, and more premium guest
                  experience.
                </p>
        
                <div class="hero-actions">
                  <a href="rooms.html" class="btn-primary">Browse Accommodations</a>
                  <a href="my-bookings.html" class="btn-secondary">View My Bookings</a>
                </div>
              </div>
            </section>
        
            <!-- ======================================================
               MAIN HOME CONTENT
            ======================================================= -->
            <main class="home-wrapper">
              <section class="welcome-box">
                <h2>Your resort booking, made smoother</h2>
        
                <p>
                  Arvic Seaside helps you discover accommodations faster, compare stay
                  details clearly, and handle your reservations with less stress. From
                  accommodation selection to booking confirmation, the whole experience
                  feels more like a modern resort website.
                </p>
              </section>
        
              <!-- ======================================================
                 CLIENT INFORMATION SECTION
                 Added for mock defense and customer contact visibility.
              ======================================================= -->
              <section class="welcome-box">
                <h2>Arvic Seaside Beach Resort and Hotel</h2>
        
                <p>
                  Visit Arvic Seaside Beach Resort and Hotel at
                  <strong>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</strong
                  >. The resort is open <strong>24 hours from Monday to Sunday</strong>.
                </p>
        
                <section class="home-grid" style="margin-top: 18px">
                  <div class="home-card location-map-card">
                    <iframe
                      class="location-map-bg"
                      src="https://www.google.com/maps?q=17%20Mahogany%20Street%2C%20Brgy.%20Bagong%20Karsada%2C%20Naic%2C%20Cavite&output=embed"
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
        
                    <div class="location-map-overlay"></div>
        
                    <div class="location-map-content">
                      <h2>Location</h2>
        
                      <p>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</p>
        
                      <a
                        href="https://www.google.com/maps/place/Arvic+SeaSide+Beach+Resort/@14.3208998,120.7354653,15z/data=!4m9!3m8!1s0x3396282de7cc3e97:0x92a1cbde8ed5d9f0!5m2!4m1!1i2!8m2!3d14.321746!4d120.7526246!16s%2Fg%2F1tmph13z?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D"
                        class="btn-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Location
                      </a>
                    </div>
                  </div>
                  <!-- ======================================================
                 CONTACT DETAILS CARD
              ======================================================= -->
                  <div class="home-card contact-card">
                    <h2>Contact Details</h2>
        
                    <div class="contact-links-box">
                      <a href="tel:09569125625" class="contact-link-card">
                        <span class="contact-icon">☎</span>
                        <span>
                          <strong>0956-912-5625</strong>
                          <small>Tap to call front desk</small>
                        </span>
                      </a>
        
                      <a href="tel:09678170662" class="contact-link-card">
                        <span class="contact-icon">☎</span>
                        <span>
                          <strong>0967-817-0662</strong>
                          <small>Alternative contact number</small>
                        </span>
                      </a>
        
                      <a
                        href="mailto:resortarvicseaside@gmail.com"
                        class="contact-link-card email-contact-card"
                      >
                        <span class="contact-icon">✉</span>
                        <span>
                          <strong>resortarvicseaside@gmail.com</strong>
                          <small>Email the resort for inquiries</small>
                        </span>
                      </a>
                    </div>
        
                    <div class="contact-note">
                      Always open • Monday to Sunday • 24 hours
                    </div>
                  </div>
        
                  <!-- ======================================================
                 SOCIAL MEDIA CARD
              ======================================================= -->
                  <div class="home-card social-card">
                    <h2>Social Media</h2>
        
                    <p>
                      Follow or message the resort through its official social media
                      pages for inquiries, updates, and announcements.
                    </p>
        
                    <div class="social-links-box">
                      <a
                        href="https://www.facebook.com/share/1E1kZLtrV4/?mibextid=wwXIfr"
                        class="social-link-card facebook-card"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span class="social-icon">f</span>
                        <span>
                          <strong>Facebook Page</strong>
                          <small>Message us for inquiries</small>
                        </span>
                      </a>
        
                      <a
                        href="https://www.tiktok.com/@arvicseaside?_r=1&_t=ZS-9780VTxjMxB"
                        class="social-link-card tiktok-card"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span class="social-icon">♪</span>
                        <span>
                          <strong>TikTok</strong>
                          <small>View resort clips and updates</small>
                        </span>
                      </a>
                    </div>
        
                    <div class="social-note">
                      Official social media links of Arvic Seaside Beach Resort and
                      Hotel.
                    </div>
                  </div>
                </section>
              </section>
        
              <section class="home-grid">
                <div class="home-card">
                  <h2>Browse Accommodations</h2>
        
                  <p>
                    Explore available rooms, cottages, and function areas with a cleaner
                    card layout, pricing, capacity display, amenities, and booking-ready
                    actions.
                  </p>
        
                  <a href="rooms.html" class="btn-primary">Explore Accommodations</a>
                </div>
        
                <div class="home-card">
                  <h2>Track Your Reservation</h2>
        
                  <p>
                    Check your current bookings, receipt details, payment method, and
                    reservation status in one organized guest dashboard.
                  </p>
        
                  <a href="my-bookings.html" class="btn-primary">Open My Bookings</a>
                </div>
        
                <div class="home-card">
                  <h2>Manage Your Account</h2>
        
                  <p>
                    Review your saved guest information and update your password
                    securely whenever needed from your personal profile page.
                  </p>
        
                  <a href="profile.html" class="btn-primary">Go to Profile</a>
                </div>
              </section>
        
              <section class="quick-strip">
                <div class="quick-item">
                  <h3>Relaxing visual theme</h3>
        
                  <p>
                    A more premium ocean-and-sand color palette for a proper seaside
                    resort feel.
                  </p>
                </div>
        
                <div class="quick-item">
                  <h3>Mobile-friendly layout</h3>
        
                  <p>
                    Cleaner spacing and stronger cards so the customer pages still feel
                    good on phones.
                  </p>
                </div>
        
                <div class="quick-item">
                  <h3>AI booking support</h3>
        
                  <p>
                    Ask for accommodation suggestions, dates, payment help, and start a
                    fresh new chat anytime.
                  </p>
                </div>
              </section>
            </main>
        
            <!-- ======================================================
               AI CHAT WIDGET
            ======================================================= -->
            <button id="aiChatToggle" class="ai-chat-toggle" type="button">Ask AI Assistant</button>
        
            <div id="aiChatWindow" class="ai-chat-window">
              <div class="ai-chat-header">
                <!-- UI-27: Branded concierge identity. Keep existing title and controls. -->
                <div class="ai-assistant-brand">
                  <span class="ai-assistant-mark" aria-hidden="true">AI</span>
                  <div class="ai-assistant-heading">
                    <h3>Arvic Seaside Resort AI Assistant</h3>
                    <span class="ai-assistant-caption">Your resort concierge · Here to help</span>
                  </div>
                </div>
        
                <div class="ai-chat-header-actions">
                  <button id="aiNewChatBtn" class="ai-chat-header-btn" title="New Chat" type="button">
                    New
                  </button>
        
                  <button
                    id="aiChatMaximize"
                    class="ai-chat-header-btn"
                    title="Maximize"
                   type="button">
                    ▢
                  </button>
        
                  <button id="aiChatClose" class="ai-chat-header-btn" title="Close" type="button">
                    &times;
                  </button>
                </div>
              </div>
        
              <div id="aiChatMessages" class="ai-chat-messages"></div>
        
              <div class="ai-chat-input-area">
                <input
                  type="text"
                  id="aiChatInput"
                  placeholder="Ask about rooms, cottages, dates, payment, or booking help..."
                />
        
                <button
                  id="aiMicBtn"
                  class="ai-chat-mic-btn"
                  title="Voice input"
                  aria-label="Voice input"
                 type="button">
                  🎤
                </button>
        
                <button id="aiSendBtn" class="ai-chat-send" type="button">Send</button>
              </div>
            </div>
        
            <!-- ======================================================
               PAGE SCRIPTS
            ======================================================= -->
            <script src="../sharedJS/toast.js"></script>
            <script src="../sharedJS/api-config.js?v=20261126-auth100"></script>
            <script src="../customerJS/index.js"></script>
            <script src="../js/ai-chat.js?v=20261126-ui97"></script>
            <script src="../js/ai-voice.js?v=20261126-ai99"></script>
            <script src="../js/ai-chat-polish.js?v=20261126-ui96"></script>
            <script>
              const menuToggle = document.getElementById("menuToggle");
              const mobileNav = document.getElementById("mobileNav");
        
              if (menuToggle && mobileNav) {
                menuToggle.addEventListener("click", () => {
                  mobileNav.classList.toggle("show");
                  menuToggle.textContent = mobileNav.classList.contains("show")
                    ? "×"
                    : "☰";
                });
              }
            </script>
              <!-- Shared Customer scroll navigation: stays hidden down, reappears after slight up-scroll. -->
            <script src="../sharedJS/customer-scroll-nav.js?v=20261120-ui30"></script>
            <script src="../sharedJS/logout-confirm.js"></script>
          </body>
        </html>
        
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-auto-multilingual-ui44.test.js:55:12)
        Test.runInAsyncScope (node:async_hooks:214:14)
        Test.run (node:internal/test_runner/test:1047:25)
        Test.processPendingSubtests (node:internal/test_runner/test:744:18)
        Test.postRun (node:internal/test_runner/test:1173:19)
        Test.run (node:internal/test_runner/test:1101:12)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 11 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 107.497279
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 12 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 16.932739
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 13 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 6.718927
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 14 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 12.677278
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 15 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 8.757113
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 16 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 5.380458
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    not ok 17 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 95.656792
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:288:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        1 !== 0
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 0
      actual: 1
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:337:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    not ok 18 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 17.270007
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:340:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        2 !== 0
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 0
      actual: 2
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:360:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    not ok 19 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 8.171069
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:363:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        + actual - expected
        
        + 'verified_catalog_rates'
        - 'verified_cheapest_accommodation'
                     ^
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 'verified_cheapest_accommodation'
      actual: 'verified_catalog_rates'
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:375:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    not ok 20 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 9.543149
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:383:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        1 !== 0
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 0
      actual: 1
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:400:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    not ok 21 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 22.740531
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:403:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        1 !== 0
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 0
      actual: 1
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:435:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 22 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 7.409089
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    not ok 23 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 4.781304
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:451:1'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /date at time/i. Input:
        
        'May 3 rooms pong nakalista sa resort ngayon (2 marked available). Bilang ito ng mga nakalista, hindi pa kumpirmadong bakante sa napiling petsa at oras.'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: 'May 3 rooms pong nakalista sa resort ngayon (2 marked available). Bilang ito ng mga nakalista, hindi pa kumpirmadong bakante sa napiling petsa at oras.'
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:467:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    not ok 24 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 7.196208
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:480:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        1 !== 0
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 0
      actual: 1
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:494:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    not ok 25 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 5.588692
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:497:1'
      failureType: 'testCodeFailure'
      error: |-
        Ilang available na rooms meron kayo?
        
        1 !== 0
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 0
      actual: 1
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:518:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    not ok 26 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 4.617206
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:524:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        1 !== 0
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 0
      actual: 1
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:536:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 27 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 6.895194
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 28 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 10.648317
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    not ok 29 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 5.960453
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:590:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        1 !== 0
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 0
      actual: 1
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:602:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
    ok 30 - AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
      ---
      duration_ms: 12.322102
      type: 'test'
      ...
    # Subtest: AI-38 corrected guest count sees newly updated Admin prices and inventory
    ok 31 - AI-38 corrected guest count sees newly updated Admin prices and inventory
      ---
      duration_ms: 12.721934
      type: 'test'
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-38 original family-room scope persists after revising 10 guests to 7
    not ok 32 - AI-38 original family-room scope persists after revising 10 guests to 7
      ---
      duration_ms: 8.586115
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:711:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:735:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-45 natural two-to-seven follow-up retains group search even after language switch
    ok 33 - AI-45 natural two-to-seven follow-up retains group search even after language switch
      ---
      duration_ms: 8.243348
      type: 'test'
      ...
    # Subtest: AI-45 a guest-specific family-room preview keeps category on count correction
    ok 34 - AI-45 a guest-specific family-room preview keeps category on count correction
      ---
      duration_ms: 5.032283
      type: 'test'
      ...
    # Subtest: AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
    not ok 35 - AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
      ---
      duration_ms: 2.959505
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:812:1'
      failureType: 'testCodeFailure'
      error: |-
        7 pala
        
        1 !== 0
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 0
      actual: 1
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:831:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    not ok 36 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 2.786134
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:835:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        1 !== 0
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 0
      actual: 1
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:839:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    not ok 37 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 2.889921
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:842:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        1 !== 0
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 0
      actual: 1
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:855:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    not ok 38 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 2.826274
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:860:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:876:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
