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
    const student_id = searchParams.get('student_id') || searchParams.get('studentId')

    let query = supabase
      .from('results')
      .select(`
        *,
        subjects(name),
        students (
          id, first_name, last_name, registration_number
        )
      `)

    if (user.role === 'school_admin' && user.school_id) {
      query = query.eq('school_id', user.school_id)
    } else if (user.role === 'student' && student_id) {
      query = query.eq('student_id', student_id)
    }

    if (student_id) query = query.eq('student_id', student_id)
    if (class_id) query = query.eq('class_id', class_id)
    if (term_id) query = query.eq('term_id', term_id)
    if (subject_id) query = query.eq('subject_id', subject_id)
    query = query.gt('score', 0)

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

    const supabase = getSupabaseAdminClient()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user || !['teacher', 'school_admin', 'state_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const payload: ResultPayload = await req.json()
    const { term_id, class_id, subject_id, scores } = payload

    if (!term_id || !class_id || !subject_id || !scores || !Array.isArray(scores)) {
      return NextResponse.json({ error: 'Missing term_id, class_id, subject_id or scores array' }, { status: 400 })
    }

    // Get school_id from class once
    const { data: classData } = await supabase
      .from('classes')
      .select('school_id')
      .eq('id', class_id)
      .single()
    
    const school_id = classData?.school_id || user.school_id
    
    if (!school_id) {
      return NextResponse.json({ error: 'School ID not found for class' }, { status: 400 })
    }

    // Find or create exam record for this combination
    let exam_id = null
    const { data: existingExam } = await supabase
      .from('exams')
      .select('id')
      .eq('school_id', school_id)
      .eq('class_id', class_id)
      .eq('subject_id', subject_id)
      .eq('exam_type', 'Exam')
      .maybeSingle()

    if (existingExam) {
      exam_id = existingExam.id
    } else {
      const { data: newExam, error: examError } = await supabase
        .from('exams')
        .insert({
          school_id,
          class_id,
          subject_id,
          exam_type: 'Exam',
          total_score: 100
        })
        .select('id')
        .single()

      if (examError || !newExam) {
        console.error('Failed to create exam:', examError)
        return NextResponse.json({ error: 'Failed to initialize exam' }, { status: 500 })
      }
      exam_id = newExam.id
    }

    console.log(`Using exam_id: ${exam_id} for school/class/subject`)

    // Create results
    const results = scores.map((scoreInput: ResultScoreInput) => {
      const ca1 = scoreInput.ca1 || 0
      const ca2 = scoreInput.ca2 || 0
      const exam = scoreInput.exam || 0
      const total = ca1 + ca2 + exam
      const grade = total > 0 ? calculateGrade(total) : ''
      return {
        student_id: scoreInput.student_id,
        exam_id,
        score: total,
        grade,
        remarks: '',
        recorded_by: user.id
      }
    })

    const { data, error } = await supabase
      .from('results')
      .upsert(results, { onConflict: 'student_id,exam_id' })
      .select()

    if (error) {
      console.error('Supabase results error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Results saved:', data.length)
    return NextResponse.json({ success: true, count: data.length, exam_id }, { status: 201 })
  } catch (error) {
    console.error('Error saving results:', error)
    return NextResponse.json({ error: 'Server error', details: error }, { status: 500 })
  }
}

