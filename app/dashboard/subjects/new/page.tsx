'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import LoadingSpinner from '@/components/LoadingSpinner'
import { User } from "@/lib/types"

export default function NewSubjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    school_id: "",
  })

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user?.role === "school_admin" && user.school_id) {
      setFormData(prev => ({ ...prev, school_id: user.school_id || '' }))
    }
  }, [user])

  const fetchUser = async () => {
    try {
      setUserLoading(true)
      const response = await fetch("/api/users/profile")
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (err) {
      console.error("Error fetching user:", err)
    } finally {
      setUserLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/dashboard/subjects")
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create subject")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/subjects" className="btn btn-ghost">
          ← Back to Subjects
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 flex-1">Add New Subject</h1>
      </div>

      <div className="card max-w-2xl">
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
                placeholder="e.g., Mathematics"
              />
            </div>

            <div>
              <label className="form-label">Subject Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
                placeholder="e.g., MATH"
              />
            </div>

            {user?.role === "state_admin" && (
              <div className="md:col-span-2">
                <label className="form-label">School *</label>
                <input
                  type="text"
                  name="school_id"
                  value={formData.school_id}
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full"
                  placeholder="School ID"
                />
              </div>
            )}

            {user?.role === "school_admin" && user.school_name && (
              <div className="md:col-span-2">
                <div className="alert alert-info">
                  <span>School: {user.school_name || 'Your school'} (auto-assigned)</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.code || !formData.school_id}
              className="btn btn-primary flex-1"
            >
              {loading ? <LoadingSpinner /> : 'Create Subject'}
            </button>
            <Link href="/dashboard/subjects" className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
