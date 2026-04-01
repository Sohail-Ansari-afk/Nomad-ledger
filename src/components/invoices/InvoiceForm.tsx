'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/formatCurrency'
import { syncInvoiceExpenses } from '@/app/(app)/invoices/expense-actions'

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

interface Expense {
  id: string
  description: string
  category: string
  expense_amount: number
  expense_currency: string
  date: string
}

export function InvoiceForm({
  clients,
  homeCurrency,
  expenses = [],
  initialData,
}: {
  clients: Client[]
  homeCurrency: string
  expenses?: Expense[]
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

  // Attached expenses (many-to-many — checked expense IDs)
  const initialAttached = initialData?.attached_expenses
    ? new Set<string>(initialData.attached_expenses.map((ae: any) => ae.expense_id))
    : new Set<string>()

  const [attachedExpenseIds, setAttachedExpenseIds] = useState<Set<string>>(initialAttached)
  const [expenseSectionOpen, setExpenseSectionOpen] = useState(false)

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

  const toggleExpense = (exp: Expense) => {
    const isAdding = !attachedExpenseIds.has(exp.id)
    
    setAttachedExpenseIds(prev => {
      const next = new Set(prev)
      isAdding ? next.add(exp.id) : next.delete(exp.id)
      return next
    })

    if (isAdding) {
      // Auto-populate line items so the invoice total updates and it appears on the PDF
      setItems(currentItems => {
        const isDefaultEmpty = currentItems.length === 1 && !currentItems[0].description && currentItems[0].unit_price === 0
        const newItem = { description: exp.description || 'Expense', quantity: 1, unit_price: exp.expense_amount }
        return isDefaultEmpty ? [newItem] : [...currentItems, newItem]
      })
    }
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

      const targetInvoiceId = isEditing ? initialData.id : data.invoice_id
      if (targetInvoiceId) {
        await syncInvoiceExpenses(targetInvoiceId, [...attachedExpenseIds])
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

      {/* ── ATTACHED EXPENSES (optional) ── */}
      <div style={{ marginBottom: 24, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {/* Collapsible header */}
        <button
          type="button"
          onClick={() => setExpenseSectionOpen(o => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: expenseSectionOpen ? 'var(--surface-2)' : 'var(--surface)',
            border: 'none', cursor: 'pointer', gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
              Attached Expenses
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--ink-4)', marginLeft: 6 }}>(optional)</span>
            </span>
            {attachedExpenseIds.size > 0 && (
              <span style={{ background: 'var(--blue)', color: '#fff', borderRadius: 100, fontSize: 11, fontWeight: 700, padding: '1px 8px', minWidth: 20, textAlign: 'center' }}>
                {attachedExpenseIds.size}
              </span>
            )}
          </div>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expenseSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {expenseSectionOpen && (
          <div style={{ padding: 16, background: 'var(--surface)' }}>
            {expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-4)', fontSize: 13 }}>
                No expenses yet. <Link href="/expenses/new" style={{ color: 'var(--blue)' }}>Create one</Link> first.
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 12 }}>
                  Checking an expense will attach it to this record and <strong>automatically add it to the Line Items above</strong>, so you can easily include it in the final invoice.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                  {expenses.map(exp => {
                    const checked = attachedExpenseIds.has(exp.id)
                    return (
                      <label
                        key={exp.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                          borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s',
                          background: checked ? 'rgba(0,113,227,0.06)' : 'var(--surface-2)',
                          border: `1px solid ${checked ? 'var(--blue)' : 'var(--border)'}`,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExpense(exp)}
                          style={{ width: 16, height: 16, accentColor: 'var(--blue)', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: checked ? 'var(--blue)' : 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {exp.description || 'Untitled Expense'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>
                            {exp.category} · {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: checked ? 'var(--blue)' : 'var(--ink)', flexShrink: 0 }}>
                          {formatCurrency(exp.expense_amount, exp.expense_currency)}
                        </div>
                      </label>
                    )
                  })}
                </div>

                {attachedExpenseIds.size > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)' }}>
                    <span>{attachedExpenseIds.size} expense{attachedExpenseIds.size !== 1 ? 's' : ''} will be attached after invoice is created</span>
                    <button type="button" style={{ fontSize: 12, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setAttachedExpenseIds(new Set())}>
                      Clear all
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

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
