import { createClient } from '@/lib/supabase/server'
import { calculateTax } from '@/lib/tax/engine'
import { SUPPORTED_COUNTRIES, COUNTRY_NAMES } from '@/lib/tax/rules'
import { formatCurrency } from '@/lib/formatCurrency'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TaxEstimatePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.onboarded) return redirect('/onboarding')

  // Calculate current tax year boundaries
  const now = new Date()
  let taxYearStart = new Date(now.getFullYear(), profile.tax_year_start - 1, 1)
  if (now < taxYearStart) {
    taxYearStart = new Date(now.getFullYear() - 1, profile.tax_year_start - 1, 1)
  }
  let taxYearEnd = new Date(taxYearStart.getFullYear() + 1, taxYearStart.getMonth(), 0)

  const taxYearStartStr = taxYearStart.toISOString().split('T')[0]

  // Fetch Paid Invoices
  const { data: paidInvoices } = await supabase
    .from('invoices')
    .select('home_amount')
    .eq('status', 'paid')
    .gte('invoice_date', taxYearStartStr)

  const ytdIncome = paidInvoices?.reduce((sum, inv) => sum + (Number(inv.home_amount) || 0), 0) || 0

  // Fetch Deductible Expenses
  const { data: deductibleExpenses } = await supabase
    .from('expenses')
    .select('home_amount')
    .eq('deductible', true)
    .gte('date', taxYearStartStr)

  const ytdDeductions = deductibleExpenses?.reduce((sum, exp) => sum + (Number(exp.home_amount) || 0), 0) || 0

  // Run calculation if country supported
  let taxData = null
  let isSupported = SUPPORTED_COUNTRIES.includes(profile.home_country)
  
  if (isSupported && ytdIncome >= 0) {
    taxData = calculateTax(ytdIncome, profile.home_country, ytdDeductions)
  }

  const fmt = (amt: number) => formatCurrency(amt, profile.home_currency, profile.home_country)

  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>Tax Estimate</h2>
        </div>
        <div>
           {/* Placeholder for export/download functionality */}
        </div>
      </div>

      <div className="canvas">
        <div className="canvas-full" style={{ maxWidth: 800 }}>
          
          <div style={{ background: 'var(--surface-2)', padding: '16px 20px', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--ink)' }}>
                <strong>Base Country:</strong> {COUNTRY_NAMES[profile.home_country as keyof typeof COUNTRY_NAMES] || profile.home_country}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>
                Current Tax Year: {taxYearStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} — {taxYearEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <Link href="/settings" className="btn btn-sm">Change Setup</Link>
          </div>

          {!isSupported ? (
            <div className="info-box" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
              Automatic tax calculations are not yet supported for {profile.home_country}. 
              Your income and expenses are tracked, but you'll need to calculate brackets manually.
            </div>
          ) : taxData ? (
            <>
              {/* Topline Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 32 }}>
                
                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Gross Income</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{fmt(ytdIncome)}</div>
                </div>
                
                <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Deductions</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--teal)', fontFamily: 'var(--font-display)' }}>- {fmt(ytdDeductions)}</div>
                </div>
                
                <div className="card" style={{ padding: 24, textAlign: 'center', background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Est. Tax Liability</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{fmt(taxData.tax)}</div>
                  <div style={{ fontSize: 11, marginTop: 4, color: 'rgba(255,255,255,0.8)' }}>Effective Rate: {taxData.effectiveRate}%</div>
                </div>

              </div>

              {/* Bracket Breakdown */}
              <div className="card">
                <div className="card-header pb-2">
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Progressive Bracket Breakdown</h3>
                </div>
                <div className="card-body">
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
                    Taxable Income Basis: <strong>{fmt(taxData.taxableIncome)}</strong>
                  </div>

                  <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'var(--surface-2)' }}>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Bracket</th>
                          <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Rate</th>
                          <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Amount Taxed</th>
                          <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Tax Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxData.brackets.map((row: any, i: number) => (
                          <tr key={i} style={{ borderTop: '1px solid var(--border)', background: 'transparent' }}>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink)' }}>
                              {row.slab}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
                              {(row.rate * 100).toFixed(1)}%
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: 'var(--ink)' }}>
                              {row.rate > 0 ? fmt(row.tax / row.rate) : fmt(0)}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                              {fmt(row.tax)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 16, lineHeight: 1.5 }}>
                    * This is an estimate based on the standard progressive income tax brackets for {COUNTRY_NAMES[profile.home_country as keyof typeof COUNTRY_NAMES]}. 
                    It does not replace professional tax advice and may not include specific state/local taxes, national insurance, or specific deductions allowed in your jurisdiction.
                  </p>
                </div>
              </div>
            </>
          ) : null}

        </div>
      </div>
    </>
  )
}
