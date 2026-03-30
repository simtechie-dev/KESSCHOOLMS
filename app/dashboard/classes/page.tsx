'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Class, School } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')

  useEffect(() => {
    fetchSchools()
  }, [])

  useEffect(() => {
    if (selectedSchool) {
      fetchClasses()
    }
  }, [selectedSchool])

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools')
      if (response.ok) {
        const data = await response.json()
        setSchools(data)
        if (data.length > 0) {
          setSelectedSchool(data[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching schools:', err)
    }
  }

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/classes')
      if (!response.ok) throw new Error('Failed to fetch classes')
      const data = await response.json()
      setClasses(data.filter((c: Class) => c.school_id === selectedSchool))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return

    try {
      const response = await fetch(`/api/classes/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete class')
      setClasses(classes.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Classes Management</h1>
          <p className="text-gray-600 mt-2">Manage classes and enrollments</p>
        </div>
        <Link
          href="/dashboard/classes/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Class
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Select School</label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="input-field"
            >
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Search Classes</label>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Class Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Code</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Capacity</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Form Teacher</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredClasses.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{cls.name}</td>
                <td className="px-6 py-4 text-gray-600">{cls.code}</td>
                <td className="px-6 py-4 text-gray-600">{cls.capacity || '-'}</td>
                <td className="px-6 py-4 text-gray-600">-</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/classes/${cls.id}`}
                      className="text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/dashboard/classes/${cls.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(cls.id)}
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

        {filteredClasses.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No classes found. {classes.length === 0 && 'Create your first class!'}
          </div>
        )}
      </div>
    </div>
  )
}
