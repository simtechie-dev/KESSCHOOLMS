import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Total schools
    const { count: totalSchools } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })

    // Total students
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    // Total teachers (assuming teachers table or users with role)
    const { count: totalTeachers } = await supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true })

    // Total attendance today (placeholder)
    const { count: totalAttendanceToday } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .gte('date', new Date().toISOString().split('T')[0])

    return NextResponse.json({
      totalSchools: totalSchools || 0,
      totalStudents: totalStudents || 0,
      totalTeachers: totalTeachers || 0,
      totalAttendanceToday: totalAttendanceToday || 0,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
