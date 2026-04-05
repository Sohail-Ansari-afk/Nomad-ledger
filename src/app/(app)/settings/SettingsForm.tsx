'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SUPPORTED_COUNTRIES, COUNTRY_NAMES, CURRENCY_FOR_COUNTRY } from '@/lib/tax/rules'
import { updateProfile } from './actions'
import UpgradeModal from '@/components/subscription/UpgradeModal'

export default function SettingsForm({ profile, userEmail }: { profile: any; userEmail?: string }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState(profile.full_name || '')
  const [homeCountry, setHomeCountry] = useState(profile.home_country || 'IN')
  const [taxYearStart, setTaxYearStart] = useState(profile.tax_year_start || 4)

  // ── Subscription state ──
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [billingError, setBillingError] = useState<string | null>(null)
  const [billingSuccess, setBillingSuccess] = useState<string | null>(null)

  const handleSave = async () => {
    if (!fullName.trim()) { setError('Full name is required'); return }
    if (!homeCountry) { setError('Please select a country'); return }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const homeCurrency = CURRENCY_FOR_COUNTRY[homeCountry] || 'USD'
      await updateProfile({
        full_name: fullName,
        home_country: homeCountry,
        home_currency: homeCurrency,
        tax_year_start: taxYearStart,
      })
      setSuccess(true)
      setTimeout(() => router.push('/tax'), 800)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!cancelConfirm) { setCancelConfirm(true); return }
    setCancelLoading(true)
    setBillingError(null)

    try {
      const res = await fetch('/api/razorpay/cancel-subscription', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to cancel')
      setBillingSuccess('Subscription cancelled. Your plan will revert to Free.')
      setCancelConfirm(false)
      router.refresh()
    } catch (err: any) {
      setBillingError(err.message)
    } finally {
      setCancelLoading(false)
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
            <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your Name" />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Base Country (for Tax)</label>
              <select className="form-select" value={homeCountry} onChange={(e) => setHomeCountry(e.target.value)}>
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
              <select className="form-select" value={taxYearStart} onChange={(e) => setTaxYearStart(Number(e.target.value))}>
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
          {billingError && (
            <div style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid currentColor', borderRadius: 'var(--r-sm)', padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
              {billingError}
            </div>
          )}
          {billingSuccess && (
            <div style={{ background: 'var(--teal-light)', color: 'var(--teal-dk)', border: '1px solid var(--teal-mid)', borderRadius: 'var(--r-sm)', padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
              {billingSuccess}
            </div>
          )}

          {profile.plan === 'pro' ? (
            /* ── Active Pro subscriber ── */
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #0f7b6c15, #1a9e8c10)',
                border: '1px solid var(--teal)',
                borderRadius: 12, padding: '16px 20px', marginBottom: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15 }}>⭐</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-dk)' }}>NomadLedger Pro</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Active · ₹8,500/month · Auto-renews</div>
                  {profile.razorpay_sub_id && (
                    <div style={{ fontSize: 11, color: 'var(--ink-5)', marginTop: 4 }}>
                      Sub ID: {profile.razorpay_sub_id}
                    </div>
                  )}
                </div>
                <div style={{
                  background: 'var(--teal)', color: '#fff',
                  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                }}>ACTIVE</div>
              </div>

              {/* Cancel section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 12 }}>
                  Cancelling will downgrade your account to the Free plan at the end of the current billing cycle.
                </div>
                {cancelConfirm ? (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>
                      Are you sure? You'll lose Pro access.
                    </span>
                    <button
                      className="btn"
                      style={{ fontSize: 12, color: 'var(--red)', borderColor: 'var(--red)', background: 'transparent' }}
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 12, background: 'transparent' }}
                      onClick={() => setCancelConfirm(false)}
                    >
                      Keep Pro
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn"
                    style={{ fontSize: 12, color: 'var(--ink-4)', background: 'transparent' }}
                    onClick={handleCancelSubscription}
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ── Free plan — show upgrade prompt ── */
            <div>
              <div style={{
                background: 'var(--surface-2)', padding: '20px',
                borderRadius: 12, border: '1px solid var(--border)',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Free Tier</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>Up to 3 clients · Basic invoicing</div>
                  </div>
                  <div style={{
                    background: 'var(--surface-3)', color: 'var(--ink-4)',
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                  }}>FREE</div>
                </div>
              </div>

              {/* Pro plan card */}
              <div style={{
                background: 'linear-gradient(135deg, #0f7b6c08, #1a9e8c05)',
                border: '2px solid var(--teal)',
                borderRadius: 12, padding: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span>⭐</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-dk)' }}>NomadLedger Pro</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>Unlimited clients · Payment links · Full reports</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
                      ₹8,500<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-4)' }}>/mo</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-5)' }}>~$10 USD</div>
                  </div>
                </div>

                <button
                  onClick={() => setShowUpgrade(true)}
                  className="btn btn-primary"
                  style={{
                    background: 'var(--teal)', borderColor: 'var(--teal)',
                    width: '100%', padding: '12px',
                  }}
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        userEmail={userEmail}
        userName={profile.full_name}
      />
    </div>
  )
}
