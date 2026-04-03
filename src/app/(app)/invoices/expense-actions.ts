'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'



export async function deleteExpense(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/expenses')
  revalidatePath('/invoices')
}
