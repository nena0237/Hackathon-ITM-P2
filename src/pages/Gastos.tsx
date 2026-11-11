import { useEffect, useState } from 'react'
import type { AppState } from '../data/seed'
import type { Expense } from '../domain/balances'
import { validateExpense, type ExpenseField, type FieldError } from '../domain/expenses'
import { formatAmount } from '../domain/money'
import type { GroupView } from '../hooks/viewModels'
import { Button, EmptyState, ErrorSummary, MoneyInput, ParticipantPicker, PayerSelect, SectionTitle, TextInput } from '../ui'

interface Props {
  state: AppState
  group: GroupView
  onSave: (value: Omit<Expense, 'id'>, editingId: string | null) => void
  onDelete: (id: string) => void
  onRestoreSeed: () => void
}

const IDS: Record<ExpenseField, string> = {
  description: 'exp-desc',
  amount: 'exp-amount',
  paidBy: 'exp-payer',
  participants: 'exp-parts',
}

export function Gastos({ state, group, onSave, onDelete, onRestoreSeed }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [participants, setParticipants] = useState<string[]>([])
  const [errors, setErrors] = useState<FieldError[]>([])
  const [attempts, setAttempts] = useState(0)

  // Al empezar a editar: llevar el formulario a la vista y enfocar el primer campo (en móvil queda lejos).
  useEffect(() => {
    if (editingId === null) return
    const el = document.getElementById(IDS.description)
    el?.scrollIntoView({ block: 'start' })
    el?.focus({ preventScroll: true })
  }, [editingId])

  const memberIds = state.members.map((m) => m.id)
  const err = (f: ExpenseField) => errors.find((e) => e.field === f)?.message

  function reset() {
    setEditingId(null)
    setDescription('')
    setAmount('')
    setPaidBy('')
    setParticipants([])
    setErrors([])
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setAttempts((a) => a + 1)
    const r = validateExpense({ description, amount, paidBy, participants }, memberIds)
    if (!r.ok) {
      setErrors(r.errors)
      return
    }
    onSave(r.value, editingId)
    reset()
  }

  function startEdit(id: string) {
    const x = state.expenses.find((ex) => ex.id === id)
    if (!x) return
    setEditingId(id)
    setDescription(x.description)
    setAmount(formatAmount(x.amount).replace('$ ', ''))
    setPaidBy(x.paidBy)
    setParticipants(x.participants)
    setErrors([])
  }

  return (
    <section>
      <SectionTitle>{editingId ? 'Editar gasto' : 'Nuevo gasto'}</SectionTitle>
      <form noValidate onSubmit={submit} className="flex max-w-[560px] flex-col gap-6">
        <ErrorSummary errors={errors.map((x) => ({ fieldId: IDS[x.field], message: x.message }))} focusKey={attempts} />
        <TextInput id={IDS.description} label="Descripción" value={description} onChange={setDescription} error={err('description')} />
        <MoneyInput id={IDS.amount} label="Monto" value={amount} onChange={setAmount} help="Pesos enteros, por ejemplo 150.000." error={err('amount')} />
        <PayerSelect id={IDS.paidBy} label="Quién pagó" members={state.members} value={paidBy} onChange={setPaidBy} error={err('paidBy')} />
        <ParticipantPicker id={IDS.participants} legend="Participantes" members={state.members} selected={participants} onChange={setParticipants} error={err('participants')} />
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" type="submit">{editingId ? 'Guardar cambios' : 'Agregar gasto'}</Button>
          {editingId && <Button variant="secondary" onClick={reset}>Cancelar edición</Button>}
        </div>
      </form>

      <SectionTitle>Gastos registrados</SectionTitle>
      {group.expenses.length === 0 ? (
        <EmptyState
          title="Todavía no hay gastos"
          body="Registra el primero con el formulario de arriba, o carga el ejemplo."
          action={<Button variant="secondary" onClick={onRestoreSeed}>Cargar datos de ejemplo</Button>}
        />
      ) : (
        <>
          <ul>
            {group.expenses.map((e) => (
              <li key={e.id} className="list-none border-b border-line px-1 py-3 md:px-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[16px] font-bold">{e.description}</span>
                  <span className="num shrink-0 text-[16px]">{formatAmount(e.amount)}</span>
                </div>
                <p className="mt-1 text-[14px] text-muted">
                  Pagó {e.paidByName}. Participan: {e.participantNames.join(', ')}.
                </p>
                <div className="mt-2 flex gap-3">
                  <Button variant="secondary" onClick={() => startEdit(e.id)}>Editar</Button>
                  <Button variant="secondary" onClick={() => onDelete(e.id)}>Eliminar</Button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[16px]">Total: <span className="num">{formatAmount(group.total)}</span></p>
        </>
      )}
    </section>
  )
}
