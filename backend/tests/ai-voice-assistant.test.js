// Browser voice regression tests with fake DOM and fake speech APIs.
// No microphone, Gemini API, PayPal, network traffic, or database writes.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const script = fs.readFileSync(
  path.resolve(__dirname, "../../frontend/js/ai-voice.js"), "utf8",
);

function mount({ recognizerAvailable = true, savedLanguage = null, voices = [], customerToken = null,
  cloudStatus = 503, audioAvailable = false, ios = false,
  recentTurns = [], recordedTranscript = "How do I book a room?",
  assistantReply = "Hello! Available accommodations can be checked." } = {}) {
  const nodes = {};
  const recognitionInstances = [];
  const speechUtterances = [];
  const requests = [];
  const cloudRequests = [];
  const cloudAudio = [];
  const audioProcessors = [];
  const transcriptionRequests = [];
  const pendingTimers = new Map();
  const stored = new Map();
  const documentHandlers = {};
  const windowHandlers = {};
  const synthesisHandlers = {};
  let availableVoices = voices;
  let nextTimer = 0;
  let speechCancelCount = 0;
  if (savedLanguage) stored.set("smartresort_ai_voice_language_v1", savedLanguage);

  function element(id) {
    return nodes[id] ||= {
      id, value: "", textContent: "", disabled: false, hidden: false,
      children: [], appendChild(child) { this.children.push(child); },
      title: "", innerHTML: "", listeners: {}, attrs: {},
      classList: { toggle() {}, add() {} },
      setAttribute(name, value) { this.attrs[name] = value; },
      addEventListener(type, callback) { this.listeners[type] = callback; },
      fire(type) {
        assert.equal(typeof this.listeners[type], "function", id + " missing " + type);
        this.listeners[type]({ type });
      },
      querySelector(selector) { return nodes[selector.slice(1)] || null; },
    };
  }
  const messages = element("aiChatMessages");
  messages.parentNode = {
    insertBefore(panel) { nodes[panel.id] = panel; },
  };
  element("aiMicBtn");
  element("aiChatInput");
  element("aiChatClose");
  element("aiNewChatBtn");
  // Fake DOM has no HTML parser: create nodes that the injected toolbar
  // would normally produce from panel.innerHTML in a real browser.
  for (const id of ["aiVoiceLanguage", "aiVoiceInputMode", "aiVoiceLive",
    "aiVoiceInterrupt", "aiVoiceStatus", "aiVoiceChoice",
    "aiVoicePreview", "aiVoiceInfo", "aiVoiceReplay"]) element(id);

  class FakeRecognizer {
    constructor() {
      recognitionInstances.push(this);
      this.continuous = false;
      this.interimResults = false;
    }
    start() {
      this.started = true;
      this.onstart?.();
    }
    stop() {
      this.started = false;
      this.onend?.();
    }
    abort() {
      this.started = false;
      this.onend?.();
    }
    say(text, isFinal = true, alternatives = []) {
      const result = [
        { transcript: text, confidence: 0.82 },
        ...alternatives.map(item => typeof item === "string"
          ? { transcript: item, confidence: 0.8 }
          : item),
      ];
      result.isFinal = isFinal;
      this.onresult({ resultIndex: 0, results: [result] });
    }
  }
  class FakeUtterance {
    constructor(text) { this.text = text; }
  }
  // Browser-only speech tests and optional Azure speech tests use fake APIs.
  class FakeCloudAudio {
    constructor() { cloudAudio.push(this); }
    play() { this.played = true; return Promise.resolve(); }
    pause() { this.paused = true; }
    removeAttribute() {}
    load() {}
  }
  class FakeAudioContext {
    constructor() { this.sampleRate = 48000; this.destination = {}; }
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    createScriptProcessor() {
      const p = { connect() {}, disconnect() {}, feed(value, count = 2048) {
        const samples = new Float32Array(count).fill(value);
        this.onaudioprocess?.({ inputBuffer: { getChannelData: () => samples } });
      } };
      audioProcessors.push(p); return p;
    }
    createGain() { return { gain: { value: 1 }, connect() {}, disconnect() {} }; }
    async resume() {}
    async close() {}
  }
  class FakeAbortController {
    constructor() { this.signal = { aborted: false }; }
    abort() { this.signal.aborted = true; }
  }

  const fakeWindow = {
    addEventListener(name, handler) { windowHandlers[name] = handler; },
    speechSynthesis: {
      getVoices() { return availableVoices; },
      addEventListener(name, handler) { synthesisHandlers[name] = handler; },
      cancel() { speechCancelCount++; },
      speak(utterance) { speechUtterances.push(utterance); },
    },
    SpeechSynthesisUtterance: FakeUtterance,
    navigator: { userAgent: ios ? "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)" : "Chrome",
      ...(audioAvailable ? { mediaDevices: { async getUserMedia() {
        return { getTracks() { return [{ stop() {} }]; } };
      } } } : {}),
    },
    ...(audioAvailable ? { AudioContext: FakeAudioContext } : {}),
    ...(recognizerAvailable ? { SpeechRecognition: FakeRecognizer } : {}),
  };
  const context = {
    window: fakeWindow,
    SpeechSynthesisUtterance: FakeUtterance,
    document: {
      body: { classList: { contains() { return true; } } },
      getElementById(name) { return nodes[name] || null; },
      createElement(tag) {
        if (tag === "option") return { value: "", textContent: "" };
        return element("aiVoicePanel");
      },
      addEventListener(name, handler) { documentHandlers[name] = handler; },
    },
    localStorage: {
      getItem(key) { return stored.get(key) ?? null; },
      setItem(key, value) { stored.set(key, value); },
    },
    sessionStorage: {
      getItem(key) { return key === "customerToken" ? customerToken : null; },
    },
    AbortController: FakeAbortController,
    Blob,
    Audio: FakeCloudAudio,
    URL: {
      createObjectURL() { return "blob:mock-blessica-mp3"; },
      revokeObjectURL() {},
    },
    fetch: async (url, opts) => {
      if (String(url).endsWith("/ai/transcribe")) {
        transcriptionRequests.push({ url, opts });
        return { ok: true, async json() { return { success: true,
          transcript: recordedTranscript }; } };
      }
      cloudRequests.push({ url, opts });
      return {
        ok: cloudStatus === 200, status: cloudStatus,
        async blob() { return { type: "audio/mpeg" }; },
      };
    },
    console,
    getAiRecentConversationTurns: () => recentTurns,
    getStoredAiContext: () => ({}),
    sendAiMessage: async opts => {
      requests.push({ opts, message: nodes.aiChatInput.value });
      nodes.aiChatInput.value = "";
      return assistantReply;
    },
    setTimeout: callback => {
      const id = ++nextTimer;
      pendingTimers.set(id, callback);
      return id;
    },
    clearTimeout: id => pendingTimers.delete(id),
  };

  vm.runInNewContext(script, context, { filename: "ai-voice.js" });
  documentHandlers.DOMContentLoaded();
  // Simulate an internal TTS locale for legacy browser-voice tests. The real
  // UI has no language selector or persisted language preference.
  if (savedLanguage) fakeWindow.ArvicVoice.setLanguage(savedLanguage);
  function fire(id, name = "click") { element(id).fire(name); }
  function runScheduled() {
    const tasks = [...pendingTimers.values()];
    pendingTimers.clear();
    for (const fn of tasks) fn();
  }
  async function settle() {
    await new Promise(resolve => setImmediate(resolve));
  }
  return {
    nodes, fire, runScheduled, settle, recognitionInstances, speechUtterances,
    requests, cloudRequests, cloudAudio, audioProcessors, transcriptionRequests, fakeWindow, stored, windowHandlers,
    get voice() { return fakeWindow.ArvicVoice; },
    get speechCancelCount() { return speechCancelCount; },
    changeVoices(newVoices) {
      availableVoices = newVoices;
      synthesisHandlers.voiceschanged?.();
    },
  };
}

