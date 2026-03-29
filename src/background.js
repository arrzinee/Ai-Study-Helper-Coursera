
const PROVIDERS = {
  gemini: {
    name: "Gemini",
    model: "gemini-2.0-flash",
    buildUrl: (apiKey) =>
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    buildHeaders: () => ({
      "Content-Type": "application/json",
    }),
    buildBody: (systemPrompt, messages) => ({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    }),
    extractText: (data) => data.candidates[0].content.parts[0].text,
  },

  openai: {
    name: "OpenAI",
    model: "gpt-4o-mini",
    buildUrl: () => "https://api.openai.com/v1/chat/completions",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (systemPrompt, messages) => ({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    }),
    extractText: (data) => data.choices[0].message.content,
  },

  groq: {
    name: "Groq",
    model: "llama-3.3-70b-versatile",
    buildUrl: () => "https://api.groq.com/openai/v1/chat/completions",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (systemPrompt, messages) => ({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    }),
    extractText: (data) => data.choices[0].message.content,
  },

  grok: {
    name: "Grok",
    model: "grok-3-mini-fast",
    buildUrl: () => "https://api.x.ai/v1/chat/completions",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (systemPrompt, messages) => ({
      model: "grok-3-mini-fast",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    }),
    extractText: (data) => data.choices[0].message.content,
  },
};


const SYSTEM_PROMPTS = {
  explain: `You are a friendly, patient tutor helping a student understand course content on Coursera.
Your job is to explain concepts clearly and simply — like you're talking to a smart friend who's new to the topic.
- Use plain language, short sentences, and concrete analogies.
- If relevant, give a quick real-world example.
- Keep responses concise (3–6 sentences unless more is needed).
- Never give assignment answers directly.`,

  hint: `You are a Socratic tutor helping a student think through a problem — NOT giving them the answer.
Your role is to guide their thinking with hints and questions.
Rules you MUST follow:
1. NEVER give the direct answer, even if asked repeatedly.
2. Ask 1–2 guiding questions that point them toward the answer.
3. Highlight which concept or principle is relevant without solving it.
4. Encourage them: "You're on the right track" if appropriate.
5. If they've already reasoned correctly, confirm and affirm.`,

  summarize: `You are a note-taking assistant for a student watching a Coursera lecture.
Given a transcript, produce clean, structured study notes:
- Start with a one-sentence "Big Idea" summary.
- List 4–8 key concepts or takeaways as bullet points.
- Highlight any definitions, formulas, or important terms in **bold**.
- End with a "Quick Recap" sentence.
Keep the notes scannable and student-friendly.`,

  chat: (courseName) => `You are a helpful study assistant for a student taking "${courseName}" on Coursera.
Your goal is to HELP THEM LEARN — not to do their work for them.
- Explain concepts clearly and simply.
- For assignment questions, give hints and guide thinking (never direct answers).
- Encourage curiosity and deeper understanding.
- Be warm, supportive, and concise.
- If you don't know something specific to the course, say so honestly.`,
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GEMINI_REQUEST") {
    handleAIRequest(request).then(sendResponse).catch((err) => {
      sendResponse({ error: err.message });
    });
    return true;
  }
});

async function handleAIRequest({ action, payload }) {
  const { apiKey, aiProvider } = await chrome.storage.local.get([
    "apiKey",
    "aiProvider",
  ]);

  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const providerKey = aiProvider || "gemini";
  const provider = PROVIDERS[providerKey];

  if (!provider) {
    throw new Error(`Unknown AI provider: ${providerKey}`);
  }

  let systemPrompt, userMessage, messages;

  switch (action) {
    case "explain":
      systemPrompt = SYSTEM_PROMPTS.explain;
      userMessage = `Please explain this concept from my Coursera course:\n\n"${payload.text}"`;
      messages = [{ role: "user", content: userMessage }];
      break;

    case "hint":
      systemPrompt = SYSTEM_PROMPTS.hint;
      userMessage = `I'm stuck on this question from my assignment:\n\n"${payload.text}"\n\nCan you give me a hint to guide my thinking?`;
      messages = [{ role: "user", content: userMessage }];
      break;

    case "summarize":
      systemPrompt = SYSTEM_PROMPTS.summarize;
      userMessage = `Please summarize this lecture transcript into study notes:\n\n${payload.transcript}`;
      messages = [{ role: "user", content: userMessage }];
      break;

    case "chat":
      systemPrompt = SYSTEM_PROMPTS.chat(payload.courseName || "this course");
      messages = payload.messages; // Full conversation history
      break;

    default:
      throw new Error("Unknown action");
  }

  const url = provider.buildUrl(apiKey);
  const headers = provider.buildHeaders(apiKey);
  const body = provider.buildBody(systemPrompt, messages);

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const errMsg =
      err?.error?.message || err?.message || `API error: ${response.status}`;
    throw new Error(errMsg);
  }

  const data = await response.json();
  return { text: provider.extractText(data) };
}
