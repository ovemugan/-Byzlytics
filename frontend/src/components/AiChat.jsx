import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Sparkles, Bot, AlertCircle, Mic, MicOff } from "lucide-react"
import { api } from "./api"

const SUGGESTIONS = [
  "Which product makes me the most profit?",
  "What should I restock urgently?",
  "How can I improve my profit margin?",
  "What was my best month?",
]

// ─── Voice Hook ───────────────────────────────────────────────────────────────
function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = "en-IN" // Indian English

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
          .join("")
        onResult(transcript, event.results[event.results.length - 1].isFinal)
      }

      recognition.onend = () => setListening(false)
      recognition.onerror = () => setListening(false)

      recognitionRef.current = recognition
    }
  }, [onResult])

  const toggle = useCallback(() => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      recognitionRef.current.start()
      setListening(true)
    }
  }, [listening])

  return { listening, supported, toggle }
}

// ─── Components ───────────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === "user"
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-[#f5c842]/10 flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={14} className="text-[#f5c842]" />
        </div>
      )}
      <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? "bg-[#f5c842]/10 border border-[#f5c842]/20 text-white rounded-tr-sm"
          : "bg-white/[0.04] text-white/80 border border-white/[0.06] rounded-tl-sm"
        }`}>
        {msg.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-[#f5c842]/10 flex items-center justify-center shrink-0">
        <Bot size={14} className="text-[#f5c842]" />
      </div>
      <div className="bg-white/[0.04] border border-white/[0.06] px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
        {[0,1,2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Voice Button ─────────────────────────────────────────────────────────────
function VoiceButton({ listening, supported, onToggle }) {
  if (!supported) return null
  return (
    <button
      onClick={onToggle}
      title={listening ? "Stop listening" : "Voice input"}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all self-end ${
        listening
          ? "bg-red-500 hover:bg-red-400 animate-pulse"
          : "bg-white/10 hover:bg-white/20"
      }`}
    >
      {listening
        ? <MicOff size={14} className="text-white" />
        : <Mic size={14} className="text-white/60" />
      }
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AiChat({ stockInput, setStockInput, provider = "gemini" }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your AI business advisor. Ask me anything about your sales data — I'll explain in plain English. You can also say \"add 100 units of Rice\" to update stock.",
  }])
  const [input,   setInput]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const bottomRef = useRef()

  // Voice callback - update input as user speaks
  const handleVoiceResult = useCallback((transcript, isFinal) => {
    setInput(transcript)
    if (isFinal && transcript.trim()) {
      // Auto-send on final result after brief delay
      setTimeout(() => {
        handleSend(transcript)
        setInput("")
      }, 300)
    }
  }, [])

  const { listening, supported, toggle: toggleVoice } = useVoiceInput(handleVoiceResult)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])

  useEffect(() => {
    if (stockInput) { handleSend(stockInput); setStockInput("") }
  }, [stockInput])

  async function handleSend(text) {
    const message = (text || input).trim()
    if (!message) return

    setMessages(prev => [...prev, { role: "user", content: message }])
    setInput("")
    setLoading(true)
    setError(null)

    try {
      const isStock = /\b(add|restock|received|got)\b.*\d+/i.test(message)

      let reply
      if (isStock) {
        const res = await api.addStock(message)
        reply = res.message
      } else {
        const res = await api.chat(message, provider)
        reply = res.reply
      }

      setMessages(prev => [...prev, { role: "assistant", content: reply }])
    } catch (err) {
      const errorMsg = err.message || "Failed to get response"
      setError(errorMsg)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorMsg.includes("API key")
          ? "⚠️ Please add your API key in Settings first to use this feature."
          : `Sorry, I had trouble: ${errorMsg}`,
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl flex flex-col" style={{ height: 520 }}>
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-9 h-9 bg-[#f5c842]/10 rounded-xl flex items-center justify-center">
          <Sparkles size={16} className="text-[#f5c842]" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            {provider === "groq" ? "⚡ Groq" : "🔵 Gemini"}
          </p>
          <p className="text-white/30 text-xs">
            {provider === "groq"
              ? "Ultra-fast AI · Lightning quick responses"
              : "Google AI · Creative & detailed"
            }
          </p>
        </div>
        {supported && (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${
            listening ? "bg-red-500/20 text-red-400" : "text-white/30"
          }`}>
            {listening && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
            {listening ? "Listening..." : "Voice ready"}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-5 py-3 bg-red-500/10 border-t border-red-500/20 flex gap-2 items-start">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {messages.length < 3 && (
        <div className="px-5 pb-3 flex gap-2 flex-wrap">
          {SUGGESTIONS.slice(0, 3).map(s => (
            <button key={s} onClick={() => handleSend(s)}
              className="text-xs bg-white/[0.03] border border-white/[0.06] text-white/40 px-3 py-1.5 rounded-full hover:bg-[#f5c842]/5 hover:border-[#f5c842]/20 hover:text-[#f5c842]/70 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pb-4">
        <div className={`flex gap-2 bg-white/[0.04] rounded-xl border transition-colors p-2 ${
          listening ? "border-red-400/40" : "border-white/[0.08] focus-within:border-[#f5c842]/30"
        }`}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            rows={2}
            placeholder={listening ? "🎤 Listening... speak now" : 'Ask anything... or "add 200 units of Rice"'}
            className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/20 resize-none outline-none px-2 py-1"
          />
          <div className="flex flex-col gap-1 self-end">
            <VoiceButton listening={listening} supported={supported} onToggle={toggleVoice} />
            <button onClick={() => handleSend()} disabled={!input.trim() || loading}
              className="w-9 h-9 bg-[#f5c842] hover:bg-[#e8b832] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors">
              <Send size={14} className="text-black" />
            </button>
          </div>
        </div>
        <p className="text-white/20 text-xs mt-1.5 px-2">
          Enter to send · Shift+Enter for new line{supported ? " · 🎤 mic for voice" : ""}
        </p>
      </div>
    </div>
  )
}