import { useState } from "react"
import { AuthProvider, useAuth } from "./context/AuthContext"
import LandingPage from "./pages/LandingPage"
import UploadPage  from "./pages/UploadPage"
import Dashboard   from "./pages/Dashboard"

function AppInner() {
  const { user, ready } = useAuth()
  const [page, setPage] = useState("landing") // "landing" | "upload" | "dashboard"

  if (!ready) return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#f5c842] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // If logged in and hit landing, go straight to upload
  if (page === "landing" && user) {
    return <UploadPage onSuccess={() => setPage("dashboard")} onReset={() => setPage("landing")} />
  }

  if (page === "landing") {
    return <LandingPage onEnterApp={() => setPage("upload")} />
  }

  if (page === "upload") {
    return <UploadPage onSuccess={() => setPage("dashboard")} onReset={() => setPage("landing")} />
  }

  return <Dashboard onReset={() => setPage("upload")} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
