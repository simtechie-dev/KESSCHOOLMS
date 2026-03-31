'use client'

interface PaymentBadgeProps {
  status: 'Pending' | 'Completed' | 'Failed'
}

export default function PaymentBadge({ status }: PaymentBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`badge ${getStatusStyles()}`}>
      {status}
    </span>
  )
}
