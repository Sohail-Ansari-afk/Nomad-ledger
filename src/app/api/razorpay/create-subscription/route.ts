import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── Razorpay REST helper (no SDK — Cloudflare edge compatible) ──────────────
// NOTE: btoa() is used instead of Buffer.from().toString('base64') because
// Buffer is a Node.js API not available in Cloudflare Workers edge runtime.
function razorpayFetch(path: string, body: object) {
  // Fallback: RAZORPAY_KEY_ID may be missing but NEXT_PUBLIC_RAZORPAY_KEY_ID is always set
  const keyId = (
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    ''
  ).trim()
  const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim()
  // btoa() is available in all runtimes (Browser, Cloudflare Workers, Edge)
  const auth = btoa(`${keyId}:${secret}`)

  return fetch(`https://api.razorpay.com/v1${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  })
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check they're not already pro
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, razorpay_sub_id, full_name')
      .eq('id', user.id)
      .single()

    if (profile?.plan === 'pro') {
      return NextResponse.json({ error: 'Already on Pro plan' }, { status: 400 })
    }

    const planId = process.env.RAZORPAY_PLAN_ID
    if (!planId || planId === 'plan_xxxxxxxxxxxxxxxx') {
      return NextResponse.json({ error: 'Plan not configured' }, { status: 500 })
    }

    // 3. Create subscription at Razorpay
    // total_count: 120 months ≈ 10 years (effectively open-ended)
    const res = await razorpayFetch('/subscriptions', {
      plan_id: planId,
      total_count: 120,
      quantity: 1,
      customer_notify: 1,
      notes: {
        user_id: user.id,        // stored so webhook can map sub → user
        user_email: user.email,
        user_name: profile?.full_name ?? '',
      },
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('[create-subscription] Razorpay error:', err)
      return NextResponse.json(
        { error: err.error?.description ?? 'Failed to create subscription' },
        { status: 502 }
      )
    }

    const data = await res.json()
    console.log(`[create-subscription] Created ${data.id} for user ${user.id}`)

    return NextResponse.json({ subscriptionId: data.id })
  } catch (err: any) {
    console.error('[create-subscription] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
