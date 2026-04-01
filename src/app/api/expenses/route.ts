import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { convertAmount } from '@/lib/fx'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { date, description, category, expense_currency, expense_amount, deductible, notes } = body

  // Validation
  if (!date || !description || !category || !expense_currency || !expense_amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Get Profile for home_currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('home_currency')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Convert to home currency
  let fxData = { homeAmount: expense_amount, fxRateLocked: 1, fxRateDate: date }
  try {
    fxData = await convertAmount(expense_amount, expense_currency, profile.home_currency, date)
  } catch (err: any) {
    return NextResponse.json({ error: 'FX lookup failed: ' + err.message }, { status: 500 })
  }

  // Insert Expense
  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      date,
      description,
      category,
      expense_currency,
      expense_amount,
      home_currency: profile.home_currency,
      fx_rate_locked: fxData.fxRateLocked,
      fx_rate_date: fxData.fxRateDate,
      home_amount: fxData.homeAmount,
      deductible: typeof deductible === 'boolean' ? deductible : true,
      notes: notes || null,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: expense.id })
}
