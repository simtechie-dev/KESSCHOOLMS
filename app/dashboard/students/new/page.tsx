'use client'

import StudentForm from '@/components/StudentForm'

export default function NewStudentPage() {
  const handleSubmit = async (formData: any) => {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create student')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Add New Student</h1>
      <StudentForm onSubmit={handleSubmit} />
    </div>
  )
}
