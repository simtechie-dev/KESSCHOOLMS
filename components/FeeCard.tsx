'use client'

import { formatCurrency } from '@/lib/utils'

interface FeeCardProps {
  title: string
  amount: number
  term: string
  year: number
  isMandatory?: boolean
  onClick?: () => void
}

export default function FeeCard({
  title,
  amount,
  term,
  year,
  isMandatory = true,
  onClick,
}: FeeCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer hover:shadow-lg transition-shadow ${
        isMandatory ? 'border-l-4 border-primary' : 'border-l-4 border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {isMandatory && (
          <span className="badge badge-info text-xs">Mandatory</span>
        )}
      </div>
      <p className="text-2xl font-bold text-primary mb-2">
        {formatCurrency(amount)}
      </p>
      <div className="flex gap-2 text-sm text-gray-600">
        <span>{term} Term</span>
        <span>•</span>
        <span>{year}</span>
      </div>
    </div>
  )
}
