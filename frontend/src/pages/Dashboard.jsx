import { useState, useEffect } from "react"
import { RefreshCw, Upload, BarChart2, Package, MessageSquare, LogOut, Settings } from "lucide-react"
import { api } from "../utils/api"
import { useAuth } from "../context/AuthContext"
import KpiCards   from "../components/KpiCards"
import Charts     from "../components/Charts"
import Inventory  from "../components/Inventory"
import AiChat     from "../components/AiChat"
import Performers from "../components/Performers"
import StockInput from "../components/StockInput"
import SettingsModal from "../components/Settings"

const TABS = [
  { id: "overview",  label: "Overview",   icon: BarChart2 },
  { id: "inventory", label: "Inventory",  icon: Package },
  { id: "advisor",   label: "AI Advisor", icon: MessageSquare },
]

export default function Dashboard({ onReset }) {
  const { user, logout } = useAuth()
  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [tab,         setTab]         = useState("overview")
  const [stockInput,  setStockInput]  = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [provider,    setProvider]    = useState("gemini")

  async function loadData() {
    setLoading(true); setError(null)
    try { setData(await api.getReports()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  function handleLogout() { logout(); onReset() }

  if (loading) return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#f5c842] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40">Loading your dashboard...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center p-6">
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 max-w-md text-center">
        <p className="text-white text-2xl font-bold mb-2">Something went wrong</p>
        <p className="text-red-400 text-sm mb-6">{error}</p>
        <button onClick={loadData} className="bg-[#f5c842] text-black font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#070709]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top nav */}
      <header className="bg-[#0d0d0f]/90 border-b border-white/[0.06] sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f5c842] to-[#e8922a] flex items-center justify-center">
                <span className="text-black font-black text-sm">B</span>
              </div>
              <span className="text-white font-bold text-lg">Byzlytics</span>
            </div>

            {/* Tabs */}
            <nav className="flex gap-1 bg-white/[0.04] rounded-xl p-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                    ${tab === id ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/70"}`}>
                  <Icon size={15} />{label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {tab === "advisor" && (
              <select
                value={provider}
                onChange={e => setProvider(e.target.value)}
                className="text-xs bg-white/[0.04] border border-white/[0.06] text-white px-3 py-2 rounded-lg outline-none focus:border-[#f5c842]/30 transition-colors"
              >
                <option value="gemini">🔵 Gemini</option>
                <option value="groq">⚡ Groq</option>
              </select>
            )}

            {user && <span className="text-white/30 text-sm hidden md:block">{user.name}</span>}

            <button onClick={loadData}
              className="w-9 h-9 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl flex items-center justify-center transition-colors"
              title="Refresh">
              <RefreshCw size={15} className="text-white/50" />
            </button>

            <button onClick={() => setShowSettings(true)}
              className="w-9 h-9 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl flex items-center justify-center transition-colors"
              title="Settings">
              <Settings size={15} className="text-white/50" />
            </button>

            <button onClick={onReset}
              className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-sm transition-colors">
              <Upload size={14} />New CSV
            </button>

            <button onClick={handleLogout}
              className="flex items-center gap-2 text-white/30 hover:text-white/60 px-3 py-2 rounded-xl text-sm transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {tab === "overview" && (
          <div className="flex flex-col gap-6">
            <KpiCards kpis={data.kpis} />
            <Charts monthly={data.monthly} products={data.products} categories={data.categories} />
            <Performers top={data.top_performers} bottom={data.bottom_performers} />
          </div>
        )}

        {tab === "inventory" && (
          <div className="flex flex-col gap-6">
            <StockInput onSend={(msg) => { setTab("advisor"); setStockInput(msg) }} />
            <Inventory inventory={data.inventory} />
          </div>
        )}

        {tab === "advisor" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AiChat stockInput={stockInput} setStockInput={setStockInput} provider={provider} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                <p className="text-white/70 font-bold text-base mb-3">Quick Snapshot</p>
                <div className="flex flex-col gap-2 text-sm">
                  {[
                    ["Revenue",   `₹${(data.kpis.total_revenue/1000).toFixed(0)}K`],
                    ["Profit",    `₹${(data.kpis.total_profit/1000).toFixed(0)}K`],
                    ["Margin",    `${data.kpis.margin}%`],
                    ["Products",  data.products.length],
                    ["Low Stock", data.inventory.filter(i => i.status === "low" || i.status === "out_of_stock").length],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-white/30">{k}</span>
                      <span className="font-mono text-white/70">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#f5c842]/5 border border-[#f5c842]/15 rounded-2xl p-5">
                <p className="text-[#f5c842]/80 font-bold text-base mb-3">Try asking...</p>
                <div className="flex flex-col gap-2">
                  {[
                    "Why is my profit margin low?",
                    "What should I restock this week?",
                    "Which month was my best?",
                    "How do I increase profits?",
                  ].map(q => (
                    <button key={q} onClick={() => setStockInput(q)}
                      className="text-left text-xs text-[#f5c842]/60 hover:text-[#f5c842] transition-colors py-0.5">
                      → {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}