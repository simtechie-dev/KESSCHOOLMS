import { UserRole } from './types'

export const gradeScale = [
  { range: [75, 100], grade: 'A', description: 'Excellent', point: 5 },
  { range: [65, 74], grade: 'B', description: 'Very Good', point: 4 },
  { range: [55, 64], grade: 'C', description: 'Good', point: 3 },
  { range: [45, 54], grade: 'D', description: 'Pass', point: 2 },
  { range: [0, 44], grade: 'F', description: 'Fail', point: 0 },
]

export function calculateGrade(score: number): string {
  const gradeObj = gradeScale.find(
    ({ range }) => score >= range[0] && score <= range[1]
  )
  return gradeObj?.grade || 'F'
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function capFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function generateRegistrationNumber(schoolCode: string, index: number): string {
  const year = new Date().getFullYear()
  return `${schoolCode}-${year}-${String(index + 1).padStart(4, '0')}`
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    state_admin: 'State Administrator',
    school_admin: 'School Administrator',
    teacher: 'Teacher',
    student: 'Student',
  }
  return labels[role]
}

export function canAccess(userRole: UserRole, resource: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    state_admin: ['schools', 'analytics', 'users', 'reports'],
    school_admin: ['students', 'teachers', 'classes', 'attendance', 'results', 'reports'],
    teacher: ['classes', 'attendance', 'results', 'grades'],
    student: ['profile', 'grades', 'attendance', 'reports'],
  }
  return permissions[userRole]?.includes(resource) || false
}

export function getAttendanceColor(status: string): string {
  const colors: Record<string, string> = {
    Present: 'bg-green-100 text-green-800',
    Absent: 'bg-red-100 text-red-800',
    Late: 'bg-yellow-100 text-yellow-800',
    Excused: 'bg-blue-100 text-blue-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Completed: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Failed: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function calculateAttendancePercentage(
  presentDays: number,
  totalDays: number
): number {
  if (totalDays === 0) return 0
  return Math.round((presentDays / totalDays) * 100)
}
