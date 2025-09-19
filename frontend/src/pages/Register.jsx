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
    if (!email || !password) return setError('Email & password required')
    if (password !== confirm) return setError('Passwords do not match')

    try {
      const res = await API('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (res.token) {
        localStorage.setItem('qm_token', res.token)
        nav('/')
      } else {
        setError(res.error || 'Registration failed')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-700">
          <h2 className="text-3xl font-bold text-center text-teal-400 mb-2">
            Create Account
          </h2>
          <p className="text-center text-slate-300 mb-6">
            Sign up to manage your queues efficiently
          </p>

          <form onSubmit={submit} className="space-y-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm Password"
              type="password"
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-md text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />

            {error && (
              <div className="text-red-400 text-sm font-medium">{error}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold rounded-md shadow-md transition-colors"
            >
              Register
            </button>
          </form>

          <p className="text-sm text-slate-400 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Queue Management App © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
