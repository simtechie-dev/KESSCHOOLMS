'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/types'
import StatCard from '@/components/StatCard'
import LoadingSpinner from '@/components/LoadingSpinner'

interface DashboardStats {
  totalSchools: number
  totalStudents: number
  totalTeachers: number
  totalAttendanceToday: number
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const router = useRouter()
  const [userData, setUserData] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAttendanceToday: 0,
  })
  const [showSetup, setShowSetup] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  if (!isLoaded) return null
  if (isLoaded && !isSignedIn) {
    router.push('/sign-in')
    return null
  }

  useEffect(() => {
    if (!isLoaded || !clerkUser) return

    setError(null)
    const fetchData = async () => {
      try {
        const syncResponse = await fetch('/api/auth/sync-user', {
          method: 'POST',
        })

        if (!syncResponse.ok) {
          throw new Error('Failed to sync user')
        }

        const user = await syncResponse.json()

        if (!user) {
          setShowSetup(true)
          setLoading(false)
          return
        }

        setUserData(user as User)

        const statsResponse = await fetch('/api/dashboard/stats')
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats')
        }

        const statsData = await statsResponse.json()
        console.log("Raw API data:", statsData)
        setStats({
          totalSchools: statsData.totalSchools || 0,
          totalStudents: statsData.totalStudents || 0,
          totalTeachers: statsData.totalTeachers || 0,
          totalAttendanceToday: statsData.totalAttendanceToday || 0,
        })

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoaded, clerkUser])

  if (showSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Account Setup Required</h1>
          <p className="text-gray-600 mb-4">
            Your account is being set up. Please refresh the page or contact support if this persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!userData) {
    return <div>No user data found after loading.</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {userData.full_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {userData.role === 'state_admin'
            ? 'State-level dashboard and analytics'
            : userData.role === 'school_admin'
            ? 'School management dashboard'
            : userData.role === 'teacher'
            ? 'Class and academic management'
            : 'Student portal'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {userData.role === 'state_admin' && (
          <>

            <StatCard
              title="Total Schools"
              value={typeof stats.totalSchools === 'object' ? stats.totalSchools.count : (stats.totalSchools || 0)}
              icon="🏫"
              color="blue"
            />
            <StatCard
              title="Total Students"
              value={typeof stats.totalStudents === 'object' ? stats.totalStudents.count : (stats.totalStudents || 0)}
              icon="👨‍🎓"
              color="green"
            />
            <StatCard
              title="Total Teachers"
              value={typeof stats.totalTeachers === 'object' ? stats.totalTeachers.count : (stats.totalTeachers || 0)}
              icon="👨‍🏫"
              color="purple"
            />

          </>
        )}

        {userData.role === 'school_admin' && (
          <>

            <StatCard
              title="Total Students"
              value={typeof stats.totalStudents === 'object' ? stats.totalStudents.count : stats.totalStudents}
              icon="👨‍🎓"
              color="blue"
            />
            <StatCard
              title="Total Teachers"
              value={typeof stats.totalTeachers === 'object' ? stats.totalTeachers.count : stats.totalTeachers}
              icon="👨‍🏫"
              color="green"
            />
            <StatCard
              title="Attendance Today"
              value={stats.totalAttendanceToday}
              icon="✅"
              color="orange"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
          <div className="space-y-2">
            {userData.role === 'school_admin' && (
              <>
                <a
                  href="/dashboard/students/new"
                  className="block p-3 hover:bg-blue-50 rounded text-blue-600 font-medium"
                >
                  ➕ Add New Student
                </a>
                <a
                  href="/dashboard/attendance"
                  className="block p-3 hover:bg-blue-50 rounded text-blue-600 font-medium"
                >
                  ✅ Record Attendance
                </a>
                <a
                  href="/dashboard/results"
                  className="block p-3 hover:bg-blue-50 rounded text-blue-600 font-medium"
                >
                  📊 Enter Grades
                </a>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Activity</h2>
          <p className="text-gray-600">No recent activity</p>
        </div>
      </div>
    </div>
  )
}
