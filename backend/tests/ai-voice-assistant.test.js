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

function mount({ recognizerAvailable = true, savedLanguage = null } = {}) {
  const nodes = {};
  const recognitionInstances = [];
  const speechUtterances = [];
  const requests = [];
  const pendingTimers = new Map();
  const stored = new Map();
  const documentHandlers = {};
  const windowHandlers = {};
  let nextTimer = 0;
  let speechCancelCount = 0;
  if (savedLanguage) stored.set("smartresort_ai_voice_language_v1", savedLanguage);

  function element(id) {
    return nodes[id] ||= {
      id, value: "", textContent: "", disabled: false, hidden: false,
      title: "", innerHTML: "", listeners: {}, attrs: {},
      classList: { toggle() {} },
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
    say(text, isFinal = true) {
      const result = [{ transcript: text }];
      result.isFinal = isFinal;
      this.onresult({ resultIndex: 0, results: [result] });
    }
  }
  class FakeUtterance {
    constructor(text) { this.text = text; }
  }

  const fakeWindow = {
    addEventListener(name, handler) { windowHandlers[name] = handler; },
    speechSynthesis: {
      getVoices() { return []; },
      cancel() { speechCancelCount++; },
      speak(utterance) { speechUtterances.push(utterance); },
    },
    SpeechSynthesisUtterance: FakeUtterance,
    ...(recognizerAvailable ? { SpeechRecognition: FakeRecognizer } : {}),
  };
  const context = {
    window: fakeWindow,
    SpeechSynthesisUtterance: FakeUtterance,
    document: {
      getElementById(name) { return nodes[name] || null; },
      createElement() { return element("aiVoicePanel"); },
      addEventListener(name, handler) { documentHandlers[name] = handler; },
    },
    localStorage: {
      getItem(key) { return stored.get(key) ?? null; },
      setItem(key, value) { stored.set(key, value); },
    },
    console,
    sendAiMessage: async opts => {
      requests.push({ opts, message: nodes.aiChatInput.value });
      nodes.aiChatInput.value = "";
      return "Hello! Available accommodations can be checked.";
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
    requests, fakeWindow, stored, windowHandlers,
    get voice() { return fakeWindow.ArvicVoice; },
    get speechCancelCount() { return speechCancelCount; },
  };
}

test("Voice toolbar initializes without making backend or speech calls", () => {
  const h = mount();
  assert.equal(h.voice.getLanguage(), "english");
  assert.equal(h.nodes.aiVoiceLanguage.value, "english");
  assert.match(h.nodes.aiVoiceStatus.textContent, /dictate and review/i);
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
  assert.equal(h.speechUtterances[0].lang, "en-PH");
  assert.equal(h.voice.getState().mode, "live-speaking");
  h.speechUtterances[0].onend();
  h.runScheduled();
  assert.equal(h.recognitionInstances.length, 2);
  assert.equal(h.voice.getState().mode, "live-listening");
  h.fire("aiVoiceLive");
  assert.equal(h.voice.isLiveActive(), false);
});

test("Mandarin fixed voice selection applies to recognition and synthesized speech", async () => {
  const h = mount({ savedLanguage: "mandarin" });
  h.fire("aiVoiceLive");
  assert.equal(h.recognitionInstances[0].lang, "zh-CN");
  h.recognitionInstances[0].say("我想预订一个房间");
  h.recognitionInstances[0].stop();
  await h.settle();
  assert.equal(h.speechUtterances[0].lang, "zh-CN");
  assert.equal(h.voice.getLanguage(), "mandarin");
});

test("Changing voice language stops live session and keeps a future session fixed", () => {
  const h = mount();
  h.fire("aiVoiceLive");
  h.nodes.aiVoiceLanguage.value = "spanish";
  h.fire("aiVoiceLanguage", "change");
  assert.equal(h.voice.isLiveActive(), false);
  assert.equal(h.stored.get("smartresort_ai_voice_language_v1"), "spanish");
  h.fire("aiVoiceLive");
  assert.equal(h.recognitionInstances[1].lang, "es-ES");
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

test("Source keeps all audio local and does not use a paid voice service", () => {
  assert.doesNotMatch(script, /MediaRecorder|fetch\(|\/api\/paypal|\/api\/bookings/);
  assert.match(script, /webkitSpeechRecognition/);
  assert.match(script, /SpeechSynthesisUtterance/);
  assert.match(script, /session !== state\.session/);
});
