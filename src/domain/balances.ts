import { splitExpense } from './split'

export interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
  participants: string[]
}

/** Saldo neto = pagado − partes. Positivo: le deben. Negativo: debe. Suma siempre 0. */
export function computeBalances(memberIds: string[], expenses: Expense[]): Record<string, number> {
  const bal: Record<string, number> = {}
  for (const id of memberIds) bal[id] = 0
  for (const e of expenses) {
    if (!(e.paidBy in bal)) throw new Error('pagador fuera del grupo')
    bal[e.paidBy] += e.amount
    const parts = splitExpense(e.amount, e.participants, memberIds)
    for (const id of Object.keys(parts)) bal[id] -= parts[id]
  }
  return bal
}
