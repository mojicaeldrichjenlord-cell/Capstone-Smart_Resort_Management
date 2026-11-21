"use strict";
/*
 * UI-42 public landing privacy regression.
 * Sandboxed browser storage only. Never calls Gemini, production DB, or PayPal.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
const chat = fs.readFileSync(path.join(root, "frontend/js/ai-chat.js"), "utf8");
const landing = fs.readFileSync(path.join(root, "frontend/customerHTML/landing.html"), "utf8");
const home = fs.readFileSync(path.join(root, "frontend/customerHTML/index.html"), "utf8");

function fragment(first, next) {
  const start = chat.indexOf(first), end = chat.indexOf(next, start);
  assert.ok(start >= 0 && end > start, "Missing browser script segment: " + first);
  return chat.slice(start, end);
}

const storageSource = [
  fragment("const AI_IS_PUBLIC_LANDING =", "// Verified official Facebook"),
  fragment("function getStoredAiContext()", "// Send only a few recent conversational messages."),
  fragment("function getStoredChatHistory()", "function clearChatMessagesUI()"),
  fragment("function clearAiConversation()", "function mergeContext("),
  fragment("function syncChatSizeButton(", "function speakText("),
].join("\n");

function browserEnvironment(surface, sharedStorage) {
  const values = sharedStorage || new Map();
  const mutations = [];
  const listeners = {};
  let reloads = 0;
  const elements = {
    aiChatInput: { value: "previous customer text" },
    aiSendBtn: { disabled: true, textContent: "Sending..." },
  };
  const classes = new Set();
  const popup = {
    classList: {
      contains(name) { return classes.has(name); },
      toggle(name, force) {
        const present = force === undefined ? !classes.has(name) : !!force;
        if (present) classes.add(name);
        else classes.delete(name);
        return present;
      },
    },
  };
  const button = {
    setAttribute() {},
    textContent: "",
    title: "",
  };
  elements.aiChatWindow = popup;
  elements.aiChatMaximize = button;
  const localStorage = {
    getItem(k) { return values.has(k) ? values.get(k) : null; },
    setItem(k, v) { mutations.push(["set", k]); values.set(k, String(v)); },
    removeItem(k) { mutations.push(["remove", k]); values.delete(k); },
  };
  const document = {
    body: { dataset: { aiChatSurface: surface } },
    getElementById(id) { return elements[id] || null; },
  };
  const window = {
    addEventListener(event, cb) { listeners[event] = cb; },
    location: { reload() { reloads++; } },
  };
  const source = [
    "let aiMessageInFlight = true;",
    "let aiFinalTranscript, aiShouldKeepListening, aiStoppedManually, aiSendAfterStop;",
    "let notes = [];",
    "function removeTypingIndicator() {}",
    "function restoreChatHistory() {}",
    "function appendAiSystemNote(text) { notes.push(text); }",
    storageSource,
    "({ getStoredAiContext, saveAiContext, getStoredChatHistory, saveChatHistory,",
    "   addToChatHistory, clearAiConversation, toggleMaximize, restoreWindowState,",
    "   publicGeneration: () => aiPublicChatGeneration,",
    "   messageInFlight: () => aiMessageInFlight, notes: () => notes });",
  ].join("\n");
  const controller = vm.runInNewContext(source, { document, window, localStorage });
  return {
    ...controller, values, mutations, listeners, elements, popup,
    get reloads() { return reloads; },
  };
}

test("UI-42 full chat script remains valid JavaScript and landing fetches fresh version", () => {
  assert.doesNotThrow(() => new vm.Script(chat));
  assert.match(landing, /data-ai-chat-surface="public"/);
  assert.match(landing, /js\/ai-chat\.js\?v=20261121-ai45/);
  assert.doesNotMatch(home, /data-ai-chat-surface="public"/);
});

test("UI-42 public landing deletes ONLY previously persisted public keys", () => {
  const old = new Map([
    ["arvic_public_ai_chat_history_v1", JSON.stringify([{ type: "message", text: "Old private chat" }])],
    ["arvic_public_ai_context_v1", JSON.stringify({ room_id: 97 })],
    ["arvic_public_ai_window_state_v1", "maximized"],
    ["smartresort_ai_chat_history_v1", JSON.stringify([{ type: "message", text: "Customer stays" }])],
    ["smartresort_ai_context_v1", JSON.stringify({ guests: 3 })],
    ["user", "existing account"],
  ]);
  const env = browserEnvironment("public", old);
  assert.equal(env.getStoredChatHistory().length, 0);
  assert.equal(Object.keys(env.getStoredAiContext()).length, 0);
  for (const key of ["arvic_public_ai_chat_history_v1",
                     "arvic_public_ai_context_v1",
                     "arvic_public_ai_window_state_v1"]) {
    assert.equal(old.has(key), false, key);
  }
  assert.equal(old.has("smartresort_ai_chat_history_v1"), true);
  assert.equal(old.has("smartresort_ai_context_v1"), true);
  assert.equal(old.get("user"), "existing account");
  assert.deepEqual(env.mutations.map(m => m[0]), ["remove", "remove", "remove"]);
});

test("UI-42 public chat persists through turns in one page, not reloads or another tab", () => {
  const shared = new Map();
  const first = browserEnvironment("public", shared);
  first.saveAiContext({ room_id: 97, guests: 7 });
  first.addToChatHistory({ type: "message", role: "user", text: "May pool?" });
  first.addToChatHistory({ type: "message", role: "assistant", text: "Yes po." });
  assert.equal(first.getStoredAiContext().room_id, 97);
  assert.equal(first.getStoredChatHistory().length, 2);
  // Two separate browser tabs sharing the same origin storage stay isolated.
  const second = browserEnvironment("public", shared);
  assert.equal(second.getStoredChatHistory().length, 0);
  assert.equal(Object.keys(second.getStoredAiContext()).length, 0);
  assert.equal(first.getStoredChatHistory().length, 2);
  // A reload replaces the JavaScript context and starts a blank chat.
  const reloaded = browserEnvironment("public", shared);
  assert.equal(reloaded.getStoredChatHistory().length, 0);
  assert.equal(reloaded.getStoredAiContext().room_id, undefined);
  assert.equal(shared.has("arvic_public_ai_chat_history_v1"), false);
  assert.equal(shared.has("arvic_public_ai_context_v1"), false);
  assert.equal(first.mutations.some(([op]) => op === "set"), false);
});

test("UI-42 public New Chat resets selected room and pending response generation", () => {
  const env = browserEnvironment("public", new Map());
  env.saveAiContext({ room_id: 98, room_name: "Double Room 2" });
  env.addToChatHistory({ type: "message", role: "user", text: "Private CR?" });
  const oldGeneration = env.publicGeneration();
  env.clearAiConversation();
  assert.equal(env.publicGeneration(), oldGeneration + 1);
  assert.equal(env.messageInFlight(), false);
  assert.equal(env.getStoredChatHistory().length, 0);
  assert.equal(env.getStoredAiContext().room_id, undefined);
  assert.equal(env.elements.aiChatInput.value, "");
  assert.equal(env.elements.aiSendBtn.disabled, false);
  assert.equal(env.elements.aiSendBtn.textContent, "Send");
  assert.match(chat, /requestGeneration !== aiPublicChatGeneration/);
  assert.doesNotMatch(env.notes().join(" "), /Private CR/);
});

test("UI-42 returning from browser back/forward cache reloads the landing page", () => {
  const env = browserEnvironment("public", new Map());
  assert.equal(typeof env.listeners.pageshow, "function");
  env.listeners.pageshow({ persisted: false });
  assert.equal(env.reloads, 0);
  env.listeners.pageshow({ persisted: true });
  assert.equal(env.reloads, 1);
});

test("UI-42 public chat size never persists, Customer Home chat remains persistent", () => {
  const local = new Map();
  const publicPage = browserEnvironment("public", local);
  publicPage.toggleMaximize();
  assert.equal(local.has("arvic_public_ai_window_state_v1"), false);
  publicPage.restoreWindowState();
  assert.equal(publicPage.popup.classList.contains("maximized"), false);

  const customer = browserEnvironment("", local);
  customer.saveAiContext({ room_id: 44 });
  customer.addToChatHistory({ type: "message", role: "user", text: "My booking" });
  customer.toggleMaximize();
  assert.equal(local.get("smartresort_ai_window_state_v1"), "maximized");
  const nextCustomerLoad = browserEnvironment("", local);
  assert.equal(nextCustomerLoad.getStoredAiContext().room_id, 44);
  assert.equal(nextCustomerLoad.getStoredChatHistory()[0].text, "My booking");
  nextCustomerLoad.restoreWindowState();
  assert.equal(nextCustomerLoad.popup.classList.contains("maximized"), true);
});
