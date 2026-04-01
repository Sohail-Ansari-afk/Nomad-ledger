import { createClient } from '@/lib/supabase/server'
import { calculateTax } from '@/lib/tax/engine'
import { formatCurrency } from '@/lib/formatCurrency'
import { getFxRate } from '@/lib/fx'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.onboarded) {
    return redirect('/onboarding')
  }

  const homeCurrency: string = profile.home_currency || 'INR'
  const homeCountry: string  = profile.home_country  || 'IN'

  // Get current tax year start date based on user's configuration
  const now = new Date()
  let taxYearStart = new Date(now.getFullYear(), profile.tax_year_start - 1, 1)
  if (now < taxYearStart) {
    taxYearStart = new Date(now.getFullYear() - 1, profile.tax_year_start - 1, 1)
  }
  const taxYearStartStr = taxYearStart.toISOString().split('T')[0]

  // Run all queries in parallel
  const [
    { data: incomeData },
    { data: outstandingData },
    { data: expensesData },
    { data: recentInvoices },
  ] = await Promise.all([
    supabase
      .from('invoices')
      .select('invoice_amount, invoice_currency, invoice_date, home_amount, home_currency')
      .eq('status', 'paid')
      .gte('invoice_date', taxYearStartStr),
    supabase
      .from('invoices')
      .select('invoice_amount, invoice_currency, invoice_date, home_amount, home_currency')
      .in('status', ['sent', 'overdue']),
    supabase
      .from('expenses')
      .select('home_amount, home_currency, expense_amount, expense_currency, date')
      .eq('deductible', true)
      .gte('date', taxYearStartStr),
    supabase
      .from('invoices')
      .select('*, client:client_id(name)')
      .in('status', ['sent', 'overdue'])
      .order('due_date', { ascending: true })
      .limit(5)
  ])

  // ── Re-derive totals in current home currency ──────────────────────────
  // If an invoice/expense was created with a different home_currency than the
  // user's current profile home_currency, we re-convert on-the-fly using the
  // FX engine (which caches permanently, so this is fast).
  async function toHomeAmount(row: any, dateField: string): Promise<number> {
    const amount: number        = Number(row.invoice_amount ?? row.expense_amount) || 0
    const currency: string      = row.invoice_currency ?? row.expense_currency ?? homeCurrency
    const rowDate: string       = (row[dateField] ?? new Date().toISOString()).slice(0, 10)
    const lockedHome: number    = Number(row.home_amount) || 0
    const lockedCurrency: string= row.home_currency ?? homeCurrency

    // Same invoice currency as home → no conversion needed
    if (currency === homeCurrency) return amount
    // Locked home_currency already matches → use stored value
    if (lockedCurrency === homeCurrency) return lockedHome
    // Need fresh conversion for this row
    try {
      const { rate } = await getFxRate(currency, homeCurrency, rowDate)
      return Math.round(amount * rate * 100) / 100
    } catch {
      return lockedHome // graceful fallback
    }
  }

  const [incomeAmounts, outstandingAmounts, deductionAmounts] = await Promise.all([
    Promise.all((incomeData ?? []).map((r: any) => toHomeAmount(r, 'invoice_date'))),
    Promise.all((outstandingData ?? []).map((r: any) => toHomeAmount(r, 'invoice_date'))),
    Promise.all((expensesData ?? []).map((r: any) => toHomeAmount(r, 'date'))),
  ])

  const ytdIncome       = incomeAmounts.reduce((s, v) => s + v, 0)
  const outstandingTotal = outstandingAmounts.reduce((s, v) => s + v, 0)
  const ytdDeductions   = deductionAmounts.reduce((s, v) => s + v, 0)
  // ────────────────────────────────────────────────────────────────────────

  let taxEstimate = { tax: 0, effectiveRate: 0 }
  if (ytdIncome > 0) {
    taxEstimate = calculateTax(ytdIncome, homeCountry, ytdDeductions)
  }

  const fmt = (amount: number) => formatCurrency(amount, homeCurrency, homeCountry)

  return (
    <>
      {/* ── TOPBAR ── */}
      <div className="topbar">
        <div>
          <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>Dashboard</h2>
        </div>
        <div>
          <Link href="/invoices/new" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Invoice
          </Link>
        </div>
      </div>

      <div className="canvas">
        <div className="canvas-full">
          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-label">YTD Paid Income</div>
              <div className="metric-value">{fmt(ytdIncome)}</div>
              <div className="metric-sub">Since {taxYearStart.toLocaleString('default', { month: 'short', year: 'numeric' })}</div>
            </div>
            
            <div className="metric">
              <div className="metric-label">Awaiting Payment</div>
              <div className="metric-value">{fmt(outstandingTotal)}</div>
              <div className="metric-sub">{outstandingData?.length || 0} invoices outstanding</div>
            </div>
            
            <div className="metric accent">
              <div className="metric-label">Estimated Tax</div>
              <div className="metric-value">{fmt(taxEstimate.tax)}</div>
              <div className="metric-sub">~{taxEstimate.effectiveRate}% effective rate</div>
            </div>
            
            <div className="metric">
              <div className="metric-label">Deductible Expenses</div>
              <div className="metric-value">{fmt(ytdDeductions)}</div>
              <div className="metric-sub">Logged this year</div>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <span className="card-title">Outstanding Invoices</span>
            </div>
            {recentInvoices && recentInvoices.length > 0 ? (
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Due By</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv: any) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{inv.invoice_number}</td>
                      <td>{inv.client?.name || 'Unknown Client'}</td>
                      <td>{formatCurrency(inv.invoice_amount, inv.invoice_currency, homeCountry)}</td>
                      <td>{new Date(inv.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <span className={`badge ${inv.status === 'overdue' ? 'badge-red' : 'badge-amber'}`}>
                          <span className="badge-dot"></span>
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: 'var(--ink-4)', marginBottom: 16 }}>No outstanding invoices found.</p>
                <Link href="/invoices/new" className="btn btn-primary btn-sm">Create an invoice</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
