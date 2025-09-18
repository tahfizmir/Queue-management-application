const API = async (path, opts = {}) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8888'
  const url = base + path
  const token = localStorage.getItem('qm_token')
  const headers = Object.assign({}, opts.headers || {})
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!headers['Content-Type'] && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, { ...opts, headers })
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export default API
