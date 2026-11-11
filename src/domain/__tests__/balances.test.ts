import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { computeBalances, type Expense } from '../balances'

const M = ['a', 'b', 'c', 'd', 'e', 'f']
const sum = (o: Record<string, number>) => Object.values(o).reduce((x, y) => x + y, 0)
let seq = 0
const ex = (amount: number, paidBy: string, participants: string[]): Expense => ({
  id: `e${seq++}`,
  description: 'x',
  amount,
  paidBy,
  participants,
})

describe('computeBalances (caso 5)', () => {
  it('sin gastos: todos en 0', () => {
    expect(computeBalances(M, [])).toEqual({ a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 })
  })
  it('un deudor y un acreedor', () => {
    expect(computeBalances(['a', 'b'], [ex(1000, 'a', ['b'])])).toEqual({ a: 1000, b: -1000 })
  })
  it('el pagador que no participa', () => {
    expect(computeBalances(['a', 'b', 'c'], [ex(900, 'a', ['b', 'c'])])).toEqual({ a: 900, b: -450, c: -450 })
  })
  it('solo el pagador participa → a mano', () => {
    expect(computeBalances(['a', 'b'], [ex(500, 'a', ['a'])])).toEqual({ a: 0, b: 0 })
  })
  it('todos a mano con gastos cruzados', () => {
    expect(computeBalances(['a', 'b'], [ex(100, 'a', ['b']), ex(100, 'b', ['a'])])).toEqual({ a: 0, b: 0 })
  })
  it('caso seed del brief', () => {
    const m = ['ana', 'beto', 'carla', 'diego', 'elena', 'fabian']
    const b = computeBalances(m, [
      ex(150000, 'fabian', m),
      ex(600000, 'fabian', ['diego', 'elena', 'carla', 'fabian']),
      ex(450000, 'diego', ['ana', 'beto', 'carla', 'fabian']),
    ])
    expect(b).toEqual({
      ana: -137500,
      beto: -137500,
      carla: -287500,
      diego: 275000,
      elena: -175000,
      fabian: 462500,
    })
    expect(sum(b)).toBe(0)
  })
  it('pagador fuera del grupo → error', () => {
    expect(() => computeBalances(['a'], [ex(10, 'z', ['a'])])).toThrow()
  })
})

describe('propiedad: suma de saldos = 0', () => {
  it('500 escenarios de 2 a 6 integrantes y 1 a 12 gastos', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }).chain((n) => {
          const ids = M.slice(0, n)
          return fc.tuple(
            fc.constant(ids),
            fc.array(
              fc.record({
                amount: fc.integer({ min: 1, max: 100_000_000 }),
                paidBy: fc.constantFrom(...ids),
                participants: fc.subarray(ids, { minLength: 1 }),
              }),
              { minLength: 1, maxLength: 12 },
            ),
          )
        }),
        ([ids, list]) => {
          const b = computeBalances(ids, list.map((e) => ex(e.amount, e.paidBy, e.participants)))
          return sum(b) === 0 && Object.values(b).every(Number.isInteger)
        },
      ),
      { numRuns: 500 },
    )
  })
})
