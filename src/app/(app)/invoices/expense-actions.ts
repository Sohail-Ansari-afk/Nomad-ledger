'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Link an expense to an invoice (many-to-many).
 * Safe to call even if the link already exists — upsert ignores duplicates.
 */
export async function linkExpenseToInvoice(expenseId: string, invoiceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('invoice_expenses')
    .upsert(
      { expense_id: expenseId, invoice_id: invoiceId, user_id: user.id },
      { onConflict: 'invoice_id,expense_id', ignoreDuplicates: true }
    )

  if (error) throw new Error(error.message)

  revalidatePath('/expenses')
  revalidatePath('/invoices')
}

/**
 * Unlink an expense from a specific invoice.
 */
export async function unlinkExpenseFromInvoice(expenseId: string, invoiceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('invoice_expenses')
    .delete()
    .eq('expense_id', expenseId)
    .eq('invoice_id', invoiceId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/expenses')
  revalidatePath('/invoices')
}

/**
 * Bulk-link multiple expenses to a single invoice (called after invoice creation).
 * Used by the InvoiceForm "Attached Expenses" section.
 */
export async function bulkLinkExpensesToInvoice(invoiceId: string, expenseIds: string[]) {
  if (!expenseIds.length) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const rows = expenseIds.map(expense_id => ({
    invoice_id: invoiceId,
    expense_id,
    user_id: user.id,
  }))

  const { error } = await supabase
    .from('invoice_expenses')
    .upsert(rows, { onConflict: 'invoice_id,expense_id', ignoreDuplicates: true })

  if (error) throw new Error(error.message)

  revalidatePath('/invoices')
  revalidatePath('/expenses')
}

/**
 * Sync multiple expenses to an invoice. Replaces existing links.
 * Used by the InvoiceForm when Editing.
 */
export async function syncInvoiceExpenses(invoiceId: string, expenseIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // First delete existing links for this invoice
  await supabase.from('invoice_expenses').delete()
    .eq('invoice_id', invoiceId)
    .eq('user_id', user.id)

  if (expenseIds.length > 0) {
    const rows = expenseIds.map(expense_id => ({
      invoice_id: invoiceId,
      expense_id,
      user_id: user.id,
    }))
    
    const { error } = await supabase.from('invoice_expenses').insert(rows)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/invoices')
  revalidatePath('/expenses')
}

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
