import { useState, useRef, useEffect, useCallback } from "react"
import { PackagePlus, ArrowRight, Mic, MicOff } from "lucide-react"

const EXAMPLES = ["add 200 units of Rice", "restock 100 Pen Set", "received 150 Sugar"]

// ─── Reusable voice hook ──────────────────────────────────────────────────────
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
      recognition.lang = "en-IN"

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

export default function StockInput({ onSend }) {
  const [value, setValue] = useState("")
  const [autoSent, setAutoSent] = useState(false)

  const handleVoiceResult = useCallback((transcript, isFinal) => {
    setValue(transcript)
    if (isFinal && transcript.trim() && !autoSent) {
      setAutoSent(true)
      setTimeout(() => {
        onSend(transcript.trim())
        setValue("")
        setAutoSent(false)
      }, 400)
    }
  }, [onSend, autoSent])

  const { listening, supported, toggle: toggleVoice } = useVoiceInput(handleVoiceResult)

  function handleSubmit() {
    const v = value.trim()
    if (!v) return
    onSend(v)
    setValue("")
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-green-400/10 rounded-xl flex items-center justify-center">
          <PackagePlus size={16} className="text-green-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>Quick Stock Update</p>
          <p className="text-white/30 text-xs">Type or speak naturally — AI understands</p>
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

      <div className={`flex gap-2 rounded-xl border transition-colors ${
        listening ? "border-red-400/40 bg-red-400/5" : "border-transparent"
      }`}>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder={listening ? "🎤 Listening... speak now" : 'e.g. "add 200 units of Rice (5kg)"'}
          className={`flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#f5c842]/40 transition-colors ${
            listening ? "border-red-400/30" : ""
          }`}
        />

        {/* Voice button */}
        {supported && (
          <button
            onClick={toggleVoice}
            title={listening ? "Stop listening" : "Voice input"}
            className={`px-3 py-2.5 rounded-xl flex items-center justify-center transition-all ${
              listening
                ? "bg-red-500 hover:bg-red-400 animate-pulse"
                : "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]"
            }`}
          >
            {listening
              ? <MicOff size={15} className="text-white" />
              : <Mic size={15} className="text-white/50" />
            }
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-colors"
        >
          Update <ArrowRight size={14} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mt-3">
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => setValue(ex)}
            className="text-xs bg-white/[0.03] border border-white/[0.06] text-white/40 px-3 py-1.5 rounded-full hover:bg-[#f5c842]/5 hover:border-[#f5c842]/20 hover:text-[#f5c842]/70 transition-colors">
            {ex}
          </button>
        ))}
      </div>

      {supported && (
        <p className="text-white/20 text-xs mt-3">
          🎤 Tap mic and say "add 100 units of Sugar" — it auto-sends when you stop speaking
        </p>
      )}
    </div>
  )
}