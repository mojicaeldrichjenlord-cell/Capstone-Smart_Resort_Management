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
      maximize.setAttribute("aria-label", expanded ? "Restore chat size" : "Maximize chat");
    }
  };
  syncWindow();
  new MutationObserver(syncWindow).observe(chat, {
    attributes: true, attributeFilter: ["class"]
  });

  close?.addEventListener("click", () => toggle.focus());

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