test("Voice toolbar initializes without making backend or speech calls", () => {
  const h = mount();
  assert.equal(h.voice.getLanguage(), "english");
  assert.doesNotMatch(script, /id="aiVoiceLanguage"/);
  assert.match(script, /Automatic language detection/);
  assert.match(h.nodes.aiVoiceStatus.textContent, /Gemini mic ready|Browser voice recognition/i);
  assert.equal(h.recognitionInstances.length, 0);
  assert.equal(h.requests.length, 0);
});

test("Dictation records editable text but never automatically submits", () => {
  const h = mount();
  h.fire("aiMicBtn");
  assert.equal(h.recognitionInstances.length, 1);
  assert.equal(h.recognitionInstances[0].lang, "en-PH");
  assert.equal(h.recognitionInstances[0].continuous, true);
  h.recognitionInstances[0].say("How much for a cottage?");
  h.fire("aiMicBtn");
  assert.equal(h.nodes.aiChatInput.value, "How much for a cottage?");
  assert.equal(h.requests.length, 0);
  assert.match(h.nodes.aiVoiceStatus.textContent, /review\/edit/i);
});

test("Live mode sends recognized turn, speaks response, and listens again", async () => {
  const h = mount();
  h.fire("aiVoiceLive");
  assert.equal(h.recognitionInstances.length, 1);
  assert.equal(h.recognitionInstances[0].continuous, false);
  h.recognitionInstances[0].say("Need a room for five guests");
  h.recognitionInstances[0].stop();
  await h.settle();
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].opts.source, "voice");
  assert.equal(h.requests[0].message, "Need a room for five guests");
  assert.equal(h.speechUtterances.length, 1);
  // Recognition listens in en-PH; speech output defaults to en-US when
  // the browser has no installed voice to choose from.
  assert.equal(h.speechUtterances[0].lang, "en-US");
  assert.equal(h.voice.getState().mode, "live-speaking");
  h.speechUtterances[0].onend();
  h.runScheduled();
  assert.equal(h.recognitionInstances.length, 2);
  assert.equal(h.voice.getState().mode, "live-listening");
  h.fire("aiVoiceLive");
  assert.equal(h.voice.isLiveActive(), false);
});

