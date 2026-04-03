'use client'

import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/formatCurrency'
import { deleteExpense } from '@/app/(app)/invoices/expense-actions'
import Link from 'next/link'

export function ExpensePreviewPane({
  expense,
  countryCode,
}: {
  expense: any
  countryCode: string
}) {
  const router = useRouter()
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      try {
        await deleteExpense(expense.id)
        router.push('/expenses')
      } catch (err) {
        console.error('Failed to delete expense:', err)
      }
    }
  }

  if (!expense) {
    return (
      <div className="split-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--ink-4)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <p style={{ fontSize: 14 }}>Select an expense to view details</p>
      </div>
    )
  }

  return (
    <div key={expense.id} className="split-preview animate-fade-in">
      {/* ── ACTION BAR ── */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>
            Expense
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            {expense.description || 'Untitled Expense'}
          </h2>
          {expense.deductible && (
            <span className="badge badge-green" style={{ fontSize: 11, padding: '4px 10px', verticalAlign: 'middle', alignSelf: 'center' }}>Tax Deduction</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href={`/expenses/edit/${expense.id}`} className="btn" title="Edit Expense">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Edit
          </Link>
          <button onClick={handleDelete} className="btn btn-danger" style={{ color: 'var(--red)', borderColor: 'var(--red-light)' }} title="Delete Expense">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </div>

      <div className="split-preview-scroll">
        {/* ── CORE DETAILS CARD ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Date</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
                {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Category</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{expense.category}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Amount (billed)</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
                {formatCurrency(expense.expense_amount, expense.expense_currency)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Tax Status</div>
              <div style={{ fontSize: 14, color: expense.deductible ? 'var(--green)' : 'var(--ink-4)' }}>
                {expense.deductible ? '✓ Reduces taxable income' : 'Non-deductible'}
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
