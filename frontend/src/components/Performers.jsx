import { Trophy, TrendingDown } from "lucide-react"
import { fmt } from "../utils/format"

export default function Performers({ top, bottom }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-green-400/10 rounded-xl flex items-center justify-center">
            <Trophy size={16} className="text-green-400" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>Top Performers</p>
            <p className="text-white/30 text-xs">Most profitable products</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {top.map((item, i) => (
            <div key={item.product} className="flex items-center gap-3">
              <span className="font-mono text-xs text-white/20 w-5 text-center">#{i+1}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-white/70">{item.product}</span>
                  <span className="font-mono text-sm text-green-400">{fmt.short(item.profit)}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: `${Math.min(100, (item.profit / top[0].profit) * 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-red-400/10 rounded-xl flex items-center justify-center">
            <TrendingDown size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>Needs Attention</p>
            <p className="text-white/30 text-xs">Lowest profit products</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {bottom.map((item, i) => (
            <div key={item.product} className="flex items-center gap-3">
              <span className="font-mono text-xs text-white/20 w-5 text-center">#{i+1}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-white/70">{item.product}</span>
                  <span className="font-mono text-sm text-red-400">{fmt.short(item.profit)}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(100, (item.profit / (top[0]?.profit || 1)) * 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
