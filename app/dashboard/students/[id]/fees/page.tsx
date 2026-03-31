'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Student, Payment, FeeStructure } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import FeeSummaryTable from '@/components/FeeSummaryTable'
import PaymentBadge from '@/components/PaymentBadge'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function StudentFeesPage() {
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [fees, setFees] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  useEffect(() => {
    fetchData()
  }, [studentId, selectedTerm, selectedYear])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [studentRes, paymentsRes, feesRes] = await Promise.all([
        fetch(`/api/students/${studentId}`),
        fetch(`/api/payments/${studentId}?term=${selectedTerm}&year=${selectedYear}`),
        fetch(`/api/fees?term=${selectedTerm}&year=${selectedYear}`),
      ])

      if (!studentRes.ok) throw new Error('Failed to fetch student')
      if (!paymentsRes.ok) throw new Error('Failed to fetch payments')
      if (!feesRes.ok) throw new Error('Failed to fetch fees')

      const studentData = await studentRes.json()
      const paymentsData = await paymentsRes.json()
      const feesData = await feesRes.json()

      setStudent(studentData)
      setPayments(paymentsData)
      setFees(feesData)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const calculateFeeSummary = () => {
    const summaries = fees.map((fee) => {
      const totalFee = (fee.tuition_fee || 0) + (fee.development_fee || 0) + (fee.other_fees || 0)
      const paid = payments
        .filter((p) => p.term === fee.term && p.year === fee.year && p.status === 'Completed')
        .reduce((sum, p) => sum + p.amount, 0)
      const balance = totalFee - paid

      return {
        feeName: `${fee.term} Term ${fee.year}`,
        amount: totalFee,
        paid,
        balance: Math.max(0, balance),
      }
    })

    return summaries
  }

  if (loading) return <LoadingSpinner />

  if (!student) {
    return (
      <div className="card text-center py-8 text-gray-600">
        Student not found
      </div>
    )
  }

  const feeSummaries = calculateFeeSummary()
  const totalOwed = feeSummaries.reduce((sum, s) => sum + s.amount, 0)
  const totalPaid = feeSummaries.reduce((sum, s) => sum + s.paid, 0)
  const totalBalance = feeSummaries.reduce((sum, s) => sum + s.balance, 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Fee Summary</h1>
        <p className="text-gray-600 mt-2">
          {student.first_name} {student.last_name} - {student.registration_number}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-1">Total Owed</h3>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalOwed)}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-1">Total Paid</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600 mb-1">Balance</h3>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalBalance)}</p>
        </div>
      </div>

      <FeeSummaryTable
        summaries={feeSummaries}
        studentName={`${student.first_name} ${student.last_name}`}
      />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Payment History</h2>
        <div className="table-container">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Term</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Year</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Method</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Reference</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">{formatDate(payment.payment_date)}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 text-gray-600">{payment.term}</td>
                  <td className="px-6 py-4 text-gray-600">{payment.year}</td>
                  <td className="px-6 py-4 text-gray-600">{payment.payment_method || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{payment.reference || '-'}</td>
                  <td className="px-6 py-4">
                    <PaymentBadge status={payment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              No payments recorded for this student
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
