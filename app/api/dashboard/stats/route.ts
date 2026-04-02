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
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'school_admin') {
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', user.school_id)

      const { count: totalTeachers } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', user.school_id)

      const today = new Date().toISOString().split('T')[0]
      const { count: todayAttendance } = await supabase
        .from('attendance')
        .select('id, students!inner(school_id)', { count: 'exact', head: true })
        .eq('students.school_id', user.school_id)
        .eq('date', today)
        .eq('status', 'present')

      return NextResponse.json({
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        todayAttendance: todayAttendance || 0,
        totalSchools: 1,
        role: user.role,
      })
    }

    if (user.role === 'state_admin') {
      const { count: totalSchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })

      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

      const { count: totalTeachers } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })

      return NextResponse.json({
        totalSchools: totalSchools || 0,
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        todayAttendance: 0,
        role: user.role,
      })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}