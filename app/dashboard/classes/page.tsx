'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Edit2, Trash2 } from 'lucide-react'

interface Class {
  id: string
  name: string
  code: string
  capacity: number
  school_id: string
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      } else {
        setError('Failed to fetch classes')
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
      setError('Failed to fetch classes')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return
    try {
      const response = await fetch(`/api/classes/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setClasses(prev => prev.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error('Error deleting class:', err)
    }
  }

  const filtered = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Classes</h1>
        <Link
          href="/dashboard/classes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={16} /> Add Class
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full max-w-md"
        />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No classes found.</p>
          <Link href="/dashboard/classes/new" className="text-blue-600 mt-2 inline-block">
            Create your first class
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600">Class Name</th>
                <th className="text-left px-6 py-3 text-gray-600">Code</th>
                <th className="text-left px-6 py-3 text-gray-600">Capacity</th>
                <th className="text-left px-6 py-3 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cls => (
                <tr key={cls.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{cls.name}</td>
                  <td className="px-6 py-4">{cls.code}</td>
                  <td className="px-6 py-4">{cls.capacity || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/classes/${cls.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(cls.id)}
                        className="text-red-600 hover:text-red-800"
                      >
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