'use client'

import Link from 'next/link'
import { useAuth, useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export default function Header() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isLoaded) return null

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16 bg-white shadow-sm">
      {!isSignedIn ? (
        <>
          <Link href="/sign-in" className="px-4 py-2 rounded-md bg-blue-600 text-white">
            Sign In
          </Link>
          <Link href="/sign-up" className="px-4 py-2 rounded-md border border-blue-600 text-blue-600">
            Sign Up
          </Link>
        </>
      ) : (
        <>
          <span className="text-sm text-gray-700">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
          <UserButton />
        </>
      )}
    </header>
  )
}
