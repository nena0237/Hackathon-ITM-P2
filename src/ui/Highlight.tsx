import { useEffect, useState, type ReactNode } from 'react'
import { useReducedMotion } from './hooks'
import { EASE, HIGHLIGHT_MS } from './motion'

/**
 * Marcador lima detrás del texto. scaleX de 0 a 1, origen izquierdo, 420 ms.
 * instant: sin animación, ya completo (estado final).
 */
export function Highlight({
  children,
  active = true,
  delayMs = 0,
  instant = false,
}: {
  children: ReactNode
  active?: boolean
  delayMs?: number
  instant?: boolean
}) {
  const reduced = useReducedMotion()
  const skip = instant || reduced
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (skip) return
    if (!active) {
      setOn(false)
      return
    }
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setOn(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [active, skip])

  const shown = skip ? active : on

  return (
    <span className="relative inline-block px-1">
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-lime"
        style={{
          transform: shown ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left center',
          transition: skip ? 'none' : `transform ${HIGHLIGHT_MS}ms ${EASE} ${delayMs}ms`,
        }}
      />
      <span className="relative">{children}</span>
    </span>
  )
}

