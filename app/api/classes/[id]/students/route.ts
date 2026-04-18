import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        students (
          id,
          first_name,
          last_name,
          registration_number,
          gender
        )
      `)
      .eq('class_id', params.id)

    if (error) {
      console.error('Error fetching class students:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Deduplicate by student_id
    const studentMap = new Map()
    data?.forEach((enrollment: any) => {
      const student = enrollment.students
      if (student && !studentMap.has(student.id)) {
        studentMap.set(student.id, student)
      }
    })

    return NextResponse.json(Array.from(studentMap.values()))
  } catch (error) {
    console.error('Error fetching class students:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
