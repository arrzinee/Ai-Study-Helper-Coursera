# 🎓 AI Study Helper for Coursera

A Chrome extension that helps you **understand course content better** — not bypass it.

Powered by [Claude](https://anthropic.com) (claude-sonnet-4).

---

## Features

| Feature | How to use |
|---|---|
| 💡 **Explain** | Select any text on Coursera → click "Explain" in the popover |
| 🔍 **Hint** | Select a question → click "Hint" (Socratic guidance only — no direct answers) |
| 📋 **Summarize** | Open the chat panel → click 📋 to summarize the current lecture transcript |
| 💬 **Chat** | Click the 🎓 button → ask any course-related question |

---

## Setup

### 1. Get an Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and generate an API key (`sk-ant-...`)

### 2. Load the Extension in Chrome
1. Open Chrome → go to `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `ai-study-helper` folder

### 3. Add Your API Key
1. Click the extension icon in the toolbar
2. Paste your Anthropic API key → click **Save**
3. Navigate to any Coursera course and refresh the page

---

## Project Structure

```
ai-study-helper/
├── manifest.json          ← Extension config (Manifest V3)
├── popup.html             ← Settings popup (API key entry)
├── popup.js               ← Popup logic
├── src/
│   ├── background.js      ← Service worker — all Claude API calls
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
Sends message to background.js (chrome.runtime.sendMessage)
        ↓
background.js calls Claude API (api.anthropic.com)
        ↓
Response streamed back to content.js
        ↓
UI updated with the result
```

All API calls go through `background.js` to avoid CORS restrictions.  
Your API key is stored locally in `chrome.storage.local` — never sent anywhere except directly to Anthropic.

---

## Icons

You need to add icon files at:
- `icons/icon16.png` (16×16)
- `icons/icon48.png` (48×48)
- `icons/icon128.png` (128×128)

You can use any 🎓 emoji rendered to PNG, or design your own.

---

## Ethical Design Principles

- ✅ The extension **never auto-fills** assignment answers
- ✅ **Hint Mode** is available to enforce Socratic guidance only
- ✅ All AI responses are clearly **labelled as AI-generated**
- ✅ Your API key stays **local** — stored only in your browser

---

## Roadmap Ideas

- [ ] Streamed responses for faster feel
- [ ] Support for multiple languages (auto-detect from course)
- [ ] Flashcard generator from lecture notes
- [ ] Save summaries to a local notebook
- [ ] Dark mode support
