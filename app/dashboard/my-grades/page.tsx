'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatCard from '@/components/StatCard'

interface StudentResult {
  id: string
  subject_name: string
  ca1?: number
  ca2?: number
  exam?: number
  score?: number
  total?: number
  grade?: string
  remark?: string
  term_id: string
}

export default function MyGradesPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [results, setResults] = useState<StudentResult[]>([])
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchGrades()
    } else if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      
      // Get student record
      const studentRes = await fetch('/api/dashboard/student')
      if (!studentRes.ok) throw new Error('Failed to fetch student')
      const studentData = await studentRes.json()
      setStudent(studentData)
      
      // Get results for this student
      const resultsRes = await fetch(`/api/results?student_id=${studentData.id}`)
      if (!resultsRes.ok) throw new Error('Failed to fetch grades')
      const resultsData = await resultsRes.json()
      
      const formattedResults = (Array.isArray(resultsData) ? resultsData : resultsData.data || [])
        .map((r: any) => ({
          id: r.id,
          subject_name: r.subjects?.name || r.subject_name || 'Unknown',
          ca1: r.ca1 || 0,
          ca2: r.ca2 || 0,
          exam: r.exam || 0,
          score: r.score || r.total,
          total: (r.ca1 || 0) + (r.ca2 || 0) + (r.exam || 0),
          grade: r.grade,
          remark: r.remark || r.remarks || (r.grade === 'A' ? 'Excellent' : r.grade === 'B' ? 'Very Good' : r.grade === 'C' ? 'Good' : r.grade === 'D' ? 'Pass' : r.grade === 'F' ? 'Fail' : '-'),
          term_id: r.term_id
        }))
      
      setResults(formattedResults)
    } catch (error) {
      console.error('Error fetching grades:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'badge-success bg-green-100 text-green-800 border-green-200'
      case 'B': return 'badge-info bg-blue-100 text-blue-800 border-blue-200'
      case 'C': return 'badge-warning bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'D': return 'badge-orange bg-orange-100 text-orange-800 border-orange-200'
      case 'F': return 'badge-error bg-red-100 text-red-800 border-red-200'
      default: return 'badge-neutral'
    }
  }

  const summary = useMemo(() => {
    if (results.length === 0) return null
    
    const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0)
    const avgScore = totalScore / results.length
    const highestGrade = results.reduce((highest, r) => {
      const gradeValue = r.grade || 'F'
      return gradeValue > highest ? gradeValue : highest
    }, 'F')

    return {
      totalSubjects: results.length,
      averageScore: avgScore.toFixed(1),
      highestGrade
    }
  }, [results])

  if (!isLoaded) return <LoadingSpinner />

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Grades</h1>
        <p className="text-gray-600 mt-2">Academic performance overview</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Subjects" 
            value={summary.totalSubjects.toString()} 
            icon="📚"
            color="blue"
          />
          <StatCard 
            title="Average Score" 
            value={summary.averageScore + '%'} 
            icon="📈"
            color="green" 
          />
          <StatCard 
            title="Highest Grade" 
            value={summary.highestGrade} 
            icon="🏆"
            color="purple" 
          />
        </div>
      )}

      <div className="card bg-white shadow-sm border">
        <div className="card-body">
          <h2 className="card-title text-xl font-bold mb-4">Results Summary</h2>
          {results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-gray-500 text-lg mb-2">No grades available</p>
              <p className="text-gray-400">Grades will appear here once teachers enter results</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full table-zebra">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Subject</th>
                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Score</th>
                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Grade</th>
                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id} className="hover">
                      <td className="font-medium px-6 py-4">{result.subject_name}</td>
                      <td className="text-center font-bold px-6 py-4">{result.score || result.total || '-'}</td>
                      <td className="px-6 py-4">
                        {result.grade && (
                          <span className={`badge px-3 py-2 text-sm font-semibold ${getGradeColor(result.grade)}`}>
                            {result.grade}
                          </span>
                        )}
                      </td>
                      <td className="text-center px-6 py-4">{result.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

