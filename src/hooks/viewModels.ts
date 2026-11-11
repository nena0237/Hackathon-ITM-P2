// View-models PUROS: derivan lo que muestra la UI a partir del estado guardado.
// Toda la lógica de dinero vive en src/domain; aquí solo se junta y se ponen nombres.
import type { AppState } from '../data/seed'
import { analyzePlan, compareWithOracle, type OracleComparison } from '../domain/analysis'
import { computeBalances } from '../domain/balances'
import { applyPlan, settle, type Payment } from '../domain/settle'
import { settleGreedy } from '../domain/settleGreedy'

export interface ExpenseView {
  id: string
  description: string
  amount: number
  paidByName: string
  participantNames: string[] // en el orden de la lista del grupo
}

export interface GroupView {
  memberNames: string[]
  expenses: ExpenseView[]
  total: number
}

export interface BalanceView {
  id: string
  name: string
  balance: number
}

export interface PaymentView extends Payment {
  fromName: string
  toName: string
}

export interface PlanView {
  payments: PaymentView[]
  n: number
  G: number
  groups: string[][] // nombres
  /** Pagos que necesitaría el método simple (voraz). */
  simple: number
  allSettled: boolean
}

const nameOf = (state: AppState) => {
  const map = new Map(state.members.map((m) => [m.id, m.name]))
  return (id: string) => map.get(id) ?? id
}

const memberIds = (s: AppState) => s.members.map((m) => m.id)

export function groupView(state: AppState): GroupView {
  const name = nameOf(state)
  return {
    memberNames: state.members.map((m) => m.name),
    expenses: state.expenses.map((e) => ({
      id: e.id,
      description: e.description,
      amount: e.amount,
      paidByName: name(e.paidBy),
      participantNames: state.members.filter((m) => e.participants.includes(m.id)).map((m) => m.name),
    })),
    total: state.expenses.reduce((s, e) => s + e.amount, 0),
  }
}

export function balancesView(state: AppState): BalanceView[] {
  const bal = computeBalances(memberIds(state), state.expenses)
  return state.members.map((m) => ({ id: m.id, name: m.name, balance: bal[m.id] }))
}

/** Escala común de las barras: el mayor valor absoluto (mínimo 1 para no dividir por 0). */
export function maxAbs(rows: { balance: number }[]): number {
  return Math.max(1, ...rows.map((r) => Math.abs(r.balance)))
}

export function planView(state: AppState): PlanView {
  const ids = memberIds(state)
  const name = nameOf(state)
  const bal = computeBalances(ids, state.expenses)
  const r = settle(ids, bal)
  return {
    payments: r.payments.map((p) => ({ ...p, fromName: name(p.from), toName: name(p.to) })),
    n: r.n,
    G: r.G,
    groups: r.groups.map((g) => g.map(name)),
    simple: settleGreedy(ids, bal).length,
    allSettled: r.payments.length === 0,
  }
}

/** Saldos de cada persona tras aplicar el plan. Deben ser 0 para todos. */
export function finalBalancesView(state: AppState): BalanceView[] {
  const ids = memberIds(state)
  const bal = computeBalances(ids, state.expenses)
  const after = applyPlan(bal, settle(ids, bal).payments)
  return state.members.map((m) => ({ id: m.id, name: m.name, balance: after[m.id] }))
}

export interface VerificationView {
  n: number
  G: number
  groups: { members: string[]; payments: number }[] // nombres
  exact: number
  greedy: number
  /** pagos = n − G */
  formulaHolds: boolean
  /** Saldos de cada persona tras el plan; deben ser 0. */
  finals: BalanceView[]
  allZero: boolean
  /** Mínimo calculado con el oráculo independiente, comparado con el exacto. */
  oracle: OracleComparison
}

/** Todo lo que necesita el panel de Verificación, calculado sobre los datos actuales. */
export function verificationView(state: AppState): VerificationView {
  const ids = memberIds(state)
  const name = nameOf(state)
  const bal = computeBalances(ids, state.expenses)
  const a = analyzePlan(ids, bal)
  return {
    n: a.n,
    G: a.G,
    groups: a.groups.map((g) => ({ members: g.members.map(name), payments: g.payments })),
    exact: a.exact,
    greedy: a.greedy,
    formulaHolds: a.formulaHolds,
    finals: state.members.map((m) => ({ id: m.id, name: m.name, balance: a.finalBalances[m.id] })),
    allZero: a.allZero,
    oracle: compareWithOracle(ids, bal),
  }
}
