import { seedState, type AppState } from '../data/seed'
import { MAX_MEMBERS, MIN_MEMBERS } from '../domain/members'
import { MAX_AMOUNT } from '../domain/money'

export const STORAGE_KEY = 'splitter:v1'

/** Valida la forma del JSON guardado; cualquier cosa rara se descarta. */
export function isValidState(x: unknown): x is AppState {
  if (typeof x !== 'object' || x === null) return false
  const s = x as Record<string, unknown>
  if (!Array.isArray(s.members) || !Array.isArray(s.expenses)) return false
  if (s.members.length < MIN_MEMBERS || s.members.length > MAX_MEMBERS) return false
  const ids = new Set<string>()
  for (const m of s.members) {
    if (typeof m?.id !== 'string' || typeof m?.name !== 'string' || ids.has(m.id)) return false
    ids.add(m.id)
  }
  return s.expenses.every(
    (e) =>
      typeof e?.id === 'string' &&
      typeof e.description === 'string' &&
      Number.isInteger(e.amount) && e.amount > 0 && e.amount <= MAX_AMOUNT &&
      ids.has(e.paidBy) &&
      Array.isArray(e.participants) && e.participants.length > 0 &&
      e.participants.every((p: unknown) => typeof p === 'string' && ids.has(p)),
  )
}

type Store = Pick<Storage, 'getItem' | 'setItem'>

function defaultStore(): Store | null {
  try { return localStorage } catch { return null }
}

/** Carga el estado guardado; si no hay datos (o están corruptos / en formato viejo) devuelve el seed. */
export function loadState(store: Store | null = defaultStore()): AppState {
  try {
    const raw = store?.getItem(STORAGE_KEY)
    if (raw != null) {
      const parsed: unknown = JSON.parse(raw)
      if (isValidState(parsed)) return parsed
    }
  } catch { /* corrupto: se usa el seed */ }
  return seedState()
}

export function saveState(state: AppState, store: Store | null = defaultStore()): void {
  try { store?.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* sin almacenamiento */ }
}
