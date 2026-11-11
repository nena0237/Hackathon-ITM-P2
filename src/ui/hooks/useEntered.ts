import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Devuelve false en el primer fotograma y true después, para disparar transiciones CSS de entrada.
 * Si animate es false o hay reduced motion, devuelve true desde el inicio (estado final, sin movimiento).
 */
export function useEntered(animate: boolean): boolean {
  const reduced = useReducedMotion()
  const skip = !animate || reduced
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (skip) return
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setOn(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [skip])

  return skip || on
}

