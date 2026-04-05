import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// ─── Verify HMAC-SHA256 signature using Web Crypto API ───────────────────────
async function verifyPaymentSignature(
  paymentId: string,
  subscriptionId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const message = `${paymentId}|${subscriptionId}`
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  const expected = Array.from(new Uint8Array(signed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return expected === signature
}

export async function POST(request: NextRequest) {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
      await request.json()

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!
    const isValid = await verifyPaymentSignature(
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      secret
    )

    if (!isValid) {
      console.warn('[verify-subscription] Signature mismatch for user', user.id)
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // 3. Immediately upgrade user (instant UX; webhook is the durable backup)
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    await admin
      .from('profiles')
      .update({ plan: 'pro', razorpay_sub_id: razorpay_subscription_id })
      .eq('id', user.id)

    console.log(`[verify-subscription] User ${user.id} upgraded to Pro`)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[verify-subscription] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
