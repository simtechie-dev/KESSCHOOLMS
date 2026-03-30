import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type, recipientId, data } = body

    if (!type || !recipientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get recipient email
    let recipientEmail = ''

    if (type === 'student' || type === 'parent') {
      const { data: student, error } = await supabase
        .from('students')
        .select('parent_email')
        .eq('id', recipientId)
        .single()

      if (error || !student) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
      }
      recipientEmail = student.parent_email
    } else if (type === 'user') {
      const { data: user, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', recipientId)
        .single()

      if (error || !user) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
      }
      recipientEmail = user.email
    } else {
      return NextResponse.json({ error: 'Invalid recipient type' }, { status: 400 })
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Recipient email not found' }, { status: 404 })
    }

    // In production, integrate with Resend or your email service
    // For now, just log the notification
    console.log('Notification:', {
      type,
      recipientEmail,
      data,
      timestamp: new Date().toISOString(),
    })

    // Store notification in database (optional)
    const { error: insertError } = await supabase.from('notifications').insert({
      recipient_id: recipientId,
      type,
      data,
      email: recipientEmail,
      created_at: new Date().toISOString(),
    }).select()

    if (insertError) {
      console.error('Error storing notification:', insertError)
      // Don't fail if we can't store, just continue
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
