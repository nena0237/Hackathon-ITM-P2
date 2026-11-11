import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from './Button'

/**
 * Diálogo de confirmación destructiva sobre <dialog> nativo (showModal): el foco queda atrapado,
 * Esc cierra (llama onCancel) y al cerrar el foco vuelve a quien lo abrió.
 * El foco inicial va al botón de cancelar, la opción segura.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      onKeyDown={(e) => {
        // <dialog> modal deja salir el foco hacia la interfaz del navegador: se cierra el ciclo a mano.
        if (e.key !== 'Tab') return
        const items = ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        if (!items || items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        const current = document.activeElement
        if (e.shiftKey && current === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && current === last) {
          e.preventDefault()
          first.focus()
        }
      }}
      className="m-auto w-[calc(100%-32px)] max-w-[480px] border-2 border-ink bg-surface p-5 text-ink md:p-8"
    >
      <h2 id="confirm-title" className="text-[24px] font-bold leading-[1.1] tracking-[-0.02em]">
        {title}
      </h2>
      <div className="mt-3 text-[16px]">{children}</div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onCancel} autoFocus>
          {cancelLabel}
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
