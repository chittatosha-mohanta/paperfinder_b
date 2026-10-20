// ── Supported LLM Providers and Models ────────────────────────
export const LLM_PROVIDERS = [
  {
    id: "groq",
    name: "Groq (Ultra-Fast & Free)",
    badge: "Recommended",
    apiKeyPlaceholder: "gsk_...",
    docsUrl: "https://console.groq.com/keys",
    docsLabel: "Get free Groq API Key",
    models: [
      {
        id: "openai/gpt-oss-20b",
        name: "GPT-OSS 20B",
        version: "20B MoE",
        isFree: true,
        desc: "Ultra-fast (~1000 tok/sec), best for search clarify & quick chat"
      },
      {
        id: "openai/gpt-oss-120b",
        name: "GPT-OSS 120B",
        version: "120B Flagship",
        isFree: true,
        desc: "High intelligence, recommended for full IEEE paper generation"
      },
      {
        id: "qwen/qwen3.8-27b",
        name: "Qwen 3.8 27B",
        version: "27B Reasoning",
        isFree: true,
        desc: "Deep reasoning, literature synthesis & academic Q&A"
      },
      {
        id: "custom",
        name: "Custom Groq Model",
        version: "Manual Entry",
        isFree: false,
        desc: "Type any current or new model ID supported by Groq"
      }
    ]
  },
  {
    id: "gemini",
    name: "Google Gemini",
    badge: "Free Tier",
    apiKeyPlaceholder: "AIzaSy...",
    docsUrl: "https://aistudio.google.com/app/apikey",
    docsLabel: "Get free Gemini API Key",
    models: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        version: "Latest 2026",
        isFree: true,
        desc: "Next-gen multimodal, ultra-fast responses"
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        version: "1M Context",
        isFree: true,
        desc: "Large context window for long research papers"
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        version: "High Reasoning",
        isFree: false,
        desc: "Most capable for complex academic synthesis"
      },
      {
        id: "custom",
        name: "Custom Gemini Model",
        version: "Manual Entry",
        isFree: false,
        desc: "Type any model ID supported by Google AI"
      }
    ]
  },
  {
    id: "openai",
    name: "OpenAI",
    badge: "BYO Key",
    apiKeyPlaceholder: "sk-...",
    docsUrl: "https://platform.openai.com/api-keys",
    docsLabel: "Get OpenAI API Key",
    models: [
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        version: "Compact",
        isFree: false,
        desc: "Affordable and fast for daily research"
      },
      {
        id: "gpt-4o",
        name: "GPT-4o",
        version: "Omni Flagship",
        isFree: false,
        desc: "State-of-the-art reasoning and paper writing"
      },
      {
        id: "custom",
        name: "Custom OpenAI Model",
        version: "Manual Entry",
        isFree: false,
        desc: "Type any OpenAI model ID (e.g. o1, o3-mini)"
      }
    ]
  }
]

const STORAGE_KEY = "paperfinder_ai_settings"

export function getAISettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        provider: "groq",
        model: "openai/gpt-oss-20b",
        customModel: "",
        apiKey: ""
      }
    }
    return JSON.parse(raw)
  } catch {
    return {
      provider: "groq",
      model: "openai/gpt-oss-20b",
      customModel: "",
      apiKey: ""
    }
  }
}

export function saveAISettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (err) {
    console.error("Failed to save AI settings:", err)
  }
}

export function getEffectiveModel(settings) {
  if (settings.model === "custom" && settings.customModel?.trim()) {
    return settings.customModel.trim()
  }
  return settings.model || "openai/gpt-oss-20b"
}
