import { useRef, type KeyboardEvent, type ReactNode } from 'react'

/**
 * Estructura de la app: barra sticky con título y pestañas (role tablist), contenedor de 1120 px.
 * Pestañas: botones reales, una sola línea; en móvil la barra se desplaza horizontalmente.
 * Las flechas izquierda y derecha, Inicio y Fin mueven el foco entre pestañas.
 */
export function AppShell({
  title,
  subtitle,
  tabs,
  active,
  onChange,
  children,
}: {
  title: string
  subtitle?: string
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
  children: ReactNode
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === active)
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next < 0) return
    e.preventDefault()
    const id = tabs[next].id
    onChange(id)
    refs.current[id]?.focus()
  }

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="sticky top-0 z-10 border-b border-ink bg-bg">
        <div className="mx-auto flex max-w-[1120px] flex-col px-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-10">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pt-3 md:min-w-0 md:flex-nowrap md:py-2">
            <h1 className="shrink-0 whitespace-nowrap text-[19px] font-bold leading-[1.1] tracking-[-0.02em]">{title}</h1>
            {subtitle ? <span className="text-[14px] text-muted md:truncate">{subtitle}</span> : null}
          </div>
          <div
            role="tablist"
            aria-label={title}
            onKeyDown={onKeyDown}
            className="tabs-scroll -mx-4 flex px-4 md:mx-0 md:px-0"
          >
            {tabs.map((t) => {
              const selected = t.id === active
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    refs.current[t.id] = el
                  }}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={selected ? 0 : -1}
                  type="button"
                  onClick={() => onChange(t.id)}
                  className={`inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap border-b-4 px-4 text-[16px] font-bold ${
                    selected ? 'border-ink bg-lime' : 'border-transparent hover:bg-surface'
                  }`}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>
      <main
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="mx-auto max-w-[1120px] px-4 pb-16 pt-6 md:px-10 md:pt-10"
      >
        {children}
      </main>
    </div>
  )
}

