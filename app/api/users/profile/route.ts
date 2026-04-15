import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get school name separately - but not for state_admin
    let school_name = null
    if (user.school_id && user.role !== 'state_admin') {
      const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', user.school_id)
        .single()
      school_name = school?.name || null
    }

    return NextResponse.json({ ...user, school_name })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { full_name, phone } = body

    if (!full_name || typeof full_name !== 'string') {
      return NextResponse.json({ error: 'full_name is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        full_name, 
        phone: phone || null, 
        updated_at: new Date().toISOString() 
      })
      .eq('clerk_id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

// Return updated profile with school_name - skip for state_admin
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    let school_name = null
    if (updatedUser.school_id && updatedUser.role !== 'state_admin') {
      const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', updatedUser.school_id)
        .single()
      school_name = school?.name || null
    }

    return NextResponse.json({ ...updatedUser, school_name })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
