
(function () {
  if (window.__aiStudyHelperLoaded) return;
  window.__aiStudyHelperLoaded = true;

  function getCourseName() {
    const title = document.title.replace(/\s*\|\s*Coursera\s*$/, "").trim();
    return title || "this course";
  }

  function getLectureTranscript() {
    const selectors = [
      "[data-testid='transcript-item']",
      ".transcript-item",
      ".rc-Phrase",
      "[class*='phrase']",
      ".subtitle-item",
    ];
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        return Array.from(els).map((el) => el.textContent.trim()).join(" ");
      }
    }
    return null;
  }

  function sendToBackground(action, payload) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "GEMINI_REQUEST", action, payload },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response?.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.text);
          }
        }
      );
    });
  }

  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^#{1,3}\s+(.+)$/gm, "<strong>$1</strong>")
      .replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");
  }


  let popover = null;

  function createPopover() {
    const el = document.createElement("div");
    el.id = "ash-popover";
    el.innerHTML = `
      <div class="ash-popover-buttons">
        <button class="ash-btn ash-btn-explain" title="Explain this concept">
          <span>💡</span> Explain
        </button>
        <button class="ash-btn ash-btn-hint" title="Get a hint (won't give answers)">
          <span>🔍</span> Hint
        </button>
      </div>
      <div class="ash-popover-result" hidden>
        <div class="ash-result-header">
          <span class="ash-result-label"></span>
          <button class="ash-close-result">✕</button>
        </div>
        <div class="ash-result-body"></div>
      </div>
    `;
    document.body.appendChild(el);

    el.querySelector(".ash-btn-explain").addEventListener("click", () =>
      handlePopoverAction("explain", el)
    );
    el.querySelector(".ash-btn-hint").addEventListener("click", () =>
      handlePopoverAction("hint", el)
    );
    el.querySelector(".ash-close-result").addEventListener("click", () => {
      hidePopover();
    });

    return el;
  }

  function showPopover(x, y, selectedText) {
    if (!popover) popover = createPopover();

    popover.dataset.selectedText = selectedText;
    popover.querySelector(".ash-popover-buttons").hidden = false;
    popover.querySelector(".ash-popover-result").hidden = true;

    popover.style.left = `${Math.min(x, window.innerWidth - 220)}px`;
    popover.style.top = `${y + 8}px`;
    popover.classList.add("ash-visible");
  }

  function hidePopover() {
    if (popover) popover.classList.remove("ash-visible");
  }

  async function handlePopoverAction(action, el) {
    const text = el.dataset.selectedText;
    const buttons = el.querySelector(".ash-popover-buttons");
    const result = el.querySelector(".ash-popover-result");
    const label = el.querySelector(".ash-result-label");
    const body = el.querySelector(".ash-result-body");

    buttons.hidden = true;
    result.hidden = false;
    label.textContent = action === "explain" ? "💡 Explanation" : "🔍 Hint";
    body.innerHTML = `<span class="ash-loading">Thinking<span class="ash-dots"></span></span>`;

    try {
      const responseText = await sendToBackground(action, { text });
      body.innerHTML = `<p>${formatMarkdown(responseText)}</p>`;
    } catch (err) {
      const msg =
        err.message === "NO_API_KEY"
          ? "Please add your API key in the extension popup."
          : `Error: ${err.message}`;
      body.innerHTML = `<span class="ash-error">${msg}</span>`;
    }
  }

  document.addEventListener("mouseup", (e) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 10 && !popover?.contains(e.target)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      showPopover(
        rect.left + window.scrollX,
        rect.bottom + window.scrollY,
        text
      );
    } else if (!popover?.contains(e.target)) {
      hidePopover();
    }
  });


  let chatHistory = [];
  let isHintMode = false;
  let panelOpen = false;

  function createChatPanel() {
    const panel = document.createElement("div");
    panel.id = "ash-panel";
    panel.innerHTML = `
      <div class="ash-panel-header">
        <div class="ash-panel-title">
          <span class="ash-panel-icon">🎓</span>
          <span>Study Helper</span>
        </div>
        <div class="ash-panel-controls">
          <button class="ash-icon-btn ash-summarize-btn" title="Summarize this lecture">📋</button>
          <button class="ash-icon-btn ash-toggle-btn" title="Minimize">−</button>
        </div>
      </div>

      <div class="ash-panel-body">
        <div class="ash-hint-mode-bar">
          <label class="ash-toggle-label">
            <input type="checkbox" id="ash-hint-toggle" />
            <span class="ash-toggle-slider"></span>
            <span>Hint Mode <em>(no direct answers)</em></span>
          </label>
        </div>

        <div class="ash-messages" id="ash-messages">
          <div class="ash-welcome">
            <p>👋 Hi! I'm your study assistant for <strong id="ash-course-name"></strong>.</p>
            <p>Ask me anything about the course material. I'll help you <em>understand</em>, not just answer.</p>
          </div>
        </div>

        <div class="ash-input-row">
          <textarea
            id="ash-input"
            placeholder="Ask a question about the course..."
            rows="1"
          ></textarea>
          <button class="ash-send-btn" id="ash-send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    panel.querySelector("#ash-course-name").textContent = getCourseName();

    panel.querySelector(".ash-toggle-btn").addEventListener("click", () => {
      panelOpen = !panelOpen;
      panel.classList.toggle("ash-panel-collapsed", !panelOpen);
      panel.querySelector(".ash-toggle-btn").textContent = panelOpen ? "−" : "+";
    });

    panel.querySelector("#ash-hint-toggle").addEventListener("change", (e) => {
      isHintMode = e.target.checked;
      addSystemMessage(
        isHintMode
          ? "🔒 Hint Mode ON — I'll guide your thinking without giving direct answers."
          : "🔓 Hint Mode OFF — Ask me anything!"
      );
    });

    panel.querySelector(".ash-summarize-btn").addEventListener("click", () =>
      handleSummarize()
    );

    const input = panel.querySelector("#ash-input");
    const sendBtn = panel.querySelector("#ash-send");

    sendBtn.addEventListener("click", () => sendChatMessage(input));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage(input);
      }
    });

    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    });

    return panel;
  }

  function addMessage(role, text, isHtml = false) {
    const messagesEl = document.getElementById("ash-messages");
    const el = document.createElement("div");
    el.className = `ash-message ash-message-${role}`;

    const bubble = document.createElement("div");
    bubble.className = "ash-bubble";
    if (isHtml) {
      bubble.innerHTML = text;
    } else {
      bubble.innerHTML = `<p>${formatMarkdown(text)}</p>`;
    }

    el.appendChild(bubble);
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function addSystemMessage(text) {
    const messagesEl = document.getElementById("ash-messages");
    const el = document.createElement("div");
    el.className = "ash-system-message";
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function sendChatMessage(input) {
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    input.style.height = "auto";

    addMessage("user", text);
    chatHistory.push({ role: "user", content: text });

    const messagesPayload = isHintMode
      ? [
        ...chatHistory.slice(0, -1),
        {
          role: "user",
          content: `[HINT MODE: guide my thinking, never give direct answers]\n\n${text}`,
        },
      ]
      : chatHistory;

    const loadingEl = addMessage(
      "assistant",
      `<span class="ash-loading">Thinking<span class="ash-dots"></span></span>`,
      true
    );

    try {
      const responseText = await sendToBackground("chat", {
        courseName: getCourseName(),
        messages: messagesPayload,
      });

      chatHistory.push({ role: "assistant", content: responseText });
      loadingEl.querySelector(".ash-bubble").innerHTML = `<p>${formatMarkdown(responseText)}</p>`;
    } catch (err) {
      const msg =
        err.message === "NO_API_KEY"
          ? "⚠️ Please add your API key in the extension popup."
          : `⚠️ Error: ${err.message}`;
      loadingEl.querySelector(".ash-bubble").innerHTML = `<span class="ash-error">${msg}</span>`;
    }

    document.getElementById("ash-messages").scrollTop = 99999;
  }

  async function handleSummarize() {
    const transcript = getLectureTranscript();

    addSystemMessage("📋 Summarizing this lecture...");

    if (!transcript) {
      addSystemMessage(
        "⚠️ No transcript found. Make sure you're on a lecture page with subtitles/transcript visible."
      );
      return;
    }

    const chunk = transcript.slice(0, 6000);

    const loadingEl = addMessage(
      "assistant",
      `<span class="ash-loading">Reading transcript<span class="ash-dots"></span></span>`,
      true
    );

    try {
      const notes = await sendToBackground("summarize", { transcript: chunk });
      loadingEl.querySelector(".ash-bubble").innerHTML = `<p>${formatMarkdown(notes)}</p>`;
    } catch (err) {
      loadingEl.querySelector(".ash-bubble").innerHTML = `<span class="ash-error">Error: ${err.message}</span>`;
    }

    document.getElementById("ash-messages").scrollTop = 99999;
  }


  function createFAB() {
    const fab = document.createElement("button");
    fab.id = "ash-fab";
    fab.title = "AI Study Helper";
    fab.innerHTML = `🎓`;
    document.body.appendChild(fab);

    fab.addEventListener("click", () => {
      const panel = document.getElementById("ash-panel");
      panelOpen = !panelOpen;
      panel.classList.toggle("ash-panel-open", panelOpen);
      panel.classList.toggle("ash-panel-collapsed", !panelOpen);
      panel.querySelector(".ash-toggle-btn").textContent = "−";
      if (panelOpen) {
        document.getElementById("ash-input")?.focus();
      }
    });
  }


  createChatPanel();
  createFAB();
})();