test("Mandarin transcript produces Mandarin playback with the device fallback" , async () => {
  const h = mount({ savedLanguage: "mandarin",
    assistantReply: "您好！度假村有多种客房可供选择。" });
  h.fire("aiVoiceLive");
  assert.equal(h.recognitionInstances[0].lang, "zh-CN");
  h.recognitionInstances[0].say("我想预订一个房间");
  h.recognitionInstances[0].stop();
  await h.settle();
  assert.equal(h.speechUtterances[0].lang, "zh-CN");
  assert.equal(h.voice.getLanguage(), "mandarin");
});

test("Automatic language does not expose a selector or persist a chosen language", () => {
  const h = mount();
  assert.doesNotMatch(script, /<select id="aiVoiceLanguage"/);
  h.voice.setLanguage("spanish"); // internal TTS compatibility only
  assert.equal(h.voice.getLanguage(), "spanish");
  assert.equal(h.stored.get("smartresort_ai_voice_language_v1"), undefined);
  assert.equal(h.nodes.aiVoiceLanguage.listeners.change, undefined);
});

test("Interrupt stops ongoing TTS and accepts a new voice turn", async () => {
  const h = mount();
  h.fire("aiVoiceLive");
  h.recognitionInstances[0].say("What is the day rate?");
  h.recognitionInstances[0].stop();
  await h.settle();
  assert.equal(h.speechUtterances.length, 1);
  h.fire("aiVoiceInterrupt");
  assert.equal(h.recognitionInstances.length, 2);
  assert.equal(h.voice.getState().mode, "live-listening");
  const count = h.recognitionInstances.length;
  h.speechUtterances[0].onend();
  h.runScheduled();
  assert.equal(h.recognitionInstances.length, count);
});

test("Closing assistant cancels microphone and never sends stale recognized audio", async () => {
  const h = mount();
  h.fire("aiVoiceLive");
  h.recognitionInstances[0].say("Do not book");
  h.fire("aiChatClose");
  await h.settle();
  assert.equal(h.voice.isLiveActive(), false);
  assert.equal(h.requests.length, 0);
});

test("Permission denial ends live conversation without retry loop", () => {
  const h = mount();
  h.fire("aiVoiceLive");
  h.recognitionInstances[0].onerror({ error: "not-allowed" });
  h.recognitionInstances[0].stop();
  h.runScheduled();
  assert.equal(h.voice.isLiveActive(), false);
  assert.equal(h.requests.length, 0);
  assert.match(h.nodes.aiVoiceStatus.textContent, /Microphone error/i);
});

