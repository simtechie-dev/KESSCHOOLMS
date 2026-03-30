import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = clerkUser.id
    const email = clerkUser.emailAddresses[0]?.emailAddress
    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()

    const supabaseAdmin = getSupabaseAdminClient()

    // Check if user exists in Supabase
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw checkError
    }

    if (existingUser) {
      return NextResponse.json(existingUser)
    }

    // Insert new user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: userId,
        email: email,
        full_name: fullName,
        role: 'school_admin',
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json(newUser)
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}