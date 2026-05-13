import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { fmt } from "../utils/format"

const COLORS = ["#f5c842", "#22c55e", "#e8922a", "#6366f1", "#ec4899", "#06b6d4"]

const tooltipStyle = {
  backgroundColor: "#0d0d0f",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  color: "#ffffff",
  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
}

function ChartCard({ title, sub, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <p className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>{title}</p>
      {sub && <p className="text-white/30 text-sm mb-5">{sub}</p>}
      {children}
    </div>
  )
}

export default function Charts({ monthly, products, categories }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <ChartCard title="Revenue & Profit Over Time" sub="Monthly breakdown — spot your best and worst months">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f5c842" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f5c842" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} />
            <YAxis tickFormatter={v => fmt.short(v)} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [fmt.currency(v), name]} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }} />
            <Area type="monotone" dataKey="revenue" stroke="#f5c842" strokeWidth={2} fill="url(#rev)" name="Revenue" />
            <Area type="monotone" dataKey="profit"  stroke="#22c55e" strokeWidth={2} fill="url(#prof)" name="Profit" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Revenue by Category" sub="Which category drives your business most">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={categories} dataKey="revenue" nameKey="category"
              cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}>
              {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt.currency(v), "Revenue"]} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Profit by Product" sub="Compare which products make you the most money">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={products} margin={{ top: 4, right: 4, left: 0, bottom: 40 }}>
            <XAxis dataKey="product" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} angle={-30} textAnchor="end" interval={0} />
            <YAxis tickFormatter={v => fmt.short(v)} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt.currency(v), "Profit"]} />
            <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
              {products.map((item, i) => <Cell key={i} fill={item.profit >= 0 ? COLORS[i % 3] : "#ef4444"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Profit Margin by Product" sub="Higher % = healthier pricing — target 20%+">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={products} layout="vertical" margin={{ top: 4, right: 20, left: 80, bottom: 4 }}>
            <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} />
            <YAxis type="category" dataKey="product" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} width={80} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Margin"]} />
            <Bar dataKey="margin" radius={[0, 6, 6, 0]}>
              {products.map((item, i) => (
                <Cell key={i} fill={item.margin >= 20 ? "#22c55e" : item.margin >= 10 ? "#f5c842" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  )
}
