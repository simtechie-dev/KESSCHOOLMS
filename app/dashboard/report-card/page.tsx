'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Printer } from 'lucide-react'

export default function ReportCardPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchStudentId()
    } else if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn])

  const fetchStudentId = async () => {
    try {
      const res = await fetch('/api/dashboard/student')
      if (!res.ok) throw new Error('Failed to fetch student profile')
      const data = await res.json()
      setStudentId(data.student.id)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!isLoaded || loading) return <LoadingSpinner />

  if (!studentId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Report Card</h1>
        <p className="text-gray-500">Unable to load report card. Please contact admin.</p>
      </div>
    )
  }

  return (
    <div className="print:max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-3xl font-bold text-gray-800">My Report Card</h1>
        <button 
          onClick={handlePrint}
          className="btn btn-primary gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Report Card
        </button>
      </div>

      {/* Embed the dynamic report page */}
      <iframe 
        src={`/dashboard/reports/${studentId}`}
        className="w-full h-[80vh] border rounded-lg shadow-lg"
        title="Report Card"
      />
      
      <div className="print:hidden mt-8 text-center">
        <button 
          onClick={handlePrint}
          className="btn btn-lg btn-primary"
        >
          🖨️ Print Full Report Card
        </button>
      </div>
    </div>
  )
}

