'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewTeacherPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    employee_id: '',
    qualification: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        router.push('/dashboard/teachers')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create teacher')
      }
    } catch (err) {
      setError('Failed to create teacher')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Add New Teacher</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g. Musa Abdullahi"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="teacher@email.com"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="08012345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={e => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g. KCA/TCH/001"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualification
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={e => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. B.Ed Mathematics, NCE"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Teacher'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/teachers')}
              className="border px-6 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}