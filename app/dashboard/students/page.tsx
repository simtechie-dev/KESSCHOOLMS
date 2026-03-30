'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Student } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchStudents = async (pageNumber = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/students?page=${pageNumber}&pageSize=25`)
      if (!response.ok) throw new Error('Failed to fetch students')
      const data = await response.json()

      setStudents(data)
      setHasMore(data.length === 25)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents(page)
  }, [page])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) return

    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete student')
      setStudents(students.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Students Management</h1>
          <p className="text-gray-600 mt-2">Manage student records and profiles</p>
        </div>
        <Link
          href="/dashboard/students/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Student
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
          placeholder="Search by name or registration number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Registration #</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Full Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Class</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Gender</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Parent Phone</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{student.registration_number}</td>
                <td className="px-6 py-4 text-gray-600">
                  {student.first_name} {student.last_name}
                </td>
                <td className="px-6 py-4 text-gray-600">{student.classes?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-600">{student.gender || '-'}</td>
                <td className="px-6 py-4 text-gray-600">{student.parent_phone || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/students/${student.id}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/dashboard/students/${student.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(student.id)}
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

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No students found. {students.length === 0 && 'Add your first student!'}
          </div>
        )}
      </div>
    </div>
  )
}
