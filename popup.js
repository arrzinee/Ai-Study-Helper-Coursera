// ─── AI Study Helper — Popup Script ─────────────────────────────────────────

const input = document.getElementById("apiKeyInput");
const saveBtn = document.getElementById("saveBtn");
const status = document.getElementById("status");
const providerSelect = document.getElementById("providerSelect");
const providerBadge = document.getElementById("providerBadge");
const apiKeyLabel = document.getElementById("apiKeyLabel");
const footerHelp = document.getElementById("footerHelp");

// Provider-specific config for the popup UI
const PROVIDER_INFO = {
  gemini: {
    label: "Gemini AI Studio API Key",
    placeholder: "AIza...",
    badge: "✦ Gemini",
    footer: 'Get your free API key at <a href="https://aistudio.google.com" target="_blank">aistudio.google.com</a>',
    keyHint: "Gemini",
  },
  openai: {
    label: "OpenAI API Key",
    placeholder: "sk-...",
    badge: "✦ OpenAI",
    footer: 'Get your API key at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>',
    keyHint: "OpenAI",
  },
  groq: {
    label: "Groq API Key",
    placeholder: "gsk_...",
    badge: "✦ Groq",
    footer: 'Get your free API key at <a href="https://console.groq.com/keys" target="_blank">console.groq.com</a>',
    keyHint: "Groq",
  },
  grok: {
    label: "xAI (Grok) API Key",
    placeholder: "xai-...",
    badge: "✦ Grok",
    footer: 'Get your API key at <a href="https://console.x.ai" target="_blank">console.x.ai</a>',
    keyHint: "Grok",
  },
};

// Update UI based on selected provider
function updateProviderUI(provider) {
  const info = PROVIDER_INFO[provider];
  apiKeyLabel.textContent = info.label;
  input.placeholder = info.placeholder;
  providerBadge.textContent = info.badge;
  footerHelp.innerHTML = info.footer;
}

// Load saved settings on open
chrome.storage.local.get(["apiKey", "aiProvider"], ({ apiKey, aiProvider }) => {
  const provider = aiProvider || "gemini";
  providerSelect.value = provider;
  updateProviderUI(provider);

  if (apiKey) {
    input.value = apiKey;
    setStatus("✓ API key saved", "success");
  }
});

// When provider changes, update UI and clear key
providerSelect.addEventListener("change", () => {
  const provider = providerSelect.value;
  updateProviderUI(provider);
  input.value = "";
  setStatus("", "");
});

saveBtn.addEventListener("click", () => {
  const key = input.value.trim();
  const provider = providerSelect.value;
  const info = PROVIDER_INFO[provider];

  if (!key) {
    setStatus("Please enter your API key.", "error");
    return;
  }

  if (key.length < 20) {
    setStatus(`That doesn't look like a valid ${info.keyHint} key.`, "error");
    return;
  }

  chrome.storage.local.set({ apiKey: key, aiProvider: provider }, () => {
    setStatus(`✓ Saved! Using ${info.keyHint}. Refresh Coursera to activate.`, "success");
  });
});

function setStatus(msg, type = "") {
  status.textContent = msg;
  status.className = `status ${type}`;
}
