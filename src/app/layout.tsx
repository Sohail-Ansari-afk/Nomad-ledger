import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
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
    default: 'NomadLedger — Invoicing Software for Digital Nomads | Multi-Currency Invoice App',
    template: '%s | NomadLedger',
  },
  description:
    'Invoice clients in GBP, EUR, USD from India. NomadLedger locks your exchange rate at invoice date — no more fluctuating income. Free tax estimate for 12 countries. Start free, no card needed.',
  keywords: [
    'invoicing software for digital nomads',
    'multi-currency invoice app for freelancers',
    'freelancer tax calculator India',
    'how to lock exchange rate on invoice',
    'invoice in GBP USD EUR home currency India',
    'freelance income tracker multiple currencies',
    'Razorpay invoice generator freelancer',
    'digital nomad tax estimate tool',
    'send-date FX locking',
    'multi-currency invoicing',
    'exchange rate lock at invoice date',
    'cross-border freelance payments India',
  ],
  authors: [{ name: 'NomadLedger' }],
  openGraph: {
    title: 'NomadLedger — Invoicing Software for Digital Nomads | Multi-Currency Invoice App',
    description:
      'Invoice clients in GBP, EUR, USD from India. NomadLedger locks your exchange rate at invoice date — no more fluctuating income. Free tax estimate for 12 countries.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'NomadLedger',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NomadLedger — Invoicing Software for Digital Nomads | Multi-Currency Invoice App',
    description:
      'Invoice clients in GBP, EUR, USD from India. NomadLedger locks your exchange rate at invoice date — no more fluctuating income. Free tax estimate for 12 countries.',
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
      <body>
        {children}

        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CX3744ENNG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CX3744ENNG');
          `}
        </Script>
      </body>
    </html>
  )
}
