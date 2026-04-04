import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/layout/LogoutButton'
import { NavLinks } from '@/components/layout/NavLinks'
import { MobileNav } from '@/components/layout/MobileNav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan')
    .eq('id', user.id)
    .single()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || 'U'

  const fullName = profile?.full_name || user.email || 'User'
  const plan = profile?.plan || 'free'

  return (
    <div className="shell">
      {/* ── MOBILE HEADER (hidden on desktop) ── */}
      <header className="mobile-header">
        <div className="mobile-header-brand">
          <div className="brand-mark" style={{ width: 28, height: 28 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="brand-name" style={{ fontSize: 15 }}>NomadLedger</span>
        </div>

        {/* MobileNav renders the hamburger button + drawer */}
        <MobileNav initials={initials} fullName={fullName} plan={plan} />
      </header>

      {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="brand-name">NomadLedger</span>
        </div>

        <div className="sidebar-scroll">
          <div className="nav-section-label">Main</div>
          <NavLinks />
        </div>

        <div className="sidebar-bottom">
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {fullName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</span>
              {plan === 'free' && (
                <Link href="/settings" style={{ fontSize: 10, background: 'var(--teal)', color: '#fff', padding: '2px 8px', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>Upgrade</Link>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main">
        {children}
      </main>
    </div>
  )
}
