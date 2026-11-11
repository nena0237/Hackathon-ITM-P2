import type { ReactNode } from 'react'

/** Título de sección con línea de 2 px tinta arriba. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-10 border-t-2 border-ink pt-4 pb-4 text-[24px] font-bold tracking-[-0.02em] leading-[1.1]">
      {children}
    </h2>
  )
}

