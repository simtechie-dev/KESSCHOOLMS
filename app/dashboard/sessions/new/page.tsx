'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import LoadingSpinner from '@/components/LoadingSpinner'
import { User, AcademicSession } from "@/lib/types"

export default function NewSessionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    is_current: false,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/dashboard/sessions")
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create session")
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
        <Link href="/dashboard/sessions" className="btn btn-ghost">
          ← Back to Sessions
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 flex-1">New Academic Session</h1>
      </div>

      <div className="card max-w-2xl">
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="form-label">Session Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
                placeholder="e.g., 2024/2025 Academic Session"
              />
            </div>

            <div>
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="form-label">End Date *</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Is Current Session</label>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  name="is_current"
                  checked={formData.is_current}
                  onChange={handleChange}
                  className="toggle toggle-primary"
                />
                <span className="text-sm font-medium text-gray-700">Mark as current session (only one active per school)</span>
              </div>
            </div>

            {user?.role === "state_admin" && (
              <div className="md:col-span-2">
                <label className="form-label">School ID *</label>
                <input
                  type="text"
                  name="school_id"
                  value={formData.school_id}
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full"
                />
              </div>
            )}

            {user?.role === "school_admin" && user.school_name && (
              <div className="md:col-span-2">
                <div className="alert alert-info">
                  <span>School: {user.school_name} (auto-assigned)</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.start_date || !formData.end_date}
              className="btn btn-primary flex-1"
            >
              {loading ? <LoadingSpinner /> : 'Create Session'}
            </button>
            <Link href="/dashboard/sessions" className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
