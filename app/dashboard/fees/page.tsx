'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FeeStructure } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import FeeCard from '@/components/FeeCard'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function FeesPage() {
  const [fees, setFees] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  const fetchFees = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedTerm) params.append('term', selectedTerm)
      if (selectedYear) params.append('year', selectedYear)

      const response = await fetch(`/api/fees?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch fees')
      const data = await response.json()
      setFees(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFees()
  }, [selectedTerm, selectedYear])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fee structure?')) return

    try {
      const response = await fetch(`/api/fees/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete fee')
      setFees(fees.filter((f) => f.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const filteredFees = fees.filter((fee) =>
    fee.class_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Fee Management</h1>
          <p className="text-gray-600 mt-2">Manage school fee structures</p>
        </div>
        <Link
          href="/dashboard/fees/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Add Fee
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              placeholder="Search by class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="input-field"
            >
              <option value="">All Terms</option>
              <option value="First">First Term</option>
              <option value="Second">Second Term</option>
              <option value="Third">Third Term</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <input
              type="number"
              placeholder="Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFees.map((fee) => (
          <div key={fee.id} className="relative">
            <FeeCard
              title={`Class Fee`}
              amount={(fee.tuition_fee || 0) + (fee.development_fee || 0) + (fee.other_fees || 0)}
              term={fee.term}
              year={fee.year}
              isMandatory={true}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Link
                href={`/dashboard/fees/${fee.id}`}
                className="text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <Edit2 size={18} />
              </Link>
              <button
                onClick={() => handleDelete(fee.id)}
                className="text-red-600 hover:text-red-800"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFees.length === 0 && (
        <div className="card text-center py-8 text-gray-600">
          No fee structures found. {fees.length === 0 && 'Create your first fee structure!'}
        </div>
      )}
    </div>
  )
}
