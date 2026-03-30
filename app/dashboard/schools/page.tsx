'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { School } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools')
      if (!response.ok) throw new Error('Failed to fetch schools')
      const data = await response.json()
      setSchools(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return

    try {
      const response = await fetch(`/api/schools/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete school')
      setSchools(schools.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.lga.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Schools Management</h1>
          <p className="text-gray-600 mt-2">Manage all schools in Kebbi State</p>
        </div>
        <Link
          href="/dashboard/schools/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add School
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
          placeholder="Search by name, code, or LGA..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">School Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Code</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">LGA</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Principal</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSchools.map((school) => (
              <tr key={school.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{school.name}</td>
                <td className="px-6 py-4 text-gray-600">{school.code}</td>
                <td className="px-6 py-4 text-gray-600">{school.lga}</td>
                <td className="px-6 py-4 text-gray-600">{school.principal_name || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/schools/${school.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(school.id)}
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

        {filteredSchools.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No schools found. {schools.length === 0 && 'Create your first school!'}
          </div>
        )}
      </div>
    </div>
  )
}
