import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Bot, AlertCircle } from "lucide-react"
import { api } from "../utils/api"

const SUGGESTIONS = [
  "Which product makes me the most profit?",
  "What should I restock urgently?",
  "How can I improve my profit margin?",
  "What was my best month?",
]

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

export default function AiChat({ stockInput, setStockInput, provider = "gemini" }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm your AI business advisor. Ask me anything about your sales data — I'll explain in plain English. You can also say \"add 100 units of Rice\" to update stock.",
  }])
  const [input,   setInput]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const bottomRef = useRef()

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
        <div className="flex gap-2 bg-white/[0.04] rounded-xl border border-white/[0.08] focus-within:border-[#f5c842]/30 transition-colors p-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            rows={2}
            placeholder='Ask anything... or "add 200 units of Rice"'
            className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/20 resize-none outline-none px-2 py-1"
          />
          <button onClick={() => handleSend()} disabled={!input.trim() || loading}
            className="w-9 h-9 bg-[#f5c842] hover:bg-[#e8b832] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors self-end">
            <Send size={14} className="text-black" />
          </button>
        </div>
        <p className="text-white/20 text-xs mt-1.5 px-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}