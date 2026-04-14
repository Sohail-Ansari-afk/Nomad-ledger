'use client'

import { useState } from 'react'
import Link from 'next/link'

const CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD', 'INR', 'JPY', 'CHF', 'NZD', 'SEK', 'NOK', 'DKK', 'HKD', 'MXN']

type RateResult = { rate: number; converted: number; date: string }

export default function InvoiceConverterClient() {
  const [from, setFrom] = useState('GBP')
  const [to, setTo] = useState('INR')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [result, setResult] = useState<RateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function convert() {
    if (!amount || !from || !to || !date) return
    setLoading(true); setError(''); setResult(null)
    try {
      // Use /latest when today's date is selected (ECB only publishes after ~16:00 CET)
      const today = new Date().toISOString().split('T')[0]
      const endpoint = date === today ? 'latest' : date

      // Proxy through our API to avoid browser CORS restrictions
      const res = await fetch(`/api/public/fx-rate?date=${endpoint}&from=${from}&to=${to}`)

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError((err as { error?: string }).error || 'Rate not available for this date. ECB publishes rates on weekdays (Mon–Fri) only.')
        return
      }

      const data = await res.json()
      if (data.rates?.[to]) {
        const rate = data.rates[to]
        setResult({ rate, converted: parseFloat(amount) * rate, date: data.date })
      } else {
        setError('Rate not available for this date. ECB publishes rates on weekdays (Mon–Fri) only.')
      }
    } catch {
      setError('Could not connect to the rate service. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#f0f4f8' }}>

      {/* Nav */}
      <nav style={{ background: 'rgba(8,12,20,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 40px', height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)' }}>
        <Link href="/" style={{ color: '#f0f4f8', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>
          Nomad<span style={{ color: '#4fa3e8' }}>Ledger</span>
        </Link>
        <Link href="/signup" style={{ background: '#4fa3e8', color: '#fff', padding: '8px 22px', borderRadius: 40, textDecoration: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 0 20px rgba(79,163,232,0.3)' }}>
          Start free
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, rgba(79,163,232,0.08) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '72px 24px 64px', textAlign: 'center' }}>
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4fa3e8', background: 'rgba(79,163,232,0.1)', padding: '6px 16px', borderRadius: 40, border: '1px solid rgba(79,163,232,0.25)', marginBottom: 24 }}>
          💱 Invoice FX Converter
        </p>
        <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Invoice Currency Converter<br />
          <span style={{ color: '#4fa3e8' }}>at Exact Invoice Date Rate</span>
        </h1>
        <p style={{ color: '#a8bdd0', fontSize: 17, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
          Convert any invoice amount to your home currency using the official ECB rate on the invoice send-date. The correct rate for your tax records.
        </p>
      </div>

      {/* Converter card */}
      <div style={{ maxWidth: 640, margin: '48px auto', padding: '0 20px' }}>
        <div style={{ background: 'rgba(13,18,32,0.9)', borderRadius: 24, padding: '40px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>

          {/* Amount */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a8bdd0', marginBottom: 8 }}>Invoice Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 3000"
              style={{ width: '100%', padding: '16px', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 20, fontWeight: 600, background: 'rgba(255,255,255,0.04)', color: '#f0f4f8', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Currency pair */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end', marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a8bdd0', marginBottom: 8 }}>Invoice Currency</label>
              <select value={from} onChange={e => { setFrom(e.target.value); setResult(null) }}
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 15, background: 'rgba(255,255,255,0.04)', color: '#f0f4f8', outline: 'none', cursor: 'pointer' }}>
                {CURRENCIES.map(c => <option key={c} style={{ background: '#0d1220' }}>{c}</option>)}
              </select>
            </div>
            <div style={{ color: '#4fa3e8', fontWeight: 700, fontSize: 22, paddingBottom: 10, textAlign: 'center' }}>→</div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a8bdd0', marginBottom: 8 }}>Home Currency</label>
              <select value={to} onChange={e => { setTo(e.target.value); setResult(null) }}
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 15, background: 'rgba(255,255,255,0.04)', color: '#f0f4f8', outline: 'none', cursor: 'pointer' }}>
                {CURRENCIES.map(c => <option key={c} style={{ background: '#0d1220' }}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a8bdd0', marginBottom: 8 }}>Invoice Send Date <span style={{ color: '#5a7a91', fontWeight: 400 }}>(rate is locked to this date)</span></label>
            <input type="date" value={date} onChange={e => { setDate(e.target.value); setResult(null) }}
              max={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 15, background: 'rgba(255,255,255,0.04)', color: '#f0f4f8', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
          </div>

          <button onClick={convert} disabled={loading}
            style={{ width: '100%', padding: '16px', background: loading ? 'rgba(79,163,232,0.4)' : '#4fa3e8', color: '#fff', border: 'none', borderRadius: 40, fontSize: 16, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', boxShadow: '0 0 28px rgba(79,163,232,0.3)', transition: 'all 0.2s' }}>
            {loading ? 'Converting...' : 'Convert at Invoice Date Rate →'}
          </button>

          {error && (
            <div style={{ marginTop: 16, background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: 12, padding: '12px 16px', color: '#ff7b7b', fontSize: 14 }}>
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: 'rgba(13,18,32,0.9)', border: '1px solid rgba(79,163,232,0.25)', borderRadius: 24, padding: '36px', marginTop: 20, textAlign: 'center' }}>
            {/* Rate locked badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2dd4bf', background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: 20, padding: '4px 12px', marginBottom: 20 }}>
              🔒 Rate Locked — {result.date}
            </div>

            <p style={{ color: '#5a7a91', fontSize: 13, marginBottom: 8 }}>
              {amount} {from} on {result.date}
            </p>

            <div style={{ fontSize: 46, fontWeight: 700, color: '#f0f4f8', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
              {result.converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              <span style={{ fontSize: 22, color: '#5a7a91', marginLeft: 10, fontWeight: 400 }}>{to}</span>
            </div>

            <div style={{ color: '#4fa3e8', fontSize: 15, fontWeight: 500, marginBottom: 24 }}>
              1 {from} = {result.rate.toFixed(6)} {to}
            </div>

            {/* Invoice breakdown */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#5a7a91', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Invoice Amount</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#f0f4f8' }}>{amount} {from}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#5a7a91', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rate on {result.date}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#4fa3e8' }}>{result.rate.toFixed(6)}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#5a7a91', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Home Currency Value (Locked)</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#f0f4f8' }}>{result.converted.toFixed(2)} {to}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(79,163,232,0.07)', border: '1px solid rgba(79,163,232,0.18)', borderRadius: 14, padding: '14px 18px', marginBottom: 24 }}>
              <p style={{ color: '#a8bdd0', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                🔒 <strong style={{ color: '#f0f4f8' }}>NomadLedger locks this exact rate on your invoice automatically</strong> — so your income history is always accurate, even months later.
              </p>
            </div>

            <Link href="/signup" style={{ display: 'inline-block', background: '#4fa3e8', color: '#fff', padding: '13px 32px', borderRadius: 40, textDecoration: 'none', fontWeight: 600, fontSize: 14, boxShadow: '0 0 20px rgba(79,163,232,0.3)' }}>
              Auto-lock this rate on every invoice — free →
            </Link>
          </div>
        )}

        {/* Info box */}
        <div style={{ background: 'rgba(13,18,32,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '28px 32px', marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0f4f8', marginBottom: 12 }}>What Rate Should an Invoice Use?</h2>
          <p style={{ fontSize: 14, color: '#5a7a91', lineHeight: 1.8, margin: 0 }}>
            When billing international clients, your invoice&apos;s home-currency equivalent should use the exchange rate on the <strong style={{ color: '#a8bdd0' }}>day you sent the invoice</strong> — not today&apos;s rate; not when your client paid. This is called send-date FX locking, and it is required by India&apos;s Income Tax Act, the IRS (Publication 54 for expats), and HMRC for foreign income reporting. This tool uses <a href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html" target="_blank" rel="noopener noreferrer" style={{ color: '#4fa3e8', textDecoration: 'none' }}>European Central Bank official historical rates</a>.
          </p>
        </div>

        {/* Internal links */}
        <div style={{ marginTop: 32, display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/tax-calculator" style={{ color: '#4fa3e8', textDecoration: 'none', fontSize: 14 }}>→ Tax Calculator</Link>
          <Link href="/fx-history" style={{ color: '#4fa3e8', textDecoration: 'none', fontSize: 14 }}>→ FX Rate History</Link>
          <Link href="/" style={{ color: '#5a7a91', textDecoration: 'none', fontSize: 14 }}>← Back to NomadLedger</Link>
        </div>
      </div>
    </div>
  )
}
