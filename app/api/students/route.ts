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

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const url = new URL(req.url)
    const classId = url.searchParams.get('class_id')
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '25')
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
      .from('students')
      .select(`
        id, 
        registration_number, 
        first_name, 
        last_name, 
        gender, 
        parent_phone, 
        school_id,
        enrollments!inner(class_id)
      `)
      .order('last_name')
      .range(start, end)

    if (user.role === 'school_admin' && user.school_id) {
      query = query.eq('school_id', user.school_id)
    }

    if (classId) {
      query = query.eq('enrollments.class_id', classId)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const {
      registration_number,
      first_name,
      last_name,
      gender,
      date_of_birth,
      school_id,
      parent_phone,
      parent_email,
    } = body

    if (!registration_number || !first_name || !last_name || !school_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const finalSchoolId = user.role === 'school_admin' ? user.school_id : school_id

    const { data, error } = await supabase
      .from('students')
      .insert({
        registration_number,
        first_name,
        last_name,
        gender,
        date_of_birth,
        school_id: finalSchoolId,
        parent_phone,
        parent_email,
      })
      .select()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Registration number already exists' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}