test("Unsupported speech browser keeps text chat available and disables voice", () => {
  const h = mount({ recognizerAvailable: false });
  assert.equal(h.nodes.aiVoiceLive.disabled, true);
  assert.equal(h.nodes.aiMicBtn.disabled, true);
  assert.match(h.nodes.aiVoiceStatus.textContent, /unavailable/i);
  assert.equal(h.requests.length, 0);
});

test("Native recognition and authenticated recording fallback never access payment routes", () => {
  // PCM audio is sent only to signed /ai/transcribe endpoint.
  assert.doesNotMatch(script, /\/api\/paypal|\/api\/bookings/);
  assert.match(script, /\/ai\/transcribe/);
  assert.match(script, /webkitSpeechRecognition/);
  assert.match(script, /SpeechSynthesisUtterance/);
  assert.match(script, /sessionStorage\.getItem\("customerToken"\)/);
  assert.match(script, /voiceApiBase\(\) \+ "\/ai\/voice"/);
  assert.match(script, /"Authorization": "Bearer " \+ token/);
  assert.match(script, /session !== state\.session/);
});

test("Customer pages load AI chat before interactive voice and include voice styles", () => {
  for (const page of ["index.html", "rooms.html"]) {
    const html = fs.readFileSync(path.resolve(
      __dirname, "../../frontend/customerHTML", page), "utf8");
    const chatIndex = html.indexOf('src="../js/ai-chat.js');
    const voiceIndex = html.indexOf('src="../js/ai-voice.js?v=20261126-ai99"');
    assert.ok(chatIndex > 0 && voiceIndex > chatIndex);
    assert.match(html, /sharedCSS\/ai-voice\.css/);
  }
});
test("Voice origin is marked without pinning a voice language", () => {
  const source = fs.readFileSync(path.resolve(
    __dirname, "../../frontend/js/ai-chat.js"), "utf8");
  assert.match(source, /options\.source === "voice"/);
  assert.match(source, /input_source: "voice"/);
  assert.doesNotMatch(source, /voice_language: window\.ArvicVoice/);
  assert.match(source, /aiMessageInFlight/);
  assert.match(source, /async function sendAiMessage/);
  assert.match(source, /return aiReply;/);
});


test("English prefers an available Natural/Neural voice over basic Google TTS", () => {
  const h = mount({ voices: [
    { name: "Microsoft Jenny Online (Natural)", lang: "en-US", voiceURI: "jenny" },
    { name: "Google US English", lang: "en-US", voiceURI: "google-us" },
    { name: "Standard English", lang: "en-PH", voiceURI: "base" },
  ] });
  h.voice.readAloud("Welcome to Arvic Seaside!");
  assert.equal(h.speechUtterances[0].voice.name, "Microsoft Jenny Online (Natural)");
  assert.match(h.nodes.aiVoiceInfo.textContent, /Microsoft Jenny Online \(Natural\)/);
  assert.equal(h.speechUtterances[0].rate, 0.98);
  assert.equal(h.requests.length, 0);
  assert.equal(h.cloudRequests.length, 0);
});

test("English retains Google US English when no enhanced voice exists", () => {
  const h = mount({ voices: [
    { name: "Standard English", lang: "en-PH", voiceURI: "base" },
    { name: "Google US English", lang: "en-US", voiceURI: "google-us" },
  ] });
  h.voice.readAloud("Welcome!");
  assert.equal(h.speechUtterances[0].voice.name, "Google US English");
});

test("Compact browser voice is identified in visible voice diagnostic", () => {
  const h = mount({ voices: [
    { name: "English (Compact)", lang: "en-US", voiceURI: "compact" },
  ] });
  h.voice.readAloud("Hello!");
  assert.match(h.nodes.aiVoiceInfo.textContent, /Compact.*basic\/compact/i);
});

test("Taglish prefers locally installed Microsoft Blessica without Azure credentials", async () => {
  const h = mount({ savedLanguage: "taglish", voices: [
    { name: "Microsoft Jenny Online (Natural)", lang: "en-US", voiceURI: "jenny" },
    { name: "Microsoft Blessica Online (Natural)", lang: "fil-PH", voiceURI: "blessica" },
    { name: "Other Filipino", lang: "fil-PH", voiceURI: "other" },
  ] });
  h.voice.readAloud("Hello po, welcome sa Arvic Seaside!");
  await h.settle(); // Cloud availability is asynchronous even without a token.
  assert.equal(h.cloudRequests.length, 0);
  assert.equal(h.speechUtterances[0].voice.name, "Microsoft Blessica Online (Natural)");
  assert.equal(h.speechUtterances[0].lang, "fil-PH");
});

