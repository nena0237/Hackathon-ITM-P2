import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { seedState, type AppState } from '../../data/seed'
import { analyzePlan, compareWithOracle } from '../../domain/analysis'
import { MinimumBanner } from '../../ui'
import { planView, verificationView } from '../viewModels'

/** Arma un estado REAL (gastos de 1 participante) cuyos saldos son exactamente `targets`. */
function stateFromBalances(targets: number[]): AppState {
  const members = targets.map((_, i) => ({ id: `p${i}`, name: String.fromCharCode(65 + i) }))
  const debtors = targets.map((b, i) => ({ i, left: -b })).filter((x) => x.left > 0)
  const creditors = targets.map((b, i) => ({ i, left: b })).filter((x) => x.left > 0)
  const expenses: AppState['expenses'] = []
  let c = 0
  for (const d of debtors) {
    while (d.left > 0) {
      const cr = creditors[c]
      const amount = Math.min(d.left, cr.left)
      expenses.push({ id: `e${expenses.length + 1}`, description: 'x', amount, paidBy: members[cr.i].id, participants: [members[d.i].id] })
      d.left -= amount
      cr.left -= amount
      if (cr.left === 0) c++
    }
  }
  return { members, expenses }
}

describe('análisis del caso semilla', () => {
  const v = verificationView(seedState())
  it('n = 6, G = 2, exacto 4, voraz 5, oráculo 4, coinciden', () => {
    expect([v.n, v.G, v.exact, v.greedy]).toEqual([6, 2, 4, 5])
    expect(v.oracle).toMatchObject({ exacto: 4, oraculo: 4, voraz: 5, coinciden: true })
    expect(v.oracle.particiones).toBe(203)
    expect(v.formulaHolds).toBe(true)
    expect(v.allZero).toBe(true)
  })
  it('detalle por grupo: Ana, Beto, Diego y Carla, Elena, Fabián con 2 pagos cada uno', () => {
    expect(v.groups).toEqual([
      { members: ['Ana', 'Beto', 'Diego'], payments: 2 },
      { members: ['Carla', 'Elena', 'Fabián'], payments: 2 },
    ])
  })
})

describe('3 casos creados con el voraz peor que el exacto', () => {
  const cases: [string, number[]][] = [
    ['A', [-4, -3, 2, 2, 3].map((x) => x * 10_000)],
    ['B', [-5, -4, 2, 3, 4].map((x) => x * 10_000)],
    ['C', [-3, -2, -2, 3, 4].map((x) => x * 10_000)],
  ]
  it.each(cases)('caso %s', (_n, balances) => {
    const s = stateFromBalances(balances)
    expect(planView(s).simple).toBeGreaterThan(planView(s).payments.length)
    const v = verificationView(s)
    expect([v.n, v.G, v.exact, v.greedy]).toEqual([5, 2, 3, 4])
    expect(v.oracle).toMatchObject({ exacto: 3, oraculo: 3, voraz: 4, coinciden: true })
    expect(v.formulaHolds && v.allZero).toBe(true)
    // El aviso del banner sale con el número correcto.
    const html = renderToStaticMarkup(createElement(MinimumBanner, { payments: v.exact, simple: v.greedy }))
    expect(html).toContain('El método simple necesitaría 4.')
  })
  it('el seed muestra "necesitaría 5" y, si son iguales, "necesita los mismos pagos"', () => {
    const seed = renderToStaticMarkup(createElement(MinimumBanner, { payments: 4, simple: 5 }))
    expect(seed).toContain('El método simple necesitaría 5.')
    const igual = renderToStaticMarkup(createElement(MinimumBanner, { payments: 1, simple: 1 }))
    expect(igual).toContain('El método simple necesita los mismos pagos.')
  })
})

describe('analyzePlan y compareWithOracle: bordes', () => {
  it('todos a mano: n = 0, G = 0, 0 pagos, oráculo 0', () => {
    const a = analyzePlan(['a', 'b'], { a: 0, b: 0 })
    expect([a.n, a.G, a.exact, a.greedy, a.formulaHolds, a.allZero]).toEqual([0, 0, 0, 0, true, true])
    expect(compareWithOracle(['a', 'b'], { a: 0, b: 0 })).toMatchObject({ exacto: 0, oraculo: 0, coinciden: true })
  })
  it('un deudor y un acreedor: 1 pago, un grupo', () => {
    const a = analyzePlan(['a', 'b', 'c'], { a: -7, b: 7, c: 0 })
    expect([a.n, a.G, a.exact]).toEqual([2, 1, 1])
    expect(a.groups).toEqual([{ members: ['a', 'b'], payments: 1 }])
  })
  it('el panel se actualiza al cambiar gastos: quitar un gasto cambia el análisis', () => {
    const s = seedState()
    const antes = verificationView(s)
    const despues = verificationView({ ...s, expenses: s.expenses.slice(0, 1) })
    expect(despues.exact).not.toBe(antes.exact)
    expect(despues.allZero).toBe(true)
    expect(despues.oracle.coinciden).toBe(true)
  })
})
