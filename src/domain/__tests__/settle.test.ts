import { describe, it, expect, afterAll } from 'vitest'
import fc from 'fast-check'
import { settle, applyPlan } from '../settle'
import { settleGreedy } from '../settleGreedy'
import { computeBalances, type Expense } from '../balances'
import { oracleMinPayments } from '../oraculo'

const NAMES = ['ana', 'beto', 'carla', 'diego', 'elena', 'fabian']
const sum = (o: Record<string, number>) => Object.values(o).reduce((x, y) => x + y, 0)
const bal = (ids: string[], vals: number[]) => Object.fromEntries(ids.map((id, i) => [id, vals[i]]))

// Estadísticas reportadas al final de la corrida.
const stats = {
  A: { runs: 0, greedyWorse: 0, G: {} as Record<number, number> },
  B: { runs: 0, greedyWorse: 0, G: {} as Record<number, number> },
}

/** Comprobaciones comunes a ambas propiedades. */
function checkScenario(ids: string[], balances: Record<string, number>, which: 'A' | 'B', perm: string[]) {
  expect(sum(balances)).toBe(0)

  const r = settle(ids, balances)
  const oracle = oracleMinPayments(ids.map((id) => balances[id]))

  // El plan deja todos los saldos en 0.
  const after = applyPlan(balances, r.payments)
  for (const id of ids) expect(after[id]).toBe(0)

  // Todo monto es entero y > 0, y el sentido del pago es correcto.
  for (const p of r.payments) {
    expect(Number.isInteger(p.amount)).toBe(true)
    expect(p.amount).toBeGreaterThan(0)
    expect(balances[p.from]).toBeLessThan(0)
    expect(balances[p.to]).toBeGreaterThan(0)
  }

  // Pagos del algoritmo = pagos del oráculo (y n − G).
  expect(r.payments.length).toBe(oracle.minPayments)
  expect(r.G).toBe(oracle.G)
  expect(r.payments.length).toBe(r.n - r.G)

  // Voraz ≥ exacto (y el voraz también debe saldar todo).
  const greedy = settleGreedy(ids, balances)
  const afterG = applyPlan(balances, greedy)
  for (const id of ids) expect(afterG[id]).toBe(0)
  expect(greedy.length).toBeGreaterThanOrEqual(r.payments.length)

  // Determinista: mismos datos, mismo resultado.
  expect(settle(ids, balances)).toEqual(r)

  // Mismos saldos con los integrantes permutados: misma cantidad de pagos.
  expect(settle(perm, balances).payments.length).toBe(r.payments.length)

  const s = stats[which]
  s.runs++
  if (greedy.length > r.payments.length) s.greedyWorse++
  s.G[r.G] = (s.G[r.G] ?? 0) + 1
}

describe('caso seed del BRIEF', () => {
  const ids = NAMES
  const b = bal(ids, [-137500, -137500, -287500, 275000, -175000, 462500])

  it('exacto = 4 pagos, voraz = 5', () => {
    const r = settle(ids, b)
    expect(r.payments).toHaveLength(4)
    expect(settleGreedy(ids, b)).toHaveLength(5)
    expect(r.n).toBe(6)
    expect(r.G).toBe(2)
  })
  it('grupos {Ana, Beto, Diego} y {Carla, Elena, Fabián} y pagos esperados', () => {
    const r = settle(ids, b)
    expect(r.groups).toEqual([
      ['ana', 'beto', 'diego'],
      ['carla', 'elena', 'fabian'],
    ])
    expect(r.payments).toEqual([
      { from: 'ana', to: 'diego', amount: 137500 },
      { from: 'beto', to: 'diego', amount: 137500 },
      { from: 'carla', to: 'fabian', amount: 287500 },
      { from: 'elena', to: 'fabian', amount: 175000 },
    ])
  })
  it('el oráculo también dice 4', () => {
    expect(oracleMinPayments(ids.map((id) => b[id])).minPayments).toBe(4)
  })
  it('las 720 permutaciones de los integrantes dan 4 pagos', () => {
    const permute = (xs: string[]): string[][] =>
      xs.length <= 1 ? [xs] : xs.flatMap((x, i) => permute([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]))
    const all = permute(ids)
    expect(all).toHaveLength(720)
    for (const p of all) expect(settle(p, b).payments).toHaveLength(4)
  })
})

