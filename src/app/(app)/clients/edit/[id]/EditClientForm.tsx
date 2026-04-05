'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Currency } from '@/types'
import { updateClientAction } from '../../actions'

export default function EditClientForm({ client }: { client: any }) {
  const router = useRouter()

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const [name, setName] = useState(client.name || '')
  const [email, setEmail] = useState(client.email || '')
  const [currency, setCurrency] = useState<Currency>(client.currency || 'USD')
  const [notes, setNotes] = useState(client.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        await updateClientAction(client.id, {
          name, 
          email: email || null, 
          currency, 
          notes: notes || null
        })
        router.push('/clients')
      } catch (err: any) {
        setError(err.message)
      }
    })
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
          <button type="submit" className="btn btn-primary" disabled={isPending || !name}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
