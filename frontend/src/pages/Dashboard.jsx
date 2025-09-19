import React, { useEffect, useState } from 'react'
import API from '../api'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [queues, setQueues] = useState([])
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  useEffect(()=>{ fetchQueues() }, [])
  const fetchQueues = async ()=>{
    const res = await API('/api/queues')
    if (res && res.error) setError(res.error)
    else setQueues(res || [])
  }

  const create = async ()=>{
    if(!name) return
    const res = await API('/api/queues', { method: 'POST', body: JSON.stringify({ name }) })
    if(res && res._id){ setQueues(prev=>[...prev,res]); setName('') }
    else setError(res.error || 'Unable to create')
  }

  const logout = ()=>{ localStorage.removeItem('qm_token'); nav('/login') }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-teal-300">Queue Manager</h1>
            <p className="text-sm text-slate-400">Create and manage queues — simple and fast.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchQueues}
              className="px-3 py-2 bg-slate-700/60 text-slate-200 rounded-md hover:bg-slate-700 transition"
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 bg-transparent border border-slate-700 text-slate-200 rounded-md hover:bg-slate-700/30 transition"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mb-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex gap-3 items-center">
            <input
              value={name}
              onChange={e=>setName(e.target.value)}
              placeholder="New queue name"
              className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded-md text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button
              onClick={create}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-md shadow-md hover:from-teal-600 hover:to-emerald-600 transition"
            >
              Create
            </button>
          </div>
          {error && <div className="text-red-400 mt-3 text-sm">{error}</div>}
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {queues && queues.length > 0 ? queues.map(q=> (
              <div key={q._id} className="bg-slate-800/85 border border-slate-700 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{q.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">ID: <span className="text-slate-500">{q._id}</span></p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-400">Created: {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '—'}</div>
                  <div className="flex gap-2">
                    <Link
                      to={`/queues/${q._id}`}
                      className="px-3 py-1 bg-slate-700/60 text-slate-100 rounded-md hover:bg-slate-700 transition"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => {
                        // small visual-only confirm; delete endpoint not implemented
                        if (window.confirm('Do you want to remove this queue from the UI?')) {
                          setQueues(prev => prev.filter(x => x._id !== q._id));
                        }
                      }}
                      className="px-3 py-1 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700/30 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-slate-400">No queues yet — create one above.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
