import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await API('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      if (res.token) {
        localStorage.setItem('qm_token', res.token)
        nav('/')
      } else {
        setError(res.error || 'Login failed')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Manager Login</h2>
      <form onSubmit={submit} className="space-y-4">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" className="w-full p-2 border rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" className="w-full p-2 border rounded" />
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
        </div>
      </form>
<div className="text-sm text-gray-500 mt-2">
  Don't have an account? <Link to="/register" className="text-blue-600">Register here</Link>
</div>    </div>
  )
}
