import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { calculateGrade } from '@/lib/utils'
import type { ResultPayload, ResultScoreInput } from '@/lib/types'

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

    const { searchParams } = new URL(req.url)
    const class_id = searchParams.get('class_id')
    const term_id = searchParams.get('term_id')
    const subject_id = searchParams.get('subject_id')

    let query = supabase
      .from('results')
      .select(`
        *,
        students (
          id, first_name, last_name, registration_number
        )
      `)

    if (user.role === 'school_admin' && user.school_id) {
      query = query.eq('school_id', user.school_id)
    }

    if (class_id) query = query.eq('class_id', class_id)
    if (term_id) query = query.eq('term_id', term_id)
    if (subject_id) query = query.eq('subject_id', subject_id)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is teacher or school admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    const supabase = getSupabaseAdminClient()
    if (userError || !user || (user.role !== 'teacher' && user.role !== 'school_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verify user is teacher or school admin
    if (user.role !== 'teacher' && user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const payload: ResultPayload = await req.json()
    const { term_id, class_id, subject_id, scores } = payload

    if (!term_id || !class_id || !subject_id || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ error: 'Missing term_id, class_id, subject_id or scores array' }, { status: 400 })
    }

    // For each score, calculate totals and create/update results
    const results = scores.map((scoreInput: ResultScoreInput) => {
      const ca1 = scoreInput.ca1 || 0
      const ca2 = scoreInput.ca2 || 0
      const exam = scoreInput.exam || 0
      const total = ca1 + ca2 + exam  // Assume CA1/CA2 30 each, Exam 40 = 100
      const grade = total > 0 ? calculateGrade(total) : ''

      return {
        school_id: user.school_id!,
        student_id: scoreInput.student_id,
        subject_id,
        class_id,
        term_id,
        ca1,
        ca2,
        exam,
        total,
        grade,
        remark: '',
        recorded_by: userId
      }
    })

    const { data, error } = await supabase
      .from('results')
      .upsert(results, { onConflict: 'student_id,subject_id,class_id,term_id' })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: data.length }, { status: 201 })
  } catch (error) {
    console.error('Error saving results:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
