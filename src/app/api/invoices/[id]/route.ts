import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { convertAmount } from '@/lib/fx'

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const invoiceId = params.id
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { client_id, invoice_date, due_date, invoice_currency, items, notes } = body

  if (!client_id || !invoice_currency || !items || items.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Ensure ownership
  const { data: existing } = await supabase.from('invoices').select('id, status').eq('id', invoiceId).eq('user_id', user.id).single()
  if (!existing) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const { data: profile } = await supabase.from('profiles').select('home_currency').eq('id', user.id).single()
  const home_currency = profile?.home_currency || 'USD'

  const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
  
  let fxData = { homeAmount: totalAmount, fxRateLocked: 1, fxRateDate: invoice_date }
  try {
    fxData = await convertAmount(totalAmount, invoice_currency, home_currency, invoice_date)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch FX rate' }, { status: 500 })
  }

  // Update invoice
  const { error: invoiceError } = await supabase
    .from('invoices')
    .update({
      client_id,
      invoice_date,
      due_date: due_date || null,
      invoice_currency,
      invoice_amount: totalAmount,
      home_amount: fxData.homeAmount,
      fx_rate_locked: fxData.fxRateLocked,
      fx_rate_date: fxData.fxRateDate,
      notes: notes || null,
    })
    .eq('id', invoiceId)

  if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 500 })

  // Re-insert items
  await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)
  
  const itemsToInsert = items.map((item: any, index: number) => ({
    invoice_id: invoiceId,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    position: index,
  }))

  const { error: itemsError } = await supabase.from('invoice_items').insert(itemsToInsert)
  if (itemsError) return NextResponse.json({ error: 'Failed to add items' }, { status: 500 })

  return NextResponse.json({ success: true, invoice_id: invoiceId })
}
