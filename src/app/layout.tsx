import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport = {
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: {
    default: 'NomadLedger — Multi-currency finance for freelancers',
    template: '%s | NomadLedger',
  },
  description:
    'Invoice clients in any currency, lock exchange rates, track expenses, and estimate taxes — built for digital nomads and global freelancers.',
  keywords: ['freelancer finance', 'multi-currency invoicing', 'digital nomad', 'tax estimation', 'invoice tool'],
  authors: [{ name: 'NomadLedger' }],
  openGraph: {
    title: 'NomadLedger — Multi-currency finance for freelancers',
    description: 'Invoice clients in any currency, lock exchange rates, track expenses, and estimate taxes.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>{children}</body>
    </html>
  )
}
