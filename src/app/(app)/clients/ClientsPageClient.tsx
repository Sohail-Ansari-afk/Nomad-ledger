'use client'

import { useState } from 'react'
import Link from 'next/link'
import UpgradeModal from '@/components/subscription/UpgradeModal'

interface Props {
  isPro: boolean
  atLimit: boolean
  userEmail?: string
  userName?: string | null
  variant?: 'primary'
}

export default function ClientsPageClient({ isPro, atLimit, userEmail, userName, variant }: Props) {
  const [showUpgrade, setShowUpgrade] = useState(false)

  // If pro or under limit — show normal Add Client button
  if (isPro || !atLimit) {
    return (
      <>
        <Link href="/clients/new" className={`btn${variant === 'primary' ? ' btn-primary' : ' btn-primary'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Client
        </Link>
      </>
    )
  }

  // At limit on free plan — show locked button
  return (
    <>
      <button
        onClick={() => setShowUpgrade(true)}
        className="btn btn-primary"
        title="Upgrade to Pro to add more clients"
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Add Client
      </button>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        userEmail={userEmail}
        userName={userName ?? undefined}
      />
    </>
  )
}
