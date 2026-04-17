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
    
    // Get requesting user role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let query = supabase
      .from('users')
      .select(`
        *,
        schools!users_school_id_fkey (
          name,
          code
        )
      `)

    // School admins only see their school users
    if (user.role === 'school_admin' && user.school_id) {
      query = query.eq('school_id', user.school_id)
    }

    // Order by created_at desc
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
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
