import { useState, useEffect } from "react"
import { Key, Eye, EyeOff, Check, AlertCircle, Loader } from "lucide-react"
import { api } from "../utils/api"

const PROVIDER_INFO = {
  gemini: {
    name: "Google Gemini",
    color: "#4285F4",
    icon: "🔵",
    desc: "Fast, creative responses. Great for brainstorming.",
    getUrl: "https://aistudio.google.com/app/apikey",
    guide: "/guides/gemini-setup",
  },
  groq: {
    name: "Groq",
    color: "#FF6B35",
    icon: "⚡",
    desc: "Ultra-fast inference. Perfect for quick decisions.",
    getUrl: "https://console.groq.com/keys",
    guide: "/guides/groq-setup",
  },
}

function ApiKeyInput({ provider, hasKey, onSave }) {
  const [show, setShow] = useState(false)
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const info = PROVIDER_INFO[provider]

  async function handleSave() {
    if (!value.trim()) {
      setError("API key cannot be empty")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      await onSave(provider, value)
      setSuccess(true)
      setValue("")
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{info.icon}</span>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{info.name}</h3>
          <p className="text-white/40 text-sm">{info.desc}</p>
        </div>
        {hasKey && <Check size={20} className="text-green-400" />}
      </div>

      {hasKey && !value && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
          <Check size={16} className="text-green-400" />
          <span className="text-sm text-green-400">API key is configured</span>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="sk-..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors text-sm"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 text-white/40 hover:text-white/70 transition-colors"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!value.trim() || loading}
          className="bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
          Save
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 mb-3">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex gap-2 mb-3">
          <Check size={16} className="text-green-400 shrink-0 mt-0.5" />
          <span className="text-sm text-green-400">API key saved successfully!</span>
        </div>
      )}

      <div className="flex gap-2">
        <a
          href={info.getUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm rounded-lg transition-colors text-center"
        >
          Get API Key →
        </a>
        <a
          href={info.guide}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm rounded-lg transition-colors text-center"
        >
          Step-by-Step Guide →
        </a>
      </div>
    </div>
  )
}

export default function Settings({ onClose }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const data = await api.getProfile()
      setProfile(data)
    } catch (e) {
      console.error("Failed to load profile:", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveApiKey(provider, apiKey) {
    await api.updateApiKey(provider, apiKey)
    await loadProfile()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[#0d0d0f] border border-white/10 rounded-2xl p-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0d0d0f] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d0f]/95 border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Key size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">AI Provider Settings</h2>
              <p className="text-white/40 text-sm">Add your API keys to use AI features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {profile && (
            <div className="grid grid-cols-1 gap-6">
              <ApiKeyInput
                provider="gemini"
                hasKey={profile.has_gemini_key}
                onSave={handleSaveApiKey}
              />
              <ApiKeyInput
                provider="groq"
                hasKey={profile.has_groq_key}
                onSave={handleSaveApiKey}
              />
            </div>
          )}

          {/* Info section */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-white font-bold text-lg mb-4">How it works</h3>
            <div className="space-y-3 text-sm text-white/60">
              <p>✓ Your API keys are stored securely in your account</p>
              <p>✓ Add multiple providers to switch between them anytime</p>
              <p>✓ Each provider has different speeds and capabilities</p>
              <p>✓ Start with your free tier — upgrade when you need more</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}