'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Tax data ─────────────────────────────────────────────────────────────────
const TAX_CONFIG: Record<string, {
  name: string
  currency: string
  symbol: string
  brackets: { min: number; max: number; rate: number }[]
  standardDeduction: number
}> = {
  IN: {
    name: 'India', currency: 'INR', symbol: '₹',
    standardDeduction: 75000,
    brackets: [
      { min: 0,        max: 300000,   rate: 0  },
      { min: 300000,   max: 700000,   rate: 5  },
      { min: 700000,   max: 1000000,  rate: 10 },
      { min: 1000000,  max: 1200000,  rate: 15 },
      { min: 1200000,  max: 1500000,  rate: 20 },
      { min: 1500000,  max: Infinity, rate: 30 },
    ],
  },
  US: {
    name: 'United States', currency: 'USD', symbol: '$',
    standardDeduction: 14600,
    brackets: [
      { min: 0,       max: 11600,    rate: 10 },
      { min: 11600,   max: 47150,    rate: 12 },
      { min: 47150,   max: 100525,   rate: 22 },
      { min: 100525,  max: 191950,   rate: 24 },
      { min: 191950,  max: 243725,   rate: 32 },
      { min: 243725,  max: 609350,   rate: 35 },
      { min: 609350,  max: Infinity, rate: 37 },
    ],
  },
  GB: {
    name: 'United Kingdom', currency: 'GBP', symbol: '£',
    standardDeduction: 12570,
    brackets: [
      { min: 0,       max: 12570,    rate: 0  },
      { min: 12570,   max: 50270,    rate: 20 },
      { min: 50270,   max: 125140,   rate: 40 },
      { min: 125140,  max: Infinity, rate: 45 },
    ],
  },
  DE: {
    name: 'Germany', currency: 'EUR', symbol: '€',
    standardDeduction: 10908,
    brackets: [
      { min: 0,       max: 10908,    rate: 0  },
      { min: 10908,   max: 15999,    rate: 14 },
      { min: 15999,   max: 62809,    rate: 24 },
      { min: 62809,   max: 277825,   rate: 42 },
      { min: 277825,  max: Infinity, rate: 45 },
    ],
  },
  PT: {
    name: 'Portugal', currency: 'EUR', symbol: '€',
    standardDeduction: 4104,
    brackets: [
      { min: 0,       max: 7703,     rate: 13.25 },
      { min: 7703,    max: 11623,    rate: 18    },
      { min: 11623,   max: 16472,    rate: 23    },
      { min: 16472,   max: 21321,    rate: 26    },
      { min: 21321,   max: 27146,    rate: 32.75 },
      { min: 27146,   max: 39791,    rate: 37    },
      { min: 39791,   max: 51997,    rate: 43.5  },
      { min: 51997,   max: 81199,    rate: 45    },
      { min: 81199,   max: Infinity, rate: 48    },
    ],
  },
  AU: {
    name: 'Australia', currency: 'AUD', symbol: 'A$',
    standardDeduction: 18200,
    brackets: [
      { min: 0,       max: 18200,    rate: 0    },
      { min: 18200,   max: 45000,    rate: 19   },
      { min: 45000,   max: 120000,   rate: 32.5 },
      { min: 120000,  max: 180000,   rate: 37   },
      { min: 180000,  max: Infinity, rate: 45   },
    ],
  },
  CA: {
    name: 'Canada', currency: 'CAD', symbol: 'C$',
    standardDeduction: 15000,
    brackets: [
      { min: 0,       max: 55867,    rate: 15   },
      { min: 55867,   max: 111733,   rate: 20.5 },
      { min: 111733,  max: 154906,   rate: 26   },
      { min: 154906,  max: 220000,   rate: 29   },
      { min: 220000,  max: Infinity, rate: 33   },
    ],
  },
  SG: {
    name: 'Singapore', currency: 'SGD', symbol: 'S$',
    standardDeduction: 1000,
    brackets: [
      { min: 0,       max: 20000,    rate: 0    },
      { min: 20000,   max: 30000,    rate: 2    },
      { min: 30000,   max: 40000,    rate: 3.5  },
      { min: 40000,   max: 80000,    rate: 7    },
      { min: 80000,   max: 120000,   rate: 11.5 },
      { min: 120000,  max: 160000,   rate: 15   },
      { min: 160000,  max: 200000,   rate: 18   },
      { min: 200000,  max: 240000,   rate: 19   },
      { min: 240000,  max: 280000,   rate: 19.5 },
      { min: 280000,  max: 320000,   rate: 20   },
      { min: 320000,  max: Infinity, rate: 22   },
    ],
  },
}

