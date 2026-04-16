'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Class, Student, Result, ReportCard } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Download, FileText } from 'lucide-react'

const supabase = getSupabaseClient()

export default function ReportCardsPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [term, setTerm] = useState('First')
  const [year, setYear] = useState(new Date().getFullYear())
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [reportCard, setReportCard] = useState<any>(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents()
    }
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes', { credentials: 'include' })
      
      if (response.status === 401) {
        window.location.href = '/sign-in'
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
    }
  }

  const fetchClassStudents = async () => {
    try {
      const response = await fetch(`/api/students?class_id=${selectedClass}`, {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        window.location.href = '/sign-in'
        return
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setStudents(Array.isArray(data) ? data : [])
      setSelectedStudent('')
    } catch (err) {
      console.error('Error fetching students:', err)
      setError(err instanceof Error ? err.message : 'Error fetching students')
    }
  }

  const generateReportCard = async () => {
    if (!selectedStudent) {
      setError('Please select a student')
      return
    }

    setGenerating(true)
    setError('')

    try {
      // Fetch student results
      const resultsResponse = await fetch(`/api/results?studentId=${selectedStudent}`, { credentials: 'include' })
      if (!resultsResponse.ok) throw new Error('Failed to fetch results')
      const results = await resultsResponse.json()

      // Calculate totals
      const totalScore = results.reduce((sum: number, r: any) => sum + r.score, 0)
      const average = results.length > 0 ? totalScore / results.length : 0

      const generatedReportCard = {
        id: Math.random().toString(36).substr(2, 9),
        student_id: selectedStudent,
        class_id: selectedClass,
        term: term as any,
        year,
        total_score: totalScore,
        class_average: average,
        results,
        student: students.find((s) => s.id === selectedStudent),
      }

      setReportCard(generatedReportCard)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating report card')
    } finally {
      setGenerating(false)
    }
  }

  const downloadPDF = async () => {
    if (!reportCard) return

    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      const element = document.getElementById('report-card-content')
      if (!element) return

      const canvas = await html2canvas(element, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`report-card-${reportCard.student.registration_number}.pdf`)
    } catch (err) {
      setError('Error generating PDF')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Report Cards</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <label className="form-label">Select Student *</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="input-field"
              disabled={!selectedClass || students.length === 0}
            >
              <option value="">-- Select Student --</option>
              {students?.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              )) || []}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="input-field"
            >
              <option value="First">First Term</option>
              <option value="Second">Second Term</option>
              <option value="Third">Third Term</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input-field"
            />
          </div>
        </div>

        <button
          onClick={generateReportCard}
          disabled={generating || !selectedStudent}
          className="btn-primary flex items-center gap-2"
        >
          <FileText size={20} /> {generating ? 'Generating...' : 'Generate Report Card'}
        </button>
      </div>

      {reportCard && (
        <>
          <div
            id="report-card-content"
            className="card bg-white max-w-2xl mx-auto mb-6 p-8 border-2 border-primary"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Report Card</h2>
              <p className="text-gray-600">Kebbi State School Management System</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b-2 border-gray-300">
              <div>
                <label className="text-sm text-gray-600">Student Name:</label>
                <p className="font-semibold text-gray-800">
                  {reportCard.student.first_name} {reportCard.student.last_name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Registration #:</label>
                <p className="font-semibold text-gray-800">{reportCard.student.registration_number}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Term:</label>
                <p className="font-semibold text-gray-800">{reportCard.term} Term</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Year:</label>
                <p className="font-semibold text-gray-800">{reportCard.year}</p>
              </div>
            </div>

            <table className="w-full mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-gray-700">Subject</th>
                  <th className="px-4 py-2 text-center text-gray-700">Score</th>
                  <th className="px-4 py-2 text-center text-gray-700">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reportCard.results.map((result: any) => (
                  <tr key={result.id}>
                    <td className="px-4 py-2 text-gray-800">-</td>
                    <td className="px-4 py-2 text-center font-medium">{result.score}</td>
                    <td className="px-4 py-2 text-center font-semibold">{result.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-gray-300">
              <div>
                <label className="text-sm text-gray-600">Total Score:</label>
                <p className="font-bold text-lg text-gray-800">{reportCard.total_score}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Class Average:</label>
                <p className="font-bold text-lg text-gray-800">
                  {reportCard.class_average?.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Position:</label>
                <p className="font-bold text-lg text-gray-800">-</p>
              </div>
            </div>
          </div>

          <button
            onClick={downloadPDF}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Download size={20} /> Download as PDF
          </button>
        </>
      )}
    </div>
  )
}
