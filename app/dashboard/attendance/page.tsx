'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock, HelpCircle, Send } from 'lucide-react'

interface StudentAttendance {
  student_id: string
  first_name: string
  last_name: string
  registration_number: string
  status?: 'Present' | 'Absent' | 'Late' | 'Excused' | null
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<any[]>([])
  const [terms, setTerms] = useState<any[]>([])
  const [students, setStudents] = useState<StudentAttendance[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchClasses()
    fetchTerms()
  }, [])

  useEffect(() => {
    if (selectedClass && selectedTerm) {
      fetchStudents()
    }
  }, [selectedClass, selectedTerm, date])

  const fetchClasses = async () => {
    try {
      const teacherRes = await fetch('/api/dashboard/teacher')
      if (teacherRes.ok) {
        const teacherData = await teacherRes.json()
        setClasses(teacherData.classes || [])
      }
    } catch (err) {
      console.error('Error fetching teacher classes:', err)
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    }
  }

  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/terms')
      if (response.ok) {
        const data = await response.json()
        setTerms(data)
      }
    } catch (err) {
      console.error('Error fetching terms:', err)
    }
  }

  const fetchStudents = async () => {
    if (!selectedClass || !selectedTerm) return
    try {
      setLoading(true)
      const params = new URLSearchParams({
        class_id: selectedClass,
        date,
        term_id: selectedTerm
      })
      const response = await fetch(`/api/attendance?${params}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(Array.isArray(data) ? data : [])
        // Initialize attendance state - default Absent if no status
        const attendanceObj: Record<string, string> = {}

        data.forEach((item: StudentAttendance) => {
          attendanceObj[item.student_id] = item.status || 'Absent'
        })
        setAttendance(attendanceObj)
      } else {
        setError('Failed to load students/attendance')
      }
    } catch (err) {
      console.error('Error fetching students:', err)
      setError('Failed to load students/attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        student_id: studentId,
        status
      }))

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: selectedClass,
          date,
          term_id: selectedTerm,
          records
        })
      })

      if (response.ok) {
        setMessage('Attendance saved successfully!')
        setTimeout(() => setMessage(''), 3000)
        // Refetch to update status
        fetchStudents()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save attendance')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const statusColor = (status: string): string => {
    switch (status) {
      case 'Present': return 'bg-success text-success-content'
      case 'Absent': return 'bg-error text-error-content'
      case 'Late': return 'bg-warning text-warning-content'
      case 'Excused': return 'bg-info text-info-content'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  return (
    <div>
      <div className="mb-8">
  <h1 className="text-3xl font-bold text-gray-800 mb-4">Record Attendance</h1>
    <p className="text-gray-600">For your assigned classes only</p>
        <p className="text-gray-600">Record attendance for your class</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Class</span>
          </label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name} ({cls.code})</option>
              ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Term</span>
          </label>
          <select 
            value={selectedTerm} 
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Select Term</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>{term.name}</option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Date</span>
          </label>
          <div className="relative">
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="input input-bordered w-full pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <HelpCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="alert alert-success mb-6">
          <CheckCircle size={20} />
          <span>{message}</span>
        </div>
      )}

      {selectedClass && students.length === 0 && !loading && (
        <div className="alert alert-info mb-6">
          <Calendar size={20} />
          <span>No students found for selected class or no enrollment data.</span>
        </div>
      )}

      {students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              {students.length} students • {date}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="table-zebra w-full">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Registration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const currentStatus = attendance[student.student_id] || 'Absent'
                  return (
                    <tr key={student.student_id}>
                      <td className="font-medium">
                        {student.first_name} {student.last_name}
                      </td>
                      <td>{student.registration_number}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(currentStatus)}`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {(['Present', 'Absent', 'Late', 'Excused'] as const).map(status => (
                            <label className="label cursor-pointer gap-2 p-1 hover:bg-gray-100 rounded">
                              <input
                                type="radio"
                                name={`status-${student.student_id}`}
                                value={status}
                                checked={currentStatus === status}
                                onChange={() => handleStatusChange(student.student_id, status)}
                                className="radio radio-sm"
                              />
                              <span className="text-sm font-medium">{status[0]}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setStudents([])}
                className="btn btn-ghost"
              >
                Clear
              </button>
              <button 
                onClick={handleSave}
                disabled={saving || Object.keys(attendance).length === 0}
                className="btn btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <LoadingSpinner />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Save Attendance ({Object.keys(attendance).length} students)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600">Loading students...</span>
        </div>
      )}
    </div>
  )
}
