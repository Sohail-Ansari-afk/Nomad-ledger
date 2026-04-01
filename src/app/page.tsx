import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NomadLedger — Multi-currency finance for freelancers',
  description:
    'Invoice clients in USD, EUR & GBP. Lock exchange rates. Track expenses. Estimate taxes.',
}

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Multi-currency invoicing',
    desc: 'Send invoices in USD, EUR, GBP or any currency. The exchange rate locks at invoice date — your books are always accurate.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    title: 'Online payments',
    desc: 'Clients pay invoices instantly via UPI, cards, or net banking through Razorpay. Payment links are sent with every invoice.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 14l6-6M9.5 9a.5.5 0 11-1 0 .5.5 0 011 0zM14.5 14a.5.5 0 11-1 0 .5.5 0 011 0z" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    title: 'Tax estimation',
    desc: 'Know your quarterly advance tax in India, the US, UK, Germany and 5 more countries — before the deadline hits.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'Expense tracking',
    desc: 'Log business expenses in any currency. AI auto-categorizes them. Deductibles are tracked separately for tax season.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    title: 'Professional PDF invoices',
    desc: 'Generate beautiful PDF invoices instantly, with your rate, currency breakdown, and payment link baked in.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: 'P&L reports',
    desc: 'See your income by currency, average exchange rates, and net profit — all in your home currency, every quarter.',
  },
]

export default function LandingPage() {
  return (
    <div style={{ background: '#f5f5f7', minHeight: '100vh', color: '#1d1d1f' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        padding: '0 40px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#1d1d1f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: '#1d1d1f' }}>NomadLedger</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/login" style={{ fontSize: 13, color: '#1d1d1f', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          <Link href="/signup" style={{
            padding: '8px 16px', background: '#0071e3', color: '#fff',
            borderRadius: 20, fontSize: 13, fontWeight: 500, textDecoration: 'none',
            transition: 'background 200ms',
          }}>Get started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '120px 40px 100px', textAlign: 'center', background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24, color: '#1d1d1f' }}>
          Finance built for<br />
          global freelancers.
        </h1>
        <p style={{ fontSize: 'clamp(18px, 2vw, 24px)', color: '#86868b', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.4, letterSpacing: '-0.01em', fontWeight: 400 }}>
          Invoice in USD. Get paid in INR. Lock exchange rates, track expenses, and estimate your taxes — wonderfully simple.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            padding: '16px 32px', background: '#0071e3', color: '#fff',
            borderRadius: 30, fontSize: 16, fontWeight: 500, textDecoration: 'none',
            transition: 'all 200ms ease',
          }}>
            Start for free
          </Link>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em', color: '#1d1d1f', marginBottom: 12 }}>Everything you need.</h2>
          <p style={{ fontSize: 18, color: '#86868b', maxWidth: 500, margin: '0 auto' }}>One beautifully crafted tool for invoicing, expenses, and taxes.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.03)',
              borderRadius: 24, padding: '32px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
            }}>
              <div style={{ width: 44, height: 44, background: '#f5f5f7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: '#1d1d1f' }}>
                <span style={{ width: 22, height: 22, display: 'block' }}>{f.icon}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1d1d1f', marginBottom: 8, letterSpacing: '-0.02em' }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: '#86868b', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FX LOCK CALLOUT ── */}
      <section style={{ background: '#1d1d1f', padding: '100px 40px', color: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
              Your rate. <br/>Locked forever.
            </h2>
            <p style={{ fontSize: 18, color: '#86868b', lineHeight: 1.5, marginBottom: 24 }}>
              When you send an invoice for $3,000 on a day when 1 USD = ₹84, that ₹2,52,000 is locked to that invoice permanently — even if tomorrow&apos;s rate changes.
            </p>
          </div>
          <div style={{ background: '#000000', border: '1px solid #424245', borderRadius: 24, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #424245' }}>
              <p style={{ fontSize: 13, color: '#86868b', marginBottom: 8, fontWeight: 500 }}>Invoice INV-0024</p>
              <p style={{ fontSize: 32, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em' }}>$3,000.00 <span style={{ fontSize: 16, color: '#86868b', fontWeight: 500 }}>USD</span></p>
            </div>
            <div style={{ background: '#1d1d1f', borderRadius: 16, padding: '20px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#0071e3', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>Rate Locked</p>
              <p style={{ fontSize: 24, fontWeight: 600, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 4 }}>₹2,52,000.00</p>
              <p style={{ fontSize: 13, color: '#86868b' }}>1 USD = ₹84.00</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#f5f5f7', padding: '60px 40px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>NomadLedger</span>
          </div>
          <p style={{ fontSize: 13, color: '#86868b' }}>© 2026 NomadLedger. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