test("Spanish and Mandarin keep appropriate browser default-language voices", () => {
  const h = mount({ savedLanguage: "spanish", voices: [
    { name: "Spanish Browser Voice", lang: "es-ES", voiceURI: "es" },
    { name: "Mandarin Browser Voice", lang: "zh-CN", voiceURI: "zh" },
    { name: "Google US English", lang: "en-US", voiceURI: "en" },
  ] });
  h.voice.readAloud("Hola");
  assert.equal(h.speechUtterances[0].voice.lang, "es-ES");
  h.voice.setLanguage("mandarin");
  h.voice.readAloud("你好");
  assert.equal(h.speechUtterances[1].voice.lang, "zh-CN");
});

test("Without Azure credentials, Taglish falls back to an available Filipino browser voice", async () => {
  const h = mount({ savedLanguage: "taglish", voices: [
    { name: "Built-in Filipino", lang: "fil-PH", voiceURI: "fil" },
  ] });
  h.voice.readAloud("Magandang araw po");
  await h.settle();
  assert.equal(h.cloudRequests.length, 0);
  assert.equal(h.speechUtterances[0].voice.name, "Built-in Filipino");
  assert.equal(h.requests.length, 0);
});

test("Unavailable Azure returns 503 and falls back to browser without retrying", async () => {
  const h = mount({ savedLanguage: "taglish", customerToken: "synthetic-test-token",
    cloudStatus: 503, voices: [{ name: "Built-in Filipino", lang: "fil-PH" }] });
  h.voice.readAloud("Kumusta po");
  await h.settle();
  assert.equal(h.cloudRequests.length, 1);
  assert.match(h.cloudRequests[0].url, /\/ai\/voice$/);
  assert.equal(h.cloudRequests[0].opts.method, "POST");
  assert.equal(h.cloudRequests[0].opts.headers.Authorization, "Bearer synthetic-test-token");
  assert.equal(h.speechUtterances[0].voice.name, "Built-in Filipino");
  h.voice.readAloud("Magandang araw");
  await h.settle();
  assert.equal(h.cloudRequests.length, 1, "Unavailable Azure should not be queried repeatedly");
  assert.equal(h.speechUtterances.length, 2);
});

test("Available Azure Blessica plays MP3 instead of browser TTS", async () => {
  const h = mount({ savedLanguage: "taglish", customerToken: "synthetic-test-token",
    cloudStatus: 200, voices: [{ name: "Built-in Filipino", lang: "fil-PH" }] });
  h.voice.readAloud("Welcome po!");
  await h.settle();
  assert.equal(h.cloudRequests.length, 1);
  assert.equal(h.cloudAudio.length, 1);
  assert.equal(h.cloudAudio[0].played, true);
  assert.equal(h.speechUtterances.length, 0, "Must not play browser voice alongside Azure");
  h.cloudAudio[0].onended();
  assert.equal(h.nodes.aiVoiceStatus.textContent, "Finished reading aloud.");
});

test("Voice picker is removed while language and live controls remain", () => {
  const h = mount();
  assert.equal(h.voice.getLanguage(), "english");
  assert.match(h.nodes.aiVoiceStatus.textContent, /Gemini mic ready|Browser voice recognition/i);
  assert.doesNotMatch(script, /aiVoiceChoice|aiVoicePreview|voiceChoice/);
  assert.doesNotMatch(script, /id="aiVoiceLanguage"/);
  assert.match(script, /Automatic language detection/);
  assert.match(script, /aiVoiceLive/);
  assert.equal(h.recognitionInstances.length, 0);
  assert.match(script, /id="aiVoiceInfo"/);
});

