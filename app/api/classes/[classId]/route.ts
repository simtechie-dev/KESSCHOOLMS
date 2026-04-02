import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { classId } = params
    const { searchParams } = new URL(req.url)
    const resource = searchParams.get('resource')

    // Get class details
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single()

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    if (resource === 'students') {
      // Get enrolled students
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('class_id', classId)

      if (enrollmentError) {
        return NextResponse.json({ error: enrollmentError.message }, { status: 500 })
      }

      const studentIds = enrollments.map((e: any) => e.student_id)

      if (studentIds.length === 0) {
        return NextResponse.json([])
      }

      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds)

      if (studentsError) {
        return NextResponse.json({ error: studentsError.message }, { status: 500 })
      }

      return NextResponse.json(students)
    }

    if (resource === 'exams') {
      // Get exams for this class
      const { data: exams, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .eq('class_id', classId)

      if (examsError) {
        return NextResponse.json({ error: examsError.message }, { status: 500 })
      }

      return NextResponse.json(exams)
    }

    // Return class details
    return NextResponse.json(classData)
  } catch (error) {
    console.error('Error fetching class data:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}