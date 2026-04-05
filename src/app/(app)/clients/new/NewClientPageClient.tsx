'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Currency } from '@/types'
import UpgradeModal from '@/components/subscription/UpgradeModal'

interface Props {
  /** Whether the current user is on the free plan and already has ≥3 clients */
  isBlocked: boolean
  userEmail?: string
  userName?: string | null
}

function PaywallScreen({ userEmail, userName }: { userEmail?: string; userName?: string | null }) {
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <>
      <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
        {/* Lock icon */}
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg, #0f7b6c22, #1a9e8c22)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          border: '2px solid var(--teal)',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--teal-dk)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>
          Free tier limit reached
        </h3>
        <p style={{ color: 'var(--ink-4)', marginBottom: 8, fontSize: 14, maxWidth: 360, margin: '0 auto 8px' }}>
          You&apos;ve added 3 clients on the free plan.
        </p>
        <p style={{ color: 'var(--ink-4)', marginBottom: 28, fontSize: 14, maxWidth: 360, margin: '0 auto 28px' }}>
          Upgrade to <strong style={{ color: 'var(--teal-dk)' }}>NomadLedger Pro</strong> for ₹8,500/month to unlock unlimited clients.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowUpgrade(true)}
            className="btn btn-primary"
            style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }}
          >
            ⭐ Upgrade to Pro — ₹8,500/mo
          </button>
          <Link href="/clients" className="btn" style={{ background: 'transparent' }}>
            Back to Clients
          </Link>
        </div>

        {/* Feature nudge */}
        <div style={{
          marginTop: 32, padding: '16px 20px',
          background: 'var(--surface-2)', borderRadius: 12,
          border: '1px solid var(--border)',
          textAlign: 'left', maxWidth: 360, margin: '32px auto 0',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pro includes</div>
          {['Unlimited clients & invoices', 'Razorpay payment links', 'Full tax & P&L reports', 'AI expense categorisation'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: 'var(--teal)', fontWeight: 700 }}>✓</span>
              <span style={{ color: 'var(--ink-2)' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        userEmail={userEmail}
        userName={userName ?? undefined}
      />
    </>
  )
}

function NewClientForm() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase
        .from('clients')
        .insert({ user_id: user.id, name, email: email || null, currency, notes: notes || null })

      if (insertError) throw insertError

      router.push('/clients')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="card-body">
      {error && (
        <div style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid currentColor', borderRadius: 'var(--r-sm)', padding: '12px', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Client Company Name</label>
          <input type="text" className="form-input" placeholder="e.g. Acme Corp" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Email Address (Optional)</label>
            <input type="email" className="form-input" placeholder="billing@acme.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Default Invoice Currency</label>
            <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="AUD">AUD ($)</option>
              <option value="CAD">CAD ($)</option>
              <option value="SGD">SGD ($)</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Notes (Optional)</label>
          <textarea className="form-input" rows={3} placeholder="Internal notes about this client..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, gap: 12 }}>
          <Link href="/clients" className="btn" style={{ background: 'transparent' }}>Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={loading || !name}>
            {loading ? 'Saving...' : 'Save Client'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewClientPage({ isBlocked, userEmail, userName }: Props) {
  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>
            {isBlocked ? 'Upgrade Required' : 'Add New Client'}
          </h2>
        </div>
      </div>

      <div className="canvas">
        <div className="canvas-full" style={{ maxWidth: 600 }}>
          <div className="card">
            {isBlocked
              ? <PaywallScreen userEmail={userEmail} userName={userName} />
              : <NewClientForm />
            }
          </div>
        </div>
      </div>
    </>
  )
}
