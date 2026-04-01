import { createServiceClient } from './supabase/server'
import type { FxResult } from '@/types'

/**
 * Fetches the ECB exchange rate for a given date.
 * Checks Postgres cache first — only calls Frankfurter API on cache miss.
 * Historical rates never change so cached results are permanently valid.
 *
 * IMPORTANT: Never recalculate after storing on an invoice/expense row.
 */
export async function getFxRate(
  fromCurrency: string,
  toCurrency: string,
  date: string  // Format: 'YYYY-MM-DD'
): Promise<FxResult> {
  // Same currency — no conversion needed
  if (fromCurrency === toCurrency) {
    return { rate: 1, date, source: 'cache' }
  }

  const supabase = createServiceClient()

  // 1. Check cache first
  const { data: cached } = await supabase
    .from('fx_rates_cache')
    .select('rate, rate_date')
    .eq('rate_date', date)
    .eq('from_curr', fromCurrency)
    .eq('to_curr', toCurrency)
    .single()

  if (cached) {
    return {
      rate:   Number(cached.rate),
      date:   cached.rate_date,
      source: 'cache',
    }
  }

  // 2. Cache miss — fetch from Frankfurter API (free ECB data, no key needed)
  // Frankfurter automatically returns the closest available rate
  // for weekends/holidays (ECB doesn't publish on those days)
  const response = await fetch(
    `https://api.frankfurter.app/${date}?from=${fromCurrency}&to=${toCurrency}`,
    { next: { revalidate: 0 } }  // Never cache in Next.js — we cache in DB
  )

  if (!response.ok) {
    throw new Error(
      `Frankfurter API error: ${response.status} for ${fromCurrency}/${toCurrency} on ${date}`
    )
  }

  const data = await response.json()
  const rate = data.rates[toCurrency]
  const actualDate = data.date  // May differ from requested date (weekend/holiday)

  if (!rate) {
    throw new Error(`No rate found for ${fromCurrency} → ${toCurrency}`)
  }

  // 3. Store in cache permanently (upsert handles the rare re-fetch case)
  await supabase.from('fx_rates_cache').upsert({
    rate_date: actualDate,
    from_curr: fromCurrency,
    to_curr:   toCurrency,
    rate,
  })

  return { rate, date: actualDate, source: 'api' }
}

/**
 * Converts an amount and returns the locked rate data.
 * Call when creating an invoice or expense — store ALL returned values.
 * NEVER update fx_rate_locked or home_amount after saving.
 */
export async function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date: string
): Promise<{
  homeAmount:   number
  fxRateLocked: number
  fxRateDate:   string
}> {
  const { rate, date: actualDate } = await getFxRate(fromCurrency, toCurrency, date)

  return {
    homeAmount:   Math.round(amount * rate * 100) / 100,
    fxRateLocked: rate,
    fxRateDate:   actualDate,
  }
}
