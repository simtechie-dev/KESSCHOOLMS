'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Edit2, Trash2, CalendarDays } from 'lucide-react'
import { Term } from '@/lib/types'

export default function TermsPage() {
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/terms')
      if (response.ok) {
        const data = await response.json()
        setTerms(data)
      } else {
        setError('Failed to fetch terms')
      }
    } catch (err) {
      console.error('Error fetching terms:', err)
      setError('Failed to fetch terms')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this term?')) return
    try {
      const response = await fetch(`/api/terms/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setTerms(prev => prev.filter(t => t.id !== id))
      }
    } catch (err) {
      console.error('Error deleting term:', err)
    }
  }

  const filtered = terms.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.session?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Terms</h1>
          <p className="text-gray-600">Manage academic terms</p>
        </div>
        <Link
          href="/dashboard/terms/new"
          className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
        >
          <Plus size={18} /> Add Term
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search terms or sessions..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No terms found</h3>
          <p className="text-gray-500 mb-6">Create your first academic term.</p>
          <Link href="/dashboard/terms/new" className="btn btn-primary">Create first term</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Term Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">Current</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((term) => (
                <tr key={term.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{term.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{term.session?.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(term.start_date).toLocaleDateString('en-NG')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(term.end_date).toLocaleDateString('en-NG')}
                  </td>
                  <td className="px-6 py-4">
                    {term.is_current ? (
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
                    <Link href={`/dashboard/terms/${term.id}`} className="btn btn-sm btn-ghost mr-2">
                      <Edit2 size={16} />
                    </Link>
                    <button onClick={() => handleDelete(term.id)} className="btn btn-sm btn-error">
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
