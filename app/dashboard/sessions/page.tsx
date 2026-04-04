'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react'
import { AcademicSession } from '@/lib/types'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<AcademicSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      } else {
        setError('Failed to fetch sessions')
      }
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError('Failed to fetch sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? Terms may be linked to this session.')) return
    try {
      const response = await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== id))
      }
    } catch (err) {
      console.error('Error deleting session:', err)
    }
  }

  const filtered = sessions.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Academic Sessions</h1>
          <p className="text-gray-600">Manage academic sessions</p>
        </div>
        <Link
          href="/dashboard/sessions/new"
          className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
        >
          <Plus size={18} /> Add Session
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search sessions..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
          <p className="text-gray-500 mb-6">Create your first academic session.</p>
          <Link href="/dashboard/sessions/new" className="btn btn-primary">Create first session</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Session Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">Current</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{session.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(session.start_date).toLocaleDateString('en-NG')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(session.end_date).toLocaleDateString('en-NG')}
                  </td>
                  <td className="px-6 py-4">
                    {session.is_current ? (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold bg-success text-success-content rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link href={`/dashboard/sessions/${session.id}`} className="btn btn-sm btn-ghost mr-2">
                      <Edit2 size={16} />
                    </Link>
                    <button onClick={() => handleDelete(session.id)} className="btn btn-sm btn-error">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