test("iOS Safari records PCM WAV and reviews transcript without auto-sending", async () => {
  const h = mount({ ios: true, audioAvailable: true, customerToken: "fake-customer-token" });
  h.fire("aiMicBtn"); await h.settle();
  assert.equal(h.recognitionInstances.length, 0);
  assert.equal(h.audioProcessors.length, 1);
  for (let n = 0; n < 3; n++) h.audioProcessors[0].feed(0.1);
  h.fire("aiMicBtn"); await h.settle();
  assert.equal(h.transcriptionRequests.length, 1);
  assert.equal(h.transcriptionRequests[0].opts.body.type, "audio/wav");
  assert.equal(h.transcriptionRequests[0].opts.headers.Authorization, "Bearer fake-customer-token");
  assert.equal(h.nodes.aiChatInput.value, "How do I book a room?");
  assert.equal(h.requests.length, 0);
});

test("iOS hands-free turn transcribes after silence and resumes listening", async () => {
  const h = mount({ ios: true, audioAvailable: true, customerToken: "fake-customer-token" });
  h.fire("aiVoiceLive"); await h.settle();
  for (let i = 0; i < 22; i++) h.audioProcessors[0].feed(0.1);
  for (let i = 0; i < 42; i++) h.audioProcessors[0].feed(0);
  await h.settle();
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].message, "How do I book a room?");
  h.speechUtterances[0].onend();
  h.runScheduled(); await h.settle();
  assert.equal(h.audioProcessors.length, 2);
  h.fire("aiVoiceLive");
});

test("Firefox-like browser without SpeechRecognition can use secure audio capture", async () => {
  const h = mount({ recognizerAvailable: false, audioAvailable: true,
    customerToken: "fake-customer-token" });
  assert.equal(h.nodes.aiMicBtn.disabled, false);
  assert.equal(h.nodes.aiVoiceLive.disabled, false);
  h.fire("aiMicBtn"); await h.settle();
  for (let n = 0; n < 3; n++) h.audioProcessors[0].feed(0.1);
  h.fire("aiMicBtn"); await h.settle();
  assert.equal(h.transcriptionRequests.length, 1);
});

test("iOS Safari chooses enhanced English voice instead of compact/default", () => {
  const h = mount({ ios: true, voices: [
    { name: "English (Compact)", lang: "en-US", voiceURI: "compact" },
    { name: "English Philippines", lang: "en-PH", voiceURI: "base" },
    { name: "Samantha (Enhanced)", lang: "en-US", voiceURI: "enhanced" },
  ] });
  h.voice.readAloud("Welcome to Arvic Seaside Resort!");
  assert.equal(h.speechUtterances[0].voice.name, "Samantha (Enhanced)");
  assert.equal(h.speechUtterances[0].lang, "en-US");
  assert.equal(h.speechUtterances[0].rate, 1);
  assert.equal(h.cloudRequests.length, 0);
});

test("Mobile English fallback uses en-US before speech voices load", () => {
  const h = mount({ ios: true, voices: [] });
  h.voice.readAloud("Welcome!");
  assert.equal(h.speechUtterances[0].lang, "en-US");
});

test("Taglish voice recognizes resort Pool Shade even if browser hears full shade", async () => {
  const h = mount({ savedLanguage: "taglish" });
  h.fire("aiVoiceLive");
  assert.equal(h.recognitionInstances[0].lang, "fil-PH");
  assert.equal(h.recognitionInstances[0].maxAlternatives, 3);
  h.recognitionInstances[0].say("Anong mga full shade meron kayo?");
  h.recognitionInstances[0].stop();
  await h.settle();
  assert.equal(h.requests[0].message, "Anong mga pool shade meron kayo?");
  assert.equal(h.requests.length, 1);
});

test("Taglish preview / premyo mishearing is corrected only in resort context", async () => {
  const h = mount({ savedLanguage: "taglish",
    recentTurns: [{role:"user",text:"Anong mga pool shade meron kayo?"}] });
  h.fire("aiVoiceLive");
  h.recognitionInstances[0].say("May premyo ka ba?");
  h.recognitionInstances[0].stop();
  await h.settle();
  assert.equal(h.requests[0].message, "May preview ka ba?");
  assert.equal(h.requests.length, 1);
});

test("A real prize request stays as premyo without accommodation context", async () => {
  const h = mount({ savedLanguage: "taglish" });
  h.fire("aiVoiceLive");
  h.recognitionInstances[0].say("May premyo ka ba?");
  h.recognitionInstances[0].stop();
  await h.settle();
  assert.equal(h.requests[0].message, "May premyo ka ba?");
});

