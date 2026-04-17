'use client'

import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Search, Eye, Users } from 'lucide-react'
import type { User } from '@/lib/types'

interface ExtendedUser extends User {
  role_display: string
  school_name: string
  joined_date: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      setError('Error loading users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openModal = (user: ExtendedUser) => {
    setSelectedUser(user)
  }

  const closeModal = () => {
    setSelectedUser(null)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-600">Manage all system users</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Date Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover">
                  <td>
                    <div>
                      <div className="font-semibold">{user.full_name}</div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge badge-lg badge-primary">
                      {user.role_display}
                    </span>
                  </td>
                  <td>{user.joined_date}</td>
                  <td>
                    <button 
                      onClick={() => openModal(user)}
                      className="btn btn-ghost btn-sm"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <div className="text-gray-500">
                      <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No users found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">{selectedUser.full_name}</h3>
            <div className="space-y-4 mb-6">
              <div>
                <span className="font-semibold">Email:</span>
                <p className="ml-2">{selectedUser.email}</p>
              </div>
              <div>
                <span className="font-semibold">Role:</span>
                <p className="ml-2 badge badge-primary">{selectedUser.role_display}</p>
              </div>
              <div>
                <span className="font-semibold">School:</span>
                <p className="ml-2">{selectedUser.school_name}</p>
              </div>
              <div>
                <span className="font-semibold">Phone:</span>
                <p className="ml-2">{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold">Joined:</span>
                <p className="ml-2">{selectedUser.joined_date}</p>
              </div>
              {selectedUser.school_id && (
                <div>
                  <span className="font-semibold">School ID:</span>
                  <p className="ml-2">{selectedUser.school_id}</p>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={closeModal}>Close</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}
