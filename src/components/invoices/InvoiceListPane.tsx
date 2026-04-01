'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { formatCurrency } from '@/lib/formatCurrency'

export function InvoiceListPane({ invoices, countryCode }: { invoices: any[], countryCode: string }) {
  const searchParams = useSearchParams()
  const activeId = searchParams.get('id')

  return (
    <div className="split-list">
      <div className="split-list-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Invoices</h2>
          <Link href="/invoices/new" className="btn btn-primary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New
          </Link>
        </div>
        <div className="form-input" style={{ padding: '8px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: 'none', borderRadius: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search invoices..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--ink)' }} />
        </div>
      </div>

      <div style={{ padding: 12 }}>
        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--ink-4)', fontSize: 13 }}>
            No invoices yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invoices.map((inv) => {
              const isActive = activeId === inv.id
              return (
                <Link key={inv.id} href={`/invoices?id=${inv.id}`} style={{ textDecoration: 'none' }}>
                  <div 
                    className="invoice-list-item"
                    style={{
                      padding: '16px',
                      borderRadius: 14,
                      background: isActive ? 'var(--blue)' : 'var(--surface)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--blue)' : 'var(--border)',
                      boxShadow: isActive ? '0 4px 14px rgba(0, 113, 227, 0.2)' : '0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#fff' : 'var(--ink)' }}>{inv.client?.name || 'Unknown'}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#fff' : 'var(--ink)' }}>
                        {formatCurrency(inv.invoice_amount || 0, inv.invoice_currency || 'USD', countryCode)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: isActive ? 'rgba(255,255,255,0.85)' : 'var(--ink-4)' }}>{inv.invoice_number}</span>
                        <span style={{ fontSize: 12, color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--border-2)' }}>•</span>
                        <span style={{ fontSize: 12, color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--ink-3)' }}>{new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <span className={`badge ${
                        isActive ? 'badge-white' : 
                        inv.status === 'paid' ? 'badge-green' : 
                        inv.status === 'overdue' ? 'badge-red' : 
                        inv.status === 'sent' ? 'badge-blue' : 
                        'badge-gray'
                      }`} style={{ 
                        fontSize: 10, padding: '2px 8px',
                        background: isActive ? 'rgba(255,255,255,0.2)' : undefined,
                        color: isActive ? '#fff' : undefined,
                      }}>
                        {inv.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
