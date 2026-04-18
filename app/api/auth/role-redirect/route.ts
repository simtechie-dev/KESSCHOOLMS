import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    const userId = clerkUser.id

    const supabase = getSupabaseAdminClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single()

    if (error || !user) {
      // Default to dashboard for new/incomplete users
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    const redirectUrl = '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, request.url))

  } catch (error) {
    console.error('Role redirect error:', error)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
