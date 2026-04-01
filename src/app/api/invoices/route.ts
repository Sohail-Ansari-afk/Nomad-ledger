import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { convertAmount } from '@/lib/fx'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { client_id, invoice_date, due_date, invoice_currency, items, notes } = body

  // 1. Validation
  if (!client_id || !invoice_currency || !items || items.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // 2. Profile Check & Limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('home_currency, plan')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (profile.plan === 'free') {
    const { count } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    // Free plan limit is 10 invoices
    if ((count || 0) >= 10) {
      return NextResponse.json({ error: 'Free plan limit reached', upgrade: true }, { status: 402 })
    }
  }

  // 3. Generate Invoice Number (e.g. INV-0001)
  const { count: totalInvoices } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const invoiceNum = `INV-${String((totalInvoices || 0) + 1).padStart(4, '0')}`

  // 4. Calculate total amount & Lock FX
  const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
  
  let fxData = { homeAmount: totalAmount, fxRateLocked: 1, fxRateDate: invoice_date }
  try {
    fxData = await convertAmount(totalAmount, invoice_currency, profile.home_currency, invoice_date)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch FX rate: ' + error.message }, { status: 500 })
  }

  // 5. Insert Invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: user.id,
      client_id,
      invoice_number: invoiceNum,
      invoice_date,
      due_date: due_date || null,
      status: 'draft',
      invoice_currency,
      invoice_amount: totalAmount,
      home_currency: profile.home_currency,
      fx_rate_locked: fxData.fxRateLocked,
      fx_rate_date: fxData.fxRateDate,
      home_amount: fxData.homeAmount,
      notes: notes || null,
    })
    .select('id')
    .single()

  if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 500 })

  // 6. Insert Items
  const itemsToInsert = items.map((item: any, index: number) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    position: index,
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(itemsToInsert)

  if (itemsError) {
    // Rollback invoice if items fail
    await supabase.from('invoices').delete().eq('id', invoice.id)
    return NextResponse.json({ error: 'Failed to add items' }, { status: 500 })
  }

  return NextResponse.json({ success: true, invoice_id: invoice.id })
}
