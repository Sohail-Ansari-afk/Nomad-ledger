import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Fetch their subscription ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, razorpay_sub_id')
      .eq('id', user.id)
      .single()

    if (profile?.plan !== 'pro' || !profile?.razorpay_sub_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    const subscriptionId = profile.razorpay_sub_id

    // 3. Cancel at Razorpay (cancel_at_cycle_end=1 → cancel after current period)
    const keyId = process.env.RAZORPAY_KEY_ID!
    const secret = process.env.RAZORPAY_KEY_SECRET!
    const auth = Buffer.from(`${keyId}:${secret}`).toString('base64')

    const res = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({ cancel_at_cycle_end: 1 }),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      console.error('[cancel-subscription] Razorpay error:', err)
      return NextResponse.json(
        { error: err.error?.description ?? 'Failed to cancel subscription' },
        { status: 502 }
      )
    }

    // 4. Immediately downgrade user in DB (webhook will also fire)
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    await admin
      .from('profiles')
      .update({ plan: 'free', razorpay_sub_id: null })
      .eq('id', user.id)

    console.log(`[cancel-subscription] User ${user.id} cancelled subscription`)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[cancel-subscription] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
