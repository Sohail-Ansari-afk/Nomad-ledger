import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { convertAmount } from '@/lib/fx'

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const expenseId = params.id

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { date, description, category, expense_currency, expense_amount, deductible, notes } = body

  if (!description || !expense_currency || !expense_amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Ensure owner
  const { data: existing } = await supabase.from('expenses').select('id').eq('id', expenseId).eq('user_id', user.id).single()
  if (!existing) return NextResponse.json({ error: 'Expense not found' }, { status: 404 })

  const { data: profile } = await supabase.from('profiles').select('home_currency').eq('id', user.id).single()
  const home_currency = profile?.home_currency || 'USD'

  let fxData = { homeAmount: expense_amount, fxRateLocked: 1, fxRateDate: date }
  try {
    fxData = await convertAmount(expense_amount, expense_currency, home_currency, date)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch FX rate' }, { status: 500 })
  }

  const { error } = await supabase
    .from('expenses')
    .update({
      date,
      description,
      category,
      expense_currency,
      expense_amount,
      home_amount: fxData.homeAmount,
      home_currency,
      fx_rate_locked: fxData.fxRateLocked,
      fx_rate_date: fxData.fxRateDate,
      deductible: !!deductible,
      notes: notes || null,
    })
    .eq('id', expenseId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, expense_id: expenseId })
}
