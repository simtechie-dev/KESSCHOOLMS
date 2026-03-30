import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  let userId: string | null = null
  try {
    const authResult = await auth()
    userId = authResult.userId || null
  } catch (err) {
    console.warn('Clerk auth unavailable, rendering landing page', err)
    userId = null
  }

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="container mx-auto px-4 h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4">KSSMS</h1>
            <p className="text-xl font-semibold">Kebbi State School Management System</p>
          </div>

          <p className="text-lg mb-8 text-gray-100">
            A modern, centralized platform for managing schools across Kebbi State.
            Streamline operations, improve transparency, and enable data-driven decision-making.
          </p>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start">
                <span className="text-2xl mr-3">✓</span>
                <div>
                  <h3 className="font-semibold mb-1">Multi-School Management</h3>
                  <p className="text-sm text-gray-200">Centralized control across all schools</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">✓</span>
                <div>
                  <h3 className="font-semibold mb-1">Student Records</h3>
                  <p className="text-sm text-gray-200">Complete digital student profiles</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">✓</span>
                <div>
                  <h3 className="font-semibold mb-1">Attendance Tracking</h3>
                  <p className="text-sm text-gray-200">Real-time attendance management</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">✓</span>
                <div>
                  <h3 className="font-semibold mb-1">Grades & Results</h3>
                  <p className="text-sm text-gray-200">Automated grading system</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">✓</span>
                <div>
                  <h3 className="font-semibold mb-1">Report Cards</h3>
                  <p className="text-sm text-gray-200">Instant report card generation</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">✓</span>
                <div>
                  <h3 className="font-semibold mb-1">Analytics Dashboard</h3>
                  <p className="text-sm text-gray-200">State-level insights & monitoring</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/sign-in" className="btn-primary bg-white text-primary hover:bg-gray-100">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-outline border-white text-white hover:bg-white hover:bg-opacity-20">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
