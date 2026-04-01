'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Currency } from '@/types'

const CATEGORIES = [
  'Software & Subscriptions',
  'Hardware & Equipment',
  'Travel & Transit',
  'Meals & Entertainment',
  'Office Supplies',
  'Professional Services',
  'Internet & Phone',
  'Advertising & Marketing',
  'Bank Fees',
  'Insurance',
  'Education & Training',
  'Other'
]

export function ExpenseForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categorizing, setCategorizing] = useState(false)

  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState(initialData?.description || '')
  const [amount, setAmount] = useState<number | ''>(initialData?.expense_amount || '')
  const [currency, setCurrency] = useState<Currency>(initialData?.expense_currency || 'USD')
  const [category, setCategory] = useState(initialData?.category || 'Other')
  const [deductible, setDeductible] = useState(initialData?.deductible ?? true)
  const [notes, setNotes] = useState(initialData?.notes || '')

  const handleDescriptionBlur = async () => {
    if (!description || description.length < 3 || initialData) return // don't auto-categorize when editing if they just edit the name
    
    setCategorizing(true)
    try {
      const res = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.category && CATEGORIES.includes(data.category)) {
          setCategory(data.category)
          if (data.deductible !== undefined) {
            setDeductible(data.deductible)
          }
        }
      }
    } catch (e) {
      console.error('Categorization failed', e)
    } finally {
      setCategorizing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (amount === '' || Number(amount) <= 0) {
        throw new Error('Please enter a valid amount')
      }

      const method = initialData ? 'PUT' : 'POST'
      const url = initialData ? `/api/expenses/${initialData.id}` : '/api/expenses'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          description,
          category,
          expense_currency: currency,
          expense_amount: Number(amount),
          deductible,
          notes,
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save expense')

      router.push('/expenses')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div className="info-box info-box-red mb-4" style={{ background: 'var(--red-light)', color: 'var(--red)', border: '1px solid currentColor', borderRadius: 'var(--r-sm)', padding: '12px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Expense Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">Amount</label>
            <div style={{ display: 'flex' }}>
              <select 
                className="form-select"
                style={{ width: 100, borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="SGD">SGD</option>
              </select>
              <input 
                type="number" 
                className="form-input" 
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, flex: 1 }}
                placeholder="0.00"
                step="0.01" min="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Description</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. Github Copilot Subscription, Flights to Berlin..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            required
          />
          {categorizing && <div style={{ fontSize: 11, color: 'var(--teal)', marginTop: 4 }}>✨ AI Categorizing...</div>}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Category</label>
            <select 
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Tax Deductible?</label>
            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={deductible}
                  onChange={(e) => setDeductible(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--teal)' }}
                />
                <span style={{ fontSize: 13, color: 'var(--ink)' }}>Yes, deduct from taxable income</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Notes (Optional)</label>
          <textarea 
            className="form-input" 
            rows={2} 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, gap: 12 }}>
          <Link href="/expenses" className="btn" style={{ background: 'transparent' }}>Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={loading || !description}>
            {loading ? 'Saving...' : initialData ? 'Update Expense' : 'Save Expense'}
          </button>
        </div>
      </form>
    </>
  )
}
