import { createClient } from '@/lib/supabase/server'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'
import { redirect } from 'next/navigation'

export default async function NewInvoicePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // Fetch clients for the dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  // Fetch profile to know the home currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('home_currency')
    .eq('id', user.id)
    .single()



  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>Create Invoice</h2>
        </div>
      </div>

      <div className="canvas">
        <div className="canvas-full">
          <div className="card">
            <div className="card-body">
              <InvoiceForm
                clients={clients || []}
                homeCurrency={profile?.home_currency || 'INR'}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
