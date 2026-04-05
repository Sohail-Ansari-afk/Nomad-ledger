import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewClientPageClient from './NewClientPageClient'

export default async function NewClientPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch plan and client count in parallel
  const [profileRes, countRes] = await Promise.all([
    supabase.from('profiles').select('plan, full_name').eq('id', user.id).single(),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const isPro = profileRes.data?.plan === 'pro'
  const clientCount = countRes.count ?? 0

  // Gate: free users who already have ≥3 clients see the paywall
  const isBlocked = !isPro && clientCount >= 3

  return (
    <NewClientPageClient
      isBlocked={isBlocked}
      userEmail={user.email}
      userName={profileRes.data?.full_name}
    />
  )
}
