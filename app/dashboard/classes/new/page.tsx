'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { School, User } from "@/lib/types"

export default function NewClassPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userLoading, setUserLoading] = useState(true)
  const [error, setError] = useState("")
  const [schools, setSchools] = useState<School[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    school_id: "",
    capacity: "",
  })

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user?.role === "state_admin") {
      fetchSchools()
    } else if (user?.school_id && user.role === "school_admin") {
      setFormData(prev => ({ ...prev, school_id: user.school_id }))
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

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools")
      if (response.ok) {
        const data = await response.json()
        setSchools(data)
      }
    } catch (err) {
      console.error("Error fetching schools:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create class")
      }

      router.push("/dashboard/classes")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Add New Class</h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {userLoading ? (
          <div className="text-center py-12">
            <p className="text-lg">Loading user profile...</p>
          </div>
        ) : (
          <>
            {user?.role === "school_admin" && user.schools && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  <strong>School:</strong> {user.schools.name}{" "}
                  <span className="text-xs ml-2 px-2 py-1 bg-blue-100 rounded-full">
                    Auto-assigned
                  </span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user?.role === "state_admin" && (
                <div className="form-group">
                  <label className="form-label">School *</label>
                  <select
                    name="school_id"
                    value={formData.school_id}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select School</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Class Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., Senior Secondary 1 (SS1)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Class Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., SS1A"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 50"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={loading || userLoading || !formData.name || !formData.code || !formData.school_id}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Class"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
