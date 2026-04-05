import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditClientForm from './EditClientForm'

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('user_id', user.id)
    .single()

  if (!client) redirect('/clients')

  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>
            Edit Client
          </h2>
        </div>
      </div>

      <div className="canvas">
        <div className="canvas-full" style={{ maxWidth: 600 }}>
          <div className="card">
            <EditClientForm client={client} />
          </div>
        </div>
      </div>
    </>
  )
}
