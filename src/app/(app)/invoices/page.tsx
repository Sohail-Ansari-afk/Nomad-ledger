import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { InvoiceListPane } from '@/components/invoices/InvoiceListPane'
import { InvoicePreviewPane } from '@/components/invoices/InvoicePreviewPane'
import { formatCurrency } from '@/lib/formatCurrency'
import { getFxRate } from '@/lib/fx'

export default async function InvoicesPage(props: {
  searchParams: Promise<{ id?: string }>
}) {
  const supabase = await createClient()
  const searchParams = await props.searchParams

  // Fetch profile for home currency display
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('home_currency, home_country')
    .eq('id', user!.id)
    .single()

  const homeCountry = profile?.home_country ?? 'IN'
  const homeCurrency = profile?.home_currency ?? 'INR'

  // Fetch all invoices for the list
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, client:client_id(name)')
    .order('created_at', { ascending: false })

  // ── Re-derive home display amount ────────────────────────────────────────
  // The locked home_amount / home_currency on each invoice was set at creation
  // time. If the user has since changed their home currency (e.g. INR → USD),
  // we re-convert using the FX engine with the original invoice date so the
  // "Home X" column always shows the CURRENT home currency.
  // The stored home_amount row value is NEVER changed — this is display only.
  const displayHomeMap = new Map<string, number>()

  if (invoices) {
    await Promise.all(
      invoices.map(async (inv: any) => {
        // Already in home currency — nothing to do
        if (inv.invoice_currency === homeCurrency) return
        // Locked home_currency matches current profile — use stored value
        if (inv.home_currency === homeCurrency) {
          displayHomeMap.set(inv.id, inv.home_amount)
          return
        }
        // Mismatch: locked home is a different currency than current profile.
        // Re-derive using the original invoice date for historical accuracy.
        try {
          const invoiceDate = inv.invoice_date?.slice(0, 10) ??
            new Date().toISOString().slice(0, 10)
          const { rate } = await getFxRate(inv.invoice_currency, homeCurrency, invoiceDate)
          displayHomeMap.set(inv.id, Math.round(inv.invoice_amount * rate * 100) / 100)
        } catch {
          // Fallback: show the locked home_amount as-is if FX lookup fails
          displayHomeMap.set(inv.id, inv.home_amount)
        }
      })
    )
  }
  // ────────────────────────────────────────────────────────────────────────

  // Determine active invoice
  const activeId = searchParams.id
  let activeInvoice = null
  let attachedExpenses: any[] = []

  if (activeId && invoices) {
    const { data: detailData } = await supabase
      .from('invoices')
      .select('*, client:client_id(*), items:invoice_items(*)')
      .eq('id', activeId)
      .single()

    activeInvoice = detailData

    // Fetch expenses attached to this invoice via junction table
    const { data: expLinks } = await supabase
      .from('invoice_expenses')
      .select('expense_id, expense:expense_id(id, description, category, expense_amount, expense_currency, deductible, date)')
      .eq('invoice_id', activeId)

    attachedExpenses = (expLinks ?? []).map((l: any) => l.expense).filter(Boolean)
  }


  if (!activeId) {
    return (
      <>
        <div className="topbar">
          <div>
            <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>Invoices</h2>
          </div>
          <div>
            <Link href="/invoices/new" className="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Invoice
            </Link>
          </div>
        </div>

        <div className="canvas">
          <div className="canvas-full">
            <div className="card">
              {invoices && invoices.length > 0 ? (
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Invoice Info</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th style={{ color: 'var(--teal)' }}>Home {homeCurrency}</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <Link href={`/invoices?id=${inv.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{inv.invoice_number}</span>
                            <span style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Click to preview</span>
                          </Link>
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{inv.client?.name}</td>
                        <td style={{ color: 'var(--ink-3)' }}>{new Date(inv.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td style={{ fontWeight: 600 }}>
                          {formatCurrency(inv.invoice_amount || 0, inv.invoice_currency || 'USD', homeCountry)}
                        </td>
                        {/* Fix: home currency equivalent — re-derived if profile changed */}
                        <td style={{ color: 'var(--teal)', fontWeight: 500 }}>
                          {inv.invoice_currency === homeCurrency
                            ? <span style={{ color: 'var(--ink-4)' }}>—</span>
                            : (() => {
                                const amt = displayHomeMap.get(inv.id)
                                return amt != null
                                  ? formatCurrency(amt, homeCurrency, homeCountry)
                                  : <span style={{ color: 'var(--ink-4)' }}>—</span>
                              })()
                          }
                        </td>
                        <td>
                          <span className={`badge ${
                            inv.status === 'paid' ? 'badge-green' : 
                            inv.status === 'overdue' ? 'badge-red' : 
                            inv.status === 'sent' ? 'badge-blue' : 
                            'badge-gray'
                          }`}>
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: 48, height: 48, background: 'var(--surface-3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--ink-4)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--ink)' }}>No invoices created</h3>
                  <p style={{ color: 'var(--ink-4)', marginBottom: 24, fontSize: 13 }}>Create your first invoice to get paid and track revenue.</p>
                  <Link href="/invoices/new" className="btn btn-primary">Create Invoice</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="split-layout animate-fade-in">
      <InvoiceListPane invoices={invoices || []} countryCode={homeCountry} />
      <InvoicePreviewPane
        invoice={activeInvoice}
        countryCode={homeCountry}
        homeCurrency={homeCurrency}
        displayHomeAmount={activeInvoice?.id ? displayHomeMap.get(activeInvoice.id) ?? null : null}
        attachedExpenses={attachedExpenses}
      />
    </div>
  )
}
