# 🎓 AI Study Helper for Coursera

A Chrome extension that helps you **understand course content better** — not bypass it.

Works with **any AI API of your choice** — Groq, OpenAI, Gemini, Grok, or Anthropic.

---

## Features

| Feature | How to use |
|---|---|
| 💡 **Explain** | Select any text on Coursera → click "Explain" in the popover |
| 🔍 **Hint** | Select a question → click "Hint" (Socratic guidance only — no direct answers) |
| 📋 **Summarize** | Open the chat panel → click 📋 to summarize the current lecture transcript |
| 💬 **Chat** | Click the 🎓 button → ask any course-related question |

---

## Step 1 — Choose Your AI API

Pick any provider below. **Groq is recommended** — completely free, no credit card, works worldwide.

---

### ✅ Groq — FREE (Recommended)
> Best option. Free forever, fast, works in all countries including India.

| | |
|---|---|
| **Free limit** | ~14,400 requests/day |
| **Credit card** | ❌ Not required |
| **Works in India** | ✅ Yes |
| **Key format** | `gsk_...` |

**How to get your key:**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with Google or email
3. Click **API Keys** in the left sidebar
4. Click **Create API Key** → copy it

---

### ✅ DeepSeek — FREE $5 Credit
> Very smart model (beats GPT-4 on benchmarks). $5 free credit on signup — lasts thousands of requests.

| | |
|---|---|
| **Free limit** | $5 one-time credit |
| **Credit card** | ❌ Not required for signup |
| **Works in India** | ✅ Yes |
| **Key format** | `sk-...` |

**How to get your key:**
1. Go to [platform.deepseek.com](https://platform.deepseek.com)
2. Sign up → go to **API Keys**
3. Click **Create API Key** → copy it

---

### ✅ OpenRouter — FREE (Some Models)
> Access many AI models in one place. Some models are completely free.

| | |
|---|---|
| **Free limit** | Varies by model |
| **Credit card** | ❌ Not required for free models |
| **Works in India** | ✅ Yes |
| **Key format** | `sk-or-...` |

**How to get your key:**
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up → click **Keys**
3. Click **Create Key** → copy it

---

### ⚠️ Google Gemini — FREE (Blocked in India)
> Free tier exists but does not work in India. Works fine in other countries.

| | |
|---|---|
| **Free limit** | 1,500 req/day (outside India) |
| **Credit card** | ❌ Not required |
| **Works in India** | ❌ No — free quota is set to 0 |
| **Key format** | `AIza...` |

**How to get your key:**
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with Google → click **Get API Key**
3. Click **Create API Key** → copy it

---

### ⚠️ OpenAI — PAID (Trial Credit Only)
> No ongoing free tier. New accounts get a small one-time trial credit.

| | |
|---|---|
| **Free limit** | Small trial credit only |
| **Credit card** | ✅ Required after trial |
| **Works in India** | ✅ Yes |
| **Key format** | `sk-...` |

**How to get your key:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up → go to **API Keys**
3. Click **Create new secret key** → copy it

---

### ⚠️ Grok (xAI) — LIMITED Free Tier
> Elon Musk's AI. Limited free access, mainly through X (Twitter) Premium.

| | |
|---|---|
| **Free limit** | Very limited |
| **Credit card** | Depends on plan |
| **Works in India** | ✅ Yes |
| **Key format** | `xai-...` |

**How to get your key:**
1. Go to [console.x.ai](https://console.x.ai)
2. Sign in with your X account
3. Go to **API Keys** → create one

---

### ⚠️ Anthropic (Claude) — PAID Only
> No free tier. Pay as you go.

| | |
|---|---|
| **Free limit** | ❌ None |
| **Credit card** | ✅ Required |
| **Works in India** | ✅ Yes |
| **Key format** | `sk-ant-...` |

**How to get your key:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up → go to **API Keys**
3. Click **Create Key** → copy it

---

## Step 2 — Install the Extension

1. Download or clone this repository
2. Open Chrome → go to `chrome://extensions`
3. Enable **Developer Mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `ai-study-helper` folder (the one containing `manifest.json`)

---

## Step 3 — Add Your API Key

1. Click the 🎓 extension icon in the Chrome toolbar
2. Paste your API key → click **Save**
3. Go to any Coursera course and refresh the page

---

## Project Structure

```
ai-study-helper/
├── manifest.json          ← Extension config (Manifest V3)
├── popup.html             ← Settings popup (API key entry)
├── popup.js               ← Popup logic
├── src/
│   ├── background.js      ← Service worker — all API calls
│   ├── content.js         ← Injected into Coursera pages
│   └── panel.css          ← Styles for injected UI
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## How It Works

```
User selects text / clicks button
        ↓
content.js captures the event
        ↓
Sends message to background.js
        ↓
background.js calls your chosen AI API
        ↓
Response returned to content.js
        ↓
UI updated with the result
```

Your API key is stored locally in `chrome.storage.local` — never sent anywhere except directly to your chosen AI provider.

---

## Ethical Design Principles

- ✅ The extension **never auto-fills** assignment answers
- ✅ **Hint Mode** enforces Socratic guidance — no direct answers
- ✅ All AI responses are clearly labelled as AI-generated
- ✅ Your API key stays **local** — stored only in your browser
- ✅ Open source — inspect every line of code

---

## Roadmap Ideas

- [ ] Dropdown in popup to select API provider
- [ ] Streamed responses for faster feel
- [ ] Support for multiple languages
- [ ] Flashcard generator from lecture notes
- [ ] Save summaries to a local notebook
- [ ] Dark mode support

---

## Contributing

Pull requests are welcome! If you find a bug or want to add a feature, feel free to open an issue or submit a PR.

---

## License

MIT — free to use, modify, and distribute. Just give credit. See [LICENSE](LICENSE) for details.