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
    
    let query = supabase
      .from('profiles')
      .select(`
        *,
        schools (
          name,
          code
        )
      `)
      .order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format role display
    const formattedUsers = data.map((u: any) => ({
      ...u,
      role_display: u.role === 'state_admin' ? 'State Admin' :
                    u.role === 'school_admin' ? 'School Admin' :
                    u.role === 'teacher' ? 'Teacher' :
                    'Student',
      school_name: u.schools?.name || 'N/A',
      joined_date: new Date(u.created_at).toLocaleDateString('en-NG')
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
