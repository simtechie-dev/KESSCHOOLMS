'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { User, School } from '@/lib/types'
import LoadingSpinner from '@/components/LoadingSpinner'
import { getRoleLabel } from '@/lib/utils'

export default function ProfilePage() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  if (!isLoaded) return null
  if (!isSignedIn) redirect('/sign-in')

  const [userData, setUserData] = useState<User | null>(null)
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
          const [editingData, setEditingData] = useState({ full_name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleEdit = () => {
    if (userData) {
      setEditingData({
        full_name: userData.full_name,
        phone: userData.phone || ''
      })
      setIsEditing(true)
      setError('')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingData),
      })

      if (response.ok) {
        const updatedData = await response.json()
        setUserData(updatedData)
        setIsEditing(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!isLoaded || !userId) return

    const fetchData = async () => {
      try {
        const response = await fetch('/api/users/profile')
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        setError('')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile data. Please refresh the page.')
    } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoaded, userId])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="alert alert-error shadow-lg">
          <span>{error}</span>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!userData) return <div className="text-center py-12 text-gray-500">Loading profile...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        {!isEditing && (
          <button onClick={handleEdit} className="btn btn-outline">
            Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-2xl">
        <div className="card mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-3xl text-white font-bold">
                {isEditing ? editingData.full_name.charAt(0) : userData.full_name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? editingData.full_name : userData.full_name}
              </h2>
              <p className="text-gray-600">{getRoleLabel(userData.role)}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={editingData.full_name}
                  onChange={(e) => setEditingData({ ...editingData, full_name: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={editingData.phone}
                  onChange={(e) => setEditingData({ ...editingData, phone: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleCancel} className="btn btn-ghost flex-1" disabled={saving}>
                  Cancel
                </button>
                <button onClick={handleSave} className="btn btn-primary flex-1" disabled={saving}>
                  {saving ? <LoadingSpinner /> : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Email</label>
                <p className="text-gray-700">{userData.email}</p>
              </div>
              <div>
                <label className="form-label">Phone</label>
                <p className="text-gray-700">{userData.phone || 'Not set'}</p>
              </div>
              <div>
                <label className="form-label">Role</label>
                <p className="text-gray-700">{getRoleLabel(userData.role)}</p>
              </div>
              {userData.school_name && (
                <div>
                  <label className="form-label">School</label>
                  <p className="text-gray-700">{userData.school_name}</p>
                </div>
              )}
            </div>
          )}
        </div>

      {error && !isEditing && (
        <div className="alert alert-warning">
          <span>{error}</span>
        </div>
      )}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Member Since</label>
            <p className="text-gray-800">
              {new Date(userData.created_at).toLocaleDateString('en-NG')}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Last Updated</label>
            <p className="text-gray-800">
              {new Date(userData.updated_at).toLocaleDateString('en-NG')}
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
