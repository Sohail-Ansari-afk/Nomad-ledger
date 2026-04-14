import type { Metadata } from 'next'
import FxHistoryClient from './FxHistoryClient'

export const metadata: Metadata = {
  title: 'FX Rate History for Freelancers — Invoice Exchange Rates by Date | NomadLedger',
  description:
    'Look up historical GBP, EUR, USD exchange rates by date. Find the exact rate your invoice should use. Free ECB historical data — no signup needed.',
}

export default function FxHistoryPage() {
  return <FxHistoryClient />
}
