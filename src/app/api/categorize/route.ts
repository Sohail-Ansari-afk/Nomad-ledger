import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categorizeExpense } from '@/lib/categorize'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { description } = await request.json()
  if (!description) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 })
  }

  const result = await categorizeExpense(description)
  return NextResponse.json(result)
}
