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
    // Get user to check role and school
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const date = searchParams.get('date')

    let query = supabase.from('attendance').select('*')

    // If school admin, only return their school attendance
    if (user.role === 'school_admin' && user.school_id) {
      query = query.eq('school_id', user.school_id)
    }

    if (classId) {
      query = query.eq('class_id', classId)
    }

    if (date) {
      query = query.eq('date', date)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching attendance:', error)
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
    // Verify user is teacher or school admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user || (user.role !== 'teacher' && user.role !== 'school_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { student_id, class_id, date, status } = body

    if (!student_id || !class_id || !date || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['Present', 'Absent', 'Late', 'Excused'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('attendance')
      .upsert(
        {
          student_id,
          class_id,
          date,
          status,
          recorded_by: userId,
        },
        { onConflict: 'student_id,class_id,date' }
      )
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error recording attendance:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
