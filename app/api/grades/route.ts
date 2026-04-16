import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import type { AttendanceSummary } from '@/lib/types'  // Reuse structure for result summary

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, school_id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const class_id = searchParams.get('class_id')
    const term_id = searchParams.get('term_id')

    if (!class_id || !term_id) {
      return NextResponse.json({ error: 'class_id and term_id required' }, { status: 400 })
    }

    // Aggregate results per student across all subjects
    const { data, error: queryError } = await supabase
      .from('results')
      .select(`
        student_id,
        total,
        grade,
        students (
          id, registration_number, first_name, last_name
        )
      `)
      .eq('class_id', class_id)
      .eq('term_id', term_id)
      .order('total', { ascending: false })

    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 })
    }

    // Group by student and calculate average
    const summaryMap = new Map()
    data?.forEach((row: any) => {
      const studentId = row.student_id
      if (!summaryMap.has(studentId)) {
        summaryMap.set(studentId, {
          id: studentId,
          registration_number: row.students.registration_number,
          first_name: row.students.first_name,
          last_name: row.students.last_name,
          totals: [],
          subjects_count: 0,
          average: 0,
          position: 0
        })
      }
      const studentSummary = summaryMap.get(studentId)
      studentSummary.totals!.push(row.total || 0)
      studentSummary.subjects_count! += 1
    })

    const summaries = Array.from(summaryMap.values())
      .map((s: any) => {
        const avg = s.totals.reduce((sum: number, curr: number) => sum + curr, 0) / s.subjects_count || 0
        return {
          ...s,
          average: Math.round(avg * 100) / 100,
        }
      })
      .sort((a: any, b: any) => b.average - a.average)

    // Add position numbers
    summaries.forEach((s: any, index: number) => {
      s.position = index + 1
    })

    return NextResponse.json(summaries)
  } catch (error) {
    console.error('Error fetching grades summary:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

