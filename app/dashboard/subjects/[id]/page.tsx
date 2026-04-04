'use client'

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import LoadingSpinner from '@/components/LoadingSpinner'
import { Subject, User } from "@/lib/types"
import { Edit2, Trash2, ArrowLeft } from 'lucide-react'

export default function EditSubjectPage() {
  const router = useRouter()
  const params = useParams()
  const subjectId = params.id as string

  const [subject, setSubject] = useState<Subject | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  })

  useEffect(() => {
    fetchSubject()
    fetchUser()
  }, [subjectId])

  const fetchSubject = async () => {
    try {
      const response = await fetch(`/api/subjects/${subjectId}`)
      if (response.ok) {
        const data = await response.json()
        setSubject(data)
        setFormData({
          name: data.name,
          code: data.code,
        })
      }
    } catch (err) {
      setError("Failed to load subject")
    }
  }

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/users/profile")
      if (response.ok) {
        setUser(await response.json())
      }
    } catch (err) {
      console.error("Error fetching user:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubject(await response.json())
        setError("")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to update subject")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure? This subject may be used in exams and results.')) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/dashboard/subjects")
      }
    } catch (err) {
      setError("Failed to delete subject")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Subject not found</h2>
          <Link href="/dashboard/subjects" className="btn btn-primary">
            Back to Subjects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/subjects" className="btn btn-ghost">
          <ArrowLeft size={20} /> Subjects
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 flex-1">Edit Subject</h1>
      </div>

      <div className="card max-w-2xl">
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input input-bordered w-full"
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
              />
            </div>
          </div>

          <div className="stats shadow bg-base-200 mb-6">
            <div className="stat">
              <div className="stat-title">School ID</div>
              <div className="stat-value text-primary">{subject.school_id}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Created</div>
              <div className="stat-value">
                {new Date(subject.created_at).toLocaleDateString('en-NG')}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex-1"
            >
              {saving ? "Saving..." : "Update Subject"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="btn btn-error flex-1"
            >
              {deleting ? "Deleting..." : "Delete Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
