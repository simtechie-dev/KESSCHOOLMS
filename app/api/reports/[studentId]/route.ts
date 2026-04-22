import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

// Define the shape of the params
type RouteContext = {
  params: Promise<{ studentId: string }>
}

export async function GET(
  req: NextRequest,
  { params }: RouteContext // Params is now treated as a Promise
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Await the params to "unlock" the studentId
    const { studentId } = await params
    
    const supabase = getSupabaseAdminClient()

    // 2. Get student details
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (!student || studentError) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // 3. Get results with subject names
    const { data: results } = await supabase
      .from('results')
      .select('*, subjects(name)')
      .eq('student_id', studentId)
      .gt('score', 0)

    // 4. Get class info
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*, classes(name)')
      .eq('student_id', studentId)
      .maybeSingle() // Use maybeSingle to prevent errors if no enrollment exists

    // 5. Get attendance summary
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