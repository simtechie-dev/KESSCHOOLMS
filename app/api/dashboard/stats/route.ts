import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

interface DashboardStats {
  totalSchools: number
  totalStudents: number
  totalTeachers: number
  totalAttendanceToday: number
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Get user data to determine role and school_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let stats: DashboardStats

    if (user.role === 'state_admin') {
      // State admin sees all schools
      const { count: schoolCount, error: schoolError } = await supabase
        .from('schools')
        .select('*', { count: 'exact' })

      const { count: studentCount, error: studentError } = await supabase
        .from('students')
        .select('*', { count: 'exact' })

      const { count: teacherCount, error: teacherError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact' })

      if (schoolError || studentError || teacherError) {
        console.error('Error fetching stats:', { schoolError, studentError, teacherError })
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
      }

      stats = {
        totalSchools: schoolCount || 0,
        totalStudents: studentCount || 0,
        totalTeachers: teacherCount || 0,
        totalAttendanceToday: 0,
      }
    } else if (user.role === 'school_admin' && user.school_id) {
      // School admin sees only their school data
      const { count: studentCount, error: studentError } = await supabase
        .from('students')
        .select('*', { count: 'exact' })
        .eq('school_id', user.school_id)

      const { count: teacherCount, error: teacherError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact' })
        .eq('school_id', user.school_id)

      const today = new Date().toISOString().split('T')[0]
      const { count: attendanceCount, error: attendanceError } = await supabase
        .from('attendance')
        .select('*', { count: 'exact' })
        .eq('date', today)

      if (studentError || teacherError || attendanceError) {
        console.error('Error fetching school stats:', { studentError, teacherError, attendanceError })
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
      }

      stats = {
        totalSchools: 1,
        totalStudents: studentCount || 0,
        totalTeachers: teacherCount || 0,
        totalAttendanceToday: attendanceCount || 0,
      }
    } else {
      return NextResponse.json({ error: 'Invalid user role or missing school_id' }, { status: 403 })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}