// ─── Calculator logic ─────────────────────────────────────────────────────────
function calculateTax(income: number, deductions: number, countryCode: string) {
  const config = TAX_CONFIG[countryCode]
  if (!config) return null

  const taxableIncome = Math.max(0, income - deductions - config.standardDeduction)
  let totalTax = 0
  const breakdown: { bracket: string; rate: number; taxed: number; due: number }[] = []

  for (const bracket of config.brackets) {
    if (taxableIncome <= bracket.min) break
    const taxed = Math.min(taxableIncome, bracket.max) - bracket.min
    const due = (taxed * bracket.rate) / 100
    totalTax += due
    if (taxed > 0) {
      breakdown.push({
        bracket: `${config.symbol}${bracket.min.toLocaleString()} – ${
          bracket.max === Infinity ? '∞' : config.symbol + bracket.max.toLocaleString()
        }`,
        rate: bracket.rate,
        taxed: Math.round(taxed),
        due: Math.round(due),
      })
    }
  }

  const effectiveRate = income > 0 ? ((totalTax / income) * 100).toFixed(2) : '0.00'
  const monthlySetAside = Math.round(totalTax / 12)
  return { totalTax: Math.round(totalTax), effectiveRate, monthlySetAside, breakdown, config }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TaxCalculatorClient() {
  const [country, setCountry] = useState('IN')
  const [income, setIncome] = useState('')
  const [expenses, setExpenses] = useState('')
  const [result, setResult] = useState<ReturnType<typeof calculateTax>>(null)

  function handleCalculate() {
    const inc = parseFloat(income.replace(/,/g, '')) || 0
    const exp = parseFloat(expenses.replace(/,/g, '')) || 0
    setResult(calculateTax(inc, exp, country))
  }

  const cfg = TAX_CONFIG[country]

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#f0f4f8' }}>

      {/* Nav */}
      <nav style={{ background: 'rgba(8,12,20,0.95)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 40px', height: 68, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)' }}>
        <Link href="/" style={{ color: '#f0f4f8', fontWeight: 700, fontSize: 18, textDecoration: 'none', letterSpacing: '-0.01em' }}>
          Nomad<span style={{ color: '#4fa3e8' }}>Ledger</span>
        </Link>
        <Link href="/signup" style={{ background: '#4fa3e8', color: '#fff', padding: '8px 22px', borderRadius: 40, textDecoration: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 0 20px rgba(79,163,232,0.3)' }}>
          Start free
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, rgba(79,163,232,0.08) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '72px 24px 64px', textAlign: 'center' }}>
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4fa3e8', background: 'rgba(79,163,232,0.1)', padding: '6px 16px', borderRadius: 40, border: '1px solid rgba(79,163,232,0.25)', marginBottom: 24 }}>
          🧮 Free Tool
        </p>
        <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          Free Freelancer Tax Calculator<br />
          <span style={{ color: '#4fa3e8' }}>for Digital Nomads</span>
        </h1>
        <p style={{ color: '#a8bdd0', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          Progressive bracket breakdown for 8 countries. See exactly what to set aside monthly — no signup, no BS.
        </p>
      </div>

      {/* Calculator card */}
      <div style={{ maxWidth: 760, margin: '48px auto', padding: '0 20px' }}>
        <div style={{ background: 'rgba(13,18,32,0.9)', borderRadius: 24, padding: '40px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>

          {/* Country */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a8bdd0', marginBottom: 8 }}>Home Country (Tax Jurisdiction)</label>
            <select
              value={country}
              onChange={e => { setCountry(e.target.value); setResult(null) }}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 15, background: 'rgba(255,255,255,0.04)', color: '#f0f4f8', outline: 'none', cursor: 'pointer' }}
            >
              {Object.entries(TAX_CONFIG).map(([code, c]) => (
                <option key={code} value={code} style={{ background: '#0d1220' }}>{c.name} ({c.currency})</option>
              ))}
            </select>
          </div>

          {/* Income + Expenses row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a8bdd0', marginBottom: 8 }}>
                Annual Gross Income ({cfg.symbol})
              </label>
              <input
                type="number"
                value={income}
                onChange={e => setIncome(e.target.value)}
                placeholder={cfg.currency === 'INR' ? '1200000' : '80000'}
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 15, background: 'rgba(255,255,255,0.04)', color: '#f0f4f8', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a8bdd0', marginBottom: 8 }}>
                Business Expenses ({cfg.symbol}) <span style={{ color: '#5a7a91', fontWeight: 400 }}>optional</span>
              </label>
              <input
                type="number"
                value={expenses}
                onChange={e => setExpenses(e.target.value)}
                placeholder="e.g. 50000"
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.1)', fontSize: 15, background: 'rgba(255,255,255,0.04)', color: '#f0f4f8', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#5a7a91', marginBottom: 24, marginTop: -16 }}>
            Standard deduction of {cfg.symbol}{cfg.standardDeduction.toLocaleString()} for {cfg.name} is applied automatically.
          </p>

          <button
            onClick={handleCalculate}
            style={{ width: '100%', padding: '16px', background: '#4fa3e8', color: '#fff', border: 'none', borderRadius: 40, fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 32px rgba(79,163,232,0.35)', transition: 'all 0.2s' }}
          >
            Calculate My Tax →
          </button>
        </div>

        {/* Results */}
        {result && (
          <div style={{ marginTop: 24 }}>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
              {[
                { label: 'Est. Tax Liability', value: `${result.config.symbol}${result.totalTax.toLocaleString()}`, highlight: true },
                { label: 'Effective Rate', value: `${result.effectiveRate}%`, highlight: false },
                { label: 'Set Aside / Month', value: `${result.config.symbol}${result.monthlySetAside.toLocaleString()}`, highlight: false },
              ].map(card => (
                <div key={card.label} style={{ background: card.highlight ? 'linear-gradient(135deg, rgba(79,163,232,0.15), rgba(79,163,232,0.05))' : 'rgba(13,18,32,0.9)', border: card.highlight ? '1px solid rgba(79,163,232,0.3)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '22px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#5a7a91', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{card.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: card.highlight ? '#4fa3e8' : '#f0f4f8' }}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* Bracket table */}
            <div style={{ background: 'rgba(13,18,32,0.9)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0f4f8', margin: 0 }}>Progressive Bracket Breakdown — {result.config.name}</h2>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {['Bracket', 'Rate', 'Amount in Bracket', 'Tax Due'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#5a7a91', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '14px 20px', color: '#a8bdd0', fontSize: 13 }}>{row.bracket}</td>
                      <td style={{ padding: '14px 20px', color: '#4fa3e8', fontWeight: 600 }}>{row.rate}%</td>
                      <td style={{ padding: '14px 20px', color: '#7a9db5' }}>{result.config.symbol}{row.taxed.toLocaleString()}</td>
                      <td style={{ padding: '14px 20px', color: '#f0f4f8', fontWeight: 600 }}>{result.config.symbol}{row.due.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.02)', fontSize: 12, color: '#5a7a91' }}>
                * Estimate based on standard progressive income tax brackets. Does not replace professional tax advice.
              </div>
            </div>

            {/* CTA */}
            <div style={{ background: 'linear-gradient(135deg, rgba(79,163,232,0.12), rgba(79,163,232,0.04))', border: '1px solid rgba(79,163,232,0.2)', borderRadius: 20, padding: '32px', textAlign: 'center', marginTop: 20 }}>
              <p style={{ color: '#a8bdd0', marginBottom: 20, fontSize: 15, lineHeight: 1.6 }}>
                Track this automatically as you invoice clients — your tax estimate updates live with every invoice you add.
              </p>
              <Link href="/signup" style={{ background: '#4fa3e8', color: '#fff', padding: '14px 36px', borderRadius: 40, textDecoration: 'none', fontWeight: 600, fontSize: 15, boxShadow: '0 0 24px rgba(79,163,232,0.35)' }}>
                Start free — no card needed →
              </Link>
            </div>
          </div>
        )}

        {/* Internal links */}
        <div style={{ marginTop: 36, display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/fx-history" style={{ color: '#4fa3e8', textDecoration: 'none', fontSize: 14 }}>→ FX Rate History for Freelancers</Link>
          <Link href="/invoice-converter" style={{ color: '#4fa3e8', textDecoration: 'none', fontSize: 14 }}>→ Invoice Currency Converter</Link>
          <Link href="/" style={{ color: '#5a7a91', textDecoration: 'none', fontSize: 14 }}>← Back to NomadLedger</Link>
        </div>
      </div>
    </div>
  )
}
