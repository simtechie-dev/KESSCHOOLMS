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
    const term = searchParams.get('term')
    const year = searchParams.get('year')
    const classId = searchParams.get('classId')

    let query = supabase.from('fee_structure').select('*').order('created_at', { ascending: false })

    // If school admin, only return their school fees
    if (user.role === 'school_admin' && user.school_id) {
      query = query.eq('school_id', user.school_id)
    }

    if (term) {
      query = query.eq('term', term)
    }

    if (year) {
      query = query.eq('year', year)
    }

    if (classId) {
      query = query.eq('class_id', classId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching fees:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can create fees
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user || (user.role !== 'school_admin' && user.role !== 'state_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { school_id, class_id, term, year, tuition_fee, development_fee, other_fees } = body

    if (!school_id || !class_id || !term || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify school access
    if (user.role === 'school_admin' && user.school_id !== school_id) {
      return NextResponse.json({ error: 'You can only add fees to your school' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('fee_structure')
      .insert({
        school_id,
        class_id,
        term,
        year,
        tuition_fee,
        development_fee,
        other_fees,
      })
      .select()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Fee structure already exists for this class/term/year' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating fee:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
