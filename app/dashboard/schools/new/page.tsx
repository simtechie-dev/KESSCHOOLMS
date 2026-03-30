'use client'

import SchoolForm from '@/components/SchoolForm'

export default function NewSchoolPage() {
  const handleSubmit = async (formData: any) => {
    const response = await fetch('/api/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create school')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Add New School</h1>
      <SchoolForm onSubmit={handleSubmit} />
    </div>
  )
}
