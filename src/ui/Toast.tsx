import { useEffect, useRef, useState } from 'react'
import { useEntered } from './hooks'
import { EASE } from './motion'

/**
 * Aviso breve con acción "Deshacer". La región aria-live="polite" está siempre montada
 * para que los lectores de pantalla anuncien el mensaje al aparecer.
 * message: null oculta el aviso. Se cierra solo tras durationMs (se pausa con hover o foco dentro).
 */
export function Toast({
  message,
  actionLabel = 'Deshacer',
  onAction,
  onDismiss,
  durationMs = 8000,
}: {
  message: string | null
  actionLabel?: string
  onAction?: () => void
  onDismiss: () => void
  durationMs?: number
}) {
  const [paused, setPaused] = useState(false)
  const dismiss = useRef(onDismiss)
  dismiss.current = onDismiss

  useEffect(() => {
    if (message === null || paused) return
    const t = setTimeout(() => dismiss.current(), durationMs)
    return () => clearTimeout(t)
  }, [message, paused, durationMs])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4"
    >
      {message !== null ? (
        <ToastBody
          key={message}
          message={message}
          actionLabel={actionLabel}
          onAction={onAction}
          onDismiss={onDismiss}
          setPaused={setPaused}
        />
      ) : null}
    </div>
  )
}

function ToastBody({
  message,
  actionLabel,
  onAction,
  onDismiss,
  setPaused,
}: {
  message: string
  actionLabel: string
  onAction?: () => void
  onDismiss: () => void
  setPaused: (p: boolean) => void
}) {
  const entered = useEntered(true)
  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex w-full max-w-[560px] flex-wrap items-center justify-between gap-x-4 gap-y-2 border-2 border-ink bg-surface py-1 pl-4 pr-1"
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity 200ms ${EASE}, transform 200ms ${EASE}`,
      }}
    >
      <span className="py-2 text-[16px]">
        <span className="inline-block bg-lime px-1 font-bold">Hecho</span> {message}
      </span>
      <span className="flex">
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="press min-h-[44px] min-w-[44px] px-4 text-[16px] font-bold underline underline-offset-4"
          >
            {actionLabel}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          className="press min-h-[44px] min-w-[44px] px-4 text-[16px] font-bold"
        >
          Cerrar
        </button>
      </span>
    </div>
  )
}
