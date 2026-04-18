'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatCard from '@/components/StatCard'
import { useRouter } from 'next/navigation'

export default function TeacherDashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [classes, setClasses] = useState([])
  const [studentsCount, setStudentsCount] = useState(0)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetchTeacherData()
    } else if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, user])

  const fetchTeacherData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard/teacher')
      if (!res.ok) throw new Error('Failed to fetch teacher data')
      const data = await res.json()
      
      setClasses(data.classes || [])
      setStudentsCount(data.stats?.totalStudents || 0)
      setUserData(data.stats?.user)
    } catch (error) {
      console.error('Error fetching teacher data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) return <LoadingSpinner />
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {userData?.full_name || user?.fullName || 'Teacher'}!
        </h1>
        <p className="text-gray-600 mt-2">Manage your classes and grades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Assigned Classes" 
          value={classes.length} 
          icon="📚"
          color="blue"
        />
        <StatCard 
          title="Students" 
          value={studentsCount} 
          icon="👨‍🎓"
          color="green" 
        />
        <StatCard 
          title="Quick Actions" 
          value="" 
          icon="⚡"
          color="purple" 
        />
      </div>

      <div className="card">
        <div className="card-title flex justify-between items-center">
          <h2 className="text-xl font-bold">Assigned Classes</h2>
          <a href="/dashboard/my-classes" className="btn btn-sm btn-primary">View All</a>
        </div>
        {classes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Students</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {classes.slice(0, 5).map((cls: any) => (
                  <tr key={cls.id}>
                    <td>{cls.name}</td>
                    <td>{cls.student_count || 0}</td>
                    <td>
                      <a href={`/dashboard/classes/${cls.id}`} className="btn btn-sm btn-primary">
                        Enter Grades
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No classes assigned yet</p>
        )}
      </div>
    </div>
  )
}
