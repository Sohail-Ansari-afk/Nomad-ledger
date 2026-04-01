import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// -------------------------------------------------------------------
// POST /api/invoices/[id]/send
//
// Ref: https://razorpay.com/docs/payments/payment-links/apis/create/
// Ref: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
//
// Security: RAZORPAY_KEY_SECRET stays server-side only.
// The client only ever receives the payment_link_url in the response body.
// -------------------------------------------------------------------

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // 1. Authenticate the request via Supabase session cookie
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Fetch the invoice — RLS ensures user can only access their own records
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*, client:client_id(name, email)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  // 3. Guard: if a payment link already exists, return it immediately
  if (invoice.razorpay_payment_link_url) {
    return NextResponse.json({
      payment_link_url: invoice.razorpay_payment_link_url,
      already_exists: true,
    })
  }

  // 4. Validate Razorpay credentials are configured
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret || keyId.startsWith('rzp_live_xxx') || keyId === 'rzp_live_xxxxxxxxxxxxxxxx') {
    // Razorpay not yet configured — return a helpful dev-mode response
    return NextResponse.json(
      {
        error: 'Razorpay not configured',
        message:
          'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local. ' +
          'Get your keys from https://dashboard.razorpay.com/app/keys',
        dev_mode: true,
      },
      { status: 503 }
    )
  }

  // 5. Build the Razorpay Payment Link payload
  //    Razorpay requires amount in the smallest currency unit (paise for INR, cents for USD)
  //    We use home_amount converted to the home currency so Razorpay always gets INR (or USD).
  //    Ref: https://razorpay.com/docs/payments/payment-links/apis/create/#request-parameters
  const amountInPaise = Math.round((invoice.home_amount || invoice.invoice_amount || 0) * 100)
  const currency = (invoice.home_currency || invoice.invoice_currency || 'INR').toUpperCase()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const razorpayPayload = {
    amount: amountInPaise,
    currency,
    accept_partial: false,
    description: `Invoice ${invoice.invoice_number}`,
    customer: {
      name: invoice.client?.name || 'Client',
      ...(invoice.client?.email ? { email: invoice.client.email } : {}),
    },
    notify: {
      sms: false,
      email: !!(invoice.client?.email),
    },
    reminder_enable: true,
    callback_url: `${appUrl}/invoices`,
    callback_method: 'get',
    notes: {
      invoice_number: invoice.invoice_number,
      invoice_id: invoice.id,
    },
  }

  // 6. Call Razorpay API with HTTP Basic Auth (key_id:key_secret)
  //    We use native fetch so we don't need to install the Razorpay Node SDK.
  //    Ref: https://razorpay.com/docs/payments/payment-links/apis/create/
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  let razorpayData: any
  try {
    const response = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(razorpayPayload),
    })

    razorpayData = await response.json()

    if (!response.ok) {
      console.error('[Razorpay] API error:', razorpayData)
      return NextResponse.json(
        { error: razorpayData?.error?.description || 'Razorpay API error' },
        { status: response.status }
      )
    }
  } catch (networkError) {
    console.error('[Razorpay] Network error:', networkError)
    return NextResponse.json({ error: 'Failed to reach Razorpay' }, { status: 502 })
  }

  const paymentLinkUrl: string = razorpayData.short_url || razorpayData.short_link || ''
  const paymentLinkId: string = razorpayData.id || ''

  // 7. Persist the payment link on the invoice and update status to 'sent'
  const { error: updateError } = await supabase
    .from('invoices')
    .update({
      razorpay_payment_link_url: paymentLinkUrl,
      razorpay_payment_link_id: paymentLinkId,
      status: 'sent',
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    // Payment link was created but we couldn't save it — log and still return it
    console.error('[DB] Failed to save payment link:', updateError.message)
  }

  // 8. Return the payment URL to the client — this is all the client ever sees
  return NextResponse.json({ payment_link_url: paymentLinkUrl })
}
