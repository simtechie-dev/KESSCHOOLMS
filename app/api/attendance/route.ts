import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import type { AttendancePayload, AttendanceRecordInput } from '@/lib/types'

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
    const date = searchParams.get('date')

    if (!class_id) {
      return NextResponse.json({ error: 'class_id required' }, { status: 400 })
    }

    // Fetch enrolled students for class + LEFT JOIN attendance
    let studentQuery = supabase
      .from('enrollments')
      .select(`
        *,
        students!enrollments_student_id_fkey (
          id,
          registration_number,
          first_name, 
          last_name,
          school_id
        ),
        attendance!enrollments_student_id_fkey (
          status,
          date,
          term_id
        )
      `)
      .eq('class_id', class_id)

    if (user.role === 'school_admin' && user.school_id) {
      studentQuery = studentQuery.eq('students.school_id', user.school_id)
    }

    if (term_id) {
      studentQuery = studentQuery.eq('attendance.term_id', term_id)
    }
    if (date) {
      studentQuery = studentQuery.eq('attendance.date', date)
    }

    const { data: enrollments, error } = await studentQuery

    if (error) {
      // Fallback: fetch school students if no enrollments
      if (error.message.includes('relation') || enrollments?.length === 0) {
        const schoolQuery = supabase
          .from('students')
          .select('id, registration_number, first_name, last_name, school_id')
          .eq('school_id', user.school_id || '')
        const { data: students } = await schoolQuery
        return NextResponse.json(students || [])
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const students = enrollments?.map((enr: any) => ({
      student_id: enr.students.id,
      registration_number: enr.students.registration_number,
      first_name: enr.students.first_name,
      last_name: enr.students.last_name,
      status: enr.attendance?.[0]?.status || null
    })) || []

    return NextResponse.json(students)
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

    const payload: AttendancePayload = await req.json()
    const { class_id, date, term_id, records } = payload

    if (!class_id || !date || !term_id || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Missing class_id, date, term_id, or records array' }, { status: 400 })
    }

    if (records.some((rec: any) => !rec.student_id || !['Present', 'Absent', 'Late', 'Excused'].includes(rec.status))) {
      return NextResponse.json({ error: 'Invalid record format or status' }, { status: 400 })
    }

    const upserts = records.map((rec: AttendanceRecordInput) => ({
      student_id: rec.student_id,
      class_id,
      term_id,
      date,
      status: rec.status,
      recorded_by: userId
    }))

    const { data, error } = await supabase
      .from('attendance')
      .upsert(upserts, { onConflict: 'student_id,class_id,term_id,date' })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: data.length }, { status: 201 })
  } catch (error) {
    console.error('Error recording attendance:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
