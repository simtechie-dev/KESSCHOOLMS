'use client'

import { formatCurrency } from '@/lib/utils'

interface FeeSummary {
  feeName: string
  amount: number
  paid: number
  balance: number
}

interface FeeSummaryTableProps {
  summaries: FeeSummary[]
  studentName: string
}

export default function FeeSummaryTable({
  summaries,
  studentName,
}: FeeSummaryTableProps) {
  const totalOwed = summaries.reduce((sum, s) => sum + s.amount, 0)
  const totalPaid = summaries.reduce((sum, s) => sum + s.paid, 0)
  const totalBalance = summaries.reduce((sum, s) => sum + s.balance, 0)

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Fee Summary for {studentName}
      </h3>
      <div className="table-container">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Fee Name</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">Amount</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">Paid</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {summaries.map((summary, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{summary.feeName}</td>
                <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(summary.amount)}</td>
                <td className="px-6 py-4 text-right text-green-600">{formatCurrency(summary.paid)}</td>
                <td className="px-6 py-4 text-right text-red-600">{formatCurrency(summary.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold">
            <tr>
              <td className="px-6 py-4 text-gray-800">Total</td>
              <td className="px-6 py-4 text-right text-gray-800">{formatCurrency(totalOwed)}</td>
              <td className="px-6 py-4 text-right text-green-600">{formatCurrency(totalPaid)}</td>
              <td className="px-6 py-4 text-right text-red-600">{formatCurrency(totalBalance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
