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
    default: 'NomadLedger | Multi-Currency Finance & Tax Tool for Freelancers',
    template: '%s | NomadLedger',
  },
  description:
    'Stop losing money to exchange rates. NomadLedger automates currency conversion and tax estimates for digital nomads managing multiple international clients.',
  keywords: [
    'multi-currency finance tool',
    'digital nomad finance',
    'freelancer tax estimates',
    'USD EUR GBP conversion',
    'international client dashboard',
    'home-country tax estimation',
    'multi-currency invoicing',
    'digital nomad tax tool',
    'freelancer invoice tool',
    'exchange rate lock',
    'cross-border freelance payments',
    'real-time currency conversion',
  ],
  authors: [{ name: 'NomadLedger' }],
  openGraph: {
    title: 'NomadLedger | Multi-Currency Finance & Tax Tool for Freelancers',
    description:
      'Stop losing money to exchange rates. NomadLedger automates currency conversion and tax estimates for digital nomads managing multiple international clients.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'NomadLedger',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NomadLedger | Multi-Currency Finance & Tax Tool for Freelancers',
    description:
      'Stop losing money to exchange rates. NomadLedger automates currency conversion and tax estimates for digital nomads managing multiple international clients.',
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
