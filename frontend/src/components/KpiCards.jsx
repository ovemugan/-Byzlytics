import { TrendingUp, TrendingDown, DollarSign, ShoppingCart } from "lucide-react"
import { fmt } from "../utils/format"

function KpiCard({ label, value, sub, icon: Icon, accent, delay }) {
  return (
    <div className={`fade-up fade-up-${delay} bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] transition-colors`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-white/40 text-sm">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
          <Icon size={16} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-white text-3xl font-black mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>{value}</p>
      {sub && <p className="text-white/30 text-sm">{sub}</p>}
    </div>
  )
}

export default function KpiCards({ kpis }) {
  if (!kpis) return null
  const isProfit = kpis.total_profit >= 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Total Revenue"  value={fmt.short(kpis.total_revenue)} sub={fmt.currency(kpis.total_revenue)} icon={DollarSign}   accent="#f5c842" delay={1} />
      <KpiCard label="Total Cost"     value={fmt.short(kpis.total_cost)}    sub={fmt.currency(kpis.total_cost)}    icon={ShoppingCart}  accent="#6b7280" delay={2} />
      <KpiCard label="Net Profit"     value={fmt.short(kpis.total_profit)}  sub={fmt.currency(kpis.total_profit)}  icon={isProfit ? TrendingUp : TrendingDown} accent={isProfit ? "#22c55e" : "#ef4444"} delay={3} />
      <KpiCard label="Profit Margin"  value={fmt.percent(kpis.margin)}
        sub={kpis.margin >= 20 ? "Healthy margin ✓" : kpis.margin >= 10 ? "Moderate — room to grow" : "⚠ Below 10%"}
        icon={TrendingUp} accent={kpis.margin >= 20 ? "#22c55e" : "#f5c842"} delay={4} />
    </div>
  )
}
