import type { Metadata } from 'next'
import InvoiceConverterClient from './InvoiceConverterClient'

export const metadata: Metadata = {
  title: 'Invoice Currency Converter — Convert GBP EUR USD to INR at Invoice Date | NomadLedger',
  description:
    'Convert your invoice amount to home currency using the exact ECB rate on the invoice date. For freelancers billing GBP, EUR, USD internationally. Free, no signup.',
}

export default function InvoiceConverterPage() {
  return <InvoiceConverterClient />
}
