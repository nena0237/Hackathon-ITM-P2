import { useEffect, useState, type RefObject } from 'react'

/** true cuando el elemento entra al viewport (IntersectionObserver). Con once, no vuelve a false. */
export function useInView(ref: RefObject<Element | null>, opts: { once?: boolean } = {}): boolean {
  const { once = true } = opts
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true)
            if (once) io.disconnect()
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, once])

  return inView
}

