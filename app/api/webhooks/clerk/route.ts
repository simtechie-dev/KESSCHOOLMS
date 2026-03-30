import { NextRequest, NextResponse } from 'next/server'
import { supbaseAdmin } from '@/lib/supabase'
import { Webhook } from 'svix'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const svixHeaders = {
    'svix-id': req.headers.get('svix-id') || '',
    'svix-timestamp': req.headers.get('svix-timestamp') || '',
    'svix-signature': req.headers.get('svix-signature') || '',
  }

  const body = await req.text()

  const wh = new Webhook(webhookSecret)
  let evt

  try {
    evt = wh.verify(body, svixHeaders) as any
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    try {
      const { error } = await supbaseAdmin.from('users').insert({
        clerk_id: id,
        email: email_addresses[0].email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim(),
        role: 'student', // Default role
      })

      if (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
      console.error('Unexpected error:', error)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
