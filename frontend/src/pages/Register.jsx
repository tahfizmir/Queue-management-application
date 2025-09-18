import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) return setError('email & password required')
    if (password !== confirm) return setError('passwords do not match')

    try {
      const res = await API('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (res.token) {
        localStorage.setItem('qm_token', res.token)
        nav('/') // go to dashboard after successful registration
      } else {
        setError(res.error || 'Registration failed')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register Manager</h2>
      <form onSubmit={submit} className="space-y-4">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" className="w-full p-2 border rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" className="w-full p-2 border rounded" />
        <input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="confirm password" type="password" className="w-full p-2 border rounded" />
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded">Register</button>
          <Link to="/login" className="px-4 py-2 border rounded">Back to login</Link>
        </div>
      </form>
      <div className="text-sm text-gray-500 mt-4">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></div>
    </div>
  )
}
