// Análisis del plan para el panel de Verificación. Puro: solo junta settle.ts, settleGreedy.ts y oraculo.ts.
import { oracleMinPayments } from './oraculo'
import { applyPlan, settle } from './settle'
import { settleGreedy } from './settleGreedy'

/** El oráculo enumera particiones (Bell(n)); con más de esto sería lento. El grupo admite 6. */
export const ORACLE_MAX_PEOPLE = 8

export interface GroupDetail {
  members: string[] // ids, en el orden del grupo
  payments: number // pagos dentro del grupo (= tamaño − 1)
}

export interface PlanAnalysis {
  /** Personas con saldo distinto de cero. */
  n: number
  /** Máximo de grupos disjuntos de suma cero. */
  G: number
  groups: GroupDetail[]
  /** Pagos del algoritmo exacto. */
  exact: number
  /** Pagos del método simple (mayor deudor al mayor acreedor). */
  greedy: number
  /** exact === n − G. */
  formulaHolds: boolean
  /** Saldos de cada persona tras aplicar el plan exacto. */
  finalBalances: Record<string, number>
  allZero: boolean
}

export interface OracleComparison {
  exacto: number
  oraculo: number
  voraz: number
  /** exacto === oraculo. */
  coinciden: boolean
  /** Particiones que enumeró el oráculo. */
  particiones: number
}

export function analyzePlan(ids: string[], balances: Record<string, number>): PlanAnalysis {
  const r = settle(ids, balances)
  const greedy = settleGreedy(ids, balances).length
  const groups = r.groups.map((g) => ({
    members: g,
    payments: r.payments.filter((p) => g.includes(p.from)).length,
  }))
  const finalBalances = applyPlan(balances, r.payments)
  return {
    n: r.n,
    G: r.G,
    groups,
    exact: r.payments.length,
    greedy,
    formulaHolds: r.payments.length === r.n - r.G,
    finalBalances,
    allZero: ids.every((id) => finalBalances[id] === 0),
  }
}

/** Calcula el mínimo con el oráculo independiente (otro método) y lo compara con el exacto y el voraz. */
export function compareWithOracle(ids: string[], balances: Record<string, number>): OracleComparison {
  const exacto = settle(ids, balances).payments.length
  const voraz = settleGreedy(ids, balances).length
  const people = ids.filter((id) => balances[id] !== 0)
  if (people.length > ORACLE_MAX_PEOPLE) throw new Error('demasiadas personas para el oráculo')
  const o = oracleMinPayments(people.map((id) => balances[id]))
  return { exacto, oraculo: o.minPayments, voraz, coinciden: exacto === o.minPayments, particiones: o.partitionsSeen }
}
