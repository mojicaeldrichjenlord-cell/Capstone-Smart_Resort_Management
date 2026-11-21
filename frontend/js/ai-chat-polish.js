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
  const customerSurface = document.body.classList.contains("customer-manager-tone");

  // DM-07: Home/Rooms embed a branded header; other Customer pages mount a
  // simpler header dynamically. Give both the same compact, accessible face.
  if (customerSurface) {
    const header = chat.querySelector(".ai-chat-header");
    const actions = header?.querySelector(".ai-chat-header-actions");
    let brand = header?.querySelector(".ai-assistant-brand");
    if (header && actions && !brand) {
      const originalTitle = header.querySelector("h3");
      if (originalTitle) {
        brand = document.createElement("div");
        brand.className = "ai-assistant-brand";
        const mark = document.createElement("span");
        mark.className = "ai-assistant-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = "AI";
        const heading = document.createElement("div");
        heading.className = "ai-assistant-heading";
        const caption = document.createElement("span");
        caption.className = "ai-assistant-caption";
        caption.textContent = "Resort inquiries & bookings";
        heading.append(originalTitle, caption);
        brand.append(mark, heading);
        header.insertBefore(brand, actions);
      }
    }
    const title = brand?.querySelector("h3");
    if (title) title.textContent = "Arvic AI Assistant";
    const mark = brand?.querySelector(".ai-assistant-mark");
    if (mark) mark.textContent = "AI";
    const caption = brand?.querySelector(".ai-assistant-caption");
    if (caption) caption.textContent = "Resort inquiries & bookings";
    // DM-08: Inline SVGs match the three user-selected icons. They are local,
    // decorative only, and never replace the existing click handlers.
    const NEW_CHAT_ICON = [
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"',
      ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"',
      ' aria-hidden="true" focusable="false">',
      '<path d="M18 12.5v4A3 3 0 0 1 15 19H8l-4 3v-3.7a3 3 0 0 1-2-2.8V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v1"/>',
      '<path d="m12.8 14.5 6.5-6.5a1.6 1.6 0 0 1 2.3 2.3l-6.5 6.5-3.2.8z"/>',
      '</svg>'
    ].join("");
    const newChat = document.getElementById("aiNewChatBtn");
    if (newChat) {
      newChat.innerHTML = NEW_CHAT_ICON;
      newChat.classList.add("ai-chat-icon-btn");
      newChat.title = "New chat";
      newChat.setAttribute("aria-label", "Start new chat");
    }
  }

  chat.setAttribute("role", "dialog");
  chat.setAttribute("aria-label", "Arvic Seaside Resort AI Assistant");
  toggle.setAttribute("aria-controls", "aiChatWindow");

  // Covers the normal launcher AND programmatic opening from a selected
  // accommodation. Don't leave an extra floating launcher over the composer.
  const syncWindow = () => {
    const open = chat.classList.contains("show");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.hidden = open;
    if (!open && customerSurface) {
      const voicePanel = document.getElementById("aiVoicePanel");
      const voiceButton = document.getElementById("aiVoiceOptionsToggle");
      if (voicePanel) voicePanel.hidden = true;
      voiceButton?.setAttribute("aria-expanded", "false");
    }
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
    voiceToggle.title = customerSurface ? "Transcription and voice options" : "Voice settings";
    voiceToggle.setAttribute("aria-label", voiceToggle.title);
    const composer = chat.querySelector(".ai-chat-input-area");
    const microphone = document.getElementById("aiMicBtn");
    if (customerSurface && composer && microphone) {
      // Keep voice configuration by the microphone, not as an always-visible
      // full-width strip. The original live voice controls remain untouched.
      voiceToggle.innerHTML = [
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"',
        ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"',
        ' aria-hidden="true" focusable="false">',
        '<path d="M13.5 2.5H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/>',
        '<path d="M13.5 2.5V7H18M7 11h6M7 14h4"/>',
        '<path d="M12.5 17h1.8l2-1.5v5l-2-1.5h-1.8z"/>',
        '<path d="M18 16.4a2 2 0 0 1 0 2.1M19.8 14.9a4.3 4.3 0 0 1 0 5"/>',
        '</svg>'
      ].join("");
      voiceToggle.classList.add("ai-chat-icon-btn");
      composer.insertBefore(voiceToggle, microphone);
    } else {
      // Keep the original non-Customer widget presentation unchanged.
      voiceToggle.textContent = "Voice options  ▾";
      panel.parentNode.insertBefore(voiceToggle, panel);
    }
    panel.hidden = true;
    voiceToggle.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      const expanded = !panel.hidden;
      voiceToggle.setAttribute("aria-expanded", String(expanded));
      if (!customerSurface) {
        voiceToggle.textContent = expanded ? "Voice options  ▴" : "Voice options  ▾";
      }
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
