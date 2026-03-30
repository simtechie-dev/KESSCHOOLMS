import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Welcome!</h1>
        <p className="text-gray-600 text-center mb-6">
          Your account has been created successfully. Please contact your administrator to set up your profile.
        </p>
        <p className="text-gray-500 text-sm text-center">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  )
}
