import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const { data, error } = await supabase
      .from('fee_structure')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching fee:', error)
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

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user || (user.role !== 'school_admin' && user.role !== 'state_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = params
    const body = await req.json()

    // Verify school access for school admin
    if (user.role === 'school_admin') {
      const { data: fee } = await supabase
        .from('fee_structure')
        .select('school_id')
        .eq('id', id)
        .single()

      if (fee?.school_id !== user.school_id) {
        return NextResponse.json({ error: 'You can only edit fees in your school' }, { status: 403 })
      }
    }

    const { data, error } = await supabase
      .from('fee_structure')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error updating fee:', error)
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

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user || (user.role !== 'school_admin' && user.role !== 'state_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = params

    // Verify school access for school admin
    if (user.role === 'school_admin') {
      const { data: fee } = await supabase
        .from('fee_structure')
        .select('school_id')
        .eq('id', id)
        .single()

      if (fee?.school_id !== user.school_id) {
        return NextResponse.json({ error: 'You can only delete fees in your school' }, { status: 403 })
      }
    }

    const { error } = await supabase
      .from('fee_structure')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting fee:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
