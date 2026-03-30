'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SchoolFormProps {
  initialData?: any
  onSubmit: (data: any) => Promise<void>
  isEditing?: boolean
}

const lgaList = [
  'Augie', 'Bagudo', 'Birnin Kebbi', 'Bungudu', 'Dandi', 'Fauyagi', 'Gwandu',
  'Gaya', 'Kaita', 'Katsina', 'Kemawa', 'Sakaba', 'Sumaila', 'Talata Mafara',
  'Yauri', 'Zuru'
]

export default function SchoolForm({
  initialData,
  onSubmit,
  isEditing = false,
}: SchoolFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    lga: initialData?.lga || '',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    principal_name: initialData?.principal_name || '',
    principal_email: initialData?.principal_email || '',
  })

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
      router.push('/dashboard/schools')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditing ? 'Edit School' : 'Create New School'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="form-label">School Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="e.g., Government Secondary School"
          />
        </div>

        <div className="form-group">
          <label className="form-label">School Code *</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="e.g., GSS001"
          />
        </div>

        <div className="form-group">
          <label className="form-label">LGA *</label>
          <select
            name="lga"
            value={formData.lga}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select LGA</option>
            {lgaList.map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input-field"
            placeholder="School address"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
            placeholder="School phone number"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="School email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Principal Name</label>
          <input
            type="text"
            name="principal_name"
            value={formData.principal_name}
            onChange={handleChange}
            className="input-field"
            placeholder="Principal's full name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Principal Email</label>
          <input
            type="email"
            name="principal_email"
            value={formData.principal_email}
            onChange={handleChange}
            className="input-field"
            placeholder="Principal's email"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update School' : 'Create School'}
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
