import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: studentId } = await params;
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === 'school_admin') {
      const { data: student } = await supabase
        .from('students')
        .select('school_id')
        .eq('id', studentId)
        .single()

      if (student?.school_id !== user.school_id) {
        return NextResponse.json({ error: 'You can only view payments for students in your school' }, { status: 403 })
      }
    }

    const { searchParams } = new URL(req.url)
    const term = searchParams.get('term')
    const year = searchParams.get('year')

    let query = supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('payment_date', { ascending: false })

    if (term) {
      query = query.eq('term', term)
    }

    if (year) {
      query = query.eq('year', year)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching student payments:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
