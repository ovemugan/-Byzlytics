import { useState } from "react"
import { PackagePlus, ArrowRight } from "lucide-react"

const EXAMPLES = ["add 200 units of Rice", "restock 100 Pen Set", "received 150 Sugar"]

export default function StockInput({ onSend }) {
  const [value, setValue] = useState("")

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
        <div>
          <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>Quick Stock Update</p>
          <p className="text-white/30 text-xs">Type naturally — AI understands</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder='e.g. "add 200 units of Rice (5kg)"'
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#f5c842]/40 transition-colors"
        />
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
    </div>
  )
}
