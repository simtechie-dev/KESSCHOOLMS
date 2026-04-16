'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Exam, Result, Subject, Class, Student } from '@/lib/types'
import { calculateGrade } from '@/lib/utils'
import { Save } from 'lucide-react'

interface GradeEntry {
  student_id: string
  score: number | ''
  remarks?: string
}

export default function GradesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [results, setResults] = useState<Record<string, Result | null>>({})
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedExam, setSelectedExam] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({})

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchClassData()
    }
  }, [selectedClass])

  useEffect(() => {
    if (selectedExam && students.length > 0) {
      fetchResults()
    }
  }, [selectedExam])

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
    }
  }

  const fetchClassData = async () => {
    try {
      setLoading(true)
      const classResponse = await fetch(`/api/classes/${selectedClass}`)
      if (classResponse.ok) {
        const classData = await classResponse.json()
        setExams(classData.exams || [])
      }

      const studentsResponse = await fetch(`/api/classes/${selectedClass}/students`)
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setStudents(Array.isArray(studentsData) ? studentsData : [])
        const gradeRecords: Record<string, GradeEntry> = {}

        studentsData.forEach((student: Student) => {
          gradeRecords[student.id] = { student_id: student.id, score: '' }
        })
        setGrades(gradeRecords)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/results?examId=${selectedExam}`)
      if (response.ok) {
        const data = await response.json()
        const resultRecords: Record<string, Result> = {}
        const gradeRecords: Record<string, GradeEntry> = {}

        data.forEach((result: Result) => {
          resultRecords[result.student_id] = result
          gradeRecords[result.student_id] = {
            student_id: result.student_id,
            score: result.score,
            remarks: result.remarks,
          }
        })

        setResults(resultRecords)
        setGrades((prev) => ({ ...prev, ...gradeRecords }))
      }
    } catch (err) {
      console.error('Error fetching results:', err)
    }
  }

  const handleGradeChange = (studentId: string, score: string) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: score === '' ? '' : Math.min(100, Math.max(0, parseInt(score) || 0)),
      },
    }))
  }

  const handleSaveGrades = async () => {
    if (!selectedExam) {
      setError('Please select an exam')
      return
    }

    setSaving(true)
    setError('')

    try {
      const gradesToSave = Object.values(grades).filter((grade) => grade.score !== '')

      const promises = gradesToSave.map((grade) =>
        fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: grade.student_id,
            exam_id: selectedExam,
            score: grade.score,
            remarks: grade.remarks,
          }),
        })
      )

      await Promise.all(promises)
      alert('Grades saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving grades')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Grades & Results</h1>

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
            <label className="form-label">Select Exam *</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="input-field"
              disabled={!selectedClass}
            >
              <option value="">-- Select Exam --</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.exam_type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedClass && selectedExam && students.length > 0 && (
        <>
          <div className="table-container mb-6">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Student Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Registration #</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Score</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students?.map((student) => {
                  const grade = grades[student.id]
                  const letterGrade = grade?.score !== '' ? calculateGrade(Number(grade?.score)) : '-'

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{student.registration_number}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={grade?.score || ''}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          className="input-field py-1 px-2 w-20"
                          placeholder="0-100"
                        />
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        <span className={`badge ${letterGrade === '-' ? '' : letterGrade === 'F' ? 'bg-red-100 text-red-800' : 'badge-success'}`}>
                          {letterGrade}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSaveGrades}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={20} /> {saving ? 'Saving...' : 'Save Grades'}
          </button>
        </>
      )}

      {selectedClass && selectedExam && students.length === 0 && (
        <div className="card text-center py-8 text-gray-600">
          No students enrolled in this class yet.
        </div>
      )}
    </div>
  )
}

