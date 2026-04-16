'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Edit2, Eye, Trash2 } from 'lucide-react'

interface School {
  id: string
  name: string
  code?: string
  lga?: string
  principal_name?: string
  student_count?: { count: number } | number
  teacher_count?: { count: number } | number
  school_name?: string
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      const schoolsResponse = await fetch('/api/schools')
      if (!schoolsResponse.ok) throw new Error('Failed to fetch schools')

      const data = await schoolsResponse.json()
      setSchools(data.schools || data || [])
    } catch (error) {
      setError('Error loading schools')
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this school?')) return
    try {
      const response = await fetch(`/api/schools/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      setSchools(schools.filter(s => s.id !== id))
    } catch (err) {
      setError('Delete failed')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Schools</h1>
          <p className="text-gray-600">Registered schools in the system</p>
        </div>
        <Link href="/dashboard/schools/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add School
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card">
        <input
          type="text"
          placeholder="Search schools..."
          className="input input-bordered w-full"
          onChange={async (e) => {
            const schoolsResponse = await fetch(`/api/schools?search=${e.target.value}`)
            const data = await schoolsResponse.json()
            setSchools(data.schools || data || [])
          }}
        />
      </div>

      {schools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No schools found</p>
          <Link href="/dashboard/schools/new" className="btn btn-primary">
            Create First School
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>LGA</th>
                <th>Students</th>
                <th>Teachers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id}>
                  <td>
                    <div>{school.name || school.school_name || 'Unnamed School'}</div>
                  </td>
                  <td>{school.code || '-'}</td>
                <td>{school.lga || '-'}</td>
                  <td>{school.student_count?.count || 0}</td>
                  <td>{school.teacher_count?.count || 0}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/schools/${school.id}`} className="btn btn-sm btn-ghost">
                        <Eye size={16} />
                      </Link>
                      <Link href={`/dashboard/schools/${school.id}/edit`} className="btn btn-sm btn-ghost">
                        <Edit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(school.id)} className="btn btn-sm btn-error btn-ghost">
                        <Trash2 size={16} />
                      </button>
                    </div>
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

