import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ─── Supabase admin client (service-role bypasses RLS) ──────────────────────
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

// ─── Verify Razorpay webhook signature using Web Crypto API ─────────────────
// Uses crypto.subtle so it works on Cloudflare Workers edge runtime (no Node crypto)
async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const expected = Array.from(new Uint8Array(signed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return expected === signature
}

export async function POST(request: NextRequest) {
  // 1. Read raw body BEFORE parsing (required for correct HMAC verification)
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''
  const secret = (process.env.RAZORPAY_WEBHOOK_SECRET ?? '').trim()

  // 2. Validate signature
  if (!secret || secret === 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    console.warn('[webhook] RAZORPAY_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const isValid = await verifyWebhookSignature(rawBody, signature, secret)
  if (!isValid) {
    console.warn('[webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // 3. Parse event
  const event = JSON.parse(rawBody)
  const eventType: string = event.event ?? ''
  const subscription = event.payload?.subscription?.entity

  if (!subscription) {
    return NextResponse.json({ received: true })
  }

  const subscriptionId: string = subscription.id
  const subscriptionStatus: string = subscription.status
  // notes.user_id is set when we create the subscription
  const userId: string | undefined = subscription.notes?.user_id

  console.log(`[webhook] ${eventType} | sub=${subscriptionId} | status=${subscriptionStatus} | user=${userId}`)

  const supabase = getAdminClient()

  // Helper: find profile by razorpay_sub_id (fallback when userId note is missing)
  async function resolveUserId(): Promise<string | null> {
    if (userId) return userId
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('razorpay_sub_id', subscriptionId)
      .single()
    return data?.id ?? null
  }

  // 4. Handle events
  switch (eventType) {
    // ── Subscription successfully authenticated (user completed checkout) ──
    case 'subscription.authenticated': {
      const uid = await resolveUserId()
      if (!uid) break
      await supabase
        .from('profiles')
        .update({ razorpay_sub_id: subscriptionId })
        .eq('id', uid)
      break
    }

    // ── Subscription is now active (first charge succeeded) ──
    case 'subscription.activated':
    case 'subscription.charged': {
      const uid = await resolveUserId()
      if (!uid) break
      await supabase
        .from('profiles')
        .update({ plan: 'pro', razorpay_sub_id: subscriptionId })
        .eq('id', uid)
      console.log(`[webhook] Upgraded user ${uid} to Pro`)
      break
    }

    // ── Subscription ended / cancelled / payment failed repeatedly ──
    case 'subscription.cancelled':
    case 'subscription.halted':
    case 'subscription.completed': {
      const uid = await resolveUserId()
      if (!uid) break
      await supabase
        .from('profiles')
        .update({ plan: 'free', razorpay_sub_id: null })
        .eq('id', uid)
      console.log(`[webhook] Downgraded user ${uid} to Free (event: ${eventType})`)
      break
    }

    // ── Subscription paused — keep Pro access while paused ──
    case 'subscription.paused':
    case 'subscription.resumed':
    case 'subscription.updated':
    case 'subscription.pending':
      // No plan change needed for these states
      break

    default:
      console.log(`[webhook] Unhandled event: ${eventType}`)
  }

  // Always return 200 so Razorpay doesn't retry
  return NextResponse.json({ received: true })
}
