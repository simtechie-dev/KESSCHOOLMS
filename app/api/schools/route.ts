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

    const url = req.url ? new URL(req.url) : new URL('http://localhost')
    const searchTerm = url.searchParams.get('search') || ''
    const lgaFilter = url.searchParams.get('lga') || ''

    let query = supabase
      .from('schools')
      .select(`
        id, name, code, lga,
        student_count:students(count),
        teacher_count:teachers(count)
      `)
      .order('name', { ascending: true })

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,lga.ilike.%${searchTerm}%`)
    }
    if (lgaFilter) {
      query = query.eq('lga', lgaFilter)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching schools:', error)
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

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single()

    if (!user || user.role !== 'state_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    const { data, error } = await supabase
      .from('schools')
      .insert(body)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating school:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}