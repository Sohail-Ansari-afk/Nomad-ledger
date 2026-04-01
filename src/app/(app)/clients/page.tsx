import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })

  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>Clients</h2>
        </div>
        <div>
          <Link href="/clients/new" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Client
          </Link>
        </div>
      </div>

      <div className="canvas">
        <div className="canvas-full">
          <div className="card">
            {clients && clients.length > 0 ? (
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Currency</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{c.name}</td>
                      <td>{c.email || '—'}</td>
                      <td>{c.currency}</td>
                      <td>{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ width: 48, height: 48, background: 'var(--surface-3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--ink-4)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No clients yet</h3>
                <p style={{ color: 'var(--ink-4)', marginBottom: 24, fontSize: 13 }}>Add your first client to start creating invoices.</p>
                <Link href="/clients/new" className="btn btn-primary">Add Client</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
