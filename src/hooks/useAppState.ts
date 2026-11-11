import { useEffect, useMemo, useState } from 'react'
import type { AppState } from '../data/seed'
import { loadState, saveState } from '../storage/storage'
import {
  balancesView,
  finalBalancesView,
  groupView,
  maxAbs,
  planView,
  verificationView,
} from './viewModels'

/** Estado de la app (grupo y gastos) cargado de localStorage y guardado en cada cambio. */
export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState())
  useEffect(() => saveState(state), [state])
  return [state, setState] as const
}

export function useGroup(state: AppState) {
  return useMemo(() => groupView(state), [state])
}

export function useBalances(state: AppState) {
  return useMemo(() => {
    const rows = balancesView(state)
    return { rows, maxAbs: maxAbs(rows) }
  }, [state])
}

export function usePlan(state: AppState) {
  return useMemo(() => planView(state), [state])
}

export function useFinalBalances(state: AppState) {
  return useMemo(() => finalBalancesView(state), [state])
}

export function useVerification(state: AppState) {
  return useMemo(() => verificationView(state), [state])
}
