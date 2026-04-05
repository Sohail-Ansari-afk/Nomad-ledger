'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteClientAction(clientId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('user_id', user.id) // Ensure security

  if (error) throw new Error(error.message)

  revalidatePath('/clients')
}

export async function updateClientAction(clientId: string, data: any) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', clientId)
    .eq('user_id', user.id) // Ensure security

  if (error) throw new Error(error.message)

  revalidatePath('/clients')
  revalidatePath(`/clients/edit/${clientId}`)
}
