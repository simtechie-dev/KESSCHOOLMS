import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { User } from '@/lib/types'

async function getUserData(clerkId: string): Promise<User | null> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single()

  if (error || !data) return null
  

  
  return data as User
}

function getNavItems(role: string) {
  const baseItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
  ]

  const roleSpecificItems: Record<string, typeof baseItems> = {
    state_admin: [
      ...baseItems,
      { label: 'Schools', href: '/dashboard/schools', icon: '🏫' },
      { label: 'Subjects', href: '/dashboard/subjects', icon: '📖' },
      { label: 'Sessions', href: '/dashboard/sessions', icon: '📅' },
      { label: 'Terms', href: '/dashboard/terms', icon: '📄' },
      { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
      { label: 'Results', href: '/dashboard/results', icon: '🎯' },
      { label: 'Reports', href: '/dashboard/reports', icon: '📑' },
    ],
    school_admin: [
      ...baseItems,
      { label: 'Students', href: '/dashboard/students', icon: '👨‍🎓' },
      { label: 'Teachers', href: '/dashboard/teachers', icon: '👨‍🏫' },
      { label: 'Classes', href: '/dashboard/classes', icon: '📚' },
      { label: 'Subjects', href: '/dashboard/subjects', icon: '📖' },
      { label: 'Sessions', href: '/dashboard/sessions', icon: '📅' },
      { label: 'Terms', href: '/dashboard/terms', icon: '📄' },
      { label: 'Attendance', href: '/dashboard/attendance', icon: '✅' },
      { label: 'Results', href: '/dashboard/results', icon: '🎯' },
      { label: 'Reports', href: '/dashboard/reports', icon: '📑' },
    ],
    teacher: [
      ...baseItems,
      { label: 'My Classes', href: '/dashboard/my-classes', icon: '📚' },
      { label: 'Attendance', href: '/dashboard/attendance', icon: '✅' },
      { label: 'Results', href: '/dashboard/results', icon: '🎯' },
      { label: 'Reports', href: '/dashboard/reports', icon: '📊' },
    ],
    student: [
      ...baseItems,
      { label: 'My Grades', href: '/dashboard/my-grades', icon: '📊' },
      { label: 'My Attendance', href: '/dashboard/my-attendance', icon: '✅' },
      { label: 'Report Card', href: '/dashboard/report-card', icon: '📄' },
    ],
  }

  return roleSpecificItems[role] || baseItems
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await getUserData(userId)

  const roleLabels: Record<string, string> = {
    school_admin: 'SCHOOL ADMIN',
    state_admin: 'STATE ADMIN',
    teacher: 'TEACHER',
    student: 'STUDENT',
  }

  const userRole = user?.role || 'student'
  const userDisplay = user?.full_name || 'User'
  const displayRole = roleLabels[userRole] || userRole.replace('_', ' ').toUpperCase()

  const navItems = getNavItems(userRole)

  return (
    <div className="flex">
      <Sidebar navItems={navItems} userRole={displayRole} />
      <main className="flex-1 md:ml-64 min-h-screen bg-gray-50">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
