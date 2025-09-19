import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await API('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
          {/* decorative gradient panel */}
          <div className="absolute -inset-1 transform -skew-y-2 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-indigo-600/10 blur-lg opacity-40" />
          <div className="relative bg-slate-800/95 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
            {/* Logo / header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow">
                {/* simple logo mark */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M3 12h18" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M3 6h18" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M3 18h18" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-100">Manager Login</h2>
                <p className="text-sm text-slate-400">Sign in to access and manage your queues</p>
              </div>
            </div>

            {/* form */}
            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  {/* mail icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16v16H4z" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className="w-full pl-11 p-3 bg-slate-900 border border-slate-700 rounded-md text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  {/* lock icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  type="password"
                  className="w-full pl-11 p-3 bg-slate-900 border border-slate-700 rounded-md text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm font-medium px-1">{error}</div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold rounded-md shadow-sm transition-colors"
              >
                Login
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
              <div> {/* placeholder: could add 'Forgot?' link later */} </div>
              <div>
                Don’t have an account?{' '}
                <Link to="/register" className="text-teal-300 hover:underline">
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Queue Management App • © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
