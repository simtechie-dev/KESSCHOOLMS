'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useUser } from '@clerk/nextjs'

interface TeacherClass {
  id: string
  name: string
  code: string
  student_count: number
}

export default function MyClassesPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchClasses()
    } else if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard/teacher')
      if (!res.ok) throw new Error('Failed to fetch classes')
      const data = await res.json()
      setClasses(data.classes || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) return <LoadingSpinner />

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Classes</h1>
          <p className="text-gray-600 mt-2">Classes assigned to you</p>
        </div>
      </div>

      <div className="card">
        {classes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl mb-4">No classes assigned yet</p>
            <p className="text-gray-400">Contact school admin to assign classes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Code</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id}>
                    <td className="font-semibold">{cls.name}</td>
                    <td>{cls.code}</td>
                    <td className="font-mono">{cls.student_count}</td>
                    <td className="flex gap-2">
                      <a 
                        href={`/dashboard/attendance?class_id=${cls.id}`}
                        className="btn btn-sm btn-success"
                      >
                        Take Attendance
                      </a>
                      <a 
                        href={`/dashboard/results?class_id=${cls.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        Enter Results
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

