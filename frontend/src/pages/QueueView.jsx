import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../api'

export default function QueueView(){
  const { id } = useParams()
  const [tokens, setTokens] = useState([])
  const [name, setName] = useState('')
  const [queueName, setQueueName] = useState('')

  useEffect(()=>{ fetchTokens(); fetchQueue() }, [])

  const fetchQueue = async ()=>{
    const all = await API('/api/queues')
    const q = Array.isArray(all) ? all.find(x=>x._id===id) : null
    if(q) setQueueName(q.name)
  }

  const fetchTokens = async ()=>{
    const res = await API(`/api/queues/${id}/tokens`)
    setTokens(Array.isArray(res)?res:[])
  }

  const add = async ()=>{
    if(!name) return
    const res = await API(`/api/queues/${id}/tokens`, { method: 'POST', body: JSON.stringify({ name }) })
    if(res && res._id) setTokens(prev=>[...prev,res])
    setName('')
  }

  const move = async (tokenId, dir)=>{
    await API(`/api/tokens/${tokenId}/move`, { method: 'POST', body: JSON.stringify({ direction: dir }) })
    fetchTokens()
  }

  const assignTop = async ()=>{ await API(`/api/queues/${id}/assignTop`, { method: 'POST' }); fetchTokens() }
  const assign = async (tid)=>{ await API(`/api/tokens/${tid}/assign`, { method: 'POST' }); fetchTokens() }
  const cancel = async (tid)=>{ await API(`/api/tokens/${tid}`, { method: 'DELETE' }); fetchTokens() }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-teal-300">{queueName || 'Queue'}</h2>
            <p className="text-sm text-slate-400">Queue ID: <span className="text-slate-500">{id}</span></p>
          </div>

          <div className="flex gap-2">
            <Link to="/" className="px-3 py-1 border border-slate-700 text-slate-200 rounded-md hover:bg-slate-700/30 transition">
              Back
            </Link>
            <button
              onClick={assignTop}
              className="px-3 py-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-md shadow-md hover:opacity-95 transition"
            >
              Assign Top
            </button>
          </div>
        </header>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-6">
          <div className="flex gap-3">
            <input
              value={name}
              onChange={e=>setName(e.target.value)}
              placeholder="Person name (optional)"
              className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded-md text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button
              onClick={add}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-md shadow-md hover:opacity-95 transition"
            >
              Add Token
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {tokens.length === 0 && (
            <div className="text-slate-400">No tokens waiting.</div>
          )}

          {tokens.map((t)=> (
            <div key={t._id} className="flex items-center justify-between bg-slate-800/85 border border-slate-700 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-md bg-emerald-50 text-emerald-600 font-medium">
                  #{t.position}
                </div>
                <div>
                  <div className="font-medium text-slate-100">{t.name || 'Anonymous'}</div>
                  <div className="text-sm text-slate-400">status: {t.status}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={()=>move(t._id,'up')} className="px-2 py-1 border rounded-md text-slate-200 hover:bg-slate-700/30 transition" title="Move up">↑</button>
                <button onClick={()=>move(t._id,'down')} className="px-2 py-1 border rounded-md text-slate-200 hover:bg-slate-700/30 transition" title="Move down">↓</button>
                <button onClick={()=>assign(t._id)} className="px-2 py-1 bg-teal-500 text-white rounded-md hover:opacity-95 transition">Assign</button>
                <button onClick={()=>cancel(t._id)} className="px-2 py-1 border rounded-md text-slate-200 hover:bg-slate-700/30 transition">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
