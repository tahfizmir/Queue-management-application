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
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{queueName || 'Queue'}</h2>
        <div className="flex gap-2">
          <Link to="/" className="px-3 py-1 border rounded">Back</Link>
          <button onClick={assignTop} className="px-3 py-1 bg-blue-600 text-white rounded">Assign Top</button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Person name (optional)" className="p-2 border rounded" />
        <button onClick={add} className="px-3 py-2 bg-green-600 text-white rounded">Add Token</button>
      </div>

      <div className="space-y-2">
        {tokens.map((t)=> (
          <div key={t._id} className="p-3 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="font-medium">#{t.position} {t.name || 'Anonymous'}</div>
              <div className="text-sm text-gray-500">status: {t.status}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>move(t._id,'up')} className="px-2 py-1 border rounded">↑</button>
              <button onClick={()=>move(t._id,'down')} className="px-2 py-1 border rounded">↓</button>
              <button onClick={()=>assign(t._id)} className="px-2 py-1 bg-blue-600 text-white rounded">Assign</button>
              <button onClick={()=>cancel(t._id)} className="px-2 py-1 border rounded">Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
