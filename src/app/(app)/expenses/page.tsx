import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ExpenseListPane } from '@/components/expenses/ExpenseListPane'
import { ExpensePreviewPane } from '@/components/expenses/ExpensePreviewPane'
import { formatCurrency } from '@/lib/formatCurrency'

export default async function ExpensesPage(props: { searchParams: Promise<{ id?: string }> }) {
  const supabase = await createClient()
  const searchParams = await props.searchParams
  const activeId = searchParams.id

  // Fetch profile for home currency
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('home_currency, home_country')
    .eq('id', user!.id)
    .single()

  const homeCountry = profile?.home_country ?? 'IN'
  const homeCurrency = profile?.home_currency ?? 'INR'

  // Fix 5: No longer join invoices — expenses are standalone
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })

  let activeExpense = null

  if (activeId && expenses) {
    activeExpense = expenses.find((e: any) => e.id === activeId) ?? null
  }

  if (!activeId) {
    return (
      <>
        <div className="topbar">
          <div>
            <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>Expenses</h2>
          </div>
          <div>
            <Link href="/expenses/new" className="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Expense
            </Link>
          </div>
        </div>

        <div className="canvas">
          <div className="canvas-full">
            <div className="card">
              {expenses && expenses.length > 0 ? (
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Deductible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp: any) => (
                      <tr key={exp.id}>
                        <td style={{ fontWeight: 500, color: 'var(--ink)' }}>
                          <Link href={`/expenses?id=${exp.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontWeight: 600 }}>{new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Click to view</span>
                          </Link>
                        </td>
                        <td>{exp.description}</td>
                        <td>
                          <span className="badge badge-gray">{exp.category}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>
                          {formatCurrency(exp.expense_amount, exp.expense_currency, homeCountry)}
                          {exp.expense_currency !== exp.home_currency && exp.home_amount && (
                            <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 400, marginTop: 2 }}>
                              {formatCurrency(exp.home_amount, exp.home_currency || homeCurrency, homeCountry)}
                            </div>
                          )}
                        </td>
                        {/* Fix 5: Show Deductible status — no more invoice linkage */}
                        <td>
                          {exp.deductible ? (
                            <span className="badge badge-green">Tax Deductible</span>
                          ) : (
                            <span className="badge badge-gray">Non-Deductible</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: 48, height: 48, background: 'var(--surface-3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--ink-4)' }}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No expenses logged</h3>
                  <p style={{ color: 'var(--ink-4)', marginBottom: 24, fontSize: 13 }}>Track your business expenses to lower your tax liability.</p>
                  <Link href="/expenses/new" className="btn btn-primary">Add Expense</Link>
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
      <ExpenseListPane expenses={expenses || []} countryCode={homeCountry} />
      <ExpensePreviewPane
        expense={activeExpense}
        countryCode={homeCountry}
      />
    </div>
  )
}
