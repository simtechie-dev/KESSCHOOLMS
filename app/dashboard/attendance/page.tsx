'use client'

import { useEffect, useState } from 'react'
import { Attendance, Class, Student } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import { formatDate, getAttendanceColor } from '@/lib/utils'
import { Save } from 'lucide-react'

interface AttendanceRecord {
  student_id: string
  status: 'Present' | 'Absent' | 'Late' | 'Excused'
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, Attendance | null>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents()
      fetchAttendance()
    }
  }, [selectedClass, selectedDate])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching classes')
    } finally {
      setLoading(false)
    }
  }

  const fetchClassStudents = async () => {
    try {
      const response = await fetch(`/api/classes/${selectedClass}/students`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
        // Initialize attendance records
        const records: Record<string, Attendance | null> = {}
        data.forEach((student: Student) => {
          records[student.id] = null
        })
        setAttendance(records)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching students')
    }
  }

  const fetchAttendance = async () => {
    try {
      const response = await fetch(
        `/api/attendance?classId=${selectedClass}&date=${selectedDate}`
      )
      if (response.ok) {
        const data = await response.json()
        const records: Record<string, Attendance> = {}
        data.forEach((record: Attendance) => {
          records[record.student_id] = record
        })
        setAttendance(records)
      }
    } catch (err) {
      console.error('Error fetching attendance:', err)
    }
  }

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        student_id: studentId,
        class_id: selectedClass,
        date: selectedDate,
        status: status as any,
      } as Attendance,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const recordsToSave = Object.values(attendance).filter((record) => record !== null)

      const promises = recordsToSave.map((record) =>
        fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        })
      )

      await Promise.all(promises)
      alert('Attendance saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving attendance')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Attendance Tracking</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="form-group">
            <label className="form-label">Select Class *</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field"
            >
              <option value="">-- Select Class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {selectedClass && students.length > 0 && (
        <>
          <div className="table-container mb-6">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Student Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Registration #</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.registration_number}</td>
                    <td className="px-6 py-4">
                      <select
                        value={attendance[student.id]?.status || ''}
                        onChange={(e) => handleStatusChange(student.id, e.target.value)}
                        className="input-field py-1 px-2"
                      >
                        <option value="">Select Status</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Excused">Excused</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={20} /> {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </>
      )}

      {selectedClass && students.length === 0 && (
        <div className="card text-center py-8 text-gray-600">
          No students enrolled in this class yet.
        </div>
      )}
    </div>
  )
}
