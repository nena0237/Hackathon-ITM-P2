// Transiciones de estado PURAS (sin React ni localStorage). Cada una devuelve estado nuevo o un error en español.
import type { AppState } from '../data/seed'
import { seedState } from '../data/seed'
import type { Expense } from '../domain/balances'
import { canRemoveMember, MIN_MEMBERS, validateNewMember, validateRename } from '../domain/members'

export type Outcome = { ok: true; state: AppState } | { ok: false; error: string }

const clean = (s: string) => s.trim().replace(/\s+/g, ' ')

/** Id determinista: prefijo + (mayor número usado + 1). */
export function nextId(prefix: string, used: string[]): string {
  const max = used.reduce((m, id) => {
    const n = id.startsWith(prefix) ? Number(id.slice(prefix.length)) : NaN
    return Number.isInteger(n) && n > m ? n : m
  }, 0)
  return `${prefix}${max + 1}`
}

export function addMember(state: AppState, name: string): Outcome {
  const err = validateNewMember(name, state.members.map((m) => m.name))
  if (err) return { ok: false, error: err }
  const id = nextId('m', state.members.map((m) => m.id))
  return { ok: true, state: { ...state, members: [...state.members, { id, name: clean(name) }] } }
}

export function renameMember(state: AppState, id: string, name: string): Outcome {
  const err = validateRename(id, name, state.members)
  if (err) return { ok: false, error: err }
  return { ok: true, state: { ...state, members: state.members.map((m) => (m.id === id ? { ...m, name: clean(name) } : m)) } }
}

export function removeMember(state: AppState, id: string): Outcome {
  const blocked = canRemoveMember(id, state.expenses)
  if (blocked) return { ok: false, error: blocked }
  if (state.members.length <= MIN_MEMBERS) return { ok: false, error: `El grupo necesita al menos ${MIN_MEMBERS} integrantes.` }
  return { ok: true, state: { ...state, members: state.members.filter((m) => m.id !== id) } }
}

/** Gastos que impiden eliminar a un integrante (para explicarlo en pantalla). */
export function expensesOf(state: AppState, id: string): Expense[] {
  return state.expenses.filter((e) => e.paidBy === id || e.participants.includes(id))
}

export function addExpense(state: AppState, value: Omit<Expense, 'id'>): AppState {
  const id = nextId('e', state.expenses.map((e) => e.id))
  return { ...state, expenses: [...state.expenses, { id, ...value }] }
}

export function updateExpense(state: AppState, id: string, value: Omit<Expense, 'id'>): AppState {
  return { ...state, expenses: state.expenses.map((e) => (e.id === id ? { id, ...value } : e)) }
}

export function deleteExpense(state: AppState, id: string): AppState {
  return { ...state, expenses: state.expenses.filter((e) => e.id !== id) }
}

export function restoreSeed(): AppState {
  return seedState()
}
