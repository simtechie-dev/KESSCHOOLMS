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

    // Check if state admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single()

    if (!user || user.role !== 'state_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Total stats
    const [
      { count: totalSchools },
      { count: totalStudents },
      { count: totalTeachers }
    ] = await Promise.all([
      supabase.from('schools').select('*', { count: 'exact', head: true }),
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('teachers').select('*', { count: 'exact', head: true })
    ])

    // Students per LGA
    const { data: studentsByLga } = await supabase
      .from('schools')
      .select(`
        lga,
        students!school_id(count)
      `)
      .neq('students(count)', 0)
      .order('students(count)', { ascending: false })

    // Top 10 schools by student count
    const { data: top10Schools } = await supabase
      .from('schools')
      .select(`
        name, id, lga,
        students!school_id(count as student_count)
      `)
      .order('students(count)', { ascending: false })
      .limit(10)

    return NextResponse.json({
      totalSchools: totalSchools || 0,
      totalStudents: totalStudents || 0,
      totalTeachers: totalTeachers || 0,
      studentsByLga: studentsByLga || [],
      top10Schools: top10Schools || [],
      passRate: 75, // Can add real calculation
      attendanceRate: 85 // Can add real
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

