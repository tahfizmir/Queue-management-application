import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import QueueView from './pages/QueueView'

function requireAuth() {
  return !!localStorage.getItem('qm_token')
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={requireAuth() ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/queues/:id"
          element={requireAuth() ? <QueueView /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  )
}