test("Raffle premyo is never rewritten into preview even after a room discussion", async () => {
  const h = mount({ savedLanguage: "taglish",
    recentTurns: [{role:"user",text:"May family room kayo?"}] });
  h.fire("aiVoiceLive");
  h.recognitionInstances[0].say("May raffle premyo ka ba?");
  h.recognitionInstances[0].stop();
  await h.settle();
  assert.equal(h.requests[0].message, "May raffle premyo ka ba?");
});

test("Near-confidence browser recognition alternative can recover preview", async () => {
  const h = mount({ savedLanguage: "taglish",
    recentTurns: [{role:"user",text:"Anong mga pool shade meron kayo?"}] });
  h.fire("aiVoiceLive");
  h.recognitionInstances[0].say("May premyo ka ba?", true,
    [{transcript:"May preview ka ba?",confidence:0.8}]);
  h.recognitionInstances[0].stop();
  await h.settle();
  assert.equal(h.requests[0].message, "May preview ka ba?");
});

test("Dictation remains editable and never autosends corrected Taglish speech", () => {
  const h = mount({ savedLanguage: "taglish" });
  h.fire("aiMicBtn");
  h.recognitionInstances[0].say("Anong mga full shade meron kayo?");
  h.fire("aiMicBtn");
  assert.equal(h.nodes.aiChatInput.value, "Anong mga pool shade meron kayo?");
  assert.equal(h.requests.length, 0);
});

test("Recorded Gemini STT faithfully preserves a returned transcript without forced word substitutions", async () => {
  const h = mount({ ios:true,audioAvailable:true, customerToken:"test-token",
    savedLanguage:"taglish",recordedTranscript:"May premyo ka ba?",
    recentTurns:[{role:"user",text:"Anong mga pool shade meron kayo?"}] });
  h.fire("aiMicBtn");
  await h.settle();
  for (let i=0;i<3;i++) h.audioProcessors[0].feed(0.1);
  h.fire("aiMicBtn");
  await h.settle();
  assert.equal(h.nodes.aiChatInput.value, "May premyo ka ba?");
  assert.equal(h.transcriptionRequests[0].opts.headers["X-Arvic-Voice-Language"], "auto");
  assert.equal(h.requests.length, 0);
});

test("Mandarin voice speech stays untranslated and unmodified by Taglish terms", async () => {
  const h = mount({ savedLanguage:"mandarin",
    recentTurns:[{role:"user",text:"Pool Shade"}] });
  h.fire("aiVoiceLive");
  h.recognitionInstances[0].say("May premyo ka ba?");
  h.recognitionInstances[0].stop();
  await h.settle();
  assert.equal(h.requests[0].message, "May premyo ka ba?");
});

test("Full shade amenity question is not silently converted into Pool Shade", async () => {
  const h = mount({ savedLanguage:"taglish" });
  h.fire("aiVoiceLive");
  h.recognitionInstances[0].say("May full shade ba sa cottage?");
  h.recognitionInstances[0].stop();
  await h.settle();
  assert.equal(h.requests[0].message, "May full shade ba sa cottage?");
});

test("Taglish on a recording-capable Edge desktop defaults to accurate audio STT", async () => {
  const h = mount({ savedLanguage:"taglish", audioAvailable:true,
    customerToken:"fake-customer-token", recordedTranscript:"Anong ibang cottage ang meron kayo?" });
  assert.equal(h.voice.getState().inputMode,"accurate");
  assert.equal(h.nodes.aiVoiceInputMode.listeners.change, undefined);
  h.fire("aiVoiceLive"); await h.settle();
  assert.equal(h.recognitionInstances.length,0,"Gemini audio STT must replace browser STT in accurate mode");
  assert.equal(h.audioProcessors.length,1);
  for(let n=0;n<4;n++) h.audioProcessors[0].feed(0.1);
  for(let n=0;n<43;n++) h.audioProcessors[0].feed(0);
  await h.settle();
  assert.equal(h.transcriptionRequests.length,1);
  assert.equal(h.transcriptionRequests[0].opts.headers["X-Arvic-Voice-Language"],"auto");
  assert.equal(h.requests[0].message,"Anong ibang cottage ang meron kayo?");
  assert.equal(h.requests.length,1,"One utterance submits only one AI chat request");
});

