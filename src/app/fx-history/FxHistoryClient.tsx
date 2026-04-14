'use client'

import { useState } from 'react'
import Link from 'next/link'

const CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD', 'INR', 'JPY', 'CHF', 'NZD', 'SEK', 'NOK', 'DKK', 'HKD', 'MXN']

type RateResult = { rate: number; converted: number; date: string }

export default function FxHistoryClient() {
  const [from, setFrom] = useState('GBP')
  const [to, setTo] = useState('INR')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [amount, setAmount] = useState('2500')
  const [result, setResult] = useState<RateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchRate() {
    if (!date || !from || !to) return
    setLoading(true); setError(''); setResult(null)
    try {
      // Use /latest when today's date is selected (ECB only publishes after ~16:00 CET)
      const today = new Date().toISOString().split('T')[0]
      const endpoint = date === today ? 'latest' : date

      // Proxy through our API to avoid browser CORS restrictions
      const res = await fetch(`/api/public/fx-rate?date=${endpoint}&from=${from}&to=${to}`)

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError((err as { error?: string }).error || 'Rate not available for this date. ECB publishes rates on weekdays (Mon–Fri) only — try the nearest weekday.')
        return
      }

      const data = await res.json()
      if (data.rates && data.rates[to]) {
        const rate = data.rates[to]
        setResult({ rate, converted: parseFloat(amount || '1') * rate, date: data.date })
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
          📅 Historical ECB Rates
        </p>
        <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Historical FX Rate Lookup<br />
          <span style={{ color: '#4fa3e8' }}>for Freelancers & Digital Nomads</span>
        </h1>
        <p style={{ color: '#a8bdd0', fontSize: 17, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
          Find the exact exchange rate on any past date. The official ECB rate your invoice should use — no guesswork.
        </p>
      </div>

      {/* Lookup card */}
      <div style={{ maxWidth: 700, margin: '48px auto', padding: '0 20px' }}>
        <div style={{ background: 'rgba(13,18,32,0.9)', borderRadius: 24, padding: '40px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>

          {/* Currency pair */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a8bdd0', marginBottom: 8 }}>From Currency (Invoice)</label>
              <select value={from} onChange={e => { setFrom(e.target.value); setResult(null) }}
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 15, background: 'rgba(255,255,255,0.04)', color: '#f0f4f8', outline: 'none', cursor: 'pointer' }}>
                {CURRENCIES.map(c => <option key={c} style={{ background: '#0d1220' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a8bdd0', marginBottom: 8 }}>To Currency (Home)</label>
              <select value={to} onChange={e => { setTo(e.target.value); setResult(null) }}
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 15, background: 'rgba(255,255,255,0.04)', color: '#f0f4f8', outline: 'none', cursor: 'pointer' }}>
                {CURRENCIES.map(c => <option key={c} style={{ background: '#0d1220' }}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Date + Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a8bdd0', marginBottom: 8 }}>Invoice Date</label>
              <input type="date" value={date} onChange={e => { setDate(e.target.value); setResult(null) }}
                max={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 15, background: 'rgba(255,255,255,0.04)', color: '#f0f4f8', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a8bdd0', marginBottom: 8 }}>Invoice Amount ({from})</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 2500"
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 15, background: 'rgba(255,255,255,0.04)', color: '#f0f4f8', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <button onClick={fetchRate} disabled={loading}
            style={{ width: '100%', padding: '16px', background: loading ? 'rgba(79,163,232,0.4)' : '#4fa3e8', color: '#fff', border: 'none', borderRadius: 40, fontSize: 16, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', boxShadow: '0 0 28px rgba(79,163,232,0.3)', transition: 'all 0.2s' }}>
            {loading ? 'Fetching ECB rate...' : 'Get Historical Rate →'}
          </button>

          {error && (
            <div style={{ marginTop: 16, background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', borderRadius: 12, padding: '12px 16px', color: '#ff7b7b', fontSize: 14 }}>
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: 'rgba(13,18,32,0.9)', border: '1px solid rgba(79,163,232,0.2)', borderRadius: 24, padding: '36px', marginTop: 20, textAlign: 'center' }}>
            <p style={{ color: '#5a7a91', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              ECB Rate on {result.date}
            </p>
            <div style={{ fontSize: 16, color: '#4fa3e8', fontWeight: 600, marginBottom: 16 }}>
              1 {from} = {result.rate.toFixed(4)} {to}
            </div>
            <div style={{ fontSize: 44, fontWeight: 700, color: '#f0f4f8', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              {result.converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}
            </div>
            <p style={{ color: '#5a7a91', fontSize: 13, marginBottom: 24 }}>
              {amount} {from} × {result.rate.toFixed(4)} = {result.converted.toFixed(2)} {to}
            </p>

            <div style={{ background: 'rgba(79,163,232,0.07)', border: '1px solid rgba(79,163,232,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
              <p style={{ color: '#a8bdd0', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                💡 <strong style={{ color: '#f0f4f8' }}>NomadLedger locks this exact rate on your invoice at creation</strong> — permanently. Your income history never fluctuates, even if today&apos;s rate changes.
              </p>
            </div>

            <Link href="/signup" style={{ display: 'inline-block', background: '#4fa3e8', color: '#fff', padding: '13px 32px', borderRadius: 40, textDecoration: 'none', fontWeight: 600, fontSize: 14, boxShadow: '0 0 20px rgba(79,163,232,0.3)' }}>
              Lock rates automatically on every invoice — free →
            </Link>
          </div>
        )}

        {/* How it works note */}
        <div style={{ background: 'rgba(13,18,32,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '28px 32px', marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0f4f8', marginBottom: 12 }}>Why Invoice Date Exchange Rates Matter for Tax</h2>
          <p style={{ fontSize: 14, color: '#5a7a91', lineHeight: 1.8, margin: 0 }}>
            India&apos;s Income Tax Act, HMRC, and the IRS all require foreign income to be reported at the exchange rate on the date the income was earned — not today&apos;s rate. Using the wrong rate can create discrepancies in your tax filing. The <a href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html" target="_blank" rel="noopener noreferrer" style={{ color: '#4fa3e8', textDecoration: 'none' }}>ECB historical rates</a> above are the official reference used by tax authorities in the EU and accepted globally.
          </p>
        </div>

        {/* Internal links */}
        <div style={{ marginTop: 32, display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/tax-calculator" style={{ color: '#4fa3e8', textDecoration: 'none', fontSize: 14 }}>→ Freelancer Tax Calculator</Link>
          <Link href="/invoice-converter" style={{ color: '#4fa3e8', textDecoration: 'none', fontSize: 14 }}>→ Invoice Currency Converter</Link>
          <Link href="/" style={{ color: '#5a7a91', textDecoration: 'none', fontSize: 14 }}>← Back to NomadLedger</Link>
        </div>
      </div>
    </div>
  )
}
