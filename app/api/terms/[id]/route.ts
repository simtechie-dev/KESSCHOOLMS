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
      .from('terms')
      .select(`
        *,
        session:academic_sessions(name)
      `)
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching term:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const body = await req.json()
    const { name, session_id, start_date, end_date, is_current } = body

    if (!name || !session_id || !start_date || !end_date) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    // Handle current term toggle
    if (is_current) {
      const { data: user } = await supabase
        .from('users')
        .select('school_id')
        .eq('clerk_id', userId)
        .single()

      if (user?.school_id) {
        await supabase
          .from('terms')
          .update({ is_current: false })
          .eq('school_id', user.school_id)
          .neq('id', params.id)
      }
    }

    const { data, error } = await supabase
      .from('terms')
      .update({
        name,
        session_id,
        start_date,
        end_date,
        is_current: !!is_current,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating term:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const { error } = await supabase
      .from('terms')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting term:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