test("General accurate transcription respects arbitrary words instead of dictionary substitutions", async () => {
  const h = mount({ savedLanguage:"taglish",audioAvailable:true,
    customerToken:"fake-customer-token",recordedTranscript:"Pwede po ba ang late checkout? May parking?" });
  h.fire("aiMicBtn"); await h.settle();
  for(let n=0;n<3;n++) h.audioProcessors[0].feed(0.1);
  h.fire("aiMicBtn"); await h.settle();
  assert.equal(h.nodes.aiChatInput.value,"Pwede po ba ang late checkout? May parking?");
  assert.equal(h.requests.length,0,"Dictation must be editable and not auto-send");
  assert.equal(h.transcriptionRequests.length,1);
});

test("Automatic language prioritizes multilingual Gemini recording over legacy fast mode", async () => {
  const h = mount({audioAvailable:true, customerToken:"fake-customer-token",
    recordedTranscript:"我想预订一个房间" });
  h.voice.setInputMode("fast");
  h.fire("aiVoiceLive"); await h.settle();
  assert.equal(h.recognitionInstances.length,0);
  for(let n=0;n<4;n++) h.audioProcessors[0].feed(0.1);
  for(let n=0;n<43;n++) h.audioProcessors[0].feed(0);
  await h.settle();
  assert.equal(h.transcriptionRequests.length,1);
  assert.equal(h.transcriptionRequests[0].opts.headers["X-Arvic-Voice-Language"],"auto");
  assert.equal(h.requests[0].message,"我想预订一个房间");
});

test("English can explicitly enable accurate audio transcription without forcing Taglish corrections", async () => {
  const h = mount({ savedLanguage:"english",audioAvailable:true,
    customerToken:"fake-customer-token",recordedTranscript:"What are the options for tomorrow?" });
  assert.equal(h.voice.getState().inputMode,"accurate");
  h.fire("aiMicBtn"); await h.settle();
  for(let n=0;n<3;n++) h.audioProcessors[0].feed(0.1);
  h.fire("aiMicBtn"); await h.settle();
  assert.equal(h.nodes.aiChatInput.value,"What are the options for tomorrow?");
  assert.equal(h.transcriptionRequests.length,1);
  assert.equal(h.requests.length,0);
});

test("A different spoken language never requires a UI language choice", () => {
  const h=mount({audioAvailable:true});
  assert.equal(h.voice.getState().inputMode,"accurate");
  assert.equal(h.nodes.aiVoiceLanguage.listeners.change,undefined);
  assert.doesNotMatch(script, /<select id="aiVoiceLanguage"/);
  assert.match(script, /X-Arvic-Voice-Language": "auto"/);
});

test("Changing input provider ends current hands-free session safely", () => {
  const h=mount({audioAvailable:true});
  h.fire("aiVoiceLive");
  assert.equal(h.voice.isLiveActive(),true);
  h.voice.setInputMode("accurate");
  assert.equal(h.voice.isLiveActive(),false);
  assert.equal(h.requests.length,0);
});

test("Existing alternate languages, transcript review, and cloud voice controls remain", () => {
  assert.match(script,/Automatic language detection/);
  assert.match(script,/X-Arvic-Voice-Language": "auto"/);
  assert.match(script,/autoGainControl: true/);
  assert.match(script,/elapsed - active.lastSpeech >= 1\.6/);
  assert.match(script,/const text = String\(body.transcript/);
  assert.match(script,/setInputMode/);
  assert.doesNotMatch(script,/\/api\/bookings|\/api\/paypal/);
});

test("Silent microphone does not spend credits or send transcription request", async () => {
  const h = mount({savedLanguage:"taglish",audioAvailable:true,customerToken:"test-token"});
  h.fire("aiMicBtn"); await h.settle();
  for(let n=0;n<8;n++) h.audioProcessors[0].feed(0);
  h.fire("aiMicBtn"); await h.settle();
  assert.equal(h.transcriptionRequests.length,0);
  assert.equal(h.requests.length,0);
  assert.match(h.nodes.aiVoiceStatus.textContent,/No speech detected/i);
});
