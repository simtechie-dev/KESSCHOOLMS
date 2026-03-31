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

  useEffect(() => {
    if (!isLoaded || !userId) return

    const fetchData = async () => {
      try {
        const response = await fetch('/api/users/profile')
        if (response.ok) {
          const data = await response.json()
          setUserData(data)

          // Fetch school if school admin
          if (data.school_id) {
            const schoolResponse = await fetch(`/api/schools/${data.school_id}`)
            if (schoolResponse.ok) {
              const schoolData = await schoolResponse.json()
              setSchool(schoolData)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isLoaded, userId])

  if (loading) return <LoadingSpinner />

  if (!userData) return <div>No profile data found.</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>

      <div className="max-w-2xl">
        <div className="card mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-3xl text-white font-bold">
                {userData.full_name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{userData.full_name}</h2>
              <p className="text-gray-600">{getRoleLabel(userData.role)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Email</label>
              <p className="text-gray-700">{userData.email}</p>
            </div>
            <div>
              <label className="form-label">Phone</label>
              <p className="text-gray-700">{userData.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="form-label">Role</label>
              <p className="text-gray-700">{getRoleLabel(userData.role)}</p>
            </div>
            {school && (
              <div>
                <label className="form-label">School</label>
                <p className="text-gray-700">{school.name}</p>
              </div>
            )}
          </div>
        </div>

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
