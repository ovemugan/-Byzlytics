import { useState, useRef } from "react"
import { Upload, AlertCircle, CheckCircle2, LogOut, Camera, ImageIcon, FileText, X, ScanLine } from "lucide-react"
import { api } from "./api"
import { useAuth } from "./AuthContext"

// ─── Bill Image Scanner ───────────────────────────────────────────────────────
function BillScanner({ onSuccess, onError }) {
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const fileRef = useRef()
  const cameraRef = useRef()

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleImage(file) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      onError("Please select an image file")
      return
    }

    const base64 = await fileToBase64(file)
    setPreview(base64)
    setScanning(true)
    setResult(null)

    try {
      const res = await api.uploadBillImage(base64, file.type)
      setResult(res)
      if (res.rows > 0) {
        onSuccess(res)
      } else {
        onError(res.message || "No products found in image")
      }
    } catch (e) {
      onError(e.message)
    } finally {
      setScanning(false)
    }
  }

  function clearPreview() {
    setPreview(null)
    setResult(null)
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-purple-400/10 rounded-xl flex items-center justify-center">
          <ScanLine size={16} className="text-purple-400" />
        </div>
        <div>
          <p className="text-white font-bold text-lg" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Scan Bill / Receipt
          </p>
          <p className="text-white/30 text-xs">AI reads your bills and adds to inventory</p>
        </div>
      </div>

      {!preview ? (
        <div className="flex gap-3">
          {/* Camera capture */}
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-2 bg-white/[0.04] hover:bg-purple-400/5 border border-white/[0.08] hover:border-purple-400/30 rounded-xl p-4 transition-all group"
          >
            <Camera size={24} className="text-white/40 group-hover:text-purple-400 transition-colors" />
            <span className="text-white/50 text-xs group-hover:text-purple-300 transition-colors">Camera</span>
          </button>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => handleImage(e.target.files[0])}
          />

          {/* Gallery pick */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-2 bg-white/[0.04] hover:bg-purple-400/5 border border-white/[0.08] hover:border-purple-400/30 rounded-xl p-4 transition-all group"
          >
            <ImageIcon size={24} className="text-white/40 group-hover:text-purple-400 transition-colors" />
            <span className="text-white/50 text-xs group-hover:text-purple-300 transition-colors">Gallery</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleImage(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="relative rounded-xl overflow-hidden border border-white/10">
            <img src={preview} alt="Bill preview" className="w-full max-h-48 object-cover" />
            {!scanning && (
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            )}
            {scanning && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-sm">AI reading bill...</p>
              </div>
            )}
          </div>

          {result && result.rows > 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm font-medium">✓ {result.message}</p>
            </div>
          )}
        </div>
      )}

      <p className="text-white/20 text-xs mt-3">
        Requires Gemini API key in Settings · Works with purchase bills, receipts, invoices
      </p>
    </div>
  )
}

// ─── Main Upload Page ─────────────────────────────────────────────────────────
export default function UploadPage({ onSuccess, onReset }) {
  const { user, logout } = useAuth()
  const [dragging, setDragging] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [success,  setSuccess]  = useState(null)
  const [mode, setMode] = useState("csv") // "csv" | "bill"
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

  function handleBillSuccess(res) {
    setSuccess({ rows: res.rows, filename: "bill scan" })
    setTimeout(() => onSuccess(), 1500)
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
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-5xl font-black text-white mb-3"
          style={{ fontFamily: "'DM Serif Display', serif" }}>
          Add Your Data
        </h1>
        <p className="text-white/40 text-lg">Upload CSV or scan a bill photo</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 mb-6 relative z-10">
        <button
          onClick={() => setMode("csv")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all ${
            mode === "csv" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
          }`}
        >
          <FileText size={15} /> CSV File
        </button>
        <button
          onClick={() => setMode("bill")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all ${
            mode === "bill" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
          }`}
        >
          <Camera size={15} /> Scan Bill
        </button>
      </div>

      <div className="w-full max-w-lg relative z-10">

        {/* CSV Upload */}
        {mode === "csv" && (
          <>
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

            {/* Required columns */}
            <div className="mt-6">
              <p className="text-white/20 text-xs text-center mb-3 uppercase tracking-widest">Required CSV columns</p>
              <div className="grid grid-cols-3 gap-2">
                {["date","product","category","quantity_sold","unit_price","unit_cost","stock_remaining"].map(col => (
                  <div key={col} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-center">
                    <code className="text-[#f5c842]/70 text-xs">{col}</code>
                  </div>
                ))}
              </div>
              <p className="text-white/20 text-xs text-center mt-4">
                Use <span className="font-mono bg-white/5 px-1 rounded text-white/40">sample_data.csv</span> to test
              </p>
            </div>
          </>
        )}

        {/* Bill Scanner */}
        {mode === "bill" && (
          <>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <div className="text-center mb-4">
                <p className="text-white/60 text-sm leading-relaxed">
                  Take a photo of any purchase bill, receipt, or invoice.<br />
                  AI will extract products and add them to your inventory.
                </p>
              </div>

              {success ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <CheckCircle2 size={48} className="text-green-400" />
                  <p className="text-white text-xl font-bold">{success.rows} product(s) added!</p>
                  <p className="text-white/40 text-sm">Redirecting to dashboard...</p>
                </div>
              ) : (
                <BillScanner
                  onSuccess={handleBillSuccess}
                  onError={(msg) => setError(msg)}
                />
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start">
                  <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-[#f5c842]/5 border border-[#f5c842]/15 rounded-xl">
              <p className="text-[#f5c842]/70 text-xs font-medium mb-2">Tips for best results:</p>
              <ul className="text-white/40 text-xs space-y-1">
                <li>• Good lighting, no shadows on text</li>
                <li>• Keep bill flat and fully visible</li>
                <li>• Works with Hindi + English bills</li>
                <li>• Add Gemini API key in Settings first</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}