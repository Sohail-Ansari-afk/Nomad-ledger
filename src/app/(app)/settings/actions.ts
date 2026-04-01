'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Server Action: updateProfile
 *
 * Uses revalidatePath (Next.js App Router) to force all dependent Server
 * Components to re-fetch from Supabase after saving. This is the correct
 * pattern per Next.js docs — client-side router.refresh() alone does not
 * guarantee Supabase cache invalidation.
 *
 * Ref: https://nextjs.org/docs/app/api-reference/functions/revalidatePath
 */
export async function updateProfile(data: {
  full_name: string
  home_country: string
  home_currency: string
  tax_year_start: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name:      data.full_name,
      home_country:   data.home_country,
      home_currency:  data.home_currency,
      tax_year_start: data.tax_year_start,
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  // Force all pages that read from profile to re-run their Supabase queries
  revalidatePath('/dashboard')
  revalidatePath('/tax')
  revalidatePath('/invoices')
  revalidatePath('/expenses')
  revalidatePath('/settings')
}
