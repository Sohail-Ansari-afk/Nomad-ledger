import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'

export default async function EditInvoicePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const invoiceId = params.id
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('home_country, home_currency')
    .eq('id', user.id)
    .single()

  const [{ data: clients }, { data: invoice }] = await Promise.all([
    supabase.from('clients').select('id, name, currency, default_rate').eq('user_id', user.id).order('name'),
    supabase.from('invoices').select(`
      *,
      items:invoice_items(*)
    `).eq('id', invoiceId).eq('user_id', user.id).single()
  ])

  if (!invoice) redirect('/invoices')

  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>
            Edit Invoice {invoice.invoice_number}
          </h2>
        </div>
      </div>

      <div className="canvas">
        <div className="canvas-full">
          <div className="card">
            <div className="card-body">
              <InvoiceForm 
                clients={clients || []} 
                homeCurrency={profile?.home_currency || 'USD'}
                initialData={invoice}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
