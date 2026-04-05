'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  userEmail?: string
  userName?: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function UpgradeModal({ open, onClose, userEmail, userName }: UpgradeModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Load Razorpay checkout script dynamically
  useEffect(() => {
    if (!open) return
    if (window.Razorpay) { setScriptLoaded(true); return }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => setError('Failed to load payment gateway. Please refresh.')
    document.body.appendChild(script)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleUpgrade = useCallback(async () => {
    if (!scriptLoaded) { setError('Payment gateway still loading, please wait.'); return }
    setLoading(true)
    setError(null)

    try {
      // Step 1: Create subscription on our backend
      const res = await fetch('/api/razorpay/create-subscription', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create subscription')

      const subscriptionId: string = data.subscriptionId

      // Step 2: Open Razorpay Checkout with subscription_id
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!

      await new Promise<void>((resolve, reject) => {
        const options = {
          key: keyId,
          subscription_id: subscriptionId,
          name: 'NomadLedger',
          description: 'Pro Plan — ₹8,500/month',
          image: '/icon.png',
          prefill: {
            name: userName ?? '',
            email: userEmail ?? '',
          },
          theme: { color: '#0f7b6c' },
          modal: {
            ondismiss: () => {
              setLoading(false)
              reject(new Error('Payment cancelled'))
            },
          },
          handler: async (response: {
            razorpay_payment_id: string
            razorpay_subscription_id: string
            razorpay_signature: string
          }) => {
            try {
              // Step 3: Verify payment on our backend
              const verifyRes = await fetch('/api/razorpay/verify-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response),
              })
              const verifyData = await verifyRes.json()
              if (!verifyRes.ok) throw new Error(verifyData.error ?? 'Verification failed')

              resolve()
            } catch (err) {
              reject(err)
            }
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', (resp: any) => {
          reject(new Error(resp.error?.description ?? 'Payment failed'))
        })
        rzp.open()
      })

      // Step 4: Success — refresh and close
      router.refresh()
      onClose()
    } catch (err: any) {
      if (err.message !== 'Payment cancelled') {
        setError(err.message)
      }
      setLoading(false)
    }
  }, [scriptLoaded, userEmail, userName, router, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        style={{
          position: 'fixed', inset: 0, zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 16,
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            width: '100%', maxWidth: 480,
            overflow: 'hidden',
            pointerEvents: 'all',
            animation: 'slideUp 0.2s ease',
          }}
        >
          {/* Header gradient */}
          <div style={{
            background: 'linear-gradient(135deg, #0f7b6c 0%, #1a9e8c 100%)',
            padding: '28px 28px 24px',
            position: 'relative',
          }}>
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(255,255,255,0.2)', border: 'none',
                borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
                color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.2)', borderRadius: 20,
              padding: '4px 12px', marginBottom: 12,
            }}>
              <span style={{ fontSize: 14 }}>⭐</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: 0.5 }}>PRO PLAN</span>
            </div>

            <h2
              id="upgrade-modal-title"
              style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}
            >
              Unlock Unlimited Clients
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
              You&apos;ve reached the free tier limit of 3 clients.
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px' }}>
            {/* Features list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {[
                ['∞', 'Unlimited clients & invoices'],
                ['₹', 'Razorpay payment links on every invoice'],
                ['📊', 'Full tax reports & P&L statements'],
                ['🌍', 'Multi-currency with live FX rates'],
                ['🔄', 'AI-powered expense categorisation'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--teal-light)', color: 'var(--teal-dk)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Pricing pill */}
            <div style={{
              background: 'var(--surface-2)', borderRadius: 12,
              padding: '16px 20px', marginBottom: 20,
              border: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 2 }}>Monthly subscription</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>
                  ₹8,500
                  <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-4)' }}>/month</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>~$10 USD</div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>Cancel anytime</div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'var(--red-light)', color: 'var(--red)',
                border: '1px solid currentColor', borderRadius: 8,
                padding: '10px 14px', marginBottom: 16, fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{
                width: '100%', padding: '14px 24px',
                background: loading ? 'var(--ink-5)' : 'linear-gradient(135deg, #0f7b6c, #1a9e8c)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.15s ease',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  Processing...
                </>
              ) : (
                <>Subscribe — ₹8,500/month</>
              )}
            </button>

            <p style={{ fontSize: 11, color: 'var(--ink-5)', textAlign: 'center', marginTop: 12 }}>
              Secured by Razorpay · Auto-renews monthly · Cancel anytime from Settings
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  )
}
