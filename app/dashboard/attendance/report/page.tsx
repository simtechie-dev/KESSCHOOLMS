'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Download, Calendar, Users, CheckCircle } from 'lucide-react'
import type { AttendanceSummary } from '@/lib/types'

export default function AttendanceReportPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [terms, setTerms] = useState<any[]>([])
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClasses()
    fetchTerms()
  }, [])

  useEffect(() => {
    if (selectedClass && selectedTerm) {
      fetchSummary()
    } else {
      setSummaries([])
    }
  }, [selectedClass, selectedTerm])

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

  const fetchSummary = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams({
        class_id: selectedClass,
        term_id: selectedTerm
      })
      const response = await fetch(`/api/attendance/summary?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSummaries(data)
      } else {
        setError('Failed to load attendance summary')
      }
    } catch (err) {
      console.error('Error fetching summary:', err)
      setError('Failed to load attendance summary')
    } finally {
      setLoading(false)
    }
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage > 80) return 'bg-success text-success-content'
    if (percentage >= 60) return 'bg-warning text-warning-content'
    return 'bg-error text-error-content'
  }

  const handleExport = () => {
    console.log('Exporting summaries:', summaries)
    // TODO: Implement PDF/CSV export
    alert('Export functionality - check console for data')
  }

  const getClassName = () => {
    const cls = classes.find(c => c.id === selectedClass)
    return cls ? `${cls.name} (${cls.code})` : ''
  }

  const getTermName = () => {
    const term = terms.find(t => t.id === selectedTerm)
    return term ? term.name : ''
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Attendance Report</h1>
        <p className="text-gray-600">Class attendance summary by term</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Class</span>
          </label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="select select-bordered w-full"
            disabled={loading}
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
            disabled={loading}
          >
            <option value="">Select Term</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>{term.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <CheckCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {selectedClass && selectedTerm && summaries.length === 0 && !loading && (
        <div className="alert alert-info mb-6">
          <Users size={20} />
          <span>No attendance data for selected class and term.</span>
        </div>
      )}

      {summaries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Attendance Summary - {getClassName()} | {getTermName()}
              </h2>
              <p className="text-sm text-gray-500">
                {summaries.length} students • Sorted by attendance %
              </p>
            </div>
            <button 
              onClick={handleExport}
              className="btn btn-outline gap-2"
              disabled={loading}
            >
              <Download size={18} />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table-zebra w-full">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Reg #</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Total Days</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {summaries
                  .sort((a, b) => b.percentage - a.percentage)
                  .map((summary) => (
                    <tr key={summary.id}>
                      <td className="font-medium">
                        {summary.first_name} {summary.last_name}
                      </td>
                      <td className="font-mono text-sm">{summary.registration_number}</td>
                      <td className="font-bold text-lg">{summary.present_days}</td>
                      <td className="text-error">{summary.absent_days}</td>
                      <td className="text-warning">{summary.late_days}</td>
                      <td>{summary.total_days}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPercentageColor(summary.percentage)}`}>
                          {summary.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-3 text-gray-600">Loading report...</span>
        </div>
      )}
    </div>
  )
}

