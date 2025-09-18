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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Queues</h1>
        <div className="flex items-center gap-3">
          <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="New queue name" className="p-2 border rounded" />
        <button onClick={create} className="px-3 py-2 bg-green-600 text-white rounded">Create</button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {queues.map(q=> (
          <div key={q._id} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{q.name}</div>
                <div className="text-sm text-gray-500">id: {q._id}</div>
              </div>
              <Link to={`/queues/${q._id}`} className="px-3 py-1 border rounded">Open</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
