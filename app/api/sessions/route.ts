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
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let query = supabase
      .from('academic_sessions')
      .select('*')
      .order('start_date', { ascending: false })

    if (user.role === 'school_admin' && user.school_id) {
      query = query.eq('school_id', user.school_id)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, start_date, end_date, is_current } = body

    if (!name || !start_date || !end_date) {
      return NextResponse.json({ error: 'Name, start_date, and end_date are required' }, { status: 400 })
    }

    const school_id = user.role === 'state_admin' ? body.school_id : user.school_id
    if (!school_id) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 })
    }

    // Ensure only one current session
    if (is_current) {
      await supabase
        .from('academic_sessions')
        .update({ is_current: false })
        .eq('school_id', school_id)
    }

    const { data, error } = await supabase
      .from('academic_sessions')
      .insert({ 
        name, 
        start_date, 
        end_date, 
        is_current: !!is_current,
        school_id 
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
