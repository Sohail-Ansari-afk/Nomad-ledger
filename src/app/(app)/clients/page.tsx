import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ClientsPageClient from './ClientsPageClient'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, full_name')
    .eq('id', user!.id)
    .single()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })

  const clientCount = clients?.length ?? 0
  const isPro = profile?.plan === 'pro'
  const atLimit = !isPro && clientCount >= 3

  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>Clients</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Usage badge for free users */}
          {!isPro && (
            <div style={{
              fontSize: 12,
              background: atLimit ? 'var(--red-light)' : 'var(--surface-2)',
              color: atLimit ? 'var(--red)' : 'var(--ink-4)',
              border: `1px solid ${atLimit ? 'var(--red)' : 'var(--border)'}`,
              borderRadius: 20,
              padding: '4px 12px',
              fontWeight: 500,
            }}>
              {clientCount}/3 free clients used
            </div>
          )}
          {/* Add Client button — gated for free users at limit */}
          <ClientsPageClient
            isPro={isPro}
            atLimit={atLimit}
            userEmail={user?.email}
            userName={profile?.full_name}
          />
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
                <ClientsPageClient
                  isPro={isPro}
                  atLimit={atLimit}
                  userEmail={user?.email}
                  userName={profile?.full_name}
                  variant="primary"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
