'use server'

// Fix 5: Expenses are now standalone records — decoupled from invoices.
// The linkExpenseToInvoice and getLinkableInvoices functions have been removed
// because the invoice_id column was dropped from the expenses table.
// This file is kept in case future expense-specific server actions are needed.
