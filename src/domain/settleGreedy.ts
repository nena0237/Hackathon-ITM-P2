// Método simple: el mayor deudor paga al mayor acreedor. NO siempre es mínimo.
// Existe SOLO para comparar con settle.ts (y mostrar el valor del algoritmo exacto).
import type { Payment } from './settle'

export function settleGreedy(ids: string[], balances: Record<string, number>): Payment[] {
  const debtors = ids.filter((id) => balances[id] < 0).map((id) => ({ id, left: -balances[id] }))
  const creditors = ids.filter((id) => balances[id] > 0).map((id) => ({ id, left: balances[id] }))
  const payments: Payment[] = []
  // Mayor monto primero; empates por orden de lista (sort estable).
  const pickMax = (xs: { id: string; left: number }[]) => {
    let best = -1
    for (let i = 0; i < xs.length; i++) {
      if (xs[i].left > 0 && (best === -1 || xs[i].left > xs[best].left)) best = i
    }
    return best
  }
  for (;;) {
    const d = pickMax(debtors)
    const c = pickMax(creditors)
    if (d === -1 || c === -1) break
    const amount = Math.min(debtors[d].left, creditors[c].left)
    payments.push({ from: debtors[d].id, to: creditors[c].id, amount })
    debtors[d].left -= amount
    creditors[c].left -= amount
  }
  return payments
}
