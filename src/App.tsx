import { useRef, useState } from 'react'
import type { AppState } from './data/seed'
import {
  addExpense,
  addMember,
  deleteExpense,
  removeMember,
  renameMember,
  restoreSeed,
  updateExpense,
  type Outcome,
} from './hooks/actions'
import { useAppState, useBalances, useFinalBalances, useGroup, usePlan, useVerification } from './hooks/useAppState'
import { Gastos } from './pages/Gastos'
import { Grupo } from './pages/Grupo'
import { Saldos } from './pages/Saldos'
import { Verificacion } from './pages/Verificacion'
import { AppShell, Button, ConfirmDialog, Toast } from './ui'

const TABS = [
  { id: 'grupo', label: 'Grupo' },
  { id: 'gastos', label: 'Gastos' },
  { id: 'saldos', label: 'Saldos y pagos' },
  { id: 'verificacion', label: 'Verificación' },
]

export default function App() {
  const [state, setState] = useAppState()
  const [active, setActive] = useState('saldos')
  const [toast, setToast] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<'seed' | { expenseId: string } | null>(null)
  const previous = useRef<AppState | null>(null)

  const group = useGroup(state)
  const balances = useBalances(state)
  const plan = usePlan(state)
  const finals = useFinalBalances(state)
  const verification = useVerification(state)

  /** Cambia los datos, guarda el estado anterior para Deshacer y avisa. */
  function commit(next: AppState, message: string) {
    previous.current = state
    setState(next)
    setToast(message)
  }
  function fromOutcome(r: Outcome, message: string): Outcome {
    if (r.ok) commit(r.state, message)
    return r
  }

  const expenseToDelete = typeof confirm === 'object' && confirm ? state.expenses.find((e) => e.id === confirm.expenseId) : undefined

  return (
    <AppShell title="Minimal Transactions" subtitle="Divisor de gastos con pagos mínimos" tabs={TABS} active={active} onChange={setActive}>
      {active === 'grupo' && (
        <Grupo
          state={state}
          onAdd={(name) => fromOutcome(addMember(state, name), 'Integrante agregado.')}
          onRename={(id, name) => fromOutcome(renameMember(state, id, name), 'Nombre actualizado.')}
          onRemove={(id) => fromOutcome(removeMember(state, id), 'Integrante eliminado.')}
          onRestoreSeed={() => setConfirm('seed')}
        />
      )}
      {active === 'gastos' && (
        <Gastos
          state={state}
          group={group}
          onSave={(value, id) =>
            id ? commit(updateExpense(state, id, value), 'Gasto actualizado.') : commit(addExpense(state, value), 'Gasto agregado.')
          }
          onDelete={(id) => setConfirm({ expenseId: id })}
          onRestoreSeed={() => setConfirm('seed')}
        />
      )}
      {active === 'saldos' && <Saldos balances={balances.rows} maxAbs={balances.maxAbs} plan={plan} finals={finals} />}

      {active === 'verificacion' && <Verificacion v={verification} />}

      <div className="mt-12 border-t-2 border-ink pt-6">
        <Button variant="secondary" onClick={() => setConfirm('seed')}>Restaurar datos de ejemplo</Button>
      </div>

      <ConfirmDialog
        open={confirm === 'seed'}
        title="Restaurar datos de ejemplo"
        confirmLabel="Restaurar"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          commit(restoreSeed(), 'Datos de ejemplo restaurados.')
          setConfirm(null)
        }}
      >
        Se reemplazan el grupo y los gastos actuales por el ejemplo de 6 integrantes y 3 gastos. Podrás deshacerlo.
      </ConfirmDialog>

      <ConfirmDialog
        open={expenseToDelete !== undefined}
        title="Eliminar gasto"
        confirmLabel="Eliminar"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (expenseToDelete) commit(deleteExpense(state, expenseToDelete.id), 'Gasto eliminado.')
          setConfirm(null)
        }}
      >
        Se elimina "{expenseToDelete?.description}" y se recalculan los saldos y el plan de pagos. Podrás deshacerlo.
      </ConfirmDialog>

      <Toast
        message={toast}
        actionLabel="Deshacer"
        onAction={() => {
          if (previous.current) setState(previous.current)
          previous.current = null
          setToast(null)
        }}
        onDismiss={() => setToast(null)}
      />
    </AppShell>
  )
}
