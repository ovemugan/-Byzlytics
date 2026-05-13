import { useState, useRef } from "react"
import { Upload, FileText, AlertCircle, CheckCircle2, LogOut } from "lucide-react"
import { api } from "../utils/api"
import { useAuth } from "../context/AuthContext"

export default function UploadPage({ onSuccess, onReset }) {
  const { user, logout } = useAuth()
  const [dragging, setDragging] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [success,  setSuccess]  = useState(null)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.uploadCSV(file)
      setSuccess(res)
      setTimeout(() => onSuccess(), 1000)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  function handleLogout() {
    logout()
    onReset()
  }

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-6"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(245,200,66,0.06) 0%, transparent 70%)" }} />

      {/* Nav strip */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 py-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f5c842] to-[#e8922a] flex items-center justify-center">
            <span className="text-black font-black text-sm">B</span>
          </div>
          <span className="text-white font-bold">Byzlytics</span>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm">Hi, {user.name}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-sm transition-colors">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-5xl font-black text-white mb-3"
          style={{ fontFamily: "'DM Serif Display', serif" }}>
          Upload Your Data
        </h1>
        <p className="text-white/40 text-lg">Drop your sales CSV and get instant insights</p>
      </div>

      {/* Upload card */}
      <div className="w-full max-w-lg relative z-10">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current.click()}
          className={`
            border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all
            ${dragging
              ? "border-[#f5c842] bg-[#f5c842]/5"
              : "border-white/10 bg-white/[0.03] hover:border-[#f5c842]/40 hover:bg-white/[0.05]"
            }
          `}
        >
          <input ref={inputRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />

          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-[#f5c842] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/50">Processing your data...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 size={48} className="text-green-400" />
              <p className="text-white text-xl font-bold">{success.rows} rows loaded!</p>
              <p className="text-white/40 text-sm">Redirecting to dashboard...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#f5c842]/10 rounded-2xl flex items-center justify-center">
                <Upload size={28} className="text-[#f5c842]" />
              </div>
              <div>
                <p className="text-white text-xl font-bold mb-1">Drop your CSV here</p>
                <p className="text-white/30 text-sm">or click to browse</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start">
            <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Required columns */}
      <div className="mt-10 w-full max-w-lg relative z-10">
        <p className="text-white/20 text-xs text-center mb-3 uppercase tracking-widest">Required CSV columns</p>
        <div className="grid grid-cols-3 gap-2">
          {["date","product","category","quantity_sold","unit_price","unit_cost","stock_remaining"].map(col => (
            <div key={col} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-center">
              <code className="text-[#f5c842]/70 text-xs">{col}</code>
            </div>
          ))}
        </div>
        <p className="text-white/20 text-xs text-center mt-4">
          Use <span className="font-mono bg-white/5 px-1 rounded text-white/40">sample_data.csv</span> from the project folder to test
        </p>
      </div>
    </div>
  )
}
