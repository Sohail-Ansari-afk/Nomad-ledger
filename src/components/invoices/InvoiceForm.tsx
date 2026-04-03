'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/formatCurrency'


interface Client {
  id: string
  name: string
  currency: string
  default_rate?: number
}

interface Item {
  description: string
  quantity: number
  unit_price: number
}

export function InvoiceForm({
  clients,
  homeCurrency,
  initialData,
}: {
  clients: Client[]
  homeCurrency: string
  initialData?: any
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Core invoice fields
  const [clientId, setClientId] = useState(initialData?.client_id || '')
  const [date, setDate] = useState(initialData?.invoice_date || new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')
  const [currency, setCurrency] = useState(initialData?.invoice_currency || 'USD')
  const [notes, setNotes] = useState(initialData?.notes || '')

  const defaultItems = initialData?.items?.length > 0
    ? initialData.items.sort((a: any, b: any) => a.position - b.position).map((i: any) => ({
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
      }))
    : [{ description: '', quantity: 1, unit_price: 0 }]

  const [items, setItems] = useState<Item[]>(defaultItems)

  const [fxRate, setFxRate] = useState<{ rate: number, homeAmount: number } | null>(null)
  const [fetchingFx, setFetchingFx] = useState(false)

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

  // Auto-fill currency when client changes
  useEffect(() => {
    if (clientId) {
      const selected = clients.find(c => c.id === clientId)
      if (selected?.currency) setCurrency(selected.currency)
    }
  }, [clientId, clients])

  // Fetch FX rate on amount/currency/date change
  useEffect(() => {
    async function fetchRate() {
      if (total === 0 || currency === homeCurrency || !date) {
        setFxRate(currency === homeCurrency ? { rate: 1, homeAmount: total } : null)
        return
      }
      setFetchingFx(true)
      try {
        const res = await fetch(`/api/fx-rate?from=${currency}&to=${homeCurrency}&date=${date}`)
        if (res.ok) {
          const data = await res.json()
          setFxRate({ rate: data.rate, homeAmount: Math.round(total * data.rate * 100) / 100 })
        }
      } catch { /* silent */ } finally {
        setFetchingFx(false)
      }
    }
    const timer = setTimeout(fetchRate, 500)
    return () => clearTimeout(timer)
  }, [total, currency, homeCurrency, date])

  const handleAddItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  const handleRemoveItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const handleChangeItem = (i: number, field: keyof Item, value: any) => {
    const next = [...items]
    next[i] = { ...next[i], [field]: value }
    setItems(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (items.some(i => !i.description || i.unit_price <= 0)) {
      setError('All items must have a description and price > 0')
      setLoading(false)
      return
    }

    try {
      const isEditing = !!initialData
      const url = isEditing ? `/api/invoices/${initialData.id}` : '/api/invoices'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          invoice_date: date,
          due_date: dueDate || undefined,
          invoice_currency: currency,
          notes,
          items,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.upgrade
          ? 'Free plan limit (10 invoices) reached. Please upgrade to Pro.'
          : data.error || 'Failed to save invoice')
        setLoading(false)
        return
      }

      router.push('/invoices')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (clients.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: 'var(--ink-4)', marginBottom: 16 }}>You need a client before creating an invoice.</p>
        <Link href="/clients/new" className="btn btn-primary">Add your first client</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* ── CLIENT + CURRENCY ── */}
      <div className="form-row" style={{ marginBottom: 24 }}>
        <div className="form-field">
          <label className="form-label">Client</label>
          <select className="form-select" value={clientId} onChange={e => setClientId(e.target.value)} required>
            <option value="">Select a client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Invoice Currency</label>
          <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)} required>
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

      {/* ── DATES ── */}
      <div className="form-row" style={{ marginBottom: 32 }}>
        <div className="form-field">
          <label className="form-label">Invoice Date</label>
          <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div className="form-field">
          <label className="form-label">Due Date (Optional)</label>
          <input type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>

      {/* ── LINE ITEMS ── */}
      <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 12 }}>Line Items</h3>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 16, marginBottom: 24 }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: index !== items.length - 1 ? 16 : 0 }}>
            <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
              {index === 0 && <label className="form-label" style={{ fontSize: 11 }}>Description</label>}
              <input type="text" className="form-input" placeholder="Software licensing fee" value={item.description} onChange={e => handleChangeItem(index, 'description', e.target.value)} required />
            </div>
            <div className="form-field" style={{ width: 80, marginBottom: 0 }}>
              {index === 0 && <label className="form-label" style={{ fontSize: 11 }}>Qty</label>}
              <input type="number" className="form-input" min="0.01" step="0.01" value={item.quantity} onChange={e => handleChangeItem(index, 'quantity', parseFloat(e.target.value) || 0)} required />
            </div>
            <div className="form-field" style={{ width: 120, marginBottom: 0 }}>
              {index === 0 && <label className="form-label" style={{ fontSize: 11 }}>Price ({currency})</label>}
              <input type="number" className="form-input" min="0" step="0.01" value={item.unit_price} onChange={e => handleChangeItem(index, 'unit_price', parseFloat(e.target.value) || 0)} required />
            </div>
            <div style={{ paddingTop: index === 0 ? 24 : 0 }}>
              <button type="button" className="btn" onClick={() => handleRemoveItem(index)} disabled={items.length === 1} style={{ height: 38, padding: '0 12px' }}>✕</button>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="btn btn-sm" onClick={handleAddItem}>+ Add Item</button>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>
            Total: {formatCurrency(total, currency)}
          </div>
        </div>
      </div>

      {/* ── FX CALLOUT ── */}
      {fxRate && currency !== homeCurrency && total > 0 && (
        <div className="fx-callout mb-6" style={{ marginBottom: 24 }}>
          {fetchingFx ? (
            <div style={{ padding: 8, fontSize: 13, color: 'var(--teal)' }}>Fetching live ECB rate...</div>
          ) : (
            <div>
              <div className="fx-callout-label">🔒 Rate Locked</div>
              <div className="fx-callout-value">{formatCurrency(fxRate.homeAmount, homeCurrency)}</div>
              <div className="fx-callout-meta">Using ECB rate: 1 {currency} = {fxRate.rate} {homeCurrency} on {date}</div>
            </div>
          )}
        </div>
      )}



      {/* ── NOTES ── */}
      <div className="form-field" style={{ marginBottom: 32 }}>
        <label className="form-label">Notes (Optional)</label>
        <textarea className="form-input" rows={3} placeholder="Thank you for your business!" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {error && (
        <div style={{ background: 'var(--red-light, #fff5f5)', color: 'var(--red, #c0392b)', border: '1px solid currentColor', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── ACTIONS ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button type="button" className="btn" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading || !clientId || total <= 0}>
          {loading ? 'Saving...' : initialData ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  )
}
