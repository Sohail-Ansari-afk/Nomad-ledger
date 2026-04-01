import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'

export default async function EditExpensePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const expenseId = params.id

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: expense } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', expenseId)
    .eq('user_id', user.id)
    .single()

  if (!expense) redirect('/expenses')

  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>
            Edit Expense
          </h2>
        </div>
      </div>

      <div className="canvas">
        <div className="canvas-full" style={{ maxWidth: 600 }}>
          <div className="card">
            <div className="card-body">
              <ExpenseForm initialData={expense} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
