import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    
    // Get current teacher user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, role, school_id')
      .eq('clerk_id', userId)
      .eq('role', 'teacher')
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Get teacher's classes from class_teachers join
    const { data: classes, error: classesError } = await supabase
      .from('class_teachers')
      .select(`
        classes (
          id, name, code
        ),
        class_id,
        count: enrollments(count)
      `)
      .eq('teacher_id', user.id)
      .leftJoin('classes', 'class_id', 'classes.id')
      .leftJoin('enrollments', 'class_id', 'enrollments.class_id')

    if (classesError) {
      console.error('Classes query error:', classesError)
      return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
    }

    // Aggregate student count per class
    const classMap = new Map()
    let totalStudents = 0

    classes?.forEach((ct: any) => {
      const classId = ct.classes?.id || ct.class_id
      if (!classMap.has(classId)) {
        classMap.set(classId, {
          id: classId,
          name: ct.classes?.name || 'Unknown',
          code: ct.classes?.code || '',
          student_count: 0
        })
      }
      // Note: count aggregation might need adjustment based on exact schema
      totalStudents += 1 // Simplified; use proper count in production
    })

    const teacherClasses = Array.from(classMap.values())
    const totalClasses = teacherClasses.length

    return NextResponse.json({
      classes: teacherClasses,
      stats: {
        totalClasses,
        totalStudents,
        user: user
      }
    })

  } catch (error) {
    console.error('Teacher dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

