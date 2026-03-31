import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user to check role and school
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const term = searchParams.get('term')
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    let query = supabase
      .from('payments')
      .select('*, students(first_name, last_name, registration_number)')
      .order('payment_date', { ascending: false })

    // If school admin, only return their school payments
    if (user.role === 'school_admin' && user.school_id) {
      query = query.eq('school_id', user.school_id)
    }

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (term) {
      query = query.eq('term', term)
    }

    if (year) {
      query = query.eq('year', year)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can create payments
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user || (user.role !== 'school_admin' && user.role !== 'state_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { student_id, amount, payment_date, term, year, payment_method, reference, status } = body

    if (!student_id || !amount || !payment_date || !term || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify student belongs to school admin's school
    if (user.role === 'school_admin') {
      const { data: student } = await supabase
        .from('students')
        .select('school_id')
        .eq('id', student_id)
        .single()

      if (student?.school_id !== user.school_id) {
        return NextResponse.json({ error: 'You can only record payments for students in your school' }, { status: 403 })
      }
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        student_id,
        amount,
        payment_date,
        term,
        year,
        payment_method,
        reference,
        status: status || 'Completed',
        recorded_by: userId,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
