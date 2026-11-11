import { describe, expect, it } from 'vitest'
import { computeBalances } from '../../domain/balances'
import { seedState } from '../../data/seed'
import { loadState, saveState, STORAGE_KEY } from '../storage'

function fakeStore(initial?: string) {
  const m = new Map<string, string>()
  if (initial !== undefined) m.set(STORAGE_KEY, initial)
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }
}

describe('seed', () => {
  it('da los saldos del brief', () => {
    const s = seedState()
    const b = computeBalances(s.members.map((m) => m.id), s.expenses)
    expect(s.members.map((m) => b[m.id])).toEqual([-137500, -137500, -287500, 275000, -175000, 462500])
  })
})

describe('persistencia', () => {
  it('sin datos carga el seed', () => expect(loadState(fakeStore())).toEqual(seedState()))
  it('recargar conserva los datos', () => {
    const st = fakeStore()
    const s = seedState()
    s.expenses.pop()
    saveState(s, st)
    expect(loadState(st)).toEqual(s)
  })
  it.each(['{no json', '"x"', '[]', '{"members":[],"expenses":[]}', '{"members":1}', 'null'])(
    'dato corrupto %s no rompe: seed', (raw) => expect(loadState(fakeStore(raw))).toEqual(seedState()))
  it('gasto con integrante inexistente se descarta', () => {
    const s = seedState()
    s.expenses[0].paidBy = 'fantasma'
    expect(loadState(fakeStore(JSON.stringify(s)))).toEqual(seedState())
  })
  it('sin localStorage disponible no lanza', () => expect(loadState(null)).toEqual(seedState()))
})
