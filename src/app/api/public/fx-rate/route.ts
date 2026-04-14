import { NextRequest, NextResponse } from 'next/server'

/**
 * PUBLIC proxy for Frankfurter ECB FX rates — no auth required.
 * Used by the free SEO tool pages (/invoice-converter, /fx-history).
 * Server-side fetch avoids CORS issues from direct browser calls.
 *
 * GET /api/public/fx-rate?date=2026-03-31&from=GBP&to=INR
 * GET /api/public/fx-rate?date=latest&from=GBP&to=INR
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const date = searchParams.get('date') || 'latest'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json({ error: 'Missing from or to currency' }, { status: 400 })
  }

  try {
    const url = `https://api.frankfurter.app/${date}?from=${from}&to=${to}`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 }, // cache up to 1 hour
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Rate not available for ${date}. ECB publishes Mon–Fri only.` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Failed to reach ECB rate service. Please try again.' },
      { status: 502 }
    )
  }
}