describe('caso 6: algoritmo', () => {
  it('un solo grupo sin sub-suma cero: n − 1 pagos', () => {
    const ids = ['a', 'b', 'c', 'd']
    const r = settle(ids, bal(ids, [10, -3, -3, -4]))
    expect(r.G).toBe(1)
    expect(r.payments).toHaveLength(3)
  })
  it('dos grupos', () => {
    const ids = ['a', 'b', 'c', 'd']
    const r = settle(ids, bal(ids, [5, -5, 7, -7]))
    expect(r.G).toBe(2)
    expect(r.payments).toHaveLength(2)
  })
  it('tres grupos', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f']
    const r = settle(ids, bal(ids, [1, -1, 2, -2, 3, -3]))
    expect(r.G).toBe(3)
    expect(r.payments).toHaveLength(3)
  })
  it('6 personas todas con saldo ≠ 0 en un solo grupo: 5 pagos', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f']
    const r = settle(ids, bal(ids, [6, -1, -1, -1, -1, -2]))
    expect(r.n).toBe(6)
    expect(r.G).toBe(1)
    expect(r.payments).toHaveLength(5)
  })
  it('empates: resultado determinista y correcto', () => {
    const ids = ['a', 'b', 'c', 'd']
    const b = bal(ids, [5, 5, -5, -5])
    const r1 = settle(ids, b)
    const r2 = settle(ids, b)
    expect(r1).toEqual(r2)
    expect(r1.G).toBe(2)
    expect(r1.payments).toHaveLength(2)
    expect(applyPlan(b, r1.payments)).toEqual({ a: 0, b: 0, c: 0, d: 0 })
  })
  it('personas con saldo 0 no aparecen en el plan', () => {
    const ids = ['a', 'b', 'c']
    const r = settle(ids, bal(ids, [100, 0, -100]))
    expect(r.n).toBe(2)
    expect(r.payments).toEqual([{ from: 'c', to: 'a', amount: 100 }])
  })
  it('todos a mano: plan vacío', () => {
    const ids = ['a', 'b']
    expect(settle(ids, bal(ids, [0, 0]))).toEqual({ payments: [], groups: [], n: 0, G: 0 })
  })
  it('orden de salida: deudores en orden de lista, luego acreedores en orden de lista', () => {
    const ids = ['a', 'b', 'c', 'd']
    const r = settle(ids, bal(ids, [-10, -20, 15, 15]))
    expect(r.payments.map((p) => `${p.from}>${p.to}`)).toEqual(['a>c', 'b>c', 'b>d'])
    expect(r.payments.map((p) => p.amount)).toEqual([10, 5, 15])
  })
  it('rechaza saldos que no suman 0 o no son enteros', () => {
    expect(() => settle(['a', 'b'], { a: 5, b: -4 })).toThrow()
    expect(() => settle(['a', 'b'], { a: 1.5, b: -1.5 })).toThrow()
  })
})

describe('caso 7: aplicar el plan', () => {
  it('deja todos los saldos en 0 y ningún pago es ≤ 0 (seed)', () => {
    const b = bal(NAMES, [-137500, -137500, -287500, 275000, -175000, 462500])
    const r = settle(NAMES, b)
    const after = applyPlan(b, r.payments)
    expect(Object.values(after).every((v) => v === 0)).toBe(true)
    expect(r.payments.every((p) => p.amount > 0)).toBe(true)
  })
})

describe('oráculo', () => {
  it('enumera los números de Bell: 1, 2, 5, 15, 52, 203', () => {
    // Un acreedor y (n − 1) deudores de 1 peso: n saldos ≠ 0 que suman 0.
    const sample = (n: number) => [n - 1, ...Array.from({ length: n - 1 }, () => -1)]
    const seen = [2, 3, 4, 5, 6].map((n) => oracleMinPayments(sample(n)).partitionsSeen)
    expect(seen).toEqual([2, 5, 15, 52, 203])
  })
})

describe('propiedad A: escenarios reales (gastos → split → saldos)', () => {
  it('5.000 corridas', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }).chain((n) => {
          const ids = NAMES.slice(0, n)
          return fc.tuple(
            fc.constant(ids),
            fc.array(
              fc.record({
                amount: fc.oneof(fc.integer({ min: 1, max: 1000 }), fc.integer({ min: 1, max: 5_000_000 })),
                paidBy: fc.constantFrom(...ids),
                participants: fc.subarray(ids, { minLength: 1 }),
              }),
              { minLength: 1, maxLength: 12 },
            ),
            fc.shuffledSubarray(ids, { minLength: n, maxLength: n }),
          )
        }),
        ([ids, list, perm]) => {
          const expenses: Expense[] = list.map((e, i) => ({ id: `e${i}`, description: 'x', ...e }))
          checkScenario(ids, computeBalances(ids, expenses), 'A', perm)
        },
      ),
      { numRuns: 5000 },
    )
    expect(stats.A.runs).toBe(5000)
  })
})

// Estructuras de grupos plantados: tamaños (≥ 2 personas) de 1 a 3 grupos de suma cero, ≤ 6 personas.
const SHAPES: number[][] = [[2], [3], [4], [5], [6], [2, 2], [2, 3], [3, 2], [2, 4], [4, 2], [3, 3], [2, 2, 2]]

describe('propiedad B: grupos de suma cero plantados', () => {
  it('5.000 corridas', () => {
    fc.assert(
      fc.property(
        fc
          .tuple(fc.constantFrom(...SHAPES), fc.constantFrom(3, 20, 1_000_000))
          .chain(([shape, range]) => {
            const n = shape.reduce((a, b) => a + b, 0)
            return fc.tuple(
              fc.tuple(...shape.map((size) => fc.array(fc.integer({ min: -range, max: range }), { minLength: size - 1, maxLength: size - 1 }))),
              fc.shuffledSubarray(NAMES.slice(0, n), { minLength: n, maxLength: n }),
              fc.shuffledSubarray(NAMES.slice(0, n), { minLength: n, maxLength: n }),
              fc.shuffledSubarray(Array.from({ length: n }, (_, i) => i), { minLength: n, maxLength: n }),
            )
          }),
        ([groups, ids, perm, order]) => {
          // Cada grupo: size − 1 valores al azar y el último = −suma → suma cero plantada.
          const flat: number[] = []
          for (const g of groups) {
            // `0 - suma` (no `-suma`): evita producir -0 cuando la suma es 0.
            flat.push(...g, 0 - g.reduce((a, b) => a + b, 0))
          }
          const values = order.map((i) => flat[i]) // reparte los saldos a personas al azar
          checkScenario(ids, bal(ids, values), 'B', perm)
        },
      ),
      { numRuns: 5000 },
    )
    expect(stats.B.runs).toBe(5000)
    // El generador debe producir de verdad G = 2 y G = 3 y casos donde el voraz pierde.
    expect(stats.B.G[2]).toBeGreaterThan(0)
    expect(stats.B.G[3]).toBeGreaterThan(0)
    expect(stats.B.greedyWorse).toBeGreaterThan(0)
  })
})

afterAll(() => {
  console.log('ESTADISTICAS_F2 ' + JSON.stringify(stats))
})
