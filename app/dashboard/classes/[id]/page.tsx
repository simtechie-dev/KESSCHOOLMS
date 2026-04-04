'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditClassPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    capacity: '',
  })

  useEffect(() => {
    fetchClass()
  }, [id])

  const fetchClass = async () => {
    try {
      const response = await fetch(`/api/classes/${id}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || '',
          code: data.code || '',
          capacity: data.capacity || '',
        })
      } else {
        setError('Class not found')
      }
    } catch (err) {
      setError('Failed to load class')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/classes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        router.push('/dashboard/classes')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update class')
      }
    } catch (err) {
      setError('Failed to update class')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this class?')) return
    try {
      const response = await fetch(`/api/classes/${id}`, { method: 'DELETE' })
      if (response.ok) {
        router.push('/dashboard/classes')
      }
    } catch (err) {
      setError('Failed to delete class')
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Edit Class</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={e => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/classes')}
              className="border px-6 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 ml-auto"
            >
              Delete Class
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}