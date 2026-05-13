import { Package, AlertTriangle, XCircle, CheckCircle } from "lucide-react"
import { stockStatusLabel, fmt } from "../utils/format"

const icons = {
  good:         <CheckCircle  size={14} className="text-green-400" />,
  medium:       <Package      size={14} className="text-yellow-400" />,
  low:          <AlertTriangle size={14} className="text-orange-400" />,
  out_of_stock: <XCircle      size={14} className="text-red-400" />,
}

const statusCls = {
  good:         "bg-green-400/10  text-green-400  border border-green-400/20",
  medium:       "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20",
  low:          "bg-orange-400/10 text-orange-400 border border-orange-400/20",
  out_of_stock: "bg-red-400/10    text-red-400    border border-red-400/20",
}

const statusLabel = {
  good: "Good", medium: "Moderate", low: "Low Stock", out_of_stock: "Out of Stock"
}

export default function Inventory({ inventory }) {
  const sorted = [...inventory].sort((a, b) => a.stock - b.stock)
  const alerts = sorted.filter(i => i.status === "low" || i.status === "out_of_stock")

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/[0.06]">
        <p className="text-white font-bold text-xl" style={{ fontFamily: "'DM Serif Display', serif" }}>Inventory Status</p>
        <p className="text-white/40 text-sm mt-1">
          {alerts.length > 0
            ? `⚠ ${alerts.length} item${alerts.length > 1 ? "s" : ""} need restocking`
            : "All items are well stocked ✓"}
        </p>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {sorted.map(item => (
          <div key={item.product} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              {icons[item.status]}
              <span className="text-white/80 text-sm">{item.product}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-white/40">{fmt.number(item.stock)} units</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusCls[item.status]}`}>
                {statusLabel[item.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
