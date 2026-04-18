'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Download, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StudentDashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [studentData, setStudentData] = useState(null)
  const [grades, setGrades] = useState([])
  const [attendancePercentage, setAttendancePercentage] = useState(0)
  const [reportCardUrl, setReportCardUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetchStudentData()
    } else if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, user])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard/student')
      if (!res.ok) throw new Error('Failed to fetch student data')
      const data = await res.json()
      
      setStudentData(data.student)
      setGrades(data.stats.recentGrades || [])
      setAttendancePercentage(data.stats.attendancePercentage || 0)
      setReportCardUrl(`/dashboard/reports/${data.student.id}`)
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReportCard = () => {
    // Trigger print/download of report card
    window.open(reportCardUrl, '_blank')
  }

  if (!isLoaded) return <LoadingSpinner />

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {studentData?.first_name || user?.fullName || 'Student'}!
        </h1>
        <p className="text-gray-600 mt-2">View your academic progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-primary to-secondary text-white text-center p-8 rounded-2xl shadow-xl">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-75" />
          <h3 className="text-2xl font-bold mb-2">View Report Card</h3>
          <p className="mb-6 opacity-90">Download your latest results</p>
          <button 
            onClick={downloadReportCard}
            className="btn btn-lg w-full bg-white text-primary hover:bg-gray-100"
          >
            📄 View/Download Report Card
          </button>
        </div>
        <div className="card p-6">
          <StatCard title="Subjects" value={grades.length} icon="📚" color="green" />
        </div>
        <div className="card p-6">
          <StatCard title="Attendance %" value={attendancePercentage + '%'} icon="✅" color="blue" />
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <h2 className="text-xl font-bold">Recent Grades</h2>
        </div>
        {grades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Term</th>
                </tr>
              </thead>
              <tbody>
                {grades.slice(0, 5).map((grade: any) => (
                  <tr key={grade.id}>
                    <td className="font-medium">{grade.subject_name}</td>
                    <td className="font-bold">{grade.total || grade.score}</td>
                    <td>
                      <span className={`badge ${grade.grade === 'A' ? 'badge-success' : grade.grade === 'F' ? 'badge-error' : 'badge-warning'}`}>
                        {grade.grade}
                      </span>
                    </td>
                    <td>{grade.term_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500">No grades available yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
