import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const { studentId } = params

    // Get student details
    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get results with subject names
    const { data: results } = await supabase
      .from('results')
      .select('*, subjects(name)')
      .eq('student_id', studentId)
      .gt('score', 0)

    // Get class info
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*, classes(name)')
      .eq('student_id', studentId)
      .single()

    // Get attendance summary
    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', studentId)

    const presentDays = attendance?.filter((a: any) => a.status === 'Present').length || 0
    const totalDays = attendance?.length || 0

    return NextResponse.json({
      student,
      results: results || [],
      class: enrollment?.classes || null,
      attendance: {
        present: presentDays,
        total: totalDays,
        percentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0
      }
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

