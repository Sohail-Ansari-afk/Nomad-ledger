import type { Metadata } from 'next'
import TaxCalculatorClient from './TaxCalculatorClient'

export const metadata: Metadata = {
  title: 'Free Freelancer Tax Calculator for Digital Nomads | NomadLedger',
  description:
    'Calculate your estimated tax as a freelancer in India, US, UK, Germany, Portugal, Australia and more. Free progressive bracket breakdown — no signup needed.',
}

export default function TaxCalculatorPage() {
  return <TaxCalculatorClient />
}
