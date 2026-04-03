'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateInvoiceStatus, deleteInvoice } from '@/app/(app)/invoices/actions'
import { formatCurrency } from '@/lib/formatCurrency'

export function InvoicePreviewPane({
  invoice,
  countryCode,
  homeCurrency,
  displayHomeAmount,
}: {
  invoice: any
  countryCode: string
  homeCurrency?: string
  displayHomeAmount?: number | null
}) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(invoice?.razorpay_payment_link_url || null)
  const [sendError, setSendError] = useState<string | null>(null)

  if (!invoice) {
    return (
      <div className="split-preview" style={{ background: 'var(--surface-2)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--ink-4)', maxWidth: 300 }}>
          <div style={{ width: 80, height: 80, background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32, color: 'var(--ink-4)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>No invoice selected</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>Select an invoice from the list to view its details, download as PDF, or update its status.</p>
        </div>
      </div>
    )
  }

  const { client, items } = invoice

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateInvoiceStatus(invoice.id, newStatus)
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendInvoice = async () => {
    setIsSending(true)
    setSendError(null)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        if (data.dev_mode) {
          setSendError('Razorpay not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local to generate live payment links.')
          return
        }
        setSendError(data.error || 'Failed to create payment link')
        return
      }

      const url: string = data.payment_link_url
      setPaymentUrl(url)
      router.refresh()
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setSendError('Network error. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        await deleteInvoice(invoice.id)
        router.push('/invoices')
      } catch (err) {
        console.error('Failed to delete invoice:', err)
      }
    }
  }

  return (
    <div key={invoice.id} className="split-preview animate-fade-in">
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
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Invoice {invoice.invoice_number}</h3>
          <span className={`badge ${
            invoice.status === 'paid' ? 'badge-green' : 
            invoice.status === 'overdue' ? 'badge-red' : 
            invoice.status === 'sent' ? 'badge-blue' : 
            'badge-gray'
          }`} style={{ padding: '4px 10px' }}>
            {invoice.status.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>

          {/* ── SEND INVOICE (Primary Action) ── */}
          {paymentUrl ? (
            // Payment link already exists — show it + copy button
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ background: 'var(--teal)', borderColor: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Payment Link Active
            </a>
          ) : (
            <button
              onClick={handleSendInvoice}
              disabled={isSending}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isSending ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                  Creating Link...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Send Invoice
                </>
              )}
            </button>
          )}

          {/* Status Dropdown */}
          <div style={{ position: 'relative' }} className="status-dropdown">
            <select 
              value="" 
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={isUpdating}
              className="btn" 
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', appearance: 'none', paddingRight: 30, color: 'var(--ink)' }}
            >
              <option value="" disabled>Change Status...</option>
              <option value="draft">Mark as Draft</option>
              <option value="sent">Mark as Sent</option>
              <option value="paid">Mark as Paid</option>
              <option value="overdue">Mark as Overdue</option>
            </select>
            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          <Link href={`/invoices/edit/${invoice.id}`} className="btn" title="Edit Invoice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Edit
          </Link>

          <button onClick={() => window.print()} className="btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            PDF / Print
          </button>

          <button onClick={handleDelete} className="btn btn-danger" style={{ color: 'var(--red)', borderColor: 'var(--red-light)' }} title="Delete Invoice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </div>

      {/* ── SEND ERROR BANNER ── */}
      {sendError && (
        <div style={{
          background: 'var(--red-light, #fff5f5)',
          borderBottom: '1px solid var(--border)',
          padding: '10px 24px',
          fontSize: 13,
          color: 'var(--red, #c0392b)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {sendError}
        </div>
      )}

      {/* ── PAPER CANVAS ── */}
      <div className="split-preview-scroll">
        <div className="a4-paper">
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.03em', color: '#000' }}>INVOICE</h1>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}><strong>No:</strong> {invoice.invoice_number}</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '13px', color: '#333', lineHeight: 1.6 }}>
              <strong>Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}<br/>
              <strong>Due Date:</strong> {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Upon receipt'}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '50px' }}>
            <div style={{ width: '45%', fontSize: '13px', lineHeight: 1.6, color: '#222' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>Billed To:</p>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0', color: '#000' }}>{client?.name}</h3>
              {client?.email && <p style={{ margin: 0 }}>{client.email}</p>}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
            <thead>
              <tr style={{ background: '#f5f5f7' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#666', borderBottom: '1px solid #ddd' }}>Item Description</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#666', borderBottom: '1px solid #ddd' }}>Quantity</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#666', borderBottom: '1px solid #ddd' }}>Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#666', borderBottom: '1px solid #ddd' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item: any) => (
                <tr key={item.id}>
                  <td style={{ padding: '16px', borderBottom: '1px solid #eee', fontSize: '13px', color: '#222' }}>{item.description}</td>
                  <td style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid #eee', fontSize: '13px', color: '#555' }}>{item.quantity}</td>
                  <td style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid #eee', fontSize: '13px', color: '#555' }}>
                    {formatCurrency(item.unit_price, invoice.invoice_currency, countryCode)}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid #eee', fontSize: '13px', fontWeight: 500, color: '#000' }}>
                    {formatCurrency(item.amount, invoice.invoice_currency, countryCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '50px' }}>
            <div style={{ width: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px', color: '#555' }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.invoice_amount, invoice.invoice_currency, countryCode)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '16px', fontWeight: 700, color: '#000', borderTop: '2px solid #e0e0e0', marginTop: '4px' }}>
                <span>Total Due:</span>
                <span>{formatCurrency(invoice.invoice_amount, invoice.invoice_currency, countryCode)}</span>
              </div>

              {/* Home Equivalent — uses re-derived amount if profile home currency changed */}
              {(() => {
                // Determine which home currency & amount to show
                const effectiveHomeCurrency = homeCurrency || invoice.home_currency
                const effectiveHomeAmount = (() => {
                  if (invoice.invoice_currency === effectiveHomeCurrency) return null
                  // Use the re-derived amount (passed from parent) if available
                  if (displayHomeAmount != null) return displayHomeAmount
                  // Fall back to the locked amount on the row
                  if (invoice.home_amount && invoice.home_currency) return invoice.home_amount
                  return null
                })()
                const displayCurrency = invoice.invoice_currency === effectiveHomeCurrency
                  ? null
                  : effectiveHomeCurrency

                if (!effectiveHomeAmount || !displayCurrency) return null

                return (
                  <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '4px', marginTop: '16px', fontSize: '11px', color: '#666', border: '1px solid #eaeaea' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong>Home Equivalent ({displayCurrency}):</strong>
                      <span>{formatCurrency(effectiveHomeAmount, displayCurrency, countryCode)}</span>
                    </div>
                    <div style={{ color: '#999', fontSize: '10px', marginTop: 2 }}>
                      Rate locked on {invoice.fx_rate_date || invoice.invoice_date?.slice(0, 10)} · 1 {invoice.invoice_currency} = {invoice.fx_rate_locked} {invoice.home_currency}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid #eaeaea', paddingTop: '20px' }}>
            {invoice.notes && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>Notes / Remarks:</p>
                <p style={{ fontSize: '12px', color: '#444', lineHeight: 1.5, margin: 0 }}>{invoice.notes}</p>
              </div>
            )}
            {invoice.status !== 'draft' && invoice.razorpay_payment_link_url && (
              <a href={invoice.razorpay_payment_link_url} style={{ display: 'inline-block', fontSize: '12px', color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}>
                Click here to pay online via Razorpay
              </a>
            )}
          </div>
        </div>


      </div>
    </div>
  )
}
