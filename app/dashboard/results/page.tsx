'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Save, Calendar, BookOpen } from 'lucide-react'
import { calculateGrade } from '@/lib/utils'
import type { Result, Student, Class, Term, Subject } from '@/lib/types'

interface ScoreEntry {
  student_id: string
  ca1: number | ''
  ca2: number | ''
  exam: number | ''
  total: number
  grade: string
}

export default function ResultsPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [terms, setTerms] = useState<Term[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchClasses()
    fetchTerms()
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedClass && selectedTerm && selectedSubject) {
      fetchStudentsAndScores()
    }
  }, [selectedClass, selectedTerm, selectedSubject])

  const fetchClasses = async () => {
    try {
      const teacherRes = await fetch('/api/dashboard/teacher')
      if (teacherRes.ok) {
        const teacherData = await teacherRes.json()
        setClasses(teacherData.classes || [])
        return
      }
    } catch (err) {
      console.error('Error fetching teacher classes:', err)
    }
    const res = await fetch('/api/classes')
    if (res.ok) setClasses(await res.json())
  }

  const fetchTerms = async () => {
    const res = await fetch('/api/terms')
    if (res.ok) setTerms(await res.json())
  }

  const fetchSubjects = async () => {
    const res = await fetch('/api/subjects')
    if (res.ok) setSubjects(await res.json())
  }

  const fetchStudentsAndScores = async () => {
    setLoading(true)
    try {
      // Fetch enrolled students
      const studentsRes = await fetch(`/api/classes/${selectedClass}/students`)
      let classStudents = await studentsRes.json()
      // Dedupe students
      const uniqueStudents = Array.from(new Map(classStudents.map((s: Student) => [s.id, s])).values())
      setStudents(uniqueStudents)

      // Initialize scores
      const scoreRecords: Record<string, ScoreEntry> = {}
      uniqueStudents.forEach((student: Student) => {
        scoreRecords[student.id] = {
          student_id: student.id,
          ca1: '',
          ca2: '',
          exam: '',
          total: 0,
          grade: ''
        }
      })
      setScores(scoreRecords)

      // Fetch existing scores
      const resultsRes = await fetch(`/api/results?class_id=${selectedClass}&term_id=${selectedTerm}&subject_id=${selectedSubject}`)
      if (resultsRes.ok) {
        const results = await resultsRes.json()
        results.forEach((r: Result) => {
          if (scoreRecords[r.student_id]) {
            scoreRecords[r.student_id] = {
              ...scoreRecords[r.student_id],
              ca1: r.ca1 ?? '',
              ca2: r.ca2 ?? '',
              exam: r.exam ?? '',
              total: r.total ?? 0,
              grade: r.grade ?? ''
            }
          }
        })
        setScores(scoreRecords)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateScore = (studentId: string, field: 'ca1' | 'ca2' | 'exam', value: string) => {
    setScores(prev => {
      const entry = { ...prev[studentId] }
      entry[field] = value
      const ca1 = Number(entry.ca1) || 0
      const ca2 = Number(entry.ca2) || 0
      const exam = Number(entry.exam) || 0
      entry.total = ca1 + ca2 + exam
      entry.grade = entry.total > 0 ? calculateGrade(entry.total) : ''
      return { ...prev, [studentId]: entry }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const payload = {
        term_id: selectedTerm,
        class_id: selectedClass,
        subject_id: selectedSubject,
        scores: Object.values(scores).map(s => ({
          student_id: s.student_id,
          ca1: Number(s.ca1) || 0,
          ca2: Number(s.ca2) || 0,
          exam: Number(s.exam) || 0
        }))
      }

      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setMessage('Results saved/updated successfully!')
        fetchStudentsAndScores() // Refresh
      } else {
        const err = await res.json()
        console.error('Full error:', JSON.stringify(err, null, 2))
        setMessage('Save failed: ' + (err?.error || err?.message || JSON.stringify(err)))
      }
    } catch (err) {
      console.error(err)
      setMessage('Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="mb-8">
  <h1 className="text-3xl font-bold text-gray-800 mb-4">Enter Results</h1>
    <p className="text-gray-600 mt-2">For your assigned classes only</p>
        <p className="text-gray-600">CA1 (30) + CA2 (30) + Exam (40) = Total (100)</p>
      </div>

      {message && (
        <div className="alert alert-success mb-6">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Class *</span>
          </label>
          <select className="select select-bordered w-full" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Term *</span>
          </label>
          <select className="select select-bordered w-full" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
            <option value="">Select Term</option>
            {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Subject *</span>
          </label>
          <select className="select select-bordered w-full" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">{students.length} students</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>CA1 (30)</th>
                  <th>CA2 (30)</th>
                  <th>Exam (40)</th>
                  <th>Total</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(scores).map((entry) => (
                  <tr key={entry.student_id}>
                    <td className="font-medium">
                      {students.find(s => s.id === entry.student_id)?.first_name} {students.find(s => s.id === entry.student_id)?.last_name}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        className="input input-sm input-bordered w-20 border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary"
                        value={entry.ca1 || ''}
                        onChange={(e) => updateScore(entry.student_id, 'ca1', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        className="input input-sm input-bordered w-20 border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary"
                        value={entry.ca2 || ''}
                        onChange={(e) => updateScore(entry.student_id, 'ca2', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        className="input input-sm input-bordered w-20 border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary"
                        value={entry.exam || ''}
                        onChange={(e) => updateScore(entry.student_id, 'exam', e.target.value)}
                      />
                    </td>
                    <td className="font-bold">{entry.total}</td>
                    <td><span className={`badge ${entry.grade === 'A' ? 'badge-success' : entry.grade === 'F' ? 'badge-error' : 'badge-warning'}`}>{entry.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t bg-base-200">
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : `Save Results for ${subjects.find(s => s.id === selectedSubject)?.name || 'Subject'}`}
            </button>
          </div>
        </div>
      )}

      {selectedClass && selectedTerm && selectedSubject && students.length === 0 && !loading && (
        <div className="alert alert-info">
          No students enrolled or no data for this combination.
        </div>
      )}
    </div>
  )
}

