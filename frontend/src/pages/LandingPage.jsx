import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { api } from "../utils/api"

function AuthModal({ mode, onClose, onSwitch, onSuccess }) {
  const { login } = useAuth()
  const [form,    setForm]    = useState({ name: "", email: "", password: "" })
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      let res
      if (mode === "signup") {
        if (!form.name.trim()) { setError("Name is required"); setLoading(false); return }
        res = await api.register(form.name, form.email, form.password)
      } else {
        res = await api.login(form.email, form.password)
      }
      login(res.token, { name: res.name, email: res.email })
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-[#0d0d0f] border border-white/10 rounded-2xl p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/70 text-xl leading-none">×</button>

        {/* Logo mark */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f5c842] to-[#e8922a] flex items-center justify-center">
            <span className="text-black font-black text-sm">B</span>
          </div>
          <span className="text-white font-bold tracking-wide">Byzlytics</span>
        </div>

        <h2 className="text-white text-2xl font-bold mb-1">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-white/40 text-sm mb-7">
          {mode === "login" ? "Sign in to access your dashboard" : "Start your 14-day free trial"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <div>
              <label className="text-white/50 text-xs uppercase tracking-widest block mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#f5c842]/60 transition-colors text-sm"
                required
              />
            </div>
          )}
          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest block mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#f5c842]/60 transition-colors text-sm"
              required
            />
          </div>
          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest block mb-1.5">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#f5c842]/60 transition-colors text-sm"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#f5c842] to-[#e8922a] text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-white/30 text-sm text-center mt-6">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={onSwitch} className="text-[#f5c842] hover:underline">
            {mode === "login" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: "📊", title: "Real-Time Analytics", desc: "Upload any CSV and get instant charts — revenue, profit, margin, trends at a glance." },
  { icon: "🤖", title: "AI Business Advisor", desc: "Ask questions about your data in plain English. Get clear, actionable advice." },
  { icon: "📦", title: "Inventory Alerts", desc: "Never run out of stock. Get instant alerts and update inventory by voice command." },
  { icon: "🗄️", title: "MongoDB Cloud Storage", desc: "Your data is securely stored in MongoDB Atlas. Access from anywhere, anytime." },
  { icon: "🔐", title: "Secure Authentication", desc: "JWT-secured accounts. Your business data stays private and protected." },
  { icon: "📈", title: "Top & Bottom Performers", desc: "Instantly see which products make you money and which need attention." },
]

const STATS = [
  { value: "10K+", label: "Businesses" },
  { value: "₹2Cr+", label: "Revenue Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 2s", label: "Load Time" },
]

export default function LandingPage({ onEnterApp }) {
  const [modal, setModal] = useState(null) // "login" | "signup" | null

  function handleSuccess() {
    setModal(null)
    onEnterApp()
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Noise texture overlay ── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />

      {/* ── Glow orbs ── */}
      <div className="fixed top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 70%)" }} />
      <div className="fixed bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,146,42,0.06) 0%, transparent 70%)" }} />

      {/* ── NAV ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f5c842] to-[#e8922a] flex items-center justify-center shadow-lg">
            <span className="text-black font-black text-base">B</span>
          </div>
          <span className="text-white font-bold text-lg tracking-wide">Byzlytics</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "About"].map(l => (
            <a key={l} href="#" className="text-white/50 hover:text-white text-sm transition-colors">{l}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModal("login")}
            className="text-white/70 hover:text-white text-sm transition-colors px-4 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => setModal("signup")}
            className="bg-gradient-to-r from-[#f5c842] to-[#e8922a] text-black font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white/60 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Now with MongoDB cloud storage & AI advisor
        </div>

        <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-6 tracking-tight"
          style={{ fontFamily: "'DM Serif Display', serif" }}>
          Your Business<br />
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #f5c842 0%, #e8922a 100%)" }}>
            Data, Simplified
          </span>
        </h1>

        <p className="text-white/50 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload a CSV. Get instant profit reports, inventory alerts, and an AI advisor
          that explains your numbers in plain English. Built for Indian SMBs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setModal("signup")}
            className="bg-gradient-to-r from-[#f5c842] to-[#e8922a] text-black font-bold text-base px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl hover:scale-105 hover:shadow-[0_0_40px_rgba(245,200,66,0.3)]"
          >
            Start Free — No Card Needed →
          </button>
          <button
            onClick={() => setModal("login")}
            className="border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-base px-8 py-4 rounded-2xl transition-all"
          >
            Sign In to Dashboard
          </button>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-3xl font-black text-white mb-1"
                style={{ fontFamily: "'DM Serif Display', serif" }}>{value}</p>
              <p className="text-white/40 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}>
            Everything you need
          </h2>
          <p className="text-white/40 text-lg">One dashboard. All your business intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title}
              className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all cursor-default">
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-32 text-center">
        <div className="bg-gradient-to-br from-[#f5c842]/10 to-[#e8922a]/5 border border-[#f5c842]/20 rounded-3xl p-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}>
            Ready to grow smarter?
          </h2>
          <p className="text-white/40 text-lg mb-10">
            Join thousands of businesses tracking their profits with Byzlytics.
          </p>
          <button
            onClick={() => setModal("signup")}
            className="bg-gradient-to-r from-[#f5c842] to-[#e8922a] text-black font-bold text-lg px-10 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl hover:scale-105"
          >
            Create Free Account →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#f5c842] to-[#e8922a] flex items-center justify-center">
            <span className="text-black font-black text-xs">B</span>
          </div>
          <span className="text-white/50 text-sm">Byzlytics · Built for SMBs</span>
        </div>
        <p className="text-white/20 text-sm">© 2025 Byzlytics. All rights reserved.</p>
      </footer>

      {/* ── AUTH MODAL ── */}
      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
          onSwitch={() => setModal(modal === "login" ? "signup" : "login")}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
