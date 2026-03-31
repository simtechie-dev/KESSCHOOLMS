'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { School, Class, FeeStructure } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function EditFeePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [formData, setFormData] = useState({
    school_id: '',
    class_id: '',
    term: 'First',
    year: new Date().getFullYear(),
    tuition_fee: '',
    development_fee: '',
    other_fees: '',
  })

  useEffect(() => {
    fetchFee()
    fetchSchools()
  }, [])

  useEffect(() => {
    if (formData.school_id) {
      fetchClasses(formData.school_id)
    }
  }, [formData.school_id])

  const fetchFee = async () => {
    try {
      const response = await fetch(`/api/fees/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch fee')
      const data = await response.json()
      setFormData({
        school_id: data.school_id,
        class_id: data.class_id,
        term: data.term,
        year: data.year,
        tuition_fee: data.tuition_fee?.toString() || '',
        development_fee: data.development_fee?.toString() || '',
        other_fees: data.other_fees?.toString() || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

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

  const fetchClasses = async (schoolId: string) => {
    try {
      const response = await fetch(`/api/classes?schoolId=${schoolId}`)
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch(`/api/fees/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tuition_fee: formData.tuition_fee ? parseFloat(formData.tuition_fee) : null,
          development_fee: formData.development_fee ? parseFloat(formData.development_fee) : null,
          other_fees: formData.other_fees ? parseFloat(formData.other_fees) : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update fee')
      }

      router.push('/dashboard/fees')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Edit Fee Structure</h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label className="form-label">Class *</label>
            <select
              name="class_id"
              value={formData.class_id}
              onChange={handleChange}
              required
              className="input-field"
              disabled={!formData.school_id}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Term *</label>
            <select
              name="term"
              value={formData.term}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="First">First Term</option>
              <option value="Second">Second Term</option>
              <option value="Third">Third Term</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Year *</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tuition Fee</label>
            <input
              type="number"
              name="tuition_fee"
              value={formData.tuition_fee}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Development Fee</label>
            <input
              type="number"
              name="development_fee"
              value={formData.development_fee}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Other Fees</label>
            <input
              type="number"
              name="other_fees"
              value={formData.other_fees}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Fee Structure'}
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
    </div>
  )
}
