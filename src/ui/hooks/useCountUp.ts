import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/** Ease-out fuerte (cuártica), equivalente en espíritu a cubic-bezier(0.23, 1, 0.32, 1). */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)

/**
 * Cuenta de 0 a target en durationMs (700 por defecto) con requestAnimationFrame.
 * Si enabled es false o hay reduced motion, devuelve target directo.
 * Interrumpible: si target cambia (durante la cuenta o después), salta al nuevo valor sin animar ni encolar.
 */
export function useCountUp(
  target: number,
  opts: { durationMs?: number; enabled?: boolean } = {},
): number {
  const { durationMs = 700, enabled = true } = opts
  const reduced = useReducedMotion()
  const animatable = enabled && !reduced
  const [value, setValue] = useState(animatable ? 0 : target)
  const [jumped, setJumped] = useState(false)
  const played = useRef(false)
  const started = useRef(false)
  const lastTarget = useRef(target)

  useEffect(() => {
    const changed = lastTarget.current !== target
    lastTarget.current = target
    if (!animatable || played.current || (started.current && changed)) {
      played.current = true
      setJumped(true)
      setValue(target)
      return
    }
    started.current = true
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      setValue(t >= 1 ? target : Math.round(target * easeOut(t)))
      if (t >= 1) played.current = true
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, animatable, durationMs])

  // Tras la primera cuenta (o una interrupción) se devuelve el objetivo sin esperar un fotograma.
  return !animatable || jumped ? target : value
}
