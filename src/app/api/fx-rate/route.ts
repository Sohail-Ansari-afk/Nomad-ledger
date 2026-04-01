import { NextRequest, NextResponse } from 'next/server'
import { getFxRate } from '@/lib/fx'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to   = searchParams.get('to')
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  if (!from || !to) {
    return NextResponse.json({ error: '`from` and `to` query params are required' }, { status: 400 })
  }

  try {
    const result = await getFxRate(from, to, date)
    return NextResponse.json(result)
  } catch (error) {
    console.error('FX rate error:', error)
    return NextResponse.json({ error: 'Failed to fetch rate' }, { status: 500 })
  }
}
