// Mount the same AI chat on other Customer pages. Home and Accommodations
// already contain the widget, so they remain unchanged by this script.
"use strict";
(function mountCustomerAiChat() {
  if (document.getElementById("aiChatWindow") || !document.body) return;
  const host = document.createElement("div");
  host.id = "arvicCustomerAiMount";
  // Static HTML only; no user text, database content or unsafe strings.
  // Fixed-position children do not change the Customer page layout.
  host.innerHTML = [
    '<button id="aiChatToggle" class="ai-chat-toggle" type="button" ',
    'aria-controls="aiChatWindow" aria-expanded="false">Ask AI Assistant</button>',
    '<section id="aiChatWindow" class="ai-chat-window" ',
    'role="dialog" aria-label="Arvic Seaside Resort AI Assistant">',
    '<div class="ai-chat-header"><h3>Arvic Seaside Resort AI Assistant</h3>',
    '<div class="ai-chat-header-actions">',
    '<button id="aiNewChatBtn" class="ai-chat-header-btn" ',
    'title="New Chat" aria-label="Start new chat" type="button">New</button>',
    '<button id="aiChatMaximize" class="ai-chat-header-btn" ',
    'title="Maximize" aria-label="Maximize chat" type="button">▢</button>',
    '<button id="aiChatClose" class="ai-chat-header-btn" ',
    'title="Close" aria-label="Close chat" type="button">&times;</button>',
    '</div></div>',
    '<div id="aiChatMessages" class="ai-chat-messages"></div>',
    '<div class="ai-chat-input-area">',
    '<input type="text" id="aiChatInput" ',
    'aria-label="Ask the resort assistant a question" ',
    'placeholder="Ask about rooms, rates, dates, or booking..." />',
    '<button id="aiMicBtn" class="ai-chat-mic-btn" type="button" ',
    'title="Voice input" aria-label="Voice input">🎤</button>',
    '<button id="aiSendBtn" class="ai-chat-send" type="button">Send</button>',
    '</div></section>'
  ].join("");
  document.body.appendChild(host);
})();
