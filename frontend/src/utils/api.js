const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

function getToken() {
  return localStorage.getItem("byz_token")
}

function authHeaders() {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const api = {
  async register(name, email, password) {
    const res = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || "Registration failed")
    }
    return res.json()
  },

  async login(email, password) {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || "Login failed")
    }
    return res.json()
  },

  async getProfile() {
    const res = await fetch(`${BASE}/auth/profile`, {
      headers: authHeaders()
    })
    if (!res.ok) throw new Error("Failed to load profile")
    return res.json()
  },

  async updateApiKey(provider, apiKey) {
    const res = await fetch(`${BASE}/auth/api-key`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ provider, api_key: apiKey }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || `Failed to update ${provider} API key`)
    }
    return res.json()
  },

  async uploadCSV(file) {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch(`${BASE}/upload-csv`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || "Upload failed")
    }
    return res.json()
  },

  async uploadBillImage(imageBase64, mimeType = "image/jpeg") {
    const res = await fetch(`${BASE}/upload-bill-image`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ image_base64: imageBase64, mime_type: mimeType }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || "Bill scan failed")
    }
    return res.json()
  },

  async getReports() {
    const res = await fetch(`${BASE}/reports`, { headers: authHeaders() })
    if (!res.ok) throw new Error("Failed to load reports")
    return res.json()
  },

  async chat(message, provider = "gemini") {
    const res = await fetch(`${BASE}/chat`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ message, provider }),
    })
    if (!res.ok) throw new Error("Chat failed")
    return res.json()
  },

  async addStock(message) {
    const res = await fetch(`${BASE}/add-stock`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ message }),
    })
    if (!res.ok) throw new Error("Stock update failed")
    return res.json()
  },
}