// Plan de pagos MÍNIMO EXACTO. Mínimo absoluto = n − G (ver CONTEXT.md, "Fundamento del algoritmo").
// n = personas con saldo ≠ 0; G = máximo número de grupos disjuntos de suma cero.
// G se calcula con DP sobre subconjuntos (bitmask): con ≤ 6 personas hay ≤ 64 máscaras.

export interface Payment {
  from: string
  to: string
  amount: number
}

export interface SettleResult {
  payments: Payment[]
  /** Grupos de suma cero (ids), cada grupo y la lista de grupos en el orden de la lista del grupo. */
  groups: string[][]
  /** Personas con saldo ≠ 0. */
  n: number
  /** Máximo número de grupos de suma cero. */
  G: number
}

const MAX_PEOPLE = 20

export function settle(ids: string[], balances: Record<string, number>): SettleResult {
  let total = 0
  for (const id of ids) {
    const b = balances[id]
    if (!Number.isInteger(b)) throw new Error(`saldo no entero para ${id}`)
    total += b
  }
  if (total !== 0) throw new Error('la suma de saldos debe ser 0')

  const people = ids.filter((id) => balances[id] !== 0) // orden de la lista del grupo
  const n = people.length
  if (n === 0) return { payments: [], groups: [], n: 0, G: 0 }
  if (n > MAX_PEOPLE) throw new Error('demasiadas personas')

  const bal = people.map((id) => balances[id])
  const size = 1 << n
  const full = size - 1

  // sum[mask]: suma de saldos del subconjunto.
  const sum = new Array<number>(size).fill(0)
  for (let mask = 1; mask < size; mask++) {
    const low = mask & -mask
    sum[mask] = sum[mask ^ low] + bal[31 - Math.clz32(low)]
  }

  // f[mask]: máximo de grupos de suma cero que parten `mask` (solo definido si sum[mask] = 0).
  // choice[mask]: grupo (contiene el primer bit) elegido en el óptimo.
  const f = new Array<number>(size).fill(-1)
  const choice = new Array<number>(size).fill(0)
  f[0] = 0
  for (let mask = 1; mask < size; mask++) {
    if (sum[mask] !== 0) continue
    const low = mask & -mask
    const rest = mask ^ low
    let sub = rest
    for (;;) {
      const s = low | sub
      if (sum[s] === 0) {
        const cand = 1 + f[mask ^ s]
        if (cand > f[mask]) {
          f[mask] = cand
          choice[mask] = s
        }
      }
      if (sub === 0) break
      sub = (sub - 1) & rest
    }
  }

  const G = f[full]
  if (G < 1) throw new Error('invariante: el conjunto completo suma 0')

  // Reconstrucción de grupos.
  const groupMasks: number[] = []
  for (let m = full; m !== 0; m ^= choice[m]) groupMasks.push(choice[m])
  const memberIdx = (mask: number): number[] => {
    const out: number[] = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) out.push(i)
    return out
  }
  const groupIdx = groupMasks.map(memberIdx).sort((a, b) => a[0] - b[0])

  // Cada grupo: deudores en orden de lista pagan a acreedores en orden de lista.
  const payments: Payment[] = []
  for (const g of groupIdx) {
    const debtors = g.filter((i) => bal[i] < 0).map((i) => ({ i, left: -bal[i] }))
    const creditors = g.filter((i) => bal[i] > 0).map((i) => ({ i, left: bal[i] }))
    let c = 0
    for (const d of debtors) {
      while (d.left > 0) {
        const cr = creditors[c]
        const amount = Math.min(d.left, cr.left)
        payments.push({ from: people[d.i], to: people[cr.i], amount })
        d.left -= amount
        cr.left -= amount
        if (cr.left === 0) c++
      }
    }
  }

  const order = (id: string) => ids.indexOf(id)
  payments.sort((a, b) => order(a.from) - order(b.from) || order(a.to) - order(b.to))

  // Aserción interna: nº de pagos = n − G.
  if (payments.length !== n - G) {
    throw new Error(`invariante rota: ${payments.length} pagos, se esperaban n − G = ${n - G}`)
  }

  return {
    payments,
    groups: groupIdx.map((g) => g.map((i) => people[i])),
    n,
    G,
  }
}

/** Aplica el plan a los saldos y devuelve los saldos resultantes (deben quedar todos en 0). */
export function applyPlan(balances: Record<string, number>, payments: Payment[]): Record<string, number> {
  const out = { ...balances }
  for (const p of payments) {
    out[p.from] += p.amount
    out[p.to] -= p.amount
  }
  return out
}
