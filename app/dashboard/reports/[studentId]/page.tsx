'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Printer, ArrowLeft } from 'lucide-react'
import { calculateGrade } from '@/lib/utils'
import type { Student, Result, ReportCard, AttendanceSummary } from '@/lib/types'

export default function ReportCardPage() {
  const params = useParams()
  const studentId = params.studentId as string

  const [student, setStudent] = useState<Student | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [reportCard, setReportCard] = useState<ReportCard | null>(null)
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null)
  const [classAverage, setClassAverage] = useState(0)
  const [position, setPosition] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const termId = 'current-term-id' // Fetch from context or param
  const classId = 'current-class-id' // From enrollment

  useEffect(() => {
    if (studentId) {
      fetchReportCard()
    }
  }, [studentId])

  const fetchReportCard = async () => {
    try {
      setLoading(true)
      // Fetch student
      const studentRes = await fetch(`/api/students/${studentId}`)
      if (studentRes.ok) {
        const studentData = await studentRes.json()
        setStudent(studentData)
      }

      // Fetch results for student/term
      const resultsRes = await fetch(`/api/results?studentId=${studentId}&term_id=${termId}`)
      if (resultsRes.ok) {
        const resultsData = await resultsRes.json()
        setResults(resultsData)
      }

      // Fetch class summary for position
      const summaryRes = await fetch(`/api/results/summary?class_id=${classId}&term_id=${termId}`)
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        const studentAvg = resultsData.reduce((sum, r) => sum + (r.total || 0), 0) / resultsData.length || 0
        const studentPos = summaryData.findIndex(s => s.id === studentId) + 1
        setClassAverage(summaryData.reduce((sum, s) => sum + s.average, 0) / summaryData.length || 0)
        setPosition(studentPos)
      }

      // Attendance
      const attRes = await fetch(`/api/attendance/summary?studentId=${studentId}&term_id=${termId}`)
      if (attRes.ok) {
        const attData = await attRes.json()
        setAttendanceSummary(attData[0] || null)
      }

    } catch (err) {
      setError('Failed to load report card')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="alert alert-error">{error}</div>
  if (!student) return <div className="alert alert-warning">Student not found</div>

  const totalScore = results.reduce((sum, r) => sum + (r.total || 0), 0)
  const average = totalScore / results.length || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="print:hidden mb-8">
          <button onClick={() => window.history.back()} className="btn btn-ghost mb-4 flex items-center gap-2">
            <ArrowLeft size={20} />
            Back
          </button>
          <button onClick={handlePrint} className="btn btn-primary flex items-center gap-2">
            <Printer size={20} />
            Print Report Card
          </button>
        </div>

        {/* Report Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">KSSMS Report Card</h1>
            <p className="text-lg opacity-90">Kebbi State School Management System</p>
          </div>

          {/* Student Info */}
          <div className="p-8 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Student Information</h2>
                <p><strong>Name:</strong> {student.first_name} {student.last_name}</p>
                <p><strong>Reg #:</strong> {student.registration_number}</p>
                <p><strong>Class:</strong> Current Class</p>
                <p><strong>Term:</strong> Current Term</p>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">School Information</h2>
                <p><strong>School:</strong> {student.school_name || 'Kebbi State School'}</p>
                <p><strong>Session:</strong> 2024/2025</p>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Academic Performance</h2>
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold">Subject</th>
                    <th className="px-4 py-2 text-left font-semibold">CA1 (30)</th>
                    <th className="px-4 py-2 text-left font-semibold">CA2 (30)</th>
                    <th className="px-4 py-2 text-left font-semibold">Exam (40)</th>
                    <th className="px-4 py-2 text-left font-semibold">Total</th>
                    <th className="px-4 py-2 text-left font-semibold">Grade</th>
                    <th className="px-4 py-2 text-left font-semibold">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{result.subject_name || 'Subject'}</td>
                      <td className="px-4 py-3">{result.ca1 || '-'}</td>
                      <td className="px-4 py-3">{result.ca2 || '-'}</td>
                      <td className="px-4 py-3">{result.exam || '-'}</td>
                      <td className="px-4 py-3 font-bold">{result.total || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          result.grade === 'A' ? 'bg-green-100 text-green-800' :
                          result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          result.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3">{result.remark || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="p-8 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <h3 className="font-bold text-lg mb-1">Total Score</h3>
              <p className="text-2xl font-bold text-primary">{totalScore.toFixed(0)}%</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <h3 className="font-bold text-lg mb-1">Class Average</h3>
              <p className="text-2xl font-bold text-primary">{classAverage.toFixed(1)}%</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <h3 className="font-bold text-lg mb-1">Position</h3>
              <p className="text-2xl font-bold text-primary">{position}/{results.length}</p>
            </div>
          </div>

          {/* Attendance */}
          {attendanceSummary && (
            <div className="p-8 border-t">
              <h3 className="text-xl font-bold mb-4">Attendance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Present:</strong> {attendanceSummary.present_days} days</p>
                  <p><strong>Absent:</strong> {attendanceSummary.absent_days} days</p>
                </div>
                <div>
                  <p><strong>Late:</strong> {attendanceSummary.late_days} days</p>
                  <p><strong>Total Days:</strong> {attendanceSummary.total_days}</p>
                  <p><strong>Attendance Rate:</strong> {attendanceSummary.percentage}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 text-center text-sm text-gray-500 border-t">
            <p>Generated by KSSMS - Kebbi State School Management System</p>
            <p>Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="print:hidden mt-8 text-center">
          <button onClick={handlePrint} className="btn btn-primary btn-lg">
            <Printer size={24} />
            Print Report Card
          </button>
        </div>
      </div>
    </div>
  )
}

