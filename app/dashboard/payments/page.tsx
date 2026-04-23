'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Payment } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import PaymentBadge from '@/components/PaymentBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Eye } from 'lucide-react'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedTerm) params.append('term', selectedTerm)
      if (selectedYear) params.append('year', selectedYear)
      if (selectedStatus) params.append('status', selectedStatus)

      const response = await fetch(`/api/payments?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch payments')
      const data = await response.json()
      setPayments(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [selectedTerm, selectedYear, selectedStatus])

  const filteredPayments = payments.filter((payment) => {
    const studentName = (payment as any).students
      ? `${(payment as any).students.first_name} ${(payment as any).students.last_name}`
      : ''
    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment as any).students?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-600 mt-2">Record and track fee payments</p>
        </div>
        <Link
          href="/dashboard/payments/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Record Payment
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              placeholder="Search by student name..."
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
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Student</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Term</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Year</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Method</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {(payment as any).students
                    ? `${(payment as any).students.first_name} ${(payment as any).students.last_name}`
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 text-gray-600">{formatCurrency(payment.amount)}</td>
                <td className="px-6 py-4 text-gray-600">{payment.term}</td>
                <td className="px-6 py-4 text-gray-600">{payment.year}</td>
                <td className="px-6 py-4 text-gray-600">{payment.payment_method || '-'}</td>
                <td className="px-6 py-4 text-gray-600">{formatDate(payment.payment_date)}</td>
                <td className="px-6 py-4">
                  <PaymentBadge status={payment.status} />
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/students/${payment.student_id}/fees`}
                    className="text-blue-600 hover:text-blue-800"
                    title="View"
                  >
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPayments.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No payments found. {payments.length === 0 && 'Record your first payment!'}
          </div>
        )}
      </div>
    </div>
  )
}
