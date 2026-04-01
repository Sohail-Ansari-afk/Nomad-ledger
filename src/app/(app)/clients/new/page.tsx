'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Currency } from '@/types'

export default function NewClientPage() {
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
        .insert({
          user_id: user.id,
          name,
          email: email || null,
          currency,
          notes: notes || null,
        })

      if (insertError) throw insertError

      router.push('/clients')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>Add New Client</h2>
        </div>
      </div>

      <div className="canvas">
        <div className="canvas-full" style={{ maxWidth: 600 }}>
          <div className="card">
            <div className="card-body">
              {error && (
                <div className="info-box info-box-red mb-4" style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid currentColor', borderRadius: 'var(--r-sm)', padding: '12px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-field">
                  <label className="form-label">Client Company Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Acme Corp"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Email Address (Optional)</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="billing@acme.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Default Invoice Currency</label>
                    <select 
                      className="form-select"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                    >
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
                  <textarea 
                    className="form-input" 
                    rows={3} 
                    placeholder="Internal notes about this client..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, gap: 12 }}>
                  <Link href="/clients" className="btn" style={{ background: 'transparent' }}>Cancel</Link>
                  <button type="submit" className="btn btn-primary" disabled={loading || !name}>
                    {loading ? 'Saving...' : 'Save Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
