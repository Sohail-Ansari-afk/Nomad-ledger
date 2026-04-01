'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPPORTED_COUNTRIES, COUNTRY_NAMES, CURRENCY_FOR_COUNTRY } from '@/lib/tax/rules'
import { updateProfile } from './actions'

export default function SettingsForm({ profile }: { profile: any }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState(profile.full_name || '')
  const [homeCountry, setHomeCountry] = useState(profile.home_country || 'IN')
  const [taxYearStart, setTaxYearStart] = useState(profile.tax_year_start || 4)

  const handleSave = async () => {
    if (!fullName.trim()) { setError('Full name is required'); return }
    if (!homeCountry) { setError('Please select a country'); return }
    
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const homeCurrency = CURRENCY_FOR_COUNTRY[homeCountry] || 'USD'

      // Fix 2: Use Server Action with revalidatePath instead of client-side
      // Supabase update + router.refresh(). revalidatePath forces all dependent
      // Server Components (/dashboard, /tax, /invoices) to re-fetch from Supabase.
      await updateProfile({
        full_name:      fullName,
        home_country:   homeCountry,
        home_currency:  homeCurrency,
        tax_year_start: taxYearStart,
      })

      setSuccess(true)
      // Navigate to Tax page so user immediately sees the corrected brackets
      setTimeout(() => router.push('/tax'), 800)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── PROFILE & TAX SETUP ── */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Profile & Tax Setup</h3>
        </div>
        <div className="card-body">
          {error && (
            <div style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid currentColor', borderRadius: 'var(--r-sm)', padding: '12px', marginBottom: 20 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'var(--teal-light)', color: 'var(--teal-dk)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-sm)', padding: '12px', marginBottom: 20 }}>
              ✓ Settings saved. Redirecting to Tax Estimate...
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Name"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Base Country (for Tax)</label>
              <select 
                className="form-select"
                value={homeCountry}
                onChange={(e) => setHomeCountry(e.target.value)}
              >
                {SUPPORTED_COUNTRIES.map(code => (
                  <option key={code} value={code}>{COUNTRY_NAMES[code]}</option>
                ))}
              </select>
              <p className="form-hint">
                Home currency auto-mapped to: <strong>{CURRENCY_FOR_COUNTRY[homeCountry] || '...'}</strong>
              </p>
            </div>

            <div className="form-field">
              <label className="form-label">Tax Year Starts In</label>
              <select 
                className="form-select"
                value={taxYearStart}
                onChange={(e) => setTaxYearStart(Number(e.target.value))}
              >
                <option value={1}>January (US, Germany, Singapore)</option>
                <option value={4}>April (India, UK)</option>
                <option value={7}>July (Australia)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* ── PLAN & BILLING ── */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Plan & Billing</h3>
        </div>
        <div className="card-body">
          <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--r)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                {profile.plan === 'pro' ? 'NomadLedger Pro' : 'Free Tier'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>
                {profile.plan === 'pro' 
                  ? 'Your subscription is active.' 
                  : 'Upgrade to Pro to unlock Razorpay payment links and unlimited invoices.'}
              </div>
            </div>
            {profile.plan === 'free' && (
              <button className="btn btn-sm" style={{ background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }}>
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
