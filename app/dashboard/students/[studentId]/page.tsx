'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Student, Enrollment, Attendance } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'

export default function StudentDetailPage() {
  const params = useParams()
  const studentId = params.studentId as string
  const [student, setStudent] = useState<Student | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStudentData()
  }, [studentId])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/students/${studentId}`)
      if (!response.ok) throw new Error('Failed to fetch student')
      const data = await response.json()
      setStudent(data)

      // Fetch enrollments
      const enrollmentsResponse = await fetch(`/api/enrollments?studentId=${studentId}`)
      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json()
        setEnrollments(enrollmentsData)
      }

      // Fetch attendance
      const attendanceResponse = await fetch(`/api/attendance?studentId=${studentId}`)
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json()
        setAttendance(attendanceData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching student data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  if (!student) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Student not found
      </div>
    )
  }

  return (
    <div>
      <Link href="/dashboard/students" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8">
        <ArrowLeft size={20} /> Back to Students
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Info */}
        <div className="lg:col-span-2">
          <div className="card mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-3xl text-white font-bold">
                  {student.first_name.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {student.first_name} {student.last_name}
                </h1>
                <p className="text-gray-600">{student.registration_number}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Gender</label>
                <p className="text-gray-800">{student.gender || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Date of Birth</label>
                <p className="text-gray-800">
                  {student.date_of_birth ? formatDate(student.date_of_birth) : 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Parent Phone</label>
                <p className="text-gray-800">{student.parent_phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Parent Email</label>
                <p className="text-gray-800">{student.parent_email || '-'}</p>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Attendance Summary</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-primary">{attendance.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">
                  {attendance.filter((a) => a.status === 'Present').length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">
                  {attendance.filter((a) => a.status === 'Absent').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {attendance.filter((a) => a.status === 'Late').length}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Attendance</h2>
            <div className="table-container">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendance.slice(0, 10).map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-3 text-gray-800">{formatDate(record.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${
                          record.status === 'Present'
                            ? 'badge-success'
                            : record.status === 'Absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendance.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  No attendance records
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Actions</h3>
            <div className="space-y-2">
              <a
                href={`/dashboard/students/${studentId}/edit`}
                className="block p-3 bg-blue-50 hover:bg-blue-100 rounded text-blue-600 font-medium"
              >
                Edit Student
              </a>
              <a
                href={`/dashboard/grades?student=${studentId}`}
                className="block p-3 bg-green-50 hover:bg-green-100 rounded text-green-600 font-medium"
              >
                View Grades
              </a>
              <a
                href={`/dashboard/reports?student=${studentId}`}
                className="block p-3 bg-purple-50 hover:bg-purple-100 rounded text-purple-600 font-medium flex items-center gap-2"
              >
                <Download size={18} /> Download Report Card
              </a>
            </div>
          </div>

          <div className="card mt-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Info</h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-gray-600">Registered</label>
                <p className="font-medium text-gray-800">{formatDate(student.created_at)}</p>
              </div>
              <div>
                <label className="text-gray-600">Last Updated</label>
                <p className="font-medium text-gray-800">{formatDate(student.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
