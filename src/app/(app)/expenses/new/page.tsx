import { ExpenseForm } from '@/components/expenses/ExpenseForm'

export default function NewExpensePage() {
  return (
    <>
      <div className="topbar">
        <div>
          <h2 className="section-heading" style={{ fontSize: 18, margin: 0 }}>Log Expense</h2>
        </div>
      </div>

      <div className="canvas">
        <div className="canvas-full" style={{ maxWidth: 600 }}>
          <div className="card">
            <div className="card-body">
              <ExpenseForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
