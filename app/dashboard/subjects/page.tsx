'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react'
import { Subject } from '@/lib/types'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subjects')
      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
      } else {
        setError('Failed to fetch subjects')
      }
    } catch (err) {
      console.error('Error fetching subjects:', err)
      setError('Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject? This may affect exams and results.')) return
    try {
      const response = await fetch(`/api/subjects/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setSubjects(prev => prev.filter(s => s.id !== id))
      }
    } catch (err) {
      console.error('Error deleting subject:', err)
    }
  }

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Subjects</h1>
          <p className="text-gray-600">Manage school subjects</p>
        </div>
        <Link
          href="/dashboard/subjects/new"
          className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} /> Add Subject
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search subjects by name or code..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first subject.</p>
          <Link
            href="/dashboard/subjects/new"
            className="btn btn-primary"
          >
            Create first subject
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{subject.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                      {subject.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/subjects/${subject.id}`}
                      className="text-primary hover:text-primary/80 mr-3"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="text-error hover:text-error/80"
                    >
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
