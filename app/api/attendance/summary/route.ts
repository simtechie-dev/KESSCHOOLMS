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

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const termId = searchParams.get('termId')

    if (!classId || !termId) {
      return NextResponse.json({ error: 'classId and termId required' }, { status: 400 })
    }

    let query = supabase
      .from('attendance')
      .select(`
        student_id,
        status,
        count(*) as count
      `)
      .eq('class_id', classId)
      .eq('term_id', termId)

    if (user.role === 'school_admin' && user.school_id) {
      query = query.eq('school_id', user.school_id)
    }

    query = query.group('student_id, status')

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Aggregate by student
    const summary = data.reduce((acc: any, row: any) => {
      const studentId = row.student_id
      if (!acc[studentId]) {
        acc[studentId] = { present: 0, absent: 0, late: 0, excused: 0 }
      }
      acc[studentId][row.status.toLowerCase()] = row.count
      return acc
    }, {})

    // Join with student names
    const { data: students } = await supabase
      .from('students')
      .select('id, first_name, last_name, registration_number')
      .in('id', Object.keys(summary))

    const result = students.map((student: any) => {
      const stats = summary[student.id] || { present: 0, absent: 0, late: 0, excused: 0 }
      const total = stats.present + stats.absent + stats.late + stats.excused
      const percentage = total > 0 ? Math.round((stats.present / total) * 100) : 0

      return {
        ...student,
        present_days: stats.present,
        absent_days: stats.absent,
        late_days: stats.late,
        excused_days: stats.excused,
        total_days: total,
        percentage
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching attendance summary:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
