import { describe, expect, it } from 'vitest'
import { seedState } from '../../data/seed'
import { validateExpense } from '../../domain/expenses'
import { validateRename } from '../../domain/members'
import {
  addExpense,
  addMember,
  deleteExpense,
  expensesOf,
  nextId,
  removeMember,
  renameMember,
  restoreSeed,
  updateExpense,
} from '../actions'
import { finalBalancesView, planView } from '../viewModels'

const ids = seedState().members.map((m) => m.id)
const base = { description: 'Propina', amount: '100.000', paidBy: ids[0], participants: [ids[2], ids[0], ids[1]] }

describe('validateExpense', () => {
  it('válido: limpia descripción, parsea monto y ordena participantes por el grupo', () => {
    const r = validateExpense({ ...base, description: '  Propina   extra ' }, ids)
    expect(r).toEqual({
      ok: true,
      value: { description: 'Propina extra', amount: 100000, paidBy: ids[0], participants: [ids[0], ids[1], ids[2]] },
    })
  })
  it.each(['', '0', '-5', 'abc', '10,5', '10.5', '1e9', '1.000.000.000.001'])('rechaza monto %j', (amount) => {
    const r = validateExpense({ ...base, amount }, ids)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.map((e) => e.field)).toEqual(['amount'])
  })
  it('reporta todos los campos malos a la vez, con mensajes en español', () => {
    const r = validateExpense({ description: ' ', amount: '', paidBy: '', participants: [] }, ids)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.errors.map((e) => e.field)).toEqual(['description', 'amount', 'paidBy', 'participants'])
      expect(r.errors.every((e) => e.message.length > 5)).toBe(true)
    }
  })
  it('descripción de 61 caracteres y pagador fuera del grupo', () => {
    const r = validateExpense({ ...base, description: 'x'.repeat(61), paidBy: 'zzz' }, ids)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.map((e) => e.field)).toEqual(['description', 'paidBy'])
  })
  it('el pagador puede no participar', () => {
    expect(validateExpense({ ...base, participants: [ids[1]] }, ids).ok).toBe(true)
  })
})

describe('integrantes', () => {
  it('agregar: máximo 6, duplicados sin tildes ni mayúsculas, ñ distinta', () => {
    const s = seedState()
    expect(addMember(s, 'Gabo').ok).toBe(false)
    const small = { ...s, members: s.members.slice(0, 3), expenses: [] }
    expect(addMember(small, ' BETO ').ok).toBe(false)
    expect(addMember(small, 'Fabian').ok).toBe(true)
    const conN = { ...small, members: [...small.members, { id: 'm9', name: 'Nuño' }] }
    expect(addMember(conN, 'Nuno').ok).toBe(true)
  })
  it('renombrar conserva el id; permite cambiar solo mayúsculas; rechaza duplicado, vacío y largo', () => {
    const s = seedState()
    const r = renameMember(s, 'm-ana', 'ANA')
    expect(r.ok && r.state.members[0]).toEqual({ id: 'm-ana', name: 'ANA' })
    expect(validateRename('m-ana', 'beto', s.members)).not.toBeNull()
    expect(validateRename('m-ana', '  ', s.members)).not.toBeNull()
    expect(validateRename('m-ana', 'a'.repeat(31), s.members)).not.toBeNull()
  })
  it('eliminar: bloqueado con gastos y con solo 2 integrantes', () => {
    const s = seedState()
    expect(removeMember(s, 'm-ana').ok).toBe(false)
    expect(expensesOf(s, 'm-ana').map((e) => e.description)).toEqual(['Mercado', 'Alojamiento'])
    expect(removeMember({ ...s, expenses: [] }, 'm-ana').ok).toBe(true)
    expect(removeMember({ members: s.members.slice(0, 2), expenses: [] }, 'm-ana').ok).toBe(false)
  })
})

describe('gastos: tras cada cambio los saldos finales son 0', () => {
  it('agregar, editar, borrar y restaurar', () => {
    let s = seedState()
    const check = () => {
      expect(finalBalancesView(s).every((r) => r.balance === 0)).toBe(true)
      const p = planView(s)
      expect(p.payments.length).toBe(p.n - p.G)
    }
    const v = validateExpense(base, ids)
    if (!v.ok) throw new Error('inválido')
    s = addExpense(s, v.value)
    expect(s.expenses.at(-1)?.id).toBe('e4')
    check()
    s = updateExpense(s, 'e4', { ...v.value, amount: 7 })
    expect(s.expenses.at(-1)?.amount).toBe(7)
    check()
    s = deleteExpense(s, 'e1')
    expect(s.expenses).toHaveLength(3)
    check()
    s = deleteExpense(deleteExpense(deleteExpense(s, 'e2'), 'e3'), 'e4')
    expect(planView(s).allSettled).toBe(true)
    check()
    expect(restoreSeed()).toEqual(seedState())
  })
  it('Propina 100.000 entre 3: el gasto queda cuadrado (33.334 / 33.333 / 33.333)', () => {
    const v = validateExpense(
      { description: 'Propina', amount: '100000', paidBy: ids[0], participants: [ids[0], ids[1], ids[2]] },
      ids,
    )
    if (!v.ok) throw new Error('inválido')
    const t = addExpense({ ...seedState(), expenses: [] }, v.value)
    const bal = Object.fromEntries(planView(t).payments.map((p) => [p.from, p.amount]))
    // Ana pagó y le toca 33.334; Beto y Carla deben 33.333 cada uno.
    expect(bal).toEqual({ 'm-beto': 33333, 'm-carla': 33333 })
    expect(finalBalancesView(t).every((r) => r.balance === 0)).toBe(true)
  })
  it('nextId no repite tras borrar', () => {
    expect(nextId('e', ['e1', 'e3'])).toBe('e4')
    expect(nextId('e', [])).toBe('e1')
  })
})
