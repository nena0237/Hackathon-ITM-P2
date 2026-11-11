import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { seedState, type AppState } from '../../data/seed'
import { balancesView, finalBalancesView, groupView, maxAbs, planView } from '../viewModels'

describe('view-models con el seed', () => {
  const s = seedState()

  it('grupo: nombres, pagador y total', () => {
    const g = groupView(s)
    expect(g.memberNames).toEqual(['Ana', 'Beto', 'Carla', 'Diego', 'Elena', 'Fabián'])
    expect(g.total).toBe(1_200_000)
    expect(g.expenses[1].paidByName).toBe('Fabián')
    expect(g.expenses[1].participantNames).toEqual(['Carla', 'Diego', 'Elena', 'Fabián'])
  })

  it('saldos netos del brief y maxAbs', () => {
    const rows = balancesView(s)
    expect(rows.map((r) => r.balance)).toEqual([-137500, -137500, -287500, 275000, -175000, 462500])
    expect(rows.reduce((a, r) => a + r.balance, 0)).toBe(0)
    expect(maxAbs(rows)).toBe(462500)
  })

  it('plan: 4 pagos, n = 6, G = 2, voraz 5', () => {
    const p = planView(s)
    expect(p.payments.map((x) => [x.fromName, x.toName, x.amount])).toEqual([
      ['Ana', 'Diego', 137500],
      ['Beto', 'Diego', 137500],
      ['Carla', 'Fabián', 287500],
      ['Elena', 'Fabián', 175000],
    ])
    expect([p.n, p.G, p.simple]).toEqual([6, 2, 5])
    expect(p.groups).toHaveLength(2)
    expect(p.allSettled).toBe(false)
  })

  it('saldos finales: todos 0', () => {
    expect(finalBalancesView(s).every((r) => r.balance === 0)).toBe(true)
  })
})

describe('casos borde', () => {
  it('sin gastos: plan vacío, "a mano", maxAbs 1', () => {
    const s: AppState = { members: seedState().members, expenses: [] }
    const p = planView(s)
    expect(p.payments).toEqual([])
    expect(p.allSettled).toBe(true)
    expect(maxAbs(balancesView(s))).toBe(1)
  })
})

describe('propiedad: saldos finales siempre 0 y pagos = n − G', () => {
  it('2 a 6 integrantes, 1 a 12 gastos', () => {
    const scenario = fc.integer({ min: 2, max: 6 }).chain((k) => {
      const ids = Array.from({ length: k }, (_, i) => `m${i}`)
      return fc.record({
        ids: fc.constant(ids),
        expenses: fc.array(
          fc.record({
            amount: fc.integer({ min: 1, max: 2_000_000 }),
            paidBy: fc.constantFrom(...ids),
            participants: fc.subarray(ids, { minLength: 1 }),
          }),
          { minLength: 1, maxLength: 12 },
        ),
      })
    })
    fc.assert(
      fc.property(scenario, ({ ids, expenses }) => {
        const s: AppState = {
          members: ids.map((id) => ({ id, name: id })),
          expenses: expenses.map((e, i) => ({ id: `e${i}`, description: 'x', ...e })),
        }
        expect(balancesView(s).reduce((a, r) => a + r.balance, 0)).toBe(0)
        expect(finalBalancesView(s).every((r) => r.balance === 0)).toBe(true)
        const p = planView(s)
        expect(p.payments.length).toBe(p.n - p.G)
        expect(p.simple).toBeGreaterThanOrEqual(p.payments.length)
      }),
      { numRuns: 1000 },
    )
  })
})
