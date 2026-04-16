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
      .select('students!inner(*)')
      .eq('class_id', params.id)

    if (error) {
      console.error('Error fetching class students:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json((data || []).flatMap((e: any) => e.students))
  } catch (error) {
    console.error('Error fetching class students:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
