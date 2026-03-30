'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { School } from '@/lib/types'

interface StudentFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isEditing?: boolean
}

export default function StudentForm({
  initialData,
  onSubmit,
  isEditing = false,
}: StudentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [formData, setFormData] = useState({
    registration_number: initialData?.registration_number || '',
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    gender: initialData?.gender || '',
    date_of_birth: initialData?.date_of_birth || '',
    school_id: initialData?.school_id || '',
    parent_phone: initialData?.parent_phone || '',
    parent_email: initialData?.parent_email || '',
  })

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools')
      if (response.ok) {
        const data = await response.json()
        setSchools(data)
      }
    } catch (err) {
      console.error('Error fetching schools:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onSubmit(formData)
      router.push('/dashboard/students')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditing ? 'Edit Student' : 'Add New Student'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="form-label">Registration Number *</label>
          <input
            type="text"
            name="registration_number"
            value={formData.registration_number}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="e.g., GSS001-2024-0001"
          />
        </div>

        <div className="form-group">
          <label className="form-label">School *</label>
          <select
            name="school_id"
            value={formData.school_id}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select School</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">First Name *</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="First name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Last Name *</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Last name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Parent Phone</label>
          <input
            type="tel"
            name="parent_phone"
            value={formData.parent_phone}
            onChange={handleChange}
            className="input-field"
            placeholder="Parent phone number"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Parent Email</label>
          <input
            type="email"
            name="parent_email"
            value={formData.parent_email}
            onChange={handleChange}
            className="input-field"
            placeholder="Parent email"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Student' : 'Add Student'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
