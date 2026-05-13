import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = localStorage.getItem("byz_token")
    const u = localStorage.getItem("byz_user")
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
    }
    setReady(true)
  }, [])

  function login(tokenValue, userData) {
    localStorage.setItem("byz_token", tokenValue)
    localStorage.setItem("byz_user", JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem("byz_token")
    localStorage.removeItem("byz_user")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
