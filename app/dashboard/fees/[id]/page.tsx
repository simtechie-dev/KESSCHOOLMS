'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react' // 1. Import 'use'
import { School, Class, FeeStructure } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'

// 2. Update the type definition to wrap params in a Promise
export default function EditFeePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  
  // 3. Unwrap the params using the React 'use' hook
  const resolvedParams = use(params)
  const feeId = resolvedParams.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [formData, setFormData] = useState({
    school_id: '',
    class_id: '',
    term: 'First',
    year: new Date().getFullYear(),
    tuition_fee: '',
    development_fee: '',
    other_fees: '',
  })

  useEffect(() => {
    fetchFee()
    fetchSchools()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // We use feeId inside fetchFee which is stable

  useEffect(() => {
    if (formData.school_id) {
      fetchClasses(formData.school_id)
    }
  }, [formData.school_id])

  const fetchFee = async () => {
    try {
      // 4. Use feeId instead of params.id
      const response = await fetch(`/api/fees/${feeId}`)
      if (!response.ok) throw new Error('Failed to fetch fee')
      const data = await response.json()
      setFormData({
        school_id: data.school_id,
        class_id: data.class_id,
        term: data.term,
        year: data.year,
        tuition_fee: data.tuition_fee?.toString() || '',
        development_fee: data.development_fee?.toString() || '',
        other_fees: data.other_fees?.toString() || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // ... (fetchSchools and fetchClasses remain the same)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // 5. Use feeId in the PUT request
      const response = await fetch(`/api/fees/${feeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tuition_fee: formData.tuition_fee ? parseFloat(formData.tuition_fee) : null,
          development_fee: formData.development_fee ? parseFloat(formData.development_fee) : null,
          other_fees: formData.other_fees ? parseFloat(formData.other_fees) : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update fee')
      }

      router.push('/dashboard/fees')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  // ... (rest of your JSX remains the same)
}