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
    const { data: user } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('clerk_id', userId)
      .single()

    const { searchParams } = new URL(req.url)
    const class_id = searchParams.get('class_id')
    const subject_id = searchParams.get('subject_id')
    const term_id = searchParams.get('term_id')

    let query = supabase
      .from('exams')
      .select('*')

    if (user?.role === 'school_admin' && user.school_id) {
      query = query.eq('school_id', user.school_id)
    }

    if (class_id) query = query.eq('class_id', class_id)
    if (subject_id) query = query.eq('subject_id', subject_id)
    if (term_id) query = query.eq('term_id', term_id)

    const { data, error } = await query.order('exam_type')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching exams:', error)
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
    const { data: user } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('clerk_id', userId)
      .single()

    if (!user || (user.role !== 'teacher' && user.role !== 'school_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { data, error } = await supabase
      .from('exams')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
