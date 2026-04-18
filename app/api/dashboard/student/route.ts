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

    // Hardcoded for demo — Ilu Simeon
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', '4955edd7-c1bc-46cb-9448-07b88ad8fc16')
      .single()

    if (error || !student) {
      return NextResponse.json({ error: 'No student found' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}