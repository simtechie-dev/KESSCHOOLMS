'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Teacher } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers')
      if (!response.ok) throw new Error('Failed to fetch teachers')
      const data = await response.json()
      setTeachers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this teacher record?')) return

    try {
      const response = await fetch(`/api/teachers/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete teacher')
      setTeachers(teachers.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Teachers Management</h1>
          <p className="text-gray-600 mt-2">Manage teacher records and assignments</p>
        </div>
        <Link
          href="/dashboard/teachers/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Teacher
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <input
          type="text"
          placeholder="Search by employee ID or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Employee ID</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Specialization</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Qualification</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Phone</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTeachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{teacher.employee_id}</td>
                <td className="px-6 py-4 text-gray-600">{teacher.specialization || '-'}</td>
                <td className="px-6 py-4 text-gray-600">{teacher.qualification || '-'}</td>
                <td className="px-6 py-4 text-gray-600">{teacher.phone || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/teachers/${teacher.id}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/dashboard/teachers/${teacher.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No teachers found. {teachers.length === 0 && 'Add your first teacher!'}
          </div>
        )}
      </div>
    </div>
  )
}
