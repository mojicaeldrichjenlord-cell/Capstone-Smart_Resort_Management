// Shared Customer chat presentation helpers. No Gemini, payment or voice
// processing changes. Load AFTER ai-voice.js on each Customer page.
"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const chat = document.getElementById("aiChatWindow");
  const toggle = document.getElementById("aiChatToggle");
  const close = document.getElementById("aiChatClose");
  const maximize = document.getElementById("aiChatMaximize");
  const panel = document.getElementById("aiVoicePanel");
  if (!chat || !toggle) return;

  chat.setAttribute("role", "dialog");
  chat.setAttribute("aria-label", "Arvic Seaside Resort AI Assistant");
  toggle.setAttribute("aria-controls", "aiChatWindow");

  // Covers the normal launcher AND programmatic opening from a selected
  // accommodation. Don't leave an extra floating launcher over the composer.
  const syncWindow = () => {
    const open = chat.classList.contains("show");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.hidden = open;
    if (maximize) {
      const expanded = chat.classList.contains("maximized");
      maximize.title = expanded ? "Restore size" : "Maximize";
      maximize.setAttribute("aria-label", expanded ? "Restore compact chat size" : "Maximize chat");
      maximize.setAttribute("aria-pressed", String(expanded));
    }
    const minimize = document.getElementById("aiChatMinimize");
    if (minimize) {
      const reduceOnPhone = window.matchMedia("(max-width: 560px)").matches &&
        chat.classList.contains("maximized");
      minimize.title = reduceOnPhone ? "Reduce to compact size" : "Minimize";
      minimize.setAttribute("aria-label",
        reduceOnPhone ? "Reduce chat to compact size" : "Minimize chat to launcher");
    }
  };
  syncWindow();
  new MutationObserver(syncWindow).observe(chat, {
    attributes: true, attributeFilter: ["class"]
  });

  close?.addEventListener("click", () => toggle.focus());

  // UI-30: On phones, Minimize reduces a maximized chat to compact first.
  // In compact mode (and on desktop), it hides the popup to the launcher.
  // Hiding the chat preserves conversation history/context; only then stop
  // an active microphone session to avoid invisible audio recording.
  const headerActions = chat.querySelector(".ai-chat-header-actions");
  if (headerActions && !document.getElementById("aiChatMinimize")) {
    const minimize = document.createElement("button");
    minimize.type = "button";
    minimize.id = "aiChatMinimize";
    minimize.className = "ai-chat-header-btn";
    minimize.textContent = "−";
    minimize.title = "Minimize";
    minimize.setAttribute("aria-label", "Minimize chat");
    headerActions.insertBefore(minimize, maximize || close);
    minimize.addEventListener("click", () => {
      // The square resize control already saves the preferred size.
      if (window.matchMedia("(max-width: 560px)").matches &&
          chat.classList.contains("maximized")) {
        toggleMaximize();
        return;
      }
      window.ArvicVoice?.stopConversation?.("");
      chat.classList.remove("show");
      toggle.focus();
    });
    syncWindow();
  }

  // Collapse ONLY the visual panel. The voice API, speech recognition,
  // voice language setting, interrupt and stop handlers are preserved.
  if (panel && !document.getElementById("aiVoiceOptionsToggle")) {
    const voiceToggle = document.createElement("button");
    voiceToggle.type = "button";
    voiceToggle.id = "aiVoiceOptionsToggle";
    voiceToggle.className = "ai-voice-options-toggle";
    voiceToggle.setAttribute("aria-controls", panel.id);
    voiceToggle.setAttribute("aria-expanded", "false");
    voiceToggle.textContent = "🎤 Voice options  ▾";
    panel.parentNode.insertBefore(voiceToggle, panel);
    panel.hidden = true;
    voiceToggle.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      const expanded = !panel.hidden;
      voiceToggle.setAttribute("aria-expanded", String(expanded));
      voiceToggle.textContent = expanded ? "🎤 Voice options  ▴" : "🎤 Voice options  ▾";
    });
  }

  // Reuse the existing Close handler (which stops live voice) on Escape.
  chat.addEventListener("keydown", event => {
    if (event.key === "Escape" && chat.classList.contains("show")) {
      event.preventDefault();
      close?.click();
    }
  });
});
